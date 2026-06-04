import React from 'react';
import { ChevronRight } from 'lucide-react';

export function LegalTerms({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] py-1"
      >
        <ChevronRight size={14} className="rotate-180" /> Back
      </button>
      <h1 className="text-4xl font-black tracking-tighter text-[#141414]">Terms of use</h1>
      <p className="text-xs text-gray-500">Last updated: June 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Using PDFbolt</h2>
        <p>
          By using this website you agree to these terms. PDFbolt is provided as-is for personal and business document
          tasks. You must have the right to upload and process any file you submit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">No warranty</h2>
        <p>
          We try to keep tools accurate and available, but results may vary by file type, fonts, and complexity. We do
          not guarantee that outputs meet legal, archival, or regulatory requirements (including PDF/A) unless explicitly
          validated for your use case.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Acceptable use</h2>
        <p>
          Do not use PDFbolt for unlawful content, malware, harassment, or attempts to overload our systems. We may rate-limit
          or block abuse.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, PDFbolt and its operators are not liable for indirect or consequential
          damages, or loss of data, arising from use of the service. Always keep backups of important documents.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Third-party services</h2>
        <p>
          Some features rely on open-source components (for example LibreOffice, Ghostscript). Ads and analytics are
          provided by Google. Their terms also apply where relevant.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Contact</h2>
        <p>Questions about these terms? Use the Contact page on this site.</p>
      </section>
    </div>
  );
}
