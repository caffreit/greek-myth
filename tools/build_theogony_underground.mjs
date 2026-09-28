import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('poster/layout_editor_greek_theogony_extended_v27_0.html', 'utf8');
const people = JSON.parse(source.match(/const PEOPLE_RAW = (.*);\nconst INITIAL_LAYOUT/)[1]);
const byId = Object.fromEntries(people.map(p => [p.id, p]));
const links = people.flatMap(p => p.relations.filter(r => r.boundary_include).map(r => [r.parent_id, p.id]));
const edgeKeys = new Set(links.map(([a,b]) => [a,b].sort().join('|')));
const lines = [
  { id:'origin', name:'Origin to Olympus', color:'#c8493b', stops:['chaos','gaia','uranus','cronus','zeus','athena'] },
  { id:'night', name:'Night', color:'#7b6db4', stops:['chaos','nyx','hypnos'] },
  { id:'sea', name:'Sea lineage', color:'#258b9b', stops:['gaia','pontus','nereus','nereids'] },
  { id:'ocean', name:'Ocean to Nereids', color:'#2f658f', stops:['gaia','uranus','oceanus','doris','nereids'] },
  { id:'crius', name:'Crius to Hecate', color:'#a77537', stops:['gaia','uranus','crius','perses','hecate'] },
  { id:'coeus', name:'Coeus to Hecate', color:'#667e4c', stops:['gaia','uranus','coeus','asteria','hecate'] },
  { id:'olympus', name:'Olympian branch', color:'#bd5875', stops:['gaia','uranus','cronus','zeus','apollo'] },
];
for (const line of lines) for (let i=1;i<line.stops.length;i++) {
  const [a,b]=line.stops.slice(i-1,i+1);
  if (!edgeKeys.has([a,b].sort().join('|'))) throw new Error(`Invalid ${line.name} segment ${a}–${b}`);
}
const witnessPaths = [
  ['gaia','themis'],['gaia','mnemosyne'],['gaia','cronus'],
  ['uranus','themis'],['uranus','mnemosyne'],['uranus','cronus'],
  ['zeus','horae','themis'],['zeus','muses','mnemosyne'],['zeus','cronus'],
];
const left=['gaia','uranus','zeus'], right=['themis','mnemosyne','cronus'];
const endpoints=witnessPaths.map(path=>`${path[0]}|${path.at(-1)}`);
const required=left.flatMap(a=>right.map(b=>`${a}|${b}`));
const interiors=witnessPaths.flatMap(path=>path.slice(1,-1));
if(endpoints.length!==9 || required.some(pair=>!endpoints.includes(pair)) ||
   new Set(interiors).size!==interiors.length || interiors.some(id=>left.includes(id)||right.includes(id)))
  throw new Error('The K3,3 witness paths must be internally disjoint');
const witness=witnessPaths.flatMap(path=>path.slice(1).map((id,i)=>[path[i],id]));
for (const [a,b] of witness) if (!edgeKeys.has([a,b].sort().join('|'))) throw new Error(`Invalid witness link ${a}–${b}`);
const laneLists = {
  'Origin and earth':['chaos','eros','gaia','tartarus','uranus','ourea','echidna','typhon','aphrodite','hecatoncheires','elder_cyclopes','erinyes','gigantes'],
  'Night':['nyx','erebus','aether','hemera','charon','hypnos','thanatos','moros','moirai','keres','nemesis','eris','hesperides'],
  'Sea':['pontus','thaumas','phorcys','ceto','nereus','doris','nereids','eurybia','perses','oceanus','tethys','eurynome','charites'],
  'Titans':['themis','mnemosyne','hyperion','theia','crius','coeus','phoebe','iapetus','clymene','cronus','rhea','helios','selene','eos','atlas','prometheus','epimetheus','asteria','hecate'],
  'Olympus':['hestia','demeter','hera','hades','poseidon','zeus','metis','athena','leto','apollo','artemis','maia','hermes','semele','dionysus','ares','hephaestus','hebe','persephone','muses','horae'],
};
const listed=Object.values(laneLists).flat();
if (new Set(listed).size!==listed.length || listed.length!==people.length || listed.some(id=>!byId[id])) {
  throw new Error('Lane lists must contain each figure exactly once');
}
const depthMemo={};
function depth(id){
  if (depthMemo[id]!==undefined) return depthMemo[id];
  const parents=byId[id].relations.filter(r=>r.boundary_include).map(r=>r.parent_id);
  return depthMemo[id]=parents.length?1+Math.max(...parents.map(depth)):0;
}
for (const p of people) depth(p.id);
// Source figures without recorded ancestry are placed beside their co-parent.
for (const [id,anchor] of Object.entries({clymene:'iapetus',leto:'zeus',metis:'zeus',maia:'zeus',semele:'zeus'})) depthMemo[id]=depthMemo[anchor];
const data={
  people:people.map(p=>({id:p.id,name:p.name,notes:p.notes||'',depth:depthMemo[p.id]})),
  links, lines, witness, lanes:laneLists,
  metrics:{figures:people.length,links:links.length,cycles:links.length-people.length+1},
};
const template=await readFile('topology/theogony_underground.template.html','utf8');
if(!template.includes('/* THEOGONY_DATA */'))throw new Error('Missing data marker');
await writeFile('topology/theogony_underground.html',template.replace('/* THEOGONY_DATA */',JSON.stringify(data)));
console.log(`Built tube map: ${data.metrics.figures} figures, ${data.metrics.links} links, ${lines.length} named routes, verified K3,3 witness.`);
