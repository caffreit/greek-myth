#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [baselinePath, baselineLayoutPath, additionsPath, outputHtmlPath, outputLayoutPath] = process.argv.slice(2);
if (!baselinePath || !baselineLayoutPath || !additionsPath || !outputHtmlPath || !outputLayoutPath) {
  console.error('Usage: node tools/build_poster_v27.mjs V25_HTML V25_LAYOUT THEOGONY_ADDITIONS OUTPUT_HTML OUTPUT_LAYOUT');
  process.exit(1);
}

const baseline = await readFile(resolve(baselinePath), 'utf8');
const baselineLayout = JSON.parse(await readFile(resolve(baselineLayoutPath), 'utf8'));
const additions = JSON.parse(await readFile(resolve(additionsPath), 'utf8'));

function replaceOnce(source, search, replacement, label) {
  const first = typeof search === 'string' ? source.indexOf(search) : source.search(search);
  if (first < 0) throw new Error(`Could not find ${label}.`);
  if (typeof search === 'string') {
    if (source.indexOf(search, first + search.length) >= 0) throw new Error(`Found ${label} more than once.`);
    return source.slice(0, first) + replacement + source.slice(first + search.length);
  }
  const matches = [...source.matchAll(new RegExp(search.source, search.flags.includes('g') ? search.flags : `${search.flags}g`))];
  if (matches.length !== 1) throw new Error(`Expected one ${label}, found ${matches.length}.`);
  return source.replace(search, replacement);
}

function parseEmbeddedJson(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not parse ${label}.`);
  return JSON.parse(match[1]);
}

const baselinePeople = parseEmbeddedJson(baseline, /const PEOPLE_RAW = (\[.*?\]);\nconst INITIAL_LAYOUT =/s, 'people data');
const baselineStyles = parseEmbeddedJson(baseline, /const STYLES = (\{.*?\});\nconst MACRO_GROUPS =/s, 'family styles');
if (baselinePeople.length !== 59 || Object.keys(baselineLayout.nodes || {}).length !== 59) {
  throw new Error('V27 expects the untouched 59-figure V25.9 baseline.');
}
if (additions.people?.length !== 20 || Object.keys(additions.nodes || {}).length !== 20) {
  throw new Error('V27 expects exactly 20 extended-theogony additions.');
}

const people = [...baselinePeople, ...additions.people];
const layout = {
  grid: { ...baselineLayout.grid },
  nodes: { ...baselineLayout.nodes, ...additions.nodes },
  pinned_ids: []
};
const ids = new Set();
const coordinates = new Map();
for (const person of people) {
  if (!person.id || !person.name || ids.has(person.id)) throw new Error(`Invalid or duplicate person id: ${person.id}`);
  ids.add(person.id);
  if (!layout.nodes[person.id]) throw new Error(`Missing layout node for ${person.id}.`);
}
for (const person of people) {
  for (const relation of person.relations || []) {
    if (!ids.has(relation.parent_id)) throw new Error(`Unknown parent ${relation.parent_id} for ${person.id}.`);
  }
  if (person.role === 'collective' && (!Array.isArray(person.member_lines) || !person.member_lines.length)) {
    throw new Error(`Collective ${person.id} needs member_lines.`);
  }
}
for (const [id, node] of Object.entries(layout.nodes)) {
  if (!ids.has(id)) throw new Error(`Layout has unknown node ${id}.`);
  const key = `${node.x},${node.y}`;
  if (coordinates.has(key)) throw new Error(`Overlapping nodes ${coordinates.get(key)} and ${id} at ${key}.`);
  coordinates.set(key, id);
}
if (people.length !== 79 || Object.keys(layout.nodes).length !== 79) {
  throw new Error('Merged V27 prototype must contain 79 figures.');
}

const styles = {
  ...baselineStyles,
  nereus: { color: '#4f8391' },
  doris: { color: '#668ca0' },
  eurybia: { color: '#537786' },
  coeus: { color: '#6e5da2' },
  perses: { color: '#74548e' },
  asteria: { color: '#67558f' },
  eurynome: { color: '#8865a2' }
};
const macroGroups = {
  primordial: {
    label: 'Primordials', color: '#c4474d', setback: 4,
    members: ['chaos','eros','gaia','tartarus','pontus','ourea','echidna','typhon','thaumas','phorcys','ceto','nereus','doris','nereids','hecatoncheires','elder_cyclopes','erinyes','gigantes','eurybia']
  },
  night: {
    label: 'Night / underworld', color: '#b98315', setback: 8,
    members: ['erebus','nyx','aether','hemera','charon','hypnos','thanatos','moros','moirai','keres','nemesis','eris','hesperides']
  },
  titan: {
    label: 'Titans', color: '#7650b8', setback: 7,
    members: ['uranus','aphrodite','mnemosyne','themis','tethys','phoebe','oceanus','crius','coeus','hyperion','theia','helios','selene','eos','iapetus','clymene','prometheus','epimetheus','atlas','cronus','rhea','perses','asteria','hecate','eurynome']
  },
  olympian: {
    label: 'Olympians', color: '#c65a2e', setback: 9,
    members: ['hestia','demeter','hera','hades','poseidon','zeus','athena','metis','ares','hebe','persephone','hephaestus','apollo','artemis','leto','hermes','maia','dionysus','semele','muses','horae','charites']
  }
};
const familyOrder = [
  'chaos','gaia','tartarus','pontus','nereus','doris','eurybia',
  'nyx','erebus','uranus','hyperion','theia','coeus','perses','asteria',
  'iapetus','clymene','cronus','rhea','eurynome','zeus','hera','demeter',
  'leto','maia','metis','semele'
];

let html = baseline;
html = html.replaceAll('V25.9', 'V27.0');
html = html.replaceAll('v25_9', 'v27_0');
html = html.replaceAll('greek-poster-design-v25', 'greek-poster-design-v27');
html = html.replaceAll('Greek Theogony · Editorial Poster Prototype V27.0', 'Greek Theogony, Extended · Editorial Poster Prototype V27.0');
html = html.replaceAll('Greek theogony · poster design V27.0', 'Greek theogony, extended · poster design V27.0');
html = html.replaceAll('A MODERN MAP OF ANCIENT GREEK GODS', 'AN EXTENDED MAP OF THE ANCIENT GREEK GODS');
html = html.replaceAll("title.textContent='Greek Theogony';", "title.textContent='Greek Theogony, Extended';");
html = html.replaceAll('GREEK THEOGONY · EDITION 01 · 27 AUG 2026', 'GREEK THEOGONY · EXTENDED PROTOTYPE · 31 AUG 2026');
html = html.replaceAll(
  'A modern visual map of ancient Greek gods, their generations, immediate families and parent relationships.',
  'An extended visual map of ancient Greek gods, collective divine races, immediate families and selected parent traditions.'
);

html = replaceOnce(
  html,
  /const PEOPLE_RAW = \[.*?\];\nconst INITIAL_LAYOUT = \{.*?\};\nconst STYLES = \{.*?\};\nconst MACRO_GROUPS = \{.*?\};/s,
  `const PEOPLE_RAW = ${JSON.stringify(people)};\nconst INITIAL_LAYOUT = ${JSON.stringify(layout)};\nconst STYLES = ${JSON.stringify(styles)};\nconst MACRO_GROUPS = ${JSON.stringify(macroGroups, null, 2)};`,
  'embedded extended-theogony model'
);
html = replaceOnce(html, /const FAMILY_OWNER_ORDER = \[.*?\];/, `const FAMILY_OWNER_ORDER = ${JSON.stringify(familyOrder)};`, 'family owner order');
html = replaceOnce(html, 'const FAMILY_INDEX = Object.fromEntries(FAMILY_OWNER_ORDER.map((id,i)=>[id,i+1]));\n', '', 'obsolete numbered family index');
html = replaceOnce(html, 'const KEY_GAP = 20, KEY_PANEL_H = 276, FOOTER_H = 72;', 'const KEY_GAP = 20, KEY_PANEL_H = 220, FOOTER_H = 72;', 'poster key height');
html = replaceOnce(html, 'const EDIT_PAD_X = 0, EDIT_PAD_Y = 0;', 'const EDIT_PAD_X = 1, EDIT_PAD_Y = 1;', 'extended routing margin');
html = replaceOnce(html, "if((p.relations||[]).some(r=>r.parent_id===id && r.boundary_include)) children.push(p.id);", "if((p.relations||[]).some(r=>r.parent_id===id)) children.push(p.id);", 'interactive child relations');
html = replaceOnce(html, "const classes=['person'];", "const classes=['person',`role-${people[id].role||'deity'}`];", 'person role classes');
html = replaceOnce(html, '<select id="parentCueMode"><option value="numbers" selected>numbered badge</option></select>', '<select id="parentCueMode"><option value="numbers" selected>P · parent marker</option></select>', 'parent marker control');
html = replaceOnce(html, 'Family overlays use the macro hue. Parents are marked with a coloured numbered badge keyed to the poster legend.', 'A P badge marks each figure whose family region contains their direct children.', 'family key help');

const oldFamilyBadge = `function makeFamilyBadge(gid,b){
  const idx=FAMILY_INDEX[gid], a=familyMarkerAnchor(gid,nodes,b);
  const mid=familyMacroId(gid), badgeColor=(MACRO_GROUPS[mid]||MACRO_GROUPS.primordial).color;
  const g=makeSvg('g',{class:'family-marker family-badge','data-group':gid,transform:\`translate(\${a.x},\${a.y})\`});
  g.append(makeSvg('circle',{cx:0,cy:0,r:10.5,fill:badgeColor}), makeSvg('text',{x:0,y:0,dy:'.35em','dominant-baseline':'auto'}));
  g.lastChild.textContent=String(idx);
  return g;
}`;
const newFamilyBadge = `function makeFamilyBadge(gid,b){
  const a=familyMarkerAnchor(gid,nodes,b);
  const mid=familyMacroId(gid), badgeColor=(MACRO_GROUPS[mid]||MACRO_GROUPS.primordial).color;
  const g=makeSvg('g',{class:'family-marker family-badge','data-group':gid,transform:\`translate(\${a.x},\${a.y})\`});
  g.append(makeSvg('circle',{cx:0,cy:0,r:10.5,fill:badgeColor}), makeSvg('text',{x:0,y:0,dy:'.35em','dominant-baseline':'auto'}));
  g.lastChild.textContent='P';
  return g;
}`;
html = replaceOnce(html, oldFamilyBadge, newFamilyBadge, 'parent badge renderer');

html = replaceOnce(
  html,
  /function buildFamilyKey\(\)\{.*?\n\}/s,
  `function buildFamilyKey(){
  const el=document.getElementById('familyKey');
  if(!el)return;
  el.replaceChildren();
  const row=document.createElement('div');row.className='family-key-row';row.style.gridColumn='1 / -1';
  const badge=document.createElement('div');badge.className='family-key-badge';badge.textContent='P';badge.style.background='#555750';badge.style.color='#fff';badge.style.borderColor='rgba(20,20,18,.12)';
  const meta=document.createElement('div');meta.innerHTML='<strong>Parent</strong><div class="family-key-meta">The connected family region contains their direct children.</div>';
  row.append(badge,meta);el.append(row);
}`,
  'interactive family key'
);

const oldNodeText = `    const text=makeSvg('text',{class:\`label text-\${treatment}\`,x:w/2,y:h/2});text.textContent=people[id].name;
    text.setAttribute('style',\`font-family:\${currentTypeface()}\`);
    g.append(rect,text);`;
const newNodeText = `    const isCollective=people[id].role==='collective';
    const text=makeSvg('text',{class:\`label text-\${treatment}\`,x:w/2,y:isCollective?h/2-13:h/2});text.textContent=people[id].name;
    text.setAttribute('style',\`font-family:\${currentTypeface()}\`);
    g.append(rect,text);
    if(isCollective){
      (people[id].member_lines||[]).slice(0,2).forEach((line,index)=>{
        const detail=makeSvg('text',{class:'collective-detail',x:w/2,y:h/2+5+index*12});
        detail.textContent=line;
        detail.setAttribute('style',\`font-family:\${currentTypeface()}\`);
        g.append(detail);
      });
    }`;
html = replaceOnce(html, oldNodeText, newNodeText, 'collective node renderer');

const roleCss = String.raw`

/* V27 collective-node treatment */
.person.role-collective .node{fill:rgba(255,255,255,.24);stroke:rgba(45,46,42,.34);stroke-width:1;stroke-dasharray:3.5 3}
.person.role-collective .label{font-weight:760;letter-spacing:.01em}
.collective-detail{font-size:8.8px;font-weight:570;text-anchor:middle;fill:#62645f;letter-spacing:-.01em;pointer-events:none}
`;
html = replaceOnce(html, '</style>', `${roleCss}\n</style>`, 'closing style tag');

const keyStart = html.indexOf('function renderPosterKey(svg,b,W,keyY){');
const keyEnd = html.indexOf('\nfunction setStatus(', keyStart);
if (keyStart < 0 || keyEnd < 0) throw new Error('Could not find poster key function.');
const posterKeyFunction = String.raw`function renderPosterKey(svg,b,W,keyY){
  const y=keyY;
  const outerX=PAGE_MARGIN, outerW=W-PAGE_MARGIN*2;
  const padX=30, padTop=34, gap=38;
  const keyW=Math.round((outerW-gap)*.48), noteW=outerW-keyW-gap;
  const macroIds=['primordial','night','titan','olympian'];
  const keyG=makeSvg('g',{class:'poster-key'});
  keyG.append(makeSvg('line',{class:'poster-lower-rule',x1:outerX,y1:y,x2:outerX+outerW,y2:y}));
  svg.append(keyG);
  const headingFont="font-family: Georgia, 'Times New Roman', serif";
  const bodyFont='font-family:'+currentTypeface();
  const keyHeading=makeSvg('text',{x:outerX+padX,y:y+padTop+10,class:'poster-key-note-head'});
  keyHeading.textContent='Colour groups';
  keyHeading.setAttribute('style',headingFont);
  keyG.append(keyHeading);
  for(let ci=0;ci<macroIds.length;ci++){
    const mid=macroIds[ci], def=MACRO_GROUPS[mid];
    const col=ci%2, row=Math.floor(ci/2);
    const x=outerX+padX+col*(keyW-padX*2)/2;
    const yy=y+padTop+55+row*46;
    keyG.append(makeSvg('rect',{x,y:yy-15,width:28,height:18,rx:5,ry:5,fill:def.color,'fill-opacity':.72,stroke:'rgba(20,20,18,.08)','stroke-width':.7}));
    const name=makeSvg('text',{x:x+39,y:yy,class:'poster-key-row-name'});
    name.textContent=def.label;
    name.setAttribute('style',bodyFont+';font-size:14px;font-weight:620');
    keyG.append(name);
  }
  const noteX=outerX+keyW+gap, noteG=makeSvg('g',{class:'poster-note'});
  noteG.append(makeSvg('line',{class:'poster-lower-divider',x1:noteX-gap/2,y1:y+24,x2:noteX-gap/2,y2:y+KEY_PANEL_H-12}));
  svg.append(noteG);
  const heading=makeSvg('text',{x:noteX+padX,y:y+padTop+10,class:'poster-key-note-head'});
  heading.textContent='How to read the family map';
  heading.setAttribute('style',bodyFont);
  noteG.append(heading);
  const firstY=y+padTop+48;
  noteG.append(makeSvg('circle',{cx:noteX+padX+10,cy:firstY-5,r:10.5,fill:'#555750',stroke:'rgba(20,20,18,.10)','stroke-width':.7}));
  const parentMark=makeSvg('text',{x:noteX+padX+10,y:firstY-5,dy:'.35em','text-anchor':'middle',fill:'#fff','font-size':'10.5px','font-weight':'800'});
  parentMark.textContent='P';
  parentMark.setAttribute('style',bodyFont+';dominant-baseline:auto');
  noteG.append(parentMark);
  const lines=wrapSvgText(noteG,'marks a parent. The connected family region contains their direct children.',noteX+padX+31,firstY,noteW-padX*2-31,18,'poster-key-note',bodyFont);
  const dividerY=firstY+Math.max(1,lines)*18+9;
  noteG.append(makeSvg('line',{class:'poster-divider',x1:noteX+padX,y1:dividerY,x2:noteX+noteW-padX,y2:dividerY}));
  const overlapLines=wrapSvgText(noteG,'Where two parent regions overlap, the enclosed figures are children of both. Darker fields show immediate families.',noteX+padX,dividerY+23,noteW-padX*2,17,'poster-key-note',bodyFont);
  const footY=dividerY+23+Math.max(1,overlapLines)*17+12;
  wrapSvgText(noteG,'* Dashed boxes represent named collectives. Parentage varies across ancient sources.',noteX+padX,footY,noteW-padX*2,14,'poster-key-note','font-family:'+currentTypeface()+';font-size:10.5px;font-weight:520;fill:#77746d');
}
`;
html = html.slice(0, keyStart) + posterKeyFunction + html.slice(keyEnd);

html = html.replaceAll("a.download='greek_theogony_poster_v27_0.svg'", "a.download='greek_theogony_extended_v27_0.svg'");
html = html.replaceAll("setStatus('Downloaded greek_theogony_poster_v27_0.svg.')", "setStatus('Downloaded greek_theogony_extended_v27_0.svg.')");

await writeFile(resolve(outputHtmlPath), html, 'utf8');
await writeFile(resolve(outputLayoutPath), `${JSON.stringify(layout, null, 2)}\n`, 'utf8');
console.log(`Built ${resolve(outputHtmlPath)} with ${people.length} figures (${additions.people.length} extended-theogony additions).`);
