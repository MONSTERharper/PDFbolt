const WORD_EXT = ['.doc', '.docx'];
const PPT_EXT = ['.ppt', '.pptx'];
const XLS_EXT = ['.xls', '.xlsx'];

export const OFFICE_ACCEPT: Record<string, string> = {
  'word-to-pdf':
    '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'powerpoint-to-pdf':
    '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'excel-to-pdf':
    '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export function isOfficeFileForTool(file: File, toolId: string): boolean {
  const name = file.name.toLowerCase();
  const extensions = officeExtensionsForTool(toolId);
  return extensions.some((ext) => name.endsWith(ext));
}

export function officeExtensionsForTool(toolId: string): string[] {
  switch (toolId) {
    case 'word-to-pdf':
      return WORD_EXT;
    case 'powerpoint-to-pdf':
      return PPT_EXT;
    case 'excel-to-pdf':
      return XLS_EXT;
    default:
      return [];
  }
}

export function officeChooseLabel(toolId: string): string {
  switch (toolId) {
    case 'word-to-pdf':
      return 'Choose Word document (.doc, .docx)';
    case 'powerpoint-to-pdf':
      return 'Choose PowerPoint (.ppt, .pptx)';
    case 'excel-to-pdf':
      return 'Choose Excel workbook (.xls, .xlsx)';
    default:
      return 'Choose Office file';
  }
}
