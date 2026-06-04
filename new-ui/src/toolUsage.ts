import { canonicalToolId } from './toolIdAliases';

/** Default home spotlight when no server stats exist yet. */
export const DEFAULT_POPULAR_TOOL_IDS = [
  'replace',
  'merge',
  'split',
  'compress',
  'rotate-pdf',
  'protect-pdf',
  'unlock-pdf',
  'pdf-to-jpg',
] as const;

const LOCAL_STORAGE_KEY = 'pdfbolt-tool-usage-v1';
const MAX_RECENT = 6;

interface LocalToolUsage {
  counts: Record<string, number>;
  recent: string[];
}

function readLocal(): LocalToolUsage {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return { counts: {}, recent: [] };
    }
    const parsed = JSON.parse(raw) as LocalToolUsage;
    return {
      counts: parsed.counts ?? {},
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return { counts: {}, recent: [] };
  }
}

function writeLocal(data: LocalToolUsage): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // private mode / quota — ignore
  }
}

export function recordLocalToolUse(toolId: string): void {
  const id = canonicalToolId(toolId);
  if (!id) {
    return;
  }
  const data = readLocal();
  data.counts[id] = (data.counts[id] ?? 0) + 1;
  data.recent = [id, ...data.recent.filter((entry) => entry !== id)].slice(0, MAX_RECENT);
  writeLocal(data);
}

export function getRecentToolIds(limit = 4): string[] {
  return readLocal().recent.slice(0, Math.max(1, limit));
}

export async function fetchPopularToolIds(limit = 8): Promise<string[]> {
  try {
    const response = await fetch(`/api/tools/popular?limit=${limit}`);
    if (!response.ok) {
      return [...DEFAULT_POPULAR_TOOL_IDS];
    }
    const payload = (await response.json()) as {
      tools?: { toolId: string; count: number }[];
    };
    const ids = (payload.tools ?? [])
      .map((t) => canonicalToolId(t.toolId))
      .filter(Boolean);
    return ids.length > 0 ? ids : [...DEFAULT_POPULAR_TOOL_IDS];
  } catch {
    return [...DEFAULT_POPULAR_TOOL_IDS];
  }
}

/** Client-only tools: tell the server after success (optional, rate-limited). */
export async function notifyServerToolUse(toolId: string): Promise<void> {
  try {
    const body = new URLSearchParams({ toolId });
    await fetch('/api/tools/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch {
    // non-fatal
  }
}

export function trackToolRunAnalytics(toolId: string): void {
  const id = toolId.trim().toLowerCase().replace(/_/g, '-');
  if (!id) {
    return;
  }
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'tool_run', { tool_id: id });
  }
}

export function onToolRunSuccess(toolId: string, options?: { syncServer?: boolean }): void {
  recordLocalToolUse(toolId);
  trackToolRunAnalytics(toolId);
  if (options?.syncServer) {
    void notifyServerToolUse(toolId);
  }
}

export function mergePopularLists(serverIds: string[], localRecent: string[], limit = 8): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...serverIds, ...localRecent, ...DEFAULT_POPULAR_TOOL_IDS]) {
    const id = canonicalToolId(raw);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    merged.push(id);
    if (merged.length >= limit) {
      break;
    }
  }
  return merged;
}
