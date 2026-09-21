# Greek Theogony, Extended — prototype V27.0

V27.0 branches from the untouched 59-figure V25.9 theogony and adds 20 figures or groups. It deliberately contains no heroes: those and their story-specific monsters are reserved for a separate hero-ology poster.

The prototype now contains 79 nodes, 27 visible family fields, and four large regions: Primordials, Night / underworld, Titans, and Olympians.

## Additions

- Divine races: Hecatoncheires, Elder Cyclopes, Erinyes, Gigantes
- Nyx's household: Moirai, Keres, Nemesis, Eris, Hesperides
- Sea family: Nereus, Doris, and a collective Nereids node naming Thetis, Amphitrite, and Galatea
- Hecate's ancestry: Eurybia, Perses, Asteria, and Hecate
- Olympian collectives: Muses, Horae, Eurynome, and Charites

Eleven additions use dashed collective boxes. Selected members are named inside those boxes instead of being expanded into dozens of individual nodes.

## Deliberately deferred

Heroes, mortals, Amazons, centaurs, Sirens, most Oceanids, the Winds, Nike's sibling group, and hero-specific monsters are not part of this branch.

## Source choices

The visible parent relations generally follow Hesiod. Alternative traditions are retained as interactive relations where useful—for example, the Moirai appear visibly under Nyx, while their later Zeus-and-Themis parentage remains available in the data.

## Files

- `layout_editor_greek_theogony_extended_v27_0.html`: self-contained interactive prototype; press Ctrl/Cmd+E to export its SVG
- `layout.theogony_extended_v27.json`: combined 79-node layout
- `theogony_additions_v27.json`: the 20 additions, relationships, notes, and initial positions
- `tools/build_poster_v27.mjs`: deterministic V25.9-to-V27.0 builder
- `tools/verify_poster_v27.mjs`: content, layout, genealogy, routing, and embedded-script checks

## Rebuild

```sh
node tools/build_poster_v27.mjs \
  layout_editor_poster_design_v25_9.html \
  layout.6json \
  theogony_additions_v27.json \
  layout_editor_greek_theogony_extended_v27_0.html \
  layout.theogony_extended_v27.json
```

## Verify

```sh
node tools/verify_poster_v27.mjs \
  layout_editor_greek_theogony_extended_v27_0.html \
  layout.theogony_extended_v27.json \
  theogony_additions_v27.json
```
