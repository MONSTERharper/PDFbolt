import { describe, expect, it } from 'vitest';
import {
  canvasHasInk,
  canvasInkBounds,
  canvasBoundsToPdfPlacement,
  capturePageInkExportMeta,
  defaultSignaturePlacement,
  defaultSignedFilename,
  expandSignaturesToAllPages,
  placementsNear,
  signatureSpotsForPage,
} from './signPdfUtils';

describe('signPdfUtils', () => {
  it('returns three in-bounds spots for a letter page', () => {
    const spots = signatureSpotsForPage(612, 792);
    expect(spots).toHaveLength(3);
    for (const spot of spots) {
      expect(spot.x).toBeGreaterThanOrEqual(0);
      expect(spot.y).toBeGreaterThanOrEqual(0);
      expect(spot.x + spot.w).toBeLessThanOrEqual(612);
      expect(spot.y + spot.h).toBeLessThanOrEqual(792);
    }
  });

  it('defaults to bottom-right on the requested page', () => {
    const placement = defaultSignaturePlacement(612, 792, 3);
    expect(placement.pageNum).toBe(3);
    const spots = signatureSpotsForPage(612, 792);
    expect(placementsNear(placement, spots[0])).toBe(true);
  });

  it('detects near placements', () => {
    expect(placementsNear({ x: 10, y: 20, w: 150, h: 50 }, { x: 11, y: 21, w: 149, h: 51 })).toBe(
      true,
    );
    expect(placementsNear({ x: 10, y: 20, w: 150, h: 50 }, { x: 30, y: 20, w: 150, h: 50 })).toBe(
      false,
    );
  });

  it('maps canvas bounds through viewport.convertToPdfPoint', () => {
    const viewport = {
      width: 600,
      height: 800,
      convertToPdfPoint: (x: number, y: number) => [x * 0.5, 800 - y * 0.5],
    };
    const placement = canvasBoundsToPdfPlacement(
      { x: 100, y: 200, w: 200, h: 100 },
      600,
      800,
      viewport,
      1,
    );
    expect(placement.pageNum).toBe(1);
    expect(placement.x).toBe(50);
    expect(placement.y).toBe(650);
    expect(placement.w).toBe(100);
    expect(placement.h).toBe(50);
  });

  it('returns false for a missing canvas', () => {
    expect(canvasHasInk(null)).toBe(false);
    expect(canvasInkBounds(null)).toBeNull();
  });

  it('builds a signed output filename', () => {
    expect(defaultSignedFilename('contract.pdf')).toBe('contract_signed.pdf');
  });

  it('expands strokes to every page', () => {
    const stroke = {
      blob: new Blob(['x'], { type: 'image/png' }),
      placement: { pageNum: 2, x: 10, y: 20, w: 100, h: 40 },
    };
    const expanded = expandSignaturesToAllPages([stroke], 3);
    expect(expanded).toHaveLength(3);
    expect(expanded.map((item) => item.placement.pageNum)).toEqual([1, 2, 3]);
    expect(expanded.every((item) => item.placement.x === 10)).toBe(true);
  });
});
