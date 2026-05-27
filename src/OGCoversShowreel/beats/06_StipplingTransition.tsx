import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, useCurrentFrame, staticFile } from "remotion";
import { BG } from "../video-config";
import { sourceSerif4 } from "../fonts";
import { CaptionBlock } from "../lib/CaptionBlock";

const DARK_PNG = staticFile("covers/showcase-harmonograph.png");
const LIGHT_PNG = staticFile("covers/showcase-harmonograph-light.png");

const DROP_START = 40;
const DROP_DURATION = 50;

export const HarmonographTransition: React.FC = () => {
  const frame = useCurrentFrame();

  const t = (frame - DROP_START) / DROP_DURATION;
  const eased = t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  const radius = interpolate(eased, [0, 1], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption on dark bg — fades out before the circle fully arrives
  const darkCaptionOpacity = interpolate(
    frame,
    [0, 8, 36, 46],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Caption on light bg — fades in as circle starts, persists to end
  const lightCaptionOpacity = interpolate(
    frame,
    [38, 48, 110, 120],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "Dark mode" callout — visible before the drop, fades out as circle starts
  const darkCalloutOpacity = interpolate(
    frame,
    [0, 8, 36, 46],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "Light mode" callout — fades in right as the circle begins
  const lightCalloutOpacity = interpolate(
    frame,
    [38, 48, 92, 100],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Whoosh fires 5 frames ahead of the circle wipe so it lands on the cut */}
      <Sequence from={DROP_START - 5} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.12} />
      </Sequence>
      {/* Dark layer */}
      <AbsoluteFill>
        <Img
          src={DARK_PNG}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </AbsoluteFill>

      {/* Light layer revealed by expanding circle */}
      {frame >= DROP_START && (
        <AbsoluteFill style={{ clipPath: `circle(${radius}% at 50% 50%)` }}>
          <Img
            src={LIGHT_PNG}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </AbsoluteFill>
      )}

      {/* Caption (dark bg) — top-left anchor, kept here because the harmonograph
          art sits low-right; caption at bottom would collide with it */}
      <CaptionBlock
        title="Harmonograph"
        subtitle="Goold 1844"
        seed="harmonograph"
        theme="dark"
        anchor="top-left"
        opacity={darkCaptionOpacity}
      />

      {/* Caption (light bg) — same anchor, dark ink */}
      <CaptionBlock
        title="Harmonograph"
        subtitle="Goold 1844"
        seed="harmonograph"
        theme="light"
        anchor="top-left"
        opacity={lightCaptionOpacity}
      />

      {/* "Dark mode" callout — bottom-right, light ink */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 100,
          opacity: darkCalloutOpacity,
          fontFamily: sourceSerif4,
          fontWeight: 600,
          fontSize: 40,
          color: "#efeae0",
          textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          textAlign: "right",
        }}
      >
        Dark mode
      </div>

      {/* "Light mode" callout — bottom-right, dark ink.
          Previously had a cream "0 0 3px / 0 0 10px" glow under the text
          that read as halation on the cream background. Removed entirely —
          dark serif on cream is legible without any halo. */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 100,
          opacity: lightCalloutOpacity,
          fontFamily: sourceSerif4,
          fontWeight: 600,
          fontSize: 40,
          color: "#1a1612",
          textAlign: "right",
        }}
      >
        Light mode
      </div>
    </AbsoluteFill>
  );
};
