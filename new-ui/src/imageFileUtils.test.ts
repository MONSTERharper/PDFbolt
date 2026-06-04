import { describe, expect, it } from 'vitest';
import { isSupportedImageFile } from './imageFileUtils';

describe('isSupportedImageFile', () => {
  it('accepts common raster extensions', () => {
    expect(isSupportedImageFile(new File([], 'a.png', { type: '' }))).toBe(true);
    expect(isSupportedImageFile(new File([], 'b.jpeg', { type: '' }))).toBe(true);
    expect(isSupportedImageFile(new File([], 'c.webp', { type: '' }))).toBe(true);
    expect(isSupportedImageFile(new File([], 'd.tiff', { type: '' }))).toBe(true);
    expect(isSupportedImageFile(new File([], 'e.heic', { type: '' }))).toBe(true);
  });

  it('rejects non-images', () => {
    expect(isSupportedImageFile(new File([], 'doc.pdf', { type: 'application/pdf' }))).toBe(false);
  });
});
