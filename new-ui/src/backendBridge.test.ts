import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mapMatchMode,
  mapReplaceScope,
  serverCompressPdf,
  serverExecuteTool,
  serverReplacePdf,
} from './backendBridge';
import { emptyServerToolContext, mockPdfFile, mockPngFile } from './test/fixtures';
import { formDataEntries } from './test/fetchMock';

const postPdfTool = vi.hoisted(() => vi.fn());
const postReplaceBatch = vi.hoisted(() => vi.fn());
const postCompress = vi.hoisted(() => vi.fn());

vi.mock('./toolsApi', () => ({ postPdfTool }));
vi.mock('./replaceApi', () => ({ postReplaceBatch, postContactInquiry: vi.fn() }));
vi.mock('./compressApi', () => ({
  postCompress,
  formatBytesHint: (n: number) => `${n}`,
  COMPRESS_LEVEL_OPTIONS: [],
  compressLevelHoverHint: () => '',
}));

describe('mapMatchMode', () => {
  it.each([
    ['Exact', 'exact'],
    ['Case-insensitive', 'caseInsensitive'],
    ['Whole word', 'wholeWord'],
    ['Case-insensitive whole word', 'caseInsensitiveWholeWord'],
    ['Unknown', 'exact'],
  ] as const)('maps %s to %s', (ui, api) => {
    expect(mapMatchMode(ui)).toBe(api);
  });
});

describe('mapReplaceScope', () => {
  it.each([
    ['All matches', 'all'],
    ['First match only', 'first'],
    ['Specific occurrence', 'nth'],
    ['Other', 'all'],
  ] as const)('maps %s to %s', (ui, api) => {
    expect(mapReplaceScope(ui)).toBe(api);
  });
});

describe('serverReplacePdf', () => {
  beforeEach(() => {
    postReplaceBatch.mockResolvedValue({
      filename: 'out.pdf',
      blob: new Blob(),
      matches: '1',
      matchesFound: '1',
      stylePreserved: '0',
      styleFallback: '0',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty find text', async () => {
    await expect(
      serverReplacePdf([mockPdfFile()], [{ find: '  ', replace: 'x', strict: false }], {
        matchMode: 'Exact',
        replaceScope: 'All matches',
        occurrenceIndex: 1,
        preserveStyle: true,
        retainMetadata: true,
      }),
    ).rejects.toThrow('Find text cannot be empty');
  });

  it('passes nth occurrence only for specific occurrence scope', async () => {
    await serverReplacePdf([mockPdfFile()], [{ find: 'a', replace: 'b', strict: true }], {
      matchMode: 'Exact',
      replaceScope: 'Specific occurrence',
      occurrenceIndex: 3,
      preserveStyle: false,
      retainMetadata: true,
    });

    expect(postReplaceBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        replaceScope: 'nth',
        occurrenceIndex: 3,
        matchMode: 'exact',
        strict: true,
      }),
    );
  });
});

describe('serverCompressPdf', () => {
  beforeEach(() => {
    postCompress.mockResolvedValue({
      filename: 'c.pdf',
      blob: new Blob(),
      originalBytes: '100',
      outputBytes: '80',
      savedBytes: '20',
      savedPercent: '20',
      pages: '1',
      imagesProcessed: '0',
    });
  });

  it('delegates to postCompress', async () => {
    const file = mockPdfFile();
    await serverCompressPdf(file, 'strong', false);
    expect(postCompress).toHaveBeenCalledWith({
      files: [file],
      level: 'strong',
      retainMetadata: false,
    });
  });
});

describe('serverExecuteTool', () => {
  beforeEach(() => {
    postPdfTool.mockImplementation(async (form: FormData) => {
      void form;
      return {
        kind: 'file' as const,
        blob: new Blob(['%PDF']),
        filename: 'bolt.pdf',
        contentType: 'application/pdf',
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const liveTools: { id: string; setup?: (ctx: ReturnType<typeof emptyServerToolContext>) => void }[] = [
    {
      id: 'merge',
      setup: (ctx) => {
        ctx.file = null;
        ctx.extraFiles = [mockPdfFile('a.pdf'), mockPdfFile('b.pdf')];
      },
    },
    { id: 'split', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'remove-pages', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'extract-pages', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'organize-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'images-to-pdf', setup: (ctx) => { ctx.extraFiles = [mockPngFile()]; } },
    { id: 'repair-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'pdf-to-jpg', setup: (ctx) => { ctx.file = mockPdfFile(); ctx.jpgDpi = '72 DPI'; } },
    { id: 'rotate-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'add-page-numbers', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'add-watermark', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'crop-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'edit-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'pdf-forms', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'unlock-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    { id: 'protect-pdf', setup: (ctx) => { ctx.file = mockPdfFile(); } },
    {
      id: 'sign-pdf',
      setup: (ctx) => {
        ctx.file = mockPdfFile();
        ctx.signatureBlob = new Blob([new Uint8Array(120)], { type: 'image/png' });
      },
    },
  ];

  it.each(liveTools)('builds form for live tool $id', async ({ id, setup }) => {
    const ctx = emptyServerToolContext();
    setup?.(ctx);
    await serverExecuteTool(id, ctx);
    expect(postPdfTool).toHaveBeenCalled();
    const form = postPdfTool.mock.calls.at(-1)?.[0] as FormData;
    const entries = formDataEntries(form);
    expect(entries.operation).toEqual([id]);
  });

  it('merge requires at least two pdfs', async () => {
    const ctx = emptyServerToolContext();
    ctx.extraFiles = [mockPdfFile()];
    await expect(serverExecuteTool('merge', ctx)).rejects.toThrow(
      'at least two PDF',
    );
  });

  it('requires pdf file for single-file tools', async () => {
    await expect(serverExecuteTool('split', emptyServerToolContext())).rejects.toThrow(
      'Choose a PDF file',
    );
  });

  it('images-to-pdf requires images', async () => {
    await expect(serverExecuteTool('images-to-pdf', emptyServerToolContext())).rejects.toThrow(
      'JPG or PNG',
    );
  });

  it('sign-pdf rejects tiny signature blob', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = mockPdfFile();
    ctx.signatureBlob = new Blob([new Uint8Array([1, 2, 3])]);
    await expect(serverExecuteTool('sign-pdf', ctx)).rejects.toThrow('signature');
  });

  it('pdf-forms sends formsFlatten flag', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = mockPdfFile();
    ctx.formsFlatten = false;
    await serverExecuteTool('pdf-forms', ctx);
    const entries = formDataEntries(postPdfTool.mock.calls.at(-1)?.[0] as FormData);
    expect(entries.formsFlatten).toEqual(['false']);
  });

  it('merge sends all pdfs under files field in order', async () => {
    const ctx = emptyServerToolContext();
    ctx.extraFiles = [mockPdfFile('first.pdf'), mockPdfFile('second.pdf')];
    await serverExecuteTool('merge', ctx);
    const form = postPdfTool.mock.calls.at(-1)?.[0] as FormData;
    const entries = formDataEntries(form);
    expect(entries.files).toEqual(['file:first.pdf', 'file:second.pdf']);
  });

  it('rotate includes angle and scope', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = mockPdfFile();
    ctx.rotationAngle = 180;
    ctx.rotationScope = 'Odd';
    await serverExecuteTool('rotate-pdf', ctx);
    const entries = formDataEntries(postPdfTool.mock.calls.at(-1)?.[0] as FormData);
    expect(entries.angle).toEqual(['180']);
    expect(entries.rotationScope).toEqual(['Odd']);
  });

  it('pdf-to-jpg parses dpi from label', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = mockPdfFile();
    ctx.jpgDpi = '300 DPI export';
    await serverExecuteTool('pdf-to-jpg', ctx);
    const entries = formDataEntries(postPdfTool.mock.calls.at(-1)?.[0] as FormData);
    expect(entries.dpi).toEqual(['300']);
  });

  it('word-to-pdf sends office file', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = new File(['x'], 'sample.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await serverExecuteTool('word-to-pdf', ctx);
    const form = postPdfTool.mock.calls.at(-1)?.[0] as FormData;
    const entries = formDataEntries(form);
    expect(entries.operation).toEqual(['word-to-pdf']);
    expect(form.get('file')).toBeTruthy();
  });

  it('html-to-pdf paste sends text and title', async () => {
    const ctx = emptyServerToolContext();
    ctx.toolText = '<p>Hi</p>';
    ctx.htmlInputMode = 'paste';
    await serverExecuteTool('html-to-pdf', ctx);
    const entries = formDataEntries(postPdfTool.mock.calls.at(-1)?.[0] as FormData);
    expect(entries.operation).toEqual(['html-to-pdf']);
    expect(entries.text).toEqual(['<p>Hi</p>']);
    expect(entries.title).toEqual(['Title']);
  });

  it('html-to-pdf file mode sends html file', async () => {
    const ctx = emptyServerToolContext();
    ctx.htmlInputMode = 'file';
    ctx.file = new File(['<h1>Page</h1>'], 'page.html', { type: 'text/html' });
    await serverExecuteTool('html-to-pdf', ctx);
    const form = postPdfTool.mock.calls.at(-1)?.[0] as FormData;
    expect(formDataEntries(form).operation).toEqual(['html-to-pdf']);
    expect(form.get('file')).toBeTruthy();
  });

  it('powerpoint-to-pdf sends office file', async () => {
    const ctx = emptyServerToolContext();
    ctx.file = new File(['x'], 'deck.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    await serverExecuteTool('powerpoint-to-pdf', ctx);
    const form = postPdfTool.mock.calls.at(-1)?.[0] as FormData;
    expect(formDataEntries(form).operation).toEqual(['powerpoint-to-pdf']);
    expect(form.get('file')).toBeTruthy();
  });
});
