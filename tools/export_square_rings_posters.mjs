// Exports both square-ring posters for print: a standalone SVG, a vector PDF
// sized to A2, and a 300 dpi A2 PNG. The poster is drawn at 1:√2, so the PDF
// and SVG scale cleanly to any A size.
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = process.env.CHROME || 'google-chrome';
const OUT_DIR = 'poster/print';
const A2_MM = { w: 420, h: 594 };
const PRINT_DPI = 300;
const posters = [
  { source: 'poster/layout_editor_square_rings.html', name: 'greek_theogony_translucent' },
  { source: 'poster/layout_editor_square_rings_group_fill.html', name: 'greek_theogony_outlines' },
];

const profile = await mkdtemp(join(tmpdir(), 'poster-export-'));
const chrome = (...args) => execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, ...args], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString();

await mkdir(OUT_DIR, { recursive: true });
try {
  for (const { source, name } of posters) {
    // The page fills its export buffer on an animation frame, which headless
    // Chrome occasionally skips before dumping the DOM.
    let svg;
    for (let attempt = 0; attempt < 5 && !svg; attempt++) {
      const dom = chrome('--virtual-time-budget=10000', '--dump-dom', pathToFileURL(resolve(source)).href);
      svg = dom.match(/<script id="svgExportBuffer" type="application\/xml">([\s\S]*?)<\/script>/)?.[1].trim();
    }
    if (!svg) throw new Error(`No exported SVG in ${source}`);
    const width = Number(svg.match(/<svg[^>]*\swidth="([\d.]+)"/)[1]);
    const height = Number(svg.match(/<svg[^>]*\sheight="([\d.]+)"/)[1]);
    if (Math.abs(height / width - Math.SQRT2) > 1e-3) throw new Error(`${source} is not A-series: ${width}×${height}`);
    const svgPath = join(OUT_DIR, `${name}.svg`);
    await writeFile(svgPath, svg + '\n');

    // Inline rather than <img>, so Chrome prints vectors and real text.
    const inline = svg.replace(/^<\?xml[^>]*>\s*/, '');
    const page = (size) => {
      const [w, h] = size.split(' ');
      return `<!doctype html><meta charset="utf-8"><style>@page{size:${size};margin:0}html,body{margin:0;width:${w};height:${h};overflow:hidden}body>svg{display:block;width:${w};height:${h}}</style>${inline}`;
    };
    const pdfPage = join(profile, 'pdf.html');
    await writeFile(pdfPage, page(`${A2_MM.w}mm ${A2_MM.h}mm`));
    chrome('--no-pdf-header-footer', '--virtual-time-budget=5000', `--print-to-pdf=${resolve(OUT_DIR, `${name}_A2.pdf`)}`, pathToFileURL(pdfPage).href);

    const pxW = Math.round(A2_MM.w / 25.4 * PRINT_DPI);
    const scale = pxW / width;
    const pngPage = join(profile, 'png.html');
    await writeFile(pngPage, page(`${width}px ${Math.round(height)}px`));
    chrome(`--window-size=${width},${Math.round(height)}`, `--force-device-scale-factor=${scale}`, '--virtual-time-budget=5000', `--screenshot=${resolve(OUT_DIR, `${name}_A2_${PRINT_DPI}dpi.png`)}`, pathToFileURL(pngPage).href);
    console.log(`Exported ${name}: SVG, A2 PDF, A2 ${PRINT_DPI} dpi PNG`);
  }
} finally {
  await rm(profile, { recursive: true, force: true });
}
