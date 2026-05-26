import { RAPID_FIRE_COVERS } from "./lib/covers";
import {
  MUSIC_DROP_FRAME,
  MUSIC_TEMPO,
  RAPID_FIRE_START,
  rapidFireDuration,
} from "./lib/music-beats";

export const TOTAL_FRAMES = 1080; // 36s @ 30fps
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

// Re-export beat helpers used by beats/*.tsx
export {
  MUSIC_DROP_FRAME,
  MUSIC_TEMPO,
  RAPID_FIRE_START,
  rapidFireCutFrame,
  rapidFireAbsoluteCutFrame,
} from "./lib/music-beats";

/** Rapid-fire section length from librosa beat onsets (21 covers → 21 beats). */
export const RAPID_FIRE_DURATION = rapidFireDuration(RAPID_FIRE_COVERS.length);

// Beat frame ranges — cut times derived from public/music/yep-by-fgb-beats.json
// Regenerate: python scripts/extract_beats.py
export const BEATS = {
  introClaims: { from: 0, to: 135 }, // 4.5s (was 105) — extended for readability
  gridReveal: { from: 135, to: 280 }, // 4.8s (was 105->270)
  heroHoarfrost: { from: 280, to: 405 }, // 4.1s (was 270->405)
  heroClifford: { from: 405, to: 525 }, // 4.0s (starts at 405 to preserve music drop)
  stipplingTransition: { from: 525, to: 615 }, // 3.0s
  heroFidenza: { from: 615, to: RAPID_FIRE_START },
  rapidFire: { from: RAPID_FIRE_START, to: RAPID_FIRE_START + RAPID_FIRE_DURATION },
  endCard: { from: RAPID_FIRE_START + RAPID_FIRE_DURATION, to: TOTAL_FRAMES },
} as const;

export const ACCENT = "#c8884a";
export const BG = "#0a0a0c";
export const FG = "#efeae0";
export const DIM = "#807a72";
export const PILL_BG = "#1c1c20";