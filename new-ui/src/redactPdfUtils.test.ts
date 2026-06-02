import { describe, expect, it } from 'vitest';
import { canvasRectToPdf, pdfRectToCanvas } from './redactPdfUtils';

describe('redactPdfUtils', () => {
  it('converts canvas rect to PDF coordinates', () => {
    const pageHeight = 792;
    const scale = 1.5;
    const pdf = canvasRectToPdf({ x: 0, y: 0, w: 150, h: 60 }, pageHeight, scale);
    expect(pdf.x).toBeCloseTo(0);
    expect(pdf.w).toBeCloseTo(100);
    expect(pdf.h).toBeCloseTo(40);
    expect(pdf.y).toBeCloseTo(pageHeight - 40);
  });

  it('round-trips through pdfRectToCanvas', () => {
    const pageHeight = 612;
    const scale = 2;
    const original = { x: 30, y: 40, w: 120, h: 24 };
    const canvas = pdfRectToCanvas(original, pageHeight, scale);
    const back = canvasRectToPdf(canvas, pageHeight, scale);
    expect(back.x).toBeCloseTo(original.x);
    expect(back.y).toBeCloseTo(original.y);
    expect(back.w).toBeCloseTo(original.w);
    expect(back.h).toBeCloseTo(original.h);
  });
});
