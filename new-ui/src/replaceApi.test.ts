import { afterEach, describe, expect, it, vi } from 'vitest';
import { postContactInquiry, postReplaceBatch } from './replaceApi';
import { mockPdfFile } from './test/fixtures';
import { mockJsonResponse, mockPdfResponse, stubFetch } from './test/fetchMock';

describe('postReplaceBatch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends search/replacement pairs and match options', async () => {
    let body: FormData | undefined;
    stubFetch((_url, init) => {
      body = init?.body as FormData;
      return mockPdfResponse(new Blob(['%PDF']), {
        disposition: 'attachment; filename="replaced.pdf"',
        headers: {
          'X-Bolt-Replacer-Matches': '2',
          'X-Bolt-Replacer-Matches-Found': '3',
          'X-Bolt-Replacer-Style-Preserved': '1',
          'X-Bolt-Replacer-Style-Fallback': '0',
        },
      });
    });

    const result = await postReplaceBatch({
      files: [mockPdfFile()],
      pairs: [{ find: 'foo', replace: 'bar' }],
      matchMode: 'caseInsensitive',
      replaceScope: 'first',
      strict: true,
      preserveStyle: true,
      retainMetadata: false,
    });

    expect(body?.getAll('search')).toEqual(['foo']);
    expect(body?.getAll('replacement')).toEqual(['bar']);
    expect(body?.get('matchMode')).toBe('caseInsensitive');
    expect(body?.get('replaceScope')).toBe('first');
    expect(body?.get('strict')).toBe('true');
    expect(body?.get('retainMetadata')).toBe('false');
    expect(result.filename).toBe('replaced.pdf');
    expect(result.matches).toBe('2');
  });

  it('includes occurrenceIndex only for nth scope', async () => {
    let body: FormData | undefined;
    stubFetch((_url, init) => {
      body = init?.body as FormData;
      return mockPdfResponse();
    });

    await postReplaceBatch({
      files: [mockPdfFile()],
      pairs: [{ find: 'a', replace: 'b' }],
      matchMode: 'exact',
      replaceScope: 'nth',
      occurrenceIndex: 2,
      strict: false,
      preserveStyle: true,
      retainMetadata: true,
    });
    expect(body?.get('occurrenceIndex')).toBe('2');

    body = undefined;
    await postReplaceBatch({
      files: [mockPdfFile()],
      pairs: [{ find: 'a', replace: 'b' }],
      matchMode: 'exact',
      replaceScope: 'all',
      strict: false,
      preserveStyle: true,
      retainMetadata: true,
    });
    expect(body?.has('occurrenceIndex')).toBe(false);
  });

  it('throws on network failure with hint', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed');
    });
    await expect(
      postReplaceBatch({
        files: [mockPdfFile()],
        pairs: [{ find: 'x', replace: 'y' }],
        matchMode: 'exact',
        replaceScope: 'all',
        strict: false,
        preserveStyle: true,
        retainMetadata: true,
      }),
    ).rejects.toThrow(/\/api\/replace/);
  });
});

describe('postContactInquiry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts json body', async () => {
    let init: RequestInit | undefined;
    stubFetch((_url, requestInit) => {
      init = requestInit;
      return mockJsonResponse({ ok: true });
    });

    await postContactInquiry({
      name: 'Test',
      email: 't@example.com',
      subject: 'Hi',
      message: 'Hello',
    });

    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
    expect(JSON.parse(String(init?.body))).toMatchObject({ name: 'Test' });
  });

  it('throws server message on failure', async () => {
    stubFetch(() =>
      mockJsonResponse({ message: 'SMTP not configured' }, 502),
    );
    await expect(
      postContactInquiry({
        name: 'A',
        email: 'a@b.com',
        subject: 'S',
        message: 'M',
      }),
    ).rejects.toThrow(/could not send your message/i);
  });
});
