export type EncryptionKind = 'none' | 'user_password' | 'restricted';

export function buildPdfPasswordsJson(
  files: File[],
  passwordsByFile: Record<string, string>,
): string | undefined {
  const entries: { name: string; password: string }[] = [];
  for (const file of files) {
    const password = passwordsByFile[file.name]?.trim();
    if (password) {
      entries.push({ name: file.name, password });
    }
  }
  return entries.length > 0 ? JSON.stringify(entries) : undefined;
}

export function passwordForFile(
  file: File | null | undefined,
  passwordsByFile: Record<string, string>,
): string | undefined {
  if (!file) {
    return undefined;
  }
  const password = passwordsByFile[file.name]?.trim();
  return password || undefined;
}

export function appendPdfPasswords(
  form: FormData,
  files: File[],
  passwordsByFile: Record<string, string>,
  fallbackPassword?: string,
): void {
  const json = buildPdfPasswordsJson(files, passwordsByFile);
  if (json) {
    form.append('pdfPasswordsJson', json);
    return;
  }
  if (fallbackPassword?.trim()) {
    form.append('pdfPassword', fallbackPassword.trim());
  }
}
