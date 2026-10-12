// Run the generated map's layout and SVG renderer without a browser, then check its route geometry.
// Optional second argument saves the rendered SVG for visual inspection.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

class SvgElement {
  constructor(tag) { this.tag = tag; this.attrs = {}; this.children = []; this.textContent = ''; }
  setAttribute(key, value) { this.attrs[key] = value; }
  append(child) { this.children.push(child); }
  set innerHTML(value) { this.children = []; }
  toString() {
    const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
    return `<${this.tag} ${Object.entries(this.attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')}>${escape(this.textContent)}${this.children.join('')}</${this.tag}>`;
  }
}
const elements = {};
const document = {
  // Text metrics only affect labels. These checks exercise station positions, tracks and SVG strokes.
  createElement: () => ({ getContext: () => ({ font: '', measureText: text => ({ width: text.length * 8 }) }) }),
  createElementNS: (ns, tag) => new SvgElement(tag),
  getElementById: id => elements[id] ??= new SvgElement(id === 'poster' ? 'svg' : 'div'),
};
const source = await readFile(process.argv[2] ?? 'topology/prototype_underground_lines.html', 'utf8');
const context = vm.createContext({ document, console, URLSearchParams });
vm.runInContext(source.split('<script>')[1].split('// ---------- prototype switcher ----------')[0], context);
vm.runInContext('globalThis.result = build("ltr", false); render("ltr", false)', context);
const { pos, tracks, markers, labels } = context.result;
const routes = line => tracks.filter(t => t.line.id === line);
const crossings = (a, b) => vm.runInContext('polyCross', context)(a.pts, b.pts);
const near = (a, b) => Math.abs(a - b) < .01;
const width = vm.runInContext('LW', context), casing = vm.runInContext('CASING', context), pitch = width + casing;

assert(pos.eurynome.y < pos.doris.y, 'Eurynome must sit above Doris');
assert.equal(crossings(...routes('ocean')), 0, 'Ocean branches must not cross each other');
assert(pos.moirai.x <= pos.uranus.x - 100, 'Moirai must sit farther left of Uranus');
const label = id => labels[markers.findIndex(m => m.v === id)];
assert.equal(label('uranus').dir, 'N', 'Uranus label must sit above its interchange');
assert(label('moirai').r.x + label('moirai').r.w + 10 < label('uranus').r.x, 'Moirai must leave room for the Uranus label');
assert.equal(label('pontus').dir, 'S', 'Pontus label must sit below its own station');
for (const id of ['elder_cyclopes', 'hecatoncheires']) assert(pos[id].y > pos.oceanus.y && pos[id].y < pos.nereus.y, `${id} must sit between Oceanus and Nereus`);
for (const forge of routes('forge')) for (const id of ['ocean', 'promethean', 'sovereignty', 'sea']) {
  for (const other of routes(id)) assert.equal(crossings(forge, other), 0, `Forge must not cross ${id}`);
}
assert(pos.aphrodite.y < Math.min(pos.crius.y, pos.coeus.y), 'Aphrodite must sit above both Hecate stops');
for (const foam of routes('foam')) for (const hecate of routes('hecate')) assert.equal(crossings(foam, hecate), 0, 'Foam must not cross Hecate');
const fanColumns = ['memory', 'justice', 'foam'].map(id => {
  const pts = routes(id)[0].pts;
  const i = pts.findIndex((p, j) => j + 1 < pts.length && near(p.x, pts[j + 1].x) && !near(p.y, pts[j + 1].y));
  assert(i >= 0, `${id} must have its own vertical bend`);
  return pts[i].x;
});
for (let i = 1; i < fanColumns.length; i++) assert(near(fanColumns[i] - fanColumns[i - 1], pitch), 'Upper fan stems must stay close and evenly spaced');

function atX(track, x) {
  const a = track.pts.findIndex((p, i) => i + 1 < track.pts.length && p.x <= x && track.pts[i + 1].x > x);
  assert(a >= 0, `${track.line.id} must reach x=${x}`);
  const p = track.pts[a], q = track.pts[a + 1];
  return p.y + (q.y - p.y) * (x - p.x) / (q.x - p.x);
}
const trunk = ['hecate', 'sun', 'sovereignty', 'promethean', 'ocean', 'sea'].map(id => routes(id)[0]);
for (const track of trunk) assert(near(atX(track, pos.gaia.x - 20), atX(track, pos.gaia.x + 20)), `${track.line.id} must stay in its lane at Gaia`);
for (const id of ['uranus', 'cronus', 'zeus']) assert(near(atX(routes('sovereignty')[0], pos.gaia.x - 20), atX(routes('sovereignty')[0], pos[id].x + 20)), `Sovereignty must stay level beyond ${id}`);
const lanes = trunk.map(t => atX(t, pos.gaia.x + 20)).sort((a, b) => a - b);
for (let i = 1; i < lanes.length; i++) assert(near(lanes[i] - lanes[i - 1], pitch), 'Gaia lanes must stay close and evenly spaced');
for (const [a, b] of [['memory', 'justice'], ['justice', 'foam'], ['foam', 'hecate'], ['hecate', 'sun'], ['promethean', 'ocean'], ['ocean', 'forge'], ['forge', 'sea']]) {
  const clearance = Math.abs(atX(routes(a)[0], 700) - atX(routes(b)[0], 700)) / Math.SQRT2;
  assert(Math.abs(clearance - pitch) < .01, `${a}/${b} must keep the same close spacing on diagonals (${clearance.toFixed(2)} units)`);
}
assert(atX(routes('forge')[0], 700) < atX(routes('sea')[0], 700), 'Forge must run above Sea');
for (const [id, p] of Object.entries(pos)) for (const [other, q] of Object.entries(pos)) {
  if (id !== other) assert(!near(p.x, q.x) || !near(p.y, q.y), `${id} and ${other} must not occupy the same station position`);
}
for (const track of tracks) for (const p of track.pts) assert(Number.isFinite(p.x) && Number.isFinite(p.y));

const svg = elements.poster;
const trackGroup = svg.children.find(g => g.attrs['stroke-linejoin'] === 'round');
function flattenPath(d) {
  const tokens = d.match(/[MLQ]|-?\d+(?:\.\d+)?/g), points = [];
  let current, i = 0;
  const point = () => ({ x: Number(tokens[i++]), y: Number(tokens[i++]) });
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === 'M') { current = point(); points.push(current); }
    else if (command === 'L') {
      const end = point(), steps = Math.max(1, Math.ceil(Math.hypot(end.x - current.x, end.y - current.y) / 2));
      for (let j = 1; j <= steps; j++) points.push({ x: current.x + (end.x - current.x) * j / steps, y: current.y + (end.y - current.y) * j / steps });
      current = end;
    } else if (command === 'Q') {
      const control = point(), end = point();
      for (let j = 1; j <= 48; j++) {
        const t = j / 48, u = 1 - t;
        points.push({ x: u * u * current.x + 2 * u * t * control.x + t * t * end.x, y: u * u * current.y + 2 * u * t * control.y + t * t * end.y });
      }
      current = end;
    } else assert.fail(`Unexpected SVG path command ${command}`);
  }
  return points;
}
const distanceToSegment = vm.runInContext('pointSegDist', context);
const renderedRoutes = id => trackGroup.children.filter(p => p.attrs.stroke === routes(id)[0].line.color).map(p => flattenPath(p.attrs.d));
for (const [a, b, low, high] of [['memory', 'justice', -420, -20], ['justice', 'foam', -420, -20], ['foam', 'hecate', -420, -20], ['hecate', 'sun', -420, -20], ['promethean', 'ocean', 30, 420], ['ocean', 'forge', 30, 420], ['forge', 'sea', 30, 420]]) {
  const inside = p => p.x >= 612 && p.x <= 910 && p.y >= low && p.y <= high;
  let clearance = Infinity;
  for (const first of renderedRoutes(a)) for (const second of renderedRoutes(b)) {
    const points = first.filter(inside);
    const segments = second.slice(1).flatMap((p, i) => inside(p) && inside(second[i]) ? [[second[i], p]] : []);
    for (const p of points) for (const [start, end] of segments) clearance = Math.min(clearance, distanceToSegment(p, start, end));
  }
  assert(Number.isFinite(clearance) && clearance >= width + casing / 2 - .1, `${a}/${b} rounded bends clip the coloured strokes (${clearance.toFixed(2)} units)`);
}
for (const line of new Set(tracks.map(t => t.line.color))) {
  const indices = trackGroup.children.flatMap((p, i) => p.attrs.stroke === line ? [i] : []);
  for (let i = indices[0]; i <= indices.at(-1); i++) assert.equal(trackGroup.children[i].attrs.stroke, line, 'A casing must not cut through another branch of its own line');
}
const stationGroup = svg.children.find(g => g.children.some(c => c.attrs['data-station']));
const moirai = stationGroup.children.find(t => t.attrs['data-station'] === 'moirai').attrs;
const uranus = markers.find(m => m.v === 'uranus');
const distanceToCapsule = vm.runInContext('pointSegDist', context);
const seaAtUranus = { x: pos.uranus.x, y: atX(routes('sea')[0], pos.uranus.x) };
assert(distanceToCapsule(seaAtUranus, uranus.a, uranus.b) - 19 / 2 - width / 2 >= 1, 'Sea must pass clear of the Uranus capsule');
for (const end of [1, 2]) {
  const p = { x: moirai['x' + end], y: moirai['y' + end] };
  const clearance = distanceToCapsule(p, uranus.a, uranus.b) - 19 / 2 - moirai['stroke-width'] / 2;
  assert(clearance >= 12, `Moirai must have a visible gap from Uranus (${clearance.toFixed(2)} units)`);
}
for (const m of markers.filter(m => m.terminal)) {
  const tick = stationGroup.children.find(t => t.attrs['data-station'] === m.v).attrs;
  const dx = m.p.x - tick.x1, dy = m.p.y - tick.y1;
  assert(near(dx * m.d.x + dy * m.d.y, tick['stroke-width'] / 2), `${m.v} terminal tick must be flush`);
  assert(tracks.some(t => near(t.pts.at(-1).x, m.p.x) && near(t.pts.at(-1).y, m.p.y)), `${m.v} must remain attached to its track`);
}
if (process.argv[3]) {
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  await writeFile(process.argv[3], svg.toString());
}
console.log('Verified branch order, clear corridors, Gaia continuity, full diagonal stroke widths, Moirai clearance and terminal ticks.');
