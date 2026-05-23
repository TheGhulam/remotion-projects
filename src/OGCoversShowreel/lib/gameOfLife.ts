// src/OGCoversShowreel/lib/gameOfLife.ts

export const COLS = 192;   // 192 × 10px = 1920
export const ROWS = 108;   // 108 × 10px = 1080
export const CELL = 10;    // px per cell
const SIZE = COLS * ROWS;

function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export function createGrid(seed = 42): Uint8Array {
  const rand = lcg(seed);
  const alive = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    alive[i] = rand() < 0.35 ? 1 : 0;
  }
  return alive;
}

export function stepGrid(alive: Uint8Array, ages: Uint8Array): void {
  const next = new Uint8Array(SIZE);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          n += alive[((r + dr + ROWS) % ROWS) * COLS + ((c + dc + COLS) % COLS)];
        }
      }
      const i = r * COLS + c;
      next[i] = (alive[i] ? n === 2 || n === 3 : n === 3) ? 1 : 0;
    }
  }
  for (let i = 0; i < SIZE; i++) {
    if (next[i]) {
      ages[i] = alive[i] ? Math.min(ages[i] + 1, 255) : 1;
    } else {
      ages[i] = 0;
    }
    alive[i] = next[i];
  }
}

let _cacheFrame = -1;
let _cacheAlive: Uint8Array | null = null;
let _cacheAges: Uint8Array | null = null;

/**
 * Returns the GoL grid state at the given frame, computed deterministically from seed 42.
 * The returned arrays are the live module-level cache — do NOT mutate them.
 */
export function computeGridAtFrame(frame: number): { alive: Uint8Array; ages: Uint8Array } {
  const f = Math.max(0, frame);
  if (_cacheFrame < 0 || f < _cacheFrame) {
    // Recompute from seed (backward scrub or cold start)
    _cacheAlive = createGrid(42);
    _cacheAges = new Uint8Array(SIZE);
    _cacheFrame = 0;
  }
  for (let i = _cacheFrame; i < f; i++) {
    stepGrid(_cacheAlive!, _cacheAges!);
  }
  _cacheFrame = f;
  return { alive: _cacheAlive!, ages: _cacheAges! };
}

const COLOR_STOPS: Array<{ at: number; r: number; g: number; b: number }> = [
  { at: 1,  r: 0xc8, g: 0x88, b: 0x4a },
  { at: 5,  r: 0xe0, g: 0xa0, b: 0x60 },
  { at: 12, r: 0x60, g: 0xc8, b: 0xc0 },
  { at: 25, r: 0x0a, g: 0x30, b: 0x70 },
];

export function ageToRgb(age: number): { r: number; g: number; b: number } {
  if (age <= COLOR_STOPS[0].at) return { ...COLOR_STOPS[0] };
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  if (age >= last.at) return { ...last };
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i];
    const hi = COLOR_STOPS[i + 1];
    if (age >= lo.at && age <= hi.at) {
      const t = (age - lo.at) / (hi.at - lo.at);
      return {
        r: Math.round(lo.r + t * (hi.r - lo.r)),
        g: Math.round(lo.g + t * (hi.g - lo.g)),
        b: Math.round(lo.b + t * (hi.b - lo.b)),
      };
    }
  }
  return last;
}
