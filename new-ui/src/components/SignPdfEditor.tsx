import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type PageViewport,
  type RenderTask,
} from 'pdfjs-dist';
import {
  canvasHasInk,
  canvasInkBounds,
  canvasBoundsToPdfPlacement,
  canvasInkRegions,
  capturePageInkExportMeta,
  cropCanvasToBlob,
  expandSignaturesToAllPages,
  exportInkCanvasSignature,
  exportStrokeSignature,
  imageDataHasInk,
  type PageInkExportMeta,
  type SignScope,
  type SignaturePlacement,
} from '../signPdfUtils';

const RENDER_MAX_WIDTH = 800;
const INK_LINE_WIDTH = 2.5;

function isRenderCancelled(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes('cancel') || msg.includes('abort');
}

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PageViewportMeta {
  pixelScale: number;
  pageHeightPt: number;
  pageWidthPt: number;
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  viewport: PageViewport;
}

export interface SignPdfExport {
  blob: Blob;
  placement: SignaturePlacement;
}

export interface SignPdfEditorHandle {
  getSignatures: () => Promise<SignPdfExport[]>;
  hasSignature: () => boolean;
}

export interface SignPdfEditorProps {
  file: File | null;
  pdfPassword?: string;
  placement: SignaturePlacement;
  onPlacementChange: (placement: SignaturePlacement) => void;
  onSignatureChange?: (ready: boolean) => void;
}

export const SignPdfEditor = forwardRef<SignPdfEditorHandle, SignPdfEditorProps>(
  function SignPdfEditor({ file, pdfPassword, onPlacementChange, onSignatureChange }, ref) {
    const pageCanvasRef = useRef<HTMLCanvasElement>(null);
    const inkCanvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<PDFDocumentProxy | null>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);
    const viewportMetaRef = useRef<PageViewportMeta>({
      pixelScale: 1,
      pageHeightPt: 0,
      pageWidthPt: 0,
      cssWidth: 0,
      cssHeight: 0,
      pixelWidth: 0,
      pixelHeight: 0,
      viewport: { width: 0, height: 0, convertToPdfPoint: () => [0, 0] } as PageViewport,
    });
    const pageInkRef = useRef<Map<number, ImageData>>(new Map());
    const pageMetaStoreRef = useRef<Map<number, PageInkExportMeta>>(new Map());
    const completedStrokesRef = useRef<SignPdfExport[]>([]);
    const inkBeforeStrokeRef = useRef<ImageData | null>(null);
    const lastRenderedPageRef = useRef<number | null>(null);
    const renderGenRef = useRef(0);
    const isDrawingRef = useRef(false);

    const [pageIndex, setPageIndex] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [docReady, setDocReady] = useState(false);
    const [docLoading, setDocLoading] = useState(false);
    const [pageRendering, setPageRendering] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [signScope, setSignScope] = useState<SignScope>('current-page');

    const pageNum = pageIndex + 1;

    const anyPageHasInk = useCallback(() => {
      if (completedStrokesRef.current.length > 0) {
        return true;
      }
      const canvas = inkCanvasRef.current;
      if (canvas && canvasHasInk(canvas)) {
        return true;
      }
      for (const data of pageInkRef.current.values()) {
        if (imageDataHasInk(data)) {
          return true;
        }
      }
      return false;
    }, []);

    const notifySignatureChange = useCallback(() => {
      onSignatureChange?.(anyPageHasInk());
    }, [anyPageHasInk, onSignatureChange]);

    const persistCurrentInk = useCallback(() => {
      const canvas = inkCanvasRef.current;
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      if (!canvasHasInk(canvas)) {
        pageInkRef.current.delete(pageNum);
        return;
      }
      pageInkRef.current.set(pageNum, ctx.getImageData(0, 0, canvas.width, canvas.height));
    }, [pageNum]);

    const restorePageInk = useCallback(() => {
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const saved = pageInkRef.current.get(pageNum);
      if (saved && saved.width === canvas.width && saved.height === canvas.height) {
        ctx.putImageData(saved, 0, 0);
      } else if (saved) {
        pageInkRef.current.delete(pageNum);
      }
    }, [pageNum]);

    const syncPlacementFromInk = useCallback(() => {
      const canvas = inkCanvasRef.current;
      const meta = viewportMetaRef.current;
      if (!canvas || !canvasHasInk(canvas) || meta.pageHeightPt <= 0) {
        return;
      }
      const bounds = canvasInkBounds(canvas);
      if (!bounds) {
        return;
      }
      const pdfRect = canvasBoundsToPdfPlacement(
        bounds,
        meta.pixelWidth,
        meta.pixelHeight,
        meta.viewport,
        pageNum,
      );
      onPlacementChange(pdfRect);
    }, [onPlacementChange, pageNum]);

    const buildInkCanvasForPage = useCallback((targetPage: number): HTMLCanvasElement | null => {
      const meta = pageMetaStoreRef.current.get(targetPage);
      if (!meta) {
        return null;
      }
      const canvas = document.createElement('canvas');
      canvas.width = meta.pixelWidth;
      canvas.height = meta.pixelHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }
      if (targetPage === pageNum && inkCanvasRef.current?.width === meta.pixelWidth) {
        ctx.drawImage(inkCanvasRef.current, 0, 0);
        return canvas;
      }
      const saved = pageInkRef.current.get(targetPage);
      if (saved && saved.width === meta.pixelWidth && saved.height === meta.pixelHeight) {
        ctx.putImageData(saved, 0, 0);
        return canvas;
      }
      return null;
    }, [pageNum]);

    const collectSignedPages = useCallback((): number[] => {
      persistCurrentInk();
      const pages = new Set<number>();
      for (const [p, data] of pageInkRef.current.entries()) {
        if (imageDataHasInk(data)) {
          pages.add(p);
        }
      }
      if (inkCanvasRef.current && canvasHasInk(inkCanvasRef.current)) {
        pages.add(pageNum);
      }
      return [...pages].sort((a, b) => a - b);
    }, [pageNum, persistCurrentInk]);

    useImperativeHandle(
      ref,
      () => ({
        hasSignature: () => anyPageHasInk(),
        getSignatures: async () => {
          persistCurrentInk();
          let strokes: SignPdfExport[] = [];
          if (completedStrokesRef.current.length > 0) {
            strokes = [...completedStrokesRef.current];
          } else {
            const signedPages = collectSignedPages();
            for (const signedPage of signedPages) {
              const inkCanvas = buildInkCanvasForPage(signedPage);
              const meta = pageMetaStoreRef.current.get(signedPage);
              if (!inkCanvas || !meta) {
                continue;
              }
              const regions = canvasInkRegions(inkCanvas);
              if (regions.length > 1) {
                for (const bounds of regions) {
                  const placement = canvasBoundsToPdfPlacement(
                    bounds,
                    meta.pixelWidth,
                    meta.pixelHeight,
                    meta.viewport,
                    signedPage,
                  );
                  const blob = await cropCanvasToBlob(inkCanvas, bounds);
                  if (blob && blob.size >= 20) {
                    strokes.push({ blob, placement });
                  }
                }
                continue;
              }
              const exported = await exportInkCanvasSignature(inkCanvas, meta, signedPage);
              if (exported) {
                strokes.push(exported);
              }
            }
          }

          if (signScope === 'all-pages' && pageCount > 0) {
            strokes = expandSignaturesToAllPages(strokes, pageCount);
          }

          if (strokes.length > 0) {
            onPlacementChange(strokes[strokes.length - 1].placement);
          }
          return strokes;
        },
      }),
      [anyPageHasInk, buildInkCanvasForPage, collectSignedPages, onPlacementChange, pageCount, persistCurrentInk, signScope],
    );

    const pointerToInkCanvas = useCallback((clientX: number, clientY: number) => {
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return { x: 0, y: 0 };
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }, []);

    const syncCanvasSizes = useCallback(
      (pixelWidth: number, pixelHeight: number, cssWidth: number, cssHeight: number) => {
        for (const canvas of [pageCanvasRef.current, inkCanvasRef.current]) {
          if (!canvas) {
            continue;
          }
          if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
          }
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${cssHeight}px`;
        }
      },
      [],
    );

    const renderPdfPage = useCallback(async () => {
      const pdf = pdfRef.current;
      const canvas = pageCanvasRef.current;
      if (!pdf || !canvas || !docReady) {
        return;
      }

      renderTaskRef.current?.cancel();
      const renderGen = ++renderGenRef.current;
      setPageRendering(true);

      try {
        const page = await pdf.getPage(pageNum);
        if (renderGen !== renderGenRef.current) {
          return;
        }
        const baseViewport = page.getViewport({ scale: 1 });
        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
        const fitScale = Math.min(RENDER_MAX_WIDTH / baseViewport.width, 2);
        const pixelScale = fitScale * dpr;
        const viewport = page.getViewport({ scale: pixelScale });

        const cssWidth = Math.floor(viewport.width / dpr);
        const cssHeight = Math.floor(viewport.height / dpr);
        const pixelWidth = Math.floor(viewport.width);
        const pixelHeight = Math.floor(viewport.height);
        const boundViewport = {
          width: baseViewport.width,
          height: baseViewport.height,
          convertToPdfPoint: baseViewport.convertToPdfPoint.bind(baseViewport),
        } as PageViewport;

        viewportMetaRef.current = {
          pixelScale,
          pageHeightPt: baseViewport.height,
          pageWidthPt: baseViewport.width,
          cssWidth,
          cssHeight,
          pixelWidth,
          pixelHeight,
          viewport: boundViewport,
        };
        pageMetaStoreRef.current.set(
          pageNum,
          capturePageInkExportMeta(baseViewport, pixelWidth, pixelHeight),
        );

        const inkCanvas = inkCanvasRef.current;
        const isPageChange =
          lastRenderedPageRef.current !== null && lastRenderedPageRef.current !== pageNum;
        if (inkCanvas && !isPageChange && canvasHasInk(inkCanvas)) {
          const inkCtx = inkCanvas.getContext('2d');
          if (
            inkCtx &&
            (inkCanvas.width !== pixelWidth || inkCanvas.height !== pixelHeight)
          ) {
            pageInkRef.current.set(
              pageNum,
              inkCtx.getImageData(0, 0, inkCanvas.width, inkCanvas.height),
            );
          }
        }

        syncCanvasSizes(pixelWidth, pixelHeight, cssWidth, cssHeight);
        setViewSize({ w: cssWidth, h: cssHeight });

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pixelWidth, pixelHeight);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;

        if (renderGen !== renderGenRef.current) {
          return;
        }

        restorePageInk();
        lastRenderedPageRef.current = pageNum;
        setLoadError(null);
      } catch (err) {
        if (renderGen !== renderGenRef.current) {
          return;
        }
        if (!isRenderCancelled(err)) {
          setLoadError('Could not render this page.');
        }
      } finally {
        setPageRendering(false);
        renderTaskRef.current = null;
      }
    }, [docReady, pageNum, restorePageInk, syncCanvasSizes]);

    useEffect(() => {
      let cancelled = false;

      const load = async () => {
        renderTaskRef.current?.cancel();
        if (pdfRef.current) {
          void pdfRef.current.destroy();
          pdfRef.current = null;
        }

        setPageIndex(0);
        setPageCount(0);
        setDocReady(false);
        setLoadError(null);
        pageInkRef.current.clear();
        pageMetaStoreRef.current.clear();
        completedStrokesRef.current = [];
        inkBeforeStrokeRef.current = null;
        lastRenderedPageRef.current = null;
        setSignScope('current-page');

        if (!file) {
          onSignatureChange?.(false);
          return;
        }

        setDocLoading(true);

        try {
          const data = new Uint8Array(await file.arrayBuffer());
          if (cancelled) {
            return;
          }
          const pdf = await getDocument({
            data,
            password: pdfPassword?.trim() || undefined,
            disableAutoFetch: false,
            disableStream: false,
          }).promise;
          if (cancelled) {
            void pdf.destroy();
            return;
          }
          pdfRef.current = pdf;
          setPageCount(pdf.numPages);
          setPageIndex(0);
          setDocReady(true);
        } catch (err) {
          if (!cancelled) {
            const raw = err instanceof Error ? err.message : String(err);
            const lower = raw.toLowerCase();
            if (lower.includes('password') || lower.includes('encrypt')) {
              setLoadError(
                'Incorrect PDF password. Enter the document open password in the banner above.',
              );
            } else {
              setLoadError(raw || 'Could not load PDF preview.');
            }
          }
        } finally {
          if (!cancelled) {
            setDocLoading(false);
          }
        }
      };

      void load();

      return () => {
        cancelled = true;
        renderTaskRef.current?.cancel();
        if (pdfRef.current) {
          void pdfRef.current.destroy();
          pdfRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when file/password changes
    }, [file, pdfPassword]);

    useEffect(() => {
      if (!docReady) {
        return;
      }
      void renderPdfPage();
      return () => {
        renderGenRef.current += 1;
        renderTaskRef.current?.cancel();
      };
    }, [docReady, pageIndex, renderPdfPage]);

    const goToPage = useCallback(
      (nextIndex: number) => {
        if (nextIndex === pageIndex) {
          return;
        }
        persistCurrentInk();
        setPageIndex(nextIndex);
      },
      [pageIndex, persistCurrentInk],
    );

    const startDrawing = (clientX: number, clientY: number) => {
      if (docLoading || pageRendering || !docReady) {
        return;
      }
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = INK_LINE_WIDTH * (canvas.width / (viewSize.w || canvas.width));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const point = pointerToInkCanvas(clientX, clientY);
      inkBeforeStrokeRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      isDrawingRef.current = true;
      setIsDrawing(true);
    };

    const drawStroke = (clientX: number, clientY: number) => {
      if (!isDrawingRef.current) {
        return;
      }
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const point = pointerToInkCanvas(clientX, clientY);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

    const commitStroke = async () => {
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return;
      }
      const meta =
        pageMetaStoreRef.current.get(pageNum) ??
        (viewportMetaRef.current.pixelWidth > 0
          ? capturePageInkExportMeta(
              viewportMetaRef.current.viewport,
              viewportMetaRef.current.pixelWidth,
              viewportMetaRef.current.pixelHeight,
            )
          : null);
      if (!meta) {
        return;
      }
      const exported = await exportStrokeSignature(
        canvas,
        inkBeforeStrokeRef.current,
        meta,
        pageNum,
      );
      inkBeforeStrokeRef.current = null;
      if (exported) {
        completedStrokesRef.current.push(exported);
      }
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) {
        return;
      }
      isDrawingRef.current = false;
      setIsDrawing(false);
      void commitStroke().finally(() => {
        syncPlacementFromInk();
        persistCurrentInk();
        notifySignatureChange();
      });
    };

    const clearPageInk = () => {
      const canvas = inkCanvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pageInkRef.current.delete(pageNum);
      completedStrokesRef.current = completedStrokesRef.current.filter(
        (stroke) => stroke.placement.pageNum !== pageNum,
      );
      inkBeforeStrokeRef.current = null;
      notifySignatureChange();
    };

    const onInkPointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startDrawing(e.clientX, e.clientY);
    };

    const onInkPointerMove = (e: React.PointerEvent) => {
      if (!isDrawingRef.current) {
        return;
      }
      e.preventDefault();
      drawStroke(e.clientX, e.clientY);
    };

    const onInkPointerUp = (e: React.PointerEvent) => {
      e.preventDefault();
      stopDrawing();
    };

    const showBlockingLoader = docLoading;
    const showPageSpinner = pageRendering && !docLoading;

    if (!file) {
      return (
        <p className="text-xs font-mono text-gray-500">
          Upload a PDF above, then draw your signature directly on the page.
        </p>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-mono text-amber-900 leading-relaxed">
          <strong className="uppercase tracking-wider">Sign on the document</strong> — use your
          mouse or finger to draw directly on the PDF page, like DocuSign. When you are happy with
          it, click Run to download the signed file.
        </div>

        {loadError && (
          <p className="text-xs font-mono text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded">
            {loadError}
          </p>
        )}

        <div className="space-y-2 max-w-lg">
          <label className="text-xs font-mono uppercase text-gray-600 font-bold block">
            Apply signature to
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={docLoading || !docReady}
              onClick={() => setSignScope('current-page')}
              className={`border-2 border-[#141414] px-3 py-2 text-xs font-mono uppercase font-bold transition-all disabled:opacity-40 ${
                signScope === 'current-page'
                  ? 'bg-[#FF3300] text-white shadow-[3px_3px_0px_#141414]'
                  : 'bg-white hover:bg-[#141414] hover:text-[#E4E3E0]'
              }`}
            >
              Each page you draw on
            </button>
            <button
              type="button"
              disabled={docLoading || !docReady || pageCount < 2}
              onClick={() => setSignScope('all-pages')}
              className={`border-2 border-[#141414] px-3 py-2 text-xs font-mono uppercase font-bold transition-all disabled:opacity-40 ${
                signScope === 'all-pages'
                  ? 'bg-[#FF3300] text-white shadow-[3px_3px_0px_#141414]'
                  : 'bg-white hover:bg-[#141414] hover:text-[#E4E3E0]'
              }`}
            >
              Every page
            </button>
          </div>
          <p className="text-xs font-mono text-gray-500 leading-relaxed">
            {signScope === 'all-pages'
              ? 'Draw once — the same signature is placed at the same spot on all pages when you run the tool.'
              : 'Only pages where you draw are signed. Use the page arrows to sign other pages.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageIndex <= 0 || docLoading || !docReady}
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              className="p-2 border border-[#141414] bg-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono min-w-[7rem] text-center">
              Page {pageNum} / {pageCount || '—'}
            </span>
            <button
              type="button"
              disabled={pageIndex >= pageCount - 1 || docLoading || !docReady}
              onClick={() => goToPage(Math.min(pageCount - 1, pageIndex + 1))}
              className="p-2 border border-[#141414] bg-white disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={clearPageInk}
            disabled={docLoading || !docReady}
            className="bg-gray-100 border border-[#141414]/15 px-3 py-1.5 font-mono text-xs uppercase font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            Clear this page
          </button>
        </div>

        <div
          className="relative inline-block max-w-full border-2 border-[#141414] shadow-[4px_4px_0px_#141414] bg-[#E8E6E1]"
          style={{
            width: viewSize.w > 0 ? viewSize.w : undefined,
            minWidth: viewSize.w > 0 ? viewSize.w : 280,
            minHeight: viewSize.h > 0 ? viewSize.h : 360,
          }}
        >
          {showBlockingLoader && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#E8E6E1] text-xs font-mono">
              Opening PDF…
            </div>
          )}

          {showPageSpinner && (
            <div className="absolute top-2 right-2 z-20 rounded bg-white/90 border border-[#141414] px-2 py-1 text-xs font-mono">
              Rendering page…
            </div>
          )}

          <canvas ref={pageCanvasRef} className="block max-w-full h-auto" />
          <canvas
            ref={inkCanvasRef}
            className={`absolute left-0 top-0 max-w-full h-auto touch-none ${
              isDrawing ? 'cursor-crosshair' : 'cursor-crosshair'
            }`}
            style={{
              width: viewSize.w > 0 ? viewSize.w : '100%',
              height: viewSize.h > 0 ? viewSize.h : '100%',
            }}
            onPointerDown={onInkPointerDown}
            onPointerMove={onInkPointerMove}
            onPointerUp={onInkPointerUp}
            onPointerLeave={onInkPointerUp}
            onPointerCancel={onInkPointerUp}
            aria-label="Draw your signature directly on the PDF page"
          />
        </div>

        <p className="text-xs font-mono text-gray-500">
          Tip: draw in the signature line or empty area. Switch pages to sign elsewhere, or choose
          &ldquo;Every page&rdquo; above to repeat one signature on the whole document.
        </p>
      </div>
    );
  },
);
