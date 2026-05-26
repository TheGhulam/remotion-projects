// OGCoversShowreel/beats/01_IntroClaims.tsx

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ACCENT, BG, DIM, FG } from "../video-config";
import { jetBrainsMono, sourceSerif4, geist } from "../fonts";

/**
 * Beat 1 — Terminal cold-open hook (frames 0–135, 4.5s).
 *
 * REWRITE NOTES (Mobile/X Optimized & Extended Hold)
 * -------------
 * Corner chrome removed to reduce noise. Center stage card scaled up massively
 * (from 740px to 1200px) with proportionally larger typography.
 * Duration extended from 105 to 135 frames. Internal animations sped up slightly
 * so the final card is visible for over 2.6 seconds (was ~1.3s), making it
 * easy to read on a fast-scrolling mobile timeline.
 */

const TYPE_START = 8;
const COMMAND = `$ npx better-covers generate`;
const FRAMES_PER_CHAR = 1.1; // Sped up from 1.4

// Timings for the "terminal logs" popping in before the final render snap
const LOG_1_FRAME = 40; // was 48
const LOG_2_FRAME = 46; // was 55
const SNAP_FRAME = 55;  // was 65

function typedSlice(frame: number, text: string, startFrame: number, fpc: number): string {
  if (frame < startFrame) return "";
  const n = Math.min(text.length, Math.floor((frame - startFrame) / fpc));
  return text.slice(0, n);
}

export const IntroClaims: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedCmd = typedSlice(frame, COMMAND, TYPE_START, FRAMES_PER_CHAR);
  const isTyping = frame >= TYPE_START && typedCmd.length < COMMAND.length;
  const showCaret = Math.floor(frame / 10) % 2 === 0;

  const hasSnapped = frame >= SNAP_FRAME;

  // Blog Card geometry - Scaled up for mobile visibility
  const CARD_W = 1200;
  const CARD_IMG_H = Math.round(CARD_W / (1200 / 630)); // 630
  const CARD_TEXT_H = 260; // Increased room for larger text
  const CARD_H = CARD_IMG_H + CARD_TEXT_H; // 890

  // Animations & Micro-interactions

  // 1. Initial entrance of the wireframe
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // 2. Terminal logs slide-up springs
  const log1Spring = spring({
    frame: frame - LOG_1_FRAME,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const log2Spring = spring({
    frame: frame - LOG_2_FRAME,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // 3. Impact spring when the cover generation finishes
  const cardScaleSnap = spring({
    frame: frame - SNAP_FRAME,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // 4. Staggered text reveal for the final blog details
  const postDomainSpring = spring({
    frame: frame - SNAP_FRAME,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const postTitleSpring = spring({
    frame: frame - (SNAP_FRAME + 4),
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // 5. Flash effect at snap
  const flashOpacity = hasSnapped
    ? interpolate(frame - SNAP_FRAME, [0, 10], [0.6, 0], { extrapolateRight: "clamp" })
    : 0;

  // Compose the scales
  const baseScale = interpolate(entranceScale, [0, 1], [0.92, 1]);
  const scaleTransform = hasSnapped ? interpolate(cardScaleSnap, [0, 1], [0.95, 1]) : baseScale;
  const cardOpacity = interpolate(entranceScale, [0, 0.5], [0, 1]);

  // Exit fade for the transition into Beat 2 (Grid Reveal)
  // Adjusted for extended sequence duration
  const exitOpacity = interpolate(frame, [125, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity: exitOpacity }}>

      {/* ============================================================ */}
      {/* AUDIO CUES                                                   */}
      {/* ============================================================ */}

      {/* Keyboard clicks */}
      {Array.from({ length: COMMAND.length }, (_, i) => {
        const fireAt = TYPE_START + Math.round(i * FRAMES_PER_CHAR);
        return (
          <Sequence key={i} from={fireAt} durationInFrames={15}>
            <Audio src={staticFile("sfx/keyboard-click.wav")} volume={0.2} />
          </Sequence>
        );
      })}

      {/* Snap / impact whoosh */}
      <Sequence from={SNAP_FRAME} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.15} />
      </Sequence>


      {/* ============================================================ */}
      {/* CENTER STAGE: THE WIREFRAME -> BLOG CARD COMPILE             */}
      {/* ============================================================ */}

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: CARD_W,
          height: CARD_H,
          // Brutalist dashed border initially, smooth subtle solid border on render
          border: hasSnapped ? `2px solid rgba(255,255,255,0.07)` : `2px dashed ${DIM}`,
          borderRadius: hasSnapped ? 16 : 6,
          overflow: "hidden",
          background: hasSnapped ? "#15151a" : "transparent",
          transform: `scale(${scaleTransform})`,
          opacity: cardOpacity,
          boxShadow: hasSnapped
            ? "0 32px 100px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)"
            : "none",
          display: "flex",
          flexDirection: "column",
          transition: "border-radius 0.1s ease-out, background 0.1s ease-out"
        }}>

          {/* TOP: Image / Terminal Area */}
          <div style={{
            width: "100%",
            height: CARD_IMG_H,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 80,
            background: hasSnapped ? "#0a0a0c" : "transparent",
            borderBottom: hasSnapped ? `2px solid rgba(255,255,255,0.05)` : `2px dashed ${DIM}`,
          }}>

            {/* Terminal State (Pre-Snap) */}
            {!hasSnapped && (
              <div style={{
                fontFamily: jetBrainsMono,
                fontSize: 48,
                color: FG,
                display: "flex",
                flexDirection: "column",
                gap: 24
              }}>
                <div>
                  <span style={{ color: ACCENT }}>{typedCmd.substring(0, 2)}</span>
                  {typedCmd.substring(2)}
                  {(isTyping || frame < LOG_1_FRAME) && <span style={{ opacity: showCaret ? 1 : 0 }}>█</span>}
                </div>

                {frame >= LOG_1_FRAME && (
                  <div style={{
                    color: DIM,
                    fontSize: 32,
                    opacity: log1Spring,
                    transform: `translateY(${interpolate(log1Spring, [0, 1], [15, 0])}px)`
                  }}>
                    {`> resolving seed "hoarfrost"...`}
                  </div>
                )}

                {frame >= LOG_2_FRAME && (
                  <div style={{
                    color: DIM,
                    fontSize: 32,
                    opacity: log2Spring,
                    transform: `translateY(${interpolate(log2Spring, [0, 1], [15, 0])}px)`
                  }}>
                    {`> rendering deterministic art...`}
                  </div>
                )}
              </div>
            )}

            {/* Generated Cover State (Post-Snap) */}
            {hasSnapped && (
              <>
                <Img
                  src={staticFile("covers/showcase-hoarfrost.png")}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Punchy satisfying flash on successful render */}
                <AbsoluteFill style={{ background: "#ffffff", opacity: flashOpacity, pointerEvents: "none" }} />
              </>
            )}
          </div>

          {/* BOTTOM: Blog Post Text Area */}
          <div style={{
            padding: "40px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: hasSnapped ? 1 : 0,
          }}>
            <div style={{
              fontFamily: geist,
              fontSize: 24,
              color: DIM,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: postDomainSpring,
              transform: `translateY(${interpolate(postDomainSpring, [0, 1], [10, 0])}px)`
            }}>
              yourblog.dev
            </div>
            <div style={{
              fontFamily: sourceSerif4,
              fontWeight: 600,
              fontSize: 64,
              color: FG,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              opacity: postTitleSpring,
              transform: `translateY(${interpolate(postTitleSpring, [0, 1], [15, 0])}px)`
            }}>
              Hoarfrost in Distributed Systems
            </div>
          </div>

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};