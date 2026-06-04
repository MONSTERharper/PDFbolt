import {
  LayoutGrid,
  Replace,
  Combine,
  Scissors,
  Minimize2,
  FileType,
  PenTool,
  Download,
  Camera,
  Hammer,
  Sparkles,
  FileUp,
  Image,
  FileText,
  Presentation,
  FileSpreadsheet,
  Code,
  Shield,
  ShieldCheck,
  Layers,
  RotateCw,
  Hash,
  Crop,
  Unlock,
  Lock,
  Eraser,
  ArrowLeftRight,
  Trash2,
} from 'lucide-react';
import { canonicalToolId } from './toolIdAliases';

export interface SuiteTool {
  id: string;
  name: string;
  cleanName: string;
  description: string;
  status: 'live' | 'wip';
  icon: any;
  highlight?: boolean;
}

export interface SuiteCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: SuiteTool[];
}

export const CATEGORIES: SuiteCategory[] = [
  {
    id: 'organize',
    title: 'Organize PDF',
    description: 'Merge, split, reorder, and remove pages.',
    icon: LayoutGrid,
    tools: [
      { id: 'merge', name: 'bolt merge', cleanName: 'Merge PDF', icon: Combine, description: 'Combine multiple PDFs into one file.', status: 'live' },
      { id: 'split', name: 'bolt split', cleanName: 'Split PDF', icon: Scissors, description: 'Split a PDF into separate files by page or range.', status: 'live' },
      { id: 'remove-pages', name: 'bolt remove', cleanName: 'Remove pages', icon: Trash2, description: 'Delete selected pages from your PDF.', status: 'live' },
      { id: 'extract-pages', name: 'bolt extract', cleanName: 'Extract pages', icon: Download, description: 'Save chosen pages as a new PDF.', status: 'live' },
      { id: 'organize-pdf', name: 'bolt organize', cleanName: 'Organize PDF', icon: LayoutGrid, description: 'Change the order of pages in a PDF.', status: 'live' },
    ],
  },
  {
    id: 'scan',
    title: 'Scan to PDF',
    description: 'Turn photos and scans into PDFs.',
    icon: Camera,
    tools: [
      { id: 'scan-to-pdf', name: 'bolt scan', cleanName: 'Scan to PDF', icon: Camera, description: 'Turn photos or scanned images into a single PDF.', status: 'live' },
    ],
  },
  {
    id: 'optimize',
    title: 'Optimize PDF',
    description: 'Make files smaller and fix common PDF problems.',
    icon: Sparkles,
    tools: [
      { id: 'compress', name: 'bolt compress', cleanName: 'Compress PDF', icon: Minimize2, description: 'Reduce file size while keeping good quality.', status: 'live' },
      { id: 'repair-pdf', name: 'bolt repair', cleanName: 'Repair PDF', icon: Hammer, description: 'Fix PDFs that won\'t open or appear damaged.', status: 'live' },
      { id: 'ocr-pdf', name: 'bolt ocr', cleanName: 'OCR PDF', icon: Sparkles, description: 'Make scanned PDFs searchable.', status: 'wip' },
    ],
  },
  {
    id: 'convert-to',
    title: 'Convert to PDF',
    description: 'Create PDFs from images, Office files, and HTML.',
    icon: FileUp,
    tools: [
      { id: 'images-to-pdf', name: 'bolt image-to-pdf', cleanName: 'Image to PDF', icon: Image, description: 'Turn PNG, JPEG, HEIC, GIF, WebP, BMP, or TIFF images into one PDF.', status: 'live' },
      { id: 'word-to-pdf', name: 'bolt word-to-pdf', cleanName: 'Word to PDF', icon: FileText, description: 'Convert Word (.doc, .docx) to PDF.', status: 'live' },
      { id: 'powerpoint-to-pdf', name: 'bolt powerpoint-to-pdf', cleanName: 'PowerPoint to PDF', icon: Presentation, description: 'Convert PowerPoint (.ppt, .pptx) to PDF.', status: 'live' },
      { id: 'excel-to-pdf', name: 'bolt excel-to-pdf', cleanName: 'Excel to PDF', icon: FileSpreadsheet, description: 'Convert Excel (.xls, .xlsx) to PDF.', status: 'live' },
      { id: 'html-to-pdf', name: 'bolt html-to-pdf', cleanName: 'HTML to PDF', icon: Code, description: 'Convert an HTML file or pasted markup to PDF.', status: 'live' },
    ],
  },
  {
    id: 'convert-from',
    title: 'Convert from PDF',
    description: 'Export PDFs to images, Office formats, CAD (DXF), and PDF/A for archiving.',
    icon: Download,
    tools: [
      { id: 'pdf-to-jpg', name: 'bolt pdf-to-jpg', cleanName: 'PDF to JPG', icon: Image, description: 'Save each page as a JPG image.', status: 'live' },
      { id: 'pdf-to-word', name: 'bolt pdf-to-word', cleanName: 'PDF to Word', icon: FileText, description: 'Export to Word .docx (works best on simple, text-based PDFs).', status: 'live' },
      { id: 'pdf-to-powerpoint', name: 'bolt pdf-to-powerpoint', cleanName: 'PDF to PowerPoint', icon: Presentation, description: 'Export to PowerPoint .pptx.', status: 'live' },
      { id: 'pdf-to-excel', name: 'bolt pdf-to-excel', cleanName: 'PDF to Excel', icon: FileSpreadsheet, description: 'Export to Excel .xlsx.', status: 'live' },
      { id: 'pdf-to-pdfa', name: 'bolt pdf-to-pdfa', cleanName: 'PDF to PDF/A', icon: Shield, description: 'Convert to PDF/A for long-term archiving.', status: 'live' },
      { id: 'pdf-to-dxf', name: 'bolt pdf-to-dxf', cleanName: 'PDF to DXF', icon: Layers, description: 'Export each page as its own AutoCAD DXF file (R2010), delivered in a zip.', status: 'live' },
    ],
  },
  {
    id: 'edit',
    title: 'Edit PDF',
    description: 'Replace text, rotate pages, add numbers, watermarks, and more.',
    icon: FileType,
    tools: [
      { id: 'replace', name: 'bolt replace', cleanName: 'Replace Text', icon: Replace, description: 'Find and replace text in a PDF without retyping the whole document.', status: 'live', highlight: true },
      { id: 'rotate-pdf', name: 'bolt rotate', cleanName: 'Rotate PDF', icon: RotateCw, description: 'Rotate pages 90°, 180°, or 270°.', status: 'live' },
      { id: 'add-page-numbers', name: 'bolt page-numbers', cleanName: 'Add page numbers', icon: Hash, description: 'Add page numbers to the header or footer.', status: 'live' },
      { id: 'add-watermark', name: 'bolt watermark', cleanName: 'Add watermark', icon: FileText, description: 'Add a text watermark across your pages.', status: 'live' },
      { id: 'crop-pdf', name: 'bolt crop', cleanName: 'Crop PDF', icon: Crop, description: 'Trim margins or crop to a smaller area.', status: 'live' },
      { id: 'edit-pdf', name: 'bolt edit', cleanName: 'Edit PDF', icon: FileType, description: 'Update title, author, and other document properties.', status: 'live' },
    ],
  },
  {
    id: 'forms',
    title: 'PDF Forms',
    description: 'Work with fillable PDF forms.',
    icon: PenTool,
    tools: [
      { id: 'pdf-forms', name: 'bolt forms', cleanName: 'PDF Forms', icon: PenTool, description: 'Fill in form fields or flatten them into the page.', status: 'live' },
    ],
  },
  {
    id: 'security',
    title: 'PDF Security',
    description: 'Passwords, signatures, redaction, and comparison.',
    icon: ShieldCheck,
    tools: [
      { id: 'unlock-pdf', name: 'bolt unlock', cleanName: 'Unlock PDF', icon: Unlock, description: 'Remove password protection when you know the password.', status: 'live' },
      { id: 'protect-pdf', name: 'bolt protect', cleanName: 'Protect PDF', icon: Lock, description: 'Add a password to open or change the file.', status: 'live' },
      { id: 'sign-pdf', name: 'bolt sign', cleanName: 'Sign PDF', icon: PenTool, description: 'Place a drawn signature on the page.', status: 'live' },
      { id: 'redact-pdf', name: 'bolt redact', cleanName: 'Redact PDF', icon: Eraser, description: 'Cover sensitive areas with black boxes.', status: 'live' },
      { id: 'compare-pdf', name: 'bolt compare', cleanName: 'Compare PDF', icon: ArrowLeftRight, description: 'See how two PDFs differ in text and layout.', status: 'live' },
    ],
  },
];

export function resolveSuiteTool(id: string): SuiteTool | null {
  const toolId = canonicalToolId(id);
  if (toolId === 'replace') {
    return {
      id: 'replace',
      name: 'bolt replace',
      cleanName: 'Replace Text',
      icon: Replace,
      description: 'Find and replace text in a PDF.',
      status: 'live',
      highlight: true,
    };
  }
  return CATEGORIES.flatMap((category) => category.tools).find((tool) => tool.id === toolId) ?? null;
}
