import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ACCENT, BG, DIM, FG } from "../video-config";
import { sourceSerif4, jetBrainsMono, geist } from "../fonts";

const INSTALL_CMD = "npm i better-covers";
const POST_TITLE = "Hoarfrost in Distributed Systems";
const POST_DOMAIN = "yourblog.dev";

/**
 * Beat 8 — End card (frames 950–1080, 4.3 seconds).
 *
 * LAYOUT NOTES
 * ------------
 * Two-column composition on a 1920×1080 canvas, expressed in EXPLICIT
 * ABSOLUTE PIXEL COORDINATES rather than two stacked AbsoluteFills with
 * flex. The previous version layered a flex-end card column over a
 * flex-start headline column and the card collided with the install
 * pill when the canvas was rendered at preview scale.
 *
 *   Canvas:  1920 × 1080
 *   Card:    640 × 524, top-right at (1130, 278)        — clears the
 *                                                          headline column
 *                                                          entirely
 *   Headline column: left edge at 110, max-width 920    — leaves a
 *                                                          100px gap
 *                                                          between column
 *                                                          and card
 *
 * Vertical: headline + pill are vertically centered as a single block,
 * computed manually so the install pill sits at y ≈ 720.
 */

const CHANNEL_OFFSETS: Array<[number, number]> = [
  [-22, -10],
  [18, 8],
  [4, -18],
];

// Card geometry — fixed pixel positions, NOT flex-relative
const CARD_W = 640;
const CARD_IMG_H = Math.round(CARD_W / (1200 / 630)); // 336
const CARD_TEXT_H = 188;
const CARD_H = CARD_IMG_H + CARD_TEXT_H; // 524
const CARD_X = 1130; // top-left x
const CARD_Y = (1080 - CARD_H) / 2; // vertically centered → 278

// Headline column — also fixed pixel positions.
// HEADLINE_Y / PILL_Y chosen so the headline+pill block (~328px tall)
// is vertically centered to match the card's vertical center (y=540).
// Headline block: 192px (two 92px lines @ 1.02 line-height)
// Gap before pill: 64px
// Pill block: 72px (36px font + 18px*2 padding)
// Total: 328px → top at (1080-328)/2 = 376
const COL_X = 110;
const COL_RIGHT_GUARD = 1020; // hard right limit, leaves 110px gap before card
const HEADLINE_Y = 376;
const PILL_Y = 632; // = HEADLINE_Y + 192 + 64

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();

  function fadeUpIn(startAt: number, distancePx = 14) {
    const o = interpolate(frame, [startAt, startAt + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const ty = interpolate(frame, [startAt, startAt + 14], [distancePx, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { opacity: o, transform: `translateY(${ty}px)` };
  }

  const cardChrome = fadeUpIn(2, 18);
  const headline = fadeUpIn(20);
  const cmd = fadeUpIn(34, 10);

  const COVER_START = 8;
  const COVER_END = 30;
  const coverProgress = interpolate(
    frame,
    [COVER_START, COVER_END],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const coverOpacity = interpolate(coverProgress, [0, 0.25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tiny float on the card so the final 4 seconds aren't frozen
  const float = Math.sin(frame / 18) * 2;

  // End-of-beat settle
  const endOpacity = interpolate(frame, [115, 128], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity: endOpacity }}>
      {/* ============================================================ */}
      {/* HEADLINE — absolute-positioned, top-left anchored             */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: HEADLINE_Y,
          width: COL_RIGHT_GUARD - COL_X,
          ...headline,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 700,
            fontSize: 92,
            color: FG,
            letterSpacing: "-0.025em",
            lineHeight: 1.02,
          }}
        >
          your blog
          <br />
          deserves better.
        </div>
      </div>

      {/* ============================================================ */}
      {/* INSTALL PILL — absolute-positioned below headline             */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: PILL_Y,
          ...cmd,
        }}
      >
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontWeight: 500,
            fontSize: 36,
            color: FG,
            background: "rgba(20,20,24,0.6)",
            padding: "18px 28px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            letterSpacing: "0.02em",
            boxShadow:
              "0 0 22px rgba(200,136,74,0.22), 0 0 2px rgba(200,136,74,0.4)",
            display: "inline-block",
          }}
        >
          <span style={{ color: ACCENT }}>$ </span>
          {INSTALL_CMD}
        </div>
      </div>

      {/* ============================================================ */}
      {/* LINK-PREVIEW CARD — absolute-positioned, top-right            */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          background: "#15151a",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 24px 80px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.02)",
          overflow: "hidden",
          ...cardChrome,
          // Compose card-chrome transform with float oscillation
          transform: `${cardChrome.transform} translateY(${float}px)`,
        }}
      >
        {/* OG image slot — cover paints in with channel-drift */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: CARD_IMG_H,
            background: "#0a0a0c",
            overflow: "hidden",
          }}
        >
          {coverOpacity > 0 && (
            <>
              {CHANNEL_OFFSETS.map(([ox, oy], i) => {
                const drift = 1 - coverProgress;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: `translate(${(ox * drift).toFixed(1)}px, ${(
                        oy * drift
                      ).toFixed(1)}px)`,
                      opacity: 0.5 * coverOpacity,
                    }}
                  >
                    <Img
                      src={staticFile("covers/showcase-hoarfrost.png")}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                );
              })}
              {coverProgress >= 0.92 && (
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
              )}
            </>
          )}
        </div>

        {/* Rich-preview text block */}
        <div
          style={{
            padding: "22px 26px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: geist,
              fontSize: 16,
              color: DIM,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {POST_DOMAIN}
          </div>
          <div
            style={{
              fontFamily: sourceSerif4,
              fontWeight: 600,
              fontSize: 28,
              color: FG,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {POST_TITLE}
          </div>
          <div
            style={{
              fontFamily: geist,
              fontSize: 16,
              color: DIM,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            A short note on consensus failure modes, with diagrams
            borrowed from Witten &amp; Sander 1981.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
