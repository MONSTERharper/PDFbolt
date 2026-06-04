import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { postContactInquiry } from './backendBridge';
import { friendlyErrorMessage } from './friendlyError';
import { CookieNotice } from './components/CookieNotice';
import { SiteFooter } from './components/SiteFooter';
import { SiteNav, type SiteNavItem } from './components/SiteNav';
import { BoltBrand } from './components/BoltBrand';
import { LegalPrivacy } from './pages/LegalPrivacy';
import { LegalTerms } from './pages/LegalTerms';
import { LegalFaq } from './pages/LegalFaq';
import { StatusPage } from './pages/StatusPage';
import { NotFound } from './pages/NotFound';
import { DashboardPage } from './pages/DashboardPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ReplacePage } from './pages/ReplacePage';
import { ToolPage } from './pages/ToolPage';
import { applyPageMeta, defaultPageDescription } from './pageMeta';
import { BOLT_TOOL_IDS } from './toolsCatalog';
import { useSiteConfig } from './useSiteConfig';
import { useAppVersion } from './useAppVersion';
import { useToolWorkflow } from './hooks/useToolWorkflow';
import { CATEGORIES, resolveSuiteTool, type SuiteTool } from './suiteCatalog';
import {
  DEFAULT_POPULAR_TOOL_IDS,
  fetchPopularToolIds,
  getRecentToolIds,
  mergePopularLists,
} from './toolUsage';
import {
  type AppView,
  legacyRedirectPath,
  parseRoute,
  pageTitle,
  toolPath,
} from './routing';

const ALL_TOOL_IDS: ReadonlySet<string> = new Set(BOLT_TOOL_IDS);

export default function App() {
  const siteConfig = useSiteConfig();
  const { displayVersion, versionMismatch, buildVersion, serverVersion } = useAppVersion();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedWipTool, setSelectedWipTool] = useState<SuiteTool | null>(null);
  const [popularToolIds, setPopularToolIds] = useState<string[]>([...DEFAULT_POPULAR_TOOL_IDS]);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<{ msg: string; type: 'ok' | 'error' } | null>(null);
  const [contactSending, setContactSending] = useState(false);

  const applyRoute = useCallback((route: ReturnType<typeof parseRoute>, pathname: string) => {
    if (route.view === 'wip' && route.toolId) {
      const tool = resolveSuiteTool(route.toolId);
      if (tool) {
        setSelectedWipTool(tool);
        setCurrentView('wip');
        applyPageMeta({
          title: pageTitle('wip', tool.cleanName),
          description: tool.description,
          path: pathname,
        });
        return;
      }
      setCurrentView('not-found');
      applyPageMeta({ title: pageTitle('not-found'), path: pathname });
      return;
    }
    if (route.view === 'replace') {
      setCurrentView('replace');
      applyPageMeta({
        title: pageTitle('replace'),
        description: 'Find and replace text in your PDF, then download the updated file.',
        path: pathname,
      });
      return;
    }
    setSelectedWipTool(null);
    setCurrentView(route.view);
    applyPageMeta({
      title: pageTitle(route.view),
      description: defaultPageDescription(),
      path: pathname,
    });
  }, []);

  const syncViewFromPath = useCallback(() => {
    const pathname = window.location.pathname;
    const redirect = legacyRedirectPath(pathname, ALL_TOOL_IDS);
    if (redirect) {
      window.history.replaceState({}, '', redirect);
    }
    const effectivePath = redirect ?? pathname;
    const route = parseRoute(effectivePath, ALL_TOOL_IDS);
    applyRoute(route, effectivePath);
  }, [applyRoute]);

  const goToView = useCallback((view: AppView, path: string, tool?: SuiteTool | null) => {
    if (view === 'wip' && tool) {
      setSelectedWipTool(tool);
    } else if (view !== 'wip') {
      setSelectedWipTool(null);
    }
    setCurrentView(view);
    window.history.pushState({}, '', path);
    const description =
      view === 'wip' && tool
        ? tool.description
        : view === 'replace'
          ? 'Find and replace text in your PDF, then download the updated file.'
          : defaultPageDescription();
    applyPageMeta({
      title: pageTitle(view, tool?.cleanName),
      description,
      path,
    });
  }, []);

  const { handleToolClick, toolPageBindings, replacePageProps } = useToolWorkflow({
    currentView,
    selectedWipTool,
    goToView,
  });

  useEffect(() => {
    syncViewFromPath();
    window.addEventListener('popstate', syncViewFromPath);
    return () => window.removeEventListener('popstate', syncViewFromPath);
  }, [syncViewFromPath]);

  useEffect(() => {
    if (currentView !== 'dashboard') {
      return;
    }
    let cancelled = false;
    void (async () => {
      const serverPopular = await fetchPopularToolIds(8);
      const recent = getRecentToolIds(4);
      if (!cancelled) {
        setPopularToolIds(mergePopularLists(serverPopular, recent, 8));
        setRecentToolIds(recent);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentView]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = contactName.trim();
    const email = contactEmail.trim();
    const subject = contactSubject.trim();
    const message = contactMessage.trim();
    if (!name || !email || !subject || !message) {
      setContactStatus({ msg: 'Please fill all fields.', type: 'error' });
      return;
    }
    setContactSending(true);
    setContactStatus(null);
    try {
      await postContactInquiry({ name, email, subject, message });
      setContactStatus({ msg: 'Inquiry sent successfully.', type: 'ok' });
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setContactStatus({ msg: friendlyErrorMessage(raw), type: 'error' });
    } finally {
      setContactSending(false);
    }
  };

  const filteredCategories = CATEGORIES.map((category) => {
    const filteredTools = category.tools.filter((tool) => {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.cleanName.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    });
    return { ...category, tools: filteredTools };
  }).filter((category) => {
    if (activeCategory !== 'all' && category.id !== activeCategory) return false;
    return category.tools.length > 0;
  });

  const dashboardProps = {
    popularToolIds,
    recentToolIds,
    searchQuery,
    setSearchQuery,
    displayVersion,
    versionMismatch,
    buildVersion,
    serverVersion,
    onToolClick: handleToolClick,
    onBrowseDirectory: () => {
      goToView('directory', '/directory');
      setActiveCategory('all');
      setSearchQuery('');
    },
    onContact: () => goToView('contact', '/contact'),
    onOpenToolFromOnboarding: (toolId: string) => {
      const tool = resolveSuiteTool(toolId);
      if (tool) {
        handleToolClick(tool);
      }
    },
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <nav
        className="border-b border-[#141414] bg-white/80 backdrop-blur-sm sticky top-0 z-[100] px-6 h-16 flex items-center justify-between gap-4"
        aria-label="Global navigation menu"
      >
        <div
          onClick={() => goToView('dashboard', '/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goToView('dashboard', '/');
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="PDFbolt home page"
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 p-1 rounded-md shrink-0"
        >
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            PDF<BoltBrand text="bolt" />
          </h1>
        </div>

        <SiteNav
          currentView={currentView}
          onNavigate={(item: SiteNavItem) => {
            if (item.clearSearch) {
              setSearchQuery('');
            }
            goToView(item.view, item.path);
          }}
        />
      </nav>

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DashboardPage {...dashboardProps} />
            </motion.div>
          )}

          {currentView === 'directory' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DirectoryPage
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                filteredCategories={filteredCategories}
                onToolClick={handleToolClick}
                onContact={() => goToView('contact', '/contact')}
              />
            </motion.div>
          )}

          {currentView === 'replace' && (
            <motion.div
              key="replace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
            >
              <ReplacePage
                onBack={() => goToView('dashboard', '/')}
                onContact={() => goToView('contact', '/contact')}
                siteLimits={siteConfig.limits}
                {...replacePageProps}
              />
            </motion.div>
          )}

          {currentView === 'wip' && (
            <motion.div key="wip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {selectedWipTool ? (
                <ToolPage tool={selectedWipTool} bindings={toolPageBindings} />
              ) : (
                <DashboardPage {...dashboardProps} />
              )}
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AboutPage
                onBack={() => goToView('dashboard', '/')}
                onFaq={() => goToView('faq', '/faq')}
                onPrivacy={() => goToView('privacy', '/privacy')}
                onTerms={() => goToView('terms', '/terms')}
              />
            </motion.div>
          )}

          {currentView === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContactPage
                contactName={contactName}
                setContactName={setContactName}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactSubject={contactSubject}
                setContactSubject={setContactSubject}
                contactMessage={contactMessage}
                setContactMessage={setContactMessage}
                contactStatus={contactStatus}
                contactSending={contactSending}
                onSubmit={handleContactSubmit}
              />
            </motion.div>
          )}

          {currentView === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LegalPrivacy
                onBack={() => goToView('dashboard', '/')}
                onContact={() => goToView('contact', '/contact')}
              />
            </motion.div>
          )}

          {currentView === 'terms' && (
            <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LegalTerms onBack={() => goToView('dashboard', '/')} />
            </motion.div>
          )}

          {currentView === 'faq' && (
            <motion.div key="faq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LegalFaq onBack={() => goToView('dashboard', '/')} />
            </motion.div>
          )}

          {currentView === 'status' && (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatusPage onBack={() => goToView('dashboard', '/')} />
            </motion.div>
          )}

          {currentView === 'not-found' && (
            <motion.div key="not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NotFound
                onHome={() => goToView('dashboard', '/')}
                onDirectory={() => goToView('directory', '/directory')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SiteFooter
        displayVersion={displayVersion}
        versionMismatch={versionMismatch}
        buildVersion={buildVersion}
        onNavigate={(path, view) => goToView(view, path)}
      />

      <CookieNotice onPrivacy={() => goToView('privacy', '/privacy')} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital@1&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `,
        }}
      />
    </div>
  );
}
