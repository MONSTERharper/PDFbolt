import { useEffect, useState } from 'react';
import {
  ADSENSE_CLIENT as BUILD_CLIENT,
  ADSENSE_ENABLED as BUILD_ENABLED,
  ADSENSE_SLOTS as BUILD_SLOTS,
  ADSENSE_TEST_MODE,
} from './adsenseConfig';

export interface ResolvedAdsenseConfig {
  enabled: boolean;
  client: string;
  bannerSlot: string;
  sidebarSlot: string;
  loaded: boolean;
}

const BUILD_FALLBACK: ResolvedAdsenseConfig = {
  enabled: BUILD_ENABLED && Boolean(BUILD_SLOTS.banner || BUILD_SLOTS.sidebar),
  client: BUILD_CLIENT,
  bannerSlot: BUILD_SLOTS.banner,
  sidebarSlot: BUILD_SLOTS.sidebar || BUILD_SLOTS.banner,
  loaded: true,
};

export function shouldShowLiveAd(
  config: ResolvedAdsenseConfig,
  placement: 'banner' | 'sidebar',
): boolean {
  if (!config.enabled || !config.loaded) {
    return false;
  }
  const slot = placement === 'banner' ? config.bannerSlot : config.sidebarSlot || config.bannerSlot;
  return Boolean(slot.trim());
}

export function slotForResolvedConfig(
  config: ResolvedAdsenseConfig,
  placement: 'banner' | 'sidebar',
): string {
  if (placement === 'banner') {
    return config.bannerSlot;
  }
  return config.sidebarSlot || config.bannerSlot;
}

export function useAdsenseConfig(): ResolvedAdsenseConfig {
  const [config, setConfig] = useState<ResolvedAdsenseConfig>({
    ...BUILD_FALLBACK,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    void fetch('/api/public/ads-config')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { enabled?: boolean; client?: string; bannerSlot?: string; sidebarSlot?: string } | null) => {
        if (cancelled) return;
        if (!payload) {
          setConfig({ ...BUILD_FALLBACK, loaded: true });
          return;
        }
        const bannerSlot = (payload.bannerSlot || BUILD_SLOTS.banner || '').trim();
        const sidebarSlot = (payload.sidebarSlot || BUILD_SLOTS.sidebar || bannerSlot).trim();
        const client = (payload.client || BUILD_CLIENT).trim();
        const enabled = payload.enabled !== false && Boolean(client);
        setConfig({
          enabled,
          client,
          bannerSlot,
          sidebarSlot: sidebarSlot || bannerSlot,
          loaded: true,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({ ...BUILD_FALLBACK, loaded: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}

export { ADSENSE_TEST_MODE };
