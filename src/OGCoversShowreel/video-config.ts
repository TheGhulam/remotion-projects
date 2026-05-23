export const TOTAL_FRAMES = 1080; // 36s @ 30fps
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

// Beat frame ranges
//
// 30s → 36s extension: the first two beats were too compressed at 2.0s and 2.5s
// respectively. New budget gives the intro hook 3.5s (to type the command,
// hold, materialize the cover, and hold the settled state before cutting) and
// the grid reveal 5.5s (so the 16-cell stagger lands BEFORE the headline
// types in, instead of competing with it). Beats 3-6 are unchanged in
// duration; only their absolute frame ranges shift. Rapid-fire gets +35
// frames so 17 covers × 15 frames each lands closer to the music's
// ~62 BPM half-beat (15 frames @ 30fps = 0.5s ≈ 120 BPM, locking the
// rapid fire to the upbeat/half-beat of the underlying track).
export const BEATS = {
  introClaims:        { from: 0,    to: 105  }, // 3.5s — terminal hook
  gridReveal:         { from: 105,  to: 270  }, // 5.5s — grid + headline
  heroHoarfrost:      { from: 270,  to: 405  }, // 4.5s
  heroClifford:       { from: 405,  to: 525  }, // 4.0s
  stipplingTransition:{ from: 525,  to: 615  }, // 3.0s
  heroFidenza:        { from: 615,  to: 695  }, // 2.7s
  rapidFire:          { from: 695,  to: 950  }, // 8.5s — 17 covers × 15 frames
  endCard:            { from: 950,  to: 1080 }, // 4.3s
} as const;

export const ACCENT = "#c8884a";
export const BG = "#0a0a0c";
export const FG = "#efeae0";
export const DIM = "#807a72";
export const PILL_BG = "#1c1c20";
