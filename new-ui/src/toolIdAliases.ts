/** Legacy API / stats ids mapped to the current canonical tool id. */
export const LEGACY_TOOL_ID_ALIASES: Record<string, string> = {
  'jpg-to-pdf': 'images-to-pdf',
};

export function canonicalToolId(raw: string): string {
  const normalized = raw.trim().toLowerCase().replace(/_/g, '-');
  if (!normalized) {
    return normalized;
  }
  return LEGACY_TOOL_ID_ALIASES[normalized] ?? normalized;
}
