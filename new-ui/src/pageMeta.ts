const DEFAULT_DESCRIPTION =
  'Free online PDF tools — merge, split, compress, convert, replace text, and more. Files are processed securely and not stored after download.';

const SITE_NAME = 'PDFbolt';
/** Raster PNG for social crawlers; SVG kept at /og-image.svg as fallback. */
const DEFAULT_OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

function siteOrigin(): string {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SITE_URL?.trim() || 'https://mypdfbolt.shop';
  }
  return window.location.origin;
}

function setMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  const selector = `meta[${attribute}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export interface PageMetaOptions {
  title: string;
  description?: string;
  /** Pathname only, e.g. /bolt/merge */
  path?: string;
  ogImagePath?: string;
}

export function applyPageMeta(options: PageMetaOptions): void {
  const description = options.description?.trim() || DEFAULT_DESCRIPTION;
  const origin = siteOrigin();
  const pathname = options.path ?? window.location.pathname;
  const canonical = `${origin}${pathname}`;
  const imageUrl = `${origin}${options.ogImagePath ?? DEFAULT_OG_IMAGE_PATH}`;

  document.title = options.title;

  setMetaTag('name', 'description', description);
  setCanonical(canonical);

  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:site_name', SITE_NAME);
  setMetaTag('property', 'og:title', options.title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonical);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:image:type', 'image/png');
  setMetaTag('property', 'og:image:width', OG_IMAGE_WIDTH);
  setMetaTag('property', 'og:image:height', OG_IMAGE_HEIGHT);

  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', options.title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);
}

export function defaultPageDescription(): string {
  return DEFAULT_DESCRIPTION;
}
