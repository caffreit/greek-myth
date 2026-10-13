// Exports both Transit Theogony posters: a standalone SVG, a vector A2 PDF, and a
// 300 dpi A2 PNG. Left to right is landscape; square rings are portrait. The page
// is 1:√2, so the PDF and SVG scale to any A size.
//
//   node tools/export_underground_posters.mjs
//   node tools/export_underground_posters.mjs transit_theogony_ltr
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = process.env.CHROME || 'google-chrome';
const OUT_DIR = 'topology/print';
const PRINT_DPI = 300;
const posters = [
  { source: 'topology/underground_ltr.html', name: 'transit_theogony_ltr' },
  { source: 'topology/underground_ring.html', name: 'transit_theogony_ring' },
];

const profile = await mkdtemp(join(tmpdir(), 'underground-export-'));
const chrome = (...args) => execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, ...args], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString();

await mkdir(OUT_DIR, { recursive: true });
try {
  const only = process.argv.slice(2);
  for (const { source, name } of posters.filter(({ name }) => !only.length || only.includes(name))) {
    let svg;
    for (let attempt = 0; attempt < 5 && !svg; attempt++) {
      const dom = chrome('--virtual-time-budget=10000', '--dump-dom', pathToFileURL(resolve(source)).href);
      svg = dom.match(/<script id="svgExportBuffer" type="application\/xml">([\s\S]*?)<\/script>/)?.[1].trim();
    }
    if (!svg) throw new Error(`No exported SVG in ${source}`);
    const width = Number(svg.match(/<svg[^>]*\swidth="([\d.]+)"/)[1]);
    const height = Number(svg.match(/<svg[^>]*\sheight="([\d.]+)"/)[1]);
    const portrait = Math.abs(height / width - Math.SQRT2) <= 1e-3;
    const landscape = Math.abs(width / height - Math.SQRT2) <= 1e-3;
    if (!portrait && !landscape) throw new Error(`${source} is not A-series: ${width}×${height}`);
    const pageMm = portrait ? { w: 420, h: 594 } : { w: 594, h: 420 };
    const svgPath = join(OUT_DIR, `${name}.svg`);
    await writeFile(svgPath, svg + '\n');

    const inline = svg.replace(/^<\?xml[^>]*>\s*/, '');
    const page = (size) => {
      const [w, h] = size.split(' ');
      return `<!doctype html><meta charset="utf-8"><style>@page{size:${size};margin:0}html,body{margin:0;width:${w};height:${h};overflow:hidden}body>svg{display:block;width:${w};height:${h}}</style>${inline}`;
    };
    const pdfPage = join(profile, 'pdf.html');
    await writeFile(pdfPage, page(`${pageMm.w}mm ${pageMm.h}mm`));
    chrome('--no-pdf-header-footer', '--virtual-time-budget=5000', `--print-to-pdf=${resolve(OUT_DIR, `${name}_A2.pdf`)}`, pathToFileURL(pdfPage).href);

    const pxW = Math.round(pageMm.w / 25.4 * PRINT_DPI);
    const scale = pxW / width;
    const pngPage = join(profile, 'png.html');
    await writeFile(pngPage, page(`${width}px ${Math.round(height)}px`));
    chrome(`--window-size=${Math.ceil(width)},${Math.ceil(height)}`, `--force-device-scale-factor=${scale}`, '--virtual-time-budget=5000', `--screenshot=${resolve(OUT_DIR, `${name}_A2_${PRINT_DPI}dpi.png`)}`, pathToFileURL(pngPage).href);
    console.log(`Exported ${name}: SVG, A2 PDF, A2 ${PRINT_DPI} dpi PNG (${portrait ? 'portrait' : 'landscape'})`);
  }
} finally {
  await rm(profile, { recursive: true, force: true });
}
