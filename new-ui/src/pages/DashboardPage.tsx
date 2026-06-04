import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { BannerAd } from '../components/AdPlacement';
import { OnboardingBanner, ONBOARDING_QUICK_TOOL_IDS } from '../components/OnboardingBanner';
import { BoltBrand } from '../components/BoltBrand';
import { ToolSpotlightGrid } from '../components/ToolSpotlightGrid';
import { formatBoltVersion } from '../appVersion';
import { isToolLive } from '../toolStatus';
import { CATEGORIES, resolveSuiteTool, type SuiteTool } from '../suiteCatalog';

export function DashboardPage({
  popularToolIds,
  recentToolIds,
  searchQuery,
  setSearchQuery,
  displayVersion,
  versionMismatch,
  buildVersion,
  serverVersion,
  onToolClick,
  onBrowseDirectory,
  onContact,
  onOpenToolFromOnboarding,
}: {
  popularToolIds: string[];
  recentToolIds: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  displayVersion: string;
  versionMismatch: boolean;
  buildVersion: string;
  serverVersion: string | null;
  onToolClick: (tool: SuiteTool) => void;
  onBrowseDirectory: () => void;
  onContact: () => void;
  onOpenToolFromOnboarding: (toolId: string) => void;
}) {
  const spotlightTools = popularToolIds
    .map((id) => resolveSuiteTool(id))
    .filter((tool): tool is SuiteTool => tool != null);
  const recentTools = recentToolIds
    .filter((id) => !popularToolIds.includes(id))
    .map((id) => resolveSuiteTool(id))
    .filter((tool): tool is SuiteTool => tool != null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Simplified Header */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-5xl font-black tracking-tighter leading-none text-[#141414]">
          PDF<BoltBrand text="bolt" /> Suite
        </h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-[#FF3300]">
            Simple PDF tools for everyday work.
          </h2>
          <p className="text-sm font-sans text-gray-600 leading-relaxed">
            Merge, convert, compress, and edit PDFs online. Your file is processed on our server for each job and is not kept afterward.
          </p>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Release {formatBoltVersion(displayVersion)}
            {versionMismatch && serverVersion
              ? ` (UI build ${formatBoltVersion(buildVersion)})`
              : ''}
          </p>
        </div>
      </header>

      <OnboardingBanner
        quickTools={ONBOARDING_QUICK_TOOL_IDS.map((id) => resolveSuiteTool(id))
          .filter((tool): tool is SuiteTool => tool != null)
          .map((tool) => ({ id: tool.id, name: tool.name, cleanName: tool.cleanName }))}
        onOpenTool={onOpenToolFromOnboarding}
      />

      {/* Global Search Center */}
      <div className="max-w-md mx-auto relative">
        <Search size={16} className="absolute left-4 top-3.5 text-gray-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search all 31 tools..."
          aria-label="Search PDF tools"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#141414]/25 hover:border-[#141414]/40 focus:border-[#FF3300] p-3 pl-12 font-mono text-xs outline-none rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-[#FF3300]/25 focus-visible:border-[#FF3300]"
        />
      </div>

      {/* Ad Space Placement */}
      <div className="w-full pt-2">
        <BannerAd onInquire={onContact} />
      </div>

      {/* Dynamic Search Results vs. Clean Spotlight Categorization */}
      {searchQuery ? (
        // Search Results View
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold">
            Found matches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CATEGORIES.flatMap((c) => c.tools)
              .filter(
                (t) =>
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.cleanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((tool) => {
                const ToolIcon = tool.icon;
                const isLive = isToolLive(tool.id);
                return (
                  <div
                    key={tool.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open tool: ${tool.name}. ${tool.description} (${isLive ? 'Live' : 'Work in progress'})`}
                    onClick={() => onToolClick(tool)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToolClick(tool);
                      }
                    }}
                    className="group p-4 bg-white border border-[#141414]/15 rounded-lg hover:border-[#FF3300] transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-[#FF3300]/10 text-[#FF3300]">
                        <ToolIcon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#FF3300] transition-colors">
                          <BoltBrand text={tool.name} />
                        </h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 line-clamp-1">{tool.description}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isLive ? 'bg-emerald-600/10 text-emerald-800' : 'bg-amber-500/15 text-amber-900'
                      }`}
                    >
                      {isLive ? 'Live' : 'WIP'}
                    </span>
                  </div>
                );
              })}
            {CATEGORIES.flatMap((c) => c.tools).filter(
              (t) =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.cleanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()),
            ).length === 0 && (
              <div className="col-span-2 text-center py-10 text-xs font-mono text-gray-500 uppercase">
                No tools match your search
              </div>
            )}
          </div>
        </div>
      ) : (
        // Simple, Aesthetic Standard View
        <div className="space-y-12">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white/50 p-2 rounded-lg border border-[#141414]/5">
              <h2 className="text-xs uppercase font-mono tracking-widest text-[#FF3300] font-bold pl-2">
                Most Popular Actions
              </h2>
              <p className="text-xs font-mono text-gray-500 pr-2">
                Ranked by how often each tool is used
              </p>
            </div>
            <ToolSpotlightGrid tools={spotlightTools} onToolClick={onToolClick} />
          </div>

          {recentTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-[#141414]/5">
                <h2 className="text-xs uppercase font-mono tracking-widest text-gray-700 font-bold pl-2">
                  Your recent tools
                </h2>
                <p className="text-xs font-mono text-gray-500 pr-2">This browser only</p>
              </div>
              <ToolSpotlightGrid tools={recentTools} onToolClick={onToolClick} />
            </div>
          )}

          {/* Link to Directory Tab */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onBrowseDirectory}
              aria-label="Browse all PDF tools"
              className="group flex items-center gap-2 bg-[#141414] text-[#E4E3E0] hover:bg-[#FF3300] px-6 py-3.5 font-mono text-xs uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF3300]"
            >
              <span>Browse all 31 tools</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
