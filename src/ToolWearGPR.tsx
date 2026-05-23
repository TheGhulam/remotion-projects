import React from "react";
import { interpolate, Easing } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C, MONO, fs, Shell, useHeldFrame } from "./theme";

// ── Helpers ──────────────────────────────────────────────────────────
function lerp(
  frame: number,
  from: number,
  to: number,
  start: number,
  end: number
) {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
}

const tw = (Cv: number, n: number, t: number) => Cv * Math.pow(t, n);

function makePath(
  Cv: number,
  n: number,
  xFn: (t: number) => number,
  yFn: (vb: number) => number,
  steps = 60
): string {
  return Array.from({ length: steps }, (_, i) => {
    const t = 1 + (i * 25) / (steps - 1);
    const vb = tw(Cv, n, t);
    const cmd = i === 0 ? "M" : "L";
    return `${cmd} ${xFn(t).toFixed(1)} ${yFn(vb).toFixed(1)}`;
  }).join(" ");
}

// Smooth cubic bezier path through a set of (t, vb) points via Catmull-Rom.
// Guarantees the curve passes exactly through every supplied point.
function makeCatmullRomPath(
  pts: Array<{ t: number; vb: number }>,
  xFn: (t: number) => number,
  yFn: (vb: number) => number
): string {
  const coords = pts.map(p => ({ x: xFn(p.t), y: yFn(p.vb) }));
  const n = coords.length;
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(n - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ── Shared measurement data ──────────────────────────────────────────
// Tool 1: C=65, n=0.40 — measured at 6 cuts with small noise
const MEAS_CUTS = [1, 5, 10, 15, 20, 24];
const MEAS_VB = [67, 127, 160, 201, 225, 251];

// GTWM pseudo-labels: remaining 20 cuts follow Taylor smoothly
const ALL_CUTS = Array.from({ length: 26 }, (_, i) => i + 1);
const PSEUDO_CUTS = ALL_CUTS.filter(t => !MEAS_CUTS.includes(t));
const PSEUDO_VB = PSEUDO_CUTS.map(t => tw(65, 0.40, t));

// Flat mean for "without prior" visualisation
const FLAT_PRIOR = Math.round(
  MEAS_VB.reduce((a, b) => a + b, 0) / MEAS_VB.length
); // ≈ 172 µm

// 6 tools ordered by wear speed (fastest → slowest)
const TOOLS = [
  { label: "Tool 2", Cv: 75, n: 0.42, color: "#3b82f6" },
  { label: "Tool 1", Cv: 65, n: 0.40, color: "#f59e0b" },
  { label: "Tool 5", Cv: 70, n: 0.41, color: "#a855f7" },
  { label: "Tool 3", Cv: 55, n: 0.37, color: "#ef4444" },
  { label: "Tool 6", Cv: 48, n: 0.36, color: "#06b6d4" },
  { label: "Tool 4", Cv: 40, n: 0.33, color: "#10b981" },
];

// ── Scene 1: Wear Phases + GTWM ──────────────────────────────────────
const S1 = { l: 120, r: 1080, t: 82, b: 540, vbMax: 280 };
const xS1 = (t: number) => S1.l + ((t - 1) / 25) * (S1.r - S1.l);
const yS1 = (vb: number) => S1.b - (vb / S1.vbMax) * (S1.b - S1.t);
const FIT_PATH_S1 = makeCatmullRomPath(
  MEAS_CUTS.map((t, i) => ({ t, vb: MEAS_VB[i] })),
  xS1, yS1
);

const PHASES = [
  { start: 1, end: 6, label: "Break-in", bg: `${C.green}1a` },
  { start: 6, end: 20, label: "Steady-state", bg: `${C.blue}0d` },
  { start: 20, end: 26, label: "Accelerated", bg: `${C.red}1a` },
];

export const TWG_WearPhases: React.FC = () => {
  const frame = useHeldFrame();

  const titleOp = lerp(frame, 0, 1, 5, 25);
  const axisOp = lerp(frame, 0, 1, 18, 38);
  const phaseOp = lerp(frame, 0, 1, 22, 50);
  const curvePrg = lerp(frame, 0, 1, 130, 182);
  const legendOp = lerp(frame, 0, 1, 184, 212);

  const { strokeDasharray, strokeDashoffset } = evolvePath(curvePrg, FIT_PATH_S1);

  return (
    <Shell>
      <div style={{
        position: "absolute", top: 18, left: 0, right: 0,
        textAlign: "center", opacity: titleOp, fontFamily: MONO,
      }}>
        <span style={{
          fontSize: fs(12), color: C.dim,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          flank wear trajectory · gtwm pseudo-labelling
        </span>
      </div>

      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {/* Phase background regions */}
        {PHASES.map((ph, i) => (
          <rect key={i}
            x={xS1(ph.start)} y={S1.t}
            width={xS1(ph.end) - xS1(ph.start)} height={S1.b - S1.t}
            fill={ph.bg} opacity={phaseOp}
          />
        ))}

        {/* Axes */}
        <line x1={S1.l} y1={S1.t - 8} x2={S1.l} y2={S1.b}
          stroke={C.border} strokeWidth={1.5} opacity={axisOp} />
        <line x1={S1.l} y1={S1.b} x2={S1.r + 12} y2={S1.b}
          stroke={C.border} strokeWidth={1.5} opacity={axisOp} />

        {/* Y-axis ticks & labels */}
        {[0, 50, 100, 150, 200, 250].map(vb => (
          <g key={vb} opacity={axisOp}>
            <line x1={S1.l - 6} y1={yS1(vb)} x2={S1.l} y2={yS1(vb)}
              stroke={C.border} strokeWidth={1} />
            <text x={S1.l - 12} y={yS1(vb) + 4}
              textAnchor="end" fill={C.dimmer}
              fontSize={fs(10)} fontFamily={MONO}>{vb}</text>
          </g>
        ))}

        {/* Y-axis rotated label */}
        <text
          transform={`translate(${S1.l - 70} ${(S1.t + S1.b) / 2}) rotate(-90)`}
          textAnchor="middle" fill={C.dim}
          fontSize={fs(10)} fontFamily={MONO} opacity={axisOp}
        >
          Flank wear VB (µm)
        </text>

        {/* X-axis ticks & label */}
        {[1, 5, 10, 15, 20, 25].map(t => (
          <g key={t} opacity={axisOp}>
            <line x1={xS1(t)} y1={S1.b} x2={xS1(t)} y2={S1.b + 6}
              stroke={C.border} strokeWidth={1} />
            <text x={xS1(t)} y={S1.b + 20}
              textAnchor="middle" fill={C.dimmer}
              fontSize={fs(10)} fontFamily={MONO}>{t}</text>
          </g>
        ))}
        <text
          x={(S1.l + S1.r) / 2} y={S1.b + 42}
          textAnchor="middle" fill={C.dim}
          fontSize={fs(10)} fontFamily={MONO} opacity={axisOp}
        >
          Cut number (1–26)
        </text>

        {/* Phase labels */}
        {PHASES.map((ph, i) => (
          <text key={i}
            x={(xS1(ph.start) + xS1(ph.end)) / 2} y={S1.t - 16}
            textAnchor="middle" fill={C.dim}
            fontSize={fs(11)} fontFamily={MONO} opacity={phaseOp}
          >
            {ph.label}
          </text>
        ))}

        {/* GTWM pseudo-label dots (blue, staggered 80–130f) */}
        {PSEUDO_CUTS.map((t, i) => (
          <circle key={t}
            cx={xS1(t)} cy={yS1(PSEUDO_VB[i])} r={4.5}
            fill={C.blue}
            opacity={lerp(frame, 0, 0.75, 80 + i * 2.5, 93 + i * 2.5)}
          />
        ))}

        {/* Measured dots (red, staggered 42–78f) */}
        {MEAS_CUTS.map((t, i) => (
          <circle key={t}
            cx={xS1(t)} cy={yS1(MEAS_VB[i])} r={9}
            fill={C.red}
            opacity={lerp(frame, 0, 1, 42 + i * 6, 55 + i * 6)}
          />
        ))}

        {/* Fitted curve (draws in 130–182f) */}
        <path
          d={FIT_PATH_S1}
          fill="none" stroke={C.blue} strokeWidth={2.5}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={curvePrg > 0.01 ? 0.85 : 0}
        />
      </svg>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 150, right: 140,
        opacity: legendOp, fontFamily: MONO,
        display: "flex", flexDirection: "column", gap: 12,
        background: `${C.bg}dd`,
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
      }}>
        {[
          { key: "big", color: C.red, label: "Measured (6 per trajectory)" },
          { key: "sm", color: C.blue, label: "GTWM pseudo-label (20 generated)" },
          { key: "line", color: C.blue, label: "Fitted curve" },
        ].map(({ key, color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {key === "big" && <svg width={20} height={20}><circle cx={10} cy={10} r={9} fill={color} /></svg>}
            {key === "sm" && <svg width={12} height={12} style={{ marginLeft: 4 }}><circle cx={6} cy={6} r={4.5} fill={color} opacity={0.75} /></svg>}
            {key === "line" && <div style={{ width: 28, height: 3, background: color, borderRadius: 2 }} />}
            <span style={{ fontSize: fs(11), color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ── Scene 2: Physics Prior Comparison ────────────────────────────────
const S2L = { l: 110, r: 525, t: 130, b: 505, vbMax: 280 };
const S2R = { l: 665, r: 1080, t: 130, b: 505, vbMax: 280 };

const xS2L = (t: number) => S2L.l + ((t - 1) / 25) * (S2L.r - S2L.l);
const yS2L = (vb: number) => S2L.b - (vb / S2L.vbMax) * (S2L.b - S2L.t);
const xS2R = (t: number) => S2R.l + ((t - 1) / 25) * (S2R.r - S2R.l);
const yS2R = (vb: number) => S2R.b - (vb / S2R.vbMax) * (S2R.b - S2R.t);

const FLAT_PATH = `M ${xS2L(1).toFixed(1)} ${yS2L(FLAT_PRIOR).toFixed(1)} L ${xS2L(26).toFixed(1)} ${yS2L(FLAT_PRIOR).toFixed(1)}`;
const TAYLOR_PATH_S2R = makePath(65, 0.40, xS2R, yS2R);

export const TWG_PhysicsPrior: React.FC = () => {
  const frame = useHeldFrame();

  const panelOp = lerp(frame, 0, 1, 5, 30);
  const axisOpL = lerp(frame, 0, 1, 20, 40);
  const axisOpR = lerp(frame, 0, 1, 25, 45);
  const flatPrg = lerp(frame, 0, 1, 40, 80);
  const vsOp = lerp(frame, 0, 1, 60, 85);
  const leftPtsOp = lerp(frame, 0, 1, 82, 108);
  const taylorPrg = lerp(frame, 0, 1, 108, 155);
  const captionOp = lerp(frame, 0, 1, 178, 208);

  const { strokeDasharray: flatDA, strokeDashoffset: flatDO } = evolvePath(flatPrg, FLAT_PATH);
  const { strokeDasharray: taylorDA, strokeDashoffset: taylorDO } = evolvePath(taylorPrg, TAYLOR_PATH_S2R);

  function PanelAxes({
    ch, xFn, yFn, op,
  }: {
    ch: typeof S2L;
    xFn: (t: number) => number;
    yFn: (vb: number) => number;
    op: number;
  }) {
    return (
      <g opacity={op}>
        <line x1={ch.l} y1={ch.t - 6} x2={ch.l} y2={ch.b} stroke={C.border} strokeWidth={1.3} />
        <line x1={ch.l} y1={ch.b} x2={ch.r + 8} y2={ch.b} stroke={C.border} strokeWidth={1.3} />
        {[0, 100, 200].map(vb => (
          <g key={vb}>
            <line x1={ch.l - 5} y1={yFn(vb)} x2={ch.l} y2={yFn(vb)} stroke={C.border} strokeWidth={1} />
            <text x={ch.l - 10} y={yFn(vb) + 4} textAnchor="end" fill={C.dimmer} fontSize={fs(9)} fontFamily={MONO}>{vb}</text>
          </g>
        ))}
        {[1, 10, 20, 26].map(t => (
          <g key={t}>
            <line x1={xFn(t)} y1={ch.b} x2={xFn(t)} y2={ch.b + 5} stroke={C.border} strokeWidth={1} />
            <text x={xFn(t)} y={ch.b + 17} textAnchor="middle" fill={C.dimmer} fontSize={fs(9)} fontFamily={MONO}>{t}</text>
          </g>
        ))}
      </g>
    );
  }

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {/* Panel borders */}
        <rect x={50} y={50} width={545} height={500}
          fill="none" stroke={C.border} strokeWidth={1} rx={6} opacity={panelOp} />
        <rect x={628} y={50} width={545} height={500}
          fill="none" stroke={C.border} strokeWidth={1} rx={6} opacity={panelOp} />

        {/* "VS." divider */}
        <text x={600} y={325} textAnchor="middle" fill={C.dim}
          fontSize={fs(18)} fontFamily={MONO} fontWeight={700} opacity={vsOp}>
          vs.
        </text>

        {/* Panel axes */}
        <PanelAxes ch={S2L} xFn={xS2L} yFn={yS2L} op={axisOpL} />
        <PanelAxes ch={S2R} xFn={xS2R} yFn={yS2R} op={axisOpR} />

        {/* LEFT PANEL: flat mean line (dashed) */}
        <path
          d={FLAT_PATH}
          fill="none" stroke={C.dimmer} strokeWidth={2}
          strokeDasharray={`${flatDA}`} strokeDashoffset={flatDO}
          strokeLinecap="round"
          opacity={flatPrg > 0.01 ? 0.8 : 0}
        />
        {/* Flat mean label */}
        <text x={xS2L(26) + 8} y={yS2L(FLAT_PRIOR) + 4}
          fill={C.dimmer} fontSize={fs(10)} fontFamily={MONO}
          opacity={lerp(frame, 0, 1, 78, 95)}>
          Starting guess
        </text>

        {/* LEFT PANEL: data points with residual lines */}
        {MEAS_CUTS.map((t, i) => {
          const x = xS2L(t);
          const yData = yS2L(MEAS_VB[i]);
          const yMean = yS2L(FLAT_PRIOR);
          const op = lerp(frame, 0, 1, 82 + i * 4, 95 + i * 4);
          return (
            <g key={t} opacity={op}>
              {/* Residual gap line */}
              <line x1={x} y1={yData} x2={x} y2={yMean}
                stroke={C.amber} strokeWidth={1.5} strokeDasharray="3,2" />
              {/* Data point */}
              <circle cx={x} cy={yData} r={7} fill={C.red} />
            </g>
          );
        })}

        {/* RIGHT PANEL: Taylor prior curve (dashed blue) */}
        <path
          d={TAYLOR_PATH_S2R}
          fill="none" stroke={C.blue} strokeWidth={2.2}
          strokeDasharray={`12 5 ${taylorDA}`} strokeDashoffset={taylorDO}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={taylorPrg > 0.01 ? 0.85 : 0}
        />
        {/* Taylor label */}
        <text x={xS2R(26) + 8} y={yS2R(tw(65, 0.40, 26)) + 4}
          fill={C.blue} fontSize={fs(10)} fontFamily={MONO}
          opacity={lerp(frame, 0, 1, 148, 165)}>
          Physics guess
        </text>

        {/* RIGHT PANEL: data points with tiny residual ticks */}
        {MEAS_CUTS.map((t, i) => {
          const x = xS2R(t);
          const yData = yS2R(MEAS_VB[i]);
          const yTaylor = yS2R(tw(65, 0.40, t));
          const op = lerp(frame, 0, 1, 157 + i * 3, 168 + i * 3);
          return (
            <g key={t} opacity={op}>
              {/* Small orange residual tick */}
              <line x1={x} y1={yData} x2={x} y2={yTaylor}
                stroke={C.orange} strokeWidth={2.5} />
              {/* Data point */}
              <circle cx={x} cy={yData} r={7} fill={C.red} />
            </g>
          );
        })}
      </svg>

      {/* Panel titles */}
      <div style={{ position: "absolute", top: 60, left: 60, opacity: panelOp, fontFamily: MONO }}>
        <div style={{ fontSize: fs(13), color: C.white, fontWeight: 700, marginBottom: 4 }}>
          Without a physics prior
        </div>
        <div style={{ fontSize: fs(10), color: C.dim, letterSpacing: "0.05em" }}>
          GP starts from a flat mean — learns shape from scratch
        </div>
      </div>
      <div style={{ position: "absolute", top: 60, left: 638, opacity: panelOp, fontFamily: MONO }}>
        <div style={{ fontSize: fs(13), color: C.white, fontWeight: 700, marginBottom: 4 }}>
          With a physics prior (Taylor's law)
        </div>
        <div style={{ fontSize: fs(10), color: C.dim, letterSpacing: "0.05em" }}>
          GP starts from VB = C·t^n — learns only cut-to-cut noise
        </div>
      </div>

      {/* Caption */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0,
        display: "flex", justifyContent: "center", opacity: captionOp,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: fs(10), color: C.dim,
          border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "8px 28px", background: `${C.bg}ee`,
          display: "flex", gap: 32, alignItems: "center",
        }}>
          <span>
            <span style={{ color: C.amber, fontWeight: 700, marginRight: 6 }}>– –</span>
            large residuals: hard to learn
          </span>
          <span style={{ color: C.border }}>·</span>
          <span>
            <span style={{ color: C.orange, fontWeight: 700, marginRight: 6 }}>|</span>
            tiny residuals: GP only models noise
          </span>
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 3: Per-Tool Variability ─────────────────────────────────────
const S3 = { l: 120, r: 980, t: 82, b: 500, vbMax: 320 };
const xS3 = (t: number) => S3.l + ((t - 1) / 25) * (S3.r - S3.l);
const yS3 = (vb: number) => S3.b - (vb / S3.vbMax) * (S3.b - S3.t);

const TOOL_PATHS = TOOLS.map(tool => makePath(tool.Cv, tool.n, xS3, yS3));

export const TWG_ToolVariability: React.FC = () => {
  const frame = useHeldFrame();

  const titleOp = lerp(frame, 0, 1, 5, 25);
  const axisOp = lerp(frame, 0, 1, 18, 38);
  const captionOp = lerp(frame, 0, 1, 165, 195);

  return (
    <Shell>
      <div style={{
        position: "absolute", top: 18, left: 0, right: 0,
        textAlign: "center", opacity: titleOp, fontFamily: MONO,
      }}>
        <span style={{
          fontSize: fs(12), color: C.dim,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          the problem: every tool wears differently
        </span>
      </div>

      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {/* Axes */}
        <line x1={S3.l} y1={S3.t - 8} x2={S3.l} y2={S3.b}
          stroke={C.border} strokeWidth={1.5} opacity={axisOp} />
        <line x1={S3.l} y1={S3.b} x2={S3.r + 12} y2={S3.b}
          stroke={C.border} strokeWidth={1.5} opacity={axisOp} />

        {/* Y-axis ticks & rotated label */}
        {[0, 100, 200, 300].map(vb => (
          <g key={vb} opacity={axisOp}>
            <line x1={S3.l - 6} y1={yS3(vb)} x2={S3.l} y2={yS3(vb)}
              stroke={C.border} strokeWidth={1} />
            <text x={S3.l - 12} y={yS3(vb) + 4}
              textAnchor="end" fill={C.dimmer}
              fontSize={fs(10)} fontFamily={MONO}>{vb}</text>
          </g>
        ))}
        <text
          transform={`translate(${S3.l - 72} ${(S3.t + S3.b) / 2}) rotate(-90)`}
          textAnchor="middle" fill={C.dim}
          fontSize={fs(10)} fontFamily={MONO} opacity={axisOp}
        >
          Flank wear VB (µm)
        </text>

        {/* X-axis ticks & label */}
        {[1, 5, 10, 15, 20, 25].map(t => (
          <g key={t} opacity={axisOp}>
            <line x1={xS3(t)} y1={S3.b} x2={xS3(t)} y2={S3.b + 6}
              stroke={C.border} strokeWidth={1} />
            <text x={xS3(t)} y={S3.b + 19}
              textAnchor="middle" fill={C.dimmer}
              fontSize={fs(10)} fontFamily={MONO}>{t}</text>
          </g>
        ))}
        <text
          x={(S3.l + S3.r) / 2} y={S3.b + 40}
          textAnchor="middle" fill={C.dim}
          fontSize={fs(10)} fontFamily={MONO} opacity={axisOp}
        >
          Cut number
        </text>

        {/* Tool curves — staggered draw-in, 20 frames apart */}
        {TOOLS.map((tool, i) => {
          const startF = 38 + i * 20;
          const endF = startF + 90;
          const prg = lerp(frame, 0, 1, startF, endF);
          const labelOp = lerp(frame, 0, 1, endF, endF + 18);
          const { strokeDasharray, strokeDashoffset } = evolvePath(prg, TOOL_PATHS[i]);
          const endVB = tw(tool.Cv, tool.n, 26);

          return (
            <g key={tool.label}>
              <path
                d={TOOL_PATHS[i]}
                fill="none" stroke={tool.color} strokeWidth={2.5}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={prg > 0.01 ? 0.9 : 0}
              />
              {/* Label at end of curve */}
              <text
                x={S3.r + 12} y={yS3(endVB) + 4}
                fill={tool.color} fontSize={fs(10)} fontFamily={MONO}
                opacity={labelOp}
              >
                {tool.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Caption */}
      <div style={{
        position: "absolute", bottom: 28, left: 0, right: 0,
        display: "flex", justifyContent: "center", opacity: captionOp,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: fs(11), color: C.dim,
          border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "10px 28px", background: `${C.bg}ee`,
          textAlign: "center",
        }}>
          6 tools, same conditions — wear varies by{" "}
          <span style={{ color: C.white, fontWeight: 700 }}>3×</span>{" "}
          · one global fit leaves large residuals for every tool
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 4: Global vs Per-Trajectory Taylor Fit ──────────────────────
const S4L = { l: 90, r: 520, t: 120, b: 510, vbMax: 320 };
const S4R = { l: 660, r: 1090, t: 120, b: 510, vbMax: 320 };

const xS4L = (t: number) => S4L.l + ((t - 1) / 25) * (S4L.r - S4L.l);
const yS4L = (vb: number) => S4L.b - (vb / S4L.vbMax) * (S4L.b - S4L.t);
const xS4R = (t: number) => S4R.l + ((t - 1) / 25) * (S4R.r - S4R.l);
const yS4R = (vb: number) => S4R.b - (vb / S4R.vbMax) * (S4R.b - S4R.t);

// Global average fit (single C, n for all tools)
const GLOBAL_PATH = makePath(58, 0.39, xS4L, yS4L);
// Boundary curves showing atypical tools' true wear (large deviations)
const FAST_BOUND = makePath(75, 0.42, xS4L, yS4L); // Tool 2 actual
const SLOW_BOUND = makePath(40, 0.33, xS4L, yS4L); // Tool 4 actual

// Per-trajectory fits for right panel (3 tools shown)
const PER_TRAJ = [
  {
    Cv: 75, n: 0.42, color: "#3b82f6", label: "Tool 2",
    meas: MEAS_CUTS.map(t => ({ t, vb: tw(75, 0.42, t) + (t % 3 === 0 ? 3 : -2) }))
  },
  {
    Cv: 55, n: 0.37, color: "#ef4444", label: "Tool 3",
    meas: MEAS_CUTS.map(t => ({ t, vb: tw(55, 0.37, t) + (t % 2 === 0 ? -2 : 3) }))
  },
  {
    Cv: 40, n: 0.33, color: "#10b981", label: "Tool 4",
    meas: MEAS_CUTS.map(t => ({ t, vb: tw(40, 0.33, t) + (t % 3 === 0 ? -2 : 2) }))
  },
];

const PER_TRAJ_PATHS = PER_TRAJ.map(tool => makePath(tool.Cv, tool.n, xS4R, yS4R));

export const TWG_GlobalVsPerTraj: React.FC = () => {
  const frame = useHeldFrame();

  const panelOp = lerp(frame, 0, 1, 5, 28);
  const axisOpL = lerp(frame, 0, 1, 20, 42);
  const axisOpR = lerp(frame, 0, 1, 25, 47);
  const globalPrg = lerp(frame, 0, 1, 42, 90);
  const boundsPrg = lerp(frame, 0, 1, 88, 130);
  const leftGapOp = lerp(frame, 0, 1, 128, 152);
  const arrowOp = lerp(frame, 0, 1, 155, 178);
  const captionOp = lerp(frame, 0, 1, 200, 228);

  const { strokeDasharray: gDA, strokeDashoffset: gDO } = evolvePath(globalPrg, GLOBAL_PATH);
  const { strokeDasharray: fbDA, strokeDashoffset: fbDO } = evolvePath(boundsPrg, FAST_BOUND);
  const { strokeDasharray: sbDA, strokeDashoffset: sbDO } = evolvePath(boundsPrg, SLOW_BOUND);

  const perTrajEvolved = PER_TRAJ_PATHS.map((path, i) => {
    const prg = lerp(frame, 0, 1, 158 + i * 22, 200 + i * 22);
    return { ...evolvePath(prg, path), prg };
  });

  // Large residuals on left panel at each measured cut (global vs Tool 2)
  const leftGaps = MEAS_CUTS.map(t => ({
    x: xS4L(t),
    yGlobal: yS4L(tw(58, 0.39, t)),
    yFast: yS4L(tw(75, 0.42, t)),
  }));

  function PanelAxes({
    ch, xFn, yFn, op,
  }: {
    ch: typeof S4L;
    xFn: (t: number) => number;
    yFn: (vb: number) => number;
    op: number;
  }) {
    return (
      <g opacity={op}>
        <line x1={ch.l} y1={ch.t - 6} x2={ch.l} y2={ch.b} stroke={C.border} strokeWidth={1.3} />
        <line x1={ch.l} y1={ch.b} x2={ch.r + 8} y2={ch.b} stroke={C.border} strokeWidth={1.3} />
        {[0, 100, 200, 300].map(vb => (
          <g key={vb}>
            <line x1={ch.l - 5} y1={yFn(vb)} x2={ch.l} y2={yFn(vb)} stroke={C.border} strokeWidth={1} />
            <text x={ch.l - 10} y={yFn(vb) + 4} textAnchor="end" fill={C.dimmer} fontSize={fs(9)} fontFamily={MONO}>{vb}</text>
          </g>
        ))}
        {[1, 10, 20, 26].map(t => (
          <g key={t}>
            <line x1={xFn(t)} y1={ch.b} x2={xFn(t)} y2={ch.b + 5} stroke={C.border} strokeWidth={1} />
            <text x={xFn(t)} y={ch.b + 17} textAnchor="middle" fill={C.dimmer} fontSize={fs(9)} fontFamily={MONO}>{t}</text>
          </g>
        ))}
      </g>
    );
  }

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {/* Panel borders */}
        <rect x={48} y={55} width={530} height={535}
          fill="none" stroke={C.border} strokeWidth={1} rx={6} opacity={panelOp} />
        <rect x={618} y={55} width={534} height={535}
          fill="none" stroke={C.border} strokeWidth={1} rx={6} opacity={panelOp} />

        {/* Arrow between panels */}
        <g opacity={arrowOp}>
          <line x1={585} y1={315} x2={618} y2={315} stroke={C.dim} strokeWidth={2} markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={C.dim} />
            </marker>
          </defs>
        </g>

        <PanelAxes ch={S4L} xFn={xS4L} yFn={yS4L} op={axisOpL} />
        <PanelAxes ch={S4R} xFn={xS4R} yFn={yS4R} op={axisOpR} />

        {/* LEFT: Global Taylor fit (blue) */}
        <path
          d={GLOBAL_PATH}
          fill="none" stroke={C.blue} strokeWidth={2.5}
          strokeDasharray={gDA} strokeDashoffset={gDO}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={globalPrg > 0.01 ? 0.9 : 0}
        />

        {/* LEFT: Boundary curves for atypical tools (red dashed) */}
        {[
          { da: fbDA, do_: fbDO, path: FAST_BOUND },
          { da: sbDA, do_: sbDO, path: SLOW_BOUND },
        ].map(({ da, do_, path }, idx) => (
          <path key={idx}
            d={path}
            fill="none" stroke={C.red} strokeWidth={1.5}
            strokeDasharray={`6 4 ${da}`} strokeDashoffset={do_}
            strokeLinecap="round"
            opacity={boundsPrg > 0.01 ? 0.6 : 0}
          />
        ))}

        {/* LEFT: Large residual lines (global → fast tool actual) */}
        {leftGaps.map(({ x, yGlobal, yFast }, i) => (
          <g key={i} opacity={leftGapOp}>
            <line x1={x} y1={yGlobal} x2={x} y2={yFast}
              stroke={C.amber} strokeWidth={2} strokeDasharray="3,2" />
            <circle cx={x} cy={yFast} r={5} fill={C.red} />
          </g>
        ))}

        {/* RIGHT: Per-trajectory Taylor fits */}
        {PER_TRAJ.map((tool, i) => {
          const { strokeDasharray, strokeDashoffset, prg } = perTrajEvolved[i];
          const endVB = tw(tool.Cv, tool.n, 26);
          const labelOp = lerp(frame, 0, 1, 200 + i * 22, 218 + i * 22);
          return (
            <g key={tool.label}>
              <path
                d={PER_TRAJ_PATHS[i]}
                fill="none" stroke={tool.color} strokeWidth={2.5}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={prg > 0.01 ? 0.9 : 0}
              />
              {/* Tiny orange residual ticks at measured points */}
              {prg > 0.6 && tool.meas.map(({ t, vb }) => {
                const tickOp = lerp(frame, 0, 1, 195 + i * 22, 208 + i * 22);
                return (
                  <g key={t} opacity={tickOp}>
                    <line
                      x1={xS4R(t)} y1={yS4R(vb)}
                      x2={xS4R(t)} y2={yS4R(tw(tool.Cv, tool.n, t))}
                      stroke={C.orange} strokeWidth={2.5}
                    />
                    <circle cx={xS4R(t)} cy={yS4R(vb)} r={5} fill={tool.color} opacity={0.9} />
                  </g>
                );
              })}
              {/* Label */}
              <text
                x={S4R.r + 10} y={yS4R(endVB) + 4}
                fill={tool.color} fontSize={fs(10)} fontFamily={MONO}
                opacity={labelOp}
              >
                {tool.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Panel titles */}
      <div style={{ position: "absolute", top: 62, left: 62, opacity: panelOp, fontFamily: MONO }}>
        <div style={{ fontSize: fs(12), color: C.white, fontWeight: 700 }}>
          Before: global Taylor fit
        </div>
        <div style={{ fontSize: fs(10), color: C.dim, marginTop: 4 }}>
          VB = C·t^n (one C, n for all)
        </div>
      </div>
      <div style={{ position: "absolute", top: 62, left: 632, opacity: panelOp, fontFamily: MONO }}>
        <div style={{ fontSize: fs(12), color: C.white, fontWeight: 700 }}>
          After: per-trajectory fit
        </div>
        <div style={{ fontSize: fs(10), color: C.dim, marginTop: 4 }}>
          VB = C_i·t^n_i + c_i (per tool)
        </div>
      </div>

      {/* Caption */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 48,
        opacity: captionOp, fontFamily: MONO,
      }}>
        <span style={{ fontSize: fs(10), color: C.dim }}>
          <span style={{ color: C.amber, fontWeight: 700 }}>– –</span> large residuals for atypical tools
        </span>
        <span style={{ fontSize: fs(10), color: C.dim }}>
          <span style={{ color: C.orange, fontWeight: 700 }}>|</span> tiny residuals: GP models cut-to-cut noise only
        </span>
      </div>
    </Shell>
  );
};
