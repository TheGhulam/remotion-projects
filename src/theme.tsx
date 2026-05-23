import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

// ── Global defaults for all remotion compositions ──────────────────
// Every new tech composition should import C, MONO, fs, and Shell from here.
// This guarantees light mode and scaled-up fonts without per-file boilerplate.

export const FONT_SCALE = 1.3;
/** Scale a design-spec px value to the global font scale. Usage: fontSize: fs(18) */
export const fs = (px: number) => px * FONT_SCALE;

export const MONO = "'Courier New', monospace";

export const C = {
  bg: "#fffcf0",
  grid: "#e6e4d9",
  border: "#dad8ce",
  cyan: "#0891b2",
  green: "#16a34a",
  amber: "#d97706",
  purple: "#7c3aed",
  blue: "#2563eb",
  red: "#dc2626",
  white: "#0f172a",
  dim: "#475569",
  dimmer: "#64748b",
  orange: "#ea580c",
};

/**
 * How many extra frames to hold on the last animation frame before the GIF loops.
 * At 30 fps, 150 frames = 5 seconds of freeze so viewers can read the final state.
 */
export const HOLD_FRAMES = 150;

/**
 * Drop-in replacement for `useCurrentFrame()`.
 * The returned frame advances normally but freezes at `durationInFrames - HOLD_FRAMES - 1`
 * so the last HOLD_FRAMES of the composition show a still final frame.
 * Increase the composition's durationInFrames in Root.tsx by HOLD_FRAMES to add the pause.
 */
export function useHeldFrame(): number {
  const raw = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return Math.min(raw, durationInFrames - HOLD_FRAMES - 1);
}

/** Shared shell: light background + subtle grid, for all tech-style compositions. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO, overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, opacity: 0.3 }} width="1200" height="630">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.grid} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1200" height="630" fill="url(#grid)" />
      </svg>
      {children}
    </AbsoluteFill>
  );
}
