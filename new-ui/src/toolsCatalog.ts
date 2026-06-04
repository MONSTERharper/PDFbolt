import { toolIdToSlug, toolPath } from './routing';

/** Internal tool ids (matches backend operations + UI). */
export const BOLT_TOOL_IDS = [
  'merge',
  'split',
  'remove-pages',
  'extract-pages',
  'organize-pdf',
  'scan-to-pdf',
  'compress',
  'repair-pdf',
  'ocr-pdf',
  'images-to-pdf',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
  'html-to-pdf',
  'pdf-to-jpg',
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'pdf-to-pdfa',
  'pdf-to-dxf',
  'replace',
  'rotate-pdf',
  'add-page-numbers',
  'add-watermark',
  'crop-pdf',
  'edit-pdf',
  'pdf-forms',
  'unlock-pdf',
  'protect-pdf',
  'sign-pdf',
  'redact-pdf',
  'compare-pdf',
] as const;

export const STATIC_SITE_PATHS = [
  '/',
  '/directory',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
] as const;

export function allBoltToolPaths(): string[] {
  return BOLT_TOOL_IDS.map((id) => toolPath(id));
}

export function toolSlug(toolId: string): string {
  return toolIdToSlug(toolId);
}
