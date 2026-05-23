import React, { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BG } from "../video-config";
import { CaptionBlock } from "../lib/CaptionBlock";
import { CELL, COLS, computeGridAtFrame, ROWS, ageToRgb } from "../lib/gameOfLife";

export const HeroKarman: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handle = delayRender("GoL canvas draw");
    const canvas = canvasRef.current;
    if (!canvas) { continueRender(handle); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { continueRender(handle); return; }

    try {
      const { alive, ages } = computeGridAtFrame(frame);

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

      // Glow pass — larger rect, low opacity
      for (let i = 0; i < alive.length; i++) {
        if (!alive[i]) continue;
        const col = i % COLS;
        const row = (i / COLS) | 0;
        const { r, g, b } = ageToRgb(ages[i]);
        ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.fillRect(col * CELL - 3, row * CELL - 3, CELL + 6, CELL + 6);
      }

      // Cell pass — crisp 9×9 rects (1px gap for grid effect)
      for (let i = 0; i < alive.length; i++) {
        if (!alive[i]) continue;
        const col = i % COLS;
        const row = (i / COLS) | 0;
        const { r, g, b } = ageToRgb(ages[i]);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(col * CELL, row * CELL, CELL - 1, CELL - 1);
      }
    } finally {
      continueRender(handle);
    }
  }, [frame]);

  const captionOpacity = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        style={{ width: "100%", height: "100%", opacity: exitOpacity }}
      />
      {/* Horizontal vignette — fades left/right edges to BG, matching showcase-life.png */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to right, ${BG} 0%, transparent 22%, transparent 78%, ${BG} 100%), linear-gradient(to top, ${BG} 0%, transparent 30%)`,
          opacity: exitOpacity,
          pointerEvents: "none",
        }}
      />
      <CaptionBlock
        title="Game of Life"
        subtitle="Conway, 1970"
        seed="conway"
        theme="dark"
        anchor="bottom-left"
        opacity={captionOpacity * exitOpacity}
      />
    </AbsoluteFill>
  );
};
