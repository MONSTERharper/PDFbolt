import React from 'react';
import { Settings, CheckCircle2, ChevronRight } from 'lucide-react';
import { BannerAd } from '../components/AdPlacement';
import { BoltToolUpload } from '../components/BoltToolUpload';
import { RedactPdfEditor } from '../components/RedactPdfEditor';
import { SignPdfEditor } from '../components/SignPdfEditor';
import { ComparePdfViewer } from '../components/ComparePdfViewer';
import { EncryptedPdfBanner } from '../components/EncryptedPdfBanner';
import { BoltBrand } from '../components/BoltBrand';
import { boltExecuteLabel, boltToolName } from '../toolLabels';
import { toolInputReady } from '../toolUploadConfig';
import {
  COMPRESS_LEVEL_OPTIONS,
  compressLevelHoverHint,
} from '../backendBridge';
import { passwordForFile } from '../pdfPasswordUtils';
import { isToolLive, wipReason } from '../toolStatus';
import { boundedIntFromInput } from '../parseNumber';
import type { SuiteTool } from '../suiteCatalog';
import type { ToolPageBindings } from '../toolPageBindings';

export type { ToolPageBindings };

export function ToolPage({ tool, bindings }: { tool: SuiteTool; bindings: ToolPageBindings }) {
  const {
    goToView,
    setComparisonReport,
    file,
    setFile,
    extraFiles,
    setExtraFiles,
    compareFile2,
    setCompareFile2,
    toolText,
    setToolText,
    toolTitle,
    setToolTitle,
    htmlInputMode,
    setHtmlInputMode,
    fileUploadFeedback,
    setFileUploadFeedback,
    onPrimaryPdfSelected,
    onPrimaryPdfInvalid,
    pdfGate,
    encryptedPdfEntries,
    redactRegions,
    setRedactRegions,
    comparisonReport,
    isProcessing,
    handleExecuteTool,
    splitRange,
    setSplitRange,
    deletePageStr,
    setDeletePageStr,
    extractPageStr,
    setExtractPageStr,
    orderStr,
    setOrderStr,
    ocrLang,
    setOcrLang,
    rotationAngle,
    setRotationAngle,
    rotationScope,
    setRotationScope,
    pageNumFormat,
    setPageNumFormat,
    pageNumSize,
    setPageNumSize,
    pageNumAlign,
    setPageNumAlign,
    watermarkText,
    setWatermarkText,
    watermarkSize,
    setWatermarkSize,
    watermarkAngle,
    setWatermarkAngle,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkColor,
    setWatermarkColor,
    cropLeft,
    setCropLeft,
    cropRight,
    setCropRight,
    cropTop,
    setCropTop,
    cropBottom,
    setCropBottom,
    metadataTitle,
    setMetadataTitle,
    metadataAuthor,
    setMetadataAuthor,
    metadataSubject,
    setMetadataSubject,
    metadataCreator,
    setMetadataCreator,
    protectPass,
    setProtectPass,
    signEditorRef,
    sigPlacement,
    setSigPlacement,
    signatureReady,
    setSignatureReady,
    toolRunStatus,
    setToolRunStatus,
    addLog,
    compressLevel,
    setCompressLevel,
    compressHoverLevel,
    setCompressHoverLevel,
    compressRetainMetadata,
    setCompressRetainMetadata,
    compressTotalBytes,
    repairStrategy,
    setRepairStrategy,
    unlockPassword,
    setUnlockPassword,
    formsFlatten,
    setFormsFlatten,
    jpgDpi,
    setJpgDpi,
    pdfaStandard,
    setPdfaStandard,
  } = bindings;

  const ToolIcon = tool.icon;
  const toolId = tool.id;
  const isLive = isToolLive(toolId);

  const isNoInput =
    toolId === 'redact-pdf'
      ? !file || redactRegions.length === 0 || pdfGate.passwordBlocked
      : toolId === 'sign-pdf'
        ? !file || !signatureReady || pdfGate.passwordBlocked
        : !toolInputReady(toolId, {
          file,
          extraFiles,
          compareFile2,
          toolText,
          htmlInputMode,
        }) || pdfGate.passwordBlocked;

  const onMergeFilesChange = (pdfs: File[]) => {
    setExtraFiles(pdfs);
    setFile(null);
    if (pdfs.length >= 2) {
      setFileUploadFeedback({
        msg: `${pdfs.length} PDFs ready for ${boltToolName('merge')}.`,
        type: 'ok',
      });
    } else if (pdfs.length === 1) {
      setFileUploadFeedback({
        msg: 'Add at least one more PDF to merge.',
        type: 'error',
      });
    } else {
      setFileUploadFeedback(null);
    }
  };

  const onImageFilesChange = (images: File[]) => {
    setExtraFiles(images);
    setFile(null);
    if (images.length > 0) {
      setFileUploadFeedback({
        msg: `${images.length} image(s) ready for ${boltToolName(toolId)}.`,
        type: 'ok',
      });
    } else {
      setFileUploadFeedback(null);
    }
  };

  const onCompareSecondPdf = (second: File) => {
    setCompareFile2(second);
    const a = file?.name ?? 'PDF A';
    setFileUploadFeedback({
      msg: `Ready to compare ${a} and ${second.name}.`,
      type: 'ok',
    });
    if (file && !isProcessing) {
      handleExecuteTool('compare-pdf');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
        <button 
          onClick={() => { goToView('dashboard', '/'); setComparisonReport(null); }}
          className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
        >
          <ChevronRight size={14} className="rotate-180" /> Back to Suite Dashboard
        </button>

        <section className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 border border-[#141414]/15 rounded-xl shadow-xs">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FF3300]/10 border border-[#FF3300]/20 rounded-lg text-[#FF3300]">
                <ToolIcon size={28} />
              </div>
              <div className="space-y-1">
                <span className={`text-xs font-mono tracking-widest px-1.5 py-0.5 font-bold rounded ${
                  isLive ? 'bg-[#FF3300] text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isLive ? 'LIVE' : 'COMING SOON'}
                </span>
                <h2 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-1">
                  <BoltBrand text={tool.name} showInfo={toolId === 'replace'} />
                </h2>
                <p className="text-sm text-gray-500 font-sans">{tool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#E4E3E0]/50 px-3 py-1.5 rounded border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#FF3300] animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono text-xs text-gray-600 font-bold uppercase tracking-wider">
                {isLive ? 'PDFbolt API' : 'Coming soon'}
              </span>
            </div>
          </div>

          {!isLive && (
            <div
              role="alert"
              className="bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-xl p-5 space-y-2"
            >
              <p className="text-xs font-mono font-black uppercase tracking-widest text-amber-800">
                This tool is not available yet
              </p>
              <p className="text-sm font-sans leading-relaxed">{wipReason(toolId)}</p>
              <p className="text-xs font-mono text-amber-800/80">
                You can use other tools from the dashboard. Need this sooner?{' '}
                <button
                  type="button"
                  onClick={() => goToView('contact', '/contact')}
                  className="underline font-bold hover:text-[#FF3300]"
                >
                  Contact us
                </button>
                .
              </p>
            </div>
          )}

          {/* Dynamic wide stretching Banner Ad */}
          <BannerAd onInquire={() => goToView('contact', '/contact')} />

          {pdfGate.showPasswordBanner && (
            <EncryptedPdfBanner
              fileEntries={encryptedPdfEntries}
              restrictedFileNames={pdfGate.restrictedNames}
              verifying={pdfGate.verifying}
              verified={pdfGate.passwordAccepted}
              error={pdfGate.verifyError}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Upload / content — outside WIP overlay so pickers always work */}
            <BoltToolUpload
              toolId={toolId}
              file={file}
              extraFiles={extraFiles}
              compareFile2={compareFile2}
              toolText={toolText}
              toolTitle={toolTitle}
              onPrimaryPdf={onPrimaryPdfSelected}
              onPrimaryPdfInvalid={onPrimaryPdfInvalid}
              onMergeFiles={onMergeFilesChange}
              onImageFiles={onImageFilesChange}
              onCompareSecond={onCompareSecondPdf}
              onCompareSecondInvalid={(msg) => setFileUploadFeedback({ msg, type: 'error' })}
              onToolText={setToolText}
              onToolTitle={setToolTitle}
              htmlInputMode={htmlInputMode}
              onHtmlInputModeChange={(mode) => {
                setHtmlInputMode(mode);
                if (mode === 'file') {
                  setToolText('');
                } else {
                  setFile(null);
                  setFileUploadFeedback(null);
                }
              }}
              feedback={fileUploadFeedback}
            />

            {/* Tool parameters + execute (dimmed when WIP) */}
            <div className={`lg:col-span-12 bg-white border border-[#141414]/15 rounded-xl p-6 md:p-8 space-y-8 shadow-xs ${!isLive ? 'opacity-50 pointer-events-none select-none' : ''}`}>
              <div className="space-y-6 pt-2">
                <h3 className="text-xs font-mono font-black uppercase text-[#FF3300] tracking-wider pb-1.5 border-b border-gray-100 flex items-center gap-2">
                  <Settings size={14} />
                  <span>{boltToolName(toolId)} options</span>
                </h3>

                {/* 2. Split PDF */}
                {toolId === 'split' && (
                  <div className="space-y-2">
                    <label id="split-range-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Page range to split</label>
                    <input 
                      type="text" 
                      value={splitRange} 
                      onChange={(e) => setSplitRange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                      placeholder="e.g. 1-2, 5" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-sm text-gray-500 font-mono italic">Use a single page (e.g. 1) or ranges (e.g. 1-3, 5).</p>
                  </div>
                )}

                {/* 3. Remove Pages */}
                {toolId === 'remove-pages' && (
                  <div className="space-y-2">
                    <label id="remove-pages-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Pages to remove</label>
                    <input 
                      type="text" 
                      value={deletePageStr} 
                      onChange={(e) => setDeletePageStr(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                      placeholder="e.g. 2, 4" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-sm text-gray-500 font-mono italic">These page numbers will be removed from your PDF.</p>
                  </div>
                )}

                {/* 4. Extract Pages */}
                {toolId === 'extract-pages' && (
                  <div className="space-y-2">
                    <label id="extract-pages-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Pages to extract</label>
                    <input 
                      type="text" 
                      value={extractPageStr} 
                      onChange={(e) => setExtractPageStr(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                      placeholder="e.g. 1, 3-5" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-sm text-gray-500 font-mono italic">Selected pages are pulled out as a new single document format.</p>
                  </div>
                )}

                {/* 5. Organize PDF */}
                {toolId === 'organize-pdf' && (
                  <div className="space-y-2">
                    <label id="reorder-pages-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">New page order</label>
                    <input 
                      type="text" 
                      value={orderStr} 
                      onChange={(e) => setOrderStr(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                      placeholder="e.g. 3, 2, 1" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-sm text-gray-500 font-mono italic">Enter page numbers in the new order. Example: 3, 2, 1 reverses a 3-page PDF.</p>
                  </div>
                )}

                {/* 9. OCR */}
                {toolId === 'ocr-pdf' && (
                  <div className="space-y-2">
                    <label id="ocr-lang-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">OCR language</label>
                    <select 
                      value={ocrLang} 
                      onChange={(e) => setOcrLang(e.target.value)}
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                )}

                {/* 20. Rotate PDF */}
                {toolId === 'rotate-pdf' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label id="rotate-deg-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Rotation angle</label>
                      <select 
                        value={rotationAngle} 
                        onChange={(e) => setRotationAngle(boundedIntFromInput(e.target.value, rotationAngle))}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      >
                        <option value={90}>90° Clockwise</option>
                        <option value={180}>180° Flip</option>
                        <option value={270}>270° Counter-Clockwise</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label id="rotate-scope-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Page Range Filter</label>
                      <select 
                        value={rotationScope} 
                        onChange={(e) => setRotationScope(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      >
                        <option>All</option>
                        <option>Odd</option>
                        <option>Even</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 21. Add Page Numbers */}
                {toolId === 'add-page-numbers' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label id="page-num-format-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Template pattern</label>
                      <input 
                        type="text" 
                        value={pageNumFormat} 
                        onChange={(e) => setPageNumFormat(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label id="page-num-size-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Font size</label>
                      <input 
                        type="number" 
                        value={pageNumSize} 
                        onChange={(e) => setPageNumSize(boundedIntFromInput(e.target.value, pageNumSize, 1))}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label id="page-num-align-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Alignment</label>
                      <select 
                        value={pageNumAlign} 
                        onChange={(e) => setPageNumAlign(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      >
                        <option>Center</option>
                        <option>Left</option>
                        <option>Right</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 22. Add Watermark */}
                {toolId === 'add-watermark' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label id="watermark-txt-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Watermark label</label>
                        <input 
                          type="text" 
                          value={watermarkText} 
                          onChange={(e) => setWatermarkText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                          className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label id="watermark-size-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Font size</label>
                        <input 
                          type="number" 
                          value={watermarkSize} 
                          onChange={(e) => setWatermarkSize(boundedIntFromInput(e.target.value, watermarkSize, 1))}
                          className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label id="watermark-angle-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Rotation angle</label>
                          <input 
                            type="number" 
                            value={watermarkAngle} 
                            onChange={(e) => setWatermarkAngle(boundedIntFromInput(e.target.value, watermarkAngle))}
                            className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label id="watermark-color-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Color hex</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={watermarkColor} 
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="w-10 h-10 border border-[#141414] p-0.5 rounded cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={watermarkColor} 
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="flex-1 bg-white border border-[#141414] p-2 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                          <span>Opacity</span>
                          <span>{(watermarkOpacity * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min={0.05} 
                          max={0.95} 
                          step={0.05} 
                          value={watermarkOpacity} 
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="w-full accent-[#FF3300]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 23. Crop PDF */}
                {toolId === 'crop-pdf' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 font-mono block italic">Crop margins (in points):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-gray-500 block">Left</label>
                        <input type="number" value={cropLeft} onChange={(e) => setCropLeft(boundedIntFromInput(e.target.value, cropLeft, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-gray-500 block">Right</label>
                        <input type="number" value={cropRight} onChange={(e) => setCropRight(boundedIntFromInput(e.target.value, cropRight, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-gray-500 block">Top</label>
                        <input type="number" value={cropTop} onChange={(e) => setCropTop(boundedIntFromInput(e.target.value, cropTop, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-gray-500 block">Bottom</label>
                        <input type="number" value={cropBottom} onChange={(e) => setCropBottom(boundedIntFromInput(e.target.value, cropBottom, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 24. Edit PDF Properties / Metadata */}
                {toolId === 'edit-pdf' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-gray-500 block">Metadata title</label>
                      <input type="text" placeholder="Title information" value={metadataTitle} onChange={(e) => setMetadataTitle(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-gray-500 block">Metadata Author</label>
                      <input type="text" placeholder="Creator / Writer" value={metadataAuthor} onChange={(e) => setMetadataAuthor(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-gray-500 block">Metadata Subject</label>
                      <input type="text" placeholder="Document Topic" value={metadataSubject} onChange={(e) => setMetadataSubject(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-gray-500 block">Creator Application</label>
                      <input type="text" placeholder="PDFbolt version" value={metadataCreator} onChange={(e) => setMetadataCreator(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                  </div>
                )}

                {/* 27. Protect PDF */}
                {toolId === 'protect-pdf' && (
                  <div className="space-y-2 max-w-sm">
                    <label id="protect-pass-lbl" className="text-xs font-mono uppercase text-gray-600 font-bold block">Password</label>
                    <input 
                      type="password" 
                      value={protectPass} 
                      onChange={(e) => setProtectPass(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                      placeholder="Enter a password"
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                  </div>
                )}

                {/* 28. Sign PDF */}
                {toolId === 'sign-pdf' && (
                  <SignPdfEditor
                    ref={signEditorRef}
                    file={file}
                    pdfPassword={passwordForFile(file, pdfGate.passwordsByFile)}
                    placement={sigPlacement}
                    onPlacementChange={setSigPlacement}
                    onSignatureChange={setSignatureReady}
                  />
                )}

                {/* 29. Redact PDF */}
                {toolId === 'redact-pdf' && (
                  <RedactPdfEditor
                    file={file}
                    pdfPassword={passwordForFile(file, pdfGate.passwordsByFile)}
                    regions={redactRegions}
                    onRegionsChange={setRedactRegions}
                    onDownloaded={(filename) => {
                      setToolRunStatus({ msg: `Downloaded ${filename}`, type: 'ok' });
                      addLog(`Downloaded ${filename}`, 'success');
                    }}
                    onError={(msg) => {
                      setToolRunStatus({ msg, type: 'error' });
                      addLog(msg, 'error');
                    }}
                  />
                )}

                {/* 30. Compare PDF — Meld-style dual pane */}
                {toolId === 'compare-pdf' && file && compareFile2 && (
                  <ComparePdfViewer
                    fileA={file}
                    fileB={compareFile2}
                    pdfPasswords={pdfGate.passwordsByFile}
                    report={comparisonReport}
                  />
                )}

                {/* 31. Compress PDF */}
                {toolId === 'compress' && (
                  <div className="space-y-4">
                    <label className="text-xs font-mono uppercase text-gray-600 font-bold block">Compression level</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
                      {[...COMPRESS_LEVEL_OPTIONS].reverse().map((opt) => {
                        const selected = compressLevel === opt.value;
                        const showTip = compressHoverLevel === opt.value;
                        return (
                          <div
                            key={opt.value}
                            className="relative"
                            onMouseEnter={() => setCompressHoverLevel(opt.value)}
                            onMouseLeave={() => setCompressHoverLevel(null)}
                          >
                            <button
                              type="button"
                              onClick={() => setCompressLevel(opt.value)}
                              className={`w-full border-2 border-[#141414] p-4 text-left transition-all ${
                                selected
                                  ? 'bg-[#FF3300] text-white shadow-[4px_4px_0px_#141414]'
                                  : 'bg-white hover:bg-[#141414] hover:text-[#E4E3E0]'
                              }`}
                            >
                              <span className="block text-xs font-black uppercase tracking-tighter">{opt.label}</span>
                              <span className={`block text-xs font-mono mt-1 leading-snug ${selected ? 'text-white/80' : 'opacity-50'}`}>
                                {opt.hint}
                              </span>
                            </button>
                            {showTip && (
                              <div className="absolute left-1/2 bottom-full z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 border border-[#141414] bg-white px-3 py-2 text-xs font-mono leading-snug text-[#141414] shadow-[3px_3px_0px_#141414] pointer-events-none">
                                {compressLevelHoverHint(compressTotalBytes, opt.value)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compressRetainMetadata}
                        onChange={(e) => setCompressRetainMetadata(e.target.checked)}
                        className="h-4 w-4 accent-[#FF3300]"
                      />
                      <span className="text-xs font-bold uppercase tracking-tighter">Retain PDF metadata</span>
                    </label>
                  </div>
                )}

                {/* 32. Repair PDF */}
                {toolId === 'repair-pdf' && (
                  false && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-gray-600 font-bold block">Repair method</label>
                      <select 
                        value={repairStrategy} 
                        onChange={(e) => setRepairStrategy(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      >
                        <option>Rebuild document index (recommended)</option>
                        <option>Rebuild file header</option>
                        <option>Re-index page content</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 font-mono italic">Tries common fixes for damaged or incomplete PDFs.</p>
                    </div>
                  </div>
                  )
                )}

                {/* 33. Unlock PDF */}
                {toolId === 'unlock-pdf' && (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-gray-600 font-bold block">PDF password (if protected)</label>
                      <input 
                        type="password" 
                        value={unlockPassword} 
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteTool(toolId); }}
                        placeholder="PDF password (if required)"
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      />
                    </div>
                    <div className="space-y-1.5 p-3 bg-amber-50/50 border border-amber-200/50 rounded-sm">
                      <p className="text-sm text-amber-800 font-sans leading-relaxed">
                        <strong>Note:</strong> Removes password protection and printing restrictions. If the PDF asks for a password to open, enter it above.
                      </p>
                    </div>
                  </div>
                )}

                {/* 34. PDF Forms */}
                {toolId === 'pdf-forms' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-gray-600 font-bold block">Form options</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormsFlatten(!formsFlatten)}
                          className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${formsFlatten ? 'bg-[#FF3300] text-white border-[#FF3300]' : 'bg-white'}`}
                          aria-pressed={formsFlatten}
                          aria-label="Flatten form fields into the page"
                        >
                          {formsFlatten && <CheckCircle2 size={12} />}
                        </button>
                        <span className="text-xs font-bold uppercase tracking-tighter">Flatten form fields into the page</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-mono italic leading-relaxed">
                      When enabled, filled-in answers become regular page content and cannot be edited later. When off, the PDF is returned with editable form fields preserved.
                    </p>
                  </div>
                )}

                {/* 35. PDF to JPG */}
                {toolId === 'pdf-to-jpg' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-gray-600 font-bold block">Image quality (DPI)</label>
                      <select 
                        value={jpgDpi} 
                        onChange={(e) => setJpgDpi(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      >
                        <option>96 DPI (smaller file)</option>
                        <option>150 DPI (standard)</option>
                        <option>300 DPI (print quality)</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 font-mono italic">Higher DPI gives sharper images and larger files.</p>
                  </div>
                )}

                {/* 36–38. PDF to Office (LibreOffice) */}
                {(toolId === 'pdf-to-word' || toolId === 'pdf-to-powerpoint' || toolId === 'pdf-to-excel') && (
                  <div className="rounded-lg border border-[#141414]/15 bg-[#E4E3E0]/40 p-4 max-w-lg space-y-2">
                    <p className="text-xs font-mono uppercase text-gray-700 font-bold">LibreOffice export</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Converts your PDF to an editable{' '}
                      {toolId === 'pdf-to-word' && 'Word (.docx)'}
                      {toolId === 'pdf-to-powerpoint' && 'PowerPoint (.pptx)'}
                      {toolId === 'pdf-to-excel' && 'Excel (.xlsx)'} file using the same conversion service as our Office→PDF tools.
                      Complex layouts and scanned pages may not match the original perfectly; use OCR first for image-only PDFs.
                    </p>
                  </div>
                )}

                {/* 39. PDF to PDF/A */}
                {toolId === 'pdf-to-pdfa' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-gray-600 font-bold block">PDF/A level</label>
                      <select 
                        value={pdfaStandard} 
                        onChange={(e) => setPdfaStandard(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      >
                        <option>PDF/A-1b (ISO 19005-1)</option>
                        <option>PDF/A-2b (ISO 19005-2)</option>
                        <option>PDF/A-3b (ISO 19005-3)</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 font-mono italic">PDF/A is often required for legal and government archives.</p>
                  </div>
                )}

                {toolId === 'pdf-to-dxf' && (
                  <p className="text-sm text-gray-500 font-mono italic max-w-lg">
                    Each PDF page becomes its own DXF file (page_001.dxf, page_002.dxf, …) in a zip download.
                    Works best on CAD drawings and vector PDFs; scanned pages may produce little geometry.
                  </p>
                )}

              </div>

              {toolRunStatus && (
                <p
                  role="status"
                  className={`text-sm font-mono px-4 py-3 rounded-lg border ${
                    toolRunStatus.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : toolRunStatus.type === 'error'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {toolRunStatus.msg}
                </p>
              )}

              {/* Execution Banner Button! (redact uses in-editor download) */}
              {toolId !== 'redact-pdf' && (
              <button 
                disabled={!isLive || isNoInput || isProcessing}
                onClick={() => handleExecuteTool(toolId)}
                aria-label={
                  !isLive
                    ? 'Tool not available yet'
                    : isProcessing
                      ? 'Processing. Please wait.'
                      : isNoInput
                        ? 'Required input components are missing'
                        : boltExecuteLabel(toolId)
                }
                className={`w-full py-6 font-black text-xl uppercase tracking-tighter transition-all shadow-[6px_6px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border border-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${!isLive || isNoInput || isProcessing ? 'bg-[#DCDAD5] text-neutral-600 cursor-not-allowed border-[#141414]/40 shadow-none translate-none' : 'bg-[#FF3300] text-white hover:bg-[#141414] hover:shadow-[6px_6px_0px_#FF3300]'}`}
              >
                {!isLive
                  ? 'Coming soon'
                  : isProcessing
                    ? 'Processing on server...'
                    : pdfGate.passwordBlocked
                      ? 'Enter PDF password'
                      : isNoInput
                      ? toolId === 'merge'
                        ? 'Choose at least 2 PDFs'
                        : toolId === 'compare-pdf'
                          ? 'Choose both PDFs'
                          : ['scan-to-pdf', 'images-to-pdf'].includes(toolId)
                            ? 'Choose at least one image'
                            : ['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'].includes(toolId)
                              ? 'Choose an Office file first'
                              : toolId === 'html-to-pdf'
                                ? htmlInputMode === 'file'
                                  ? 'Choose an HTML file first'
                                  : 'Enter HTML content first'
                                : toolId === 'redact-pdf'
                                  ? 'Draw at least one black box'
                                  : toolId === 'sign-pdf'
                                    ? !file
                                      ? 'Choose a PDF first'
                                      : 'Draw on the PDF page first'
                                    : 'Choose a PDF first'
                      : boltExecuteLabel(toolId)}
              </button>
              )}
              {isLive && toolId !== 'redact-pdf' && toolId !== 'sign-pdf' && (
                <div className="text-center pt-4 border-t border-gray-100 mt-6">
                  <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                    Processed securely — your file is not kept after the download.
                  </span>
                </div>
              )}
              {isLive && toolId === 'redact-pdf' && (
                <div className="text-center pt-2">
                  <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                    Redaction preview and download run in your browser — the PDF is not uploaded for this tool.
                  </span>
                </div>
              )}
              {isLive && toolId === 'sign-pdf' && (
                <div className="text-center pt-2">
                  <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                    Signatures are applied in your browser — the PDF is not uploaded for this tool.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
  );
}
