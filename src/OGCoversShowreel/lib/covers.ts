import { staticFile } from "remotion";

export interface Cover {
  slug: string;
  title: string;
  subtitle: string;
  num: string;      // e.g. "08 · L-system plants"
  heading: string;  // e.g. "A grammar for branching"
  png: string;

  /**
   * Background luminance theme for caption rendering.
   *
   *   "dark"  → caption uses light ink (FG / DIM / ACCENT)
   *   "light" → caption uses dark ink (#1a1612 / #4a3f2f / #8b5e2a)
   *
   * Required because the rapid-fire beat cycles 17 covers under one
   * caption template; previously the dark-only template rendered
   * subtitle text as gray-on-cream during light covers, leaving
   * "L-system 1968" / "Goold 1844" effectively invisible.
   */
  theme: "dark" | "light";
}

export const COVERS: Cover[] = [
  {
    slug: "dla-hoarfrost",
    title: "Hoarfrost",
    subtitle: "Witten & Sander 1981",
    num: "01 · Diffusion-limited aggregation",
    heading: "Frost on a cornice, grown downward from a seed line",
    png: staticFile("covers/showcase-hoarfrost.png"),
    theme: "dark",
  },
  {
    slug: "hypsometric",
    title: "Hypsometric Tint",
    subtitle: "NOAA/GEBCO symbology",
    num: "22 · Hypsometric tint",
    heading: "Cartographic color by elevation",
    png: staticFile("covers/showcase-hypsometric.png"),
    theme: "light",
  },
  {
    slug: "lichtenberg",
    title: "Lichtenberg",
    subtitle: "Dielectric breakdown",
    num: "03 · Lichtenberg figures",
    heading: "Frozen lightning in a block of plastic",
    png: staticFile("covers/showcase-lichtenberg.png"),
    theme: "dark",
  },
  {
    slug: "gray-scott-maze",
    title: "Gray-Scott Maze",
    subtitle: "Pearson 1993",
    num: "16 · Gray-Scott reaction-diffusion (maze)",
    heading: "Turing chemistry in the labyrinth regime",
    png: staticFile("covers/showcase-gray-scott-maze.png"),
    theme: "dark",
  },
  {
    slug: "karman",
    title: "Kármán Street",
    subtitle: "Von Kármán 1911",
    num: "05 · Kármán vortex street",
    heading: "The dimensionless frequency of a wake",
    png: staticFile("covers/showcase-karman.png"),
    theme: "dark",
  },
  {
    slug: "schlieren",
    title: "Schlieren",
    subtitle: "Toepler 1864",
    num: "06 · Schlieren / shadowgraph",
    heading: "The optics of a knife-edge cutoff",
    png: staticFile("covers/showcase-schlieren.png"),
    theme: "dark",
  },
  {
    slug: "penrose",
    title: "Penrose",
    subtitle: "Penrose 1974",
    num: "07 · Penrose tiling",
    heading: "Five-fold order without a unit cell",
    png: staticFile("covers/showcase-penrose.png"),
    theme: "light", // cream margin at bottom-left where caption sits
  },
  {
    slug: "lsystem",
    title: "Lindenmayer",
    subtitle: "L-system 1968",
    num: "08 · L-system plants",
    heading: "A grammar for branching",
    png: staticFile("covers/showcase-lsystem-light.png"),
    theme: "light",
  },
  {
    slug: "clifford",
    title: "Clifford",
    subtitle: "Pickover 1990",
    num: "09 · Strange attractor",
    heading: "A fractal set, traced by an orbit",
    png: staticFile("covers/showcase-clifford.png"),
    theme: "dark",
  },
  {
    slug: "risograph",
    title: "Risograph",
    subtitle: "Riso Kagaku 1980s",
    num: "18 · Risograph",
    heading: "Duplicator drift as composition",
    png: staticFile("covers/showcase-risograph.png"),
    theme: "light",
  },
  {
    slug: "painterly-atmosphere",
    title: "Atmosphere",
    subtitle: "Color-field painting",
    num: "11 · Painterly atmosphere",
    heading: "A color-field background, painted by gradient",
    png: staticFile("covers/showcase-painterly.png"),
    theme: "dark",
  },
  {
    slug: "harmonograph",
    title: "Harmonograph",
    subtitle: "Goold 1844",
    num: "02 · Harmonograph",
    heading: "A Victorian drawing machine, drawn in code",
    png: staticFile("covers/showcase-harmonograph.png"),
    theme: "dark",
  },
  {
    slug: "topo-contour",
    title: "Contour",
    subtitle: "USGS contour convention",
    num: "13 · Topographic contours",
    heading: "The cartographic convention, fed by noise",
    png: staticFile("covers/showcase-topo.png"),
    theme: "dark",
  },
  {
    slug: "brians-brain",
    title: "Brian's Brain",
    subtitle: "Callahan 1996",
    num: "23 · Brian's Brain",
    heading: "Excitable media on a toroidal grid",
    png: staticFile("covers/showcase-brians-brain.png"),
    theme: "dark",
  },
  {
    slug: "ascii-landscape",
    title: "ASCII Landscape",
    subtitle: "Brightness ramp",
    num: "15 · ASCII landscape",
    heading: "The brightness-ramp, applied to a scene built for it",
    png: staticFile("covers/showcase-ascii.png"),
    theme: "dark",
  },
];

// Rapid-fire-only covers (not in the 4×4 grid)
export const RAPID_FIRE_EXTRA: Cover[] = [
  {
    slug: "space-colonization",
    title: "Colonization",
    subtitle: "Runions et al. 2007",
    num: "17 · Space colonization",
    heading: "Trees grown by hunger for light",
    png: staticFile("covers/showcase-space-colonization.png"),
    theme: "dark",
  },
  {
    slug: "woodcut-hatch",
    title: "Woodcut",
    subtitle: "Dürer woodcut technique",
    num: "19 · Woodcut hatch",
    heading: "Ink lines carved in the Dürer tradition",
    png: staticFile("covers/showcase-woodcut-hatch.png"),
    theme: "light",
  },
];

// Covers NOT featured as heroes (used in rapid-fire beat 7)
// Heroes: karman(4), clifford(8), flow/fidenza (beat 5 PNG), harmonograph transition
// Rapid-fire: 21 covers on librosa-detected beats (see yep-by-fgb-beats.json)
export const RAPID_FIRE_COVERS: Cover[] = [
  COVERS[0],  // Hoarfrost          — 01
  COVERS[1],  // Hypsometric Tint   — 22 (light)
  COVERS[2],  // Lichtenberg        — 03
  COVERS[3],  // Gray-Scott Maze    — 16
  COVERS[5],  // Schlieren          — 06
  COVERS[6],  // Penrose            — 07 (light)
  COVERS[7],  // Lindenmayer light  — 08 (light)
  COVERS[9],  // Risograph          — 18 (light)
  COVERS[10], // Atmosphere         — 11
  COVERS[11], // Harmonograph       — 02
  COVERS[12], // Contour            — 13
  COVERS[13], // Brian's Brain      — 23
  COVERS[14], // ASCII              — 15
  ...RAPID_FIRE_EXTRA,
  // Unused variants — dark/light alternates not featured elsewhere
  {
    slug: "lsystem-dark",
    title: "Lindenmayer",
    subtitle: "L-system 1968",
    num: "08 · L-system plants",
    heading: "A grammar for branching",
    png: staticFile("covers/showcase-lsystem.png"),
    theme: "dark",
  },
  {
    slug: "harmonograph-light",
    title: "Harmonograph",
    subtitle: "Goold 1844",
    num: "02 · Harmonograph",
    heading: "A Victorian drawing machine, drawn in code",
    png: staticFile("covers/showcase-harmonograph-light.png"),
    theme: "light",
  },
  {
    slug: "flow-light",
    title: "Fidenza",
    subtitle: "Hobbs 2021",
    num: "12 · Flow field",
    heading: "A vector field, walked with ink",
    png: staticFile("covers/showcase-flow-light.png"),
    theme: "light",
  },
  {
    slug: "topo-light",
    title: "Contour",
    subtitle: "USGS contour convention",
    num: "13 · Topographic contours",
    heading: "The cartographic convention, fed by noise",
    png: staticFile("covers/showcase-topo-light.png"),
    theme: "light",
  },
  {
    slug: "clifford-hello-world",
    title: "Clifford",
    subtitle: "Pickover 1990",
    num: "09 · Strange attractor",
    heading: "A fractal set, traced by an orbit",
    png: staticFile("covers/showcase-clifford-hello-world.png"),
    theme: "dark",
  },
  {
    slug: "venation",
    title: "Leaf Venation",
    subtitle: "Runions 2005",
    num: "24 · Leaf venation",
    heading: "An auxin network, grown through a leaf domain",
    png: staticFile("covers/showcase-venation.png"),
    theme: "dark",
  },
];
