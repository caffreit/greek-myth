// Local server for editing the square-ring map by hand.
//   node tools/ring_editor.mjs [port]        V1: saves topology/ring_positions.json
//   node tools/ring_editor.mjs [port] v2     V2: saves topology/ring_v2_positions.json
// Serves the repository, opens the ring page in edit mode, and saves edits before rebuilding the page.
// Each page says which variant it is, so a save always goes to that page's own file.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { extname, join, normalize, resolve } from 'node:path';
import { promisify } from 'node:util';

const root = resolve(new URL('..', import.meta.url).pathname);
const port = Number(process.argv[2] ?? 8765);
const variants = {
  ring: { page: '/topology/underground_ring.html?edit=1', edits: 'topology/ring_positions.json', build: 'tools/build_underground_prototype.mjs' },
  ring_v2: { page: '/topology/underground_ring_v2.html?edit=1', edits: 'topology/ring_v2_positions.json', build: 'tools/build_underground_ring_v2.mjs' },
};
const page = variants[process.argv[3] === 'v2' ? 'ring_v2' : 'ring'].page;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.css': 'text/css' };
const run = promisify(execFile);

const readBody = req => new Promise((ok, fail) => {
  let body = '';
  req.on('data', chunk => { body += chunk; if (body.length > 5e6) req.destroy(); });
  req.on('end', () => ok(body)).on('error', fail);
});

async function save(req, res, variant) {
  const { edits: editsFile, build } = variants[variant ?? 'ring'] ?? {};
  if (!editsFile) throw new Error(`Unknown variant ${variant}`);
  const edits = JSON.parse(await readBody(req));
  if (typeof edits.positions !== 'object' || !edits.positions) throw new Error('Expected {positions, labels, lanes, trackOrder}');
  await writeFile(join(root, editsFile), JSON.stringify(edits, null, 1) + '\n');
  const { stdout } = await run(process.execPath, [build], { cwd: root });
  console.log(`Saved ${Object.keys(edits.positions).length} positions to ${editsFile}`);
  process.stdout.write(stdout);
  res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/') return res.writeHead(302, { location: page }).end();
    if (url.pathname === '/api/ping') return res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
    if (url.pathname === '/api/save' && req.method === 'POST') return await save(req, res, url.searchParams.get('variant'));
    const file = normalize(join(root, decodeURIComponent(url.pathname)));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'EISDIR') return res.writeHead(404).end('Not found');
    console.error(err);
    res.writeHead(500).end(String(err.message ?? err));
  }
}).listen(port, '127.0.0.1', () => console.log(`Ring editor: http://localhost:${port}/`));
