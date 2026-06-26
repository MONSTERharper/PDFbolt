import React from 'react';
import { ChevronRight, Clock, HelpCircle, Wrench } from 'lucide-react';
import { BannerAd } from '../components/AdPlacement';
import { ShareButtons } from '../components/ShareButtons';
import { GUIDES, type Guide } from '../guidesContent';
import { resolveSuiteTool } from '../suiteCatalog';
import { toolPath } from '../routing';

/**
 * Rank other guides by topical relevance to the current one, so the
 * "Related guides" block forms genuine internal links between related
 * content rather than an arbitrary list. Relevance is scored by the
 * number of shared related-tool ids, with a bonus for the same category.
 */
function relatedGuides(current: Guide, limit = 4): Guide[] {
  const currentTools = new Set(current.relatedToolIds);

  const scored = GUIDES.filter((g) => g.slug !== current.slug).map((g) => {
    let score = 0;
    for (const id of g.relatedToolIds) {
      if (currentTools.has(id)) score += 2;
    }
    if (g.category === current.category) score += 1;
    return { guide: g, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Always return `limit` guides: relevant ones first, then fill with others
  // so the section is never empty even for a guide with no overlaps.
  return scored.slice(0, limit).map((s) => s.guide);
}

export function GuideArticlePage({
  guide,
  onBackToGuides,
  onContact,
  onOpenTool,
  onOpenGuide,
}: {
  guide: Guide;
  onBackToGuides: () => void;
  onContact: () => void;
  onOpenTool: (toolId: string) => void;
  onOpenGuide: (slug: string) => void;
}) {
  const relatedTools = guide.relatedToolIds
    .map((id) => resolveSuiteTool(id))
    .filter((tool): tool is NonNullable<ReturnType<typeof resolveSuiteTool>> => tool != null);

  const moreGuides = relatedGuides(guide, 4);

  return (
    <article className="max-w-3xl mx-auto px-6 py-10 space-y-8 font-sans text-[15px] leading-relaxed text-gray-700">
      <button
        onClick={onBackToGuides}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
      >
        <ChevronRight size={14} className="rotate-180" /> All guides
      </button>

      <header className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-500">
          <span className="bg-[#FF3300]/10 text-[#FF3300] font-bold px-2 py-0.5 rounded">{guide.category}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden /> {guide.readMinutes} min read
          </span>
          <span>Updated {guide.updated}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-[#141414]">
          {guide.title}
        </h1>
      </header>

      <div className="space-y-4">
        {guide.intro.map((paragraph, idx) => (
          <p key={idx} className="text-base">
            {paragraph}
          </p>
        ))}
      </div>

      <BannerAd onInquire={onContact} />

      <div className="space-y-10">
        {guide.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-2xl font-black tracking-tighter text-[#141414]">{section.heading}</h2>
            {section.paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      {guide.faqs.length > 0 && (
        <section className="space-y-5 border-t border-[#141414]/10 pt-8">
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#141414]">
            <HelpCircle size={20} className="text-[#FF3300]" aria-hidden /> Frequently asked questions
          </h2>
          <div className="space-y-5">
            {guide.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="font-bold text-[#141414]">{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-[#141414]/10 pt-8">
        <ShareButtons title={`${guide.title} — PDFbolt`} url={`/guides/${guide.slug}`} label="Share this guide" />
      </section>

      {relatedTools.length > 0 && (
        <section className="space-y-4 border-t border-[#141414]/10 pt-8">
          <h2 className="flex items-center gap-2 text-xl font-black tracking-tighter text-[#141414]">
            <Wrench size={18} className="text-[#FF3300]" aria-hidden /> Tools mentioned in this guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onOpenTool(tool.id)}
                  className="flex items-center gap-3 border border-[#141414]/15 bg-white rounded-lg p-3 text-left transition-all hover:border-[#FF3300] hover:shadow-[3px_3px_0px_#141414]"
                >
                  <span className="p-2 bg-[#FF3300]/10 text-[#FF3300] rounded">
                    <ToolIcon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold tracking-tight text-[#141414]">{tool.cleanName}</span>
                    <span className="block text-xs font-mono text-gray-500">{toolPath(tool.id)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {moreGuides.length > 0 && (
        <section className="space-y-4 border-t border-[#141414]/10 pt-8">
          <h2 className="text-xl font-black tracking-tighter text-[#141414]">Related guides</h2>
          <ul className="space-y-2">
            {moreGuides.map((g) => (
              <li key={g.slug}>
                <button
                  type="button"
                  onClick={() => onOpenGuide(g.slug)}
                  className="inline-flex items-center gap-1 font-mono text-sm text-[#FF3300] hover:gap-2 transition-all"
                >
                  <ChevronRight size={14} /> {g.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
