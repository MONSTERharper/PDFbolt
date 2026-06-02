import React, { useId } from 'react';
import { Trash2 } from 'lucide-react';
import { isPdfFile, PDF_FILE_ACCEPT } from '../pdfFileUtils';

export interface PdfMultiFilePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onInvalidFile?: (message: string) => void;
  labelId?: string;
  chooseLabel?: string;
  minFiles?: number;
  listCaption?: string;
  boltToolLabel?: string;
  className?: string;
}

/** Select multiple PDFs in one step (e.g. bolt merge). */
export function PdfMultiFilePicker({
  files,
  onChange,
  onInvalidFile,
  labelId,
  chooseLabel = 'Choose PDF files',
  minFiles = 2,
  listCaption = 'Merge order (top to bottom)',
  boltToolLabel = 'bolt merge',
  className = '',
}: PdfMultiFilePickerProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) {
      return;
    }
    const pdfs = Array.from(selected).filter(isPdfFile);
    if (pdfs.length === 0) {
      onInvalidFile?.('Only PDF files can be selected.');
      e.target.value = '';
      return;
    }
    if (pdfs.length < selected.length) {
      onInvalidFile?.('Some files were skipped — only PDFs are allowed.');
    }
    onChange([...files, ...pdfs]);
    e.target.value = '';
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="relative flex w-full max-w-lg cursor-pointer items-center justify-between gap-3 rounded border-2 border-[#141414] bg-white px-4 py-3 shadow-[2px_2px_0px_#141414] transition-colors hover:bg-gray-50"
      >
        <span className="text-xs font-mono text-gray-700" aria-live="polite">
          {files.length === 0
            ? chooseLabel
            : `${files.length} PDF${files.length === 1 ? '' : 's'} selected`}
        </span>
        <span className="shrink-0 bg-[#FF3300] px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-white">
          {files.length === 0 ? 'Browse' : 'Add more'}
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={PDF_FILE_ACCEPT}
          onChange={handleChange}
          aria-labelledby={labelId}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      {files.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded border border-gray-200 bg-white p-3">
          <p className="text-[9px] font-mono uppercase text-gray-500">{listCaption}</p>
          <ol className="space-y-1">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center justify-between gap-2 text-[10px] font-mono text-gray-700"
              >
                <span>
                  {i + 1}. {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex items-center gap-1 text-red-600 hover:underline"
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 size={12} aria-hidden />
                  Remove
                </button>
              </li>
            ))}
          </ol>
          {files.length < minFiles && (
            <p className="text-[9px] font-mono text-amber-700 pt-1">
              Add at least {minFiles} PDFs to run {boltToolLabel}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
