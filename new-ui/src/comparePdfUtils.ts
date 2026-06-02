import type { ComparisonReport, PageCompareResult } from './compareTypes';

export const COMPARE_RENDER_MAX_WIDTH = 520;
export const PIXEL_DIFF_THRESHOLD = 28;
export const VISUAL_MATCH_PERCENT = 98.5;

export function pageHasDiff(row: PageCompareResult | undefined): boolean {
  if (!row) {
    return false;
  }
  return !row.textMatch || row.visualSimilarityPercent < VISUAL_MATCH_PERCENT;
}

export function diffPageNumbers(report: ComparisonReport | null): number[] {
  if (!report) {
    return [];
  }
  return report.pageResults.filter(pageHasDiff).map((r) => r.page);
}

export function pageResultFor(
  report: ComparisonReport | null,
  pageNum: number,
): PageCompareResult | undefined {
  return report?.pageResults.find((r) => r.page === pageNum);
}

/** Paint Meld-style change highlights on an overlay canvas (block-based for speed). */
export function paintVisualDiffOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  leftData: ImageData,
  rightData: ImageData,
  blockSize = 8,
): void {
  const w = Math.min(width, leftData.width, rightData.width);
  const h = Math.min(height, leftData.height, rightData.height);
  if (w === 0 || h === 0) {
    return;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 153, 51, 0.42)';

  const left = leftData.data;
  const right = rightData.data;
  const lw = leftData.width;

  for (let by = 0; by < h; by += blockSize) {
    const bh = Math.min(blockSize, h - by);
    for (let bx = 0; bx < w; bx += blockSize) {
      const bw = Math.min(blockSize, w - bx);
      if (blockDiffers(left, right, lw, bx, by, bw, bh)) {
        ctx.fillRect(bx, by, bw, bh);
      }
    }
  }
}

function blockDiffers(
  left: Uint8ClampedArray,
  right: Uint8ClampedArray,
  lw: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  for (let y = by; y < by + bh; y++) {
    for (let x = bx; x < bx + bw; x++) {
      const i = (y * lw + x) * 4;
      const dr = Math.abs(left[i] - right[i]);
      const dg = Math.abs(left[i + 1] - right[i + 1]);
      const db = Math.abs(left[i + 2] - right[i + 2]);
      if (dr > PIXEL_DIFF_THRESHOLD || dg > PIXEL_DIFF_THRESHOLD || db > PIXEL_DIFF_THRESHOLD) {
        return true;
      }
    }
  }
  return false;
}

export function readCanvasImageData(canvas: HTMLCanvasElement): ImageData | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return null;
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
