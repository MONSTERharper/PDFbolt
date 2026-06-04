import type { SiteLimits } from '../useSiteConfig';

export function UploadLimitsNote({ limits, toolId }: { limits: SiteLimits; toolId: string }) {
  const isImage = toolId === 'scan-to-pdf' || toolId === 'images-to-pdf';
  const isMerge = toolId === 'merge';

  return (
    <p className="text-[9px] text-gray-500 font-sans leading-relaxed border-t border-gray-200 pt-2 mt-2">
      <strong className="text-gray-600">Limits:</strong> up to {limits.maxFileSizeLabel} per file,{' '}
      {limits.maxTotalUploadLabel} total per request, max {limits.maxFiles} files
      {isMerge ? ' for merge' : ''}.{' '}
      {!isImage && <>PDFs over {limits.maxPages} pages are not supported. </>}
      Files are processed on our server and not kept after your download.
    </p>
  );
}
