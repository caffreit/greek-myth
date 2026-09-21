#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [htmlPath, layoutPath, additionsPath] = process.argv.slice(2);
if (!htmlPath || !layoutPath || !additionsPath) {
  console.error('Usage: node tools/verify_poster_v27.mjs HTML LAYOUT ADDITIONS');
  process.exit(1);
}

const html = await readFile(resolve(htmlPath), 'utf8');
const layout = JSON.parse(await readFile(resolve(layoutPath), 'utf8'));
const additions = JSON.parse(await readFile(resolve(additionsPath), 'utf8'));

function embeddedJson(pattern, label) {
  const match = html.match(pattern);
  if (!match) throw new Error(`Missing ${label}.`);
  return JSON.parse(match[1]);
}

const people = embeddedJson(/const PEOPLE_RAW = (\[.*?\]);\nconst INITIAL_LAYOUT =/s, 'people model');
const embeddedLayout = embeddedJson(/const INITIAL_LAYOUT = (\{.*?\});\nconst STYLES =/s, 'layout model');
const styles = embeddedJson(/const STYLES = (\{.*?\});\nconst MACRO_GROUPS =/s, 'family styles');
const macros = embeddedJson(/const MACRO_GROUPS = (\{.*?\});\n\n\nconst PALETTES =/s, 'macro groups');
const ids = new Set(people.map(person => person.id));
const addedIds = new Set(additions.people.map(person => person.id));

if (people.length !== 79) throw new Error(`Expected 79 figures, found ${people.length}.`);
if (addedIds.size !== 20) throw new Error(`Expected 20 unique additions, found ${addedIds.size}.`);
if (Object.keys(layout.nodes).length !== 79) throw new Error('External layout does not contain 79 nodes.');
if (JSON.stringify(layout) !== JSON.stringify(embeddedLayout)) throw new Error('Embedded and external layouts differ.');
if (Object.keys(styles).length !== 27) throw new Error(`Expected 27 family styles, found ${Object.keys(styles).length}.`);
if (Object.keys(macros).length !== 4) throw new Error(`Expected four macro regions, found ${Object.keys(macros).length}.`);

const coordinates = new Map();
for (const person of people) {
  if (!layout.nodes[person.id]) throw new Error(`No node for ${person.id}.`);
  for (const relation of person.relations || []) {
    if (!ids.has(relation.parent_id)) throw new Error(`${person.id} references missing parent ${relation.parent_id}.`);
  }
  const node = layout.nodes[person.id];
  const key = `${node.x},${node.y}`;
  if (coordinates.has(key)) throw new Error(`${person.id} overlaps ${coordinates.get(key)} at ${key}.`);
  coordinates.set(key, person.id);
}

const collectives = additions.people.filter(person => person.role === 'collective');
if (collectives.length !== 11) throw new Error(`Expected 11 collective nodes, found ${collectives.length}.`);
for (const collective of collectives) {
  if (!Array.isArray(collective.member_lines) || collective.member_lines.length < 1) {
    throw new Error(`${collective.id} has no collective member lines.`);
  }
}
for (const name of ['Nereids','Hecatoncheires','Elder Cyclopes','Erinyes','Gigantes','Moirai','Keres','Nemesis','Eris','Hesperides','Hecate','Muses','Horae','Charites']) {
  if (!people.some(person => person.name === name)) throw new Error(`Missing selected figure ${name}.`);
}
for (const heroId of ['heracles','perseus','theseus','achilles','odysseus','jason','atalanta','orpheus','bellerophon','oedipus','aeneas','asclepius','medea','circe','ariadne','helen','daedalus','icarus']) {
  if (ids.has(heroId)) throw new Error(`Hero ${heroId} leaked into the extended theogony.`);
}
for (const requiredText of ['Greek Theogony, Extended','EXTENDED PROTOTYPE','role-collective','Collective beings stay collective']) {
  if (!html.includes(requiredText)) throw new Error(`Generated HTML is missing ${requiredText}.`);
}

const mainScript = html.match(/<script>\n([\s\S]*)<\/script>/)?.[1];
if (!mainScript) throw new Error('Could not isolate the main script.');
new Function(mainScript);

const renderIndex = mainScript.indexOf('function render(){');
if (renderIndex < 0) throw new Error('Could not isolate the pure layout engine.');
const engine = new Function(
  'document',
  `${mainScript.slice(0, renderIndex)}
   for (const [id, group] of Object.entries(groups)) {
     try { generateMask(group, nodes, null, RELATED_GROUPS); }
     catch (error) { throw new Error('Family '+id+' failed initial routing: '+error.message); }
   }
   const familyMasks = computeAllMasks(nodes);
   const macroMasks = computeMacroMasks(familyMasks);
   return {
     families: Object.keys(familyMasks).length,
     emptyFamilies: Object.entries(familyMasks).filter(([, mask]) => !mask.size).map(([id]) => id),
     macros: Object.fromEntries(Object.entries(macroMasks).map(([id, mask]) => [id, mask.size]))
   };`
);
const engineResult = engine({ getElementById: () => null });
if (engineResult.emptyFamilies.length) throw new Error(`Empty family masks: ${engineResult.emptyFamilies.join(', ')}.`);
if (engineResult.families !== 27) throw new Error(`Expected 27 routed family fields, found ${engineResult.families}.`);
if (Object.keys(engineResult.macros).length !== 4 || Object.values(engineResult.macros).some(size => !size)) {
  throw new Error('The four macro regions did not all route with nonempty masks.');
}

console.log(`Verified ${people.length} figures, ${addedIds.size} additions, ${collectives.length} collective nodes, ${engineResult.families} family fields, four macro regions, unique coordinates, valid parent references, matching layouts, no heroes, and parseable embedded JavaScript.`);
