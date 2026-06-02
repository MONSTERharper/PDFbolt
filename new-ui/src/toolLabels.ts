/** User-facing label for a bolt tool (always starts with "bolt "). */
export function boltToolName(toolId: string): string {
  const names: Record<string, string> = {
    merge: 'bolt merge',
    split: 'bolt split',
    'remove-pages': 'bolt remove',
    'extract-pages': 'bolt extract',
    'organize-pdf': 'bolt organize',
    compress: 'bolt compress',
    'repair-pdf': 'bolt repair',
    'ocr-pdf': 'bolt ocr',
    'scan-to-pdf': 'bolt scan',
    'jpg-to-pdf': 'bolt jpg-to-pdf',
    'word-to-pdf': 'bolt word-to-pdf',
    'powerpoint-to-pdf': 'bolt powerpoint-to-pdf',
    'excel-to-pdf': 'bolt excel-to-pdf',
    'html-to-pdf': 'bolt html-to-pdf',
    'pdf-to-jpg': 'bolt pdf-to-jpg',
    'pdf-to-word': 'bolt pdf-to-word',
    'pdf-to-powerpoint': 'bolt pdf-to-powerpoint',
    'pdf-to-excel': 'bolt pdf-to-excel',
    'pdf-to-pdfa': 'bolt pdf-to-pdfa',
    replace: 'bolt replace',
    'rotate-pdf': 'bolt rotate',
    'add-page-numbers': 'bolt page-numbers',
    'add-watermark': 'bolt watermark',
    'crop-pdf': 'bolt crop',
    'edit-pdf': 'bolt edit',
    'pdf-forms': 'bolt forms',
    'unlock-pdf': 'bolt unlock',
    'protect-pdf': 'bolt protect',
    'sign-pdf': 'bolt sign',
    'redact-pdf': 'bolt redact',
    'compare-pdf': 'bolt compare',
  };
  return names[toolId] ?? `bolt ${toolId.replace(/-/g, ' ')}`;
}

export function boltUploadHeading(toolId: string): string {
  switch (toolId) {
    case 'merge':
      return 'PDFs for bolt merge';
    case 'compare-pdf':
      return 'Two PDFs for bolt compare';
    case 'scan-to-pdf':
    case 'jpg-to-pdf':
      return `Images for ${boltToolName(toolId)}`;
    case 'word-to-pdf':
      return 'Word file for bolt word-to-pdf';
    case 'powerpoint-to-pdf':
      return 'PowerPoint file for bolt powerpoint-to-pdf';
    case 'excel-to-pdf':
      return 'Excel file for bolt excel-to-pdf';
    case 'html-to-pdf':
      return 'HTML for bolt html-to-pdf';
    default:
      return `PDF for ${boltToolName(toolId)}`;
  }
}

export function boltUploadHint(toolId: string): string {
  switch (toolId) {
    case 'merge':
      return '2+ PDFs';
    case 'compare-pdf':
      return '2 PDFs';
    case 'scan-to-pdf':
    case 'jpg-to-pdf':
      return '1+ images';
    case 'word-to-pdf':
    case 'powerpoint-to-pdf':
    case 'excel-to-pdf':
      return '1 Office file';
    case 'html-to-pdf':
      return 'Paste or .html file';
    default:
      return '1 PDF';
  }
}

export function boltExecuteLabel(toolId: string): string {
  return `Execute ${boltToolName(toolId)}`;
}
