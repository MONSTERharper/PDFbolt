/**
 * Maps raw API / network messages to customer-friendly text (safety net when server text is technical).
 */
export function friendlyErrorMessage(raw: string): string {
  const msg = raw.trim();
  if (!msg) {
    return 'Something went wrong. Please try again.';
  }

  const lower = msg.toLowerCase();

  if (lower.includes('could not reach pdfbolt')) {
    return msg;
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many requests. Please wait a minute and try again.';
  }
  if (lower.includes('upload is too large') || lower.includes('payload_too_large')) {
    return 'Your upload is too large. See the limits below the upload area.';
  }
  if (/\d{7,}\s*bytes/.test(lower) || lower.includes('exceeds per-file limit')) {
    return 'A file is too large. See the limits below the upload area.';
  }
  if (lower.includes('total upload') && lower.includes('limit')) {
    return 'Combined upload size is too large. Try fewer or smaller files.';
  }
  if (lower.includes('too many files')) {
    return 'Too many files in one upload. Try fewer files at a time.';
  }
  if (lower.includes('exceeding the limit') && lower.includes('pages')) {
    return msg.replace(/exceeding the limit of/i, 'Maximum is');
  }
  if (lower.includes('pdf has') && lower.includes('pages')) {
    return msg;
  }
  if (lower.includes('password-protected') || lower.includes('pdf password')) {
    return msg;
  }
  if (lower.includes('smtp') || lower.includes('mail_error') || lower.includes('inquiry email')) {
    return 'We could not send your message right now. Please use the email address on this page.';
  }
  if (lower.includes('contact form is temporarily unavailable')) {
    return msg;
  }
  if (lower.includes('subset-only embedding') || lower.includes('server logs')) {
    return 'PDF processing failed. Try exporting the PDF again or use a simpler file.';
  }
  if (lower.includes('unexpected server error')) {
    return 'Something went wrong on our side. Please try again in a few minutes.';
  }

  return msg;
}
