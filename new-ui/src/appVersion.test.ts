import { afterEach, describe, expect, it, vi } from 'vitest';
import { APP_VERSION, fetchServerVersion, formatBoltVersion } from './appVersion';

describe('appVersion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes build version from package.json', () => {
    expect(APP_VERSION).toBe('1.5.0');
  });

  it('formats bolt version label', () => {
    expect(formatBoltVersion('1.5.0')).toBe('v1.5.0');
    expect(formatBoltVersion('v2.0.0')).toBe('v2.0.0');
  });

  it('reads version from health API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', version: '1.5.0' }),
      }),
    );
    await expect(fetchServerVersion()).resolves.toBe('1.5.0');
  });
});
