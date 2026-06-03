/** Google AdSense publisher client (from AdSense → Account → Account information). */
export const ADSENSE_CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-3054286166063522';

/**
 * Build-time opt-in/out. Production also reads slot IDs from GET /api/public/ads-config
 * (set ADSENSE_BANNER_SLOT in server .env — no UI rebuild needed).
 */
export const ADSENSE_ENABLED =
  import.meta.env.VITE_ADSENSE_ENABLED === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_ADSENSE_ENABLED !== 'false');

/** Google test ads (use only while debugging). */
export const ADSENSE_TEST_MODE = import.meta.env.VITE_ADSENSE_TEST === 'true';

/**
 * Create display ad units in AdSense → Ads → By ad unit, then set slot IDs here
 * (or in .env as VITE_ADSENSE_BANNER_SLOT / VITE_ADSENSE_SIDEBAR_SLOT).
 */
export const ADSENSE_SLOTS = {
  banner: (import.meta.env.VITE_ADSENSE_BANNER_SLOT || '').trim(),
  sidebar: (
    import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT ||
    import.meta.env.VITE_ADSENSE_BANNER_SLOT ||
    ''
  ).trim(),
};

export const hasAdSenseSlots = Boolean(ADSENSE_SLOTS.banner || ADSENSE_SLOTS.sidebar);

export function slotForPlacement(placement: 'banner' | 'sidebar'): string {
  if (placement === 'banner') {
    return ADSENSE_SLOTS.banner;
  }
  return ADSENSE_SLOTS.sidebar || ADSENSE_SLOTS.banner;
}

/** Live AdSense only when explicitly enabled and the placement has a slot id. */
export function shouldUseLiveAdSense(placement: 'banner' | 'sidebar'): boolean {
  return ADSENSE_ENABLED && Boolean(slotForPlacement(placement));
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/** Load adsbygoogle.js once. */
export function loadAdSenseScript(client: string = ADSENSE_CLIENT): Promise<void> {
  if (!client.trim()) {
    return Promise.resolve();
  }
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  if (document.querySelector('script[data-pdfbolt-adsense]')) {
    return scriptLoadPromise ?? Promise.resolve();
  }

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.pdfboltAdsense = 'true';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google AdSense script'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export function pushAdSense(): void {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch {
    // AdSense may throw if blocked or already initialized for this slot.
  }
}
