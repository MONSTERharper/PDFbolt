import { describe, expect, it } from 'vitest';
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from './adsenseConfig';

describe('adsenseConfig', () => {
  it('has publisher client id', () => {
    expect(ADSENSE_CLIENT).toMatch(/^ca-pub-/);
  });

  it('production enables ads at build time', () => {
    if (import.meta.env.PROD) {
      expect(ADSENSE_ENABLED).toBe(true);
    }
  });
});
