import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { LightLeak } from "@remotion/light-leaks";

// ── Palette (warm / humanistic light mode) ────────────────────────
const C = {
  bg:            "#FDF6EE",
  textPrimary:   "#3D3229",
  textSecondary: "#7A6E62",
  textMuted:     "#A89E94",
  caught:        "#6B8F71",
  missed:        "#D4735E",
  missedDeep:    "#C0513A",
  accentGold:    "#D4A85C",
  divider:       "#E8DDD2",
  dotBorder:     "#D6C9BC",
  warmGray:      "#C8BDB4",
};

// ── Typography ────────────────────────────────────────────────────
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Segoe UI', 'Calibri', system-ui, sans-serif";

const W = 1200;
const H = 630;

// ── Helpers ───────────────────────────────────────────────────────
function lerp(
  frame: number,
  from: number,
  to: number,
  start: number,
  end: number,
  easing?: (t: number) => number
) {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

// ── Patient Data ──────────────────────────────────────────────────
// young (0–14):  5 caught / 10 missed  = 33.3% recall  ≈ 33.5%
// middle (15–49): 23 caught / 12 missed = 65.7% recall ≈ 64.8%
// senior (50–99): 46 caught / 4 missed  = 92% recall   → 74% overall
type AgeGroup = "young" | "middle" | "senior";

interface Patient {
  idx: number;
  age: AgeGroup;
  caught: boolean;
}

const PATIENTS: Patient[] = (() => {
  const a: Patient[] = [];
  for (let i = 0; i < 15; i++)
    a.push({ idx: i, age: "young", caught: i < 5 });
  for (let i = 0; i < 35; i++)
    a.push({ idx: 15 + i, age: "middle", caught: i < 23 });
  for (let i = 0; i < 50; i++)
    a.push({ idx: 50 + i, age: "senior", caught: i < 46 });
  return a;
})();

const AGE_LOCAL: Map<number, number> = new Map();
const _ageCounts: Record<AgeGroup, number> = { young: 0, middle: 0, senior: 0 };
for (const p of PATIENTS) {
  AGE_LOCAL.set(p.idx, _ageCounts[p.age]++);
}

// ── Position Helpers ──────────────────────────────────────────────
// Scene 1: 10×10 grid, centered at x=600
const GRID = { ox: 501, oy: 200, sx: 22, sy: 22 };

function gridXY(idx: number): [number, number] {
  return [
    GRID.ox + (idx % 10) * GRID.sx,
    GRID.oy + Math.floor(idx / 10) * GRID.sy,
  ];
}

// Scene 2: three age columns
// young(15): 3×5 | middle(35): 5×7 | senior(50): 5×10
const AGE_ZONES: Record<AgeGroup, { ox: number; oy: number; cols: number; sx: number; sy: number }> = {
  young:  { ox: 130, oy: 252, cols: 3, sx: 24, sy: 24 },
  middle: { ox: 450, oy: 228, cols: 5, sx: 24, sy: 24 },
  senior: { ox: 820, oy: 192, cols: 5, sx: 24, sy: 24 },
};

function ageXY(p: Patient, localIdx: number): [number, number] {
  const z = AGE_ZONES[p.age];
  return [z.ox + (localIdx % z.cols) * z.sx, z.oy + Math.floor(localIdx / z.cols) * z.sy];
}

// Scene 3: young cluster (center-left), 3 cols × 5 rows at larger spacing
const YOUNG_CLUSTER = { ox: 150, oy: 210, cols: 3, sx: 40, sy: 40 };

// ── DotIcon (circle) ─────────────────────────────────────────────
function DotIcon({
  x, y, r = 7, fill, opacity = 1, glow = false,
}: {
  x: number; y: number; r?: number; fill: string; opacity?: number; glow?: boolean;
}) {
  const shadow = glow
    ? `drop-shadow(0 0 6px ${fill}99) drop-shadow(0 1px 2px rgba(61,50,41,0.08))`
    : "drop-shadow(0 1px 2px rgba(61,50,41,0.08))";
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={fill}
      stroke={C.dotBorder}
      strokeWidth={1}
      opacity={opacity}
      style={{ filter: shadow }}
    />
  );
}

// ── Warm Background (shared) ──────────────────────────────────────
function WarmBackground({ patternId }: { patternId: string }) {
  return (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <svg style={{ position: "absolute", inset: 0, opacity: 0.45 }} width={W} height={H}>
        <defs>
          <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill={C.dotBorder} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${patternId})`} />
      </svg>
    </>
  );
}

// ── Scene 1: The Promise (84 frames) ─────────────────────────────
function Scene1_ThePromise() {
  const frame = useCurrentFrame();

  const counterVal = Math.round(lerp(frame, 0, 74, 10, 70, Easing.out(Easing.cubic)));
  const labelOp    = lerp(frame, 0, 1, 70, 88);

  return (
    <AbsoluteFill>
      <WarmBackground patternId="bg1" />

      {/* Counter */}
      <div style={{
        position: "absolute",
        top: 44,
        left: 0,
        right: 0,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 96,
          color: C.caught,
          lineHeight: 1,
          fontWeight: "bold",
        }}>
          {counterVal}%
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 22,
          color: C.textSecondary,
          marginTop: 8,
          opacity: labelOp,
        }}>
          of diabetic patients flagged by our model
        </div>
      </div>

      {/* 10×10 dot grid — staggered wave */}
      <svg style={{ position: "absolute", inset: 0 }} width={W} height={H}>
        {PATIENTS.map((p) => {
          const [gx, gy] = gridXY(p.idx);
          const staggerStart = p.idx * 0.25;
          const op = lerp(frame, 0, 1, staggerStart, staggerStart + 18, Easing.out(Easing.cubic));
          // Caught = sage green, missed = warm gray (not yet revealed)
          return (
            <DotIcon key={p.idx} x={gx} y={gy} fill={p.caught ? C.caught : C.warmGray} opacity={op} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}

// ── Scene 2: But Who Gets Missed? (100 frames) ───────────────────
function Scene2_WhoGetsMissed() {
  const frame = useCurrentFrame();

  // Missed dots: warm gray → terracotta crossfade (frames 0–22)
  const colorT  = lerp(frame, 0, 1, 0, 22);
  // Dots move from grid to age columns (frames 22–75)
  const splitT  = lerp(frame, 0, 1, 22, 75, Easing.out(Easing.cubic));
  // Age labels fade in (frames 75–95)
  const labelOp = lerp(frame, 0, 1, 75, 95);
  // Header fades in immediately
  const headerOp = lerp(frame, 0, 1, 0, 22);

  const LABELS: { label: string; recall: string; color: string; x: number }[] = [
    { label: "18–39", recall: "33.5%", color: C.missedDeep, x: 154 },
    { label: "40–59", recall: "64.8%", color: C.accentGold, x: 498 },
    { label: "60+",   recall: "80.5%", color: C.caught,     x: 868 },
  ];

  return (
    <AbsoluteFill>
      <WarmBackground patternId="bg2" />

      {/* Header */}
      <div style={{
        position: "absolute",
        top: 48,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: headerOp,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 32, color: C.textPrimary }}>
          But who are the{" "}
          <span style={{ color: C.missedDeep, fontWeight: "bold" }}>26</span>
          {" "}that get missed?
        </div>
      </div>

      {/* Dots: grid → age columns, with color crossfade for missed */}
      <svg style={{ position: "absolute", inset: 0 }} width={W} height={H}>
        {PATIENTS.map((p) => {
          const localIdx = AGE_LOCAL.get(p.idx)!;
          const [gx, gy] = gridXY(p.idx);
          const [ax, ay] = ageXY(p, localIdx);
          const x = gx + splitT * (ax - gx);
          const y = gy + splitT * (ay - gy);

          if (p.caught) {
            return <DotIcon key={p.idx} x={x} y={y} fill={C.caught} />;
          }
          // Two overlapping circles for smooth color crossfade
          return (
            <g key={p.idx}>
              <DotIcon x={x} y={y} fill={C.warmGray} opacity={1 - colorT} />
              <DotIcon x={x} y={y} fill={C.missed}   opacity={colorT} />
            </g>
          );
        })}
      </svg>

      {/* Age labels */}
      {LABELS.map(({ label, recall, color, x }) => (
        <div key={label} style={{
          position: "absolute",
          bottom: 36,
          left: x - 80,
          width: 160,
          textAlign: "center",
          opacity: labelOp,
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 44,
            color,
            fontWeight: label === "18–39" ? "bold" : "normal",
            lineHeight: 1,
          }}>
            {recall}
          </div>
          <div style={{
            fontFamily: SANS,
            fontSize: 15,
            color: C.textMuted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 6,
          }}>
            {label} · recall
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
}

// ── Scene 3: The Human Cost (110 frames) ─────────────────────────
function Scene3_HumanCost() {
  const frame = useCurrentFrame();

  // Non-young dots fade to 0.15 (frames 0–28)
  const othersOp = lerp(frame, 1, 0.15, 0, 28);
  // Young dots move to cluster (frames 0–58)
  const moveT    = lerp(frame, 0, 1, 0, 58, Easing.out(Easing.cubic));
  // Missed young dots enlarge r=7 → 14 (frames 0–58)
  const bigR     = lerp(frame, 7, 14, 0, 58, Easing.out(Easing.cubic));
  // Right-side text (frames 58–90)
  const textOp   = lerp(frame, 0, 1, 58, 90);
  const textY    = lerp(frame, 8, 0, 58, 90);
  const scale    = lerp(frame, 0.95, 1.0, 58, 90);

  return (
    <AbsoluteFill>
      <WarmBackground patternId="bg3" />

      <svg style={{ position: "absolute", inset: 0 }} width={W} height={H}>
        {PATIENTS.map((p) => {
          const localIdx = AGE_LOCAL.get(p.idx)!;
          const [ax, ay] = ageXY(p, localIdx);

          if (p.age !== "young") {
            return (
              <DotIcon
                key={p.idx}
                x={ax}
                y={ay}
                fill={p.caught ? C.caught : C.missed}
                opacity={othersOp}
              />
            );
          }

          // Young: animate from age column to cluster
          const cx = YOUNG_CLUSTER.ox + (localIdx % YOUNG_CLUSTER.cols) * YOUNG_CLUSTER.sx;
          const cy = YOUNG_CLUSTER.oy + Math.floor(localIdx / YOUNG_CLUSTER.cols) * YOUNG_CLUSTER.sy;
          const x = ax + moveT * (cx - ax);
          const y = ay + moveT * (cy - ay);
          const r = p.caught ? 7 : bigR;

          return (
            <DotIcon
              key={p.idx}
              x={x}
              y={y}
              r={r}
              fill={p.caught ? C.caught : C.missed}
              glow={!p.caught}
            />
          );
        })}
      </svg>

      {/* Right-side text block */}
      <div style={{
        position: "absolute",
        top: "50%",
        right: 72,
        width: 500,
        transform: `translateY(calc(-50% + ${textY}px))`,
        opacity: textOp,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 38, color: C.textPrimary, lineHeight: 1.3 }}>
          The model misses
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 52,
          color: C.missedDeep,
          fontWeight: "bold",
          lineHeight: 1.1,
          display: "inline-block",
          transform: `scale(${scale})`,
          transformOrigin: "left center",
        }}>
          2 in 3
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 38, color: C.textPrimary, lineHeight: 1.3 }}>
          diabetic young adults
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 20,
          color: C.textSecondary,
          marginTop: 16,
          lineHeight: 1.5,
        }}>
          The group where early detection matters most.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 4: Consequences Compound (61 frames) ───────────────────
function Scene4_Consequences() {
  const frame = useCurrentFrame();

  const line1Op = lerp(frame, 0, 1, 10, 30);
  const line1Y  = lerp(frame, 10, 0, 10, 30);
  const line2Op = lerp(frame, 0, 1, 32, 52);
  const line2Y  = lerp(frame, 10, 0, 32, 52);
  const line3Op = lerp(frame, 0, 1, 54, 74);
  const line3Y  = lerp(frame, 10, 0, 54, 74);

  return (
    <AbsoluteFill>
      <WarmBackground patternId="bg4" />
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        paddingLeft: 120,
        paddingRight: 120,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 32,
          color: C.textPrimary,
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
        }}>
          Undiagnosed diabetes compounds.
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: C.textSecondary,
          opacity: line2Op,
          transform: `translateY(${line2Y}px)`,
        }}>
          Kidney damage. Vision loss. Neuropathy.
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 36,
          color: C.missedDeep,
          fontWeight: "bold",
          opacity: line3Op,
          transform: `translateY(${line3Y}px)`,
        }}>
          Decades of preventable harm.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 5: The Takeaway (35 frames) ────────────────────────────
function Scene5_Takeaway() {
  const frame = useCurrentFrame();
  const op = lerp(frame, 0, 1, 0, 28);

  return (
    <AbsoluteFill>
      <WarmBackground patternId="bg5" />
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
        opacity: op,
        paddingLeft: 120,
        paddingRight: 120,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: C.textSecondary }}>
          0.81 ROC-AUC. Same ceiling.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 36, color: C.textPrimary, fontWeight: "bold" }}>
          Different consequences.
        </div>
        <div style={{
          width: 200,
          height: 1,
          background: C.divider,
          margin: "12px 0",
        }} />
        <div style={{
          fontFamily: SANS,
          fontSize: 16,
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          BRFSS / CATBOOST / SMOTEENN / SHAP
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Light Leak Overlay wrapper (blend mode for light bg) ──────────
function WarmLightLeak({ seed, hueShift }: { seed: number; hueShift: number }) {
  return (
    <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.45 }}>
      <LightLeak seed={seed} hueShift={hueShift} />
    </AbsoluteFill>
  );
}

// ── Main Export ───────────────────────────────────────────────────
// Total: 108 + 125 + 140 + 90 + 60 = 523 frames (overlays don't add duration)
export const DiabetesFairness: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={108}>
        <Scene1_ThePromise />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={18}>
        <WarmLightLeak seed={3} hueShift={30} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={125}>
        <Scene2_WhoGetsMissed />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={18}>
        <WarmLightLeak seed={5} hueShift={15} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={140}>
        <Scene3_HumanCost />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={18}>
        <WarmLightLeak seed={7} hueShift={10} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene4_Consequences />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene5_Takeaway />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
