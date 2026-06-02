import { describe, expect, it } from 'vitest';
import { boltExecuteLabel, boltToolName, boltUploadHeading } from './toolLabels';

describe('toolLabels', () => {
  it('names every bolt tool with bolt prefix', () => {
    expect(boltToolName('merge')).toBe('bolt merge');
    expect(boltToolName('replace')).toBe('bolt replace');
    expect(boltToolName('unknown-widget')).toBe('bolt unknown widget');
  });

  it('upload headings describe each bolt flow', () => {
    expect(boltUploadHeading('merge')).toContain('bolt merge');
    expect(boltUploadHeading('split')).toContain('bolt split');
    expect(boltUploadHeading('jpg-to-pdf')).toContain('bolt jpg-to-pdf');
    expect(boltUploadHeading('compare-pdf')).toContain('Two PDFs');
  });

  it('execute label uses bolt name', () => {
    expect(boltExecuteLabel('compress')).toBe('Execute bolt compress');
  });
});
