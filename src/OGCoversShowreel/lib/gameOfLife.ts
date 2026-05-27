// src/OGCoversShowreel/lib/gameOfLife.ts
//
// Matches better-covers/cover-pipeline/styles/life.ts and
// PhenomenaCoversConsolidated.tsx renderLife — seed from "life-conway",
// 32% density, 22 generations, radial amber→slate coloring, bottom fade.

export const COLS = 192; // 192 × 10px = 1920
export const ROWS = 108; // 108 × 10px = 1080
export const CELL = 10;
export const CANVAS_H = ROWS * CELL;
export const LIFE_GENERATIONS = 22;
export const LIFE_INITIAL_DENSITY = 0.32;
export const LIFE_FADE_START = 0.67;
export const LIFE_FADE_END = 0.95;

const SIZE = COLS * ROWS;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Slug passed to hashStr — matches better-covers PhenomenaCoversConsolidated seed field. */
export const LIFE_SEED_SLUG = "life-conway";

/** Caption lines derived from the same constants that drive the simulation. */
export function lifeReproCaption(): { seed: string } {
  return {
    seed: LIFE_SEED_SLUG,
  };
}

export function createGrid(): Uint8Array {
  const rand = mulberry32(hashStr(LIFE_SEED_SLUG));
  const alive = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    alive[i] = rand() < LIFE_INITIAL_DENSITY ? 1 : 0;
  }
  return alive;
}

export function stepGrid(alive: Uint8Array): void {
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
      next[i] = alive[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  alive.set(next);
}

let _cacheFrame = -1;
let _cacheAlive: Uint8Array | null = null;

/**
 * Returns the GoL grid at the given frame, capped at LIFE_GENERATIONS so the
 * simulation settles on the same snapshot as showcase-life.png.
 */
export function computeGridAtFrame(frame: number): { alive: Uint8Array } {
  const f = Math.min(Math.max(0, frame), LIFE_GENERATIONS);
  if (_cacheFrame < 0 || f < _cacheFrame) {
    _cacheAlive = createGrid();
    _cacheFrame = 0;
  }
  for (let i = _cacheFrame; i < f; i++) {
    stepGrid(_cacheAlive!);
  }
  _cacheFrame = f;
  return { alive: _cacheAlive! };
}

function legibilityAlpha(yNorm: number): number {
  if (yNorm <= LIFE_FADE_START) return 1;
  if (yNorm >= LIFE_FADE_END) return 0;
  const t = (yNorm - LIFE_FADE_START) / (LIFE_FADE_END - LIFE_FADE_START);
  return 1 - t * t * (3 - 2 * t);
}

/** Warm amber at center, cool slate at edges — matches better-covers life.ts */
export function cellToRgba(col: number, row: number): { r: number; g: number; b: number; a: number } {
  const centerR = 200;
  const centerG = 136;
  const centerB = 74;
  const edgeR = 60;
  const edgeG = 78;
  const edgeB = 95;

  const dx = (col - COLS / 2) / COLS;
  const dy = (row - ROWS / 2) / ROWS;
  const t = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.6);
  const yPx = row * CELL + CELL / 2;
  const fade = legibilityAlpha(yPx / CANVAS_H);

  return {
    r: Math.round(centerR + (edgeR - centerR) * t),
    g: Math.round(centerG + (edgeG - centerG) * t),
    b: Math.round(centerB + (edgeB - centerB) * t),
    a: fade,
  };
}
