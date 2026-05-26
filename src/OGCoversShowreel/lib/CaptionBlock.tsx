import React from "react";
import { ACCENT, DIM, FG } from "../video-config";
import { sourceSerif4, geist, jetBrainsMono } from "../fonts";

type Theme = "dark" | "light";
type Anchor = "bottom-left" | "top-left";

export interface CaptionBlockProps {
  title: string;
  subtitle?: string;
  seed: string;
  params?: string;
  opacity?: number;
  theme?: Theme;
  anchor?: Anchor;
  titleSize?: number;
  subtitleSize?: number;
  seedSize?: number;
}

const DARK_INK = { title: FG, subtitle: DIM, seed: ACCENT };
const LIGHT_INK = { title: "#1a1612", subtitle: "#4a3f2f", seed: "#8b5e2a" };

const PADDING = {
  "bottom-left": { position: "absolute" as const, bottom: 72, left: 96 },
  "top-left": { position: "absolute" as const, top: 80, left: 96 },
};

export const CaptionBlock: React.FC<CaptionBlockProps> = ({
  title, subtitle, seed, params, opacity = 1, theme = "dark", anchor = "bottom-left", titleSize = 52, subtitleSize = 30, seedSize = 22,
}) => {
  const ink = theme === "dark" ? DARK_INK : LIGHT_INK;

  const shadow = theme === "dark"
    ? { title: "0 2px 12px rgba(0,0,0,0.9)", subtitle: "0 1px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.95)", seed: "0 1px 6px rgba(0,0,0,0.9)" }
    : { title: "none", subtitle: "none", seed: "none" };

  // Free slide-in physics attached to the opacity fade for all hero blocks
  const slideY = (1 - opacity) * 15;

  return (
    <div style={{ ...PADDING[anchor], opacity, transform: `translateY(${slideY}px)` }}>
      <div style={{ fontFamily: sourceSerif4, fontWeight: 600, fontSize: titleSize, color: ink.title, textShadow: shadow.title, letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 10 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontFamily: geist, fontWeight: 400, fontSize: subtitleSize, color: ink.subtitle, textShadow: shadow.subtitle }}>
          {subtitle}
        </div>
      )}
      <div style={{ fontFamily: jetBrainsMono, fontSize: seedSize, color: ink.seed, marginTop: 14, textShadow: shadow.seed, letterSpacing: "0.04em" }}>
        seed: {seed}
      </div>
      {params && (
        <div style={{ fontFamily: jetBrainsMono, fontSize: seedSize, color: ink.seed, marginTop: 6, textShadow: shadow.seed, letterSpacing: "0.04em" }}>
          {params}
        </div>
      )}
    </div>
  );
};