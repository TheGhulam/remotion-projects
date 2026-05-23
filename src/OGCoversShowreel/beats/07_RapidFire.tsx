import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, useCurrentFrame, staticFile } from "remotion";
import { BG, rapidFireCutFrame } from "../video-config";
import { RAPID_FIRE_COVERS } from "../lib/covers";
import { CaptionBlock } from "../lib/CaptionBlock";

/**
 * Beat 7 — Rapid-fire. Cuts on librosa-detected beats (see yep-by-fgb-beats.json).
 *
 * REWRITE NOTES
 * -------------
 * Previously every cover used the same punch-in motion (scale 1.04→1.0
 * over 5 frames, opacity 0.85→1.0). With 21 covers all moving identically,
 * the eye stops registering the motion after ~3 cuts and what was meant
 * to be rapid-fire reads as a slow slideshow with hard cuts. The covers
 * are doing nothing — the cuts are doing all the work, and cuts alone
 * don't generate energy.
 *
 * Fix: rotate through 4 different motion treatments. Adjacent covers
 * never share a treatment, so the eye has to re-engage on every cut.
 *
 *   - PUNCH:  scale 1.06→1.0, opacity 0.7→1.0 (the original treatment)
 *   - SLIDE:  translateX from +80px → 0, opacity 0→1
 *   - DROP:   translateY from -40px → 0, opacity 0→1
 *   - PUSH:   scale 0.94→1.0 from below, opacity 0→1
 *
 * Treatments are assigned by `i % 4` so the pattern is
 * PUNCH/SLIDE/DROP/PUSH/PUNCH/... repeating. The viewer doesn't
 * consciously parse the pattern; they just feel that each cover
 * "arrives differently" and the beat stays alive.
 *
 * Also: the punch is now stronger (0.7 opacity start, 1.06 scale start)
 * so even the original treatment hits harder than before.
 */

function coverIndexAtFrame(frame: number): number {
  for (let i = RAPID_FIRE_COVERS.length - 1; i >= 0; i--) {
    if (frame >= rapidFireCutFrame(i)) return i;
  }
  return 0;
}

type MotionStyle = "punch" | "slide" | "drop" | "push";
const MOTION_CYCLE: MotionStyle[] = ["punch", "slide", "drop", "push"];

function getMotion(style: MotionStyle, localFrame: number) {
  // All motions complete in 6 frames — well before the next detected beat cut.
  const t = Math.min(1, localFrame / 6);

  switch (style) {
    case "punch": {
      const scale = interpolate(t, [0, 1], [1.06, 1.0]);
      const opacity = interpolate(t, [0, 0.4], [0.7, 1.0], { extrapolateRight: "clamp" });
      return { transform: `scale(${scale})`, opacity };
    }
    case "slide": {
      const tx = interpolate(t, [0, 1], [80, 0]);
      const opacity = interpolate(t, [0, 0.4], [0, 1.0], { extrapolateRight: "clamp" });
      return { transform: `translateX(${tx}px)`, opacity };
    }
    case "drop": {
      const ty = interpolate(t, [0, 1], [-40, 0]);
      const opacity = interpolate(t, [0, 0.4], [0, 1.0], { extrapolateRight: "clamp" });
      return { transform: `translateY(${ty}px)`, opacity };
    }
    case "push": {
      const ty = interpolate(t, [0, 1], [40, 0]);
      const scale = interpolate(t, [0, 1], [0.94, 1.0]);
      const opacity = interpolate(t, [0, 0.4], [0, 1.0], { extrapolateRight: "clamp" });
      return { transform: `translateY(${ty}px) scale(${scale})`, opacity };
    }
  }
}

export const RapidFire: React.FC = () => {
  const frame = useCurrentFrame();
  const coverIndex = coverIndexAtFrame(frame);
  const cover = RAPID_FIRE_COVERS[coverIndex];
  const localFrame = frame - rapidFireCutFrame(coverIndex);
  const motion = getMotion(MOTION_CYCLE[coverIndex % MOTION_CYCLE.length], localFrame);

  const scrim =
    cover.theme === "light"
      ? "linear-gradient(to top, rgba(244,237,218,0.92) 0%, rgba(244,237,218,0.5) 18%, transparent 38%)"
      : "linear-gradient(to top, rgba(8,8,10,0.88) 0%, transparent 28%)";

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Tick on each cover swap — very low in the mix, like a film leader countdown */}
      {RAPID_FIRE_COVERS.map((_, i) => (
        <Sequence key={`tick-${i}`} from={rapidFireCutFrame(i)} durationInFrames={10}>
          <Audio src={staticFile("sfx/tick.mp3")} volume={0.12} />
        </Sequence>
      ))}

      <AbsoluteFill style={motion}>
        <Img
          src={cover.png}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </AbsoluteFill>

      {/* Theme-aware caption scrim */}
      <AbsoluteFill style={{ background: scrim }} />

      <CaptionBlock
        title={cover.title}
        subtitle={cover.subtitle}
        seed={cover.slug}
        theme={cover.theme}
        anchor="bottom-left"
        titleSize={52}
        subtitleSize={20}
        seedSize={18}
      />
    </AbsoluteFill>
  );
};
