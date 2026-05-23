import React from "react";
import { ACCENT, DIM, FG } from "../video-config";
import { sourceSerif4, geist, jetBrainsMono } from "../fonts";

/**
 * Shared hero caption block — used by Beats 3, 5, 6, 7.
 *
 * Replaces ~30 lines of duplicated inline JSX in each beat.
 *
 * THEME:
 *   - "dark"  → light ink (FG, DIM, ACCENT) for dark covers
 *   - "light" → dark ink with a light scrim, for cream/light covers
 *               where the previous dark-only template was leaving
 *               subtitle text (gray DIM on cream gradient) effectively
 *               invisible during the rapid-fire beat.
 *
 * ANCHOR:
 *   - "bottom-left" (default) — Karmán, Game-of-Life, rapid-fire
 *   - "top-left"              — Harmonograph dark phase (the only
 *                               exception in the reel; kept because
 *                               the harmonograph art sits low-right
 *                               and the caption needs to clear it)
 *
 * The "light" theme intentionally avoids any halo/glow text-shadow.
 * Earlier "Light mode" callouts used a cream glow under dark text and
 * the result read as a halation bug. Here we let the type sit clean
 * on the artwork; light-mode covers have enough negative space at the
 * corner that no scrim is needed.
 */

type Theme = "dark" | "light";
type Anchor = "bottom-left" | "top-left";

export interface CaptionBlockProps {
  title: string;
  subtitle?: string;
  seed: string;
  opacity?: number;
  theme?: Theme;
  anchor?: Anchor;

  /** Override default 52px title size — used by rapid-fire (52) and harmonograph callouts (40). */
  titleSize?: number;
  /** Override default 30px subtitle size — used by rapid-fire (20). */
  subtitleSize?: number;
  /** Override default 22px seed size — used by rapid-fire (18). */
  seedSize?: number;
}

const DARK_INK = {
  title: FG,
  subtitle: DIM,
  seed: ACCENT,
};

// Lifted from the existing Beat 6 light-mode caption — verified
// legible against cream/harmonograph-light/flow-light/topo-light.
const LIGHT_INK = {
  title: "#1a1612",
  subtitle: "#4a3f2f",
  seed: "#8b5e2a",
};

const PADDING = {
  "bottom-left": { position: "absolute" as const, bottom: 72, left: 96 },
  "top-left": { position: "absolute" as const, top: 80, left: 96 },
};

export const CaptionBlock: React.FC<CaptionBlockProps> = ({
  title,
  subtitle,
  seed,
  opacity = 1,
  theme = "dark",
  anchor = "bottom-left",
  titleSize = 52,
  subtitleSize = 30,
  seedSize = 22,
}) => {
  const ink = theme === "dark" ? DARK_INK : LIGHT_INK;

  // Drop shadows are scoped to dark theme only. On light covers, a black
  // halo around dark text looks like print misregistration; cleaner without.
  const shadow =
    theme === "dark"
      ? {
          title: "0 2px 12px rgba(0,0,0,0.9)",
          subtitle: "0 1px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.95)",
          seed: "0 1px 6px rgba(0,0,0,0.9)",
        }
      : {
          title: "none",
          subtitle: "none",
          seed: "none",
        };

  return (
    <div style={{ ...PADDING[anchor], opacity }}>
      <div
        style={{
          fontFamily: sourceSerif4,
          fontWeight: 600,
          fontSize: titleSize,
          color: ink.title,
          textShadow: shadow.title,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: geist,
            fontWeight: 400,
            fontSize: subtitleSize,
            color: ink.subtitle,
            textShadow: shadow.subtitle,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          fontFamily: jetBrainsMono,
          fontSize: seedSize,
          color: ink.seed,
          marginTop: 14,
          textShadow: shadow.seed,
          letterSpacing: "0.04em",
        }}
      >
        seed: {seed}
      </div>
    </div>
  );
};
