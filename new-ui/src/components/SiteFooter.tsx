import React from 'react';
import { formatBoltVersion } from '../appVersion';

interface SiteFooterProps {
  displayVersion: string;
  versionMismatch: boolean;
  buildVersion: string;
  onNavigate: (
    path: string,
    view: 'dashboard' | 'directory' | 'about' | 'contact' | 'faq' | 'status' | 'privacy' | 'terms',
  ) => void;
}

export function SiteFooter({
  displayVersion,
  versionMismatch,
  buildVersion,
  onNavigate,
}: SiteFooterProps) {
  const showMismatch = versionMismatch && !import.meta.env.PROD;

  return (
    <footer className="border-t border-[#141414] bg-[#141414] text-[#E4E3E0]/70 font-sans text-[10px] px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <nav className="flex flex-wrap gap-x-4 gap-y-1 uppercase tracking-wide font-mono" aria-label="Footer">
          <button type="button" onClick={() => onNavigate('/', 'dashboard')} className="hover:text-white">
            Home
          </button>
          <button type="button" onClick={() => onNavigate('/directory', 'directory')} className="hover:text-white">
            All tools
          </button>
          <button type="button" onClick={() => onNavigate('/about', 'about')} className="hover:text-white">
            About
          </button>
          <button type="button" onClick={() => onNavigate('/faq', 'faq')} className="hover:text-white">
            FAQ
          </button>
          <button type="button" onClick={() => onNavigate('/contact', 'contact')} className="hover:text-white">
            Contact
          </button>
          <button type="button" onClick={() => onNavigate('/status', 'status')} className="hover:text-white">
            Status
          </button>
          <button type="button" onClick={() => onNavigate('/privacy', 'privacy')} className="hover:text-white">
            Privacy
          </button>
          <button type="button" onClick={() => onNavigate('/terms', 'terms')} className="hover:text-white">
            Terms
          </button>
        </nav>
        <div className="flex flex-col sm:items-end gap-0.5 font-mono text-[9px] uppercase tracking-widest text-[#E4E3E0]/50">
          <span>PDFbolt © {new Date().getFullYear()} · v{formatBoltVersion(displayVersion)}</span>
          {showMismatch && (
            <span className="text-amber-400 normal-case tracking-normal" title={`UI build ${buildVersion}`}>
              Dev: UI/API version mismatch
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
