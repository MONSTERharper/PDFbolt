import React from 'react';
import { ChevronRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { BoltBrand } from '../components/BoltBrand';
import { SUITE_TOOL_COUNT } from '../suiteCatalog';

export function AboutPage({
  onBack,
  onFaq,
  onPrivacy,
  onTerms,
  onContact,
}: {
  onBack: () => void;
  onFaq: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onContact: () => void;
}) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-12">
      <div className="space-y-6">
        <h1 className="text-5xl font-black tracking-tighter italic text-[#141414]">
          About PDF<BoltBrand text="bolt" />
        </h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed text-gray-600">
          <p>
            PDFbolt is a collection of {SUITE_TOOL_COUNT} online tools for the PDF tasks that come up at home, at
            school, and at work — merging documents, converting files to and from PDF, compressing large files,
            replacing text, signing, redacting, and securing documents with passwords. Everything runs in your
            browser, with no software to install and no account to create.
          </p>
          <div className="space-y-2">
            <h2 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">
              Who runs PDFbolt
            </h2>
            <p>
              PDFbolt is an independent project, built and maintained by an independent developer rather than a large
              company. It started as a way to handle everyday document tasks without installing software or handing
              files to services that keep them. It is actively maintained: tools are tested, fixed, and improved over
              time, and new ones are added based on what people actually ask for. If a tool is missing or could work
              better, the{' '}
              <button type="button" onClick={onContact} className="underline font-semibold text-[#FF3300]">
                Contact page
              </button>{' '}
              is the quickest way to reach us — we read every message and aim to reply within a few business days.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">
              How PDFbolt is funded
            </h2>
            <p>
              The tools are free to use. To cover hosting and development, PDFbolt shows advertising provided by
              Google. Ads are clearly labelled and kept separate from the tools, and your documents are never used for
              ad targeting — file processing and advertising are completely independent of each other. You can read
              more about data handling in our{' '}
              <button type="button" onClick={onPrivacy} className="underline font-semibold text-[#FF3300]">
                Privacy policy
              </button>
              .
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">How it works</h2>
            <p>
              Most tools upload your file to our server, process it, and return a download. The file is used only for
              that single job and is removed afterward — it is not stored or shared. A few tools, including Sign,
              Redact, and Unlock, run entirely in your browser, so those files never leave your device at all.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">
              What you can do here
            </h2>
            <p>
              The suite is organized into clear categories: organize pages (merge, split, extract, reorder), convert
              to and from PDF (images, Word, Excel, PowerPoint, HTML, JPG, and CAD/DXF), optimize (compress and
              repair), edit (replace text, rotate, watermark, page numbers, crop, metadata), and security (passwords,
              signatures, redaction, and comparison). Open the directory to browse every tool in one place.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">
              Live tools and work in progress
            </h2>
            <p>
              Tools marked <strong className="text-amber-800">coming soon</strong> in the directory are not ready yet
              and cannot be run. <strong className="text-emerald-800">Live</strong> tools work today; server-side
              tools process your upload per request and do not keep it on disk afterward.
            </p>
          </div>

          <p>
            For more detail, see our{' '}
            <button type="button" onClick={onFaq} className="underline font-semibold text-[#FF3300]">
              Help &amp; FAQ
            </button>
            ,{' '}
            <button type="button" onClick={onPrivacy} className="underline font-semibold text-[#FF3300]">
              Privacy policy
            </button>
            , and{' '}
            <button type="button" onClick={onTerms} className="underline font-semibold text-[#FF3300]">
              Terms of use
            </button>
            .
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-[#141414]/10">
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs">
            <ShieldCheck size={18} className="text-[#FF3300]" /> Privacy first
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Files are sent to the server only while a tool runs and are removed after processing. Several tools run
            fully in your browser.
          </p>
        </div>
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs">
            <Zap size={18} className="text-[#FF3300]" /> Fast &amp; free
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            No installs, no sign-up. Open a tool, run it, and download — most jobs finish in seconds.
          </p>
        </div>
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs">
            <Layers size={18} className="text-[#FF3300]" /> One toolkit
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Dozens of related tools in one place, so you can merge, convert, and edit without juggling separate apps.
          </p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] py-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Suite
      </button>
    </div>
  );
}
