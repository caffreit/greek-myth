import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const html=await readFile('poster/layout_editor_square_rings.html','utf8');
const script=html.match(/<script>\n([\s\S]*)<\/script>/)[1];
const prefix=script.slice(0,script.indexOf('function render(){'));
const nudge=script.slice(script.indexOf('function nudgeSelected('),script.indexOf("window.addEventListener('keydown'"));
const pointer=script.split("svg.addEventListener('pointermove',e=>{")[2].split("\n});")[0];
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
 resize:(level,side,delta)=>{levelBounds=resizedLevelBounds(level,side,delta,nodes);return structuredClone(levelBounds);},
 familyIds:()=>Object.keys(groups), routedFamilyIds:()=>Object.keys(computeAllMasks(nodes)),
 getMessage:()=>message,
 nudge:(id,dx,dy)=>{selectedId=id;nudgeSelected(dx,dy);},
 pointer:(id,x,y)=>{drag={id,lastCell:[nodes[id].x,nodes[id].y]};const bounds=layoutBounds();
  const e={clientX:LEFT+(x-bounds.xMin+.5)*CELL_W,clientY:TOP+(y-bounds.yMin+.5)*CELL_H};${pointer}},
 import:async incoming=>{const e={target:{files:[{name:'test.json',text:async()=>JSON.stringify(incoming)}],value:'test'}};${importer}},
 export:()=>({nodes:structuredClone(nodes),pinned_ids:[],level_bounds:structuredClone(levelBounds)})
};`);
const app=harness({getElementById:()=>({getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),viewBox:{baseVal:{width:100,height:100}}})});
const initial=app.getNodes();
app.validate(initial);
assert.equal(app.familyIds().length,33);
assert.deepEqual(app.routedFamilyIds().sort(),app.familyIds().sort());
for(const id of ['oceanus','tethys','crius','phoebe','mnemosyne','themis'])assert.ok(app.familyIds().includes(id),`${id} needs a family region`);
assert.deepEqual(app.bands(),[{inner:0,outer:0},{inner:1,outer:1},{inner:2,outer:2},{inner:3,outer:4},{inner:5,outer:6},{inner:7,outer:8}]);
assert.match(html,/ring-handle/);
assert.match(html,/beginBoundaryDrag/);
assert.match(html,/level_bounds/);
assert.doesNotMatch(html,/> P badges</);
assert.doesNotMatch(html,/marks a parent/);
assert.match(html,/const familyMarkerMode='off'/);
for(const [id,level] of Object.entries(app.levels())){
  const radius=Math.max(Math.abs(initial[id].x),Math.abs(initial[id].y));
  if(level===1)assert.equal(radius,1,`${id} must use the one-cell level-1 ring`);
  if(level===2)assert.equal(radius,2,`${id} must use the one-cell level-2 ring`);
}
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
app.resize(2,'top',-1);
assert.equal(app.bounds()[2].top,-3);
assert.deepEqual(app.bounds()[2],{left:-2,right:2,top:-3,bottom:2});
assert.equal(app.error('moirai',0,-3),'');
assert.throws(()=>app.resize(2,'top',-1),/must remain at least one square outside/);
app.resize(2,'top',1);
assert.equal(app.bounds()[2].top,-2);
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
console.log('Verified layout15, resizable square-ring edges, no P badges, all 33 family regions, legal level-locked moves, boundary JSON round-trip, and atomic rejection of invalid imports.');
