// Builds the two Transit Theogony posters. They share nothing: the left-to-right map
// reads the V27 theogony and draws from topology/underground_ltr.template.html; the
// square-ring map has its own roster in topology/ring_theogony.mjs and draws from
// topology/underground_ring.template.html.
//
//   node tools/build_underground_prototype.mjs
//   node tools/export_underground_posters.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { couples as ltrCouples, lines as ltrLines } from '../topology/ltr_theogony.mjs';
import { couples as ringCouples, lines as ringLines, people as ringPeople } from '../topology/ring_theogony.mjs';

const source = await readFile('poster/layout_editor_greek_theogony_extended_v27_0.html', 'utf8');
const ltrDepths = { clymene: 3, leto: 4, metis: 4, maia: 4, semele: 4 };
const ltrPeople = JSON.parse(source.match(/const PEOPLE_RAW = (.*);\nconst INITIAL_LAYOUT/)[1]).map(p => ({
  id: p.id,
  name: p.name,
  parents: p.relations.filter(r => r.boundary_include).map(r => r.parent_id),
  ...(ltrDepths[p.id] !== undefined && { depth: ltrDepths[p.id] }),
}));

function pack(label, people, lines, couples) {
  const byId = Object.fromEntries(people.map(p => [p.id, p]));
  const links = people.flatMap(p => p.parents.map(parent => [parent, p.id]));
  for (const [parent, child] of links) if (!byId[parent]) throw new Error(`${label}: ${child} has unknown parent ${parent}`);
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
  for (const { a, b } of couples) {
    if (!onMap.has(a) || !onMap.has(b)) throw new Error(`${label} couple ${a}–${b} must both be stations`);
    if (!people.some(p => allowed.has(`${a}>${p.id}`) && allowed.has(`${b}>${p.id}`))) throw new Error(`${label} couple ${a}–${b} has no recorded shared child`);
  }
  return {
    people: people.map(p => ({ id: p.id, name: p.name, depth: depths[p.id] })),
    links,
    lines,
    couples,
    levelNames: ['Origin', 'Primordials', 'Primordial children', 'Titans and contemporaries', 'Olympians and younger Titans', 'Olympian children and contemporaries'],
  };
}

// The ring search starts from the arrangement saved by tools/save_ring_layout.mjs, when there is one.
// Hand edits saved by the ring editor (node tools/ring_editor.mjs) then override it.
const readJson = path => readFile(path, 'utf8').then(JSON.parse, () => null);

const pages = [
  {
    key: 'ltr',
    template: 'topology/underground_ltr.template.html',
    file: 'topology/underground_ltr.html',
    title: 'Transit Theogony — Left to right',
    note: 'Left-to-right Transit Theogony. Lineage: topology/ltr_theogony.mjs. Rebuild: node tools/build_underground_prototype.mjs. Export: node tools/export_underground_posters.mjs transit_theogony_ltr',
    otherHref: 'underground_ring.html',
    otherLabel: 'Square rings',
    data: pack('Left to right', ltrPeople, ltrLines, ltrCouples),
  },
  {
    key: 'ring',
    template: 'topology/underground_ring.template.html',
    file: 'topology/underground_ring.html',
    title: 'Transit Theogony — Square rings',
    note: 'Square-ring Transit Theogony. Lineage and roster: topology/ring_theogony.mjs. Rebuild: node tools/build_underground_prototype.mjs. Export: node tools/export_underground_posters.mjs transit_theogony_ring',
    otherHref: 'underground_ltr.html',
    otherLabel: 'Left to right',
    data: { ...pack('Square rings', ringPeople, ringLines, ringCouples), seed: await readJson('topology/ring_layout.json'), edits: await readJson('topology/ring_positions.json') },
  },
];
for (const page of pages) {
  const template = await readFile(page.template, 'utf8');
  for (const marker of ['/* PROTOTYPE_DATA */', '/* VARIANT_KEY */', '/* PAGE_TITLE */', '/* PAGE_NOTE */', '/* OTHER_HREF */', '/* OTHER_LABEL */']) {
    if (!template.includes(marker)) throw new Error(`${page.template}: missing ${marker}`);
  }
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
