import { describe, expect, it } from 'vitest';
import { PDF_FILE_ACCEPT, isPdfFile } from './pdfFileUtils';

describe('isPdfFile', () => {
  it('accepts .pdf extension', () => {
    expect(isPdfFile(new File([], 'doc.PDF', { type: '' }))).toBe(true);
  });

  it('accepts application/pdf mime', () => {
    expect(isPdfFile(new File([], 'upload', { type: 'application/pdf' }))).toBe(true);
  });

  it('accepts application/x-pdf and octet-stream', () => {
    expect(isPdfFile(new File([], 'x', { type: 'application/x-pdf' }))).toBe(true);
    expect(isPdfFile(new File([], 'x', { type: 'application/octet-stream' }))).toBe(true);
  });

  it('rejects non-pdf files', () => {
    expect(isPdfFile(new File([], 'image.png', { type: 'image/png' }))).toBe(false);
    expect(isPdfFile(new File([], 'doc.txt', { type: 'text/plain' }))).toBe(false);
  });
});

describe('PDF_FILE_ACCEPT', () => {
  it('includes pdf extensions and mime types', () => {
    expect(PDF_FILE_ACCEPT).toContain('.pdf');
    expect(PDF_FILE_ACCEPT).toContain('application/pdf');
  });
});
