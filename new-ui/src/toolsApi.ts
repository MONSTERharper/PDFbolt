import { friendlyErrorMessage } from './friendlyError';

export type PdfToolResult =
  | {
      kind: 'file';
      blob: Blob;
      filename: string;
      contentType: string;
      pdfaValidated?: boolean;
      pdfaValidationNote?: string;
    }
  | { kind: 'json'; data: unknown };

function parseFilename(disposition: string, fallback: string): string {
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : fallback;
}

export async function postPdfTool(form: FormData): Promise<PdfToolResult> {
  let response: Response;
  try {
    response = await fetch('/api/pdf/tools', { method: 'POST', body: form });
  } catch (err) {
    const hint = import.meta.env.DEV
      ? 'Could not reach PDFbolt at /api/pdf/tools. Start the Java backend (mvn spring-boot:run) and open http://localhost:8080/.'
      : 'Could not reach PDFbolt. Check your connection and try again.';
    if (err instanceof TypeError) {
      throw new Error(hint);
    }
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string; error?: string };
      message = friendlyErrorMessage(payload.message || message);
      if (payload.error === 'pdf_password_required') {
        message = payload.message || 'This PDF is password-protected. Enter the document password to continue.';
      }
    } else {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return { kind: 'json', data };
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const filename = parseFilename(disposition, 'bolt_output.pdf');
  const pdfaValidatedHeader = response.headers.get('x-bolt-pdfa-validated');
  const pdfaValidationNote = response.headers.get('x-bolt-pdfa-validation-note') ?? undefined;
  return {
    kind: 'file',
    blob,
    filename,
    contentType: contentType || blob.type,
    pdfaValidated: pdfaValidatedHeader === 'true' ? true : pdfaValidatedHeader === 'false' ? false : undefined,
    pdfaValidationNote,
  };
}
