import React from 'react';
import { ChevronRight } from 'lucide-react';

export function NotFound({
  onHome,
  onDirectory,
}: {
  onHome: () => void;
  onDirectory: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center space-y-6">
      <h1 className="text-4xl font-black tracking-tighter">Page not found</h1>
      <p className="text-sm text-gray-600 font-sans">
        This link does not match a PDFbolt page. Try the home page or browse all tools.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onHome}
          className="bg-[#FF3300] text-white px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onDirectory}
          className="border border-[#141414] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-white"
        >
          All tools
        </button>
      </div>
      <ChevronRight className="mx-auto opacity-0" aria-hidden />
    </div>
  );
}
