import { describe, expect, it } from 'vitest';
import { friendlyErrorMessage } from './friendlyError';

describe('friendlyErrorMessage', () => {
  it('softens byte-limit errors', () => {
    expect(friendlyErrorMessage("exceeds per-file limit of 26214400 bytes.")).toContain('too large');
  });

  it('keeps password messages', () => {
    const m = 'This PDF is password-protected. Enter the document password to continue.';
    expect(friendlyErrorMessage(m)).toBe(m);
  });

  it('maps rate limits', () => {
    expect(friendlyErrorMessage('Rate limit exceeded. Please try again in a minute.')).toContain('Too many requests');
  });
});
