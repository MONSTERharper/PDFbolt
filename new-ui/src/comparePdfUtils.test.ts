import { describe, expect, it } from 'vitest';
import { diffPageNumbers, pageHasDiff } from './comparePdfUtils';
import type { ComparisonReport } from './compareTypes';

const sampleReport: ComparisonReport = {
  file1Name: 'a.pdf',
  file2Name: 'b.pdf',
  file1Pages: 2,
  file2Pages: 2,
  file1Size: 100,
  file2Size: 200,
  file1Title: 'None',
  file2Title: 'None',
  isSamePageCount: true,
  isSameByteSize: false,
  bytesIdentical: false,
  pagesCompared: 2,
  pagesWithTextDifferences: 1,
  pagesWithVisualDifferences: 0,
  overallMatch: false,
  summary: '1 of 2 pages differ',
  pageResults: [
    { page: 1, textMatch: true, visualSimilarityPercent: 100, note: '' },
    { page: 2, textMatch: false, visualSimilarityPercent: 99, note: 'Text differs' },
  ],
};

describe('comparePdfUtils', () => {
  it('flags pages with text or visual mismatch', () => {
    expect(pageHasDiff(sampleReport.pageResults[0])).toBe(false);
    expect(pageHasDiff(sampleReport.pageResults[1])).toBe(true);
  });

  it('lists diff page numbers', () => {
    expect(diffPageNumbers(sampleReport)).toEqual([2]);
  });
});
