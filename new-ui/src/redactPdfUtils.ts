/** One redaction rectangle in PDF user space (origin bottom-left, units = points). */
export interface RedactRegion {
  pageNum: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Convert a screen/canvas rectangle (top-left origin) to PDF coordinates. */
export function canvasRectToPdf(
  rect: CanvasRect,
  pageHeightPt: number,
  scale: number,
): Pick<RedactRegion, 'x' | 'y' | 'w' | 'h'> {
  const w = rect.w / scale;
  const h = rect.h / scale;
  const x = rect.x / scale;
  const y = pageHeightPt - (rect.y + rect.h) / scale;
  return { x, y, w, h };
}

/** Map PDF rect back to canvas coords for overlay drawing. */
export function pdfRectToCanvas(
  region: Pick<RedactRegion, 'x' | 'y' | 'w' | 'h'>,
  pageHeightPt: number,
  scale: number,
): CanvasRect {
  const w = region.w * scale;
  const h = region.h * scale;
  const x = region.x * scale;
  const y = pageHeightPt * scale - (region.y + region.h) * scale;
  return { x, y, w, h };
}

export function defaultRedactedFilename(originalName: string): string {
  const base = originalName.replace(/\.pdf$/i, '') || 'document';
  return `bolt_${base}_redacted.pdf`;
}
