// Square-ring Transit Theogony. This lineage is separate from ltr_theogony.mjs.
// Add stations, drop stations, or change a path here, then rebuild. It starts from
// the same fifteen lines so the ring poster still draws.
//
// figures: stations that are not in the V27 theogony, each { id, name, depth }.
// extraLinks: parent links used only on this map, each [parentId, childId].
export const figures = [];
export const extraLinks = [];

export const lines = [
  { id: 'sovereignty', name: 'Sovereignty line', color: '#d0312d', paths: [['chaos', 'gaia', 'uranus', 'cronus', 'zeus', 'athena'], ['zeus', 'apollo'], ['zeus', 'artemis'], ['zeus', 'hermes'], ['zeus', 'dionysus'], ['zeus', 'ares'], ['zeus', 'hebe'], ['zeus', 'persephone'], ['zeus', 'charites']] },
  { id: 'promethean', name: 'Promethean line', color: '#7a4ea6', paths: [['chaos', 'gaia', 'uranus', 'iapetus', 'prometheus'], ['iapetus', 'atlas']] },
  { id: 'sea', name: 'Sea line', color: '#13a19d', paths: [['chaos', 'gaia', 'pontus', 'nereus', 'nereids']] },
  { id: 'ocean', name: 'Ocean line', color: '#1f5ea8', paths: [['chaos', 'gaia', 'uranus', 'oceanus', 'doris', 'nereids'], ['oceanus', 'eurynome', 'charites']] },
  { id: 'sun', name: 'Sun line', color: '#f0a500', paths: [['chaos', 'gaia', 'uranus', 'hyperion', 'helios'], ['hyperion', 'eos']] },
  { id: 'hecate', name: 'Hecate line', color: '#2e8b4b', paths: [['chaos', 'gaia', 'uranus', 'coeus', 'asteria', 'hecate'], ['uranus', 'crius', 'perses', 'hecate']] },
  { id: 'night', name: 'Night line', color: '#1d1d1b', paths: [['chaos', 'nyx', 'aether'], ['nyx', 'hemera'], ['nyx', 'charon'], ['nyx', 'moros'], ['nyx', 'nemesis'], ['nyx', 'hypnos']] },
  { id: 'memory', name: 'Memory line', color: '#e0609c', paths: [['uranus', 'mnemosyne', 'muses']] },
  { id: 'justice', name: 'Justice line', color: '#9aa3a8', paths: [['uranus', 'themis', 'horae']] },
  { id: 'hera', name: 'Hera line', color: '#8c1c3c', paths: [['cronus', 'hera', 'ares'], ['hera', 'hephaestus'], ['hera', 'hebe']] },
  { id: 'harvest', name: 'Harvest line', color: '#8dc63f', paths: [['cronus', 'demeter', 'persephone']] },
  { id: 'abyss', name: 'Abyss line', color: '#7b5130', paths: [['chaos', 'tartarus', 'typhon'], ['tartarus', 'echidna']] },
  { id: 'erebus', name: 'Erebus line', color: '#3b3f8f', paths: [['chaos', 'erebus', 'aether'], ['erebus', 'hemera'], ['erebus', 'charon']] },
  { id: 'foam', name: 'Foam line', color: '#62b5e5', paths: [['uranus', 'aphrodite']] },
  { id: 'forge', name: 'Forge line', color: '#ee7a12', paths: [['uranus', 'elder_cyclopes'], ['uranus', 'hecatoncheires']] },
];

export const couples = [
  { a: 'zeus', b: 'hera', weight: 3 },
  { a: 'nyx', b: 'erebus', weight: 3 },
  { a: 'zeus', b: 'demeter', weight: 1 },
  { a: 'zeus', b: 'eurynome', weight: 1 },
];
