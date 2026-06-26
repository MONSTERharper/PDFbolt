import React from 'react';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { BannerAd } from '../components/AdPlacement';
import { GUIDES, guidePath } from '../guidesContent';

export function GuidesPage({
  onBack,
  onContact,
  onOpenGuide,
}: {
  onBack: () => void;
  onContact: () => void;
  onOpenGuide: (slug: string) => void;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Suite
      </button>

      <header className="space-y-3">
        <h1 className="flex items-center gap-3 text-4xl md:text-5xl font-black tracking-tighter text-[#141414]">
          <BookOpen size={32} className="text-[#FF3300]" aria-hidden />
          PDF Guides
        </h1>
        <p className="max-w-2xl font-sans text-sm leading-relaxed text-gray-600">
          Practical, plain-English articles on working with PDFs — how to compress, convert, merge, secure, and
          archive documents, and why these tasks behave the way they do. No jargon, just useful explanations you can
          act on.
        </p>
      </header>

      <BannerAd onInquire={onContact} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDES.map((guide) => (
          <a
            key={guide.slug}
            href={guidePath(guide.slug)}
            onClick={(e) => {
              e.preventDefault();
              onOpenGuide(guide.slug);
            }}
            className="group flex flex-col h-full w-full no-underline text-inherit cursor-pointer border border-[#141414]/15 bg-white rounded-xl p-6 shadow-xs transition-all hover:border-[#FF3300] hover:shadow-[4px_4px_0px_#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
          >
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-500">
              <span className="bg-[#FF3300]/10 text-[#FF3300] font-bold px-2 py-0.5 rounded">{guide.category}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} aria-hidden /> {guide.readMinutes} min read
              </span>
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tighter leading-tight text-[#141414] group-hover:text-[#FF3300] transition-colors">
              {guide.title}
            </h2>
            <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-gray-600">{guide.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 self-start font-mono text-xs uppercase font-bold tracking-widest text-[#FF3300] group-hover:gap-2 transition-all">
              Read guide <ChevronRight size={14} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
