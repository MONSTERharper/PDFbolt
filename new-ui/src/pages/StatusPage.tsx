import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchHealth, type HealthResponse } from '../statusApi';

interface StatusPageProps {
  onBack: () => void;
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wide ${
          ok ? 'text-emerald-700' : 'text-amber-800'
        }`}
      >
        {ok ? <CheckCircle2 size={14} aria-hidden /> : <AlertCircle size={14} aria-hidden />}
        {ok ? 'Available' : 'Unavailable'}
      </span>
    </li>
  );
}

export function StatusPage({ onBack }: StatusPageProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchHealth();
        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Status could not be loaded right now. Please try again in a moment.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deps = health?.dependencies;
  const overallOk = health?.status === 'ok' && deps?.ready;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-[#FF3300]"
      >
        ← Back
      </button>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#FF3300]">
          <Activity size={22} aria-hidden />
          <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Service status</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#141414]">Is PDFbolt running?</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Live check of this server. This page does not include your uploads — only whether core PDF
          tools can run.
        </p>
      </header>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Checking…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          {error}
        </p>
      )}

      {health && (
        <div className="space-y-6">
          <div
            className={`rounded-xl border-2 p-5 ${
              overallOk
                ? 'border-emerald-300 bg-emerald-50/80'
                : 'border-amber-300 bg-amber-50/80'
            }`}
          >
            <p className="text-lg font-bold text-[#141414]">
              {overallOk ? 'All core services are up' : 'Some services need attention'}
            </p>
            <p className="text-xs text-gray-600 mt-1 font-mono">
              Version {health.version} · updated {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>

          <section className="bg-white border border-[#141414]/15 rounded-xl p-6 shadow-sm">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#FF3300] font-bold mb-3">
              Dependencies
            </h2>
            <ul>
              <StatusRow label="LibreOffice (Office & HTML → PDF)" ok={Boolean(deps?.libreOffice)} />
              <StatusRow label="Ghostscript (PDF/A & compression)" ok={Boolean(deps?.ghostscript)} />
              <StatusRow
                label={
                  deps?.pdfaValidationEnabled
                    ? 'veraPDF (PDF/A validation)'
                    : 'veraPDF (validation disabled)'
                }
                ok={!deps?.pdfaValidationEnabled || Boolean(deps?.verapdf)}
              />
              <StatusRow label="HEIC / HEIF images (Image → PDF)" ok={Boolean(deps?.heic)} />
            </ul>
            {!deps?.heic && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                HEIC photos from iPhones need ImageMagick on the server. JPEG and PNG always work.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
