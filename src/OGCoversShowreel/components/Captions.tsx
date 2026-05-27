import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { geist } from "../fonts";

interface CaptionSegment {
  from: number;
  to: number;
  text: string;
}

const CAPTIONS: CaptionSegment[] = [
  // Rachel Segment 1 (Starts frame 20)
  {
    from: 20,
    to: 115,
    text: "Your links need a better preview.",
  },
  {
    from: 120,
    to: 285,
    text: "Better Covers adds stunning, one-of-a-kind cover art to your links.",
  },
  
  // Rachel Segment 2 (Starts frame 320)
  {
    from: 320,
    to: 470,
    text: "Every image is based off a unique seed derived from your URL.",
  },
  
  // Rachel Segment 3 (Starts frame 500)
  {
    from: 500,
    to: 650,
    text: "It's a beautiful fingerprint of your ideas, running locally with no API calls.",
  },
  
  // Rachel Segment 4 (Starts frame 1450)
  {
    from: 1450,
    to: 1530,
    text: "Your blog deserves better than a generic preview.",
  },
  {
    from: 1530,
    to: 1645,
    text: "Just run npm install better-covers.",
  },
];

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active caption segment
  const segment = CAPTIONS.find((c) => frame >= c.from && frame <= c.to);

  if (!segment) return null;

  // Punchy, modern scale-in entrance standard for social captions
  const entrySpring = spring({
    frame: frame - segment.from,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
  });

  // Fast fade out
  const exitFramesLeft = segment.to - frame;
  const exitOpacity = interpolate(exitFramesLeft, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = entrySpring * exitOpacity;
  const scale = interpolate(entrySpring, [0, 1], [0.96, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 84, // position elegantly at the lower third
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 150, // render above letterboxing/other elements
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: `${geist}, system-ui, -apple-system, sans-serif`,
          fontSize: 38,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.85)", // X-native translucent black background box
          padding: "10px 24px",
          borderRadius: 8,
          maxWidth: "75%",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
      >
        {segment.text}
      </div>
    </div>
  );
};
