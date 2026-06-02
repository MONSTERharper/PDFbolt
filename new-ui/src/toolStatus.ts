/**
 * Tools with partial backend support — shown as WIP and cannot be executed.
 * Replace and compress use dedicated endpoints and are always live.
 */
export const WIP_TOOL_IDS = new Set<string>(['ocr-pdf']);

export const WIP_TOOL_REASONS: Record<string, string> = {
  'ocr-pdf':
    'Full OCR (searchable text from scans) is in development. We are integrating a proper OCR engine.',
};

export function isToolLive(toolId: string): boolean {
  return !WIP_TOOL_IDS.has(toolId);
}

export function toolStatus(toolId: string): 'live' | 'wip' {
  return isToolLive(toolId) ? 'live' : 'wip';
}

export function wipReason(toolId: string): string {
  return (
    WIP_TOOL_REASONS[toolId] ??
    'This tool is in development and will be enabled in a future release.'
  );
}
