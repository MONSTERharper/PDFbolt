import React, { useId } from 'react';
import { Image, Trash2 } from 'lucide-react';
import {
  IMAGE_FILE_ACCEPT,
  isSupportedImageFile,
  SUPPORTED_IMAGE_FORMATS_LABEL,
} from '../imageFileUtils';

export interface ImageMultiFilePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onInvalidFile?: (message: string) => void;
  labelId?: string;
  chooseLabel?: string;
  listCaption?: string;
  boltToolLabel?: string;
  className?: string;
}

/** Select multiple images in one step (bolt scan / bolt image-to-pdf). */
export function ImageMultiFilePicker({
  files,
  onChange,
  onInvalidFile,
  labelId,
  chooseLabel = 'Choose images',
  listCaption = 'Page order (top to bottom)',
  boltToolLabel = 'bolt',
  className = '',
}: ImageMultiFilePickerProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) {
      return;
    }
    const images = Array.from(selected).filter(isSupportedImageFile);
    if (images.length === 0) {
      onInvalidFile?.(`Only ${SUPPORTED_IMAGE_FORMATS_LABEL} files can be selected.`);
      e.target.value = '';
      return;
    }
    if (images.length < selected.length) {
      onInvalidFile?.(`Some files were skipped — supported formats: ${SUPPORTED_IMAGE_FORMATS_LABEL}.`);
    }
    onChange([...files, ...images]);
    e.target.value = '';
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
            : `${files.length} image${files.length === 1 ? '' : 's'} selected`}
        </span>
        <span className="shrink-0 bg-[#FF3300] px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-white">
          {files.length === 0 ? 'Browse' : 'Add more'}
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={IMAGE_FILE_ACCEPT}
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
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Image size={12} className="shrink-0 text-gray-400" aria-hidden />
                  {i + 1}. {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                  className="inline-flex shrink-0 items-center gap-1 text-red-600 hover:underline"
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 size={12} aria-hidden />
                  Remove
                </button>
              </li>
            ))}
          </ol>
          {files.length < 1 && (
            <p className="text-[9px] font-mono text-amber-700 pt-1">
              Add at least one image to run {boltToolLabel}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
