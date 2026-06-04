import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'pdfbolt-cookie-notice-v1';

export function CookieNotice({ onPrivacy }: { onPrivacy: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-[#141414]/20 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-gray-700 font-sans">
        <p className="flex-1 leading-relaxed">
          We use cookies for analytics (Google Analytics) and ads (Google AdSense) to run this free service.{' '}
          <button type="button" onClick={onPrivacy} className="underline font-semibold text-[#FF3300] hover:text-[#141414]">
            Privacy policy
          </button>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 bg-[#141414] text-white px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-[#FF3300] transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
