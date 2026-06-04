import { describe, expect, it } from 'vitest';
import { canonicalToolId } from './toolIdAliases';

describe('canonicalToolId', () => {
  it('maps legacy jpg-to-pdf to images-to-pdf', () => {
    expect(canonicalToolId('jpg-to-pdf')).toBe('images-to-pdf');
  });

  it('passes through other ids', () => {
    expect(canonicalToolId('merge')).toBe('merge');
  });
});
