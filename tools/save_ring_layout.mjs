// Saves the square-ring map's current arrangement to topology/ring_layout.json. The next
// build starts its layout search there, so new figures nudge the map instead of redrawing it.
// Run it once a layout looks right, then rebuild.
//
//   node tools/save_ring_layout.mjs
//   node tools/build_underground_prototype.mjs
// V2 reads its own page and writes topology/ring_v2_layout.json:
//   node tools/save_ring_layout.mjs v2
//   node tools/build_underground_ring_v2.mjs
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const v2 = process.argv[2] === 'v2';
const source = await readFile(v2 ? 'topology/underground_ring_v2.html' : 'topology/underground_ring.html', 'utf8');
const document = {
  createElement: () => ({ getContext: () => ({ font: '', measureText: text => ({ width: text.length * 8 }) }) }),
  createElementNS: () => ({}),
  getElementById: () => ({}),
};
const context = vm.createContext({ document, console, URLSearchParams });
vm.runInContext(source.split('<script>')[1].split('// ---------- editor ----------')[0].split('// ---------- boot ----------')[0], context);
const { orders, score } = vm.runInContext('searchRing()', context);
const { roots, ...siblings } = orders;
await writeFile(v2 ? 'topology/ring_v2_layout.json' : 'topology/ring_layout.json', JSON.stringify({ orders: siblings, roots }, null, 2) + '\n');
console.log(`Saved ring layout: ${score.cr} crossings, ${score.through} pass-throughs.`);
