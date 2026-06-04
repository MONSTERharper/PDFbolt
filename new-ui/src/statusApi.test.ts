import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchHealth } from './statusApi';

describe('fetchHealth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns parsed health JSON', async () => {
    const payload = {
      status: 'ok',
      version: '1.1.0',
      suite: 'PDFBolt',
      tool: 'bolt-replacer',
      timestamp: '2026-01-01T00:00:00Z',
      dependencies: {
        libreOffice: true,
        ghostscript: true,
        verapdf: true,
        pdfaValidationEnabled: true,
        heic: true,
        ready: true,
      },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    await expect(fetchHealth()).resolves.toEqual(payload);
  });
});
