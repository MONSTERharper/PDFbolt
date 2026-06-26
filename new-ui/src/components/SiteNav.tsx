import React, { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppView } from '../routing';

export interface SiteNavItem {
  view: AppView;
  path: string;
  label: string;
  clearSearch?: boolean;
}

const NAV_ITEMS: SiteNavItem[] = [
  { view: 'dashboard', path: '/', label: 'Suite', clearSearch: true },
  { view: 'directory', path: '/directory', label: 'Directory', clearSearch: true },
  { view: 'guides', path: '/guides', label: 'Guides' },
  { view: 'about', path: '/about', label: 'About' },
  { view: 'faq', path: '/faq', label: 'FAQ' },
  { view: 'contact', path: '/contact', label: 'Contact' },
];

const tabClass = (active: boolean) =>
  `text-xs font-mono uppercase tracking-widest hover:text-[#FF3300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${
    active ? 'text-[#FF3300] font-bold underline decoration-2 underline-offset-4' : ''
  }`;

const mobileLinkClass = (active: boolean) =>
  `w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest border-b border-[#141414]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF3300] ${
    active ? 'text-[#FF3300] font-bold bg-[#FF3300]/5' : 'text-[#141414] hover:bg-gray-50'
  }`;

interface SiteNavProps {
  currentView: AppView;
  onNavigate: (item: SiteNavItem) => void;
}

export function SiteNav({ currentView, onNavigate }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [currentView]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const select = (item: SiteNavItem) => {
    onNavigate(item);
    setOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex gap-6" role="tablist" aria-label="Navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => select(item)}
            role="tab"
            aria-selected={currentView === item.view}
            className={tabClass(currentView === item.view)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="md:hidden flex items-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="p-2 -mr-2 rounded-md text-[#141414] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 top-16 z-[90] bg-[#141414]/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id={menuId}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed left-0 right-0 top-16 z-[95] md:hidden bg-white border-b border-[#141414] shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <nav aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => select(item)}
                  aria-current={currentView === item.view ? 'page' : undefined}
                  className={mobileLinkClass(currentView === item.view)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
