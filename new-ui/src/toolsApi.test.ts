import { afterEach, describe, expect, it, vi } from 'vitest';
import { postPdfTool } from './toolsApi';
import { mockPdfResponse, mockJsonResponse, stubFetch } from './test/fetchMock';

describe('postPdfTool', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns file result for pdf responses', async () => {
    stubFetch(() =>
      mockPdfResponse(new Blob(['%PDF-test'], { type: 'application/pdf' }), {
        disposition: 'attachment; filename="merged.pdf"',
      }),
    );

    const form = new FormData();
    form.append('operation', 'merge');
    const result = await postPdfTool(form);

    expect(result.kind).toBe('file');
    if (result.kind === 'file') {
      expect(result.filename).toBe('merged.pdf');
      expect(result.contentType).toContain('application/pdf');
      expect(await result.blob.text()).toBe('%PDF-test');
    }
  });

  it('returns json result for compare responses', async () => {
    stubFetch(() =>
      mockJsonResponse({ isSameByteSize: true, pageCountA: 1 }),
    );

    const form = new FormData();
    form.append('operation', 'compare-pdf');
    const result = await postPdfTool(form);

    expect(result.kind).toBe('json');
    if (result.kind === 'json') {
      expect(result.data).toMatchObject({ isSameByteSize: true });
    }
  });

  it('uses fallback filename when disposition missing', async () => {
    stubFetch(() => mockPdfResponse());
    const result = await postPdfTool(new FormData());
    if (result.kind === 'file') {
      expect(result.filename).toBe('bolt_output.pdf');
    }
  });

  it('throws network hint on TypeError', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    await expect(postPdfTool(new FormData())).rejects.toThrow(
      /\/api\/pdf\/tools/,
    );
  });

  it('parses json error payloads', async () => {
    stubFetch(() =>
      new Response(JSON.stringify({ message: 'work in progress' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(postPdfTool(new FormData())).rejects.toThrow('work in progress');
  });
});
