import React, { useId } from 'react';
import { isPdfFile, PDF_FILE_ACCEPT } from '../pdfFileUtils';

export interface PdfFilePickerProps {
  file: File | null;
  onFileSelected: (file: File) => void;
  onInvalidFile?: (message: string) => void;
  labelId?: string;
  chooseLabel?: string;
  className?: string;
}

/** Single PDF file control — one click target, works across browsers. */
export function PdfFilePicker({
  file,
  onFileSelected,
  onInvalidFile,
  labelId,
  chooseLabel = 'Choose PDF file',
  className = '',
}: PdfFilePickerProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    if (!isPdfFile(selected)) {
      onInvalidFile?.('Please choose a PDF file (name must end with .pdf).');
      e.target.value = '';
      return;
    }
    onFileSelected(selected);
    e.target.value = '';
  };

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="relative flex w-full max-w-lg cursor-pointer items-center justify-between gap-3 rounded border-2 border-[#141414] bg-white px-4 py-3 shadow-[2px_2px_0px_#141414] transition-colors hover:bg-gray-50"
      >
        <span className="text-xs font-mono text-gray-700 truncate" aria-live="polite">
          {file ? file.name : chooseLabel}
        </span>
        <span className="shrink-0 bg-[#FF3300] px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-white">
          {file ? 'Change' : 'Browse'}
        </span>
        <input
          id={inputId}
          type="file"
          accept={PDF_FILE_ACCEPT}
          onChange={handleChange}
          aria-labelledby={labelId}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
