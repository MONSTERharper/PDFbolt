import {
  postReplaceBatch,
  postContactInquiry,
  type MatchMode,
  type ApiReplaceScope,
  type ReplacePair,
} from './replaceApi';
import {
  postCompress,
  type CompressLevel,
  formatBytesHint,
  COMPRESS_LEVEL_OPTIONS,
  compressLevelHoverHint,
} from './compressApi';
import { postPdfTool, type PdfToolResult } from './toolsApi';

export type { ReplacePair, CompressLevel };

export interface ReplacePairWithStrict extends ReplacePair {
  strict: boolean;
}

export function mapMatchMode(ui: string): MatchMode {
  switch (ui) {
    case 'Case-insensitive':
      return 'caseInsensitive';
    case 'Whole word':
      return 'wholeWord';
    case 'Case-insensitive whole word':
      return 'caseInsensitiveWholeWord';
    default:
      return 'exact';
  }
}

export function mapReplaceScope(ui: string): ApiReplaceScope {
  switch (ui) {
    case 'First match only':
      return 'first';
    case 'Specific occurrence':
      return 'nth';
    default:
      return 'all';
  }
}

export async function serverReplacePdf(
  files: File[],
  pairs: ReplacePairWithStrict[],
  options: {
    matchMode: string;
    replaceScope: string;
    occurrenceIndex: number;
    preserveStyle: boolean;
    retainMetadata: boolean;
    pdfOpenPassword?: string;
    pdfPasswordsJson?: string;
  }
) {
  if (files.length === 0) {
    throw new Error('Choose at least one PDF file.');
  }
  const rules = pairs.map((p) => ({ find: p.find.trim(), replace: p.replace }));
  if (rules.some((p) => !p.find)) {
    throw new Error('Find text cannot be empty.');
  }
  const scope = mapReplaceScope(options.replaceScope);
  return postReplaceBatch({
    files,
    pairs: rules,
    matchMode: mapMatchMode(options.matchMode),
    replaceScope: scope,
    occurrenceIndex: scope === 'nth' ? options.occurrenceIndex : undefined,
    strict: pairs.every((p) => p.strict),
    preserveStyle: options.preserveStyle,
    retainMetadata: options.retainMetadata,
    pdfOpenPassword: options.pdfOpenPassword,
    pdfPasswordsJson: options.pdfPasswordsJson,
  });
}

export async function serverCompressPdf(
  file: File,
  level: CompressLevel,
  retainMetadata: boolean,
  pdfOpenPassword?: string,
  pdfPasswordsJson?: string,
) {
  return postCompress({ files: [file], level, retainMetadata, pdfOpenPassword, pdfPasswordsJson });
}

export { postContactInquiry };
export { formatBytesHint, COMPRESS_LEVEL_OPTIONS, compressLevelHoverHint };
export type { PdfToolResult };

export interface SignatureEntry {
  blob: Blob;
  placement: {
    pageNum: number;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ServerToolContext {
  file: File | null;
  extraFiles: File[];
  compareFile2: File | null;
  signatureBlob: Blob | null;
  signatures: SignatureEntry[];
  splitRange: string;
  deletePageStr: string;
  extractPageStr: string;
  orderStr: string;
  toolText: string;
  toolTitle: string;
  htmlInputMode: 'paste' | 'file';
  ocrLang: string;
  rotationAngle: number;
  rotationScope: string;
  pageNumFormat: string;
  pageNumSize: number;
  pageNumAlign: string;
  watermarkText: string;
  watermarkSize: number;
  watermarkAngle: number;
  watermarkOpacity: number;
  watermarkColor: string;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  metadataTitle: string;
  metadataAuthor: string;
  metadataSubject: string;
  metadataCreator: string;
  protectPass: string;
  unlockPassword: string;
  pdfOpenPassword: string;
  pdfPasswordsJson?: string;
  pdfaStandard: string;
  sigPageNum: number;
  sigX: number;
  sigY: number;
  sigW: number;
  sigH: number;
  jpgDpi: string;
  formsFlatten: boolean;
}

const OFFICE_FILE_TOOLS = new Set(['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf']);

const IMAGE_ONLY_TOOLS = new Set(['scan-to-pdf', 'images-to-pdf']);

function parseDpiLabel(raw: string): number {
  const match = raw.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 150;
}

export async function serverExecuteTool(toolId: string, ctx: ServerToolContext): Promise<PdfToolResult> {
  const form = new FormData();
  form.append('operation', toolId);

  if (IMAGE_ONLY_TOOLS.has(toolId)) {
    if (ctx.extraFiles.length === 0) {
      throw new Error('Upload at least one JPG or PNG image.');
    }
    for (const img of ctx.extraFiles) {
      form.append('files', img);
    }
  } else if (OFFICE_FILE_TOOLS.has(toolId)) {
    if (!ctx.file) {
      throw new Error('Choose an Office file first.');
    }
    form.append('file', ctx.file);
  } else if (toolId === 'html-to-pdf') {
    form.append('title', ctx.toolTitle?.trim() || 'Document');
    if (ctx.htmlInputMode === 'file') {
      if (!ctx.file) {
        throw new Error('Choose an HTML file first.');
      }
      form.append('file', ctx.file);
    } else {
      if (!ctx.toolText.trim()) {
        throw new Error('Enter HTML content first.');
      }
      form.append('text', ctx.toolText);
    }
  } else if (toolId === 'merge') {
    const mergeQueue = ctx.file ? [ctx.file, ...ctx.extraFiles] : [...ctx.extraFiles];
    if (mergeQueue.length < 2) {
      throw new Error('Select at least two PDF files to merge.');
    }
    for (const pdf of mergeQueue) {
      form.append('files', pdf);
    }
  } else if (toolId === 'compare-pdf') {
    if (!ctx.file || !ctx.compareFile2) {
      throw new Error('Select two PDF files to compare.');
    }
    form.append('files', ctx.file);
    form.append('files', ctx.compareFile2);
  } else {
    if (!ctx.file) {
      throw new Error('Choose a PDF file first.');
    }
    form.append('file', ctx.file);
  }

  if (toolId === 'split' || toolId === 'extract-pages') {
    form.append('pageRange', ctx.splitRange || ctx.extractPageStr);
  }
  if (toolId === 'remove-pages') {
    form.append('pageRange', ctx.deletePageStr);
  }
  if (toolId === 'organize-pdf') {
    form.append('pageOrder', ctx.orderStr);
  }
  if (toolId === 'ocr-pdf') {
    form.append('ocrLang', ctx.ocrLang);
  }
  if (toolId === 'pdf-to-jpg') {
    form.append('dpi', String(parseDpiLabel(ctx.jpgDpi)));
  }
  if (toolId === 'rotate-pdf') {
    form.append('angle', String(ctx.rotationAngle));
    form.append('rotationScope', ctx.rotationScope);
  }
  if (toolId === 'add-page-numbers') {
    form.append('pageNumberFormat', ctx.pageNumFormat);
    form.append('pageNumberSize', String(ctx.pageNumSize));
    form.append('pageNumberAlignment', ctx.pageNumAlign);
  }
  if (toolId === 'add-watermark') {
    form.append('watermarkText', ctx.watermarkText);
    form.append('watermarkSize', String(ctx.watermarkSize));
    form.append('watermarkRotation', String(ctx.watermarkAngle));
    form.append('watermarkOpacity', String(ctx.watermarkOpacity));
    form.append('watermarkColor', ctx.watermarkColor);
  }
  if (toolId === 'crop-pdf') {
    form.append('cropLeft', String(ctx.cropLeft));
    form.append('cropRight', String(ctx.cropRight));
    form.append('cropTop', String(ctx.cropTop));
    form.append('cropBottom', String(ctx.cropBottom));
  }
  if (toolId === 'edit-pdf') {
    form.append('metadataTitle', ctx.metadataTitle);
    form.append('metadataAuthor', ctx.metadataAuthor);
    form.append('metadataSubject', ctx.metadataSubject);
    form.append('metadataCreator', ctx.metadataCreator);
  }
  if (ctx.pdfPasswordsJson) {
    form.append('pdfPasswordsJson', ctx.pdfPasswordsJson);
  } else if (ctx.pdfOpenPassword?.trim()) {
    form.append('pdfPassword', ctx.pdfOpenPassword.trim());
  }
  if (toolId === 'pdf-to-pdfa') {
    form.append('pdfaStandard', ctx.pdfaStandard);
  }
  if (toolId === 'unlock-pdf') {
    const unlockPass = ctx.unlockPassword.trim() || ctx.pdfOpenPassword.trim();
    form.append('password', unlockPass);
  }
  if (toolId === 'protect-pdf') {
    form.append('password', ctx.protectPass);
    form.append('ownerPassword', ctx.protectPass);
  }
  if (toolId === 'sign-pdf') {
    const signatureEntries =
      ctx.signatures.length > 0
        ? ctx.signatures
        : ctx.signatureBlob
          ? [
              {
                blob: ctx.signatureBlob,
                placement: {
                  pageNum: ctx.sigPageNum,
                  x: ctx.sigX,
                  y: ctx.sigY,
                  w: ctx.sigW,
                  h: ctx.sigH,
                },
              },
            ]
          : [];
    if (signatureEntries.length === 0 || signatureEntries.some((entry) => entry.blob.size < 80)) {
      throw new Error('Draw a signature on the canvas before signing.');
    }
    if (signatureEntries.length === 1 && ctx.signatures.length === 0) {
      form.append('signature', signatureEntries[0].blob, 'signature.png');
      form.append('sigPage', String(signatureEntries[0].placement.pageNum));
      form.append('sigX', String(signatureEntries[0].placement.x));
      form.append('sigY', String(signatureEntries[0].placement.y));
      form.append('sigWidth', String(signatureEntries[0].placement.w));
      form.append('sigHeight', String(signatureEntries[0].placement.h));
    } else {
      form.append(
        'signaturesJson',
        JSON.stringify(
          signatureEntries.map((entry) => ({
            pageNum: entry.placement.pageNum,
            x: entry.placement.x,
            y: entry.placement.y,
            width: entry.placement.w,
            height: entry.placement.h,
          })),
        ),
      );
      signatureEntries.forEach((entry, index) => {
        form.append('signatures', entry.blob, `signature-${index}.png`);
      });
    }
  }
  if (toolId === 'pdf-forms') {
    form.append('formsFlatten', String(ctx.formsFlatten));
  }
  return postPdfTool(form);
}
