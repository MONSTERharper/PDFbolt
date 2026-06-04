import React, { useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import {
  ONBOARDING_MAX_DISMISSALS,
  onboardingRemainingShows,
  recordOnboardingDismiss,
  shouldShowOnboarding,
} from '../onboardingStorage';

const STEPS = [
  { title: 'Pick a tool', body: 'Choose a tool below or browse the full list.' },
  { title: 'Upload your file', body: 'Select your PDF, images, or Office file. Limits appear under the upload area.' },
  { title: 'Download the result', body: 'Click Run, wait a moment, and save the file. We do not keep your upload afterward.' },
] as const;

/** Same shortcuts as the home “Most popular” defaults. */
export const ONBOARDING_QUICK_TOOL_IDS = [
  'replace',
  'merge',
  'compress',
  'split',
  'images-to-pdf',
  'pdf-to-jpg',
] as const;

export interface OnboardingQuickTool {
  id: string;
  name: string;
  cleanName: string;
}

interface OnboardingBannerProps {
  quickTools: OnboardingQuickTool[];
  onOpenTool: (toolId: string) => void;
}

export function OnboardingBanner({ quickTools, onOpenTool }: OnboardingBannerProps) {
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(ONBOARDING_MAX_DISMISSALS);

  useEffect(() => {
    setVisible(shouldShowOnboarding());
    setRemaining(onboardingRemainingShows());
  }, []);

  if (!visible) {
    return null;
  }

  const close = () => {
    recordOnboardingDismiss();
    setRemaining(onboardingRemainingShows());
    setVisible(false);
  };

  const openTool = (toolId: string) => {
    onOpenTool(toolId);
    close();
  };

  const toolCount = quickTools.length;
  const minButtonWidth =
    toolCount <= 2 ? '9.5rem' : toolCount <= 4 ? '7.5rem' : '6.5rem';

  return (
    <section
      role="region"
      aria-label="How PDFbolt works"
      className="w-full max-w-5xl mx-auto rounded-xl border-2 border-[#FF3300]/30 bg-gradient-to-br from-white to-[#FF3300]/[0.04] p-5 md:p-6 shadow-sm relative"
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-[#141414] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
        aria-label="Dismiss getting started guide"
      >
        <X size={18} />
      </button>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#FF3300] font-bold mb-1 pr-8">
        Getting started
      </p>
      {remaining > 0 && remaining < ONBOARDING_MAX_DISMISSALS && (
        <p className="text-[9px] font-mono text-gray-500 mb-3">
          Tip {ONBOARDING_MAX_DISMISSALS - remaining + 1} of {ONBOARDING_MAX_DISMISSALS} — dismiss with Got it or ✕
        </p>
      )}

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 font-sans text-sm text-gray-700">
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-[#FF3300] text-white text-xs font-bold flex items-center justify-center"
              aria-hidden
            >
              {index + 1}
            </span>
            <div>
              <p className="font-bold text-[#141414]">{step.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {toolCount > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 font-bold">
            Jump to a tool
          </p>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${minButtonWidth}, 1fr))`,
            }}
          >
            {quickTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => openTool(tool.id)}
                className="min-h-[2.75rem] px-3 py-2 rounded-lg border border-[#141414]/15 bg-white hover:border-[#FF3300] hover:bg-[#FF3300]/[0.06] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-1"
              >
                <span className="block font-bold text-[11px] text-[#141414] truncate">{tool.cleanName}</span>
                <span className="block text-[9px] font-mono text-gray-500 truncate mt-0.5 uppercase tracking-wide">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={close}
        className="mt-5 w-full sm:w-auto bg-[#141414] text-white px-6 py-2.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-[#FF3300] transition-colors flex items-center justify-center gap-1"
      >
        Got it
        <ChevronRight size={14} />
      </button>
    </section>
  );
}
