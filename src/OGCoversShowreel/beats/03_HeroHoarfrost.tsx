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
import {
  CELL,
  COLS,
  computeGridAtFrame,
  ROWS,
  cellToRgba,
  lifeReproCaption,
} from "../lib/gameOfLife";

export const HeroKarman: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repro = lifeReproCaption();

  useEffect(() => {
    const handle = delayRender("GoL canvas draw");
    const canvas = canvasRef.current;
    if (!canvas) { continueRender(handle); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { continueRender(handle); return; }

    try {
      const { alive } = computeGridAtFrame(frame);

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

      for (let i = 0; i < alive.length; i++) {
        if (!alive[i]) continue;
        const col = i % COLS;
        const row = (i / COLS) | 0;
        const { r, g, b, a } = cellToRgba(col, row);
        if (a <= 0) continue;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2);
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
        seed={repro.seed}
        params={repro.params}
        theme="dark"
        anchor="bottom-left"
        opacity={captionOpacity * exitOpacity}
      />
    </AbsoluteFill>
  );
};
