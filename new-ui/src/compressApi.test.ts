import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  COMPRESS_LEVEL_OPTIONS,
  buildCompressSavingHint,
  compressLevelHoverHint,
  formatBytesHint,
  postCompress,
} from './compressApi';
import { mockPdfFile } from './test/fixtures';
import { mockPdfResponse, stubFetch } from './test/fetchMock';

describe('compressApi helpers', () => {
  it('formatBytesHint scales units', () => {
    expect(formatBytesHint(500)).toBe('500 B');
    expect(formatBytesHint(2048)).toBe('2.0 KB');
    expect(formatBytesHint(2 * 1024 * 1024)).toBe('2.00 MB');
    expect(formatBytesHint(-1)).toBe('—');
  });

  it('lists three compression levels', () => {
    expect(COMPRESS_LEVEL_OPTIONS.map((o) => o.value)).toEqual([
      'strong',
      'balanced',
      'high',
    ]);
  });

  it('buildCompressSavingHint includes upload size when provided', () => {
    const hint = buildCompressSavingHint(100_000, 'balanced');
    expect(hint).toContain('97.7 KB');
    expect(hint).toContain('balanced');
  });

  it('compressLevelHoverHint works with zero bytes', () => {
    expect(compressLevelHoverHint(0, 'strong')).toContain('Approx.');
  });
});

describe('postCompress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts multipart and parses response headers', async () => {
    let captured: FormData | undefined;
    stubFetch((_url, init) => {
      captured = init?.body as FormData;
      return mockPdfResponse(new Blob(['%PDF']), {
        disposition: 'attachment; filename="out.pdf"',
        headers: {
          'X-Bolt-Compress-Original-Bytes': '1000',
          'X-Bolt-Compress-Output-Bytes': '800',
          'X-Bolt-Compress-Saved-Bytes': '200',
          'X-Bolt-Compress-Saved-Percent': '20',
          'X-Bolt-Compress-Pages': '2',
          'X-Bolt-Compress-Images-Processed': '0',
        },
      });
    });

    const file = mockPdfFile();
    const result = await postCompress({ files: [file], level: 'balanced', retainMetadata: true });

    expect(captured?.get('level')).toBe('balanced');
    expect(captured?.get('retainMetadata')).toBe('true');
    expect(result.filename).toBe('out.pdf');
    expect(result.originalBytes).toBe('1000');
    expect(result.savedPercent).toBe('20');
    expect(result.pages).toBe('2');
  });

  it('throws friendly error on network failure', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    await expect(
      postCompress({ files: [mockPdfFile()], level: 'high', retainMetadata: false }),
    ).rejects.toThrow(/Could not reach the PDF engine/);
  });

  it('surfaces json error message from server', async () => {
    stubFetch(() =>
      new Response(JSON.stringify({ message: 'Upload too large' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(
      postCompress({ files: [mockPdfFile()], level: 'strong', retainMetadata: true }),
    ).rejects.toThrow('Upload too large');
  });
});
