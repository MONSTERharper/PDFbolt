/** Signature box in PDF user space (origin bottom-left, units = points). */
export interface SignaturePlacement {
  pageNum: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SignatureSpot {
  label: string;
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

const INK_ALPHA_THRESHOLD = 8;

const DEFAULT_MARGIN_PT = 36;

/** Suggested signature locations on one page (PDF points). */
export function signatureSpotsForPage(pageWidth: number, pageHeight: number): SignatureSpot[] {
  const w = Math.min(180, Math.max(120, pageWidth * 0.35));
  const h = Math.min(60, Math.max(40, pageHeight * 0.08));
  const margin = DEFAULT_MARGIN_PT;
  return [
    { label: 'Bottom right', x: pageWidth - w - margin, y: margin, w, h },
    { label: 'Bottom left', x: margin, y: margin, w, h },
    { label: 'Bottom center', x: (pageWidth - w) / 2, y: margin, w, h },
  ];
}

/** Default placement: bottom-right on the given page. */
export function defaultSignaturePlacement(
  pageWidth: number,
  pageHeight: number,
  pageNum: number,
): SignaturePlacement {
  const { x, y, w, h } = signatureSpotsForPage(pageWidth, pageHeight)[0];
  return { pageNum, x, y, w, h };
}

/** True when the canvas has non-transparent ink (ignores CSS-only background). */
export function canvasHasInk(canvas: HTMLCanvasElement | null): boolean {
  if (!canvas) {
    return false;
  }
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || canvas.width <= 0 || canvas.height <= 0) {
      return false;
    }
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 8) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/** True when two placements refer to the same spot (within tolerance). */
export function placementsNear(
  a: Pick<SignaturePlacement, 'x' | 'y' | 'w' | 'h'>,
  b: Pick<SignaturePlacement, 'x' | 'y' | 'w' | 'h'>,
  tolerance = 2,
): boolean {
  return (
    Math.abs(a.x - b.x) <= tolerance &&
    Math.abs(a.y - b.y) <= tolerance &&
    Math.abs(a.w - b.w) <= tolerance &&
    Math.abs(a.h - b.h) <= tolerance
  );
}

export function imageDataHasInk(data: ImageData): boolean {
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] > 8) {
      return true;
    }
  }
  return false;
}

/** Metadata captured when a page is rendered — viewport transform is bound per page. */
export interface PageInkExportMeta {
  pixelWidth: number;
  pixelHeight: number;
  viewport: {
    width: number;
    height: number;
    convertToPdfPoint: (x: number, y: number) => number[];
  };
}

export function capturePageInkExportMeta(
  baseViewport: { width: number; height: number; convertToPdfPoint: (x: number, y: number) => number[] },
  pixelWidth: number,
  pixelHeight: number,
): PageInkExportMeta {
  return {
    pixelWidth,
    pixelHeight,
    viewport: {
      width: baseViewport.width,
      height: baseViewport.height,
      convertToPdfPoint: baseViewport.convertToPdfPoint.bind(baseViewport),
    },
  };
}

export function imageDataDiffBounds(
  before: ImageData | null,
  after: ImageData,
  padding = 6,
): CanvasRect | null {
  const { width, height, data: afterData } = after;
  if (before && (before.width !== width || before.height !== height)) {
    return imageDataInkBounds(after, padding);
  }
  const beforeData = before?.data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alphaIndex = (y * width + x) * 4 + 3;
      const afterAlpha = afterData[alphaIndex];
      const beforeAlpha = beforeData ? beforeData[alphaIndex] : 0;
      if (afterAlpha > INK_ALPHA_THRESHOLD && afterAlpha > beforeAlpha) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) {
    return null;
  }
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function imageDataInkBounds(data: ImageData, padding = 6): CanvasRect | null {
  const { width, height, data: pixels } = data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > INK_ALPHA_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) {
    return null;
  }
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Export one stroke from a canvas using pixels added since `before`. */
export async function exportStrokeSignature(
  inkCanvas: HTMLCanvasElement,
  before: ImageData | null,
  meta: PageInkExportMeta,
  pageNum: number,
): Promise<{ blob: Blob; placement: SignaturePlacement } | null> {
  const ctx = inkCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return null;
  }
  const after = ctx.getImageData(0, 0, inkCanvas.width, inkCanvas.height);
  const bounds = imageDataDiffBounds(before, after);
  if (!bounds) {
    return null;
  }
  const placement = canvasBoundsToPdfPlacement(
    bounds,
    meta.pixelWidth,
    meta.pixelHeight,
    meta.viewport,
    pageNum,
  );
  const blob = await cropCanvasToBlob(inkCanvas, bounds);
  if (!blob || blob.size < 20) {
    return null;
  }
  return { blob, placement };
}

/** Export all ink on one page as a single PNG + PDF placement (includes every stroke on that page). */
export async function exportInkCanvasSignature(
  inkCanvas: HTMLCanvasElement,
  meta: PageInkExportMeta,
  pageNum: number,
): Promise<{ blob: Blob; placement: SignaturePlacement } | null> {
  const bounds = canvasInkBounds(inkCanvas);
  if (!bounds) {
    return null;
  }
  const placement = canvasBoundsToPdfPlacement(
    bounds,
    meta.pixelWidth,
    meta.pixelHeight,
    meta.viewport,
    pageNum,
  );
  const blob = await cropCanvasToBlob(inkCanvas, bounds);
  if (!blob || blob.size < 40) {
    return null;
  }
  return { blob, placement };
}

export function defaultSignedFilename(filename: string): string {
  const trimmed = filename.trim() || 'document.pdf';
  const base = trimmed.replace(/\.pdf$/i, '') || 'document';
  return `${base}_signed.pdf`;
}

export type SignScope = 'current-page' | 'all-pages';

/** Repeat each stroke on every page at the same PDF position (for "sign all pages"). */
export function expandSignaturesToAllPages(
  strokes: { blob: Blob; placement: SignaturePlacement }[],
  pageCount: number,
): { blob: Blob; placement: SignaturePlacement }[] {
  if (pageCount < 1 || strokes.length === 0) {
    return strokes;
  }
  const expanded: { blob: Blob; placement: SignaturePlacement }[] = [];
  for (let page = 1; page <= pageCount; page++) {
    for (const stroke of strokes) {
      expanded.push({
        blob: stroke.blob,
        placement: { ...stroke.placement, pageNum: page },
      });
    }
  }
  return expanded;
}

function inkAlpha(data: Uint8ClampedArray, width: number, x: number, y: number): number {
  return data[(y * width + x) * 4 + 3];
}

/** Separate ink blobs on one canvas (8-connected components, canvas top-left origin). */
export function canvasInkRegions(canvas: HTMLCanvasElement | null, padding = 6): CanvasRect[] {
  if (!canvas) {
    return [];
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || canvas.width <= 0 || canvas.height <= 0) {
    return [];
  }
  const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const labels = new Int32Array(width * height);
  const bounds = new Map<number, { minX: number; minY: number; maxX: number; maxY: number }>();
  let nextLabel = 1;
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  const index = (x: number, y: number) => y * width + x;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = index(x, y);
      if (labels[i] !== 0 || inkAlpha(data, width, x, y) <= INK_ALPHA_THRESHOLD) {
        continue;
      }
      const label = nextLabel++;
      const stack: [number, number][] = [[x, y]];
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const ci = index(cx, cy);
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) {
          continue;
        }
        if (labels[ci] !== 0 || inkAlpha(data, width, cx, cy) <= INK_ALPHA_THRESHOLD) {
          continue;
        }
        labels[ci] = label;
        minX = Math.min(minX, cx);
        minY = Math.min(minY, cy);
        maxX = Math.max(maxX, cx);
        maxY = Math.max(maxY, cy);
        for (const [dx, dy] of neighbors) {
          stack.push([cx + dx, cy + dy]);
        }
      }

      bounds.set(label, { minX, minY, maxX, maxY });
    }
  }

  return [...bounds.values()].map(({ minX, minY, maxX, maxY }) => {
    const x = Math.max(0, minX - padding);
    const y = Math.max(0, minY - padding);
    const right = Math.min(width - 1, maxX + padding);
    const bottom = Math.min(height - 1, maxY + padding);
    return { x, y, w: right - x + 1, h: bottom - y + 1 };
  });
}

/** Bounding box of non-transparent pixels (canvas top-left origin). */
export function canvasInkBounds(canvas: HTMLCanvasElement | null, padding = 6): CanvasRect | null {
  if (!canvas) {
    return null;
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || canvas.width <= 0 || canvas.height <= 0) {
    return null;
  }
  const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = inkAlpha(data, width, x, y);
      if (alpha > INK_ALPHA_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) {
    return null;
  }
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Map canvas pixel bounds to PDF placement using pdf.js viewport (handles rotation). */
export function canvasBoundsToPdfPlacement(
  bounds: CanvasRect,
  pixelWidth: number,
  pixelHeight: number,
  viewport: {
    width: number;
    height: number;
    convertToPdfPoint: (x: number, y: number) => number[];
  },
  pageNum: number,
): SignaturePlacement {
  const x1 = (bounds.x / pixelWidth) * viewport.width;
  const y1 = (bounds.y / pixelHeight) * viewport.height;
  const x2 = ((bounds.x + bounds.w) / pixelWidth) * viewport.width;
  const y2 = ((bounds.y + bounds.h) / pixelHeight) * viewport.height;
  const [pdfX1, pdfY1] = viewport.convertToPdfPoint(x1, y1);
  const [pdfX2, pdfY2] = viewport.convertToPdfPoint(x2, y2);
  const x = Math.min(pdfX1, pdfX2);
  const y = Math.min(pdfY1, pdfY2);
  const w = Math.max(Math.abs(pdfX2 - pdfX1), 1);
  const h = Math.max(Math.abs(pdfY2 - pdfY1), 1);
  return { pageNum, x, y, w, h };
}

export function cropCanvasToBlob(canvas: HTMLCanvasElement, rect: CanvasRect): Promise<Blob | null> {
  const out = document.createElement('canvas');
  out.width = rect.w;
  out.height = rect.h;
  const ctx = out.getContext('2d');
  if (!ctx) {
    return Promise.resolve(null);
  }
  ctx.drawImage(canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  return new Promise((resolve) => out.toBlob((blob) => resolve(blob), 'image/png'));
}
