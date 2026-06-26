export type AppView =
  | 'dashboard'
  | 'directory'
  | 'replace'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'faq'
  | 'status'
  | 'guides'
  | 'guide'
  | 'not-found'
  | 'wip';

/** Public URL slug overrides (canonical tool id → /bolt/{slug}). */
export const TOOL_SLUG_OVERRIDES: Record<string, string> = {
  'images-to-pdf': 'image-to-pdf',
};

/** Old URL slugs → canonical tool id. */
const LEGACY_SLUG_TO_TOOL_ID: Record<string, string> = {
  'jpg-to-pdf': 'images-to-pdf',
};

/** Shareable path: /bolt/merge, /bolt/image-to-pdf, /bolt/replace, … */
export function toolIdToSlug(toolId: string): string {
  return TOOL_SLUG_OVERRIDES[toolId] ?? toolId;
}

export function slugToToolId(slug: string, knownToolIds: ReadonlySet<string>): string | undefined {
  const legacyTool = LEGACY_SLUG_TO_TOOL_ID[slug];
  if (legacyTool && knownToolIds.has(legacyTool)) {
    return legacyTool;
  }
  for (const [toolId, publicSlug] of Object.entries(TOOL_SLUG_OVERRIDES)) {
    if (publicSlug === slug && knownToolIds.has(toolId)) {
      return toolId;
    }
  }
  if (knownToolIds.has(slug)) {
    return slug;
  }
  return undefined;
}

export function toolPath(toolId: string): string {
  return `/bolt/${toolIdToSlug(toolId)}`;
}

export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed;
}

export interface ParsedRoute {
  view: AppView;
  toolId?: string;
  /** Guide article slug for the 'guide' view. */
  slug?: string;
}

/** Old URLs → new /bolt/… paths (client-side redirect). */
export function legacyRedirectPath(
  pathname: string,
  knownToolIds: ReadonlySet<string>,
): string | null {
  const path = normalizePath(pathname);
  if (path === '/replace') {
    return '/bolt/replace';
  }
  if (path === '/compress') {
    return '/bolt/compress';
  }
  const legacyBolt = path.match(/^\/bolt\/([a-z0-9-]+)$/);
  if (legacyBolt) {
    const segment = legacyBolt[1];
    const toolId = slugToToolId(segment, knownToolIds);
    if (toolId) {
      const canonical = toolPath(toolId);
      if (canonical !== path) {
        return canonical;
      }
    }
  }
  const toolsMatch = path.match(/^\/tools\/([a-z0-9-]+)$/);
  if (toolsMatch) {
    const segment = toolsMatch[1];
    const toolId = slugToToolId(segment, knownToolIds) ?? (knownToolIds.has(segment) ? segment : null);
    if (toolId) {
      return toolPath(toolId);
    }
    return `/bolt/${segment}`;
  }
  return null;
}

export function parseRoute(pathname: string, knownToolIds: ReadonlySet<string>): ParsedRoute {
  const path = normalizePath(pathname);

  if (path === '/' || path === '') {
    return { view: 'dashboard' };
  }
  if (path === '/about') {
    return { view: 'about' };
  }
  if (path === '/contact') {
    return { view: 'contact' };
  }
  if (path === '/privacy') {
    return { view: 'privacy' };
  }
  if (path === '/terms') {
    return { view: 'terms' };
  }
  if (path === '/faq') {
    return { view: 'faq' };
  }
  if (path === '/status') {
    return { view: 'status' };
  }
  if (path === '/directory') {
    return { view: 'directory' };
  }
  if (path === '/guides') {
    return { view: 'guides' };
  }
  const guideMatch = path.match(/^\/guides\/([a-z0-9-]+)$/);
  if (guideMatch) {
    return { view: 'guide', slug: guideMatch[1] };
  }

  const boltMatch = path.match(/^\/bolt\/([a-z0-9-]+)$/);
  if (boltMatch) {
    const slug = boltMatch[1];
    const toolId = slugToToolId(slug, knownToolIds);
    if (!toolId) {
      return { view: 'not-found' };
    }
    if (toolId === 'replace') {
      return { view: 'replace' };
    }
    return { view: 'wip', toolId };
  }

  return { view: 'not-found' };
}

export function pageTitle(view: AppView, toolCleanName?: string | null): string {
  switch (view) {
    case 'dashboard':
      return 'PDFbolt — Online PDF tools';
    case 'directory':
      return 'All tools — PDFbolt';
    case 'replace':
      return 'Replace text in PDF — PDFbolt';
    case 'about':
      return 'About — PDFbolt';
    case 'contact':
      return 'Contact — PDFbolt';
    case 'privacy':
      return 'Privacy policy — PDFbolt';
    case 'terms':
      return 'Terms of use — PDFbolt';
    case 'faq':
      return 'Help & FAQ — PDFbolt';
    case 'status':
      return 'Service status — PDFbolt';
    case 'guides':
      return 'PDF Guides — PDFbolt';
    case 'guide':
      return toolCleanName ? `${toolCleanName} — PDFbolt` : 'PDF Guides — PDFbolt';
    case 'not-found':
      return 'Page not found — PDFbolt';
    case 'wip':
      return toolCleanName ? `${toolCleanName} — PDFbolt` : 'Tool — PDFbolt';
    default:
      return 'PDFbolt';
  }
}
