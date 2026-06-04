import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsDown, ChevronsUp } from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type RenderTask,
} from 'pdfjs-dist';
import type { ComparisonReport } from '../compareTypes';
import {
  COMPARE_RENDER_MAX_WIDTH,
  diffPageNumbers,
  pageHasDiff,
  pageResultFor,
  paintVisualDiffOverlay,
  readCanvasImageData,
} from '../comparePdfUtils';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface ComparePdfViewerProps {
  fileA: File;
  fileB: File;
  pdfPasswords?: Record<string, string>;
  report: ComparisonReport | null;
}

type PaneSide = 'left' | 'right';

function friendlyPdfJsLoadError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  if (lower.includes('password') || lower.includes('encrypt')) {
    return 'Incorrect PDF password for this file. Check the password fields above.';
  }
  return raw || 'Could not load PDFs.';
}

export function ComparePdfViewer({ fileA, fileB, pdfPasswords, report }: ComparePdfViewerProps) {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftOverlayRef = useRef<HTMLCanvasElement>(null);
  const rightOverlayRef = useRef<HTMLCanvasElement>(null);
  const pdfARef = useRef<PDFDocumentProxy | null>(null);
  const pdfBRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskARef = useRef<RenderTask | null>(null);
  const renderTaskBRef = useRef<RenderTask | null>(null);
  const scrollSyncRef = useRef(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pagesA, setPagesA] = useState(0);
  const [pagesB, setPagesB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  const pageNum = pageIndex + 1;
  const maxPages = Math.max(pagesA, pagesB, 1);
  const diffPages = useMemo(() => diffPageNumbers(report), [report]);
  const currentRow = pageResultFor(report, pageNum);
  const pageDiff = pageHasDiff(currentRow);
  const hasPageA = pageNum <= pagesA;
  const hasPageB = pageNum <= pagesB;

  const diffIndex = diffPages.indexOf(pageNum);

  const goToPage = useCallback(
    (index: number) => {
      setPageIndex(Math.max(0, Math.min(index, maxPages - 1)));
    },
    [maxPages],
  );

  const goToDiff = useCallback(
    (direction: -1 | 1) => {
      if (diffPages.length === 0) {
        return;
      }
      const currentIdx = diffPages.indexOf(pageNum);
      let nextIdx: number;
      if (currentIdx < 0) {
        nextIdx = direction === 1 ? 0 : diffPages.length - 1;
      } else {
        nextIdx = (currentIdx + direction + diffPages.length) % diffPages.length;
      }
      goToPage(diffPages[nextIdx] - 1);
    },
    [diffPages, goToPage, pageNum],
  );

  const stepPage = useCallback(
    (direction: -1 | 1) => {
      if (showDiffOnly && diffPages.length > 0) {
        goToDiff(direction);
        return;
      }
      goToPage(pageIndex + direction);
    },
    [showDiffOnly, diffPages.length, goToDiff, goToPage, pageIndex],
  );

  const syncScroll = useCallback((source: PaneSide) => {
    if (scrollSyncRef.current) {
      return;
    }
    const from = source === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const to = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (!from || !to) {
      return;
    }
    scrollSyncRef.current = true;
    to.scrollTop = from.scrollTop;
    to.scrollLeft = from.scrollLeft;
    requestAnimationFrame(() => {
      scrollSyncRef.current = false;
    });
  }, []);

  const syncCanvasSizes = useCallback(
    (pixelW: number, pixelH: number, cssW: number, cssH: number) => {
      for (const canvas of [
        leftCanvasRef.current,
        rightCanvasRef.current,
        leftOverlayRef.current,
        rightOverlayRef.current,
      ]) {
        if (!canvas) {
          continue;
        }
        if (canvas.width !== pixelW || canvas.height !== pixelH) {
          canvas.width = pixelW;
          canvas.height = pixelH;
        }
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }
      setViewSize({ w: cssW, h: cssH });
    },
    [],
  );

  const paintDiffOverlays = useCallback(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    const leftOverlay = leftOverlayRef.current;
    const rightOverlay = rightOverlayRef.current;
    if (!leftCanvas || !rightCanvas || !leftOverlay || !rightOverlay) {
      return;
    }
    if (!hasPageA || !hasPageB) {
      for (const overlay of [leftOverlay, rightOverlay]) {
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, overlay.width, overlay.height);
      }
      return;
    }

    const leftData = readCanvasImageData(leftCanvas);
    const rightData = readCanvasImageData(rightCanvas);
    if (!leftData || !rightData) {
      return;
    }

    const w = leftCanvas.width;
    const h = leftCanvas.height;
    for (const overlay of [leftOverlay, rightOverlay]) {
      const ctx = overlay.getContext('2d');
      if (!ctx) {
        continue;
      }
      paintVisualDiffOverlay(ctx, w, h, leftData, rightData);
    }
  }, [hasPageA, hasPageB]);

  const renderPageToCanvas = useCallback(
    async (
      pdf: PDFDocumentProxy | null,
      canvas: HTMLCanvasElement | null,
      page: number,
      renderTaskRef: React.MutableRefObject<RenderTask | null>,
    ) => {
      if (!pdf || !canvas || page < 1 || page > pdf.numPages) {
        return null;
      }
      const pdfPage: PDFPageProxy = await pdf.getPage(page);
      const base = pdfPage.getViewport({ scale: 1 });
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      const fitScale = Math.min(COMPARE_RENDER_MAX_WIDTH / base.width, 2);
      const scale = fitScale * dpr;
      const viewport = pdfPage.getViewport({ scale });
      const cssW = Math.floor(viewport.width / dpr);
      const cssH = Math.floor(viewport.height / dpr);
      const pixelW = Math.floor(viewport.width);
      const pixelH = Math.floor(viewport.height);

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        return null;
      }
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } finally {
        renderTaskRef.current = null;
      }
      return { pixelW, pixelH, cssW, cssH };
    },
    [],
  );

  const renderCurrentPage = useCallback(async () => {
    renderTaskARef.current?.cancel();
    renderTaskBRef.current?.cancel();
    setRendering(true);

    try {
      let meta: { pixelW: number; pixelH: number; cssW: number; cssH: number } | null = null;

      if (hasPageA && leftCanvasRef.current) {
        meta = await renderPageToCanvas(
          pdfARef.current,
          leftCanvasRef.current,
          pageNum,
          renderTaskARef,
        );
      } else if (leftCanvasRef.current) {
        const ctx = leftCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, leftCanvasRef.current.width, leftCanvasRef.current.height);
      }

      if (hasPageB && rightCanvasRef.current) {
        const metaB = await renderPageToCanvas(
          pdfBRef.current,
          rightCanvasRef.current,
          pageNum,
          renderTaskBRef,
        );
        if (metaB) {
          meta = metaB;
        }
      } else if (rightCanvasRef.current) {
        const ctx = rightCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, rightCanvasRef.current.width, rightCanvasRef.current.height);
      }

      if (meta) {
        syncCanvasSizes(meta.pixelW, meta.pixelH, meta.cssW, meta.cssH);
      }

      if (report && hasPageA && hasPageB && pageDiff) {
        paintDiffOverlays();
      } else {
        for (const overlay of [leftOverlayRef.current, rightOverlayRef.current]) {
          const ctx = overlay?.getContext('2d');
          if (overlay && ctx) {
            ctx.clearRect(0, 0, overlay.width, overlay.height);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('cancel')) {
        setLoadError('Could not render this page.');
      }
    } finally {
      setRendering(false);
    }
  }, [
    hasPageA,
    hasPageB,
    pageDiff,
    pageNum,
    paintDiffOverlays,
    renderPageToCanvas,
    report,
    syncCanvasSizes,
  ]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      renderTaskARef.current?.cancel();
      renderTaskBRef.current?.cancel();
      if (pdfARef.current) {
        void pdfARef.current.destroy();
        pdfARef.current = null;
      }
      if (pdfBRef.current) {
        void pdfBRef.current.destroy();
        pdfBRef.current = null;
      }

      setPageIndex(0);
      setPagesA(0);
      setPagesB(0);
      setLoadError(null);
      setLoading(true);

      try {
        const [dataA, dataB] = await Promise.all([
          fileA.arrayBuffer(),
          fileB.arrayBuffer(),
        ]);
        if (cancelled) {
          return;
        }
        const initA = {
          password: pdfPasswords?.[fileA.name]?.trim() || undefined,
          disableAutoFetch: false,
          disableStream: false,
        };
        const initB = {
          password: pdfPasswords?.[fileB.name]?.trim() || undefined,
          disableAutoFetch: false,
          disableStream: false,
        };
        const [pdfA, pdfB] = await Promise.all([
          getDocument({ data: new Uint8Array(dataA), ...initA }).promise,
          getDocument({ data: new Uint8Array(dataB), ...initB }).promise,
        ]);
        if (cancelled) {
          void pdfA.destroy();
          void pdfB.destroy();
          return;
        }
        pdfARef.current = pdfA;
        pdfBRef.current = pdfB;
        setPagesA(pdfA.numPages);
        setPagesB(pdfB.numPages);
      } catch (err) {
        if (!cancelled) {
          setLoadError(friendlyPdfJsLoadError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      renderTaskARef.current?.cancel();
      renderTaskBRef.current?.cancel();
      if (pdfARef.current) {
        void pdfARef.current.destroy();
        pdfARef.current = null;
      }
      if (pdfBRef.current) {
        void pdfBRef.current.destroy();
        pdfBRef.current = null;
      }
    };
  }, [fileA, fileB, pdfPasswords]);

  useEffect(() => {
    if (loading || loadError) {
      return;
    }
    void renderCurrentPage();
  }, [loading, loadError, pageIndex, pagesA, pagesB, renderCurrentPage]);

  useEffect(() => {
    if (showDiffOnly && diffPages.length > 0 && !diffPages.includes(pageNum)) {
      goToPage(diffPages[0] - 1);
    }
  }, [showDiffOnly, diffPages, pageNum, goToPage]);

  const paneBody = (side: PaneSide) => {
    const hasPage = side === 'left' ? hasPageA : hasPageB;
    const scrollRef = side === 'left' ? leftScrollRef : rightScrollRef;
    const canvasRef = side === 'left' ? leftCanvasRef : rightCanvasRef;
    const overlayRef = side === 'left' ? leftOverlayRef : rightOverlayRef;
    const headerClass =
      side === 'left'
        ? 'bg-[#dce8f5] border-[#9cb4cc]'
        : 'bg-[#dcefdc] border-[#9cbc9c]';

    return (
      <div className={`flex flex-col min-w-0 flex-1 border ${headerClass.split(' ')[1]} border-t-0`}>
        <div
          className={`px-3 py-1.5 border-b text-sm font-mono truncate ${headerClass}`}
          title={side === 'left' ? fileA.name : fileB.name}
        >
          {side === 'left' ? fileA.name : fileB.name}
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto bg-[#f5f5f0] p-3 min-h-[320px] max-h-[min(70vh,640px)]"
          onScroll={() => syncScroll(side)}
        >
          {!hasPage ? (
            <div className="flex items-center justify-center h-48 text-xs font-mono text-gray-500 uppercase tracking-wider">
              No page {pageNum}
            </div>
          ) : (
            <div
              className="relative mx-auto shadow-md border border-gray-300/80 bg-white"
              style={{ width: viewSize.w || undefined, height: viewSize.h || undefined }}
            >
              <canvas ref={canvasRef} className="block" aria-hidden={false} />
              <canvas
                ref={overlayRef}
                className="absolute left-0 top-0 pointer-events-none"
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-[#141414] rounded-lg overflow-hidden bg-[#ebe9e4] shadow-xs">
      {/* Meld-style toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-[#d4d2cd] border-b border-[#141414]/30 text-sm font-mono">
        <button
          type="button"
          title="Previous difference"
          disabled={diffPages.length === 0}
          onClick={() => goToDiff(-1)}
          className="p-1 rounded hover:bg-black/10 disabled:opacity-40"
        >
          <ChevronsUp size={14} />
        </button>
        <button
          type="button"
          title="Next difference"
          disabled={diffPages.length === 0}
          onClick={() => goToDiff(1)}
          className="p-1 rounded hover:bg-black/10 disabled:opacity-40"
        >
          <ChevronsDown size={14} />
        </button>
        <span className="w-px h-4 bg-[#141414]/20 mx-0.5" />
        <button
          type="button"
          title="Previous page"
          disabled={pageIndex <= 0}
          onClick={() => stepPage(-1)}
          className="p-1 rounded hover:bg-black/10 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          title="Next page"
          disabled={pageIndex >= maxPages - 1}
          onClick={() => stepPage(1)}
          className="p-1 rounded hover:bg-black/10 disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
        <span className="px-2 tabular-nums">
          Page {pageNum} / {maxPages}
          {diffPages.length > 0 && diffIndex >= 0 && (
            <span className="text-gray-600">
              {' '}
              · diff {diffIndex + 1}/{diffPages.length}
            </span>
          )}
        </span>
        <span className="flex-1" />
        <label className="flex items-center gap-1.5 cursor-pointer select-none pr-1">
          <input
            type="checkbox"
            checked={showDiffOnly}
            onChange={(e) => setShowDiffOnly(e.target.checked)}
            disabled={diffPages.length === 0}
            className="accent-[#FF3300]"
          />
          Changed pages only
        </label>
      </div>

      {report && (
        <div
          className={`px-3 py-2 text-xs border-b ${
            report.overallMatch
              ? 'bg-emerald-100/80 text-emerald-950'
              : 'bg-amber-100/80 text-amber-950'
          }`}
        >
          {report.overallMatch ? 'Documents match' : 'Documents differ'} — {report.summary}
        </div>
      )}

      {!report && (
        <div className="px-3 py-2 text-xs bg-gray-100 border-b text-gray-600 font-mono">
          Run Compare to analyze text and layout differences. Preview is synced below.
        </div>
      )}

      {loadError && (
        <div className="px-3 py-2 text-xs text-red-800 bg-red-50 border-b">{loadError}</div>
      )}

      <div className="flex min-h-[360px]">
        {/* Changes list (Meld sidebar) */}
        <aside className="w-36 sm:w-44 shrink-0 border-r border-[#141414]/20 bg-[#e8e6e1] flex flex-col">
          <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-wider font-bold text-gray-700 border-b border-[#141414]/15">
            Changes
          </div>
          <div className="flex-1 overflow-y-auto text-xs font-mono">
            {!report && (
              <p className="p-2 text-gray-500 leading-relaxed">Compare to list changed pages.</p>
            )}
            {report && diffPages.length === 0 && (
              <p className="p-2 text-emerald-800 leading-relaxed">No differences found.</p>
            )}
            {report?.pageResults.map((row) => {
              const diff = pageHasDiff(row);
              const active = row.page === pageNum;
              return (
                <button
                  key={row.page}
                  type="button"
                  onClick={() => goToPage(row.page - 1)}
                  className={`w-full text-left px-2 py-1.5 border-b border-[#141414]/8 hover:bg-white/60 ${
                    active ? 'bg-white font-bold ring-1 ring-inset ring-[#FF3300]/50' : ''
                  } ${diff ? '' : 'text-gray-500'}`}
                >
                  <span className="flex items-center gap-1">
                    {diff ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3300] shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 shrink-0" />
                    )}
                    Page {row.page}
                  </span>
                  {diff && (
                    <span className="block text-xs text-gray-600 mt-0.5 pl-2.5">
                      {!row.textMatch && row.visualSimilarityPercent < 98.5
                        ? 'text · visual'
                        : !row.textMatch
                          ? 'text'
                          : 'visual'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Dual panes */}
        <div className="flex flex-1 min-w-0">
          {paneBody('left')}
          <div className="w-px bg-[#141414]/25 shrink-0" aria-hidden />
          {paneBody('right')}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-gray-600 bg-[#e0ded9] border-t border-[#141414]/15">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#dce8f5] border border-[#9cb4cc]" />
          Left (A)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#dcefdc] border border-[#9cbc9c]" />
          Right (B)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[rgba(255,153,51,0.55)]" />
          Changed regions
        </span>
        {(loading || rendering) && <span className="text-gray-500">Rendering…</span>}
      </div>
    </div>
  );
}
