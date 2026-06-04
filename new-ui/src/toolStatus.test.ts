import { describe, expect, it } from 'vitest';
import {
  WIP_TOOL_IDS,
  isToolLive,
  toolStatus,
  wipReason,
} from './toolStatus';

const LIVE_TOOLS = [
  'merge',
  'split',
  'compress',
  'replace',
  'rotate-pdf',
  'protect-pdf',
  'sign-pdf',
  'redact-pdf',
  'pdf-to-jpg',
  'images-to-pdf',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
  'html-to-pdf',
  'compare-pdf',
  'pdf-to-pdfa',
  'pdf-to-dxf',
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
];

describe('toolStatus', () => {
  it.each(LIVE_TOOLS)('marks %s as live', (toolId) => {
    expect(isToolLive(toolId)).toBe(true);
    expect(toolStatus(toolId)).toBe('live');
    expect(WIP_TOOL_IDS.has(toolId)).toBe(false);
  });

  it.each([...WIP_TOOL_IDS])('marks %s as wip', (toolId) => {
    expect(isToolLive(toolId)).toBe(false);
    expect(toolStatus(toolId)).toBe('wip');
    expect(wipReason(toolId).length).toBeGreaterThan(10);
  });

  it('returns generic wip reason for unknown ids', () => {
    expect(wipReason('unknown-tool')).toContain('in development');
  });
});
