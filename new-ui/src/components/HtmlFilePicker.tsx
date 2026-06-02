import React, { useId } from 'react';
import { HTML_FILE_ACCEPT, isHtmlFile } from '../htmlFileUtils';

export interface HtmlFilePickerProps {
  file: File | null;
  onFileSelected: (file: File) => void;
  onInvalidFile?: (message: string) => void;
  className?: string;
}

export function HtmlFilePicker({
  file,
  onFileSelected,
  onInvalidFile,
  className = '',
}: HtmlFilePickerProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    if (!isHtmlFile(selected)) {
      onInvalidFile?.('Choose an .html or .htm file.');
      e.target.value = '';
      return;
    }
    onFileSelected(selected);
    e.target.value = '';
  };

  return (
    <label
      htmlFor={inputId}
      className={`relative flex w-full max-w-lg cursor-pointer items-center justify-between gap-3 rounded border-2 border-[#141414] bg-white px-4 py-3 shadow-[2px_2px_0px_#141414] transition-colors hover:bg-gray-50 ${className}`}
    >
      <span className="text-xs font-mono text-gray-700 truncate" aria-live="polite">
        {file ? file.name : 'Choose HTML file (.html, .htm)'}
      </span>
      <span className="shrink-0 bg-[#FF3300] px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-white">
        {file ? 'Change' : 'Browse'}
      </span>
      <input
        id={inputId}
        type="file"
        accept={HTML_FILE_ACCEPT}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
