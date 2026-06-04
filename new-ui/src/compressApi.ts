import { friendlyErrorMessage } from './friendlyError';

export type CompressLevel = 'high' | 'balanced' | 'strong';

export const COMPRESS_LEVEL_OPTIONS: {
  value: CompressLevel;
  label: string;
  hint: string;
}[] = [
  {
    value: 'strong',
    label: 'High compression',
    hint: 'Smallest file size — stronger JPEG and smaller max image size.',
  },
  {
    value: 'balanced',
    label: 'Recommended compression',
    hint: 'Good quality, good compression — moderate image resampling.',
  },
  {
    value: 'high',
    label: 'Less compression',
    hint: 'High quality, less compression — high JPEG quality; only large photos resampled.',
  },
];

/** Typical savings vs original upload size (varies with image content). */
export const COMPRESS_SAVING_PERCENT: Record<CompressLevel, { min: number; max: number }> = {
  high: { min: 5, max: 20 },
  balanced: { min: 10, max: 35 },
  strong: { min: 25, max: 55 },
};

export function formatBytesHint(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Short hover line for a compression level button. */
export function compressLevelHoverHint(totalBytes: number, level: CompressLevel): string {
  const pct = COMPRESS_SAVING_PERCENT[level];
  if (totalBytes <= 0) {
    return `Approx. ${pct.min}–${pct.max}% smaller`;
  }
  const minOutput = Math.round(totalBytes * (1 - pct.max / 100));
  const maxOutput = Math.round(totalBytes * (1 - pct.min / 100));
  const minSaved = Math.max(0, totalBytes - maxOutput);
  const maxSaved = Math.max(0, totalBytes - minOutput);
  return `Approx. ${pct.min}–${pct.max}% · save ${formatBytesHint(minSaved)}–${formatBytesHint(maxSaved)}`;
}

export function buildCompressSavingHint(totalBytes: number, level: CompressLevel): string {
  const option = COMPRESS_LEVEL_OPTIONS.find((o) => o.value === level);
  const pct = COMPRESS_SAVING_PERCENT[level];
  const label = option?.label ?? level;

  if (totalBytes <= 0) {
    return [
      'Approx. size reduction (typical):',
      `· high: ${COMPRESS_SAVING_PERCENT.high.min}–${COMPRESS_SAVING_PERCENT.high.max}%`,
      `· balanced: ${COMPRESS_SAVING_PERCENT.balanced.min}–${COMPRESS_SAVING_PERCENT.balanced.max}%`,
      `· strong: ${COMPRESS_SAVING_PERCENT.strong.min}–${COMPRESS_SAVING_PERCENT.strong.max}%`,
      '',
      'Upload a PDF to see estimates for your file.',
    ].join('\n');
  }

  const minOutput = Math.round(totalBytes * (1 - pct.max / 100));
  const maxOutput = Math.round(totalBytes * (1 - pct.min / 100));
  const minSaved = Math.max(0, totalBytes - maxOutput);
  const maxSaved = Math.max(0, totalBytes - minOutput);

  return [
    `${label} (${level})`,
    `Upload: ${formatBytesHint(totalBytes)}`,
    `Est. output: ${formatBytesHint(minOutput)} – ${formatBytesHint(maxOutput)}`,
    `Approx. saved: ${formatBytesHint(minSaved)} – ${formatBytesHint(maxSaved)}`,
    `(${pct.min}–${pct.max}% typical; image-heavy PDFs save more)`,
  ].join('\n');
}

export interface CompressApiResult {
  filename: string;
  blob: Blob;
  originalBytes: string;
  outputBytes: string;
  savedBytes: string;
  savedPercent: string;
  pages: string;
  imagesProcessed: string;
}

function parseFilename(disposition: string): string {
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : 'bolt_document_compressed.pdf';
}

export async function postCompress(params: {
  files: File[];
  level: CompressLevel;
  retainMetadata: boolean;
  pdfOpenPassword?: string;
  pdfPasswordsJson?: string;
}): Promise<CompressApiResult> {
  const data = new FormData();
  for (const file of params.files) {
    data.append('files', file);
  }
  data.append('level', params.level);
  data.set('retainMetadata', params.retainMetadata ? 'true' : 'false');
  if (params.pdfPasswordsJson) {
    data.append('pdfPasswordsJson', params.pdfPasswordsJson);
  } else if (params.pdfOpenPassword?.trim()) {
    data.append('pdfPassword', params.pdfOpenPassword.trim());
  }

  let response: Response;
  try {
    response = await fetch('/api/compress', { method: 'POST', body: data });
  } catch (err) {
    const hint = import.meta.env.DEV
      ? 'Could not reach PDFBolt at /api/compress. Start the Java backend (mvn spring-boot:run) and open http://localhost:8080/.'
      : 'Could not reach PDFBolt. Check your connection and try again.';
    if (err instanceof TypeError) {
      throw new Error(hint);
    }
    throw err;
  }

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string; error?: string };
      if (payload.error === 'pdf_password_required') {
        message =
          payload.message ||
          'This PDF is password-protected. Enter the document password to continue.';
      } else {
        message = friendlyErrorMessage(payload.message || message);
      }
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  return {
    filename: parseFilename(disposition),
    blob,
    originalBytes: response.headers.get('X-Bolt-Compress-Original-Bytes') || '0',
    outputBytes: response.headers.get('X-Bolt-Compress-Output-Bytes') || '0',
    savedBytes: response.headers.get('X-Bolt-Compress-Saved-Bytes') || '0',
    savedPercent: response.headers.get('X-Bolt-Compress-Saved-Percent') || '0',
    pages: response.headers.get('X-Bolt-Compress-Pages') || '0',
    imagesProcessed: response.headers.get('X-Bolt-Compress-Images-Processed') || '0',
  };
}
