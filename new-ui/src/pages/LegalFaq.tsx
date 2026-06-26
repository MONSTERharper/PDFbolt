import React from 'react';
import { ChevronRight } from 'lucide-react';

export function LegalFaq({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] py-1"
      >
        <ChevronRight size={14} className="rotate-180" /> Back
      </button>
      <h1 className="text-4xl font-black tracking-tighter text-[#141414]">Help &amp; FAQ</h1>
      <p className="text-gray-600">
        PDFbolt is a suite of online tools for everyday PDF tasks — merging, converting, compressing, editing,
        signing, and securing documents. This page answers the questions we hear most often. If something is not
        covered here, the Contact page is the best place to reach us.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Is PDFbolt free to use?</h2>
        <p>
          Yes. The tools on PDFbolt are free to use in your browser. The site is supported by advertising, which is
          why you may see ad placements on the pages.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Are my files stored?</h2>
        <p>
          No. Most tools upload your file to our server only while the job runs. As soon as processing finishes and
          you download the result, the file is removed — we do not keep it on disk or share it. A few tools (such as
          Sign, Redact, and Unlock) run entirely in your browser, so those files never leave your device at all.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Do I need to create an account?</h2>
        <p>
          No sign-up is required. You can open any tool, upload a file, and download the result without registering
          or providing personal details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">What are the upload limits?</h2>
        <p>
          Typically up to 25 MB per file, 100 MB total per request, up to 10 files at once, and PDFs with at most
          250 pages. The exact limits in effect are always shown under each tool’s upload area. If your file is too
          large, try compressing it first or splitting the work into smaller batches.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Which browsers and devices are supported?</h2>
        <p>
          PDFbolt works in current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile. Because the
          interface runs in the browser, no installation is needed — though large files process faster on a desktop
          with a stable connection.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Working with password-protected PDFs</h2>
        <p>
          If a PDF is encrypted, enter its password in the banner that appears after you select the file. Without the
          correct password, tools that need to read the document cannot run. To remove a password permanently from a
          file you own, use the Unlock PDF tool; to add one, use Protect PDF.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Merging, splitting, and reordering pages</h2>
        <p>
          Use Merge to combine several PDFs into one, Split or Extract pages to pull out a range, Remove pages to
          delete unwanted sheets, and Organize PDF to set a new page order. None of these change the content of the
          pages themselves — they only rearrange or select them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Replacing text in a PDF</h2>
        <p>
          Use <strong>bolt replace</strong> to find and replace words in the PDF itself rather than in a flat image,
          so the document stays selectable and searchable. Layout stays as close to the original as possible. Turn on
          same-length mode when replacements must match the original text length to preserve tight layouts.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Converting images and Office files to PDF</h2>
        <p>
          Image to PDF accepts PNG, JPEG, HEIC (where supported on the server), GIF, WebP, BMP, and TIFF, combining
          them into one document in the order you arrange. Word, PowerPoint, and Excel files convert to PDF using the
          same engine, locking in the layout so the document looks the same on any device.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Converting a PDF to Word, Excel, or PowerPoint</h2>
        <p>
          These conversions work best on simple, text-based PDFs. Scanned pages and complex multi-column layouts may
          not convert perfectly, so expect to do some light cleanup afterward. For image-only scans, OCR (coming soon)
          will add a text layer first, which greatly improves conversion accuracy.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Converting a PDF to DXF (CAD)</h2>
        <p>
          PDF to DXF turns vector drawings into AutoCAD-compatible files, exporting each page as its own DXF (R2010)
          delivered in a zip. It only works on true vector PDFs — scanned or raster drawings contain no geometry to
          convert. Geometry is exported in millimetres, so confirm the scale against your title block after opening.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">PDF/A conversion for archiving</h2>
        <p>
          PDF/A embeds fonts and color information so a document stays viewable far into the future, which is why it
          is often required for legal and government archives. You may still receive a download if the strict archive
          check does not fully pass — read the message after download, and for formal submissions confirm the output
          meets your specific requirement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Signing and redacting documents</h2>
        <p>
          Sign PDF lets you draw a signature and place it on one page or every page; Redact PDF covers sensitive areas
          with black boxes. Both run entirely in your browser, so the document is never uploaded for these tools.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Tools marked “coming soon”</h2>
        <p>
          A tool labeled coming soon (work in progress) is visible in the directory but cannot be run yet. OCR is the
          current example. If you need one of these soon, let us know through the Contact page.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#141414]">Still need help?</h2>
        <p>
          Visit the <strong>Contact</strong> page and send us a message through the form. We aim to reply within a few
          business days.
        </p>
      </section>
    </div>
  );
}
