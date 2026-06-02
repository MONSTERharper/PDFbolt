import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { inspectPdfs, type PdfInspectResult } from './pdfInspectApi';
import { buildPdfPasswordsJson } from './pdfPasswordUtils';
import { getToolUploadKind } from './toolUploadConfig';

const PDF_KINDS = new Set(['single-pdf', 'dual-pdf']);

export function collectPdfFilesForTool(
  toolId: string,
  file: File | null,
  extraFiles: File[],
  compareFile2: File | null,
): File[] {
  if ((toolId === 'replace' || toolId === 'compress') && file) {
    return [file];
  }
  const kind = getToolUploadKind(toolId);
  if (!PDF_KINDS.has(kind)) {
    return [];
  }
  if (kind === 'dual-pdf') {
    const list: File[] = [];
    if (file) list.push(file);
    if (compareFile2) list.push(compareFile2);
    return list;
  }
  if (toolId === 'merge') {
    const list = file ? [file, ...extraFiles] : [...extraFiles];
    return list;
  }
  return file ? [file] : [];
}

export function usePdfEncryptionGate(
  toolId: string,
  file: File | null,
  extraFiles: File[],
  compareFile2: File | null,
) {
  const [passwordsByFile, setPasswordsByFile] = useState<Record<string, string>>({});
  const [inspect, setInspect] = useState<PdfInspectResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pdfFiles = useMemo(
    () => collectPdfFilesForTool(toolId, file, extraFiles, compareFile2),
    [toolId, file, extraFiles, compareFile2],
  );

  const pdfFilesKey = useMemo(
    () => pdfFiles.map((f) => `${f.name}:${f.size}:${f.lastModified}`).join('|'),
    [pdfFiles],
  );

  useEffect(() => {
    setPasswordsByFile({});
    setInspect(null);
    setVerifyError(null);
  }, [pdfFilesKey, toolId]);

  const setPasswordForFile = useCallback((fileName: string, value: string) => {
    setPasswordsByFile((prev) => ({ ...prev, [fileName]: value }));
  }, []);

  const pdfPasswordsJson = useMemo(
    () => buildPdfPasswordsJson(pdfFiles, passwordsByFile),
    [pdfFiles, passwordsByFile],
  );

  const runInspect = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setInspect(null);
      setVerifyError(null);
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await inspectPdfs(pdfFiles, passwordsByFile);
      setInspect(result);
      const needsPassword = result.files.filter((f) => f.passwordRequired);
      if (
        result.anyPasswordRequired &&
        needsPassword.some((f) => passwordsByFile[f.name]?.trim()) &&
        !result.allPasswordsAccepted
      ) {
        setVerifyError('One or more PDF passwords are incorrect.');
      }
    } catch (err) {
      setInspect(null);
      setVerifyError(err instanceof Error ? err.message : 'Could not inspect PDF.');
    } finally {
      setVerifying(false);
    }
  }, [pdfFiles, passwordsByFile]);

  const passwordsKey = useMemo(
    () => pdfFiles.map((f) => `${f.name}:${passwordsByFile[f.name] ?? ''}`).join('|'),
    [pdfFiles, passwordsByFile],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (pdfFiles.length === 0) {
      setInspect(null);
      setVerifyError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runInspect();
    }, 350);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pdfFilesKey, passwordsKey, runInspect, pdfFiles.length]);

  const filesNeedingPassword = inspect?.files.filter((f) => f.passwordRequired) ?? [];
  const restrictedNames =
    inspect?.files.filter((f) => f.encryptionKind === 'restricted').map((f) => f.name) ?? [];
  const allPasswordsEntered = filesNeedingPassword.every((f) =>
    Boolean(passwordsByFile[f.name]?.trim()),
  );

  const passwordBlocked =
    Boolean(inspect?.anyPasswordRequired) &&
    (verifying || !allPasswordsEntered || !inspect.allPasswordsAccepted);

  const encryptedNames = filesNeedingPassword.map((f) => f.name);

  const showPasswordBanner = Boolean(
    inspect?.files.some((f) => f.passwordRequired || f.encryptionKind === 'restricted'),
  );

  const passwordAccepted = Boolean(
    inspect?.anyPasswordRequired &&
      inspect.allPasswordsAccepted &&
      allPasswordsEntered &&
      filesNeedingPassword.length > 0,
  );

  const pdfOpenPassword = filesNeedingPassword.length === 1
    ? passwordsByFile[filesNeedingPassword[0].name] ?? ''
    : '';

  const setPdfOpenPassword = useCallback(
    (value: string) => {
      if (filesNeedingPassword.length === 1) {
        setPasswordForFile(filesNeedingPassword[0].name, value);
      }
    },
    [filesNeedingPassword, setPasswordForFile],
  );

  return {
    passwordsByFile,
    setPasswordForFile,
    pdfPasswordsJson,
    pdfOpenPassword,
    setPdfOpenPassword,
    inspect,
    verifying,
    verifyError,
    passwordBlocked,
    encryptedNames,
    restrictedNames,
    filesNeedingPassword,
    showPasswordBanner,
    passwordAccepted,
  };
}
