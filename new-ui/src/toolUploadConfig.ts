import { canonicalToolId } from './toolIdAliases';

export type ToolUploadKind =
  | 'single-pdf'
  | 'multi-pdf'
  | 'dual-pdf'
  | 'multi-image'
  | 'office-file'
  | 'html-content'
  | 'text-content';

export type HtmlInputMode = 'paste' | 'file';

const KIND_BY_TOOL: Record<string, ToolUploadKind> = {
  merge: 'multi-pdf',
  'compare-pdf': 'dual-pdf',
  'scan-to-pdf': 'multi-image',
  'images-to-pdf': 'multi-image',
  'word-to-pdf': 'office-file',
  'powerpoint-to-pdf': 'office-file',
  'excel-to-pdf': 'office-file',
  'html-to-pdf': 'html-content',
};

export function getToolUploadKind(toolId: string): ToolUploadKind {
  return KIND_BY_TOOL[canonicalToolId(toolId)] ?? 'single-pdf';
}

export function toolNeedsPdfFile(toolId: string): boolean {
  const kind = getToolUploadKind(toolId);
  return kind === 'single-pdf' || kind === 'dual-pdf';
}

export function toolInputReady(
  toolId: string,
  ctx: {
    file: File | null;
    extraFiles: File[];
    compareFile2: File | null;
    toolText: string;
    htmlInputMode?: HtmlInputMode;
  },
): boolean {
  switch (getToolUploadKind(toolId)) {
    case 'multi-pdf':
      return ctx.extraFiles.length >= 2;
    case 'multi-image':
      return ctx.extraFiles.length >= 1;
    case 'dual-pdf':
      return Boolean(ctx.file && ctx.compareFile2);
    case 'html-content':
      return ctx.htmlInputMode === 'file'
        ? Boolean(ctx.file)
        : ctx.toolText.trim().length > 0;
    case 'text-content':
      return ctx.toolText.trim().length > 0;
    default:
      return Boolean(ctx.file);
  }
}
