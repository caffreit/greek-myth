# Square-ring experiment

Open `poster/layout_editor_square_rings.html` directly in a browser, or through the local preview server. The top-left switch hides the ring guides; the link returns to the current V27 poster. Browser zoom enlarges names for inspection.

Rebuild from the current V27 HTML:

```sh
node tools/build_square_rings.mjs
node tools/verify_square_rings.mjs
```

Compare an exported layout with either editor's starting layout using that editor's actual boundary router and crossing metric:

```sh
node tools/analyze_boundary_layout.mjs data/layout20.json
node tools/analyze_boundary_layout.mjs data/layout20.json poster/layout_editor_square_rings.html
```

The report counts geometric crossing points and pairs of overlapping regions. It also checks whether an imported layout obeys the square-ring placement rule. A crossing count is an achieved value for that layout, not a proof of the minimum.

The generator places all 79 figures in six concentric square levels. It starts with `data/layout32.json`, including its resized level boundaries, then checks collisions, outward ancestry, JavaScript syntax and successful routing of all 33 family fields before writing the experiment.

Leto, Maia, Metis and Semele share Zeus's level; Clymene shares Iapetus's level. These are explicit layout assumptions because their ancestry is missing in the current dataset. They add no genealogy. Alternative parent traditions excluded from the visible boundaries do not determine the rings.

The rings express ancestry depth, not dates. Colours identify ten editorial groups: Origins, Earth & sky, Night & underworld, Giants & monsters, Sea, Ocean & nymphs, Sun, moon & dawn, Prometheus & Atlas, Magic & prophecy, and Olympians. Cronus belongs to Earth & sky. Collective figures retain their shaded boxes within Giants & monsters. Night retains its yellow. Each parent's region uses its group colour; overlapping parent regions show shared ancestry. The groups organise related figures rather than assigning every member the same divine role. Some parent-child connections skip rings because the child must be outside both parents. All 33 figures used as visible parents receive fields, including Oceanus, Tethys, Crius, Phoebe, Mnemosyne and Themis.

Editing is level-locked. Levels 1 and 2 begin one cell deep. Levels 3, 4 and 5 begin two cells deep. Dragging and arrow keys can move a figure within its assigned level, never to another ancestry level. Ring guides are static and have no resize handles. They follow the gutters between cells, so no figure box crosses a level boundary; family regions may still cross levels to reach children. The guides carry no labels, so the gutters stay tight. A Rings key in the legend names them: five evenly spaced nested squares shaded in alternating bands, each name written in its ring's top band. The key is schematic, because the real rings are too thin to hold their names. The outer level-five guide is omitted.

The six provisional labels describe mixed ancestry cohorts, not exclusive deity classes. Optimizer candidates obey the same assignments. Save layout JSON and Import layout remain at the top right. Saved files include `level_bounds`, so ring geometry survives export and import. Imports with invalid boundaries, off-level figures, collisions, missing figures or unknown IDs are rejected before replacing the current layout.

Generated coordinates are in `data/layout.square_rings.json`. Placement assumptions and per-figure depths are recorded in `data/square_rings_report.json`. The original V27 poster and its layout remain separate. The experiment starts from its generated layout rather than restoring browser autosaves.

In the main translucent version, each family region also has a thin edge in a darker shade of its colour. Lanes are set along each straight side of an outline. A stretch that runs alone hugs its cell edge, so outlines sit evenly along the ring guides. Stretches that share a cell edge with other families step inward in separate lanes so their edges run side by side. A side changes lane only at a cell corner, with a short smoothed step in the gutter. Families are painted in order of the parent's generation, oldest underneath, so each cell shows its nearest parent's colour on top. Collectives are stacked cards in both versions.

The same build also writes `poster/layout_editor_square_rings_group_fill.html`, a comparison with the same layout. Each box is filled with its own group colour. Each parent's family is a thin outline in the parent's group colour, drawn in the gutters beneath the boxes. Overlapping families take separate inset lanes, so colours never blend. Selecting a figure lightly fills its families. Collectives are stacked cards rather than dashed boxes. Verify it with `node tools/verify_square_rings.mjs poster/layout_editor_square_rings_group_fill.html`.

`node tools/export_square_rings_posters.mjs` writes print files for both versions to `poster/print/`. It uses headless Google Chrome. Each version gets a standalone SVG, a vector A2 PDF and a 300 dpi A2 PNG. The page is 1:√2, so the PDF and SVG scale to any A size. Run the build first, since the export reads the generated editor pages.

This is a layout comparison, not a replacement poster. The extra lane makes the rings more flexible, but family fields can become more complex when figures occupy both lanes. That is the point to test before removing minor boundaries.
