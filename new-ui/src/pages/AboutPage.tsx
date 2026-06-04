import React from 'react';
import { ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { BoltBrand } from '../components/BoltBrand';

export function AboutPage({
  onBack,
  onFaq,
  onPrivacy,
  onTerms,
}: {
  onBack: () => void;
  onFaq: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}) {
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-6">
        <h2 className="text-5xl font-black tracking-tighter italic text-[#141414]">
          About PDF<BoltBrand text="bolt" />
        </h2>
        <div className="prose prose-sm text-[#141414] font-mono leading-relaxed space-y-6 text-xs uppercase tracking-tight">
          <p className="text-sm font-sans normal-case text-gray-600 leading-relaxed font-medium">
            PDFbolt is a collection of online PDF tools for common tasks at home and at work—merge, convert, compress, sign, and more. PDFBolt is built and maintained by an independent developer. Questions? Use the contact page.
          </p>
          <div className="space-y-2">
            <h4 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">How it works</h4>
            <p className="font-sans normal-case text-gray-500 text-sm">
              Live tools upload your file to our server, process it, and return a download. We do not keep your file after the job finishes.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">Live tools and work in progress</h4>
            <p className="font-sans normal-case text-gray-500 text-sm">
              Tools marked <strong className="text-amber-800">WIP</strong> in the directory are not ready yet and cannot be run.{' '}
              <strong className="text-emerald-800">Live</strong> tools run on the PDFbolt server; uploads are processed per request and not kept on disk afterward.
            </p>
          </div>
          <p className="font-sans normal-case text-gray-500 text-sm">
            See our{' '}
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
      <div className="grid grid-cols-2 gap-8 py-8 border-y border-[#141414]/10">
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs">
            <ShieldCheck size={18} className="text-[#FF3300]" /> Privacy
          </h3>
          <p className="text-xs text-gray-500 mt-2">Files are sent to the server only while a tool runs. They are not stored after processing.</p>
        </div>
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs">
            <Zap size={18} className="text-[#FF3300]" /> Replace text
          </h3>
          <p className="text-sm text-gray-500 mt-2 font-sans normal-case leading-relaxed">
            <strong className="text-[#141414]">bolt replace</strong> edits text directly inside the PDF—the document stays a real, selectable PDF rather than a flat image. Layout and fonts usually stay the same; very complex PDFs may need small edits by hand afterward.
          </p>
        </div>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] py-1 transition-all"
      >
        <ChevronRight size={14} /> Back to Suite
      </button>
    </div>
  );
}
