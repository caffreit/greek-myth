# Theogony Underground

Open `topology/theogony_underground.html` in a browser. The diagram is a new schematic, generated from the 79 figures and the 125 relations marked `boundary_include` in the V27 genealogy. It does not use the poster coordinates or family boundary shapes.

- A station is a figure or named collective.
- A grey link is one included parent or origin relation.
- A coloured route is a selected path through those links. Shared stations are interchanges.
- Horizontal bands arrange the diagram for reading; their crossings are not a mathematical crossing count.

The graph is connected. Its cycle rank is `125 - 79 + 1 = 47`. This counts independent cycles in the graph, not required crossings or handles.

## Why the plane is impossible

The map's “Why a flat map fails” view displays a subdivision of `K3,3`:

- One side: Gaia, Uranus, Zeus.
- Other side: Themis, Mnemosyne, Cronus.
- Gaia and Uranus each link directly to all three on the other side.
- Zeus links directly to Cronus, to Themis through Horae, and to Mnemosyne through Muses.

All nine paths are internally disjoint. Since `K3,3` cannot be embedded in a plane or sphere, the included genealogy has orientable genus at least one. This lower bound does **not** establish that a torus suffices. The exact minimum genus and planar crossing number are not certified here.

## Rebuild

```sh
node tools/build_theogony_underground.mjs
```

The builder checks every coloured route and every edge in the nonplanarity witness against the genealogy before writing the self-contained HTML file.
