/** Minimal PDF header bytes for mock uploads. */
export const MINIMAL_PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

export function mockPdfFile(name = 'sample.pdf'): File {
  return new File([MINIMAL_PDF_BYTES], name, { type: 'application/pdf' });
}

export function mockPngFile(name = 'scan.png'): File {
  const png = Uint8Array.from(
    atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
    (c) => c.charCodeAt(0),
  );
  return new File([png], name, { type: 'image/png' });
}

export function emptyServerToolContext(): import('../backendBridge').ServerToolContext {
  return {
    file: null,
    extraFiles: [],
    compareFile2: null,
    signatureBlob: null,
    signatures: [],
    splitRange: '1',
    deletePageStr: '2',
    extractPageStr: '1',
    orderStr: '1, 2',
    toolText: 'Hello',
    toolTitle: 'Title',
    htmlInputMode: 'file',
    ocrLang: 'eng',
    rotationAngle: 90,
    rotationScope: 'All',
    pageNumFormat: 'Page {X}',
    pageNumSize: 10,
    pageNumAlign: 'Center',
    watermarkText: 'CONFIDENTIAL',
    watermarkSize: 24,
    watermarkAngle: 45,
    watermarkOpacity: 0.3,
    watermarkColor: '#ff3300',
    cropLeft: 10,
    cropRight: 10,
    cropTop: 10,
    cropBottom: 10,
    metadataTitle: 'T',
    metadataAuthor: 'A',
    metadataSubject: 'S',
    metadataCreator: 'C',
    protectPass: 'secret',
    unlockPassword: '',
    pdfOpenPassword: '',
    pdfaStandard: 'PDF/A-1b (ISO 19005-1)',
    sigPageNum: 1,
    sigX: 50,
    sigY: 50,
    sigW: 100,
    sigH: 40,
    jpgDpi: '150 DPI',
    formsFlatten: true,
  };
}
