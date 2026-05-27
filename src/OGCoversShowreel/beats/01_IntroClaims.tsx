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

const SNAP_FRAME = 130;  // Compiled snap happens at 4.33 seconds

export const IntroClaims: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasSnapped = frame >= SNAP_FRAME;

  // Blog Card geometry - Scaled up for mobile visibility
  const CARD_W = 1200;
  const CARD_IMG_H = Math.round(CARD_W / (1200 / 630)); // 630
  const CARD_TEXT_H = 260; // Increased room for larger text
  const CARD_H = CARD_IMG_H + CARD_TEXT_H; // 890

  // Animations & Micro-interactions

  // 1. Initial entrance of the card
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // 2. Impact spring when the cover generation finishes
  const cardScaleSnap = spring({
    frame: frame - SNAP_FRAME,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // 3. Staggered text reveal for the final blog details
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

  // 4. Flash effect at snap
  const flashOpacity = hasSnapped
    ? interpolate(frame - SNAP_FRAME, [0, 10], [0.6, 0], { extrapolateRight: "clamp" })
    : 0;

  // Compose the scales
  const baseScale = interpolate(entranceScale, [0, 1], [0.92, 1]);
  const scaleTransform = hasSnapped ? interpolate(cardScaleSnap, [0, 1], [0.95, 1]) : baseScale;
  const cardOpacity = interpolate(entranceScale, [0, 0.5], [0, 1]);

  // Exit fade at the end of the 240-frame sequence
  const exitOpacity = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity: exitOpacity }}>

      {/* ============================================================ */}
      {/* AUDIO CUES                                                   */}
      {/* ============================================================ */}

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
          background: "#15151a",
          transform: `scale(${scaleTransform})`,
          opacity: cardOpacity,
          boxShadow: hasSnapped
            ? "0 32px 100px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)"
            : "none",
          display: "flex",
          flexDirection: "column",
          transition: "border-radius 0.1s ease-out, background 0.1s ease-out"
        }}>

          {/* TOP: Image / Cover Area */}
          <div style={{
            width: "100%",
            height: CARD_IMG_H,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 80,
            background: hasSnapped ? "#0a0a0c" : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            borderBottom: hasSnapped ? `2px solid rgba(255,255,255,0.05)` : `2px dashed ${DIM}`,
            transition: "background 0.1s"
          }}>

            {/* Boring State (Pre-Snap): Default Blue Gradient with Blurry Outline / IMAGE label */}
            {!hasSnapped && (
              <div style={{
                width: 320,
                height: 180,
                border: "4px solid rgba(255,255,255,0.18)",
                borderRadius: 8,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.24)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)"
              }}>
                <span>Placeholder</span>
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
            background: hasSnapped ? "transparent" : "#1e293b",
            flex: 1,
            justifyContent: "center",
            transition: "background 0.1s"
          }}>
            <div style={{
              fontFamily: hasSnapped ? geist : "system-ui, -apple-system, sans-serif",
              fontSize: 24,
              color: hasSnapped ? DIM : "rgba(255,255,255,0.4)",
              letterSpacing: hasSnapped ? "0.08em" : "normal",
              textTransform: hasSnapped ? "uppercase" : "none",
              opacity: hasSnapped ? postDomainSpring : 0.7,
              transform: hasSnapped ? `translateY(${interpolate(postDomainSpring, [0, 1], [10, 0])}px)` : "none",
              fontWeight: hasSnapped ? "normal" : 500
            }}>
              yourblog.dev
            </div>
            <div style={{
              fontFamily: hasSnapped ? sourceSerif4 : "system-ui, -apple-system, sans-serif",
              fontWeight: hasSnapped ? 600 : 700,
              fontSize: 64,
              color: FG,
              letterSpacing: hasSnapped ? "-0.015em" : "normal",
              lineHeight: 1.1,
              opacity: hasSnapped ? postTitleSpring : 0.9,
              transform: hasSnapped ? `translateY(${interpolate(postTitleSpring, [0, 1], [15, 0])}px)` : "none"
            }}>
              Hoarfrost in Distributed Systems
            </div>
          </div>

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};