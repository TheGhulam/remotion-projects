import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, ACCENT, FG } from "../video-config";
import { COVERS, Cover } from "../lib/covers";
import { sourceSerif4, jetBrainsMono } from "../fonts";

/**
 * Beat 2 — Grid reveal (frames 135–280, 4.8s).
 *
 * Reduced from 165 frames to 145 frames to give the IntroClaims card
 * more reading time without misaligning later beats. Typing speeds and
 * exit intervals have been slightly condensed to compensate.
 */

const TEXT = "every cover, uniquely generated";
const TYPE_START = 80;
const FRAMES_PER_CHAR = 1.6;
const TYPE_END = TYPE_START + TEXT.length * FRAMES_PER_CHAR; // ~130

function getTypedText(frame: number): string {
  const chars = Math.min(TEXT.length, Math.max(0, Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR)));
  return TEXT.slice(0, chars);
}

function cursorVisible(frame: number): boolean {
  return Math.floor(frame / 12) % 2 === 0;
}

const GRID_WIDTH = 1480;
const CELL_ASPECT = 1200 / 630;
const COLS = 4;
const ROWS = 4;
const GAP = 16;

const CELL_W = (GRID_WIDTH - GAP * (COLS - 1)) / COLS;
const CELL_H = CELL_W / CELL_ASPECT;
const GRID_HEIGHT = ROWS * CELL_H + GAP * (ROWS - 1);

const GRID_TOP_OFFSET = -70;

const TOPO_LIGHT: Cover = {
  ...COVERS[12],
  png: staticFile("covers/showcase-topo-light.png"),
  theme: "light",
};

const GRID_ITEMS = [
  ...COVERS,
  TOPO_LIGHT,
];

const EXIT_START = 135;
const EXIT_END = 145;

export const GridReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = interpolate(frame, [EXIT_START, EXIT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [EXIT_START, EXIT_END], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typedText = getTypedText(frame);
  const isDoneTyping = typedText.length === TEXT.length;
  const showCursor = !isDoneTyping && frame >= TYPE_START && cursorVisible(frame);
  const textFadeIn = interpolate(frame, [TYPE_START, TYPE_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = textFadeIn * exitOpacity;

  return (
    <AbsoluteFill style={{ background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: GRID_WIDTH,
          height: GRID_HEIGHT,
          position: "relative",
          opacity: exitOpacity,
          transform: `translateY(${GRID_TOP_OFFSET}px) scale(${exitScale})`,
        }}
      >
        {GRID_ITEMS.map((cover, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = col * (CELL_W + GAP);
          const y = row * (CELL_H + GAP);

          const startFrame = Math.floor(i * 2.5);
          const localFrame = Math.max(0, frame - startFrame);

          const scale = spring({
            frame: localFrame,
            fps,
            config: { damping: 12, stiffness: 120 },
            durationInFrames: 30,
          });
          const mappedScale = interpolate(scale, [0, 1], [0.6, 1]);
          const opacity = interpolate(scale, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: CELL_W,
                height: CELL_H,
                transform: `scale(${mappedScale})`,
                opacity,
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              {cover ? (
                <>
                  <Img
                    src={cover.png}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "20px 14px 10px",
                      background: cover.theme === "light"
                        ? "linear-gradient(to top, rgba(244,237,218,0.88) 0%, transparent 100%)"
                        : "linear-gradient(to top, rgba(8,8,10,0.82) 0%, transparent 100%)",
                      fontFamily: jetBrainsMono,
                      fontSize: 11,
                      color: cover.theme === "light" ? "#8b5e2a" : ACCENT,
                      letterSpacing: "0.05em",
                    }}
                  >
                    seed: {cover.slug}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            position: "relative",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: sourceSerif4,
              fontWeight: 600,
              fontSize: 44,
              color: FG,
              letterSpacing: "-0.015em",
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
          >
            {typedText}
            {showCursor && (
              <span style={{ color: ACCENT, marginLeft: 4 }}>|</span>
            )}
          </div>
        </div>
      </div>

      {/* Typing click sounds */}
      {Array.from({ length: TEXT.length }, (_, i) => (
        <Sequence key={i} from={TYPE_START + Math.round(i * FRAMES_PER_CHAR)} durationInFrames={20}>
          <Audio src={staticFile("sfx/keyboard-click.wav")} volume={0.18} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};