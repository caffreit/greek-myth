// Builds two Transit Theogony posters from one drawing template. Lineages live in
// topology/ltr_theogony.mjs and topology/ring_theogony.mjs, so the ring map can
// gain stations or change connections without moving the left-to-right poster.
//
//   node tools/build_underground_prototype.mjs
//   node tools/export_underground_posters.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { couples as ltrCouples, lines as ltrLines } from '../topology/ltr_theogony.mjs';
import { couples as ringCouples, extraLinks as ringLinks, figures as ringFigures, lines as ringLines } from '../topology/ring_theogony.mjs';

const source = await readFile('poster/layout_editor_greek_theogony_extended_v27_0.html', 'utf8');
const people = JSON.parse(source.match(/const PEOPLE_RAW = (.*);\nconst INITIAL_LAYOUT/)[1]);
const byId = Object.fromEntries(people.map(p => [p.id, p]));
const links = people.flatMap(p => p.relations.filter(r => r.boundary_include).map(r => [r.parent_id, p.id]));
const parentLinks = new Set(links.map(([a, b]) => `${a}>${b}`));

const depthMemo = {};
function depth(id) {
  if (depthMemo[id] !== undefined) return depthMemo[id];
  const parents = byId[id].relations.filter(r => r.boundary_include).map(r => r.parent_id);
  return depthMemo[id] = parents.length ? 1 + Math.max(...parents.map(depth)) : 0;
}
for (const p of people) depth(p.id);
for (const [id, anchor] of Object.entries({ clymene: 'iapetus', leto: 'zeus', metis: 'zeus', maia: 'zeus', semele: 'zeus' })) depthMemo[id] = depthMemo[anchor];

function pack(label, lines, couples, { figures = [], extraLinks = [] } = {}) {
  const figureById = Object.fromEntries(figures.map(f => [f.id, f]));
  for (const f of figures) {
    if (!f.id || !f.name || !Number.isInteger(f.depth) || f.depth < 0) throw new Error(`${label}: extra figure ${f.id || f.name} needs an id, name and whole-number depth`);
    if (byId[f.id]) throw new Error(`${label}: ${f.id} is already in the V27 theogony`);
  }
  const allowed = new Set([...parentLinks, ...extraLinks.map(([a, b]) => `${a}>${b}`)]);
  const known = id => byId[id] || figureById[id];
  for (const line of lines) for (const path of line.paths) for (let i = 0; i < path.length; i++) {
    if (!known(path[i])) throw new Error(`${label} ${line.name}: unknown figure ${path[i]}`);
    if (i > 0 && !allowed.has(`${path[i - 1]}>${path[i]}`)) throw new Error(`${label} ${line.name}: ${path[i - 1]} is not a parent of ${path[i]}. Add it to extraLinks if it belongs only on this map.`);
  }
  const onMap = new Set(lines.flatMap(l => l.paths.flat()));
  const roster = [...people.map(p => p.id), ...figures.map(f => f.id)];
  for (const { a, b } of couples) {
    if (!onMap.has(a) || !onMap.has(b)) throw new Error(`${label} couple ${a}–${b} must both be stations`);
    if (!roster.some(id => allowed.has(`${a}>${id}`) && allowed.has(`${b}>${id}`))) throw new Error(`${label} couple ${a}–${b} has no recorded shared child`);
  }
  return {
    people: [
      ...people.map(p => ({ id: p.id, name: p.name, depth: depthMemo[p.id] })),
      ...figures.map(f => ({ id: f.id, name: f.name, depth: f.depth })),
    ],
    links: [...links, ...extraLinks],
    lines,
    couples,
    levelNames: ['Origin', 'Primordials', 'Primordial children', 'Titans and contemporaries', 'Olympians and younger Titans', 'Olympian children and contemporaries'],
  };
}

const template = await readFile('topology/prototype_underground_lines.template.html', 'utf8');
for (const marker of ['/* PROTOTYPE_DATA */', '/* VARIANT_KEY */', '/* PAGE_TITLE */', '/* PAGE_NOTE */', '/* OTHER_HREF */', '/* OTHER_LABEL */']) {
  if (!template.includes(marker)) throw new Error(`Missing ${marker}`);
}
const pages = [
  {
    key: 'ltr',
    file: 'topology/underground_ltr.html',
    title: 'Transit Theogony — Left to right',
    note: 'Left-to-right Transit Theogony. Lineage: topology/ltr_theogony.mjs. Rebuild: node tools/build_underground_prototype.mjs. Export: node tools/export_underground_posters.mjs transit_theogony_ltr',
    otherHref: 'underground_ring.html',
    otherLabel: 'Square rings',
    data: pack('Left to right', ltrLines, ltrCouples),
  },
  {
    key: 'ring',
    file: 'topology/underground_ring.html',
    title: 'Transit Theogony — Square rings',
    note: 'Square-ring Transit Theogony. Lineage: topology/ring_theogony.mjs, separate from the left-to-right map. Rebuild: node tools/build_underground_prototype.mjs. Export: node tools/export_underground_posters.mjs transit_theogony_ring',
    otherHref: 'underground_ltr.html',
    otherLabel: 'Left to right',
    data: pack('Square rings', ringLines, ringCouples, { figures: ringFigures, extraLinks: ringLinks }),
  },
];
for (const page of pages) {
  const html = template
    .replace('/* PROTOTYPE_DATA */', JSON.stringify(page.data))
    .replaceAll('/* VARIANT_KEY */', page.key)
    .replaceAll('/* PAGE_TITLE */', page.title)
    .replaceAll('/* PAGE_NOTE */', page.note)
    .replaceAll('/* OTHER_HREF */', page.otherHref)
    .replaceAll('/* OTHER_LABEL */', page.otherLabel);
  await writeFile(page.file, html);
  console.log(`Built ${page.file}: ${page.data.lines.length} lines.`);
}
