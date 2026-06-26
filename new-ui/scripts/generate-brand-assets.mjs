/**
 * Generates og-image.png (1200x630), one OG image per tool, and PWA icons.
 * Run: npm run generate:assets
 */
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const publicDir = path.join(__dirname, '../public');
const ogPng = path.join(repoRoot, 'src/main/resources/static/og-image.png');
const ogToolsDir = path.join(repoRoot, 'src/main/resources/static/og');

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

// --- Per-tool OG images ---------------------------------------------------
// Extract each tool's id / cleanName / description from the suite catalog so
// the images stay in sync with the app without duplicating the list here.
const catalogSrc = readFileSync(path.join(__dirname, '../src/suiteCatalog.ts'), 'utf-8');
const toolRegex =
  /\{\s*id:\s*'((?:[^'\\]|\\.)*)',\s*name:\s*'(?:(?:[^'\\]|\\.)*)',\s*cleanName:\s*'((?:[^'\\]|\\.)*)',\s*icon:\s*\w+,\s*description:\s*'((?:[^'\\]|\\.)*)'/g;

const unescapeJs = (s) => s.replace(/\\(['"\\])/g, '$1');
const escapeXml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrap = (text, maxChars) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const seen = new Set();
const tools = [];
let match;
while ((match = toolRegex.exec(catalogSrc)) !== null) {
  const id = unescapeJs(match[1]);
  if (seen.has(id)) continue;
  seen.add(id);
  tools.push({ id, cleanName: unescapeJs(match[2]), description: unescapeJs(match[3]) });
}

mkdirSync(ogToolsDir, { recursive: true });

for (const tool of tools) {
  const titleLines = wrap(tool.cleanName, 18).slice(0, 2);
  const descLines = wrap(tool.description, 52).slice(0, 3);
  const titleY = 250;
  const titleTspans = titleLines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 92}">${escapeXml(l)}</tspan>`)
    .join('');
  const descStartY = titleY + titleLines.length * 92 + 28;
  const descTspans = descLines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 46}">${escapeXml(l)}</tspan>`)
    .join('');

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#E4E3E0"/>
  <rect width="1200" height="12" fill="#FF3300"/>
  <text x="80" y="120" font-family="system-ui,sans-serif" font-size="40" font-weight="900" fill="#141414">PDF<tspan fill="#FF3300">bolt</tspan></text>
  <text y="${titleY}" font-family="system-ui,sans-serif" font-size="84" font-weight="900" fill="#141414">${titleTspans}</text>
  <text y="${descStartY}" font-family="system-ui,sans-serif" font-size="34" font-weight="500" fill="#57534e">${descTspans}</text>
  <text x="80" y="588" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="#FF3300">Free online PDF tool<tspan fill="#78716c" font-weight="500">  ·  mypdfbolt.shop</tspan></text>
</svg>`);

  await sharp(svg).resize(1200, 630).png({ compressionLevel: 9 }).toFile(path.join(ogToolsDir, `${tool.id}.png`));
}

console.log(`Wrote og-image.png, ${tools.length} per-tool OG images, and PWA icons`);
