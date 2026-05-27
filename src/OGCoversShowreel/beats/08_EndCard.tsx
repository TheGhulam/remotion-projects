import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ACCENT, BG, DIM, FG } from "../video-config";
import { sourceSerif4, jetBrainsMono, geist } from "../fonts";

const INSTALL_CMD = "npm i better-covers";
const POST_TITLE = "Hoarfrost in Distributed Systems";
const POST_DOMAIN = "yourblog.dev";

const CHANNEL_OFFSETS: Array<[number, number]> = [
  [-22, -10],
  [18, 8],
  [4, -18],
];

const CARD_W = 640;
const CARD_IMG_H = Math.round(CARD_W / (1200 / 630));
const CARD_TEXT_H = 188;
const CARD_H = CARD_IMG_H + CARD_TEXT_H;
const CARD_X = 1130;
const CARD_Y = (1080 - CARD_H) / 2;

const COL_X = 110;
const COL_RIGHT_GUARD = 1020;
const HEADLINE_Y = 376;
const PILL_Y = 632;

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Upgraded to Remotion springs for punchier, YC-style kinetic energy
  function useSpringUpIn(startAt: number, distancePx = 20) {
    const spr = spring({
      frame: frame - startAt,
      fps,
      config: { damping: 14, stiffness: 110 },
    });
    const o = interpolate(spr, [0, 1], [0, 1], { extrapolateRight: "clamp" });
    const ty = interpolate(spr, [0, 1], [distancePx, 0], { extrapolateRight: "clamp" });
    return { opacity: o, transform: `translateY(${ty}px)` };
  }

  const cardChrome = useSpringUpIn(2, 30);
  const headline = useSpringUpIn(20, 20);
  const cmd = useSpringUpIn(34, 15);

  const COVER_START = 8;
  const coverSpring = spring({ frame: frame - COVER_START, fps, config: { damping: 16, stiffness: 90 } });
  const coverOpacity = interpolate(coverSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  const float = Math.sin(frame / 18) * 3;

  // Typing effect for the npm install pill
  const TYPE_START = 42;
  const FPC = 1.2;
  const typedCmd = frame >= TYPE_START ? INSTALL_CMD.slice(0, Math.floor((frame - TYPE_START) / FPC)) : "";
  const isTyping = frame >= TYPE_START && typedCmd.length < INSTALL_CMD.length;
  const showCaret = Math.floor(frame / 10) % 2 === 0;

  // Copied to clipboard tooltip micro-interaction
  const tooltipStart = TYPE_START + INSTALL_CMD.length * FPC + 15;
  const tooltipSpring = spring({ frame: frame - tooltipStart, fps, config: { damping: 12, stiffness: 140 } });

  const endOpacity = interpolate(frame, [335, 350], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity: endOpacity }}>
      {/* Elegant ElevenLabs chime / ding on end card reveal */}
      <Sequence from={0} durationInFrames={60}>
        <Audio src={staticFile("sfx/chime.mp3")} volume={0.2} />
      </Sequence>

      {/* Keyboard clicks for the command */}
      {Array.from({ length: INSTALL_CMD.length }, (_, i) => (
        <Sequence key={i} from={TYPE_START + Math.round(i * FPC)} durationInFrames={15}>
          <Audio src={staticFile("sfx/keyboard-click.wav")} volume={0.15} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", left: COL_X, top: HEADLINE_Y, width: COL_RIGHT_GUARD - COL_X, ...headline }}>
        <div style={{ fontFamily: sourceSerif4, fontWeight: 700, fontSize: 92, color: FG, letterSpacing: "-0.025em", lineHeight: 1.02 }}>
          your blog
          <br />
          deserves better.
        </div>
      </div>

      <div style={{ position: "absolute", left: COL_X, top: PILL_Y, ...cmd }}>
        <div
          style={{
            position: "relative",
            fontFamily: jetBrainsMono,
            fontWeight: 500,
            fontSize: 36,
            color: FG,
            background: "rgba(20,20,24,0.6)",
            padding: "18px 28px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            letterSpacing: "0.02em",
            boxShadow: "0 0 22px rgba(200,136,74,0.22), 0 0 2px rgba(200,136,74,0.4)",
            display: "inline-block",
          }}
        >
          <span style={{ color: ACCENT }}>$ </span>
          {typedCmd}
          <span style={{ opacity: isTyping || showCaret ? 1 : 0 }}>█</span>

          {/* Micro-interaction: Tooltip */}
          <div
            style={{
              position: "absolute",
              top: -45,
              right: 20,
              background: FG,
              color: "#000",
              fontSize: 14,
              padding: "6px 12px",
              borderRadius: 6,
              fontWeight: 700,
              opacity: tooltipSpring,
              transform: `translateY(${interpolate(tooltipSpring, [0, 1], [10, 0])}px) scale(${interpolate(tooltipSpring, [0, 1], [0.8, 1])})`,
            }}
          >
            Copied!
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute", left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
          background: "#15151a", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 80px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.02)",
          overflow: "hidden",
          opacity: cardChrome.opacity,
          transform: `${cardChrome.transform} translateY(${float}px) scale(${interpolate(cardChrome.opacity, [0, 1], [0.95, 1])})`,
        }}
      >
        <div style={{ position: "relative", width: "100%", height: CARD_IMG_H, background: "#0a0a0c", overflow: "hidden" }}>
          {coverOpacity > 0 && (
            <>
              {CHANNEL_OFFSETS.map(([ox, oy], i) => {
                const drift = 1 - coverSpring;
                return (
                  <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${(ox * drift).toFixed(1)}px, ${(oy * drift).toFixed(1)}px)`, opacity: 0.5 * coverOpacity }}>
                    <Img src={staticFile("covers/showcase-hoarfrost.png")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                );
              })}
              {coverSpring >= 0.92 && (
                <Img src={staticFile("covers/showcase-hoarfrost.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </>
          )}
        </div>

        {/* Improved authentic blog preview spacing and details */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #8b5e2a)` }} />
            <div style={{ fontFamily: geist, fontSize: 13, color: DIM, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
              {POST_DOMAIN}
            </div>
          </div>
          <div style={{ fontFamily: sourceSerif4, fontWeight: 600, fontSize: 28, color: FG, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
            {POST_TITLE}
          </div>
          <div style={{ fontFamily: geist, fontSize: 15, color: DIM, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            A short note on consensus failure modes, with diagrams borrowed from Witten &amp; Sander 1981.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};