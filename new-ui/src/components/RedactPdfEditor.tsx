import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type RenderTask,
} from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import {
  canvasRectToPdf,
  defaultRedactedFilename,
  pdfRectToCanvas,
  type CanvasRect,
  type RedactRegion,
} from '../redactPdfUtils';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MIN_BOX_PX = 6;
const RENDER_MAX_WIDTH = 800;
const FORENSIC_RASTER_SCALE = 2; // higher = sharper, larger output
const FORENSIC_JPEG_QUALITY = 0.92;

interface PageViewportMeta {
  scale: number;
  pageHeightPt: number;
  cssWidth: number;
  cssHeight: number;
}

export interface RedactPdfEditorProps {
  file: File | null;
  pdfPassword?: string;
  regions: RedactRegion[];
  onRegionsChange: (regions: RedactRegion[]) => void;
  onDownloaded?: (filename: string) => void;
  onError?: (message: string) => void;
}

export function RedactPdfEditor({
  file,
  pdfPassword,
  regions,
  onRegionsChange,
  onDownloaded,
  onError,
}: RedactPdfEditorProps) {
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayHitRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const viewportMetaRef = useRef<PageViewportMeta>({
    scale: 1,
    pageHeightPt: 0,
    cssWidth: 0,
    cssHeight: 0,
  });
  const regionsRef = useRef(regions);
  const draftRef = useRef<CanvasRect | null>(null);
  const rafPaintRef = useRef(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [docReady, setDocReady] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const pageNum = pageIndex + 1;
  const pageRegions = regions.filter((r) => r.pageNum === pageNum);

  regionsRef.current = regions;

  const pointerToCanvas = useCallback((clientX: number, clientY: number) => {
    const canvas = pageCanvasRef.current;
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

  const paintOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const meta = viewportMetaRef.current;
    if (!canvas || meta.pageHeightPt <= 0) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
    for (const region of regionsRef.current) {
      if (region.pageNum !== pageNum) {
        continue;
      }
      const r = pdfRectToCanvas(region, meta.pageHeightPt, meta.scale);
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    const draft = draftRef.current;
    if (draft && draft.w >= MIN_BOX_PX && draft.h >= MIN_BOX_PX) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(draft.x, draft.y, draft.w, draft.h);
      ctx.strokeStyle = '#FF3300';
      ctx.lineWidth = 2;
      ctx.strokeRect(draft.x, draft.y, draft.w, draft.h);
    }
  }, [pageNum]);

  const scheduleOverlayPaint = useCallback(() => {
    cancelAnimationFrame(rafPaintRef.current);
    rafPaintRef.current = requestAnimationFrame(() => paintOverlay());
  }, [paintOverlay]);

  const syncCanvasSizes = useCallback((pixelWidth: number, pixelHeight: number, cssWidth: number, cssHeight: number) => {
    for (const canvas of [pageCanvasRef.current, overlayCanvasRef.current]) {
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
  }, []);

  const renderPdfPage = useCallback(async () => {
    const pdf = pdfRef.current;
    const canvas = pageCanvasRef.current;
    if (!pdf || !canvas || !docReady) {
      return;
    }

    renderTaskRef.current?.cancel();
    setPageRendering(true);

    let page: PDFPageProxy | null = null;
    try {
      page = await pdf.getPage(pageNum);
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      const fitScale = Math.min(RENDER_MAX_WIDTH / base.width, 2);
      const scale = fitScale * dpr;
      const viewport = page.getViewport({ scale });

      const cssWidth = Math.floor(viewport.width / dpr);
      const cssHeight = Math.floor(viewport.height / dpr);
      const pixelWidth = Math.floor(viewport.width);
      const pixelHeight = Math.floor(viewport.height);

      viewportMetaRef.current = {
        scale: fitScale,
        pageHeightPt: base.height,
        cssWidth,
        cssHeight,
      };

      syncCanvasSizes(pixelWidth, pixelHeight, cssWidth, cssHeight);
      setViewSize({ w: cssWidth, h: cssHeight });

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        return;
      }

      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;

      paintOverlay();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('cancel')) {
        setLoadError('Could not render this page.');
      }
    } finally {
      setPageRendering(false);
      renderTaskRef.current = null;
    }
  }, [docReady, pageNum, paintOverlay, syncCanvasSizes]);

  // Load PDF document once per file
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
      draftRef.current = null;

      if (!file) {
        onRegionsChange([]);
        return;
      }

      setDocLoading(true);
      onRegionsChange([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when file changes
  }, [file, pdfPassword]);

  // Render page bitmap only when document is ready or page index changes
  useEffect(() => {
    if (!docReady) {
      return;
    }
    void renderPdfPage();
    return () => {
      renderTaskRef.current?.cancel();
    };
  }, [docReady, pageIndex, renderPdfPage]);

  // Repaint overlay when committed regions change (no PDF re-render)
  useEffect(() => {
    if (docReady) {
      paintOverlay();
    }
  }, [regions, docReady, pageNum, paintOverlay]);

  const commitDraft = useCallback(
    (rect: CanvasRect) => {
      const meta = viewportMetaRef.current;
      if (rect.w < MIN_BOX_PX || rect.h < MIN_BOX_PX || meta.pageHeightPt <= 0) {
        return;
      }
      const pdfRect = canvasRectToPdf(rect, meta.pageHeightPt, meta.scale);
      onRegionsChange([
        ...regionsRef.current,
        {
          pageNum,
          x: pdfRect.x,
          y: pdfRect.y,
          w: pdfRect.w,
          h: pdfRect.h,
        },
      ]);
    },
    [onRegionsChange, pageNum],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (docLoading || pageRendering || !file || !docReady) {
      return;
    }
    overlayHitRef.current?.setPointerCapture(e.pointerId);
    const pt = pointerToCanvas(e.clientX, e.clientY);
    dragStartRef.current = pt;
    draftRef.current = { x: pt.x, y: pt.y, w: 0, h: 0 };
    setIsDragging(true);
    scheduleOverlayPaint();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const dragStart = dragStartRef.current;
    if (!dragStart) {
      return;
    }
    const pt = pointerToCanvas(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, pt.x);
    const y = Math.min(dragStart.y, pt.y);
    const w = Math.abs(pt.x - dragStart.x);
    const h = Math.abs(pt.y - dragStart.y);
    draftRef.current = { x, y, w, h };
    scheduleOverlayPaint();
  };

  const finishPointer = (e: React.PointerEvent) => {
    const dragStart = dragStartRef.current;
    if (!dragStart) {
      return;
    }
    if (overlayHitRef.current?.hasPointerCapture(e.pointerId)) {
      overlayHitRef.current.releasePointerCapture(e.pointerId);
    }
    const pt = pointerToCanvas(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, pt.x);
    const y = Math.min(dragStart.y, pt.y);
    const w = Math.abs(pt.x - dragStart.x);
    const h = Math.abs(pt.y - dragStart.y);
    dragStartRef.current = null;
    draftRef.current = null;
    setIsDragging(false);
    commitDraft({ x, y, w, h });
    scheduleOverlayPaint();
  };

  const removeRegionAt = (globalIndex: number) => {
    onRegionsChange(regions.filter((_, i) => i !== globalIndex));
  };

  const clearPage = () => {
    onRegionsChange(regions.filter((r) => r.pageNum !== pageNum));
  };

  const clearAll = () => onRegionsChange([]);

  const toJpegBytes = async (canvas: HTMLCanvasElement): Promise<Uint8Array> => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not encode JPEG preview.'))),
        'image/jpeg',
        FORENSIC_JPEG_QUALITY,
      );
    });
    return new Uint8Array(await blob.arrayBuffer());
  };

  const buildForensicRedactedPdf = async (): Promise<Uint8Array> => {
    const src = pdfRef.current;
    if (!src) {
      throw new Error('PDF preview is not ready yet.');
    }
    const out = await PDFDocument.create();

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const scale = FORENSIC_RASTER_SCALE * dpr;

    for (let p = 1; p <= src.numPages; p++) {
      const page = await src.getPage(p);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        throw new Error('Canvas is not available for forensic redaction.');
      }

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Burn in black rectangles (PDF space → canvas pixels)
      ctx.fillStyle = 'rgb(0, 0, 0)';
      for (const r of regionsRef.current) {
        if (r.pageNum !== p) continue;
        const xPx = r.x * scale;
        const yPx = (base.height - r.y - r.h) * scale;
        const wPx = r.w * scale;
        const hPx = r.h * scale;
        if (wPx > 0 && hPx > 0) {
          ctx.fillRect(xPx, yPx, wPx, hPx);
        }
      }

      const jpgBytes = await toJpegBytes(canvas);
      const img = await out.embedJpg(jpgBytes);
      const outPage = out.addPage([base.width, base.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    }

    return await out.save();
  };

  const handleDownload = async () => {
    if (!file || regions.length === 0) {
      onError?.('Draw at least one black box on the PDF first.');
      return;
    }
    setDownloading(true);
    try {
      const bytes = await buildForensicRedactedPdf();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const filename = defaultRedactedFilename(file.name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onDownloaded?.(filename);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Redaction failed.');
    } finally {
      setDownloading(false);
    }
  };

  const showBlockingLoader = docLoading;
  const showPageSpinner = pageRendering && !docLoading && !isDragging;

  if (!file) {
    return (
      <p className="text-[10px] font-mono text-gray-500">
        Upload a PDF above, then drag on the page to draw black redaction boxes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-mono text-amber-900 leading-relaxed">
        <strong className="uppercase tracking-wider">Permanent redaction</strong> — drag on the page to place
        black boxes. The downloaded PDF bakes the boxes into the page image, so the covered content cannot be
        selected or copied afterward.
      </div>

      {loadError && (
        <p className="text-[10px] font-mono text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded">
          {loadError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageIndex <= 0 || docLoading || !docReady}
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
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
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            className="p-2 border border-[#141414] bg-white disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="text-[9px] font-mono text-gray-500">Click and drag to draw a black box</p>
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
          <div className="absolute top-2 right-2 z-20 rounded bg-white/90 border border-[#141414] px-2 py-1 text-[9px] font-mono">
            Rendering page…
          </div>
        )}

        <canvas ref={pageCanvasRef} className="block max-w-full h-auto" />
        <canvas
          ref={overlayCanvasRef}
          className="absolute left-0 top-0 max-w-full h-auto pointer-events-none"
          aria-hidden
        />
        <div
          ref={overlayHitRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          style={{
            width: viewSize.w > 0 ? viewSize.w : '100%',
            height: viewSize.h > 0 ? viewSize.h : '100%',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          aria-label="Draw redaction rectangle"
        />
      </div>

      {pageRegions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase font-bold text-gray-600">
              Boxes on this page ({pageRegions.length})
            </span>
            <button
              type="button"
              onClick={clearPage}
              className="text-[9px] font-mono uppercase text-[#FF3300] hover:underline"
            >
              Clear page
            </button>
          </div>
          <ul className="space-y-1">
            {regions.map((r, globalIndex) =>
              r.pageNum === pageNum ? (
                <li
                  key={globalIndex}
                  className="flex items-center justify-between text-[10px] font-mono border border-gray-200 px-2 py-1"
                >
                  <span>Box {globalIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeRegionAt(globalIndex)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Remove box ${globalIndex + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      {regions.length > 0 && (
        <p className="text-[9px] font-mono text-gray-500">
          {regions.length} box{regions.length === 1 ? '' : 'es'} total across all pages.{' '}
          <button type="button" onClick={clearAll} className="text-[#FF3300] hover:underline">
            Clear all
          </button>
        </p>
      )}

      <button
        type="button"
        disabled={regions.length === 0 || downloading || docLoading || !docReady}
        onClick={() => void handleDownload()}
        className="w-full flex items-center justify-center gap-2 py-4 font-black text-sm uppercase tracking-tighter border-2 border-[#141414] bg-[#141414] text-white shadow-[4px_4px_0px_#FF3300] disabled:bg-[#DCDAD5] disabled:text-neutral-600 disabled:shadow-none disabled:border-[#141414]/40"
      >
        <Download size={18} />
        {downloading ? 'Preparing download…' : 'Download redacted PDF'}
      </button>
    </div>
  );
}
