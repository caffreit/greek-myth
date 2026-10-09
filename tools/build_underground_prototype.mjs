// PROTOTYPE: builds topology/prototype_underground_lines.html, a throwaway comparison of two
// automatically laid-out tube maps (left-to-right zones vs square ring zones).
import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('poster/layout_editor_greek_theogony_extended_v27_0.html', 'utf8');
const people = JSON.parse(source.match(/const PEOPLE_RAW = (.*);\nconst INITIAL_LAYOUT/)[1]);
const byId = Object.fromEntries(people.map(p => [p.id, p]));
const links = people.flatMap(p => p.relations.filter(r => r.boundary_include).map(r => [r.parent_id, p.id]));
const parentLinks = new Set(links.map(([a, b]) => `${a}>${b}`));

const lines = [
  { id: 'sovereignty', name: 'Sovereignty line', color: '#d0312d', paths: [['chaos', 'gaia', 'uranus', 'cronus', 'zeus', 'athena'], ['zeus', 'apollo'], ['zeus', 'artemis'], ['zeus', 'hermes'], ['zeus', 'dionysus'], ['zeus', 'ares'], ['zeus', 'hebe'], ['zeus', 'persephone'], ['zeus', 'charites']] },
  { id: 'promethean', name: 'Promethean line', color: '#7a4ea6', paths: [['chaos', 'gaia', 'uranus', 'iapetus', 'prometheus'], ['iapetus', 'atlas']] },
  { id: 'sea', name: 'Sea line', color: '#13a19d', paths: [['chaos', 'gaia', 'pontus', 'nereus', 'nereids']] },
  { id: 'ocean', name: 'Ocean line', color: '#1f5ea8', paths: [['chaos', 'gaia', 'uranus', 'oceanus', 'doris', 'nereids'], ['oceanus', 'eurynome', 'charites']] },
  { id: 'sun', name: 'Sun line', color: '#f0a500', paths: [['chaos', 'gaia', 'uranus', 'hyperion', 'helios'], ['hyperion', 'eos']] },
  { id: 'hecate', name: 'Hecate line', color: '#2e8b4b', paths: [['chaos', 'gaia', 'uranus', 'coeus', 'asteria', 'hecate'], ['uranus', 'crius', 'perses', 'hecate']] },
  { id: 'night', name: 'Night line', color: '#1d1d1b', paths: [['chaos', 'nyx', 'moirai'], ['nyx', 'thanatos'], ['nyx', 'hypnos']] },
  // Later lines leave an existing line at an interchange instead of running from Chaos, keeping the trunk to six tracks.
  { id: 'memory', name: 'Memory line', color: '#e0609c', paths: [['uranus', 'mnemosyne', 'muses']] },
  { id: 'justice', name: 'Justice line', color: '#9aa3a8', paths: [['uranus', 'themis', 'horae']] },
  { id: 'hera', name: 'Hera line', color: '#8c1c3c', paths: [['cronus', 'hera', 'ares'], ['hera', 'hephaestus'], ['hera', 'hebe']] },
  { id: 'harvest', name: 'Harvest line', color: '#8dc63f', paths: [['cronus', 'demeter', 'persephone']] },
  { id: 'abyss', name: 'Abyss line', color: '#7b5130', paths: [['chaos', 'tartarus', 'typhon'], ['tartarus', 'echidna']] },
  { id: 'erebus', name: 'Erebus line', color: '#3b3f8f', paths: [['chaos', 'erebus', 'aether'], ['erebus', 'hemera'], ['erebus', 'charon']] },
  { id: 'foam', name: 'Foam line', color: '#62b5e5', paths: [['uranus', 'aphrodite']] },
  { id: 'forge', name: 'Forge line', color: '#ee7a12', paths: [['uranus', 'elder_cyclopes'], ['uranus', 'hecatoncheires']] },
];
for (const line of lines) for (const path of line.paths) for (let i = 1; i < path.length; i++) {
  if (!parentLinks.has(`${path[i - 1]}>${path[i]}`)) throw new Error(`${line.name}: ${path[i - 1]} is not a recorded parent of ${path[i]}`);
}
// Couples whose shared children are drawn with both parents' lines; the layout keeps heavier pairs closer together.
const couples = [
  { a: 'zeus', b: 'hera', weight: 3 },
  { a: 'zeus', b: 'demeter', weight: 1 },
  { a: 'zeus', b: 'eurynome', weight: 1 },
];
const onMap = new Set(lines.flatMap(l => l.paths.flat()));
for (const { a, b } of couples) {
  if (!onMap.has(a) || !onMap.has(b)) throw new Error(`Couple ${a}–${b} must both be stations`);
  if (!people.some(p => [a, b].every(id => parentLinks.has(`${id}>${p.id}`)))) throw new Error(`Couple ${a}–${b} has no recorded shared child`);
}

const depthMemo = {};
function depth(id) {
  if (depthMemo[id] !== undefined) return depthMemo[id];
  const parents = byId[id].relations.filter(r => r.boundary_include).map(r => r.parent_id);
  return depthMemo[id] = parents.length ? 1 + Math.max(...parents.map(depth)) : 0;
}
for (const p of people) depth(p.id);
for (const [id, anchor] of Object.entries({ clymene: 'iapetus', leto: 'zeus', metis: 'zeus', maia: 'zeus', semele: 'zeus' })) depthMemo[id] = depthMemo[anchor];

const data = {
  people: people.map(p => ({ id: p.id, name: p.name, depth: depthMemo[p.id] })),
  links,
  lines,
  couples,
  levelNames: ['Origin', 'Primordials', 'Primordial children', 'Titans and contemporaries', 'Olympians and younger Titans', 'Olympian children and contemporaries'],
};
const template = await readFile('topology/prototype_underground_lines.template.html', 'utf8');
if (!template.includes('/* PROTOTYPE_DATA */')) throw new Error('Missing data marker');
await writeFile('topology/prototype_underground_lines.html', template.replace('/* PROTOTYPE_DATA */', JSON.stringify(data)));
console.log(`Built prototype: ${lines.length} lines, all segments verified as parent→child links.`);
