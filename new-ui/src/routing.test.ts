import { describe, expect, it } from 'vitest';
import {
  legacyRedirectPath,
  parseRoute,
  slugToToolId,
  toolIdToSlug,
  toolPath,
} from './routing';

const KNOWN = new Set(['merge', 'compress', 'replace', 'images-to-pdf']);

describe('routing', () => {
  it('maps images-to-pdf to image-to-pdf slug', () => {
    expect(toolIdToSlug('images-to-pdf')).toBe('image-to-pdf');
    expect(toolPath('images-to-pdf')).toBe('/bolt/image-to-pdf');
    expect(slugToToolId('image-to-pdf', KNOWN)).toBe('images-to-pdf');
  });

  it('builds /bolt paths for all tools', () => {
    expect(toolPath('merge')).toBe('/bolt/merge');
    expect(toolPath('replace')).toBe('/bolt/replace');
    expect(toolPath('compress')).toBe('/bolt/compress');
  });

  it('parses /status', () => {
    expect(parseRoute('/status', KNOWN)).toEqual({ view: 'status' });
  });

  it('parses /bolt routes', () => {
    expect(parseRoute('/bolt/merge', KNOWN)).toEqual({ view: 'wip', toolId: 'merge' });
    expect(parseRoute('/bolt/replace', KNOWN)).toEqual({ view: 'replace' });
    expect(parseRoute('/bolt/image-to-pdf', KNOWN)).toEqual({ view: 'wip', toolId: 'images-to-pdf' });
  });

  it('redirects legacy paths', () => {
    expect(legacyRedirectPath('/replace', KNOWN)).toBe('/bolt/replace');
    expect(legacyRedirectPath('/compress', KNOWN)).toBe('/bolt/compress');
    expect(legacyRedirectPath('/tools/merge', KNOWN)).toBe('/bolt/merge');
    expect(legacyRedirectPath('/tools/jpg-to-pdf', KNOWN)).toBe('/bolt/image-to-pdf');
    expect(legacyRedirectPath('/bolt/jpg-to-pdf', KNOWN)).toBe('/bolt/image-to-pdf');
  });

  it('returns not-found for unknown bolt slug', () => {
    expect(parseRoute('/bolt/not-a-tool', KNOWN).view).toBe('not-found');
  });
});
