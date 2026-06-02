import { useEffect, useState } from 'react';
import { APP_VERSION, fetchServerVersion } from './appVersion';

export function useAppVersion() {
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchServerVersion().then((version) => {
      if (!cancelled) {
        setServerVersion(version);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayVersion = serverVersion ?? APP_VERSION;
  const versionMismatch =
    Boolean(serverVersion) && serverVersion !== APP_VERSION;

  return {
    buildVersion: APP_VERSION,
    serverVersion,
    displayVersion,
    versionMismatch,
  };
}
