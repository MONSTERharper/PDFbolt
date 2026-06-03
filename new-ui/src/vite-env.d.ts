/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_ENABLED?: string;
  readonly VITE_ADSENSE_BANNER_SLOT?: string;
  readonly VITE_ADSENSE_SIDEBAR_SLOT?: string;
  readonly VITE_ADSENSE_TEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
