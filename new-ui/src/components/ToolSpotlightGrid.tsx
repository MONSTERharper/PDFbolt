import React from 'react';
import { ChevronRight } from 'lucide-react';
import { isToolLive } from '../toolStatus';
import type { SuiteTool } from '../suiteCatalog';
import { BoltBrand } from './BoltBrand';

export function ToolSpotlightGrid({
  tools,
  onToolClick,
}: {
  tools: SuiteTool[];
  onToolClick: (tool: SuiteTool) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {tools.map((tool) => {
        const ToolIcon = tool.icon;
        const isLive = isToolLive(tool.id);
        return (
          <div
            key={tool.id}
            role="button"
            tabIndex={0}
            aria-label={`${tool.name}: ${tool.description} (${isLive ? 'Live' : 'WIP'})`}
            onClick={() => onToolClick(tool)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToolClick(tool);
              }
            }}
            className="group p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 relative overflow-hidden select-none hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 border-[#FF3300]/40 hover:border-[#FF3300] bg-gradient-to-br from-white to-[#FF3300]/[0.01] hover:shadow-[0_4px_20px_-2px_rgba(255,51,0,0.12)]"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#FF3300]/5 rounded-bl-full pointer-events-none" aria-hidden="true" />
            <div className="space-y-2.5 bg-transparent z-10">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg border bg-[#FF3300]/10 border-[#FF3300]/20 text-[#FF3300] group-hover:bg-[#FF3300] group-hover:text-white transition-all duration-200">
                  <ToolIcon size={14} strokeWidth={1.5} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs font-mono font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-[#FF3300] text-white">
                    <span>RUN</span>
                    <ChevronRight size={6} />
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#FF3300] transition-colors truncate w-full">
                  <BoltBrand text={tool.name} />
                </h3>
                <p className="text-sm text-gray-500 font-sans line-clamp-2 mt-0.5 leading-tight group-hover:text-gray-700 transition-colors">
                  {tool.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors pt-1.5 border-t border-[#141414]/[0.05] mt-auto z-10">
              <span className="truncate">Live</span>
              <ChevronRight size={8} className="transition-transform group-hover:translate-x-0.5 shrink-0 text-gray-400 group-hover:text-black" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
