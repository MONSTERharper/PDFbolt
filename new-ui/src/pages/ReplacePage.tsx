import React from 'react';
import { Replace, Trash2, Plus, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerAd } from '../components/AdPlacement';
import { PdfFilePicker } from '../components/PdfFilePicker';
import { EncryptedPdfBanner } from '../components/EncryptedPdfBanner';
import { BoltBrand } from '../components/BoltBrand';
import { UploadLimitsNote } from '../components/UploadLimitsNote';
import { boltToolName, boltUploadHeading } from '../toolLabels';
import { boundedIntFromInput } from '../parseNumber';
import type { ReplacePairWithStrict as ReplacePair } from '../backendBridge';
import type { usePdfEncryptionGate } from '../usePdfEncryptionGate';
import type { SiteLimits } from '../useSiteConfig';

export function ReplacePage({
  onBack,
  onContact,
  file,
  pairs,
  setPairs,
  pdfGate,
  encryptedPdfEntries,
  onPrimaryPdfSelected,
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
  onRunReplacement,
  siteLimits,
}: {
  onBack: () => void;
  onContact: () => void;
  file: File | null;
  pairs: ReplacePair[];
  setPairs: (pairs: ReplacePair[]) => void;
  pdfGate: ReturnType<typeof usePdfEncryptionGate>;
  encryptedPdfEntries: {
    name: string;
    password: string;
    onPasswordChange: (value: string) => void;
  }[];
  onPrimaryPdfSelected: (file: File) => void;
  onPrimaryPdfInvalid: (msg: string) => void;
  fileUploadFeedback: { msg: string; type: 'ok' | 'error' } | null;
  matchMode: string;
  setMatchMode: (value: string) => void;
  replaceScope: string;
  setReplaceScope: (value: string) => void;
  occurrenceIndex: number;
  setOccurrenceIndex: (value: number) => void;
  preserveStyle: boolean;
  setPreserveStyle: (value: boolean) => void;
  retainMetadata: boolean;
  setRetainMetadata: (value: boolean) => void;
  replaceStatus: { msg: string; type: 'info' | 'ok' | 'error' } | null;
  isProcessing: boolean;
  onRunReplacement: () => void;
  siteLimits: SiteLimits;
}) {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] pb-1 transition-all hover:text-[#FF3300] hover:border-[#FF3300]"
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
            <span className="text-xs font-mono tracking-widest bg-[#FF3300] text-white px-1.5 py-0.5 font-bold rounded">
              LIVE
            </span>
            <h2 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-1">
              <BoltBrand text="bolt replace" showInfo />
            </h2>
            <p className="text-sm text-gray-500 font-sans">
              Find and replace text in your PDF, then download the updated file.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#E4E3E0]/50 px-3 py-1.5 rounded border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-[#FF3300] animate-pulse" />
          <span className="font-mono text-xs text-gray-600 font-bold uppercase tracking-wider">PDFbolt API</span>
        </div>
      </div>

      {/* Dynamic wide stretching Banner Ad */}
      <BannerAd onInquire={onContact} />

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
            <span id="pdf-file-label" className="text-xs font-mono uppercase tracking-widest text-gray-600 font-bold block">
              {boltUploadHeading('replace')}
            </span>
            <PdfFilePicker
              file={file}
              onFileSelected={onPrimaryPdfSelected}
              onInvalidFile={onPrimaryPdfInvalid}
              labelId="pdf-file-label"
              chooseLabel={`Choose PDF for ${boltToolName('replace')}`}
            />
            <UploadLimitsNote limits={siteLimits} toolId="replace" />
            {fileUploadFeedback && (
              <p
                className={`text-xs font-mono ${fileUploadFeedback.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}
                role="status"
              >
                {fileUploadFeedback.msg}
              </p>
            )}
          </div>

          {/* Rules Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-mono uppercase text-gray-600 font-bold px-2">
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
                      onChange={(e) => {
                        const n = [...pairs];
                        n[idx].find = e.target.value;
                        setPairs(n);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRunReplacement();
                      }}
                      className="w-full bg-white border border-[#141414] p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#FF3300]/30"
                      placeholder="Search pattern..."
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={pair.replace}
                      aria-label={`Replacement text for rule ${idx + 1}`}
                      onChange={(e) => {
                        const n = [...pairs];
                        n[idx].replace = e.target.value;
                        setPairs(n);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRunReplacement();
                        }
                        if (e.key === 'Tab' && !e.shiftKey && idx === pairs.length - 1) {
                          e.preventDefault();
                          setPairs([...pairs, { find: '', replace: '', strict: false }]);
                        }
                      }}
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
              className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#FF3300] hover:opacity-70 transition-opacity p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]"
            >
              <Plus size={14} /> Add find/replace rule
            </button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#141414]/10 pt-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label id="match-mode-lbl" className="text-xs font-mono uppercase text-gray-500 font-bold block">
                  Match mode
                </label>
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
                <label id="replace-scope-lbl" className="text-xs font-mono uppercase text-gray-500 font-bold block">
                  Replace scope
                </label>
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
                <p className="text-sm text-gray-500 font-mono italic">Which occurrence (1 = first)</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const n = [...pairs];
                    n.forEach((p) => (p.strict = !p.strict));
                    setPairs([...n]);
                  }}
                  aria-label="Toggle strict same-length replacement mode"
                  aria-pressed={pairs.every((p) => p.strict)}
                  className={`w-5 h-5 border border-[#141414] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] ${pairs.every((p) => p.strict) ? 'bg-[#FF3300] text-white border-[#FF3300]' : 'bg-white'}`}
                >
                  {pairs.every((p) => p.strict) && <CheckCircle2 size={12} />}
                </button>
                <span className="text-xs font-bold uppercase tracking-tighter">Same-length replacement only</span>
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
            onClick={onRunReplacement}
            aria-label={isProcessing ? 'Processing PDF. Please wait.' : 'Replace text and download PDF'}
            className={`w-full py-8 font-black text-2xl uppercase tracking-tighter transition-all shadow-[8px_8px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 ${!file || isProcessing || pdfGate.passwordBlocked || !pairs.some((p) => p.find.trim()) ? 'bg-[#DCDAD5] text-neutral-600 cursor-not-allowed border-2 border-[#141414]/40 shadow-none translate-none' : 'bg-[#FF3300] text-white hover:bg-[#141414] hover:shadow-[8px_8px_0px_#FF3300]'}`}
          >
            {isProcessing ? 'Processing…' : 'Replace and Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
