import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, useCurrentFrame, staticFile } from "remotion";
import { BEATS, BG, FG, ACCENT } from "../video-config";
import { jetBrainsMono } from "../fonts";
import { useBassPulse } from "../lib/useBassPulse";

const SEEDS = [
  { slug: "clifford",    png: staticFile("covers/showcase-clifford.png") },
  { slug: "hello-world", png: staticFile("covers/showcase-clifford-hello-world.png") },
  { slug: "yep-by-fgb",  png: staticFile("covers/showcase-clifford-yep-by-fgb.png") },
];

const PHASE_DURATION = 40;
const ENTER_FRAMES = 20;
const EXIT_FRAMES = 6;

const CHANNEL_OFFSETS: [number, number][] = [
  [-28, -12],
  [ 22,  10],
  [  6, -22],
];

const ChannelDrift: React.FC<{ src: string; opacity: number; localFrame: number }> = ({
  src, opacity, localFrame,
}) => {
  const t = Math.min(1, localFrame / ENTER_FRAMES);
  const eased = 1 - Math.pow(1 - t, 3);

  if (t >= 1) {
    return (
      <AbsoluteFill style={{ opacity }}>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      {CHANNEL_OFFSETS.map(([ox, oy], i) => (
        <AbsoluteFill
          key={i}
          style={{
            transform: `translate(${(ox * (1 - eased)).toFixed(1)}px, ${(oy * (1 - eased)).toFixed(1)}px)`,
            opacity: 0.52,
          }}
        >
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

function phaseOpacity(frame: number, phaseIndex: number): number {
  const start = phaseIndex * PHASE_DURATION;
  const end   = start + PHASE_DURATION;
  if (frame < start || frame > end) return 0;
  return Math.min(
    interpolate(frame, [start, start + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [end - EXIT_FRAMES, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
}

function animateSlug(frame: number, phaseIndex: number, slug: string): string {
  const start = phaseIndex * PHASE_DURATION;
  const local = frame - start;
  if (local < 0) return "";
  const prev = phaseIndex > 0 ? SEEDS[phaseIndex - 1].slug : slug;
  if (phaseIndex === 0) return slug.slice(0, Math.floor(Math.min(1, local / 8) * slug.length));
  if (local < 6) return prev.slice(0, Math.floor(prev.length * (1 - local / 6)));
  return slug.slice(0, Math.floor(slug.length * Math.min(1, (local - 6) / 8)));
}

function computeTypingFrames(): number[] {
  const frames: number[] = [];
  let prevCount = 0;
  const totalFrames = SEEDS.length * PHASE_DURATION;
  for (let f = 0; f < totalFrames; f++) {
    const phase = Math.min(Math.floor(f / PHASE_DURATION), SEEDS.length - 1);
    const slug = animateSlug(f, phase, SEEDS[phase].slug);
    if (slug.length > prevCount) {
      frames.push(f);
    }
    prevCount = slug.length;
  }
  return frames;
}

const TYPING_FRAMES = computeTypingFrames();

export const HeroClifford: React.FC = () => {
  const frame = useCurrentFrame();
  const bass = useBassPulse(BEATS.heroClifford.from);

  const currentPhase = Math.min(Math.floor(frame / PHASE_DURATION), 2);
  const displayedSlug = animateSlug(frame, currentPhase, SEEDS[currentPhase].slug);
  const caret = Math.floor(frame / 15) % 2 === 0 ? "█" : " ";

  const op0 = phaseOpacity(frame, 0);
  const op1 = phaseOpacity(frame, 1);
  const op2 = phaseOpacity(frame, 2);

  // Pill glow modulates with bass — the slug "throbs" with the beat,
  // tying the command-line moment to the music.
  const glowAlpha = 0.18 + bass * 0.42;
  const glowSpread = 18 + bass * 18;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill>
        {op0 > 0 && (
          <AbsoluteFill style={{ opacity: op0 }}>
            <Img src={SEEDS[0].png} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </AbsoluteFill>
        )}
        {op1 > 0 && (
          <ChannelDrift src={SEEDS[1].png} opacity={op1} localFrame={Math.max(0, frame - PHASE_DURATION)} />
        )}
        {op2 > 0 && (
          <ChannelDrift src={SEEDS[2].png} opacity={op2} localFrame={Math.max(0, frame - 2 * PHASE_DURATION)} />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,4,2,0.65) 100%)" }}
      />

      {/* Typing click sounds — fires on each character reveal across all phases */}
      {TYPING_FRAMES.map((f) => (
        <Sequence key={f} from={f} durationInFrames={25}>
          <Audio src="https://remotion.media/mouse-click.wav" volume={0.25} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", bottom: 72, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 36,
            color: FG,
            background: "rgba(10,10,12,0.1)",
            padding: "16px 36px",
            borderRadius: 10,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            minWidth: "36ch",
            boxShadow: `0 0 ${glowSpread}px rgba(200,136,74,${glowAlpha}), 0 0 2px rgba(200,136,74,0.4)`,
            transformOrigin: "center",
          }}
        >
          <span style={{ color: ACCENT }}>$ </span>
          better-covers "
          <span style={{ color: "#7dd3fc" }}>{displayedSlug}</span>
          "{caret}
        </div>
      </div>
    </AbsoluteFill>
  );
};
