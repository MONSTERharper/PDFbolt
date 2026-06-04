import React from 'react';
import { ChevronRight } from 'lucide-react';

export function LegalFaq({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] py-1"
      >
        <ChevronRight size={14} className="rotate-180" /> Back
      </button>
      <h1 className="text-4xl font-black tracking-tighter text-[#141414]">Help & FAQ</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Are my files stored?</h2>
        <p>
          No. Live tools upload your file to our server only while the job runs. When processing finishes, you
          download the result and we do not keep the file on disk.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">What are the upload limits?</h2>
        <p>
          Typically up to 25 MB per file, 100 MB total per request, up to 10 files at once, and PDFs with at most
          250 pages. Exact limits are shown under each tool’s upload area.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Password-protected PDFs</h2>
        <p>
          If a PDF asks for a password, enter it in the banner that appears after you select the file. Without the
          correct password, tools that need to read the document cannot run.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Replace text in a PDF</h2>
        <p>
          Use <strong>bolt replace</strong> to find and replace words in the PDF itself (not a flat image). Layout
          stays as close to the original as possible. Turn on same-length mode if replacements must match the
          original text length.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Image to PDF</h2>
        <p>
          Upload PNG, JPEG, HEIC (when supported on the server), GIF, WebP, BMP, or TIFF images. They are
          combined into one PDF in the order you add them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">PDF to Word or Excel</h2>
        <p>
          Works best on simple, text-based PDFs. Scanned pages and complex layouts may not convert perfectly. For
          scans, OCR (coming soon) will help before exporting.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">PDF/A conversion</h2>
        <p>
          You may still get a download if the strict archive check does not pass; read the message after download.
          For legal or government archives, confirm the output meets your requirements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Tools marked WIP</h2>
        <p>
          WIP means “work in progress.” Those tools are visible in the list but cannot be run yet. OCR is an
          example.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Still need help?</h2>
        <p>
          Visit the <strong>Contact</strong> page or email the support address shown there. We aim to reply within a
          few business days.
        </p>
      </section>
    </div>
  );
}
