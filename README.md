# Greek Myth

An interactive Greek mythology family tree and poster project.

The project maps figures from the Greek theogony using a compact radial layout, parent-to-child colour regions, and interactive layout tools.

## Current direction

- Radial packing centred on Chaos
- Parent regions contain direct children only
- Compact clusters with minimal empty grid cells
- Split boundaries where family regions overlap
- Drag, undo, pinning, selection optimisation, and optimise-all controls
- SVG poster export
- Future heroes-only and combined gods-and-heroes versions

## Repository status

The current working material is now included: the V25.9 baseline and the V27.0 extended theogony prototype. V27.0 has 79 nodes and keeps heroes out of the gods-only diagram; a separate heroes poster remains a future piece of work.

## Files

- `data/layout5.json`: recoverable grid layout from 24 August 2026
- `legacy/greek_mythology_tree_prototype.html`: early prototype from 12 August 2026
- `poster/layout_editor_poster_design_v25_9.html`: 59-figure V25.9 baseline
- `poster/layout_editor_greek_theogony_extended_v27_0.html`: current interactive 79-figure extended theogony
- `data/layout.6json`: V25.9 baseline layout
- `data/layout.theogony_extended_v27.json`: V27.0 layout
- `data/theogony_additions_v27.json`: 20 V27.0 additions and their relationships
- `README_V27.md`: extended-prototype contents and source choices
- `tools/build_poster_v27.mjs`: reproducible V25.9-to-V27.0 builder
- `tools/verify_poster_v27.mjs`: content, layout, genealogy, routing, and script checks

## Verify the current prototype

```sh
node tools/verify_poster_v27.mjs \
  poster/layout_editor_greek_theogony_extended_v27_0.html \
  data/layout.theogony_extended_v27.json \
  data/theogony_additions_v27.json
```
