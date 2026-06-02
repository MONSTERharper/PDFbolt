import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  FileUp, 
  Trash2, 
  Plus, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Download,
  Info,
  ShieldCheck,
  Search,
  Zap,
  LayoutGrid,
  Replace,
  Combine,
  Scissors,
  Minimize2,
  FileType,
  PenTool,
  Settings,
  Mail,
  Users,
  ChevronRight,
  ExternalLink,
  Camera,
  Hammer,
  Sparkles,
  Image,
  FileText,
  Presentation,
  FileSpreadsheet,
  Code,
  Shield,
  RotateCw,
  Hash,
  Crop,
  Unlock,
  Lock,
  Eraser,
  ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerAd } from './components/AdPlacement';
import { PdfFilePicker } from './components/PdfFilePicker';
import { BoltToolUpload } from './components/BoltToolUpload';
import { RedactPdfEditor } from './components/RedactPdfEditor';
import { defaultRedactedFilename, type RedactRegion } from './redactPdfUtils';
import { redactPdfFile } from './pdfOperations';
import { boltExecuteLabel, boltToolName, boltUploadHeading } from './toolLabels';
import { toolInputReady, type HtmlInputMode } from './toolUploadConfig';
import {
  serverReplacePdf,
  serverCompressPdf,
  serverExecuteTool,
  postContactInquiry,
  formatBytesHint,
  COMPRESS_LEVEL_OPTIONS,
  compressLevelHoverHint,
  type ReplacePairWithStrict as ReplacePair,
  type CompressLevel,
} from './backendBridge';
import { downloadFile } from './pdfOperations';
import { isToolLive, wipReason } from './toolStatus';
import type { ComparisonReport } from './compareTypes';
import { ComparePdfViewer } from './components/ComparePdfViewer';
import { EncryptedPdfBanner } from './components/EncryptedPdfBanner';
import { usePdfEncryptionGate } from './usePdfEncryptionGate';
import { isPdfPasswordRequiredError } from './pdfInspectApi';
import { passwordForFile } from './pdfPasswordUtils';
import {
  DEFAULT_POPULAR_TOOL_IDS,
  fetchPopularToolIds,
  getRecentToolIds,
  mergePopularLists,
  onToolRunSuccess,
} from './toolUsage';
import { formatBoltVersion } from './appVersion';
import { useAppVersion } from './useAppVersion';
import { boundedIntFromInput } from './parseNumber';

type View = 'dashboard' | 'directory' | 'replace' | 'about' | 'contact' | 'wip';

const BoltBrand = ({ text, className = "", showInfo = false }: { text: string, className?: string, showInfo?: boolean }) => {
  const parts = text.split(/(bolt)/gi);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center">
        {parts.map((part, i) => 
          part.toLowerCase() === 'bolt' ? (
            <span key={i} className="inline-flex items-center gap-0.5">
              <span className="text-[#FF3300] lowercase">bolt</span>
              <Zap size={14} className="fill-[#FF3300] text-[#FF3300] rotate-12 shrink-0" aria-hidden="true" />
            </span>
          ) : part
        )}
      </span>
      
      {/* Dynamic (i) Icon with Deterministic Engine tooltip */}
      {showInfo && (
        <span className="relative group/tooltip inline-flex items-center cursor-help" style={{ textTransform: 'none' }}>
          <Info size={14} className="text-gray-400 hover:text-[#FF3300] transition-colors shrink-0" />
          
          {/* Tooltip Card */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[#141414] text-[#E4E3E0] text-[10px] font-sans font-normal not-italic tracking-normal leading-relaxed p-3 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-50">
            <span className="font-bold text-[#FF3300] block mb-1 font-mono uppercase tracking-widest text-[8px]">ENGINE NOTE</span>
            Deterministic replacement ensures no layout shifts. If "Strict mode" is enabled, ensure finding and replacement strings match in character count.
            
            {/* Accent Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414]" />
          </span>
        </span>
      )}
    </span>
  );
};

interface SuiteTool {
  id: string;
  name: string;
  cleanName: string;
  description: string;
  status: 'live' | 'wip';
  icon: any;
  highlight?: boolean;
}

interface SuiteCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: SuiteTool[];
}

const CATEGORIES: SuiteCategory[] = [
  {
    id: 'organize',
    title: 'Organize PDF',
    description: 'Surgically reorganize and manipulate PDF layout structures.',
    icon: LayoutGrid,
    tools: [
      { id: 'merge', name: 'bolt merge', cleanName: 'Merge PDF', icon: Combine, description: 'Combine multiple PDF files into one seamless document.', status: 'live' },
      { id: 'split', name: 'bolt split', cleanName: 'Split PDF', icon: Scissors, description: 'Slices a single document into target pages or segments.', status: 'live' },
      { id: 'remove-pages', name: 'bolt remove', cleanName: 'Remove pages', icon: Trash2, description: 'Instantly excise specified pages from the document structure.', status: 'live' },
      { id: 'extract-pages', name: 'bolt extract', cleanName: 'Extract pages', icon: Download, description: 'Pull individual pages out of a larger document file.', status: 'live' },
      { id: 'organize-pdf', name: 'bolt organize', cleanName: 'Organize PDF', icon: LayoutGrid, description: 'Sort, reorder, and visually adjust file structure.', status: 'live' },
    ]
  },
  {
    id: 'scan',
    title: 'Scan to PDF',
    description: 'Turn physical layouts and photos into portable documents.',
    icon: Camera,
    tools: [
      { id: 'scan-to-pdf', name: 'bolt scan', cleanName: 'Scan to PDF', icon: Camera, description: 'Digitize legacy physical papers via device camera input.', status: 'live' },
    ]
  },
  {
    id: 'optimize',
    title: 'Optimize PDF',
    description: 'Repair structural tables and compress document streams.',
    icon: Sparkles,
    tools: [
      { id: 'compress', name: 'bolt compress', cleanName: 'Compress PDF', icon: Minimize2, description: 'Optimize graphics and shrink vector size payload.', status: 'live' },
      { id: 'repair-pdf', name: 'bolt repair', cleanName: 'Repair PDF', icon: Hammer, description: 'Fix broken layout tables and corrupt cross-reference streams.', status: 'live' },
      { id: 'ocr-pdf', name: 'bolt ocr', cleanName: 'OCR PDF', icon: Sparkles, description: 'Make scanned PDFs searchable with real OCR (coming soon).', status: 'wip' },
    ]
  },
  {
    id: 'convert-to',
    title: 'Convert to PDF',
    description: 'Produce high-fidelity PDF documents from legacy assets.',
    icon: FileUp,
    tools: [
      { id: 'jpg-to-pdf', name: 'bolt jpg-to-pdf', cleanName: 'JPG to PDF', icon: Image, description: 'Assemble images inside scalable document frames.', status: 'live' },
      { id: 'word-to-pdf', name: 'bolt word-to-pdf', cleanName: 'WORD to PDF', icon: FileText, description: 'Convert Word (.doc, .docx) to PDF via LibreOffice.', status: 'live' },
      { id: 'powerpoint-to-pdf', name: 'bolt powerpoint-to-pdf', cleanName: 'POWERPOINT to PDF', icon: Presentation, description: 'Convert PowerPoint (.ppt, .pptx) to PDF via LibreOffice.', status: 'live' },
      { id: 'excel-to-pdf', name: 'bolt excel-to-pdf', cleanName: 'EXCEL to PDF', icon: FileSpreadsheet, description: 'Convert Excel (.xls, .xlsx) to PDF via LibreOffice.', status: 'live' },
      { id: 'html-to-pdf', name: 'bolt html-to-pdf', cleanName: 'HTML to PDF', icon: Code, description: 'Render HTML to PDF via LibreOffice on the server.', status: 'live' },
    ]
  },
  {
    id: 'convert-from',
    title: 'Convert from PDF',
    description: 'De-structure and extract raw formats from PDF content.',
    icon: Download,
    tools: [
      { id: 'pdf-to-jpg', name: 'bolt pdf-to-jpg', cleanName: 'PDF to JPG', icon: Image, description: 'Rasterize absolute vector drawings into clean image series.', status: 'live' },
      { id: 'pdf-to-word', name: 'bolt pdf-to-word', cleanName: 'PDF to WORD', icon: FileText, description: 'Export PDF to Word .docx via LibreOffice (best for simple digital PDFs).', status: 'live' },
      { id: 'pdf-to-powerpoint', name: 'bolt pdf-to-powerpoint', cleanName: 'PDF to POWERPOINT', icon: Presentation, description: 'Export PDF to PowerPoint .pptx via LibreOffice.', status: 'live' },
      { id: 'pdf-to-excel', name: 'bolt pdf-to-excel', cleanName: 'PDF to EXCEL', icon: FileSpreadsheet, description: 'Export PDF to Excel .xlsx via LibreOffice.', status: 'live' },
      { id: 'pdf-to-pdfa', name: 'bolt pdf-to-pdfa', cleanName: 'PDF to PDF/A', icon: Shield, description: 'Convert to PDF/A with Ghostscript (validated when veraPDF is installed).', status: 'live' },
    ]
  },
  {
    id: 'edit',
    title: 'Edit PDF',
    description: 'Surgically replace, rotate, and stamp visual data streams.',
    icon: FileType,
    tools: [
      { id: 'replace', name: 'bolt replace', cleanName: 'Replace Text', icon: Replace, description: 'Replace string operands inside PDF drawing streams locally.', status: 'live', highlight: true },
      { id: 'rotate-pdf', name: 'bolt rotate', cleanName: 'Rotate PDF', icon: RotateCw, description: 'Apply dynamic rotation offsets to document pages.', status: 'live' },
      { id: 'add-page-numbers', name: 'bolt page-numbers', cleanName: 'Add page numbers', icon: Hash, description: 'Stamp consistent page count indices onto document margins.', status: 'live' },
      { id: 'add-watermark', name: 'bolt watermark', cleanName: 'Add watermark', icon: FileText, description: 'Embed persistent security overlay markings onto vectors.', status: 'live' },
      { id: 'crop-pdf', name: 'bolt crop', cleanName: 'Crop PDF', icon: Crop, description: 'Set custom cropping bounds for visual page areas.', status: 'live' },
      { id: 'edit-pdf', name: 'bolt edit', cleanName: 'Edit PDF', icon: FileType, description: 'General structural stream editor and value corrector.', status: 'live' },
    ]
  },
  {
    id: 'forms',
    title: 'PDF Forms',
    description: 'Design and embed fillable interactive form scopes.',
    icon: PenTool,
    tools: [
      { id: 'pdf-forms', name: 'bolt forms', cleanName: 'PDF Forms', icon: PenTool, description: 'Inject operational client-side form controls into document layers.', status: 'live' },
    ]
  },
  {
    id: 'security',
    title: 'PDF Security',
    description: 'Stripe cryptographic protection and redact sensitive paths.',
    icon: ShieldCheck,
    tools: [
      { id: 'unlock-pdf', name: 'bolt unlock', cleanName: 'Unlock PDF', icon: Unlock, description: 'Safely strip restricting passwords from local streams.', status: 'live' },
      { id: 'protect-pdf', name: 'bolt protect', cleanName: 'Protect PDF', icon: Lock, description: 'Encrypt document indices using high-strength protection.', status: 'live' },
      { id: 'sign-pdf', name: 'bolt sign', cleanName: 'Sign PDF', icon: PenTool, description: 'Apply personal cryptographic drawing signatures locally.', status: 'live' },
      { id: 'redact-pdf', name: 'bolt redact', cleanName: 'Redact PDF', icon: Eraser, description: 'Black out a rectangular region on any page (visual blackout).', status: 'live' },
      { id: 'compare-pdf', name: 'bolt compare', cleanName: 'Compare PDF', icon: ArrowLeftRight, description: 'Compare two PDFs by text and page layout.', status: 'live' },
    ]
  }
];

function resolveSuiteTool(id: string): SuiteTool | null {
  if (id === 'replace') {
    return {
      id: 'replace',
      name: 'bolt replace',
      cleanName: 'Replace Text',
      icon: Replace,
      description: 'Replace raw content streams.',
      status: 'live',
      highlight: true,
    };
  }
  return CATEGORIES.flatMap((category) => category.tools).find((tool) => tool.id === id) ?? null;
}

export default function App() {
  const { displayVersion, versionMismatch, buildVersion, serverVersion } = useAppVersion();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedWipTool, setSelectedWipTool] = useState<SuiteTool | null>(null);
  const [popularToolIds, setPopularToolIds] = useState<string[]>([...DEFAULT_POPULAR_TOOL_IDS]);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [file, setFile] = useState<File | null>(null);
  const [pairs, setPairs] = useState<ReplacePair[]>([
    { find: '', replace: '', strict: false }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [log, setLog] = useState<{ msg: string; type: 'info' | 'success' | 'error' }[]>([]);

  // New UI states for the requested layout
  const [matchMode, setMatchMode] = useState('Exact');
  const [replaceScope, setReplaceScope] = useState('All matches');
  const [occurrenceIndex, setOccurrenceIndex] = useState(1);
  const [preserveStyle, setPreserveStyle] = useState(true);
  const [retainMetadata, setRetainMetadata] = useState(true);
  const [replaceStatus, setReplaceStatus] = useState<{ msg: string; type: 'info' | 'ok' | 'error' } | null>(null);
  const [fileUploadFeedback, setFileUploadFeedback] = useState<{ msg: string; type: 'ok' | 'error' } | null>(null);
  const [toolRunStatus, setToolRunStatus] = useState<{ msg: string; type: 'info' | 'ok' | 'error' } | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<{ msg: string; type: 'ok' | 'error' } | null>(null);
  const [contactSending, setContactSending] = useState(false);

  // States for all the newly live operational PDF tools
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [toolText, setToolText] = useState('John Doe, engineering leader\nCreated at absolute high conformance.');
  const [toolTitle, setToolTitle] = useState('Surgical Document Report');
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
  const [protectPass, setProtectPass] = useState('bolt-safe');
  const [redactRegions, setRedactRegions] = useState<RedactRegion[]>([]);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);

  useEffect(() => {
    setRedactRegions([]);
  }, [file]);
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null);

  // States for parameters of previously unconfigured tools
  const [compressLevel, setCompressLevel] = useState<CompressLevel>('balanced');
  const [compressRetainMetadata, setCompressRetainMetadata] = useState(true);
  const [compressHoverLevel, setCompressHoverLevel] = useState<CompressLevel | null>(null);
  const [repairStrategy, setRepairStrategy] = useState('Rebuild cross-reference table stream');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [formsFlatten, setFormsFlatten] = useState(false);
  const [jpgDpi, setJpgDpi] = useState('150 DPI (Standard)');
  const [pdfaStandard, setPdfaStandard] = useState('PDF/A-1b (ISO 19005-1)');

  // Interactive signature drawing state variables
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [sigPageNum, setSigPageNum] = useState(1);
  const [sigX, setSigX] = useState(100);
  const [sigY, setSigY] = useState(100);
  const [sigW, setSigW] = useState(150);
  const [sigH, setSigH] = useState(50);

  const startSigDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e) ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = ('clientY' in e) ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawingSig(true);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e) ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = ('clientY' in e) ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopSigDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLog(prev => [{ msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }, ...prev].slice(0, 50));
  };

  const onPrimaryPdfSelected = (selected: File) => {
    setFile(selected);
    setProcessedBytes(null);
    setReplaceStatus(null);
    setFileUploadFeedback({ msg: `Loaded ${selected.name}`, type: 'ok' });
    addLog(`Loaded ${selected.name}`, 'info');
  };

  const onPrimaryPdfInvalid = (msg: string) => {
    setFileUploadFeedback({ msg, type: 'error' });
    setReplaceStatus({ msg, type: 'error' });
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const syncViewFromPath = useCallback(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/about') setCurrentView('about');
    else if (path === '/contact') setCurrentView('contact');
    else if (path === '/replace') setCurrentView('replace');
    else if (path === '/directory') setCurrentView('directory');
    else if (path === '/compress') {
      const compressTool = CATEGORIES.flatMap((c) => c.tools).find((t) => t.id === 'compress');
      if (compressTool) {
        setSelectedWipTool(compressTool);
        setCurrentView('wip');
      } else {
        setCurrentView('dashboard');
      }
    } else setCurrentView('dashboard');
  }, []);

  const goToView = useCallback((view: View, path: string) => {
    setCurrentView(view);
    window.history.pushState({}, '', path);
  }, []);

  useEffect(() => {
    syncViewFromPath();
    window.addEventListener('popstate', syncViewFromPath);
    return () => window.removeEventListener('popstate', syncViewFromPath);
  }, [syncViewFromPath]);

  const compressTotalBytes = useMemo(() => (file ? file.size : 0), [file]);

  const activePdfToolId =
    currentView === 'wip' && selectedWipTool
      ? selectedWipTool.id
      : currentView === 'replace'
        ? 'replace'
        : currentView === 'compress'
          ? 'compress'
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

  const handleRunReplacement = async () => {
    if (!file) {
      setReplaceStatus({ msg: 'Choose a PDF file first.', type: 'error' });
      return;
    }
    const activePairs = pairs.filter((p) => p.find.trim());
    if (activePairs.length === 0) {
      setReplaceStatus({ msg: 'Add at least one find/replace rule with non-empty Find text.', type: 'error' });
      return;
    }
    if (pdfGate.passwordBlocked) {
      setReplaceStatus({ msg: 'Enter the correct PDF password first.', type: 'error' });
      return;
    }
    setIsProcessing(true);
    setReplaceStatus({ msg: 'Sending PDF to PDFBolt server…', type: 'info' });
    addLog('Sending PDF to PDFBolt server engine...');
    try {
      const result = await serverReplacePdf(file, activePairs, {
        matchMode,
        replaceScope,
        occurrenceIndex,
        preserveStyle,
        retainMetadata,
        pdfPasswordsJson: pdfGate.pdfPasswordsJson,
      });
      const resultBytes = new Uint8Array(await result.blob.arrayBuffer());
      setProcessedBytes(resultBytes);
      const matches = Number(result.matches) || 0;
      const found = Number(result.matchesFound) || 0;
      if (matches > 0) {
        triggerDownload(result.blob, result.filename);
        onToolRunSuccess('replace');
        const msg = `Done. ${matches} replacement(s) from ${found} match(es). Style preserved: ${result.stylePreserved}, fallback: ${result.styleFallback}.`;
        setReplaceStatus({ msg, type: 'ok' });
        addLog(msg, 'success');
      } else {
        const msg = 'No matching text was found in the PDF. Try case-insensitive match or check spelling.';
        setReplaceStatus({ msg, type: 'error' });
        addLog(msg, 'info');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setReplaceStatus({ msg, type: 'error' });
      addLog(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

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
      setContactStatus({ msg: err instanceof Error ? err.message : String(err), type: 'error' });
    } finally {
      setContactSending(false);
    }
  };

  const reset = () => {
    setFile(null);
    setProcessedBytes(null);
    setFileUploadFeedback(null);
    setExtraFiles([]);
    setComparisonReport(null);
    addLog('System Reset.');
  };

  const handleExecuteTool = async (toolId: string) => {
    if (!isToolLive(toolId)) {
      const msg = wipReason(toolId);
      setToolRunStatus({ msg, type: 'error' });
      addLog(msg, 'error');
      return;
    }
    setIsProcessing(true);
    setToolRunStatus({ msg: `Sending ${toolId} to PDFBolt server…`, type: 'info' });
    addLog(`Sending ${toolId} to PDFBolt server engine...`);
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
        const resultBytes = new Uint8Array(bytes);
        setProcessedBytes(resultBytes);
        triggerDownload(blob, filename);
        const successMsg = `Downloaded ${filename}`;
        onToolRunSuccess('redact-pdf', { syncServer: true });
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
        const resultBytes = new Uint8Array(await compressResult.blob.arrayBuffer());
        setProcessedBytes(resultBytes);
        triggerDownload(compressResult.blob, compressResult.filename);
        const orig = Number(compressResult.originalBytes);
        const out = Number(compressResult.outputBytes);
        const pct = compressResult.savedPercent;
        const compressMsg = `Compressed: ${formatBytesHint(String(orig))} → ${formatBytesHint(String(out))} (${pct}% smaller, ${compressResult.pages} page(s)).`;
        onToolRunSuccess('compress');
        setToolRunStatus({ msg: compressMsg, type: 'ok' });
        addLog(compressMsg, 'success');
        return;
      }

      let signatureBlob: Blob | null = null;
      if (toolId === 'sign-pdf') {
        const canvas = sigCanvasRef.current;
        if (!canvas) throw new Error('Signature canvas is not ready.');
        signatureBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
      }

      const result = await serverExecuteTool(toolId, {
        file,
        extraFiles,
        compareFile2,
        signatureBlob,
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
        sigPageNum,
        sigX,
        sigY,
        sigW,
        sigH,
        jpgDpi,
      });

      if (result.kind === 'json') {
        setComparisonReport(result.data as ComparisonReport);
        onToolRunSuccess(toolId);
        setToolRunStatus({ msg: 'Compare complete.', type: 'ok' });
        addLog('Compare complete.', 'success');
        return;
      }

      const resultBytes = new Uint8Array(await result.blob.arrayBuffer());
      setProcessedBytes(resultBytes);
      triggerDownload(result.blob, result.filename);
      let successMsg = `Downloaded ${result.filename}`;
      if (result.pdfaValidationNote) {
        successMsg += ` ${result.pdfaValidationNote}`;
      }
      onToolRunSuccess(toolId);
      setToolRunStatus({ msg: successMsg, type: 'ok' });
      addLog(successMsg, 'success');
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (isPdfPasswordRequiredError(e)) {
        for (const entry of encryptedPdfEntries) {
          entry.onPasswordChange('');
        }
      }
      setToolRunStatus({ msg: errMsg, type: 'error' });
      addLog(errMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter tools by search and category query
  const filteredCategories = CATEGORIES.map(category => {
    const filteredTools = category.tools.filter(tool => {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.cleanName.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    });
    return { ...category, tools: filteredTools };
  }).filter(category => {
    if (activeCategory !== 'all' && category.id !== activeCategory) return false;
    return category.tools.length > 0;
  });

  const handleToolClick = (tool: SuiteTool) => {
    if (tool.id === 'replace') {
      goToView('replace', '/replace');
    } else {
      setFile(null);
      setExtraFiles([]);
      setCompareFile2(null);
      setComparisonReport(null);
      setFileUploadFeedback(null);
      setSelectedWipTool(tool);
      setToolRunStatus(null);
      setCurrentView('wip');
      if (tool.id === 'compress') {
        window.history.pushState({}, '', '/compress');
      }
    }
  };

  const renderToolSpotlightGrid = (tools: SuiteTool[]) => (
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
            onClick={() => handleToolClick(tool)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToolClick(tool);
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
                  <span className="text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-[#FF3300] text-white">
                    <span>RUN</span>
                    <ChevronRight size={6} />
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[11px] text-gray-900 group-hover:text-[#FF3300] transition-colors truncate w-full">
                  <BoltBrand text={tool.name} />
                </h3>
                <p className="text-[10px] text-gray-500 font-sans line-clamp-2 mt-0.5 leading-tight group-hover:text-gray-700 transition-colors">
                  {tool.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors pt-1.5 border-t border-[#141414]/[0.05] mt-auto z-10">
              <span className="truncate">Deterministic</span>
              <ChevronRight size={8} className="transition-transform group-hover:translate-x-0.5 shrink-0 text-gray-400 group-hover:text-black" />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDashboard = () => {
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
              Surgical tools for every PDF workflow.
            </h2>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              A high-performance collection of deterministic PDF utilities running directly in your web browser for complete document confidentiality.
            </p>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Release {formatBoltVersion(displayVersion)}
              {versionMismatch && serverVersion
                ? ` (UI build ${formatBoltVersion(buildVersion)})`
                : ''}
            </p>
          </div>
        </header>

        {/* Global Search Center */}
        <div className="max-w-md mx-auto relative">
          <Search size={16} className="absolute left-4 top-3.5 text-gray-500" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Search all 31 tools..." 
            aria-label="Search specialized PDF tools"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#141414]/25 hover:border-[#141414]/40 focus:border-[#FF3300] p-3 pl-12 font-mono text-xs outline-none rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-[#FF3300]/25 focus-visible:border-[#FF3300]"
          />
        </div>

        {/* Ad Space Placement */}
        <div className="w-full pt-2">
          <BannerAd onInquire={() => goToView('contact', '/contact')} />
        </div>

        {/* Dynamic Search Results vs. Clean Spotlight Categorization */}
        {searchQuery ? (
          // Search Results View
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold">
              Found matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.flatMap(c => c.tools)
                .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.cleanName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(tool => {
                  const ToolIcon = tool.icon;
                  const isLive = isToolLive(tool.id);
                  return (
                    <div 
                      key={tool.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open tool: ${tool.name}. ${tool.description} (${isLive ? 'Live' : 'Work in progress'})`}
                      onClick={() => handleToolClick(tool)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToolClick(tool);
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
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5 line-clamp-1">{tool.description}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isLive ? 'bg-emerald-600/10 text-emerald-800' : 'bg-amber-500/15 text-amber-900'
                      }`}>
                        {isLive ? 'Live' : 'WIP'}
                      </span>
                    </div>
                  );
                })
              }
              {CATEGORIES.flatMap(c => c.tools)
                .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.cleanName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.description.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="col-span-2 text-center py-10 text-xs font-mono text-gray-500 uppercase">
                  No specialized tools match your query
                </div>
              )}
            </div>
          </div>
        ) : (
          // Simple, Aesthetic Standard View
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white/50 p-2 rounded-lg border border-[#141414]/5">
                <h2 className="text-[10px] uppercase font-mono tracking-widest text-[#FF3300] font-bold pl-2">
                  Most Popular Actions
                </h2>
                <p className="text-[9px] font-mono text-gray-500 pr-2">
                  Ranked from successful runs (no database — JSON file on server)
                </p>
              </div>
              {renderToolSpotlightGrid(spotlightTools)}
            </div>

            {recentTools.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-[#141414]/5">
                  <h2 className="text-[10px] uppercase font-mono tracking-widest text-gray-700 font-bold pl-2">
                    Your recent tools
                  </h2>
                  <p className="text-[9px] font-mono text-gray-500 pr-2">This browser only</p>
                </div>
                {renderToolSpotlightGrid(recentTools)}
              </div>
            )}

            {/* Link to Directory Tab */}
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => { goToView('directory', '/directory'); setActiveCategory('all'); setSearchQuery(''); }}
                aria-label="Browse complete catalog directory of 31 PDF tools"
                className="group flex items-center gap-2 bg-[#141414] text-[#E4E3E0] hover:bg-[#FF3300] px-6 py-3.5 font-mono text-xs uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF3300]"
              >
                <span>Browse Complete Suite Directory (31 Tools)</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDirectory = () => {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Directory Header */}
        <header className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex bg-[#FF3300]/10 text-[#FF3300] px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
            Catalog Directory
          </span>
          <h1 className="text-4xl font-black tracking-tighter leading-none text-[#141414]">
            Complete Suite Directory
          </h1>
          <p className="text-sm font-sans text-gray-600 max-w-xl mx-auto leading-relaxed">
            A structured catalog of PDF utilities. Live tools run on the PDFBolt server; WIP tools are visible but disabled until ready.
          </p>
        </header>

        {/* Local Search in Directory */}
        <div className="max-w-md mx-auto relative">
          <Search size={16} className="absolute left-4 top-3.5 text-gray-500" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Filter catalog (e.g., 'word', 'compress', 'sign')..." 
            aria-label="Filter catalog directory tools"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#141414]/25 hover:border-[#141414]/45 focus:border-[#FF3300] p-3 pl-12 font-mono text-xs outline-none rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-[#FF3300]/20"
          />
        </div>

        {/* Ad Placement Banner */}
        <div className="max-w-4xl mx-auto pt-2">
          <BannerAd onInquire={() => goToView('contact', '/contact')} />
        </div>

        {/* Structured Drawer Directory list */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#141414]/10 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-[10px] uppercase font-mono tracking-widest text-[#FF3300] font-bold">
                Browse Categories
              </h2>
              <p className="text-[11px] font-sans text-gray-500">Select any filter tab to isolate specific utilities.</p>
            </div>

            {/* Categories Tab Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full" role="tablist" aria-label="Tool Categories">
              <button 
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-md border whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${
                  activeCategory === 'all' 
                    ? 'bg-[#141414] border-[#141414] text-white font-bold' 
                    : 'bg-white border-gray-200 text-gray-600 hover:text-black hover:border-gray-450'
                }`}
              >
                All ({CATEGORIES.reduce((v, c) => v + c.tools.length, 0)})
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-md border whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${
                    activeCategory === cat.id
                      ? 'bg-[#FF3300] border-[#FF3300] text-white font-bold' 
                      : 'bg-white border-gray-200 text-gray-600 hover:text-black hover:border-gray-450'
                  }`}
                >
                  {cat.title.replace(" PDF", "")}
                </button>
              ))}
            </div>
          </div>

          {/* High Density Minimalist Directory List */}
          <div className="bg-white/40 border border-[#141414]/10 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {filteredCategories.map(category => {
                const CatIcon = category.icon;
                return (
                  <div key={category.id} className="space-y-3">
                    <h3 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold pb-1 border-b border-gray-150 flex items-center gap-1.5">
                      {CatIcon && <CatIcon size={12} className="text-[#FF3300]" aria-hidden="true" />}
                      <span>{category.title}</span>
                    </h3>
                    <div className="space-y-1">
                      {category.tools.map(tool => {
                        const TIcon = tool.icon;
                        const isLive = isToolLive(tool.id);
                        return (
                          <div 
                            key={tool.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Launch tool: ${tool.name} (${isLive ? 'Live' : 'WIP'})`}
                            onClick={() => handleToolClick(tool)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToolClick(tool);
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
                              <span className={`text-xs font-bold truncate transition-colors ${
                                isLive ? 'text-gray-800 group-hover:text-[#FF3300]' : 'text-gray-600'
                              }`}>
                                <BoltBrand text={tool.name} />
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              <span className={`text-[7px] font-mono px-1 py-0.2 rounded font-black uppercase ${
                                isLive ? 'bg-[#FF3300]/10 text-[#FF3300]' : 'bg-amber-500/15 text-amber-900'
                              }`}>
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
  };

  const renderWIP = () => {
    if (!selectedWipTool) return renderDashboard();
    const ToolIcon = selectedWipTool.icon;
    const toolId = selectedWipTool.id;
    const isLive = isToolLive(toolId);

    const isNoInput =
      toolId === 'redact-pdf'
        ? !file || redactRegions.length === 0 || pdfGate.passwordBlocked
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
    };

    return (
      <div className="max-w-6xl mx-auto p-8 space-y-10">
        <button 
          onClick={() => { goToView('dashboard', '/'); setComparisonReport(null); }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
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
                <span className={`text-[8px] font-mono tracking-widest px-1.5 py-0.5 font-bold rounded ${
                  isLive ? 'bg-[#FF3300] text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isLive ? 'SERVER ENGINE' : 'WORK IN PROGRESS'}
                </span>
                <h2 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-1">
                  <BoltBrand text={selectedWipTool.name} showInfo={toolId === 'replace'} />
                </h2>
                <p className="text-xs text-gray-500 font-sans">{selectedWipTool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#E4E3E0]/50 px-3 py-1.5 rounded border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#FF3300] animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                {isLive ? 'PDFBolt API' : 'Coming soon'}
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
              <p className="text-[10px] font-mono text-amber-800/80">
                You can browse other Live tools from the dashboard. Need this sooner?{' '}
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
                    <label id="split-range-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Target Page Specification</label>
                    <input 
                      type="text" 
                      value={splitRange} 
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1-2, 5" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-[9px] text-gray-500 font-mono italic">Specify single indices (e.g. "1") or custom groupings (e.g. "1-3, 5").</p>
                  </div>
                )}

                {/* 3. Remove Pages */}
                {toolId === 'remove-pages' && (
                  <div className="space-y-2">
                    <label id="remove-pages-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Page indices to Purge</label>
                    <input 
                      type="text" 
                      value={deletePageStr} 
                      onChange={(e) => setDeletePageStr(e.target.value)}
                      placeholder="e.g. 2, 4" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-[9px] text-gray-500 font-mono italic">These pages will be excised completely from the structural tree output.</p>
                  </div>
                )}

                {/* 4. Extract Pages */}
                {toolId === 'extract-pages' && (
                  <div className="space-y-2">
                    <label id="extract-pages-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Target Pages to Extract</label>
                    <input 
                      type="text" 
                      value={extractPageStr} 
                      onChange={(e) => setExtractPageStr(e.target.value)}
                      placeholder="e.g. 1, 3-5" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-[9px] text-gray-500 font-mono italic">Selected pages are pulled out as a new single document format.</p>
                  </div>
                )}

                {/* 5. Organize PDF */}
                {toolId === 'organize-pdf' && (
                  <div className="space-y-2">
                    <label id="reorder-pages-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Rearranged Index Map</label>
                    <input 
                      type="text" 
                      value={orderStr} 
                      onChange={(e) => setOrderStr(e.target.value)}
                      placeholder="e.g. 3, 2, 1" 
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                    <p className="text-[9px] text-gray-500 font-mono italic">Enforce a custom layout order (e.g., input "3, 2, 1" to reverse a 3-page file).</p>
                  </div>
                )}

                {/* 9. OCR */}
                {toolId === 'ocr-pdf' && (
                  <div className="space-y-2">
                    <label id="ocr-lang-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Recognition overlay language</label>
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
                      <label id="rotate-deg-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Rotation angle</label>
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
                      <label id="rotate-scope-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Page Range Filter</label>
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
                      <label id="page-num-format-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Template pattern</label>
                      <input 
                        type="text" 
                        value={pageNumFormat} 
                        onChange={(e) => setPageNumFormat(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label id="page-num-size-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Font size</label>
                      <input 
                        type="number" 
                        value={pageNumSize} 
                        onChange={(e) => setPageNumSize(boundedIntFromInput(e.target.value, pageNumSize, 1))}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label id="page-num-align-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Alignment</label>
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
                        <label id="watermark-txt-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Watermark label</label>
                        <input 
                          type="text" 
                          value={watermarkText} 
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label id="watermark-size-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Font size</label>
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
                          <label id="watermark-angle-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Rotation angle</label>
                          <input 
                            type="number" 
                            value={watermarkAngle} 
                            onChange={(e) => setWatermarkAngle(boundedIntFromInput(e.target.value, watermarkAngle))}
                            className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label id="watermark-color-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Color hex</label>
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
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span>OPACITY TRANSFERENCE</span>
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
                    <p className="text-[10px] text-gray-500 font-mono block italic">Redistribute cropping border widths locally (pixels margins):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-gray-500 block">Left bound</label>
                        <input type="number" value={cropLeft} onChange={(e) => setCropLeft(boundedIntFromInput(e.target.value, cropLeft, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-gray-500 block">Right bound</label>
                        <input type="number" value={cropRight} onChange={(e) => setCropRight(boundedIntFromInput(e.target.value, cropRight, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-gray-500 block">Top bound</label>
                        <input type="number" value={cropTop} onChange={(e) => setCropTop(boundedIntFromInput(e.target.value, cropTop, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-gray-500 block">Bottom bound</label>
                        <input type="number" value={cropBottom} onChange={(e) => setCropBottom(boundedIntFromInput(e.target.value, cropBottom, 0))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 24. Edit PDF Properties / Metadata */}
                {toolId === 'edit-pdf' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 block">Metadata title</label>
                      <input type="text" placeholder="Title information" value={metadataTitle} onChange={(e) => setMetadataTitle(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 block">Metadata Author</label>
                      <input type="text" placeholder="Creator / Writer" value={metadataAuthor} onChange={(e) => setMetadataAuthor(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 block">Metadata Subject</label>
                      <input type="text" placeholder="Document Topic" value={metadataSubject} onChange={(e) => setMetadataSubject(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 block">Creator Application</label>
                      <input type="text" placeholder="PDFbuilder version" value={metadataCreator} onChange={(e) => setMetadataCreator(e.target.value)} className="w-full bg-white border p-3 font-mono text-xs" />
                    </div>
                  </div>
                )}

                {/* 27. Protect PDF */}
                {toolId === 'protect-pdf' && (
                  <div className="space-y-2 max-w-sm">
                    <label id="protect-pass-lbl" className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Document Encryption Password</label>
                    <input 
                      type="password" 
                      value={protectPass} 
                      onChange={(e) => setProtectPass(e.target.value)}
                      placeholder="Input protection key..."
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
                    />
                  </div>
                )}

                {/* 28. Sign PDF */}
                {toolId === 'sign-pdf' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Draw your digital signature inside canvas below:</label>
                      <div className="border border-[#141414] bg-white rounded-lg p-3 inline-block">
                        <canvas 
                          ref={sigCanvasRef}
                          width={400}
                          height={120}
                          onMouseDown={startSigDrawing}
                          onMouseMove={drawSig}
                          onMouseUp={stopSigDrawing}
                          onMouseLeave={stopSigDrawing}
                          onTouchStart={startSigDrawing}
                          onTouchMove={drawSig}
                          onTouchEnd={stopSigDrawing}
                          className="bg-slate-50 border border-dashed text-slate-400 cursor-crosshair block"
                        />
                      </div>
                      <div className="flex gap-2.5">
                        <button 
                          onClick={clearSig}
                          className="bg-gray-100 border border-[#141414]/15 px-3 py-1.5 font-mono text-[9px] uppercase font-bold text-gray-700 hover:bg-gray-200"
                        >
                          Clear canvas
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-gray-500 block">Target page</label>
                        <input type="number" min="1" value={sigPageNum} onChange={(e) => setSigPageNum(boundedIntFromInput(e.target.value, sigPageNum, 1))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-gray-500 block">Coordinate X</label>
                        <input type="number" value={sigX} onChange={(e) => setSigX(boundedIntFromInput(e.target.value, sigX))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-gray-500 block">Coordinate Y</label>
                        <input type="number" value={sigY} onChange={(e) => setSigY(boundedIntFromInput(e.target.value, sigY))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-gray-500 block">Width footprint</label>
                        <input type="number" value={sigW} onChange={(e) => setSigW(boundedIntFromInput(e.target.value, sigW, 1))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-gray-500 block">Height footprint</label>
                        <input type="number" value={sigH} onChange={(e) => setSigH(boundedIntFromInput(e.target.value, sigH, 1))} className="w-full bg-white border p-2 text-xs font-mono" />
                      </div>
                    </div>
                  </div>
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
                    <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Compression level</label>
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
                              <span className={`block text-[9px] font-mono mt-1 leading-snug ${selected ? 'text-white/80' : 'opacity-50'}`}>
                                {opt.hint}
                              </span>
                            </button>
                            {showTip && (
                              <div className="absolute left-1/2 bottom-full z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 border border-[#141414] bg-white px-3 py-2 text-[10px] font-mono leading-snug text-[#141414] shadow-[3px_3px_0px_#141414] pointer-events-none">
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
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Recovery Strategy</label>
                      <select 
                        value={repairStrategy} 
                        onChange={(e) => setRepairStrategy(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      >
                        <option>Rebuild cross-reference table stream</option>
                        <option>Synthesize file header tokens</option>
                        <option>Re-index orphaned visual elements</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-gray-500 font-mono italic">Reconstructs damaged or truncated binary PDF layout markers.</p>
                    </div>
                  </div>
                )}

                {/* 33. Unlock PDF */}
                {toolId === 'unlock-pdf' && (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Document Open or Restriction Password (If requested)</label>
                      <input 
                        type="password" 
                        value={unlockPassword} 
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        placeholder="Optional decryption key..."
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      />
                    </div>
                    <div className="space-y-1.5 p-3 bg-amber-50/50 border border-amber-200/50 rounded-sm">
                      <p className="text-[10px] text-amber-800 font-sans leading-relaxed">
                        <strong>Operational Mode:</strong> Strips password protection layers and prints restrictions. If the file has a master user-open password, supply it above to authorize decryption.
                      </p>
                    </div>
                  </div>
                )}

                {/* 34. PDF Forms */}
                {toolId === 'pdf-forms' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Form Interaction Flow</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setFormsFlatten(!formsFlatten)}
                          className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${formsFlatten ? 'bg-[#FF3300] text-white border-[#FF3300]' : 'bg-white'}`}
                        >
                          {formsFlatten && <CheckCircle2 size={12} />}
                        </button>
                        <span className="text-xs font-bold uppercase tracking-tighter">Flatten active interactive components</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono italic">Fuses form entry layers directly into the base vector document.</p>
                  </div>
                )}

                {/* 35. PDF to JPG */}
                {toolId === 'pdf-to-jpg' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Target Output DPI</label>
                      <select 
                        value={jpgDpi} 
                        onChange={(e) => setJpgDpi(e.target.value)}
                        className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      >
                        <option>96 DPI (Screen optimize)</option>
                        <option>150 DPI (Standard)</option>
                        <option>300 DPI (High Fidelity Print)</option>
                      </select>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono italic">Rasterizes vector graphics into independent compressed JPG/PNG layers.</p>
                  </div>
                )}

                {/* 36–38. PDF to Office (LibreOffice) */}
                {(toolId === 'pdf-to-word' || toolId === 'pdf-to-powerpoint' || toolId === 'pdf-to-excel') && (
                  <div className="rounded-lg border border-[#141414]/15 bg-[#E4E3E0]/40 p-4 max-w-lg space-y-2">
                    <p className="text-[10px] font-mono uppercase text-gray-700 font-bold">LibreOffice export</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Converts your PDF to a real{' '}
                      {toolId === 'pdf-to-word' && 'Word (.docx)'}
                      {toolId === 'pdf-to-powerpoint' && 'PowerPoint (.pptx)'}
                      {toolId === 'pdf-to-excel' && 'Excel (.xlsx)'} file using the same LibreOffice engine as our Office→PDF tools.
                      Complex layouts and scanned pages may not match the original perfectly; use OCR first for image-only PDFs.
                    </p>
                  </div>
                )}

                {/* 39. PDF to PDF/A */}
                {toolId === 'pdf-to-pdfa' && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-gray-600 font-bold block">Conformance Standard</label>
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
                    <p className="text-[9px] text-gray-500 font-mono italic">Applies mandatory embeddings and strict profiles for long-term archiving standards.</p>
                  </div>
                )}

              </div>

              {toolRunStatus && (
                <p
                  role="status"
                  className={`text-[11px] font-mono px-4 py-3 rounded-lg border ${
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
                          : ['scan-to-pdf', 'jpg-to-pdf'].includes(toolId)
                            ? 'Choose at least one image'
                            : ['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'].includes(toolId)
                              ? 'Choose an Office file first'
                              : toolId === 'html-to-pdf'
                                ? htmlInputMode === 'file'
                                  ? 'Choose an HTML file first'
                                  : 'Enter HTML content first'
                                : toolId === 'redact-pdf'
                                  ? 'Draw at least one black box'
                                  : 'Choose a PDF first'
                      : boltExecuteLabel(toolId)}
              </button>
              )}
              {isLive && toolId !== 'redact-pdf' && (
                <div className="text-center pt-4 border-t border-gray-100 mt-6">
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">
                    Processed on PDFBolt server — files are not stored after the request completes.
                  </span>
                </div>
              )}
              {isLive && toolId === 'redact-pdf' && (
                <div className="text-center pt-2">
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">
                    Redaction preview and download run in your browser — the PDF is not uploaded for this tool.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };


  const renderAbout = () => (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-6">
        <h2 className="text-5xl font-black tracking-tighter italic text-[#141414]">About PDF<BoltBrand text="bolt" /></h2>
        <div className="prose prose-sm text-[#141414] font-mono leading-relaxed space-y-6 text-xs uppercase tracking-tight">
          <p className="text-sm font-sans normal-case text-gray-600 leading-relaxed font-medium">
            PDFbolt is a professional-grade suite of localized document utilities engineered for workflows requiring absolute privacy, precision, and speed.
          </p>
          <div className="space-y-2">
            <h4 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">Byte-Level Stream Precision</h4>
            <p className="font-sans normal-case text-gray-500 text-xs">
              While standard visual editors rely on cloud servers or flatten document layers into heavy, static images, PDFbolt executes at the binary stream level. Our client-side engines modify layout operands and text instructions directly inside the PDF structure, ensuring original vector scalability and fonts remain fully intact.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-[#FF3300] text-xs font-mono uppercase tracking-widest">Live vs. work in progress</h4>
            <p className="font-sans normal-case text-gray-500 text-xs">
              Tools marked <strong className="text-amber-800">WIP</strong> in the directory are not ready yet and cannot be run. <strong className="text-emerald-800">Live</strong> tools run on the PDFBolt server; uploads are processed per request and not kept on disk afterward.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 py-8 border-y border-[#141414]/10">
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-[10px]"><ShieldCheck size={18} className="text-[#FF3300]" /> Confidential Execution</h3>
          <p className="text-xs text-gray-500 mt-2">Live tools send files to the server only for processing. WIP tools stay disabled until fully supported.</p>
        </div>
        <div>
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-[10px]"><Zap size={18} className="text-[#FF3300]" /> Deterministic Engine</h3>
          <p className="text-xs text-gray-500 mt-2">Precise byte manipulation guarantees original vector styles, hyperlink bindings, and layout elements remain unchanged.</p>
        </div>
      </div>
      <button 
        onClick={() => goToView('dashboard', '/')}
        className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] py-1 transition-all"
      >
        <ChevronRight size={14} /> Back to Suite
      </button>
    </div>
  );

  const renderContact = () => (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-6">
        <h2 className="text-5xl font-black tracking-tighter italic">Contact Us</h2>
        <p className="font-mono text-sm text-gray-700 leading-relaxed uppercase tracking-tighter">For inquiries, feature requests, or support, send us a message.</p>
      </div>
      
      <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-1 gap-12">
        <div className="space-y-6 max-w-2xl">
          <div className="bg-[#FF3300]/5 border border-[#FF3300]/10 rounded-xl p-5 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-widest font-black text-[#FF3300]">Sponsorship Opportunities</h4>
            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              Interested in acquiring premier ad slots or horizontal banners inside the PDFbolt workflow suite? Reach thousands of active PDF creators, developers, and writers monthly. Set the subject to <strong className="text-black font-semibold">"Sponsorship Inquiry"</strong> to route quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label id="lbl-name" className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">Your Name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="NAME" aria-labelledby="lbl-name" className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30" />
            </div>
            <div className="space-y-1">
              <label id="lbl-email" className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">Your Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="EMAIL" aria-labelledby="lbl-email" className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30" />
            </div>
          </div>
          <div className="space-y-1">
            <label id="lbl-subj" className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">Subject</label>
            <input type="text" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="SUBJECT" aria-labelledby="lbl-subj" className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30" />
          </div>
          <div className="space-y-1">
            <label id="lbl-msg" className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">Message</label>
            <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={6} placeholder="MESSAGE DATA..." aria-labelledby="lbl-msg" className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30 resize-none" />
          </div>
          {contactStatus && (
            <p className={`text-xs font-mono ${contactStatus.type === 'ok' ? 'text-green-700' : 'text-red-600'}`} role="status">
              {contactStatus.msg}
            </p>
          )}
          <button type="submit" disabled={contactSending} className="bg-[#141414] text-[#E4E3E0] px-12 py-4 font-black tracking-widest uppercase hover:bg-[#FF3300] transition-colors shadow-[6px_6px_0px_#FF3300]/20 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 disabled:opacity-50">
            {contactSending ? 'Sending...' : 'Send Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderReplace = () => (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <button 
        onClick={() => { goToView('dashboard', '/'); }}
        className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to Suite Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 border border-[#141414]/15 rounded-xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FF3300]/10 border border-[#FF3300]/20 rounded-lg text-[#FF3300]">
            <Replace size={28} />
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-mono tracking-widest bg-[#FF3300] text-white px-1.5 py-0.5 font-bold rounded">
              SERVER ENGINE
            </span>
            <h2 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-1">
              <BoltBrand text="bolt replace" showInfo />
            </h2>
            <p className="text-xs text-gray-500 font-sans">
              Replace text inside PDF content streams and download the edited file.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#E4E3E0]/50 px-3 py-1.5 rounded border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-[#FF3300] animate-pulse" />
          <span className="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-wider">PDFBolt API</span>
        </div>
      </div>

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
        {/* Main interactive form */}
        <div className="lg:col-span-12 space-y-8">
          {/* File Selection */}
          <div className="space-y-2 relative z-20">
            <span id="pdf-file-label" className="text-[10px] font-mono uppercase tracking-widest text-gray-600 font-bold block">
              {boltUploadHeading('replace')}
            </span>
            <PdfFilePicker
              file={file}
              onFileSelected={onPrimaryPdfSelected}
              onInvalidFile={onPrimaryPdfInvalid}
              labelId="pdf-file-label"
              chooseLabel={`Choose PDF for ${boltToolName('replace')}`}
            />
            {fileUploadFeedback && (
              <p
                className={`text-[10px] font-mono ${fileUploadFeedback.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}
                role="status"
              >
                {fileUploadFeedback.msg}
              </p>
            )}
          </div>

          {/* Rules Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-[10px] font-mono uppercase text-gray-600 font-bold px-2">
              <div className="col-span-5">Find</div>
              <div className="col-span-5">Replace with</div>
              <div className="col-span-2">Action</div>
            </div>
            
            <AnimatePresence initial={false}>
              {pairs.map((pair, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <div className="col-span-5">
                    <input 
                      type="text" 
                      value={pair.find}
                      aria-label={`Search pattern for rule ${idx + 1}`}
                      onChange={(e) => { const n = [...pairs]; n[idx].find = e.target.value; setPairs(n); }}
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#FF3300]/30"
                      placeholder="Search pattern..."
                    />
                  </div>
                  <div className="col-span-5">
                    <input 
                      type="text" 
                      value={pair.replace}
                      aria-label={`Replacement text for rule ${idx + 1}`}
                      onChange={(e) => { const n = [...pairs]; n[idx].replace = e.target.value; setPairs(n); }}
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#FF3300]/30"
                      placeholder="New text..."
                    />
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => setPairs(pairs.filter((_, i) => i !== idx))}
                      aria-label={`Delete rule ${idx + 1}`}
                      className="w-full h-[46px] border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-tighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button 
              onClick={() => setPairs([...pairs, { find: '', replace: '', strict: false }])}
              aria-label="Add search and replace rule pair"
              className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-[#FF3300] hover:opacity-70 transition-opacity p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
            >
              <Plus size={14} /> Add find/replace rule
            </button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#141414]/10 pt-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label id="match-mode-lbl" className="text-[10px] font-mono uppercase text-gray-500 font-bold block">Match mode</label>
                <select
                  value={matchMode}
                  onChange={(e) => setMatchMode(e.target.value)}
                  aria-labelledby="match-mode-lbl"
                  className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                >
                  <option value="Exact">Exact</option>
                  <option value="Case-insensitive">Case-insensitive</option>
                  <option value="Whole word">Whole word</option>
                  <option value="Case-insensitive whole word">Case-insensitive whole word</option>
                </select>
              </div>

              <div className="space-y-2">
                <label id="replace-scope-lbl" className="text-[10px] font-mono uppercase text-gray-500 font-bold block">Replace scope</label>
                <div className="flex gap-4">
                  <select 
                    value={replaceScope}
                    onChange={(e) => setReplaceScope(e.target.value)}
                    aria-labelledby="replace-scope-lbl"
                    className="flex-1 bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                  >
                    <option>All matches</option>
                    <option>First match only</option>
                    <option>Specific occurrence</option>
                  </select>
                  {replaceScope === 'Specific occurrence' && (
                    <input 
                      type="number" 
                      value={occurrenceIndex}
                      aria-label="Specific occurrence index"
                      onChange={(e) => setOccurrenceIndex(boundedIntFromInput(e.target.value, occurrenceIndex, 1))}
                      className="w-20 bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/20"
                      min="1"
                    />
                  )}
                </div>
                <p className="text-[9px] text-gray-500 font-mono italic">Occurrence index (1-based)</p>
              </div>


            </div>

            <div className="space-y-4 pt-6">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => { const n = [...pairs]; n.forEach(p => p.strict = !p.strict); setPairs([...n]); }}
                   aria-label="Toggle strict same-length replacement mode"
                   aria-pressed={pairs.every(p => p.strict)}
                   className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${pairs.every(p => p.strict) ? 'bg-[#FF3300] text-white border-[#FF3300]' : 'bg-white'}`}
                 >
                   {pairs.every(p => p.strict) && <CheckCircle2 size={12} />}
                 </button>
                 <span className="text-xs font-bold uppercase tracking-tighter">Strict same-length mode</span>
               </div>

               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setPreserveStyle(!preserveStyle)}
                   aria-label="Toggle preservation of original style elements"
                   aria-pressed={preserveStyle}
                   className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${preserveStyle ? 'bg-[#141414] text-white' : 'bg-white'}`}
                 >
                   {preserveStyle && <CheckCircle2 size={12} />}
                 </button>
                 <span className="text-xs font-bold uppercase tracking-tighter">Preserve original style (bold/italic/font)</span>
               </div>

               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setRetainMetadata(!retainMetadata)}
                   aria-label="Toggle retention of PDF metadata"
                   aria-pressed={retainMetadata}
                   className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${retainMetadata ? 'bg-[#141414] text-white' : 'bg-white'}`}
                 >
                   {retainMetadata && <CheckCircle2 size={12} />}
                 </button>
                 <span className="text-xs font-bold uppercase tracking-tighter">Retain original PDF metadata</span>
               </div>

            </div>
          </div>

          {replaceStatus && (
            <p
              role="status"
              className={`font-mono text-xs p-4 border rounded-lg ${
                replaceStatus.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : replaceStatus.type === 'error'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-white border-[#141414]/20 text-gray-700'
              }`}
            >
              {replaceStatus.msg}
            </p>
          )}

          <button 
            disabled={!file || isProcessing || pdfGate.passwordBlocked || !pairs.some((p) => p.find.trim())}
            onClick={handleRunReplacement}
            aria-label={isProcessing ? "Processing PDF stream. Please wait." : "Execute text replacement and download final PDF"}
            className={`w-full py-8 font-black text-2xl uppercase tracking-tighter transition-all shadow-[8px_8px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${!file || isProcessing || pdfGate.passwordBlocked || !pairs.some((p) => p.find.trim()) ? 'bg-[#DCDAD5] text-neutral-600 cursor-not-allowed border-2 border-[#141414]/40 shadow-none translate-none' : 'bg-[#FF3300] text-white hover:bg-[#141414] hover:shadow-[8px_8px_0px_#FF3300]'}`}
          >
            {isProcessing ? 'Processing Stream...' : 'Replace and Download'}
          </button>

        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex flex-col">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
           aria-hidden="true"
      />

      <nav className="border-b border-[#141414] bg-white/80 backdrop-blur-sm sticky top-0 z-[100] px-6 h-16 flex items-center justify-between" aria-label="Global navigation menu">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => goToView('dashboard', '/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('dashboard');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="PDFbolt home page"
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 p-1 rounded-md"
          >
            <h1 className="text-2xl font-black tracking-tighter uppercase">
              PDF<BoltBrand text="bolt" />
            </h1>
          </div>
          
          <div className="hidden md:flex gap-6" role="tablist" aria-label="Navigation View Tabs">
            <button 
              onClick={() => { goToView('dashboard', '/'); setSearchQuery(''); }} 
              role="tab"
              aria-selected={currentView === 'dashboard'}
              className={`text-[10px] font-mono uppercase tracking-widest hover:text-[#FF3300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${currentView === 'dashboard' ? 'text-[#FF3300] font-bold underline decoration-2 underline-offset-4' : ''}`}
            >
              Suite
            </button>
            <button 
              onClick={() => { goToView('directory', '/directory'); setSearchQuery(''); }} 
              role="tab"
              aria-selected={currentView === 'directory'}
              className={`text-[10px] font-mono uppercase tracking-widest hover:text-[#FF3300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${currentView === 'directory' ? 'text-[#FF3300] font-bold underline decoration-2 underline-offset-4' : ''}`}
            >
              Directory
            </button>
            <button 
              onClick={() => goToView('about', '/about')} 
              role="tab"
              aria-selected={currentView === 'about'}
              className={`text-[10px] font-mono uppercase tracking-widest hover:text-[#FF3300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${currentView === 'about' ? 'text-[#FF3300] font-bold underline decoration-2 underline-offset-4' : ''}`}
            >
              About
            </button>
            <button 
              onClick={() => goToView('contact', '/contact')} 
              role="tab"
              aria-selected={currentView === 'contact'}
              className={`text-[10px] font-mono uppercase tracking-widest hover:text-[#FF3300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${currentView === 'contact' ? 'text-[#FF3300] font-bold underline decoration-2 underline-offset-4' : ''}`}
            >
              Contact
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${file ? 'bg-[#FF3300]' : 'bg-gray-400'}`} aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase text-gray-500 font-bold hidden sm:inline tracking-widest">
              {file ? 'File Loaded' : 'No File'}
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {renderDashboard()}
            </motion.div>
          )}

          {currentView === 'directory' && (
            <motion.div key="directory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {renderDirectory()}
            </motion.div>
          )}

          {currentView === 'replace' && (
            <motion.div key="replace" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              {renderReplace()}
            </motion.div>
          )}

          {currentView === 'wip' && (
            <motion.div key="wip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderWIP()}
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderAbout()}
            </motion.div>
          )}

          {currentView === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderContact()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 border-t border-[#141414] bg-[#141414] text-[9px] text-[#E4E3E0]/50 font-mono px-6 flex items-center justify-between uppercase tracking-widest">
        <div className="flex gap-6">
          <span>
            Engine: <BoltBrand text={`bolt-v${displayVersion}`} />
          </span>
          {versionMismatch && (
            <span className="text-amber-400 normal-case tracking-normal" title={`UI was built as ${buildVersion}`}>
              UI/API version mismatch
            </span>
          )}
        </div>
        <div>PDF<BoltBrand text="bolt" /> © 2026</div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital@1&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />
    </div>
  );
}
