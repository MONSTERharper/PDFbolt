/** Common raster formats for image→PDF (server uses Java ImageIO). */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
] as const;

export const IMAGE_FILE_ACCEPT =
  'image/png,image/jpeg,image/gif,image/webp,image/bmp,image/tiff,image/heic,image/heif,.png,.jpg,.jpeg,.gif,.webp,.bmp,.tif,.tiff,.heic,.heif';

export function isSupportedImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (SUPPORTED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return true;
  }
  const mime = (file.type || '').toLowerCase();
  return (
    mime === 'image/png' ||
    mime === 'image/jpeg' ||
    mime === 'image/gif' ||
    mime === 'image/webp' ||
    mime === 'image/bmp' ||
    mime === 'image/tiff' ||
    mime === 'image/heic' ||
    mime === 'image/heif'
  );
}

export const SUPPORTED_IMAGE_FORMATS_LABEL =
  'PNG, JPEG, GIF, WebP, BMP, TIFF, or HEIC (when the server supports it)';
