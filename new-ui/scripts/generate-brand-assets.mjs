/**
 * Generates og-image.png (1200x630) and PWA icons.
 * Run: npm run generate:assets
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const publicDir = path.join(__dirname, '../public');
const ogPng = path.join(repoRoot, 'src/main/resources/static/og-image.png');

const brandSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#E4E3E0"/>
  <rect width="1200" height="12" fill="#FF3300"/>
  <text x="80" y="280" font-family="system-ui,sans-serif" font-size="96" font-weight="900" fill="#141414">PDF</text>
  <text x="340" y="280" font-family="system-ui,sans-serif" font-size="96" font-weight="900" fill="#FF3300">bolt</text>
  <text x="80" y="380" font-family="system-ui,sans-serif" font-size="42" font-weight="600" fill="#44403c">Online PDF tools</text>
  <text x="80" y="450" font-family="system-ui,sans-serif" font-size="28" fill="#57534e">Merge - Convert - Compress - Replace text</text>
</svg>`);

await sharp(brandSvg).resize(1200, 630).png({ compressionLevel: 9 }).toFile(ogPng);

const iconSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#141414"/>
  <rect x="0" y="0" width="512" height="16" fill="#FF3300"/>
  <text x="48" y="300" font-family="system-ui,sans-serif" font-size="120" font-weight="900" fill="#E4E3E0">PDF</text>
  <text x="300" y="300" font-family="system-ui,sans-serif" font-size="120" font-weight="900" fill="#FF3300">bolt</text>
</svg>`);

await sharp(iconSvg)
  .resize(192, 192)
  .png()
  .toFile(path.join(publicDir, 'pwa-192.png'));
await sharp(iconSvg)
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, 'pwa-512.png'));

// Keep static og-image.svg in sync (ASCII-safe for tooling)
const staticSvg = path.join(repoRoot, 'src/main/resources/static/og-image.svg');
try {
  readFileSync(staticSvg);
} catch {
  // optional
}

console.log('Wrote og-image.png and PWA icons');
