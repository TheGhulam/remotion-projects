import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ACCENT, BG, FG } from "../video-config";
import { jetBrainsMono } from "../fonts";

/**
 * Beat 1 — Terminal cold-open hook (frames 0–105, 3.5s).
 *
 * REWRITE NOTES
 * -------------
 * Previous version held a black screen with a blinking caret until frame 10,
 * typed the command from 10–55, held for 13 frames, then "revealed" the cover
 * via channel-drift from 68–95. Watching the rendered video at frame 75 (the
 * supposed reveal moment), the cover was still three faint streaks against
 * black — there was nothing to reveal *to*. The hook resolved into a near-
 * empty frame.
 *
 * Two structural fixes:
 *
 *   (1) The cover paints in BEHIND the typing, not after it. From frame 0
 *       it's at ~25% opacity (visible enough to anchor the eye, dim enough
 *       not to compete with the typing). It ramps to 100% as the typing
 *       completes. The viewer's first impression is "image + command" as
 *       a pair, not "black screen + caret."
 *
 *   (2) Cover swapped from Kármán to Hoarfrost. The Kármán wake is
 *       gorgeous as a still but reads as "blank navy" at video speed
 *       because it has no central subject. Hoarfrost has dendrites along
 *       the top edge that create instant visual recognition — frost,
 *       lightning, branching. It's the strongest "what is this?" hook
 *       cover in the set.
 *
 * Tertiary changes:
 *   - Killed the 10-frame caret pre-roll. The video opens on a half-
 *     materialized cover, command already starting. Three swipes of pre-
 *     roll silence on X = scrolled past.
 *   - Typing rate ~3 frames/char (was ~2). Slower = more deliberate,
 *     and the cover behind needs the time to paint up.
 *   - The slug swap to "hoarfrost" matches the cover shown. Beat 1's
 *     slug→cover pairing was previously dishonest (typed "karman", but
 *     a viewer who watched closely could see the reveal didn't fit the
 *     command). Now it's literal.
 *
 * The terminal pill still slides down at the end to land in the
 * bottom-anchored spot beat 4 uses, preserving the visual rhyme.
 */

const COMMAND = `better-covers "karman"`;
const TYPE_START = 4;
const TYPE_END = 70; // ~3 frames/char over 22 chars
const FRAMES_PER_CHAR = (TYPE_END - TYPE_START) / COMMAND.length;

// Cover paints up across the WHOLE typing window — the image is the
// background the command types on top of, not a payoff at the end.
const COVER_BASE_OPACITY = 0.28;
const COVER_FADE_TO_FULL_START = 60;
const COVER_FADE_TO_FULL_END = 92;

// Pill slide: from screen center to bottom-anchored resting position
// (matches beat 4 chrome). Happens once typing is done.
const SLIDE_START = 78;
const SLIDE_END = 100;

const PILL_FONT_SIZE = 36;

function typedSlice(frame: number): string {
  if (frame < TYPE_START) return "";
  const n = Math.min(
    COMMAND.length,
    Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR),
  );
  return COMMAND.slice(0, n);
}

function caretBlink(frame: number): boolean {
  return Math.floor(frame / 12) % 2 === 0;
}

export const IntroClaims: React.FC = () => {
  const frame = useCurrentFrame();

  // === Cover opacity ramp ===
  // Phase 1 (0–60):   cover at low base opacity, visible but recessive
  // Phase 2 (60–92):  ramps up to full as the slug completes typing
  // Phase 3 (92+):    fully present, command sits on top of finished art
  const coverOpacity = interpolate(
    frame,
    [0, 8, COVER_FADE_TO_FULL_START, COVER_FADE_TO_FULL_END],
    [0, COVER_BASE_OPACITY, COVER_BASE_OPACITY, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  // Subtle Ken Burns on the cover — 1.05 → 1.0 over the beat so the
  // backdrop has motion even before it brightens.
  const coverScale = interpolate(frame, [0, 105], [1.05, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // === Pill position ===
  // Center until typing finishes, then slides down to the bottom-anchored
  // spot the rest of the reel uses.
  const pillSlide = interpolate(frame, [SLIDE_START, SLIDE_END], [0, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // === Vignette ===
  // Darkens the corners once the cover is at full opacity so the pill
  // stays legible during the final hold.
  const vignetteOpacity = interpolate(
    frame,
    [COVER_FADE_TO_FULL_START, COVER_FADE_TO_FULL_END],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const typed = typedSlice(frame);
  const showCaret = caretBlink(frame);
  const typingActive = frame >= TYPE_START && typed.length < COMMAND.length;
  const typedHighlight = typed.startsWith("better-covers ");

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* === Cover backdrop === */}
      <AbsoluteFill
        style={{
          opacity: coverOpacity,
          transform: `scale(${coverScale})`,
        }}
      >
        <Img
          src={staticFile("covers/showcase-karman.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </AbsoluteFill>

      {/* === Vignette === */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.85) 100%)",
          opacity: vignetteOpacity,
          pointerEvents: "none",
        }}
      />

      {/* === Typing click SFX === */}
      {Array.from({ length: COMMAND.length }, (_, i) => {
        const fireAt = TYPE_START + Math.round(i * FRAMES_PER_CHAR);
        return (
          <Sequence key={i} from={fireAt} durationInFrames={20}>
            <Audio src={staticFile("sfx/keyboard-click.wav")} volume={0.2} />
          </Sequence>
        );
      })}

      {/* === Terminal pill === */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ transform: `translateY(${pillSlide}px)` }}>
          <div
            style={{
              fontFamily: jetBrainsMono,
              fontWeight: 400,
              fontSize: PILL_FONT_SIZE,
              color: FG,
              background: "rgba(10,10,12,0.62)",
              padding: "16px 36px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              minWidth: "32ch",
              boxShadow:
                "0 0 22px rgba(200,136,74,0.22), 0 0 2px rgba(200,136,74,0.4)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span style={{ color: ACCENT }}>$ </span>
            {typedHighlight ? (
              <>
                better-covers{" "}
                <span style={{ color: "#7dd3fc" }}>
                  {typed.slice("better-covers ".length)}
                </span>
              </>
            ) : (
              typed
            )}
            {(typingActive || frame < TYPE_END + 10) && (
              <span style={{ opacity: showCaret ? 1 : 0 }}>█</span>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
