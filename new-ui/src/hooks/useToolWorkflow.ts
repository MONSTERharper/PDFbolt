import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { type SignPdfEditorHandle } from '../components/SignPdfEditor';
import { type SignaturePlacement, defaultSignedFilename } from '../signPdfUtils';
import { defaultRedactedFilename, type RedactRegion } from '../redactPdfUtils';
import { redactPdfFile, signPdfMultiple } from '../pdfOperations';
import { toolInputReady, type HtmlInputMode } from '../toolUploadConfig';
import {
  serverReplacePdf,
  serverCompressPdf,
  serverExecuteTool,
  formatBytesHint,
  type ReplacePairWithStrict as ReplacePair,
  type CompressLevel,
  type SignatureEntry,
} from '../backendBridge';
import { isToolLive, wipReason } from '../toolStatus';
import type { ComparisonReport } from '../compareTypes';
import { usePdfEncryptionGate } from '../usePdfEncryptionGate';
import { isPdfPasswordRequiredError } from '../pdfInspectApi';
import { passwordForFile } from '../pdfPasswordUtils';
import { onToolRunSuccess } from '../toolUsage';
import { friendlyErrorMessage } from '../friendlyError';
import { type SuiteTool } from '../suiteCatalog';
import { type AppView, toolPath } from '../routing';
import type { ToolPageBindings } from '../toolPageBindings';

export function autoRunInputKey(
  toolId: string,
  ctx: {
    file: File | null;
    extraFiles: File[];
    compareFile2: File | null;
    toolText: string;
    htmlInputMode: HtmlInputMode;
    formsFlatten?: boolean;
  },
): string {
  const parts = [toolId];
  if (ctx.file) {
    parts.push(`f:${ctx.file.name}:${ctx.file.size}:${ctx.file.lastModified}`);
  }
  for (const extra of ctx.extraFiles) {
    parts.push(`e:${extra.name}:${extra.size}:${extra.lastModified}`);
  }
  if (ctx.compareFile2) {
    parts.push(`c:${ctx.compareFile2.name}:${ctx.compareFile2.size}:${ctx.compareFile2.lastModified}`);
  }
  if (ctx.htmlInputMode === 'paste' && ctx.toolText.trim()) {
    parts.push(`t:${ctx.toolText.length}`);
  }
  if (ctx.formsFlatten !== undefined) {
    parts.push(`ff:${ctx.formsFlatten}`);
  }
  return parts.join('|');
}

export const AUTO_RUN_TOOL_IDS = new Set([
  'pdf-to-word',
  'pdf-to-powerpoint',
  'pdf-to-excel',
  'word-to-pdf',
  'powerpoint-to-pdf',
  'excel-to-pdf',
  'repair-pdf',
  'pdf-to-jpg',
  'pdf-to-pdfa',
  'pdf-to-dxf',
  'rotate-pdf',
  'pdf-forms',
  'compress',
]);

export interface UseToolWorkflowOptions {
  currentView: AppView;
  selectedWipTool: SuiteTool | null;
  goToView: (view: AppView, path: string, tool?: SuiteTool | null) => void;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useToolWorkflow({ currentView, selectedWipTool, goToView }: UseToolWorkflowOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [pairs, setPairs] = useState<ReplacePair[]>([{ find: '', replace: '', strict: false }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [log, setLog] = useState<{ msg: string; type: 'info' | 'success' | 'error' }[]>([]);

  const [matchMode, setMatchMode] = useState('Exact');
  const [replaceScope, setReplaceScope] = useState('All matches');
  const [occurrenceIndex, setOccurrenceIndex] = useState(1);
  const [preserveStyle, setPreserveStyle] = useState(true);
  const [retainMetadata, setRetainMetadata] = useState(true);
  const [replaceStatus, setReplaceStatus] = useState<{ msg: string; type: 'info' | 'ok' | 'error' } | null>(
    null,
  );
  const [fileUploadFeedback, setFileUploadFeedback] = useState<{ msg: string; type: 'ok' | 'error' } | null>(
    null,
  );
  const [toolRunStatus, setToolRunStatus] = useState<{ msg: string; type: 'info' | 'ok' | 'error' } | null>(
    null,
  );

  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [toolText, setToolText] = useState('John Doe, Sample Company\nQuarterly report draft.');
  const [toolTitle, setToolTitle] = useState('Sample Report');
  const [htmlInputMode, setHtmlInputMode] = useState<HtmlInputMode>('file');
  const [ocrLang, setOcrLang] = useState('English');
  const [splitRange, setSplitRange] = useState('1');
  const [deletePageStr, setDeletePageStr] = useState('2');
  const [extractPageStr, setExtractPageStr] = useState('1');
  const [orderStr, setOrderStr] = useState('1, 2');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [rotationScope, setRotationScope] = useState('All');
  const [pageNumFormat, setPageNumFormat] = useState('Page {X} of {Y}');
  const [pageNumSize, setPageNumSize] = useState(10);
  const [pageNumAlign, setPageNumAlign] = useState('Center');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkColor, setWatermarkColor] = useState('#ff3300');
  const [cropLeft, setCropLeft] = useState(20);
  const [cropRight, setCropRight] = useState(20);
  const [cropTop, setCropTop] = useState(20);
  const [cropBottom, setCropBottom] = useState(20);
  const [metadataTitle, setMetadataTitle] = useState('');
  const [metadataAuthor, setMetadataAuthor] = useState('');
  const [metadataSubject, setMetadataSubject] = useState('');
  const [metadataCreator, setMetadataCreator] = useState('PDFbolt');
  const [protectPass, setProtectPass] = useState('');
  const [redactRegions, setRedactRegions] = useState<RedactRegion[]>([]);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null);

  const [compressLevel, setCompressLevel] = useState<CompressLevel>('balanced');
  const [compressRetainMetadata, setCompressRetainMetadata] = useState(true);
  const [compressHoverLevel, setCompressHoverLevel] = useState<CompressLevel | null>(null);
  const [repairStrategy, setRepairStrategy] = useState('Rebuild document index (recommended)');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [formsFlatten, setFormsFlatten] = useState(true);
  const [jpgDpi, setJpgDpi] = useState('150 DPI (Standard)');
  const [pdfaStandard, setPdfaStandard] = useState('PDF/A-1b (ISO 19005-1)');

  const lastAutoRunKeyRef = useRef<string | null>(null);

  const signEditorRef = useRef<SignPdfEditorHandle>(null);
  const [signatureReady, setSignatureReady] = useState(false);
  const [sigPlacement, setSigPlacement] = useState<SignaturePlacement>({
    pageNum: 1,
    x: 100,
    y: 100,
    w: 150,
    h: 50,
  });

  useEffect(() => {
    setRedactRegions([]);
    setSignatureReady(false);
  }, [file]);

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLog((prev) => [{ msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }, ...prev].slice(0, 50));
  }, []);

  const onPrimaryPdfSelected = useCallback(
    (selected: File) => {
      setFile(selected);
      setProcessedBytes(null);
      setReplaceStatus(null);
      setFileUploadFeedback({ msg: `Loaded ${selected.name}`, type: 'ok' });
      addLog(`Loaded ${selected.name}`, 'info');
    },
    [addLog],
  );

  const onPrimaryPdfInvalid = useCallback((msg: string) => {
    setFileUploadFeedback({ msg, type: 'error' });
    setReplaceStatus({ msg, type: 'error' });
  }, []);

  const onReplaceFilesChange = useCallback(
    (pdfs: File[]) => {
      setFile(null);
      setExtraFiles(pdfs);
      setProcessedBytes(null);
      setReplaceStatus(null);
      if (pdfs.length > 0) {
        setFileUploadFeedback({
          msg: `${pdfs.length} PDF${pdfs.length === 1 ? '' : 's'} ready for bolt replace.`,
          type: 'ok',
        });
        addLog(`Loaded ${pdfs.length} PDF(s) for replace`, 'info');
      } else {
        setFileUploadFeedback(null);
      }
    },
    [addLog],
  );

  const replaceFiles = useMemo(
    () => (extraFiles.length > 0 ? extraFiles : file ? [file] : []),
    [extraFiles, file],
  );

  const activePdfToolId =
    currentView === 'wip' && selectedWipTool
      ? selectedWipTool.id
      : currentView === 'replace'
        ? 'replace'
        : '';

  const pdfGate = usePdfEncryptionGate(activePdfToolId, file, extraFiles, compareFile2);

  const encryptedPdfEntries = useMemo(
    () =>
      pdfGate.filesNeedingPassword.map((f) => ({
        name: f.name,
        password: pdfGate.passwordsByFile[f.name] ?? '',
        onPasswordChange: (value: string) => pdfGate.setPasswordForFile(f.name, value),
      })),
    [pdfGate.filesNeedingPassword, pdfGate.passwordsByFile, pdfGate.setPasswordForFile],
  );

  const compressTotalBytes = useMemo(() => (file ? file.size : 0), [file]);

  const handleExecuteTool = useCallback(
    async (toolId: string) => {
      if (!isToolLive(toolId)) {
        const msg = wipReason(toolId);
        setToolRunStatus({ msg, type: 'error' });
        addLog(msg, 'error');
        return;
      }
      setIsProcessing(true);
      setToolRunStatus({ msg: 'Processing your file…', type: 'info' });
      addLog('Processing your file...');
      try {
        if (pdfGate.passwordBlocked) {
          throw new Error('Enter the correct PDF password before running this tool.');
        }
        if (toolId === 'redact-pdf') {
          if (!file) throw new Error('Choose a PDF file first.');
          if (redactRegions.length === 0) {
            throw new Error('Draw at least one black box on the PDF first.');
          }
          const bytes = await redactPdfFile(
            file,
            redactRegions,
            passwordForFile(file, pdfGate.passwordsByFile),
          );
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const filename = defaultRedactedFilename(file.name);
          setProcessedBytes(new Uint8Array(bytes));
          triggerDownload(blob, filename);
          const successMsg = `Downloaded ${filename}`;
          onToolRunSuccess('redact-pdf', { syncServer: true });
          setToolRunStatus({ msg: successMsg, type: 'ok' });
          addLog(successMsg, 'success');
          return;
        }

        if (toolId === 'sign-pdf') {
          if (!file) throw new Error('Choose a PDF file first.');
          if (!signEditorRef.current?.hasSignature()) {
            throw new Error('Draw your signature directly on the PDF page first.');
          }
          const exported = await signEditorRef.current.getSignatures();
          if (exported.length === 0 || exported.some((entry) => entry.blob.size < 20)) {
            throw new Error('Draw your signature on the PDF page before signing.');
          }
          const pdfPassword = passwordForFile(file, pdfGate.passwordsByFile);
          const signaturePayload = await Promise.all(
            exported.map(async (entry) => ({
              sigImageBytes: new Uint8Array(await entry.blob.arrayBuffer()),
              pageNum: entry.placement.pageNum,
              x: entry.placement.x,
              y: entry.placement.y,
              width: entry.placement.w,
              height: entry.placement.h,
            })),
          );
          const pdfBytes = await signPdfMultiple(file, signaturePayload, pdfPassword);
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const filename = defaultSignedFilename(file.name);
          setProcessedBytes(pdfBytes);
          triggerDownload(blob, filename);
          const successMsg = `Downloaded ${filename} (${exported.length} signature${exported.length === 1 ? '' : 's'})`;
          onToolRunSuccess('sign-pdf', { syncServer: true });
          setToolRunStatus({ msg: successMsg, type: 'ok' });
          addLog(successMsg, 'success');
          return;
        }

        if (toolId === 'compress') {
          if (!file) throw new Error('Choose a PDF file first.');
          const compressResult = await serverCompressPdf(
            file,
            compressLevel,
            compressRetainMetadata,
            undefined,
            pdfGate.pdfPasswordsJson,
          );
          setProcessedBytes(new Uint8Array(await compressResult.blob.arrayBuffer()));
          triggerDownload(compressResult.blob, compressResult.filename);
          const orig = Number(compressResult.originalBytes);
          const out = Number(compressResult.outputBytes);
          const pct = compressResult.savedPercent;
          const compressMsg = `Compressed: ${formatBytesHint(String(orig))} → ${formatBytesHint(String(out))} (${pct}% smaller, ${compressResult.pages} page(s)). Your file has been deleted from our server.`;
          onToolRunSuccess('compress');
          setToolRunStatus({ msg: compressMsg, type: 'ok' });
          addLog(compressMsg, 'success');
          return;
        }

        let signatureBlob: Blob | null = null;
        const signatures: SignatureEntry[] = [];
        const activeSigPlacement = sigPlacement;

        const result = await serverExecuteTool(toolId, {
          file,
          extraFiles,
          compareFile2,
          signatureBlob,
          signatures,
          splitRange,
          deletePageStr,
          extractPageStr,
          orderStr,
          toolText,
          toolTitle,
          htmlInputMode,
          ocrLang,
          rotationAngle,
          rotationScope,
          pageNumFormat,
          pageNumSize,
          pageNumAlign,
          watermarkText,
          watermarkSize,
          watermarkAngle,
          watermarkOpacity,
          watermarkColor,
          cropLeft,
          cropRight,
          cropTop,
          cropBottom,
          metadataTitle,
          metadataAuthor,
          metadataSubject,
          metadataCreator,
          protectPass,
          unlockPassword,
          pdfOpenPassword: pdfGate.pdfOpenPassword,
          pdfPasswordsJson: pdfGate.pdfPasswordsJson,
          pdfaStandard,
          sigPageNum: activeSigPlacement.pageNum,
          sigX: activeSigPlacement.x,
          sigY: activeSigPlacement.y,
          sigW: activeSigPlacement.w,
          sigH: activeSigPlacement.h,
          jpgDpi,
          formsFlatten,
        });

        if (result.kind === 'json') {
          setComparisonReport(result.data as ComparisonReport);
          onToolRunSuccess(toolId);
          setToolRunStatus({ msg: 'Compare complete.', type: 'ok' });
          addLog('Compare complete.', 'success');
          return;
        }

        setProcessedBytes(new Uint8Array(await result.blob.arrayBuffer()));
        triggerDownload(result.blob, result.filename);
        let successMsg = `Downloaded ${result.filename} — your file has been deleted from our server.`;
        if (result.pdfaValidationNote) {
          successMsg += ` ${result.pdfaValidationNote}`;
        }
        onToolRunSuccess(toolId);
        setToolRunStatus({ msg: successMsg, type: 'ok' });
        addLog(successMsg, 'success');
      } catch (e) {
        const errMsg = friendlyErrorMessage(e instanceof Error ? e.message : String(e));
        if (isPdfPasswordRequiredError(e)) {
          for (const locked of pdfGate.filesNeedingPassword) {
            pdfGate.setPasswordForFile(locked.name, '');
          }
        }
        setToolRunStatus({ msg: errMsg, type: 'error' });
        addLog(errMsg, 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [
      addLog,
      compareFile2,
      compressLevel,
      compressRetainMetadata,
      cropBottom,
      cropLeft,
      cropRight,
      cropTop,
      deletePageStr,
      extraFiles,
      extractPageStr,
      file,
      formsFlatten,
      htmlInputMode,
      jpgDpi,
      metadataAuthor,
      metadataCreator,
      metadataSubject,
      metadataTitle,
      ocrLang,
      orderStr,
      pageNumAlign,
      pageNumFormat,
      pageNumSize,
      pdfGate.passwordBlocked,
      pdfGate.pdfOpenPassword,
      pdfGate.pdfPasswordsJson,
      pdfaStandard,
      protectPass,
      redactRegions,
      rotationAngle,
      rotationScope,
      sigPlacement,
      splitRange,
      toolText,
      toolTitle,
      unlockPassword,
      watermarkAngle,
      watermarkColor,
      watermarkOpacity,
      watermarkSize,
      watermarkText,
    ],
  );

  useEffect(() => {
    lastAutoRunKeyRef.current = null;
  }, [selectedWipTool?.id]);

  useEffect(() => {
    if (currentView !== 'wip') return;
    if (!selectedWipTool) return;
    const toolId = selectedWipTool.id;
    if (!AUTO_RUN_TOOL_IDS.has(toolId)) return;
    if (!isToolLive(toolId)) return;
    const inputReady = toolInputReady(toolId, {
      file,
      extraFiles,
      compareFile2,
      toolText,
      htmlInputMode,
    });
    if (!inputReady) return;
    const runKey = autoRunInputKey(toolId, {
      file,
      extraFiles,
      compareFile2,
      toolText,
      htmlInputMode,
      ...(toolId === 'pdf-forms' ? { formsFlatten } : {}),
    });
    if (lastAutoRunKeyRef.current === runKey) return;
    lastAutoRunKeyRef.current = runKey;
    void handleExecuteTool(toolId);
  }, [
    currentView,
    selectedWipTool,
    file,
    extraFiles,
    compareFile2,
    toolText,
    htmlInputMode,
    formsFlatten,
    handleExecuteTool,
  ]);

  const handleRunReplacement = useCallback(async () => {
    if (replaceFiles.length === 0) {
      setReplaceStatus({ msg: 'Choose at least one PDF file.', type: 'error' });
      return;
    }
    const activePairs = pairs.filter((p) => p.find.trim());
    if (activePairs.length === 0) {
      setReplaceStatus({
        msg: 'Add at least one find/replace rule with non-empty Find text.',
        type: 'error',
      });
      return;
    }
    if (pdfGate.passwordBlocked) {
      setReplaceStatus({ msg: 'Enter the correct PDF password first.', type: 'error' });
      return;
    }
    const batch = replaceFiles.length > 1;
    setIsProcessing(true);
    setReplaceStatus({
      msg: batch ? `Processing ${replaceFiles.length} PDFs…` : 'Processing your file…',
      type: 'info',
    });
    addLog(batch ? `Sending ${replaceFiles.length} PDFs to PDFbolt server...` : 'Sending PDF to PDFbolt server...');
    try {
      const result = await serverReplacePdf(replaceFiles, activePairs, {
        matchMode,
        replaceScope,
        occurrenceIndex,
        preserveStyle,
        retainMetadata,
        pdfPasswordsJson: pdfGate.pdfPasswordsJson,
      });
      setProcessedBytes(new Uint8Array(await result.blob.arrayBuffer()));
      const matches = Number(result.matches) || 0;
      const found = Number(result.matchesFound) || 0;
      if (matches > 0) {
        triggerDownload(result.blob, result.filename);
        onToolRunSuccess('replace');
        const msg = batch
          ? `Done. ${replaceFiles.length} PDFs processed — ${matches} replacement(s) from ${found} match(es). Downloaded ${result.filename}.`
          : `Done. ${matches} replacement(s) from ${found} match(es). Style preserved: ${result.stylePreserved}, fallback: ${result.styleFallback}.`;
        setReplaceStatus({ msg, type: 'ok' });
        addLog(msg, 'success');
      } else {
        const msg = batch
          ? 'No matching text was found in any of the PDFs. Try case-insensitive match or check spelling.'
          : 'No matching text was found in the PDF. Try case-insensitive match or check spelling.';
        setReplaceStatus({ msg, type: 'error' });
        addLog(msg, 'info');
      }
    } catch (err) {
      const msg = friendlyErrorMessage(err instanceof Error ? err.message : String(err));
      setReplaceStatus({ msg, type: 'error' });
      addLog(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [
    addLog,
    matchMode,
    occurrenceIndex,
    pairs,
    pdfGate.passwordBlocked,
    pdfGate.pdfPasswordsJson,
    preserveStyle,
    replaceFiles,
    replaceScope,
    retainMetadata,
  ]);

  const handleToolClick = useCallback(
    (tool: SuiteTool) => {
      setFile(null);
      setExtraFiles([]);
      setCompareFile2(null);
      setComparisonReport(null);
      setFileUploadFeedback(null);
      setToolRunStatus(null);
      setSignatureReady(false);
      if (tool.id === 'replace') {
        goToView('replace', toolPath('replace'), tool);
      } else {
        goToView('wip', toolPath(tool.id), tool);
      }
    },
    [goToView],
  );

  const toolPageBindings: ToolPageBindings = {
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
  };

  const replacePageProps = {
    replaceFiles,
    pairs,
    setPairs,
    pdfGate,
    encryptedPdfEntries,
    onReplaceFilesChange,
    onPrimaryPdfInvalid,
    fileUploadFeedback,
    matchMode,
    setMatchMode,
    replaceScope,
    setReplaceScope,
    occurrenceIndex,
    setOccurrenceIndex,
    preserveStyle,
    setPreserveStyle,
    retainMetadata,
    setRetainMetadata,
    replaceStatus,
    isProcessing,
    onRunReplacement: handleRunReplacement,
  };

  return {
    handleToolClick,
    toolPageBindings,
    replacePageProps,
  };
}
