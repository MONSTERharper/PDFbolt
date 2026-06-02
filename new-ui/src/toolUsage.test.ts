import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_POPULAR_TOOL_IDS,
  fetchPopularToolIds,
  getRecentToolIds,
  mergePopularLists,
  recordLocalToolUse,
} from './toolUsage';

describe('toolUsage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('tracks recent tools locally', () => {
    recordLocalToolUse('merge');
    recordLocalToolUse('compress');
    recordLocalToolUse('merge');
    expect(getRecentToolIds(3)).toEqual(['merge', 'compress']);
  });

  it('falls back when popular API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const ids = await fetchPopularToolIds(8);
    expect(ids).toEqual([...DEFAULT_POPULAR_TOOL_IDS]);
  });

  it('merges server, recent, and defaults without duplicates', () => {
    const merged = mergePopularLists(['merge', 'split'], ['compress', 'merge'], 6);
    expect(merged).toEqual(['merge', 'split', 'compress', 'replace', 'rotate-pdf', 'protect-pdf']);
  });
});
