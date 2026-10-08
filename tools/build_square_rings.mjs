import { readFile, writeFile } from 'node:fs/promises';

// A separate experiment derived from the current poster, including its genealogy.
const source = await readFile('poster/layout_editor_greek_theogony_extended_v27_0.html', 'utf8');
const savedLayout = JSON.parse(await readFile('data/layout32.json', 'utf8'));
const people = JSON.parse(source.match(/const PEOPLE_RAW = (.*);\nconst INITIAL_LAYOUT/)[1]);
const original = JSON.parse(source.match(/const INITIAL_LAYOUT = (.*);\nconst STYLES/)[1]);
const sourceStyles = JSON.parse(source.match(/const STYLES = (.*);\nconst MACRO_GROUPS/)[1]);
const byId = Object.fromEntries(people.map(p => [p.id, p]));
// User-edited arrangement. The full coordinate map came from layout7.json;
// later layout files supply only the coordinates that changed.
const userPositions = {"chaos":[0,0],"tartarus":[-2,-2],"nyx":[2,-2],"erebus":[1,-2],"eros":[0,-2],"gaia":[0,2],"echidna":[-1,-4],"moirai":[4,0],"hypnos":[4,-2],"thanatos":[4,-1],"moros":[4,-3],"keres":[4,1],"nemesis":[4,-4],"aether":[2,-4],"charon":[0,-4],"eris":[3,-4],"hemera":[1,-4],"hesperides":[4,2],"uranus":[0,4],"pontus":[-4,-3],"ourea":[-4,-4],"typhon":[-2,-4],"eurybia":[-6,-2],"clymene":[-6,6],"iapetus":[-6,5],"aphrodite":[6,5],"phoebe":[-2,6],"coeus":[-6,-1],"crius":[-6,3],"cronus":[0,6],"tethys":[-6,2],"rhea":[1,6],"oceanus":[-3,6],"themis":[-1,6],"hyperion":[-6,1],"mnemosyne":[4,6],"theia":[-6,0],"gigantes":[6,6],"erinyes":[3,6],"elder_cyclopes":[2,6],"hecatoncheires":[5,6],"ceto":[-6,-5],"thaumas":[-6,-4],"phorcys":[-6,-3],"nereus":[-6,-6],"asteria":[-8,-2],"perses":[-8,-4],"epimetheus":[-8,6],"prometheus":[-8,5],"atlas":[-8,7],"eurynome":[8,8],"semele":[6,8],"poseidon":[-7,8],"hera":[-5,8],"zeus":[0,8],"demeter":[-3,8],"metis":[3,8],"hades":[-8,8],"maia":[5,8],"hestia":[-6,8],"leto":[2,8],"selene":[-8,0],"eos":[-8,1],"helios":[-8,-1],"doris":[-8,-5],"hecate":[-10,-3],"charites":[8,10],"dionysus":[6,10],"hephaestus":[-10,10],"ares":[-8,10],"hebe":[-7,10],"persephone":[-3,10],"athena":[2,10],"hermes":[5,10],"artemis":[0,10],"apollo":[1,10],"muses":[4,10],"horae":[7,10],"nereids":[-10,-6]};
Object.assign(userPositions,{"tartarus":[1,2],"echidna":[2,3],"moirai":[3,-2],"hypnos":[4,-4],"thanatos":[4,-3],"moros":[3,-3],"keres":[4,-2],"nemesis":[3,-4],"aether":[2,-3],"charon":[0,-3],"eris":[2,-4],"hemera":[1,-3],"hesperides":[4,-1],"pontus":[-4,1],"ourea":[-1,3],"typhon":[1,3],"eurybia":[-6,1],"coeus":[-6,2],"crius":[-2,5],"tethys":[-3,5],"hyperion":[-6,4],"mnemosyne":[6,6],"theia":[-6,3],"gigantes":[5,6],"hecatoncheires":[4,6],"ceto":[-5,-2],"thaumas":[-5,-3],"phorcys":[-5,-4],"nereus":[-6,0],"asteria":[-8,2],"perses":[-8,1],"selene":[-8,3],"eos":[-7,4],"helios":[-8,4],"doris":[-8,-1],"hecate":[-9,2],"nereids":[-9,0]});
Object.assign(userPositions,{"erebus":[-2,-2],"eros":[-2,-1],"hypnos":[1,-3],"thanatos":[-1,-3],"keres":[3,0],"nemesis":[0,-3],"aether":[-3,-2],"charon":[-2,-3],"eris":[2,-3],"hemera":[-3,-3],"hesperides":[3,-1],"uranus":[0,3],"pontus":[-4,2],"ourea":[1,3],"typhon":[3,3],"eurybia":[-6,3],"clymene":[6,1],"iapetus":[6,2],"aphrodite":[1,5],"phoebe":[-6,6],"coeus":[-6,5],"crius":[-6,4],"tethys":[-5,6],"oceanus":[-4,6],"themis":[6,6],"hyperion":[6,3],"mnemosyne":[6,5],"theia":[6,4],"erinyes":[2,6],"elder_cyclopes":[4,6],"hecatoncheires":[3,6],"ceto":[-5,3],"thaumas":[-5,2],"phorcys":[-5,1],"nereus":[-6,2],"asteria":[-7,5],"perses":[-7,4],"epimetheus":[8,1],"prometheus":[7,1],"atlas":[7,2],"eurynome":[-5,7],"semele":[6,7],"poseidon":[-1,7],"hera":[0,7],"zeus":[2,7],"demeter":[1,7],"metis":[4,7],"hades":[-2,7],"maia":[5,7],"hestia":[-3,7],"leto":[3,7],"selene":[8,3],"eos":[7,3],"helios":[7,4],"doris":[-4,7],"hecate":[-9,4],"charites":[-5,9],"dionysus":[6,9],"hephaestus":[0,10],"ares":[-1,9],"hebe":[0,9],"persephone":[1,9],"athena":[4,9],"hermes":[5,9],"artemis":[2,9],"apollo":[3,9],"muses":[9,5],"horae":[9,6],"nereids":[-9,3]});
Object.assign(userPositions,{"nyx":[0,-1],"eurybia":[-4,0],"clymene":[4,-3],"iapetus":[4,-2],"phoebe":[-4,3],"coeus":[-4,2],"crius":[-4,1],"cronus":[0,4],"rhea":[-1,4],"oceanus":[-4,4],"themis":[4,3],"hyperion":[4,-1],"theia":[4,0],"nereus":[-4,-1],"perses":[-5,1],"epimetheus":[6,-3],"prometheus":[5,-3],"atlas":[5,-2],"semele":[6,5],"poseidon":[-2,5],"hera":[1,5],"zeus":[0,5],"demeter":[2,5],"metis":[3,5],"hades":[-1,5],"maia":[4,5],"hestia":[-1,6],"leto":[5,5],"selene":[6,-1],"eos":[5,-1],"helios":[5,0],"doris":[-5,4],"charites":[-3,7],"dionysus":[6,7],"hephaestus":[1,8],"ares":[1,7],"hebe":[0,7],"persephone":[2,7],"artemis":[5,7],"apollo":[5,8],"muses":[7,2],"horae":[7,3]});
Object.assign(userPositions,{"chaos":[0,0],"tartarus":[1,1],"nyx":[0,-1],"erebus":[-1,-1],"eros":[-1,0],"gaia":[0,1],"echidna":[1,2],"moirai":[2,-1],"hypnos":[0,-2],"thanatos":[-2,-2],"moros":[2,-2],"keres":[2,1],"nemesis":[-1,-2],"aether":[-2,1],"charon":[-2,-1],"eris":[1,-2],"hemera":[-2,0],"hesperides":[2,0],"uranus":[-1,2],"pontus":[-2,2],"ourea":[0,2],"typhon":[2,2],"eurybia":[-4,0],"clymene":[4,-3],"iapetus":[4,-2],"aphrodite":[1,3],"phoebe":[-4,3],"coeus":[-4,2],"crius":[-4,1],"cronus":[0,4],"tethys":[-3,4],"rhea":[-1,4],"oceanus":[-4,4],"themis":[4,3],"hyperion":[4,-1],"mnemosyne":[4,2],"theia":[4,0],"gigantes":[4,4],"erinyes":[1,4],"elder_cyclopes":[3,4],"hecatoncheires":[2,4],"ceto":[-3,2],"thaumas":[-3,1],"phorcys":[-3,0],"nereus":[-4,-1],"asteria":[-5,3],"perses":[-5,1],"epimetheus":[6,-3],"prometheus":[5,-3],"atlas":[5,-2],"eurynome":[-3,5],"semele":[6,5],"poseidon":[-2,5],"hera":[1,5],"zeus":[0,5],"demeter":[2,5],"metis":[3,5],"hades":[-1,5],"maia":[4,5],"hestia":[-1,6],"leto":[5,5],"selene":[6,-1],"eos":[5,-1],"helios":[5,0],"doris":[-5,4],"hecate":[-7,3],"charites":[-3,7],"dionysus":[6,7],"hephaestus":[1,8],"ares":[1,7],"hebe":[0,7],"persephone":[2,7],"athena":[3,7],"hermes":[4,7],"artemis":[5,7],"apollo":[5,8],"muses":[7,2],"horae":[7,3],"nereids":[-7,2]});
// These are layout constraints, NOT additional genealogy claims. Their ancestry
// is absent in this dataset. Place them alongside their recorded co-parent.
const anchors = { clymene: 'iapetus', leto: 'zeus', metis: 'zeus', maia: 'zeus', semele: 'zeus' };
const depths = {}, visiting = new Set();
function depth(id) {
  if (depths[id] !== undefined) return depths[id];
  if (visiting.has(id)) throw new Error(`Cycle at ${id}`);
  visiting.add(id);
  const parents = byId[id].relations.filter(r => r.boundary_include).map(r => r.parent_id);
  if (!parents.length && id !== 'chaos' && !anchors[id]) throw new Error(`Unplaced root: ${id}`);
  const result = anchors[id] ? depth(anchors[id]) : parents.length ? 1 + Math.max(...parents.map(depth)) : 0;
  visiting.delete(id);
  return depths[id] = result;
}
people.forEach(p => depth(p.id));
const levels = Array.from({ length: Math.max(...Object.values(depths)) + 1 }, (_, d) => people.filter(p => depths[p.id] === d).map(p => p.id));
// Radial widths by ancestry level. The origin is a single cell. Levels 1 and
// 2 are one cell deep; the later levels retain two lanes.
const levelWidths=[0,1,1,2,2,2];
if(levelWidths.length!==levels.length)throw new Error(`Expected ${levels.length} level widths, found ${levelWidths.length}`);
const ringBands=[];
let outerRadius=0;
for(let level=0;level<levelWidths.length;level++){
  if(level===0){ringBands.push({inner:0,outer:0});continue;}
  const inner=outerRadius+1;
  outerRadius=inner+levelWidths[level]-1;
  ringBands.push({inner,outer:outerRadius});
}
const radii=ringBands.map(band=>band.outer);
const nodes = {}, slots = [];
const angle = p => Math.atan2(p.y - original.nodes.chaos.y, p.x - original.nodes.chaos.x);
for (let d = 0; d < levels.length; d++) {
  const band=ringBands[d];
  const cells = [];
  for (let x = -band.outer; x <= band.outer; x++) for (let y = -band.outer; y <= band.outer; y++) {
    const radius=Math.max(Math.abs(x),Math.abs(y));
    if(radius>=band.inner&&radius<=band.outer)cells.push({x,y});
  }
  if(cells.length<levels[d].length)throw new Error(`Level ${d} has ${levels[d].length} figures but only ${cells.length} cells`);
  cells.sort((a,b) => Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x));
  const ids = [...levels[d]].sort((a,b) => angle(original.nodes[a])-angle(original.nodes[b]));
  ids.forEach((id,i) => {
    const cell = cells[Math.floor(i*cells.length/ids.length)];
    nodes[id] = { ...original.nodes[id], ...cell };
  });
  slots.push(cells);
}
// Minimise family distances while retaining strict ring membership. Shared
// parents attract siblings; each family contributes comparable total weight.
const pairs = [];
for (const parent of people) {
  const children = people.filter(p => p.relations.some(r => r.parent_id === parent.id && r.boundary_include));
  for (const child of children) pairs.push([parent.id, child.id, 3 / Math.sqrt(children.length)]);
  for (let i=0;i<children.length;i++) for (let j=i+1;j<children.length;j++) pairs.push([children[i].id,children[j].id,1/children.length]);
}
function cost() { return pairs.reduce((s,[a,b,w]) => s+w*(Math.abs(nodes[a].x-nodes[b].x)+Math.abs(nodes[a].y-nodes[b].y)),0); }
let score = cost();
for (let pass=0;pass<12;pass++) {
  let improved = false;
  for (let d=1;d<levels.length;d++) for (const id of levels[d]) {
    for (const cell of slots[d]) {
      const other = levels[d].find(k => k!==id && nodes[k].x===cell.x && nodes[k].y===cell.y);
      const before = {x:nodes[id].x,y:nodes[id].y};
      Object.assign(nodes[id],cell);
      if(other) Object.assign(nodes[other],before);
      const next=cost();
      if(next < score-0.00001) { score=next; improved=true; }
      else { if(other) Object.assign(nodes[other],cell); Object.assign(nodes[id],before); }
    }
  }
  if(!improved) break;
}
const missingUserPositions=people.filter(p=>!userPositions[p.id]).map(p=>p.id);
const unknownUserPositions=Object.keys(userPositions).filter(id=>!byId[id]);
if(missingUserPositions.length||unknownUserPositions.length)throw new Error(`layout15 coordinate mismatch. Missing: ${missingUserPositions.join(', ')}; unknown: ${unknownUserPositions.join(', ')}`);

// Rectangular Hungarian assignment. It finds the minimum total displacement
// when several imported figures project to the same compressed cell.
function minimumCostAssignment(costs){
  const rows=costs.length,cols=costs[0].length;
  if(rows>cols)throw new Error(`Cannot assign ${rows} figures to ${cols} cells`);
  const u=Array(rows+1).fill(0),v=Array(cols+1).fill(0),p=Array(cols+1).fill(0),way=Array(cols+1).fill(0);
  for(let i=1;i<=rows;i++){
    p[0]=i;
    let j0=0;
    const minv=Array(cols+1).fill(Infinity),used=Array(cols+1).fill(false);
    do{
      used[j0]=true;
      const i0=p[j0];
      let delta=Infinity,j1=0;
      for(let j=1;j<=cols;j++)if(!used[j]){
        const cur=costs[i0-1][j-1]-u[i0]-v[j];
        if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
        if(minv[j]<delta){delta=minv[j];j1=j;}
      }
      for(let j=0;j<=cols;j++){
        if(used[j]){u[p[j]]+=delta;v[j]-=delta;}
        else minv[j]-=delta;
      }
      j0=j1;
    }while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  const assignment=Array(rows).fill(-1);
  for(let j=1;j<=cols;j++)if(p[j])assignment[p[j]-1]=j-1;
  return assignment;
}

const layout15Bands=ringBands;
const initialLevelBounds=structuredClone(savedLayout.level_bounds);
for(let level=0;level<levels.length;level++){
  const ids=levels[level],sourceBand=layout15Bands[level],targetBand=ringBands[level];
  const desired=ids.map(id=>{
    const [x,y]=userPositions[id],sourceRadius=Math.max(Math.abs(x),Math.abs(y));
    if(sourceRadius<sourceBand.inner||sourceRadius>sourceBand.outer)throw new Error(`${id} from layout15 is outside level ${level}`);
    const laneFromOuter=sourceBand.outer-sourceRadius;
    const targetRadius=Math.max(targetBand.inner,targetBand.outer-laneFromOuter);
    const scale=sourceRadius?targetRadius/sourceRadius:0;
    return {x:x*scale,y:y*scale,radius:targetRadius};
  });
  const costs=desired.map((point,row)=>slots[level].map((cell,column)=>{
    const radius=Math.max(Math.abs(cell.x),Math.abs(cell.y));
    const lanePenalty=Math.abs(radius-point.radius)*100000;
    const displacement=((cell.x-point.x)**2+(cell.y-point.y)**2)*100;
    return lanePenalty+displacement+column*1e-4+row*1e-7;
  }));
  let assignment;
  if(slots[level].length===ids.length){
    // A full one-lane ring has no spare cells. Preserve circular order so
    // nearby relatives do not leapfrog one another during compression.
    const rows=desired.map((point,index)=>({index,angle:Math.atan2(point.y,point.x)})).sort((a,b)=>a.angle-b.angle);
    let bestCost=Infinity,bestOffset=0;
    for(let offset=0;offset<slots[level].length;offset++){
      let total=0;
      for(let rank=0;rank<rows.length;rank++)total+=costs[rows[rank].index][(rank+offset)%slots[level].length];
      if(total<bestCost){bestCost=total;bestOffset=offset;}
    }
    assignment=Array(ids.length);
    for(let rank=0;rank<rows.length;rank++)assignment[rows[rank].index]=(rank+bestOffset)%slots[level].length;
  }else assignment=minimumCostAssignment(costs);
  ids.forEach((id,index)=>Object.assign(nodes[id],slots[level][assignment[index]]));
}
const savedIds=Object.keys(savedLayout.nodes||{}),expectedIds=people.map(person=>person.id);
const missingSavedIds=expectedIds.filter(id=>!savedLayout.nodes?.[id]);
const unknownSavedIds=savedIds.filter(id=>!byId[id]);
if(missingSavedIds.length||unknownSavedIds.length)throw new Error(`layout32 coordinate mismatch. Missing: ${missingSavedIds.join(', ')}; unknown: ${unknownSavedIds.join(', ')}`);
if(!Array.isArray(initialLevelBounds)||initialLevelBounds.length!==levels.length)throw new Error('layout32 has invalid level_bounds');
for(const id of expectedIds)Object.assign(nodes[id],savedLayout.nodes[id]);
const inside=(point,bounds)=>point.x>=bounds.left&&point.x<=bounds.right&&point.y>=bounds.top&&point.y<=bounds.bottom;
for(const id of expectedIds){
  const level=depths[id],point=nodes[id];
  if(!inside(point,initialLevelBounds[level])||(level>0&&inside(point,initialLevelBounds[level-1])))throw new Error(`${id} from layout32 is outside level ${level}`);
}
const projectedLayout30=structuredClone(nodes);
score=cost();
const occupied = new Set();
for(const p of people) {
  const n=nodes[p.id], key=`${n.x},${n.y}`;
  if(occupied.has(key)) throw new Error(`Collision at ${key}`);
  occupied.add(key);
  for(const rel of p.relations.filter(r=>r.boundary_include)) {
    if(depths[rel.parent_id]>=depths[p.id]) throw new Error(`Ancestry reversal: ${p.id}`);
  }
}
const layout={...original,nodes,pinned_ids:[...(savedLayout.pinned_ids||[])],grid:{...savedLayout.grid},level_bounds:structuredClone(initialLevelBounds)};
let html=source.replace(/const INITIAL_LAYOUT = .*;\nconst STYLES/,`const INITIAL_LAYOUT = ${JSON.stringify(layout)};\nconst STYLES`);
// Selected family routes, inspired by the companion metro map. Each owner has
// one route colour; overlapping parent regions still show shared ancestry.
const branchGroups={
  origins:{label:'Origins',color:'#8C607D',setback:4,members:['chaos','eros','tartarus']},
  primordial:{label:'Earth & sky',color:'#D94E64',setback:4,members:['cronus','gaia','uranus','ourea','aphrodite']},
  monsters:{label:'Giants & monsters',color:'#596C78',setback:5,members:['echidna','typhon','hecatoncheires','elder_cyclopes','gigantes']},
  night:{label:'Night & underworld',color:'#D8A21B',setback:8,members:['erebus','nyx','aether','hemera','charon','hypnos','thanatos','moros','erinyes','moirai','keres','nemesis','eris','hesperides']},
  sea:{label:'Sea',color:'#258B9B',setback:5,members:['pontus','thaumas','phorcys','ceto','nereus','eurybia']},
  ocean:{label:'Ocean & nymphs',color:'#3265A8',setback:6,members:['oceanus','tethys','doris','nereids','eurynome','charites']},
  light:{label:'Sun, moon & dawn',color:'#BD5875',setback:7,members:['hyperion','theia','helios','selene','eos']},
  iapetus:{label:'Prometheus & Atlas',color:'#735BCB',setback:7,members:['iapetus','clymene','atlas','prometheus','epimetheus']},
  hecate:{label:'Magic & prophecy',color:'#667E4C',setback:7,members:['crius','coeus','phoebe','perses','asteria','hecate']},
  olympian:{label:'Olympians',color:'#E8793F',setback:9,members:['rhea','themis','mnemosyne','hestia','demeter','hera','hades','poseidon','zeus','athena','metis','ares','hebe','persephone','hephaestus','apollo','artemis','leto','hermes','maia','dionysus','semele','muses','horae']}
};
const branchMembers=Object.values(branchGroups).flatMap(group=>group.members);
if(branchMembers.length!==people.length||new Set(branchMembers).size!==people.length||expectedIds.some(id=>!branchMembers.includes(id)))throw new Error('Family routes must cover every figure exactly once');
const branchFor=Object.fromEntries(Object.entries(branchGroups).flatMap(([branch,group])=>group.members.map(id=>[id,branch])));
html=html.replace(/const MACRO_GROUPS = [\s\S]*?;\n\n\nconst PALETTES/,`const MACRO_GROUPS = ${JSON.stringify(branchGroups,null,2)};\n\n\nconst PALETTES`);
const routeColors=Object.fromEntries(Object.entries(branchGroups).map(([id,group])=>[id,group.color]));
function softenedColors(colors,amount){return Object.fromEntries(Object.entries(colors).map(([id,color])=>[id,id==='night'?color:'#'+[1,3,5].map(start=>Math.round(parseInt(color.slice(start,start+2),16)*(1-amount)+255*amount).toString(16).padStart(2,'0')).join('')]));}
function palettesFor(colors){return {jewel:{label:'Family routes',colors},editorial:{label:'Soft family routes',colors:softenedColors(colors,.2)},fresco:{label:'Pale family routes',colors:softenedColors(colors,.35)}};}
const routePalettes=palettesFor(routeColors);
html=html.replace(/const PALETTES = [\s\S]*?;\nconst TYPEFACE_STACKS/,`const PALETTES = ${JSON.stringify(routePalettes,null,2)};\nconst TYPEFACE_STACKS`);
const extraFamilyStyles={oceanus:{color:'#587899'},tethys:{color:'#7865a0'},crius:{color:'#645696'},phoebe:{color:'#815f9d'},mnemosyne:{color:'#7254a2'},themis:{color:'#8b639a'}};
const squareStyles=Object.fromEntries(Object.entries({...sourceStyles,...extraFamilyStyles}).map(([id,style])=>[id,{...style,color:branchGroups[branchFor[id]].color}]));
const visibleParents=[...new Set(people.flatMap(person=>(person.relations||[]).filter(relation=>relation.boundary_include).map(relation=>relation.parent_id)))];
const missingStyles=visibleParents.filter(id=>!squareStyles[id]);
if(missingStyles.length)throw new Error(`Visible parents without family styles: ${missingStyles.join(', ')}`);
html=html.replace(/const STYLES = .*;\nconst MACRO_GROUPS/,`const STYLES = ${JSON.stringify(squareStyles)};\nconst MACRO_GROUPS`);
const sourceFamilyOrder=JSON.parse(source.match(/const FAMILY_OWNER_ORDER = (.*);/)[1]);
const squareFamilyOrder=[...sourceFamilyOrder,...visibleParents.filter(id=>!sourceFamilyOrder.includes(id))];
html=html.replace(/const FAMILY_OWNER_ORDER = .*?;/,`const FAMILY_OWNER_ORDER = ${JSON.stringify(squareFamilyOrder)};`);
html=html.replaceAll('greek-poster-design-v27','greek-square-rings-v1');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Greek Theogony</title>');
html=html.replaceAll('Greek Theogony, Extended','Greek Theogony');
html=html.replaceAll('An extended visual map of ancient Greek gods','A visual map of ancient Greek gods');
html=html.replaceAll('greek_theogony_extended_v27_0.svg','greek_theogony_square_rings.svg');
const levelNames=['Origin','Primordials','Primordial children','Titans and contemporaries','Olympians and younger Titans','Olympian children and contemporaries'];
// Fail on source drift rather than silently dropping an editing constraint.
function replaceRequired(before,after){
  if(!html.includes(before))throw new Error('Missing source fragment: '+before);
  html=html.replace(before,after);
}
replaceRequired("  const kicker=makeSvg('text',{class:'poster-header-kicker',x:PAGE_MARGIN,y:PAGE_MARGIN+14});\n  kicker.textContent='AN EXTENDED MAP OF THE ANCIENT GREEK GODS';\n  svg.append(kicker);\n",'');
replaceRequired("{class:'poster-header-title',x:PAGE_MARGIN,y:PAGE_MARGIN+76}","{class:'poster-header-title',x:PAGE_MARGIN,y:PAGE_MARGIN+56}");
replaceRequired('PAGE_MARGIN = 48, HEADER_H = 118,','PAGE_MARGIN = 48, HEADER_H = 98,');
replaceRequired("{class:'poster-header-logo',x:W-PAGE_MARGIN-60,y:PAGE_MARGIN+10,width:60,height:40,","{class:'poster-header-logo',x:W-PAGE_MARGIN-102,y:PAGE_MARGIN-4,width:102,height:68,");
replaceRequired("  right.textContent='GREEK THEOGONY · EXTENDED PROTOTYPE · 31 AUG 2026';\n  svg.append(right);\n",'');
replaceRequired("  const right=makeSvg('text',{class:'poster-footer-right',x:W-PAGE_MARGIN,y:y+30,'text-anchor':'end'});\n",'');
// The drawn grid fits the figures, family regions and ring guides, widened to
// be symmetric about Chaos so the origin sits on the page's centre line.
// Routing keeps the padded editor bounds.
// The page is A-series (1:√2). The white panel absorbs the difference, with
// the diagram centred in it; LEFT and TOP are set on each render.
replaceRequired('const LEFT = PAGE_MARGIN + PANEL_PAD_X + DIAGRAM_GUTTER_X;\nconst TOP = PAGE_MARGIN + HEADER_H + PANEL_PAD_Y + DIAGRAM_GUTTER_Y;',
  'let LEFT = PAGE_MARGIN + PANEL_PAD_X + DIAGRAM_GUTTER_X;\nlet TOP = PAGE_MARGIN + HEADER_H + PANEL_PAD_Y + DIAGRAM_GUTTER_Y;');
replaceRequired(`  const panelW=PANEL_PAD_X*2+DIAGRAM_GUTTER_X*2+cols*CELL_W;
  const panelH=PANEL_PAD_Y*2+DIAGRAM_GUTTER_Y*2+rows*CELL_H;
  const W=PAGE_MARGIN*2+panelW;`,`  const gridW=PANEL_PAD_X*2+DIAGRAM_GUTTER_X*2+cols*CELL_W;
  const gridH=PANEL_PAD_Y*2+DIAGRAM_GUTTER_Y*2+rows*CELL_H;
  const chromeH=PAGE_MARGIN*2+HEADER_H+KEY_GAP+(showPosterKey?KEY_PANEL_H+KEY_GAP:0)+FOOTER_H;
  const fillX=Math.max(0,(chromeH+gridH)/Math.SQRT2-PAGE_MARGIN*2-gridW)/2;
  const fillY=Math.max(0,(PAGE_MARGIN*2+gridW)*Math.SQRT2-chromeH-gridH)/2;
  const panelW=gridW+fillX*2, panelH=gridH+fillY*2;
  LEFT=PAGE_MARGIN+PANEL_PAD_X+DIAGRAM_GUTTER_X+fillX;
  TOP=PAGE_MARGIN+HEADER_H+PANEL_PAD_Y+DIAGRAM_GUTTER_Y+fillY;
  const W=PAGE_MARGIN*2+panelW;`);
replaceRequired('function layoutBounds(){return boundsForEditor()}',`function layoutBounds(){
  const xs=[], ys=[], c=nodes.chaos;
  for(const n of Object.values(nodes)){xs.push(n.x);ys.push(n.y);}
  for(const mask of Object.values(currentMasks))for(const key of mask){const [x,y]=key.split(',').map(Number);xs.push(x);ys.push(y);}
  for(const edge of levelBounds.slice(0,-1)){xs.push(edge.left,edge.right);ys.push(edge.top,edge.bottom);}
  const rx=Math.max(c.x-Math.min(...xs),Math.max(...xs)-c.x);
  return {xMin:c.x-rx,xMax:c.x+rx,yMin:Math.min(...ys),yMax:Math.max(...ys)};
}`);
replaceRequired('function render(){',`const ANCESTRY_LEVELS=Object.freeze(${JSON.stringify(depths)});
const RING_RADII=Object.freeze(${JSON.stringify(radii)});
const RING_BANDS=Object.freeze(${JSON.stringify(ringBands)});
const LEVEL_NAMES=Object.freeze(${JSON.stringify(levelNames)});
const INITIAL_LEVEL_BOUNDS=Object.freeze(${JSON.stringify(initialLevelBounds)});
let levelBounds=structuredClone(INITIAL_LEVEL_BOUNDS);
function ringGuideRect(edge,b){
  const [x,y]=cellToPx(edge.left,edge.top,b);
  return {x,y,width:(edge.right-edge.left+1)*CELL_W,height:(edge.bottom-edge.top+1)*CELL_H};
}
function insideLevelBoundary(x,y,bounds){return x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom;}
function belongsToLevel(level,x,y,bounds=levelBounds){return insideLevelBoundary(x,y,bounds[level])&&(level===0||!insideLevelBoundary(x,y,bounds[level-1]));}
function validateLevelBounds(bounds,layout=nodes){
  if(!Array.isArray(bounds)||bounds.length!==LEVEL_NAMES.length)throw new Error('Invalid level_bounds field');
  for(let level=0;level<bounds.length;level++){
    const edge=bounds[level];
    if(!edge||!['left','right','top','bottom'].every(side=>Number.isInteger(edge[side])))throw new Error('Level '+level+' boundaries must use whole grid cells');
    if(edge.left>edge.right||edge.top>edge.bottom)throw new Error('Level '+level+' has an inverted boundary');
    if(level){const inner=bounds[level-1];if(edge.left>=inner.left||edge.right<=inner.right||edge.top>=inner.top||edge.bottom<=inner.bottom)throw new Error('Level '+level+' must remain at least one square outside level '+(level-1));}
  }
  for(const [id,n] of Object.entries(layout)){
    const level=ANCESTRY_LEVELS[id];
    if(level===undefined)throw new Error('Unknown figure: '+id);
    if(!Number.isInteger(n?.x)||!Number.isInteger(n?.y)||!belongsToLevel(level,n.x,n.y,bounds))throw new Error(people[id].name+' would fall outside level '+level+', '+LEVEL_NAMES[level]);
  }
  return bounds;
}
function ringMoveError(id,x,y,bounds=levelBounds){
  const level=ANCESTRY_LEVELS[id];
  if(level===undefined)return 'Unknown figure: '+id;
  if(!Number.isInteger(x)||!Number.isInteger(y)||!belongsToLevel(level,x,y,bounds))
    return people[id].name+' must stay on level '+level+', '+LEVEL_NAMES[level]+'. Stay within that square ring.';
  return '';
}
function validateRingLayout(layout,bounds=levelBounds){
  if(!layout||typeof layout!=='object'||Array.isArray(layout))throw new Error('Invalid nodes field');
  const occupied=new Set();
  for(const id of Object.keys(ANCESTRY_LEVELS)){
    if(!layout[id])throw new Error('Missing figure: '+people[id].name);
  }
  for(const [id,n] of Object.entries(layout)){
    const error=ringMoveError(id,n?.x,n?.y,bounds);if(error)throw new Error(error);
    const cell=n.x+','+n.y;if(occupied.has(cell))throw new Error('Two figures occupy '+cell);
    occupied.add(cell);
  }
  validateLevelBounds(bounds,layout);
}
function render(){`);
replaceRequired('  const occ=occupiedMap(nodes); const target=occ.get(`${gx},${gy}`);',
  '  const ringError=ringMoveError(drag.id,gx,gy);if(ringError){setStatus(ringError,true);return;}\n  const occ=occupiedMap(nodes); const target=occ.get(`${gx},${gy}`);');
replaceRequired('  const occ=occupiedMap(nodes), target=occ.get(`${nx},${ny}`);',
  '  const ringError=ringMoveError(selectedId,nx,ny);if(ringError){setStatus(ringError,true);return;}\n  const occ=occupiedMap(nodes), target=occ.get(`${nx},${ny}`);');
replaceRequired('try{const masks=computeAllMasks(layout);return {masks,score:computeLayoutScore(layout,masks)};}',
  'try{validateRingLayout(layout);const masks=computeAllMasks(layout);return {masks,score:computeLayoutScore(layout,masks)};}');
replaceRequired('    const a=randChoice(movable), b=randChoice(movable.filter(x=>x!==a));',
  "    const a=randChoice(movable), sameLevel=movable.filter(x=>x!==a&&ANCESTRY_LEVELS[x]===ANCESTRY_LEVELS[a]);\n    if(!sameLevel.length)return null;\n    const b=randChoice(sameLevel);");
replaceRequired('const before=snapshotState(); nodes=structuredClone(incoming.nodes);pinnedIds=new Set((incoming.pinned_ids||[]).filter(id=>nodes[id]));computeAllMasks(nodes);',
  "const candidate=structuredClone(incoming.nodes),candidateBounds=incoming.level_bounds===undefined?structuredClone(INITIAL_LEVEL_BOUNDS):structuredClone(incoming.level_bounds);validateRingLayout(candidate,candidateBounds);if(incoming.pinned_ids!==undefined&&!Array.isArray(incoming.pinned_ids))throw new Error('Invalid pinned_ids');computeAllMasks(candidate);\n    const before=snapshotState();nodes=candidate;levelBounds=candidateBounds;pinnedIds=new Set((incoming.pinned_ids||[]).filter(id=>nodes[id]));");
replaceRequired('  const id=selectedId||hoveredId;\n  const name=',
  "  const id=selectedId||hoveredId;\n  if(id){const level=ANCESTRY_LEVELS[id];document.getElementById('ringAssignment').textContent=people[id].name+' · Level '+level+' · '+LEVEL_NAMES[level];}else document.getElementById('ringAssignment').textContent='Drag a figure within its assigned ancestry level';\n  const name=");
html=html.replace('  // nodes\n',`  // Square contours mark ancestry depth, not historical dates or deity classes.
  // Guides run along cell edges, inside the gutter between figure boxes, so no
  // box straddles two levels. The ring key in the legend names each ring.
  levelBounds.forEach((edge,index)=>{
    if(index===levelBounds.length-1)return;
    const {x,y,width,height}=ringGuideRect(edge,b);
    svg.append(makeSvg('rect',{x,y,width,height,rx:Math.min(NODE_INSET_X,NODE_INSET_Y),fill:'none',stroke:'#66675f','stroke-opacity':.5,'stroke-width':1.6,'stroke-dasharray':'7 7',class:'ring-guide'}));
  });
  // nodes
`);
html=html.replace('</style>',`/* Fit the complete poster width on initial load; browser zoom remains available. */
#canvas{max-width:100%;height:auto}
.ring-guide{pointer-events:none}
#ringAssignment{position:fixed;bottom:48px;left:14px;z-index:20;background:#fffefa;padding:8px 12px;border:1px solid #d6d1c7;border-radius:8px;font-size:12px;pointer-events:none}
.status{position:fixed;z-index:20;max-width:calc(100vw - 50px)}
.experiment-controls{position:fixed;top:10px;left:10px;z-index:20;background:#fffefa;padding:8px 12px;border:1px solid #d6d1c7;border-radius:8px;font-size:12px;display:flex;gap:12px}
.layout-controls{position:fixed;top:10px;right:10px;z-index:20;display:flex;gap:8px;background:#fffefa;padding:6px;border:1px solid #d6d1c7;border-radius:8px}
@media(max-width:650px){.layout-controls{top:54px}}
.hide-ring-guides .ring-guide{display:none}
#canvas .person.role-collective .node,#canvas .person .stack-card{fill:rgba(255,255,255,.3);stroke:rgba(32,33,30,.24);stroke-width:1;stroke-dasharray:none}
</style>`);
html=html.replace('<body>',`<body><div class="experiment-controls"><a href="layout_editor_square_rings.html">Translucent fill</a><a href="layout_editor_square_rings_group_fill.html">Outlines</a><label><input type="checkbox" checked onchange="document.body.classList.toggle('hide-ring-guides',!this.checked)"> Ring guides</label></div>`);
// Move the existing controls out of the hidden development toolbar. Keeping
// their IDs preserves the original save/import handlers and keyboard shortcuts.
const saveControl='<button id="saveBtn">Save layout JSON</button>';
const importControl='<label class="file-label">Import layout<input id="importFile" type="file" accept="application/json,.json"></label>';
if(!html.includes(saveControl)||!html.includes(importControl)) throw new Error('Missing source layout controls');
html=html.replace(saveControl,'').replace(importControl,'');
html=html.replace('<body>',`<body><div class="layout-controls" aria-label="Layout files">${saveControl}${importControl}</div>`);
html=html.replace('<body>','<body><div id="ringAssignment" role="status"></div>');
html=html.replace('      <select id="parentCueMode"><option value="numbers" selected>P · parent marker</option></select>\n','');
html=html.replace('centerOnChaos();prepareExportBuffer();','prepareExportBuffer();');
html=html.replace('restoreAutoSave();buildLegend();','buildLegend();');
replaceRequired("    const rect=makeSvg('rect',{class:'node',x:0,y:0,width:w,height:h});",`    const stack=people[id].role==='collective'?6:0;
    if(stack)[[6,0],[3,3]].forEach(([sx,sy])=>g.append(makeSvg('rect',{class:'stack-card',x:sx,y:sy,width:w-stack,height:h-stack,rx:7,ry:7})));
    const rect=makeSvg('rect',{class:'node',x:0,y:stack,width:w-stack,height:h-stack});`);
replaceRequired('    svg.append(g);\n    if(treatment===',`    svg.append(g);
    for(const label of g.querySelectorAll('text')){
      const width=label.getBBox().width,room=w-stack-10;
      if(width>room)label.style.fontSize=(parseFloat(getComputedStyle(label).fontSize)*room/width).toFixed(2)+'px';
    }
    if(treatment===`);
// Each translucent family also gets a darker edge. Overlapping families sit in
// separate inset lanes so their edges run side by side rather than on top.
replaceRequired('    const BASE_FAMILY_INSET=3.0, FAMILY_INSET_STEP=2.25;','    const BASE_FAMILY_INSET=4, FAMILY_INSET_STEP=4.5;');
// Tighter corners; the inner radius follows the editor's corner slider.
replaceRequired('const REGION_CORNER_R = 17;','const REGION_CORNER_R = 12;');
replaceRequired('<input id="cornerRadius" type="range" value="17">','<input id="cornerRadius" type="range" value="12">');
replaceRequired('<span id="cornerRadiusVal">17</span>','<span id="cornerRadiusVal">12</span>');
replaceRequired('function getInnerCornerRadius(){ return Math.max(8, getOuterCornerRadius()*0.58); }','function getInnerCornerRadius(){ return Math.max(4, getOuterCornerRadius()*0.58); }');
replaceRequired('    const pts=clean.map(([x,y])=>cellToPx(x,y,b));'.trim(),
  'return roundedPolygonPath(clean.map(([x,y])=>cellToPx(x,y,b)));\n}\nfunction roundedPolygonPath(pts){');
// Lanes are set along each straight side of a family outline. Where a side
// runs alone it hugs its cell edge; where it shares a cell edge with
// same-facing sides of other families, those stretches are packed into
// successive lanes in family-level order, so nesting never flips. A side
// steps between lanes only at cell corners, which sit in the gutters.
replaceRequired('function familyShiftForLevel(',`function familySides(mask){
  return stitchLoops(boundarySegments(mask)).map(loop=>{
    const pts=loop.slice(0,-1), n=pts.length, sides=[];
    const dir=i=>{const a=pts[i],c=pts[(i+1)%n];return [c[0]-a[0],c[1]-a[1]];};
    const same=(u,v)=>u[0]===v[0]&&u[1]===v[1];
    let start=0;
    while(same(dir((start-1+n)%n),dir(start)))start++;
    let i=start;
    do{
      const d=dir(i);
      let j=i;
      while(same(dir(j),d))j=(j+1)%n;
      // Segments run clockwise on screen, so the interior is on the right.
      sides.push({from:pts[i],to:pts[j],normal:[-d[1],d[0]],horizontal:d[1]===0});
      i=j;
    }while(i!==start);
    return sides;
  });
}
function computeFamilySideLanes(masks,familyLevel){
  const byFamily={}, tracks=new Map();
  for(const gid of Object.keys(masks)){
    byFamily[gid]=familySides(masks[gid]);
    for(const side of byFamily[gid].flat()){
      const h=side.horizontal, along=h?0:1, across=h?1:0;
      Object.assign(side,{gid,lo:Math.min(side.from[along],side.to[along]),hi:Math.max(side.from[along],side.to[along])});
      const track=(h?'H':'V')+side.from[across]+'|'+side.normal[across];
      if(!tracks.has(track))tracks.set(track,[]);
      tracks.get(track).push(side);
    }
  }
  const rank=(p,q)=>(familyLevel[p.gid]||0)-(familyLevel[q.gid]||0)||p.gid.localeCompare(q.gid)||p.lo-q.lo;
  for(const sides of tracks.values()){
    for(const side of sides){
      const cuts=new Set([side.lo,side.hi]);
      for(const other of sides)if(other.gid!==side.gid)for(const v of [other.lo,other.hi])if(side.lo<v&&v<side.hi)cuts.add(v);
      const at=[...cuts].sort((p,q)=>p-q);
      side.pieces=at.slice(1).map((hi,k)=>({gid:side.gid,lo:at[k],hi}));
    }
    const pieces=sides.flatMap(side=>side.pieces).sort(rank);
    pieces.forEach((piece,index)=>{
      const used=new Set(pieces.slice(0,index).filter(o=>o.gid!==piece.gid&&o.lo<piece.hi&&piece.lo<o.hi).map(o=>o.lane));
      let lane=0;
      while(used.has(lane))lane++;
      piece.lane=lane;
    });
    for(const side of sides){
      const merged=[];
      for(const piece of side.pieces){
        const last=merged.at(-1);
        if(last&&last.lane===piece.lane)last.hi=piece.hi;
        else merged.push({lo:piece.lo,hi:piece.hi,lane:piece.lane});
      }
      // Pieces are listed in the side's direction of travel.
      const forward=side.horizontal?side.to[0]>side.from[0]:side.to[1]>side.from[1];
      side.pieces=forward?merged:merged.reverse();
    }
  }
  return byFamily;
}
// Half the length of the step between two lanes along one side, in px.
const LANE_STEP_HALF=6;
function familyLanePath(loops,b,laneInset){
  return loops.map(sides=>{
    const pts=[];
    sides.forEach((side,i)=>{
      const prev=sides[(i-1+sides.length)%sides.length], [x,y]=cellToPx(side.from[0],side.from[1],b);
      const dp=laneInset(prev.pieces.at(-1).lane), ds=laneInset(side.pieces[0].lane);
      pts.push([x+prev.normal[0]*dp+side.normal[0]*ds,y+prev.normal[1]*dp+side.normal[1]*ds]);
      const along=side.horizontal?0:1, sign=Math.sign(side.to[along]-side.from[along]);
      for(let k=1;k<side.pieces.length;k++){
        const cut=[...side.from];
        cut[along]=sign>0?side.pieces[k].lo:side.pieces[k].hi;
        const [cx,cy]=cellToPx(cut[0],cut[1],b);
        for(const [offset,lane] of [[-LANE_STEP_HALF,side.pieces[k-1].lane],[LANE_STEP_HALF,side.pieces[k].lane]]){
          const inset=laneInset(lane), point=[cx+side.normal[0]*inset,cy+side.normal[1]*inset];
          point[along]+=sign*offset;
          pts.push(point);
        }
      }
    });
    return roundedPolygonPath(pts);
  }).join(' ');
}
function familyShiftForLevel(`);
replaceRequired(`      const d=pathStringForMask(masks[gid],b);
      const level=setbackInfo.level[gid] || 0;
      const inset=BASE_FAMILY_INSET + level*FAMILY_INSET_STEP;
      const shift=familyShiftForLevel(level, SHIFT_SCALE);
      appendInsetFamilyRegion(svg,gid,d,macroDef.color,familyOpacity,inset,W,H,shift.dx,shift.dy);`,`      const level=setbackInfo.level[gid] || 0;
      const d=familyLanePath(sideLanes[gid],b,lane=>BASE_FAMILY_INSET+lane*FAMILY_INSET_STEP);
      appendInsetFamilyRegion(svg,gid,d,macroDef.color,familyOpacity);`);
replaceRequired('    const BASE_FAMILY_INSET=4, FAMILY_INSET_STEP=4.5;','    const BASE_FAMILY_INSET=4, FAMILY_INSET_STEP=4.5;\n    const sideLanes=computeFamilySideLanes(masks,setbackInfo.level);');
// Translucent layers mix unevenly, so paint order sets the visible colour.
// Older parents' families go underneath, so every cell shows its nearest
// parent's colour on top.
replaceRequired('    const familyOrder=Object.keys(groups).sort((a,bid)=>masks[bid].size-masks[a].size);',
  '    const familyOrder=Object.keys(groups).sort((a,bid)=>ANCESTRY_LEVELS[a]-ANCESTRY_LEVELS[bid]||masks[bid].size-masks[a].size);');
html=html.replace(/function appendInsetFamilyRegion\([\s\S]*?\n}\n/,()=>`function familyClip(svg,gid,d){
  const id='familyClip_'+gid.replace(/[^a-zA-Z0-9_-]/g,'_');
  let defs=svg.querySelector('defs');
  if(!defs){defs=makeSvg('defs',{});svg.append(defs);}
  const clip=makeSvg('clipPath',{id});
  clip.append(makeSvg('path',{d}));
  defs.append(clip);
  return \`url(#\${id})\`;
}
// The path is already inset per side; the edge is the inner half of a stroke
// clipped to the region.
function appendInsetFamilyRegion(svg,gid,d,fill,opacity){
  svg.append(makeSvg('path',{d,fill,'fill-opacity':opacity,class:'family-region','data-group':gid}));
  const edge=makeSvg('path',{d,fill:'none',class:'family-region family-edge','data-group':gid,'clip-path':familyClip(svg,gid,d)});
  edge.setAttribute('style',\`stroke:\${shadeColor(fill,.22)};stroke-opacity:.9;stroke-width:\${2*FAMILY_EDGE_WIDTH}\`);
  svg.append(edge);
}
const FAMILY_EDGE_WIDTH=1.8;
function shadeColor(hex,amount){
  return '#'+[1,3,5].map(start=>Math.round(parseInt(hex.slice(start,start+2),16)*(1-amount)).toString(16).padStart(2,'0')).join('');
}`);
replaceRequired("  const parentCueMode=document.getElementById('parentCueMode')?.value || 'numbers';\n  const familyMarkerMode=parentCueMode==='numbers'?'numbers':'off';",
  "  const familyMarkerMode='off';");
const markerHelpers=html;
html=html.replace(/function familyMarkerAnchor[\s\S]*?(?=function masksOverlap)/,'');
if(html===markerHelpers)throw new Error('Missing family marker helpers');
replaceRequired('function snapshotState(){return {nodes:structuredClone(nodes),pinned:[...pinnedIds]};}',
  'function snapshotState(){return {nodes:structuredClone(nodes),pinned:[...pinnedIds],levelBounds:structuredClone(levelBounds)};}');
replaceRequired('  if(s && s.nodes){nodes=structuredClone(s.nodes);pinnedIds=new Set(s.pinned||[]);}\n  else{nodes=structuredClone(s);}',
  '  if(s && s.nodes){nodes=structuredClone(s.nodes);pinnedIds=new Set(s.pinned||[]);levelBounds=structuredClone(s.levelBounds||INITIAL_LEVEL_BOUNDS);}\n  else{nodes=structuredClone(s);levelBounds=structuredClone(INITIAL_LEVEL_BOUNDS);}');
replaceRequired("document.getElementById('resetBtn').onclick=()=>{const before=snapshotState();nodes=structuredClone(initialNodes);pinnedIds=new Set();lastValidNodes=structuredClone(nodes);selectedId=null;localStorage.removeItem('greek-square-rings-v1');pushHistory(before);render();updateSidebar();setStatus('Reset to packaged layout.');};",
  "document.getElementById('resetBtn').onclick=()=>{const before=snapshotState();nodes=structuredClone(initialNodes);levelBounds=structuredClone(INITIAL_LEVEL_BOUNDS);pinnedIds=new Set();lastValidNodes=structuredClone(nodes);selectedId=null;localStorage.removeItem('greek-square-rings-v1');pushHistory(before);render();updateSidebar();setStatus('Reset to packaged layout and level boundaries.');};");
replaceRequired('  return {grid:{...grid,x_min:Math.min(...xs)-1,x_max:Math.max(...xs)+1,y_min:Math.min(...ys)-1,y_max:Math.max(...ys)+1},nodes:structuredClone(nodes),pinned_ids:[...pinnedIds]};',
  '  return {grid:{...grid,x_min:Math.min(...xs,levelBounds.at(-1).left)-1,x_max:Math.max(...xs,levelBounds.at(-1).right)+1,y_min:Math.min(...ys,levelBounds.at(-1).top)-1,y_max:Math.max(...ys,levelBounds.at(-1).bottom)+1},nodes:structuredClone(nodes),pinned_ids:[...pinnedIds],level_bounds:structuredClone(levelBounds)};');
replaceRequired("  const macroIds=['primordial','night','titan','olympian'];",'  const macroIds=Object.keys(MACRO_GROUPS);');
replaceRequired("keyHeading.textContent='Colour groups';","keyHeading.textContent='Groups';");
html=html.replace('Locked poster layout · Jewel Modern palette.','Locked poster layout · Family route colours.');
html=html.replace('>jewel modern<','>family routes<').replace('>cool editorial<','>soft family routes<').replace('>fresco modern<','>pale family routes<');
replaceRequired("  applyPalette('jewel');", "  applyPalette(document.getElementById('paletteMode')?.value||'jewel');");
replaceRequired('  for(const mid of Object.keys(MACRO_GROUPS)) MACRO_GROUPS[mid].color=p.colors[mid];',
  '  for(const mid of Object.keys(MACRO_GROUPS)) MACRO_GROUPS[mid].color=p.colors[mid];\n  for(const [gid,style] of Object.entries(STYLES))style.color=p.colors[MEMBER_TO_MACRO[gid]];');
// Thematic groups can occupy disconnected areas; family routing remains strict.
replaceRequired('  if(endKey===null) throw new Error(`Could not route boundary from ${start}`);',
  '  if(endKey===null){if(options.allowDisconnected)return [start];throw new Error(`Could not route boundary from ${start}`);}');
replaceRequired('    const path=shortestPathToMask(targetCells.get(id),mask,blocked,b);',
  '    const path=shortestPathToMask(targetCells.get(id),mask,blocked,b,{allowDisconnected:true});');
replaceRequired('  const macroMasks=computeMacroMasks(masks);\n  if(showFills){',
  '  if(showFills){\n    const macroMasks=computeMacroMasks(masks);');
// Larger poster legend text, with enough height for wrapped explanatory notes.
replaceRequired('KEY_PANEL_H = 220','KEY_PANEL_H = 470');
const keyStart=html.indexOf('function renderPosterKey(');
const keyEnd=html.indexOf('function setStatus(',keyStart);
let keyMarkup=html.slice(keyStart,keyEnd);
keyMarkup=keyMarkup.replace('const padX=30, padTop=34, gap=38;', 'const padX=30, padTop=40, gap=38;')
  .replace("const bodyFont='font-family:'+currentTypeface();", "const bodyFont='font-family:'+currentTypeface()+';font-size:20px';")
  .replace("heading.textContent='How to read the family map';","heading.textContent='Reading the map';")
  .replace("keyHeading.setAttribute('style',headingFont);", "keyHeading.setAttribute('style',bodyFont+';font-size:26px');")
  .replace("  const headingFont=\"font-family: Georgia, 'Times New Roman', serif\";\n",'')
  .replace("keyG.append(makeSvg('rect',{x,y:yy-15,width:28,height:18,rx:5,ry:5,fill:def.color,'fill-opacity':.72,stroke:'rgba(20,20,18,.08)','stroke-width':.7}));",
    `keyG.append(makeSvg('rect',{x,y:yy-19,width:38,height:26,rx:6,ry:6,fill:def.color,'fill-opacity':.72,stroke:shadeColor(def.color,.22),'stroke-opacity':.9,'stroke-width':FAMILY_EDGE_WIDTH}));`)
  .replace("heading.setAttribute('style',bodyFont);", "heading.setAttribute('style',bodyFont+';font-size:26px');")
  .replace('padTop+55+row*46','padTop+80+row*80')
  .replace('{x:x+39,y:yy,','{x:x+52,y:yy,')
  .replace('font-size:14px;font-weight:620','font-size:20px;font-weight:600')
  .replace('const keyW=Math.round((outerW-gap)*.48), noteW=outerW-keyW-gap;',
    'const ringW=ringKeyWidth(padX), keyW=Math.round((outerW-ringW-gap*2)*.55), noteW=outerW-keyW-ringW-gap*2;')
  .replace('  const noteX=outerX+keyW+gap,',
    '  renderRingKey(svg,outerX+keyW+gap,y,padX,padTop,gap,bodyFont);\n  const noteX=outerX+keyW+ringW+gap*2,');
const NOTE_PARAGRAPHS=["Ancestry runs outwards from Chaos at the centre, one ring per generation.", "A coloured region surrounds the children of one parent. It is drawn in that parent's group colour. Where two regions overlap, the figures inside share both parents.", "Stacked cards are collectives. Leto, Maia, Metis, Semele and Clymene have no recorded parents here, so each sits in the same ring as their partner."];
const noteStart=keyMarkup.indexOf('  const firstY=');
if(noteStart<0)throw new Error('Missing key note fragment');
keyMarkup=keyMarkup.slice(0,noteStart)+`  let noteY=y+padTop+70;
  NOTE_PARAGRAPHS.forEach((text,index)=>{
    const tone=index===NOTE_PARAGRAPHS.length-1?';fill:#77746d':'';
    noteY+=wrapSvgText(noteG,text,noteX+padX,noteY,noteW-padX*2,27,'poster-key-note',bodyFont+tone)*27+16;
  });
}
`;
keyMarkup='const NOTE_PARAGRAPHS='+JSON.stringify(NOTE_PARAGRAPHS)+';\n'+keyMarkup;
// The poster's rings carry no labels; this key names them. The real rings are
// too thin to hold a name, so the key spaces them evenly and writes each name
// in its ring's top band.
const RING_KEY_BAND=36, RING_KEY_CORE=84;
keyMarkup=`function ringKeyWidth(padX){
  return padX*2+${RING_KEY_CORE}+(levelBounds.length-2)*2*${RING_KEY_BAND};
}
function renderRingKey(svg,x0,y,padX,padTop,gap,bodyFont){
  const g=makeSvg('g',{class:'poster-ring-key'});
  svg.append(g);
  g.append(makeSvg('line',{class:'poster-lower-divider',x1:x0-gap/2,y1:y+24,x2:x0-gap/2,y2:y+KEY_PANEL_H-12}));
  const heading=makeSvg('text',{x:x0+padX,y:y+padTop+10,class:'poster-key-note-head'});
  heading.textContent='Rings';
  heading.setAttribute('style',bodyFont+';font-size:26px');
  g.append(heading);
  const rings=levelBounds.slice(0,-1), band=${RING_KEY_BAND}, outerDepth=rings.length-1;
  const size=depth=>${RING_KEY_CORE}+depth*2*band;
  const outer=size(outerDepth), cx=x0+padX+outer/2, cy=y+padTop+32+outer/2;
  // Painted outermost first so each ring's band shows around the next.
  [...rings.keys()].reverse().forEach(index=>{
    const s=size(index), rx=cx-s/2, ry=cy-s/2;
    g.append(makeSvg('rect',{x:rx,y:ry,width:s,height:s,rx:4,fill:index%2?'#f6f4ee':'#e8e5dc'}));
    const label=makeSvg('text',{x:cx,y:index?ry+band/2:cy,dy:'.35em','text-anchor':'middle',class:'poster-key-row-name'});
    label.textContent=LEVEL_NAMES[index];
    label.setAttribute('style',bodyFont+';font-weight:600');
    g.append(label);
  });
}
`+keyMarkup;
html=html.slice(0,keyStart)+keyMarkup+html.slice(keyEnd);
let script=html.match(/<script>\n([\s\S]*)<\/script>/)[1];
new Function(script);
function routingApi(currentScript){
  return new Function('document',currentScript.slice(0,currentScript.indexOf('function render(){'))+`;return {
    inspect(layout){const failures=[];for(const [id,group] of Object.entries(groups)){try{generateMask(group,layout,null,RELATED_GROUPS);}catch(error){failures.push({id,error:error.message});}}if(!failures.length){try{computeAllMasks(layout);}catch(error){failures.push({id:'combined',error:error.message});}}return failures;},
    fields(layout){return Object.keys(computeAllMasks(layout)).length;}
  };`)({getElementById:()=>null});
}

// Compression can box a family owner between unrelated occupied cells. Repair
// only when the real router fails, and choose the valid same-level move or swap
// with the least total displacement from the saved layout32 arrangement.
let api=routingApi(script),failures=api.inspect(nodes);
const repairMoves=[];
const displacement=layout=>Object.keys(layout).reduce((sum,id)=>sum+Math.abs(layout[id].x-projectedLayout30[id].x)+Math.abs(layout[id].y-projectedLayout30[id].y),0);
for(let pass=0;failures.length&&pass<12;pass++){
  const failedOwners=failures.filter(failure=>byId[failure.id]);
  const members=new Set(failedOwners.flatMap(failure=>[failure.id,...people.filter(person=>(person.relations||[]).some(relation=>relation.boundary_include&&relation.parent_id===failure.id)).map(person=>person.id)]));
  const focus=new Set(members);
  for(const [id,n] of Object.entries(nodes))if([...members].some(member=>Math.abs(n.x-nodes[member].x)+Math.abs(n.y-nodes[member].y)<=2))focus.add(id);
  if(!focus.size)Object.keys(nodes).forEach(id=>focus.add(id));
  let best=null,bestFailures=failures,bestDisplacement=Infinity,bestMove='';
  const occupied=new Map(Object.entries(nodes).map(([id,n])=>[`${n.x},${n.y}`,id]));
  for(const id of focus){
    const level=depths[id],current=nodes[id];
    const candidates=[...slots[level]].sort((a,b)=>(Math.abs(a.x-current.x)+Math.abs(a.y-current.y))-(Math.abs(b.x-current.x)+Math.abs(b.y-current.y))).slice(0,60);
    for(const cell of candidates){
      if(cell.x===current.x&&cell.y===current.y)continue;
      const candidate=structuredClone(nodes),other=occupied.get(`${cell.x},${cell.y}`);
      if(other){
        if(depths[other]!==level)continue;
        [candidate[id].x,candidate[other].x]=[candidate[other].x,candidate[id].x];
        [candidate[id].y,candidate[other].y]=[candidate[other].y,candidate[id].y];
      }else Object.assign(candidate[id],cell);
      const candidateFailures=api.inspect(candidate),candidateDisplacement=displacement(candidate);
      if(candidateFailures.length<bestFailures.length||(candidateFailures.length===bestFailures.length&&candidateFailures.length<failures.length&&candidateDisplacement<bestDisplacement)){
        best=candidate;bestFailures=candidateFailures;bestDisplacement=candidateDisplacement;bestMove=other?`${id} swapped with ${other}`:`${id} moved to ${cell.x},${cell.y}`;
        if(!candidateFailures.length)break;
      }
    }
    if(best&&!bestFailures.length)break;
  }
  if(!best||bestFailures.length>=failures.length)break;
  for(const id of Object.keys(nodes))Object.assign(nodes[id],best[id]);
  repairMoves.push(bestMove);failures=bestFailures;
}
if(failures.length)throw new Error(`Compressed layout cannot route: ${failures.map(failure=>failure.id+': '+failure.error).join('; ')}`);

// Re-embed any routing repairs, then parse and run the final generated script.
html=html.replace(/const INITIAL_LAYOUT = .*;\nconst STYLES/,`const INITIAL_LAYOUT = ${JSON.stringify(layout)};\nconst STYLES`);
script=html.match(/<script>\n([\s\S]*)<\/script>/)[1];
new Function(script);
api=routingApi(script);
const fields=api.fields(nodes);
// Group-fill variant. Box fills show each figure's own group; parent families
// are inset outlines beneath the boxes, so overlapping families never blend.
function groupFillVariant(base){
  let out=base;
  const swap=(before,after)=>{
    if(!out.includes(before))throw new Error('Missing group-fill fragment: '+before);
    out=out.replace(before,after);
  };
  swap('const NODE_INSET_X = 8, NODE_INSET_Y = 10;','const NODE_INSET_X = 14, NODE_INSET_Y = 14;');
  swap('function appendInsetFamilyRegion(',`function mixWithWhite(hex,amount){
  return '#'+[1,3,5].map(start=>Math.round(parseInt(hex.slice(start,start+2),16)*(1-amount)+255*amount).toString(16).padStart(2,'0')).join('');
}
// Outlines of overlapping families take separate lanes. Every lane must fit
// within NODE_INSET so the boxes drawn above never hide it.
const FAMILY_LANE_START=3.5, FAMILY_LANE_STEP=4, FAMILY_LANE_WIDTH=2;
function appendFamilyOutline(svg,gid,d,color){
  const g=makeSvg('g',{class:'family-region family-outline','data-group':gid});
  g.append(makeSvg('path',{d,fill:color,class:'family-focus-fill'}));
  const band=makeSvg('path',{d,fill:'none','clip-path':familyClip(svg,gid,d)});
  band.setAttribute('style',\`stroke:\${color};stroke-width:\${2*FAMILY_LANE_WIDTH}\`);
  g.append(band);
  svg.append(g);
}
function appendInsetFamilyRegion(`);
  swap('lane=>BASE_FAMILY_INSET+lane*FAMILY_INSET_STEP','lane=>FAMILY_LANE_START+lane*FAMILY_LANE_STEP');
  swap('appendInsetFamilyRegion(svg,gid,d,macroDef.color,familyOpacity);','appendFamilyOutline(svg,gid,d,macroDef.color);');
  swap("    const stack=people[id].role==='collective'?6:0;",`    const groupColor=MACRO_GROUPS[familyMacroId(id)].color;
    g.setAttribute('style',\`--box-fill:\${mixWithWhite(groupColor,.55)};--box-stroke:\${groupColor}\`);
    const stack=people[id].role==='collective'?6:0;`);
  swap("keyG.append(makeSvg('rect',{x,y:yy-19,width:38,height:26,rx:6,ry:6,fill:def.color,'fill-opacity':.72,stroke:shadeColor(def.color,.22),'stroke-opacity':.9,'stroke-width':FAMILY_EDGE_WIDTH}));",
    "keyG.append(makeSvg('rect',{x,y:yy-19,width:38,height:26,rx:6,ry:6,fill:mixWithWhite(def.color,.55),stroke:def.color,'stroke-width':1.4}));");
  swap("A coloured region surrounds the children of one parent. It is drawn in that parent's group colour. Where two regions overlap,","Each box takes its own group's colour. An outline surrounds the children of one parent, drawn in that parent's group colour. Where two outlines overlap,");
  out=out.replaceAll('greek-square-rings-v1','greek-square-rings-group-fill-v1');
  swap('</style>',`#canvas .person .node,#canvas .person.role-collective .node{fill:var(--box-fill);stroke:var(--box-stroke);stroke-width:1.4;stroke-dasharray:none}
#canvas .person .stack-card{fill:var(--box-fill);stroke:var(--box-stroke);stroke-width:1.2}
#canvas .person.selected .node{stroke:#20211e;stroke-width:2.6}
#canvas .person.parent .node,#canvas .person.child .node{stroke:#20211e;stroke-width:2}
.family-outline{pointer-events:none}.family-outline.dim{opacity:.12}.family-outline.emph{opacity:1}
.family-outline .family-focus-fill{opacity:0}.family-outline.emph .family-focus-fill{opacity:.16}
</style>`);
  new Function(out.match(/<script>\n([\s\S]*)<\/script>/)[1]);
  return out;
}
const groupFillHtml=groupFillVariant(html);
await writeFile('poster/layout_editor_square_rings.html',html);
await writeFile('poster/layout_editor_square_rings_group_fill.html',groupFillHtml);
await writeFile('data/layout.square_rings.json',JSON.stringify(layout,null,2)+'\n');
await writeFile('data/square_rings_report.json',JSON.stringify({placement_anchors:anchors,depths,level_widths:levelWidths,radii,ring_bands:ringBands,initial_level_bounds:initialLevelBounds,starting_layout:'layout32.json',routing_repairs:repairMoves,figures:people.length,routed_fields:fields,family_distance_cost:score},null,2)+'\n');
console.log(`Built square-ring experiment from layout32: ${people.length} figures, ${fields} routed family fields, ${repairMoves.length} routing repairs. No collisions.`);
