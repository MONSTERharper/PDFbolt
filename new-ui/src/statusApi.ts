export interface HealthDependencies {
  libreOffice: boolean;
  ghostscript: boolean;
  verapdf: boolean;
  pdfaValidationEnabled: boolean;
  heic?: boolean;
  ready: boolean;
}

export interface HealthResponse {
  status: string;
  version: string;
  suite: string;
  tool: string;
  timestamp: string;
  dependencies: HealthDependencies;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Could not load service status.');
  }
  return res.json() as Promise<HealthResponse>;
}
