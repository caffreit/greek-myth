// Builds the V2 square-ring Transit Theogony (gods, monsters and heroes). V1 and its
// builder (tools/build_underground_prototype.mjs) are untouched.
//
//   node tools/build_underground_ring_v2.mjs
//   node tools/ring_editor.mjs 8765 v2        hand-edit, saves topology/ring_v2_positions.json
//   node tools/export_underground_posters.mjs transit_theogony_ring_v2
import { readFile, writeFile } from 'node:fs/promises';
import { couples, levelNames, lines, people } from '../topology/ring_v2_theogony.mjs';

const label = 'Square rings V2';
const byId = Object.fromEntries(people.map(p => [p.id, p]));
if (Object.keys(byId).length !== people.length) throw new Error(`${label}: duplicate figure ids`);
const links = people.flatMap(p => p.parents.map(parent => [parent, p.id]));
for (const [parent, child] of links) if (!byId[parent]) throw new Error(`${label}: ${child} has unknown parent ${parent}`);
for (const p of people) for (const parent of Object.keys(p.via ?? {})) {
  if (!p.parents.includes(parent)) throw new Error(`${label}: ${p.id} passes generations from ${parent}, which is not a parent`);
}
// A line may also step between partners, then carry on to their shared children.
const allowed = new Set(links.map(([a, b]) => `${a}>${b}`));
const steps = new Set([...allowed, ...couples.flatMap(({ a, b }) => [`${a}>${b}`, `${b}>${a}`])]);
const depths = {};
const depth = id => depths[id] ??= byId[id].depth ?? (byId[id].parents.length ? 1 + Math.max(...byId[id].parents.map(depth)) : 0);
for (const p of people) depth(p.id);
for (const line of lines) for (const path of line.paths) for (let i = 0; i < path.length; i++) {
  if (!byId[path[i]]) throw new Error(`${label} ${line.name}: unknown figure ${path[i]}`);
  if (i > 0 && !steps.has(`${path[i - 1]}>${path[i]}`)) throw new Error(`${label} ${line.name}: ${path[i - 1]} is neither a parent nor a partner of ${path[i]}`);
}
const onMap = new Set(lines.flatMap(l => l.paths.flat()));
// Zones set by hand must still read outward: no station sits inside a parent's zone.
for (const [parent, child] of links) {
  if (onMap.has(parent) && onMap.has(child) && depths[child] < depths[parent]) throw new Error(`${label}: ${child} (zone ${depths[child]}) sits inside its parent ${parent} (zone ${depths[parent]})`);
}
for (const { a, b } of couples) {
  if (!onMap.has(a) || !onMap.has(b)) throw new Error(`${label} couple ${a}–${b} must both be stations`);
  if (!people.some(p => allowed.has(`${a}>${p.id}`) && allowed.has(`${b}>${p.id}`))) throw new Error(`${label} couple ${a}–${b} has no recorded shared child`);
}
const maxZone = Math.max(...[...onMap].map(id => depths[id]));
if (levelNames.length <= maxZone) throw new Error(`${label}: zone ${maxZone} has no name`);

const readJson = path => readFile(path, 'utf8').then(JSON.parse, () => null);
const data = {
  people: people.map(p => ({ id: p.id, name: p.name, depth: depths[p.id], ...(p.via && { via: p.via }) })),
  links,
  lines,
  couples,
  levelNames,
  // The ring search starts from tools/save_ring_layout.mjs's saved arrangement; hand edits override it.
  seed: await readJson('topology/ring_v2_layout.json'),
  edits: await readJson('topology/ring_v2_positions.json'),
};

const template = await readFile('topology/underground_ring_v2.template.html', 'utf8');
const fill = {
  '/* PROTOTYPE_DATA */': JSON.stringify(data),
  '/* VARIANT_KEY */': 'ring_v2',
  '/* PAGE_TITLE */': 'Transit Theogony V2 — Gods, monsters and heroes',
  '/* PAGE_NOTE */': 'Square-ring Transit Theogony V2. Roster: topology/ring_v2_theogony.mjs. Rebuild: node tools/build_underground_ring_v2.mjs. Edit: node tools/ring_editor.mjs 8765 v2. Export: node tools/export_underground_posters.mjs transit_theogony_ring_v2',
  '/* OTHER_HREF */': 'underground_ring.html',
  '/* OTHER_LABEL */': 'V1 square rings',
};
let html = template;
for (const [marker, value] of Object.entries(fill)) {
  if (!html.includes(marker)) throw new Error(`underground_ring_v2.template.html: missing ${marker}`);
  html = html.replaceAll(marker, () => value);
}
await writeFile('topology/underground_ring_v2.html', html);
console.log(`Built topology/underground_ring_v2.html: ${onMap.size} stations, ${lines.length} lines, ${maxZone + 1} zones.`);
