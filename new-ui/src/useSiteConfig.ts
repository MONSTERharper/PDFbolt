import { useEffect, useState } from 'react';

export interface SiteLimits {
  maxPages: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  maxTotalUploadBytes: number;
  maxFileSizeLabel: string;
  maxTotalUploadLabel: string;
}

export interface SiteConfig {
  supportEmail: string;
  limits: SiteLimits;
}

const DEFAULT_LIMITS: SiteLimits = {
  maxPages: 250,
  maxFiles: 10,
  maxFileSizeBytes: 26_214_400,
  maxTotalUploadBytes: 104_857_600,
  maxFileSizeLabel: '25 MB',
  maxTotalUploadLabel: '100 MB',
};

const DEFAULT_CONFIG: SiteConfig = {
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL?.trim() || '',
  limits: DEFAULT_LIMITS,
};

let cached: SiteConfig | null = null;

export async function fetchSiteConfig(): Promise<SiteConfig> {
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch('/api/public/site-config');
    if (!response.ok) {
      return DEFAULT_CONFIG;
    }
    const payload = (await response.json()) as Partial<SiteConfig>;
    cached = {
      supportEmail: (payload.supportEmail || DEFAULT_CONFIG.supportEmail).trim(),
      limits: { ...DEFAULT_LIMITS, ...(payload.limits as Partial<SiteLimits>) },
    };
    return cached;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    void fetchSiteConfig().then(setConfig);
  }, []);
  return config;
}
