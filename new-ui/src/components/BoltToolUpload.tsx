import React from 'react';
import { PdfFilePicker } from './PdfFilePicker';
import { PdfMultiFilePicker } from './PdfMultiFilePicker';
import { ImageMultiFilePicker } from './ImageMultiFilePicker';
import { OfficeFilePicker } from './OfficeFilePicker';
import { officeChooseLabel } from '../officeFileUtils';
import { boltToolName, boltUploadHeading, boltUploadHint } from '../toolLabels';
import { HtmlFilePicker } from './HtmlFilePicker';
import { getToolUploadKind, type HtmlInputMode } from '../toolUploadConfig';
import { isPdfFile } from '../pdfFileUtils';

export interface BoltToolUploadProps {
  toolId: string;
  file: File | null;
  extraFiles: File[];
  compareFile2: File | null;
  toolText: string;
  toolTitle: string;
  htmlInputMode?: HtmlInputMode;
  onHtmlInputModeChange?: (mode: HtmlInputMode) => void;
  onPrimaryPdf: (file: File) => void;
  onPrimaryPdfInvalid: (message: string) => void;
  onMergeFiles: (files: File[]) => void;
  onImageFiles: (files: File[]) => void;
  onCompareSecond: (file: File) => void;
  onCompareSecondInvalid: (message: string) => void;
  onToolText: (text: string) => void;
  onToolTitle: (title: string) => void;
  feedback: { msg: string; type: 'ok' | 'error' } | null;
}

function UploadShell({
  toolId,
  children,
  feedback,
}: {
  toolId: string;
  children: React.ReactNode;
  feedback: BoltToolUploadProps['feedback'];
}) {
  return (
    <div className="lg:col-span-12 bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 space-y-3 relative z-20">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-700 font-bold block">
          {boltUploadHeading(toolId)}
        </span>
        <span className="text-[8px] font-mono text-gray-500">{boltUploadHint(toolId)}</span>
      </div>
      {children}
      {feedback && (
        <p
          role="status"
          className={`text-[10px] font-mono ${feedback.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}

export function BoltToolUpload({
  toolId,
  file,
  extraFiles,
  compareFile2,
  toolText,
  toolTitle,
  onPrimaryPdf,
  onPrimaryPdfInvalid,
  onMergeFiles,
  onImageFiles,
  onCompareSecond,
  onCompareSecondInvalid,
  onToolText,
  onToolTitle,
  htmlInputMode = 'file',
  onHtmlInputModeChange,
  feedback,
}: BoltToolUploadProps) {
  const kind = getToolUploadKind(toolId);
  const boltName = boltToolName(toolId);

  if (kind === 'multi-pdf') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <PdfMultiFilePicker
          files={extraFiles}
          onChange={onMergeFiles}
          onInvalidFile={onPrimaryPdfInvalid}
          chooseLabel="Choose PDFs to merge"
          minFiles={2}
          listCaption="Merge order (first → last)"
          boltToolLabel={boltName}
        />
      </UploadShell>
    );
  }

  if (kind === 'dual-pdf') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[9px] font-mono uppercase text-gray-600 font-bold block">
              PDF A
            </span>
            <PdfFilePicker
              file={file}
              onFileSelected={onPrimaryPdf}
              onInvalidFile={onPrimaryPdfInvalid}
              chooseLabel="Choose first PDF"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-mono uppercase text-gray-600 font-bold block">
              PDF B
            </span>
            <PdfFilePicker
              file={compareFile2}
              onFileSelected={(f) => {
                if (!isPdfFile(f)) {
                  onCompareSecondInvalid('Comparison file must be a PDF.');
                  return;
                }
                onCompareSecond(f);
              }}
              onInvalidFile={onCompareSecondInvalid}
              chooseLabel="Choose second PDF"
            />
          </div>
        </div>
      </UploadShell>
    );
  }

  if (kind === 'multi-image') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <ImageMultiFilePicker
          files={extraFiles}
          onChange={onImageFiles}
          onInvalidFile={onPrimaryPdfInvalid}
          chooseLabel="Choose PNG or JPG images"
          listCaption="Page order in output PDF"
          boltToolLabel={boltName}
        />
      </UploadShell>
    );
  }

  if (kind === 'office-file') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <OfficeFilePicker
          toolId={toolId}
          file={file}
          onFileSelected={onPrimaryPdf}
          onInvalidFile={onPrimaryPdfInvalid}
          chooseLabel={officeChooseLabel(toolId)}
        />
        <p className="text-[9px] font-mono text-gray-500 leading-relaxed">
          Converted with LibreOffice on the server. Complex macros, embedded fonts, or password-protected
          files may fail.
        </p>
      </UploadShell>
    );
  }

  if (kind === 'html-content') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <p className="text-[9px] font-mono text-gray-500 leading-relaxed max-w-2xl">
          Converted with LibreOffice on the server. Complex CSS, web fonts, and JavaScript may not render
          exactly like a browser.
        </p>

        <div className="flex flex-wrap gap-2 max-w-2xl">
          <button
            type="button"
            onClick={() => onHtmlInputModeChange?.('file')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase border-2 border-[#141414] ${
              htmlInputMode === 'file'
                ? 'bg-[#141414] text-white'
                : 'bg-white text-[#141414] hover:bg-gray-50'
            }`}
          >
            Upload .html file
          </button>
          <button
            type="button"
            onClick={() => onHtmlInputModeChange?.('paste')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase border-2 border-[#141414] ${
              htmlInputMode === 'paste'
                ? 'bg-[#141414] text-white'
                : 'bg-white text-[#141414] hover:bg-gray-50'
            }`}
          >
            Paste HTML
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label
              htmlFor="bolt-content-title"
              className="text-[10px] font-mono uppercase text-gray-600 font-bold block"
            >
              Document title
            </label>
            <input
              id="bolt-content-title"
              type="text"
              value={toolTitle}
              onChange={(e) => onToolTitle(e.target.value)}
              className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
            />
            <p className="text-[9px] font-mono text-gray-500">
              Used when pasting a fragment (wraps content in a full HTML page). Optional for full .html files.
            </p>
          </div>

          {htmlInputMode === 'file' ? (
            <HtmlFilePicker
              file={file}
              onFileSelected={onPrimaryPdf}
              onInvalidFile={onPrimaryPdfInvalid}
            />
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="bolt-content-body"
                className="text-[10px] font-mono uppercase text-gray-600 font-bold block"
              >
                HTML content
              </label>
              <textarea
                id="bolt-content-body"
                rows={10}
                value={toolText}
                onChange={(e) => onToolText(e.target.value)}
                className="w-full bg-white border border-[#141414] p-3 font-mono text-xs resize-none"
                placeholder={'<h1>Title</h1>\n<p>Your content…</p>'}
              />
            </div>
          )}
        </div>
      </UploadShell>
    );
  }

  if (kind === 'text-content') {
    return (
      <UploadShell toolId={toolId} feedback={feedback}>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label
              htmlFor="bolt-content-title"
              className="text-[10px] font-mono uppercase text-gray-600 font-bold block"
            >
              Document title
            </label>
            <input
              id="bolt-content-title"
              type="text"
              value={toolTitle}
              onChange={(e) => onToolTitle(e.target.value)}
              className="w-full bg-white border border-[#141414] p-3 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="bolt-content-body"
              className="text-[10px] font-mono uppercase text-gray-600 font-bold block"
            >
              Document text
            </label>
            <textarea
              id="bolt-content-body"
              rows={8}
              value={toolText}
              onChange={(e) => onToolText(e.target.value)}
              className="w-full bg-white border border-[#141414] p-3 font-mono text-xs resize-none"
              placeholder="Paste or type content here…"
            />
          </div>
        </div>
      </UploadShell>
    );
  }

  return (
    <UploadShell toolId={toolId} feedback={feedback}>
      <PdfFilePicker
        file={file}
        onFileSelected={onPrimaryPdf}
        onInvalidFile={onPrimaryPdfInvalid}
        chooseLabel={`Choose PDF for ${boltName}`}
      />
    </UploadShell>
  );
}
