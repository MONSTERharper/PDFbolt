import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { BannerAd } from '../components/AdPlacement';
import { BoltBrand } from '../components/BoltBrand';
import { isToolLive } from '../toolStatus';
import { CATEGORIES, type SuiteCategory, type SuiteTool } from '../suiteCatalog';

export function DirectoryPage({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  filteredCategories,
  onToolClick,
  onContact,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  filteredCategories: SuiteCategory[];
  onToolClick: (tool: SuiteTool) => void;
  onContact: () => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Directory Header */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex bg-[#FF3300]/10 text-[#FF3300] px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider">
          Catalog Directory
        </span>
        <h1 className="text-4xl font-black tracking-tighter leading-none text-[#141414]">
          All Tools
        </h1>
        <p className="text-sm font-sans text-gray-600 max-w-xl mx-auto leading-relaxed">
          All 31 tools in one place. Live tools are ready to use; WIP tools are still being built.
        </p>
      </header>

      {/* Local Search in Directory */}
      <div className="max-w-md mx-auto relative">
        <Search size={16} className="absolute left-4 top-3.5 text-gray-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Filter tools (e.g. word, compress, sign)..."
          aria-label="Filter tools in the list"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#141414]/25 hover:border-[#141414]/45 focus:border-[#FF3300] p-3 pl-12 font-mono text-xs outline-none rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-[#FF3300]/20"
        />
      </div>

      {/* Ad Placement Banner */}
      <div className="max-w-4xl mx-auto pt-2">
        <BannerAd onInquire={onContact} />
      </div>

      {/* Structured Drawer Directory list */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#141414]/10 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-xs uppercase font-mono tracking-widest text-[#FF3300] font-bold">
              Browse Categories
            </h2>
            <p className="text-sm font-sans text-gray-500">Select any filter tab to isolate specific utilities.</p>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full" role="tablist" aria-label="Tool Categories">
            <button
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md border whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${
                activeCategory === 'all'
                  ? 'bg-[#141414] border-[#141414] text-white font-bold'
                  : 'bg-white border-gray-200 text-gray-600 hover:text-black hover:border-gray-450'
              }`}
            >
              All ({CATEGORIES.reduce((v, c) => v + c.tools.length, 0)})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md border whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${
                  activeCategory === cat.id
                    ? 'bg-[#FF3300] border-[#FF3300] text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-black hover:border-gray-450'
                }`}
              >
                {cat.title.replace(' PDF', '')}
              </button>
            ))}
          </div>
        </div>

        {/* High Density Minimalist Directory List */}
        <div className="bg-white/40 border border-[#141414]/10 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {filteredCategories.map((category) => {
              const CatIcon = category.icon;
              return (
                <div key={category.id} className="space-y-3">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold pb-1 border-b border-gray-150 flex items-center gap-1.5">
                    {CatIcon && <CatIcon size={12} className="text-[#FF3300]" aria-hidden="true" />}
                    <span>{category.title}</span>
                  </h3>
                  <div className="space-y-1">
                    {category.tools.map((tool) => {
                      const TIcon = tool.icon;
                      const isLive = isToolLive(tool.id);
                      return (
                        <div
                          key={tool.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Launch tool: ${tool.name} (${isLive ? 'Live' : 'WIP'})`}
                          onClick={() => onToolClick(tool)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onToolClick(tool);
                            }
                          }}
                          className={`group flex items-center justify-between p-2 rounded-md border border-transparent transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${
                            isLive
                              ? 'hover:bg-white hover:border-[#141414]/15'
                              : 'opacity-75 hover:bg-amber-50/50 hover:border-amber-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TIcon size={14} className={`shrink-0 ${isLive ? 'text-[#FF3300]' : 'text-amber-700'}`} aria-hidden="true" />
                            <span
                              className={`text-xs font-bold truncate transition-colors ${
                                isLive ? 'text-gray-800 group-hover:text-[#FF3300]' : 'text-gray-600'
                              }`}
                            >
                              <BoltBrand text={tool.name} />
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            <span
                              className={`text-xs font-mono px-1 py-0.2 rounded font-black uppercase ${
                                isLive ? 'bg-[#FF3300]/10 text-[#FF3300]' : 'bg-amber-500/15 text-amber-900'
                              }`}
                            >
                              {isLive ? 'Live' : 'WIP'}
                            </span>
                            <ChevronRight size={10} className="text-gray-400 group-hover:text-black transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {filteredCategories.length === 0 && (
              <div className="col-span-3 text-center py-12 text-sm font-mono text-gray-500 uppercase">
                No directory items match your query
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
