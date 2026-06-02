/** Baked in at build time from new-ui/package.json (should match pom.xml / server). */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION as string;

export interface HealthPayload {
  status?: string;
  version?: string;
}

export async function fetchServerVersion(): Promise<string | null> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as HealthPayload;
    return payload.version?.trim() || null;
  } catch {
    return null;
  }
}

export function formatBoltVersion(version: string): string {
  return `v${version.replace(/^v/i, '')}`;
}
