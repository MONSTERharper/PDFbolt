export interface PageCompareResult {
  page: number;
  textMatch: boolean;
  visualSimilarityPercent: number;
  note: string;
}

export interface ComparisonReport {
  file1Name: string;
  file2Name: string;
  file1Pages: number;
  file2Pages: number;
  file1Size: number;
  file2Size: number;
  file1Title: string;
  file2Title: string;
  isSamePageCount: boolean;
  isSameByteSize: boolean;
  bytesIdentical: boolean;
  pagesCompared: number;
  pagesWithTextDifferences: number;
  pagesWithVisualDifferences: number;
  overallMatch: boolean;
  summary: string;
  pageResults: PageCompareResult[];
}
