import { buildPdfPasswordsJson } from './pdfPasswordUtils';
import type { EncryptionKind } from './pdfPasswordUtils';

export interface PdfInspectFileResult {
  name: string;
  encrypted: boolean;
  passwordRequired: boolean;
  passwordAccepted: boolean;
  encryptionKind?: EncryptionKind;
}

export interface PdfInspectResult {
  files: PdfInspectFileResult[];
  anyPasswordRequired: boolean;
  allPasswordsAccepted: boolean;
}

export async function inspectPdfs(
  files: File[],
  passwordsByFile: Record<string, string> = {},
): Promise<PdfInspectResult> {
  if (files.length === 0) {
    return { files: [], anyPasswordRequired: false, allPasswordsAccepted: true };
  }
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
  }
  const json = buildPdfPasswordsJson(files, passwordsByFile);
  if (json) {
    form.append('pdfPasswordsJson', json);
  }
  const response = await fetch('/api/pdf/inspect', { method: 'POST', body: form });
  const payload = (await response.json()) as PdfInspectResult & { message?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.message || `Inspect failed (${response.status})`);
  }
  return payload;
}

export function isPdfPasswordRequiredError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  const msg = err.message.toLowerCase();
  return msg.includes('password-protected') || msg.includes('pdf_password_required');
}
