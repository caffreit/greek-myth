import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html=await readFile('poster/layout_editor_square_rings.html','utf8');
const script=html.match(/<script>\n([\s\S]*)<\/script>/)[1];
const prefix=script.slice(0,script.indexOf('function render(){'));
const nudge=script.slice(script.indexOf('function nudgeSelected('),script.indexOf("window.addEventListener('keydown'"));
const pointer=script.split("svg.addEventListener('pointermove',e=>{")[1].split("\n});")[0];
const importer=script.split("document.getElementById('importFile').addEventListener('change',async e=>{")[1].split("\n});")[0];
const harness=new Function('document',prefix+`
let message='';
function setStatus(text){message=text;}
function snapshotState(){return {nodes:structuredClone(nodes),pinned:[...pinnedIds],levelBounds:structuredClone(levelBounds)};}
function restoreState(s){nodes=structuredClone(s.nodes);levelBounds=structuredClone(s.levelBounds);}
function render(){} function updateSidebar(){} function pushHistory(){} function autoSave(){}
function layoutBounds(){return boundsForEditor();}
${nudge}
return {
 getNodes:()=>structuredClone(nodes), validate:validateRingLayout, error:ringMoveError,
 levels:()=>structuredClone(ANCESTRY_LEVELS), bands:()=>structuredClone(RING_BANDS),
 bounds:()=>structuredClone(levelBounds),
 branchGroups:()=>structuredClone(MACRO_GROUPS),
 branch:familyMacroId,
 palette:id=>{applyPalette(id);return structuredClone(MACRO_GROUPS);},
 familyColors:()=>structuredClone(STYLES),
 macroMasks:()=>computeMacroMasks(),
 familyIds:()=>Object.keys(groups), routedFamilyIds:()=>Object.keys(computeAllMasks(nodes)),
 getMessage:()=>message,
 nudge:(id,dx,dy)=>{selectedId=id;nudgeSelected(dx,dy);},
 pointer:(id,x,y)=>{drag={id,lastCell:[nodes[id].x,nodes[id].y]};const bounds=layoutBounds();
  const e={clientX:LEFT+(x-bounds.xMin+.5)*CELL_W,clientY:TOP+(y-bounds.yMin+.5)*CELL_H};${pointer}},
 import:async incoming=>{const e={target:{files:[{name:'test.json',text:async()=>JSON.stringify(incoming)}],value:'test'}};${importer}},
 export:()=>({nodes:structuredClone(nodes),pinned_ids:[],level_bounds:structuredClone(levelBounds)}),
 guideCrossings:()=>{const b=layoutBounds(),crossings=[];
  levelBounds.slice(0,-1).forEach((edge,level)=>{const g=ringGuideRect(edge,b);
   for(const [id,n] of Object.entries(nodes)){const [cx,cy]=cellToPx(n.x,n.y,b);
    const x0=cx+NODE_INSET_X,x1=cx+CELL_W-NODE_INSET_X,y0=cy+NODE_INSET_Y,y1=cy+CELL_H-NODE_INSET_Y;
    const overlapsY=y0<g.y+g.height&&y1>g.y,overlapsX=x0<g.x+g.width&&x1>g.x;
    if(([g.x,g.x+g.width].some(v=>x0<v&&v<x1)&&overlapsY)||([g.y,g.y+g.height].some(v=>y0<v&&v<y1)&&overlapsX))crossings.push(id+' crosses level '+level);}
  });return crossings;}
};`);
const app=harness({getElementById:()=>({getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),viewBox:{baseVal:{width:100,height:100}}})});
const initial=app.getNodes();
const branches=app.branchGroups();
assert.equal(Object.keys(branches).length,10);
assert.deepEqual(Object.values(branches).flatMap(branch=>branch.members).sort(),Object.keys(initial).sort());
for(const [id,branch] of [['cronus','primordial'],['nyx','night'],['pontus','sea'],['nereus','sea'],['oceanus','ocean'],['tethys','ocean'],['hyperion','light'],['iapetus','iapetus'],['clymene','iapetus'],['crius','hecate'],['coeus','hecate'],['zeus','olympian']])assert.equal(app.branch(id),branch);
for(const palette of ['jewel','editorial','fresco']){
  const colours=app.palette(palette);
  assert.equal(colours.night.color,'#D8A21B','Night retains its existing yellow');
  for(const branch of Object.values(colours))assert.match(branch.color,/^#[0-9a-f]{6}$/i);
  for(const [owner,style] of Object.entries(app.familyColors()))assert.equal(style.color,colours[app.branch(owner)].color);
}
app.palette('jewel');
for(const [group,mask] of Object.entries(app.macroMasks())){
  for(const id of branches[group].members){const n=initial[id];assert.ok(mask.has(n.x+','+n.y),group+' must include '+id+' even when disconnected');}
}
app.validate(initial);
assert.deepEqual(app.guideCrossings(),[],'Ring guides must not cut through figure boxes');
assert.equal(app.familyIds().length,33);
assert.deepEqual(app.routedFamilyIds().sort(),app.familyIds().sort());
for(const id of ['oceanus','tethys','crius','phoebe','mnemosyne','themis'])assert.ok(app.familyIds().includes(id),`${id} needs a family region`);
assert.deepEqual(app.bands(),[{inner:0,outer:0},{inner:1,outer:1},{inner:2,outer:2},{inner:3,outer:4},{inner:5,outer:6},{inner:7,outer:8}]);
assert.doesNotMatch(html,/ring-handle/);
assert.doesNotMatch(html,/boundaryDrag|beginBoundaryDrag|resizedLevelBounds/);
assert.match(html,/level_bounds/);
assert.doesNotMatch(html,/> P badges</);
assert.doesNotMatch(html,/marks a parent/);
assert.match(html,/const familyMarkerMode='off'/);
assert.deepEqual(app.bounds(),[
  {left:0,right:0,top:0,bottom:0},{left:-1,right:1,top:-1,bottom:1},{left:-2,right:2,top:-3,bottom:2},
  {left:-3,right:3,top:-4,bottom:3},{left:-4,right:4,top:-5,bottom:4},{left:-8,right:8,top:-8,bottom:8}
]);
for(const [id,n] of Object.entries(initial)){
  assert.equal(app.error(id,n.x,n.y),'');
  assert.notEqual(app.error(id,99,99),'');
}
const zeus=initial.zeus;
app.nudge('zeus',-zeus.x,-zeus.y);
assert.deepEqual(app.getNodes(),initial);
assert.match(app.getMessage(),/Zeus must stay on level 4/);
app.pointer('zeus',0,0);
assert.deepEqual(app.getNodes(),initial);
// Later levels retain a legal radial move between their two lanes.
let radialMove=null;
const occupied=new Set(Object.values(initial).map(n=>`${n.x},${n.y}`));
for(const [id,n] of Object.entries(initial)){
  if(app.bands()[app.levels()[id]].inner===app.bands()[app.levels()[id]].outer)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const x=n.x+dx,y=n.y+dy;
    if(app.error(id,x,y)||occupied.has(`${x},${y}`)||Math.max(Math.abs(x),Math.abs(y))===Math.max(Math.abs(n.x),Math.abs(n.y)))continue;
    app.nudge(id,dx,dy);
    if(app.getNodes()[id].x===x&&app.getNodes()[id].y===y){
      radialMove={id,x,y,dx,dy};
      app.validate(app.getNodes());
      app.pointer(id,n.x,n.y);
      assert.deepEqual(app.getNodes(),initial);
      break;
    }
    assert.deepEqual(app.getNodes(),initial);
  }
  if(radialMove)break;
}
assert.ok(radialMove,'A two-lane level needs one available radial move');
const invalid=app.export();invalid.nodes.zeus.x=0;invalid.nodes.zeus.y=0;
await app.import(invalid);
assert.match(app.getMessage(),/Import failed: Zeus must stay/);
assert.deepEqual(app.getNodes(),initial);
const unknown=app.export();unknown.nodes.invented={x:0,y:0};
await app.import(unknown);assert.match(app.getMessage(),/Unknown figure/);
assert.deepEqual(app.getNodes(),initial);
await app.import(app.export());assert.equal(app.getMessage(),'Imported test.json.');
// Exercise actual keyboard and pointer handlers for legal adjacent moves.
let moved=false;
for(const [id,n] of Object.entries(initial)){
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    if(app.error(id,n.x+dx,n.y+dy))continue;
    app.nudge(id,dx,dy);
    if(app.getNodes()[id].x===n.x&&app.getNodes()[id].y===n.y)continue;
    app.validate(app.getNodes());
    app.pointer(id,n.x,n.y);
    assert.deepEqual(app.getNodes(),initial);
    moved=true;break;
  }
  if(moved)break;
}
assert.ok(moved,'At least one legal move must succeed');
console.log('Verified layout30, static square-ring guides, no P badges, all 33 family regions, legal level-locked moves, boundary JSON round-trip, and atomic rejection of invalid imports.');
