import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing, staticFile } from "remotion";
import { BG } from "../video-config";
import { CaptionBlock } from "../lib/CaptionBlock";

const PNG = staticFile("covers/showcase-flow.png");
const DURATION = 90;

/**
 * Beat 6 — Hero Fidenza (flow field).
 *
 * Previously loaded showcase-life.png and captioned "Game of Life / Conway 1970"
 * — Life had a moment in beat 2's grid and again in beat 7's rapid-fire, so a
 * dedicated hero beat for it was triple-coverage. Meanwhile Fidenza, which the
 * file name promises, was never given a hero slot despite being one of the
 * strongest "this could be a print" covers in the set.
 *
 * The flow-field cover has implicit motion (ink strokes following an fBm
 * vector field), so the camera should follow the eye's instinct: a slow
 * horizontal pan from right-of-center to center, not a static zoom. Zooms
 * compress; pans reveal. A flow-field cover earns a pan.
 */
export const HeroFidenza: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow horizontal pan — the cover is 1200×630 displayed at object-fit:cover
  // on a 1920×1080 canvas, which means it's slightly cropped. Translating
  // the image lets the viewer see *different parts* of the strokes over time,
  // which is what motion is for. 24px translate over 80 frames = 0.3px/frame,
  // imperceptibly slow but the brain reads it as "alive."
  const translateX = interpolate(frame, [0, DURATION], [12, -12], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Gentle scale settle — 1.06 → 1.02 keeps the edge crop tight throughout
  // the pan so the corners never expose the background BG color.
  const scale = interpolate(frame, [0, DURATION], [1.06, 1.02], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const captionOpacity = interpolate(frame, [22, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateX(${translateX}px)`,
          opacity: exitOpacity,
        }}
      >
        <Img
          src={PNG}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </AbsoluteFill>

      <CaptionBlock
        title="Fidenza"
        subtitle="Tyler Hobbs 2021"
        seed="flow-fidenza"
        theme="dark"
        anchor="bottom-left"
        opacity={captionOpacity * exitOpacity}
      />
    </AbsoluteFill>
  );
};
