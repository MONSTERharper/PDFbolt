import { vi } from 'vitest';

export function formDataEntries(form: FormData): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  form.forEach((value, key) => {
    const text =
      typeof value === 'object' && value !== null && 'name' in value && typeof (value as File).name === 'string'
        ? `file:${(value as File).name}`
        : value instanceof Blob
          ? `blob:${value.size}`
          : String(value);
    if (!out[key]) {
      out[key] = [];
    }
    out[key].push(text);
  });
  return out;
}

export function mockPdfResponse(
  body: Blob | ArrayBuffer = new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
  options?: {
    status?: number;
    contentType?: string;
    disposition?: string;
    headers?: Record<string, string>;
  },
): Response {
  const status = options?.status ?? 200;
  const headers = new Headers({
    'content-type': options?.contentType ?? 'application/pdf',
    ...(options?.disposition
      ? { 'content-disposition': options.disposition }
      : {}),
    ...options?.headers,
  });
  return new Response(body, { status, headers });
}

export function mockJsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function stubFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>,
): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
      Promise.resolve(handler(input, init)),
    ),
  );
}
