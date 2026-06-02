import { describe, expect, it } from 'vitest';
import { boundedIntFromInput } from './parseNumber';

describe('boundedIntFromInput', () => {
  it('parses valid integers', () => {
    expect(boundedIntFromInput('42', 0)).toBe(42);
  });

  it('returns fallback for empty or invalid input', () => {
    expect(boundedIntFromInput('', 7)).toBe(7);
    expect(boundedIntFromInput('abc', 7)).toBe(7);
  });

  it('clamps to min and max', () => {
    expect(boundedIntFromInput('0', 5, 1)).toBe(1);
    expect(boundedIntFromInput('999', 5, 1, 100)).toBe(100);
  });
});
