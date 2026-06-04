import React from 'react';
import { Lock } from 'lucide-react';

export interface EncryptedPdfFileEntry {
  name: string;
  password: string;
  onPasswordChange: (value: string) => void;
}

export interface EncryptedPdfBannerProps {
  fileEntries: EncryptedPdfFileEntry[];
  restrictedFileNames: string[];
  verifying: boolean;
  verified: boolean;
  error: string | null;
}

export function EncryptedPdfBanner({
  fileEntries,
  restrictedFileNames,
  verifying,
  verified,
  error,
}: EncryptedPdfBannerProps) {
  return (
    <div
      className="rounded-lg border border-amber-300 bg-amber-50/90 p-4 space-y-3"
      role="region"
      aria-label="Password-protected PDF"
    >
      <div className="flex items-start gap-2">
        <Lock size={16} className="text-amber-800 mt-0.5 shrink-0" aria-hidden />
        <div className="text-xs text-amber-950 space-y-1">
          <p className="font-bold font-mono uppercase tracking-wide">Encrypted PDF</p>
          {fileEntries.length > 0 && (
            <p>
              {fileEntries.length === 1
                ? `"${fileEntries[0].name}" needs an open password before running bolt tools.`
                : `${fileEntries.length} uploaded PDFs need open passwords.`}
            </p>
          )}
          {restrictedFileNames.length > 0 && (
            <p>
              {restrictedFileNames.length === 1
                ? `"${restrictedFileNames[0]}" uses owner-only restrictions — no password is required to open it.`
                : `${restrictedFileNames.length} PDFs use owner-only restrictions — no open password is needed.`}
            </p>
          )}
        </div>
      </div>
      {fileEntries.map((entry) => (
        <label key={entry.name} className="block space-y-1">
          <span className="text-xs font-mono uppercase text-gray-700 font-bold">
            Password for {entry.name}
          </span>
          <input
            type="password"
            value={entry.password}
            onChange={(e) => entry.onPasswordChange(e.target.value)}
            autoComplete="current-password"
            placeholder="PDF open password"
            className="w-full max-w-md bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/25"
          />
        </label>
      ))}
      {verifying && (
        <p className="text-xs font-mono text-gray-600">Checking password…</p>
      )}
      {verified && !verifying && fileEntries.length > 0 && (
        <p className="text-xs font-mono text-emerald-800">Password(s) accepted for uploaded PDF(s).</p>
      )}
      {error && <p className="text-xs font-mono text-red-800">{error}</p>}
    </div>
  );
}
