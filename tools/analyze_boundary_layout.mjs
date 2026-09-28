import { readFile } from 'node:fs/promises';

const [layoutPath, editorPath = 'poster/layout_editor_greek_theogony_extended_v27_0.html'] = process.argv.slice(2);
if (!layoutPath) {
  console.error('Usage: node tools/analyze_boundary_layout.mjs layout.json [editor.html]');
  process.exit(2);
}

const [layout, html] = await Promise.all([
  readFile(layoutPath, 'utf8').then(JSON.parse),
  readFile(editorPath, 'utf8'),
]);
const script = html.match(/<script>\n([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('Could not find the editor script');
const prefix = script.slice(0, script.indexOf('function render(){'));
if (!prefix.includes('function trueBoundaryCrossings(')) throw new Error('Editor lacks crossing metric');

// Run the editor's actual router and metric. Keep its definitions authoritative.
const analyze = new Function('document', 'incoming', `${prefix}
  const initial = structuredClone(nodes);
  const expected = Object.keys(initial).sort();
  const actual = Object.keys(incoming.nodes || {}).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Figure IDs differ from editor');
  const summarize = layout => {
    const occupied = new Set();
    for (const [id, point] of Object.entries(layout)) {
      if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) throw new Error('Bad coordinates for ' + id);
      const cell = point.x + ',' + point.y;
      if (occupied.has(cell)) throw new Error('Two figures at ' + cell);
      occupied.add(cell);
    }
    const masks = computeAllMasks(layout);
    const crossing = trueBoundaryCrossings(masks);
    const ids = Object.keys(groups);
    let overlappingPairs = 0, unrelatedOverlappingPairs = 0;
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      if (!masksOverlap(masks[ids[i]], masks[ids[j]])) continue;
      overlappingPairs++;
      if (!semanticallyIntertwined(ids[i], ids[j])) unrelatedOverlappingPairs++;
    }
    return { familyRegions: ids.length, crossingPoints: crossing.count,
      crossingExamples: crossing.examples, overlappingPairs, unrelatedOverlappingPairs,
      score: computeLayoutScore(layout, masks).total };
  };
  const ringViolations = typeof ringMoveError === 'function'
    ? Object.entries(incoming.nodes).filter(([id, point]) => ringMoveError(id, point.x, point.y)).map(([id]) => id)
    : null;
  return { editorInitial: summarize(initial), supplied: summarize(incoming.nodes),
    ringConstraint: ringViolations === null ? null : {
      valid: ringViolations.length === 0, violations: ringViolations.length,
      examples: ringViolations.slice(0, 8) } };
`);
const report = analyze({ getElementById: () => null }, layout);
console.log(JSON.stringify({ layout: layoutPath, editor: editorPath, ...report }, null, 2));
