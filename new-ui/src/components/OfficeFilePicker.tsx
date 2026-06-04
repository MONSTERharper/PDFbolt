import React, { useId } from 'react';
import { isOfficeFileForTool, OFFICE_ACCEPT } from '../officeFileUtils';

export interface OfficeFilePickerProps {
  toolId: string;
  file: File | null;
  onFileSelected: (file: File) => void;
  onInvalidFile?: (message: string) => void;
  chooseLabel?: string;
  className?: string;
}

export function OfficeFilePicker({
  toolId,
  file,
  onFileSelected,
  onInvalidFile,
  chooseLabel,
  className = '',
}: OfficeFilePickerProps) {
  const inputId = useId();
  const accept = OFFICE_ACCEPT[toolId] ?? '';
  const label = chooseLabel ?? 'Choose Office file';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    if (!isOfficeFileForTool(selected, toolId)) {
      onInvalidFile?.('File type does not match this bolt tool.');
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
          {file ? file.name : label}
        </span>
        <span className="shrink-0 bg-[#FF3300] px-3 py-1.5 text-xs font-mono font-bold uppercase text-white">
          {file ? 'Change' : 'Browse'}
        </span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
