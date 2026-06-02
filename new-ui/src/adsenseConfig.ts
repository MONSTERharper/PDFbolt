/** Google AdSense publisher client (from AdSense → Account → Account information). */
export const ADSENSE_CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-3054286166063522';

/**
 * Create display ad units in AdSense → Ads → By ad unit, then set slot IDs here
 * (or in .env as VITE_ADSENSE_BANNER_SLOT / VITE_ADSENSE_SIDEBAR_SLOT).
 */
export const ADSENSE_SLOTS = {
  banner: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '',
  sidebar:
    import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT ||
    import.meta.env.VITE_ADSENSE_BANNER_SLOT ||
    '',
};

export const hasAdSenseSlots = Boolean(ADSENSE_SLOTS.banner || ADSENSE_SLOTS.sidebar);

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function pushAdSense(): void {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch {
    // AdSense may throw if blocked or already initialized for this slot.
  }
}
