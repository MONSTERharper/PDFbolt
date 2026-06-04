import { describe, expect, it } from 'vitest';
import { getToolUploadKind, toolInputReady, toolNeedsPdfFile } from './toolUploadConfig';

describe('toolUploadConfig', () => {
  it('assigns upload kinds', () => {
    expect(getToolUploadKind('merge')).toBe('multi-pdf');
    expect(getToolUploadKind('split')).toBe('single-pdf');
    expect(getToolUploadKind('compare-pdf')).toBe('dual-pdf');
    expect(getToolUploadKind('images-to-pdf')).toBe('multi-image');
    expect(getToolUploadKind('jpg-to-pdf')).toBe('multi-image');
    expect(getToolUploadKind('word-to-pdf')).toBe('office-file');
    expect(getToolUploadKind('html-to-pdf')).toBe('html-content');
  });

  it('validates merge needs two pdfs in extraFiles', () => {
    const file = new File([], 'a.pdf', { type: 'application/pdf' });
    expect(toolInputReady('merge', { file: null, extraFiles: [file], compareFile2: null, toolText: '' })).toBe(false);
    expect(
      toolInputReady('merge', {
        file: null,
        extraFiles: [file, new File([], 'b.pdf', { type: 'application/pdf' })],
        compareFile2: null,
        toolText: '',
      }),
    ).toBe(true);
  });

  it('validates compare needs both pdfs', () => {
    const a = new File([], 'a.pdf', { type: 'application/pdf' });
    expect(toolInputReady('compare-pdf', { file: a, extraFiles: [], compareFile2: null, toolText: '' })).toBe(false);
    expect(
      toolInputReady('compare-pdf', {
        file: a,
        extraFiles: [],
        compareFile2: new File([], 'b.pdf', { type: 'application/pdf' }),
        toolText: '',
      }),
    ).toBe(true);
  });

  it('single-pdf tools need file', () => {
    expect(toolNeedsPdfFile('rotate-pdf')).toBe(true);
    expect(toolNeedsPdfFile('merge')).toBe(false);
  });
});
