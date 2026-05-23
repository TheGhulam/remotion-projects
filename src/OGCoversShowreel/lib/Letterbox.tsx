import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const BAR_H = 40;
const ANIM = 8;

export const Letterbox: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  const barH = interpolate(
    frame,
    [0, ANIM, duration - ANIM - 1, duration - 1],
    [0, BAR_H, BAR_H, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (barH <= 0) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: barH,
    background: "#000",
    zIndex: 10,
  };

  return (
    <>
      <div style={{ ...style, top: 0 }} />
      <div style={{ ...style, bottom: 0 }} />
    </>
  );
};
