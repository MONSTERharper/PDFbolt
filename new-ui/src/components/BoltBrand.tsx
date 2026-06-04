import React from 'react';
import { Info, Zap } from 'lucide-react';

export function BoltBrand({
  text,
  className = '',
  showInfo = false,
}: {
  text: string;
  className?: string;
  showInfo?: boolean;
}) {
  const parts = text.split(/(bolt)/gi);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center">
        {parts.map((part, i) =>
          part.toLowerCase() === 'bolt' ? (
            <span key={i} className="inline-flex items-center gap-0.5">
              <span className="text-[#FF3300] lowercase">bolt</span>
              <Zap size={14} className="fill-[#FF3300] text-[#FF3300] rotate-12 shrink-0" aria-hidden="true" />
            </span>
          ) : (
            part
          ),
        )}
      </span>

      {/* Replace tool help tooltip */}
      {showInfo && (
        <span className="relative group/tooltip inline-flex items-center cursor-help" style={{ textTransform: 'none' }}>
          <Info size={14} className="text-gray-400 hover:text-[#FF3300] transition-colors shrink-0" />

          {/* Tooltip Card */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[#141414] text-[#E4E3E0] text-xs font-sans font-normal not-italic tracking-normal leading-relaxed p-3 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-50">
            <span className="font-bold text-[#FF3300] block mb-1 font-mono uppercase tracking-widest text-xs">Tip</span>
            Text replacement keeps the original layout when possible. With strict same-length mode on, the replacement must be the same length as the original text.

            {/* Accent Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414]" />
          </span>
        </span>
      )}
    </span>
  );
}
