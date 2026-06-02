const HTML_EXT = ['.html', '.htm'];

export const HTML_FILE_ACCEPT =
  '.html,.htm,text/html,application/xhtml+xml';

export function isHtmlFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return HTML_EXT.some((ext) => name.endsWith(ext));
}
