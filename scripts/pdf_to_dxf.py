#!/usr/bin/env python3
"""
Convert PDF vector content to DXF R2010 (AC1024).

Pipeline:
  1. Ghostscript normalizes the PDF (vector-focused intermediate).
  2. PyMuPDF extracts paths, optional layers, and text.
  3. ezdxf writes LINE / LWPOLYLINE / HATCH / TEXT entities.
"""

from __future__ import annotations

import argparse
import math
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable, Sequence

# PDF user space is points (1/72 inch); DXF output is millimeters.
PDF_POINT_TO_MM = 25.4 / 72.0
# Douglas–Peucker tolerance in mm (reduces Bézier oversampling).
SIMPLIFY_EPSILON_MM = 0.12
BEZIER_STEPS = 8


def run_ghostscript(gs_cmd: str, input_pdf: Path, output_pdf: Path) -> None:
    cmd = [
        gs_cmd,
        "-dNOPAUSE",
        "-dBATCH",
        "-dSAFER",
        "-sDEVICE=pdfwrite",
        "-dPDFSETTINGS=/prepress",
        "-dCompatibilityLevel=1.7",
        "-dDetectDuplicateImages=false",
        f"-sOutputFile={output_pdf}",
        str(input_pdf),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "no output").strip()
        raise RuntimeError(f"Ghostscript failed: {detail[:500]}")


def _point_xy(point) -> tuple[float, float]:
    return float(point.x), float(point.y)


def _flip_y(page_height: float, x: float, y: float) -> tuple[float, float]:
    return x, page_height - y


def _to_mm(page_height: float, x: float, y: float) -> tuple[float, float]:
    px, py = _flip_y(page_height, x, y)
    return px * PDF_POINT_TO_MM, py * PDF_POINT_TO_MM


def _scale_mm(value: float) -> float:
    return value * PDF_POINT_TO_MM


def _points_close(a: tuple[float, float], b: tuple[float, float], tol: float = 1e-6) -> bool:
    return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol


def _append_point(points: list[tuple[float, float]], point: tuple[float, float]) -> None:
    if not points or not _points_close(points[-1], point):
        points.append(point)


def _perpendicular_distance(point: tuple[float, float], start: tuple[float, float], end: tuple[float, float]) -> float:
    x0, y0 = point
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0.0 and dy == 0.0:
        return math.hypot(x0 - x1, y0 - y1)
    num = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1)
    den = math.hypot(dx, dy)
    return num / den


def _douglas_peucker(points: Sequence[tuple[float, float]], epsilon: float) -> list[tuple[float, float]]:
    if len(points) <= 2:
        return list(points)
    start = points[0]
    end = points[-1]
    index = 0
    max_dist = 0.0
    for i in range(1, len(points) - 1):
        dist = _perpendicular_distance(points[i], start, end)
        if dist > max_dist:
            max_dist = dist
            index = i
    if max_dist > epsilon:
        left = _douglas_peucker(points[: index + 1], epsilon)
        right = _douglas_peucker(points[index:], epsilon)
        return left[:-1] + right
    return [start, end]


def _simplify_path(points: Sequence[tuple[float, float]], closed: bool) -> list[tuple[float, float]]:
    if len(points) <= 2:
        return list(points)
    working = list(points)
    if closed and not _points_close(working[0], working[-1]):
        working.append(working[0])
    simplified = _douglas_peucker(working, SIMPLIFY_EPSILON_MM)
    if closed and len(simplified) >= 2 and _points_close(simplified[0], simplified[-1]):
        simplified = simplified[:-1]
    return simplified


def _sample_cubic(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    steps: int = BEZIER_STEPS,
) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for i in range(steps + 1):
        t = i / steps
        u = 1.0 - t
        x = (
            (u**3) * p0[0]
            + 3 * (u**2) * t * p1[0]
            + 3 * u * (t**2) * p2[0]
            + (t**3) * p3[0]
        )
        y = (
            (u**3) * p0[1]
            + 3 * (u**2) * t * p1[1]
            + 3 * u * (t**2) * p2[1]
            + (t**3) * p3[1]
        )
        points.append((x, y))
    return points


def _ensure_layer(doc, name: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in "_-" else "_" for ch in name)[:255] or "Layer0"
    if safe not in doc.layers:
        doc.layers.new(name=safe)
    return safe


def _register_ocg_layers(doc, ocg_names: dict, page) -> None:
    if not hasattr(page, "get_ocgs"):
        return
    for xref, info in (page.get_ocgs() or {}).items():
        name = str((info or {}).get("name") or f"OCG_{xref}")
        layer = _ensure_layer(doc, name)
        try:
            ocg_names[int(xref)] = layer
        except (TypeError, ValueError):
            pass
        ocg_names[str(xref)] = layer
        ocg_names[name] = layer


def _resolve_drawing_layer(doc, ocg_names: dict, drawing: dict, page_layer: str) -> str:
    raw = drawing.get("layer")
    if raw is None:
        raw = drawing.get("oc")
    if raw is None:
        return page_layer
    if isinstance(raw, int):
        return ocg_names.get(raw, page_layer)
    if isinstance(raw, str):
        if raw in ocg_names:
            return ocg_names[raw]
        if raw.isdigit():
            return ocg_names.get(int(raw), page_layer)
        return _ensure_layer(doc, raw)
    try:
        return ocg_names.get(int(raw), page_layer)
    except (TypeError, ValueError):
        return _ensure_layer(doc, str(raw))


def _add_polyline(msp, points: Sequence[tuple[float, float]], layer: str, closed: bool = False) -> None:
    simplified = _simplify_path(points, closed=closed)
    if len(simplified) < 2:
        return
    msp.add_lwpolyline(simplified, dxfattribs={"layer": layer}, close=closed)


def _add_solid_hatch(msp, points: Sequence[tuple[float, float]], layer: str) -> None:
    if len(points) < 3:
        return
    boundary = _simplify_path(points, closed=True)
    if len(boundary) < 3:
        return
    closed_path = list(boundary)
    if not _points_close(closed_path[0], closed_path[-1]):
        closed_path.append(closed_path[0])
    try:
        hatch = msp.add_hatch(dxfattribs={"layer": layer})
        hatch.set_solid_fill(color=7)
        hatch.paths.add_polyline_path(closed_path, is_closed=True)
    except Exception:
        _add_polyline(msp, boundary, layer, closed=True)


def _collect_path_points(items: Sequence, page_height: float) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for item in items:
        op = item[0]
        if op == "l":
            p1 = _to_mm(page_height, *_point_xy(item[1]))
            p2 = _to_mm(page_height, *_point_xy(item[2]))
            _append_point(points, p1)
            _append_point(points, p2)
        elif op == "re":
            rect = item[1]
            corners = [
                _to_mm(page_height, float(rect.x0), float(rect.y0)),
                _to_mm(page_height, float(rect.x1), float(rect.y0)),
                _to_mm(page_height, float(rect.x1), float(rect.y1)),
                _to_mm(page_height, float(rect.x0), float(rect.y1)),
            ]
            for corner in corners:
                _append_point(points, corner)
            _append_point(points, corners[0])
        elif op == "qu":
            quad = item[1]
            corners = [
                _to_mm(page_height, float(quad.ul.x), float(quad.ul.y)),
                _to_mm(page_height, float(quad.ur.x), float(quad.ur.y)),
                _to_mm(page_height, float(quad.lr.x), float(quad.lr.y)),
                _to_mm(page_height, float(quad.ll.x), float(quad.ll.y)),
            ]
            for corner in corners:
                _append_point(points, corner)
            _append_point(points, corners[0])
        elif op == "c":
            p0 = _point_xy(item[1])
            p1 = _point_xy(item[2])
            p2 = _point_xy(item[3])
            p3 = _point_xy(item[4])
            sampled = _sample_cubic(p0, p1, p2, p3)
            for x, y in sampled:
                _append_point(points, _to_mm(page_height, x, y))
    return points


def _path_is_closed(points: Sequence[tuple[float, float]], close_path: bool) -> bool:
    if close_path:
        return True
    return len(points) >= 3 and _points_close(points[0], points[-1], tol=0.05)


def _add_drawing_items(msp, drawing: dict, page_height: float, layer: str) -> None:
    items = drawing.get("items") or []
    if not items:
        return

    close_path = bool(drawing.get("closePath"))
    has_fill = drawing.get("fill") is not None
    has_stroke = drawing.get("color") is not None

    path_points = _collect_path_points(items, page_height)
    if len(path_points) < 2:
        return

    closed = _path_is_closed(path_points, close_path)

    if has_fill and len(path_points) >= 3:
        _add_solid_hatch(msp, path_points, layer)
    elif has_stroke or len(path_points) >= 2:
        _add_polyline(msp, path_points, layer, closed=closed)


def _add_page_text(msp, page, page_height: float, layer: str) -> None:
    blocks = page.get_text("dict").get("blocks") or []
    for block in blocks:
        if block.get("type") != 0:
            continue
        for line in block.get("lines") or []:
            for span in line.get("spans") or []:
                text = (span.get("text") or "").strip()
                if not text:
                    continue
                origin = span.get("origin") or (0, 0)
                x, y = _to_mm(page_height, float(origin[0]), float(origin[1]))
                height = max(_scale_mm(float(span.get("size") or 12.0)), 0.35)
                msp.add_text(
                    text,
                    dxfattribs={
                        "layer": layer,
                        "height": height,
                        "insert": (x, y),
                    },
                )


def _convert_page_to_dxf(
    page,
    page_index: int,
    output_path: Path,
    ocg_names: dict | None = None,
) -> None:
    import ezdxf

    page_height = float(page.rect.height)
    doc = ezdxf.new("R2010", setup=True)
    doc.header["$INSUNITS"] = 4  # millimeters
    msp = doc.modelspace()
    page_ocg: dict = dict(ocg_names or {})
    _register_ocg_layers(doc, page_ocg, page)
    default_layer = _ensure_layer(doc, f"PAGE_{page_index + 1}")

    drawings = page.get_drawings() if hasattr(page, "get_drawings") else []
    for drawing in drawings:
        layer = _resolve_drawing_layer(doc, page_ocg, drawing, default_layer)
        _add_drawing_items(msp, drawing, page_height, layer)

    _add_page_text(msp, page, page_height, default_layer)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(output_path)


def convert_pdf_to_dxf_pages(
    input_pdf: Path,
    output_dir: Path,
    gs_cmd: str = "gs",
    pdf_password: str | None = None,
) -> int:
    import fitz

    output_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="pdfbolt-dxf-") as tmp:
        normalized = Path(tmp) / "normalized.pdf"
        run_ghostscript(gs_cmd, input_pdf, normalized)
        source = normalized if normalized.is_file() and normalized.stat().st_size > 64 else input_pdf

        if pdf_password:
            pdf = fitz.open(source, password=pdf_password)
        else:
            pdf = fitz.open(source)
        try:
            page_count = len(pdf)
            if page_count == 0:
                raise RuntimeError("PDF has no pages.")

            for page_index in range(page_count):
                page = pdf[page_index]
                output_path = output_dir / f"page_{page_index + 1:03d}.dxf"
                _convert_page_to_dxf(page, page_index, output_path)
        finally:
            pdf.close()

    written = sorted(output_dir.glob("page_*.dxf"))
    if not written:
        raise RuntimeError("No DXF files were created.")
    return len(written)


def convert_pdf_to_dxf(
    input_pdf: Path,
    output_dxf: Path,
    gs_cmd: str = "gs",
    pdf_password: str | None = None,
) -> None:
    """Single-page helper — writes one DXF file (page 1 only)."""
    import fitz

    with tempfile.TemporaryDirectory(prefix="pdfbolt-dxf-") as tmp:
        normalized = Path(tmp) / "normalized.pdf"
        run_ghostscript(gs_cmd, input_pdf, normalized)
        source = normalized if normalized.is_file() and normalized.stat().st_size > 64 else input_pdf

        if pdf_password:
            pdf = fitz.open(source, password=pdf_password)
        else:
            pdf = fitz.open(source)
        try:
            if len(pdf) == 0:
                raise RuntimeError("PDF has no pages.")
            _convert_page_to_dxf(pdf[0], 0, output_dxf)
        finally:
            pdf.close()


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Convert PDF to DXF R2010 (one file per page)")
    parser.add_argument("input_pdf", type=Path)
    parser.add_argument(
        "output_dir",
        type=Path,
        help="Directory for page_001.dxf, page_002.dxf, …",
    )
    parser.add_argument("--ghostscript", default="gs", help="Ghostscript command (default: gs)")
    parser.add_argument("--password", default="", help="PDF open password, if required")
    args = parser.parse_args(list(argv) if argv is not None else None)

    if not args.input_pdf.is_file():
        print(f"Input PDF not found: {args.input_pdf}", file=sys.stderr)
        return 2

    try:
        count = convert_pdf_to_dxf_pages(
            args.input_pdf,
            args.output_dir,
            gs_cmd=args.ghostscript,
            pdf_password=args.password or None,
        )
        print(f"Wrote {count} DXF file(s) to {args.output_dir}", file=sys.stdout)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if not any(args.output_dir.glob("page_*.dxf")):
        print("DXF output was not created.", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
