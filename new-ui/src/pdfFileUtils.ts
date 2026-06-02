/** Returns true when the file looks like a PDF (by extension or MIME). */
export function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    return true;
  }
  const mime = (file.type || '').toLowerCase();
  return (
    mime === 'application/pdf' ||
    mime === 'application/x-pdf' ||
    mime === 'application/octet-stream'
  );
}

export const PDF_FILE_ACCEPT = '.pdf,application/pdf,application/x-pdf';
