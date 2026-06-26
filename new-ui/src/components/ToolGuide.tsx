import React from 'react';
import { BookOpen, ListChecks, Lightbulb, HelpCircle } from 'lucide-react';
import type { ToolContent } from '../toolContent';
import { ShareButtons } from './ShareButtons';

interface ToolGuideProps {
  cleanName: string;
  content: ToolContent;
}

/**
 * Editorial guide rendered below each tool: overview, steps, tips, and FAQ.
 *
 * This gives every tool page substantial, useful reading material for visitors.
 * FAQ structured data is emitted server-side in the prerendered HTML
 * (see SpaHtmlRenderer), so it is not duplicated here.
 */
export function ToolGuide({ cleanName, content }: ToolGuideProps) {
  return (
    <section
      aria-label={`About ${cleanName}`}
      className="max-w-3xl mx-auto space-y-10 border-t border-[#141414]/10 pt-12 font-sans text-sm leading-relaxed text-gray-700"
    >
      <article className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#141414]">
          <BookOpen size={20} className="text-[#FF3300]" aria-hidden />
          About {cleanName}
        </h2>
        {content.intro.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </article>

      <article className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#141414]">
          <ListChecks size={20} className="text-[#FF3300]" aria-hidden />
          How to use {cleanName}
        </h2>
        <ol className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-[#FF3300]">
          {content.steps.map((step, idx) => (
            <li key={idx} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </article>

      <article className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#141414]">
          <Lightbulb size={20} className="text-[#FF3300]" aria-hidden />
          Tips &amp; things to know
        </h2>
        <ul className="list-disc space-y-2 pl-6 marker:text-[#FF3300]">
          {content.tips.map((tip, idx) => (
            <li key={idx} className="pl-1">
              {tip}
            </li>
          ))}
        </ul>
      </article>

      {content.faqs.length > 0 && (
        <article className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#141414]">
            <HelpCircle size={20} className="text-[#FF3300]" aria-hidden />
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {content.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5">
                <dt className="font-bold text-[#141414]">{faq.q}</dt>
                <dd className="text-gray-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </article>
      )}

      <div className="border-t border-[#141414]/10 pt-8">
        <ShareButtons title={`${cleanName} — PDFbolt`} label="Share this tool" />
      </div>
    </section>
  );
}
