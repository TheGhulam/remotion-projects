import React from "react";
import { interpolate, Easing } from "remotion";
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

function lerpColor(a: string, b: string, t: number): string {
  const hex = (s: string) => [
    parseInt(s.slice(1, 3), 16),
    parseInt(s.slice(3, 5), 16),
    parseInt(s.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = hex(a);
  const [br, bg, bb] = hex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function attrColor(score: number): string {
  if (score < 0.3) return lerpColor(C.border, C.blue, score / 0.3);
  if (score < 0.6) return lerpColor(C.blue, C.amber, (score - 0.3) / 0.3);
  return lerpColor(C.amber, C.red, (score - 0.6) / 0.4);
}

// ── IEEE-24 style grid topology ──────────────────────────────────────
const PG_NODES = [
  { x: 200, y: 100, label: "G1" },
  { x: 460, y: 100, label: "G2" },
  { x: 750, y: 100, label: "G3" },
  { x: 1010, y: 100, label: "G4" },
  { x: 80, y: 250, label: "T5" },
  { x: 310, y: 250, label: "T6" },
  { x: 580, y: 250, label: "T7" },
  { x: 850, y: 250, label: "T8" },
  { x: 1100, y: 250, label: "T9" },
  { x: 190, y: 400, label: "D10" },
  { x: 450, y: 400, label: "D11" },
  { x: 725, y: 400, label: "D12" },
  { x: 985, y: 400, label: "D13" },
  { x: 330, y: 450, label: "L14" },
  { x: 600, y: 450, label: "L15" },
  { x: 870, y: 450, label: "L16" },
];

const PG_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3],
  [0, 4], [0, 5], [1, 5], [1, 6], [2, 6], [2, 7], [3, 7], [3, 8],
  [4, 5], [5, 6], [6, 7], [7, 8],
  [4, 9], [5, 9], [5, 10], [6, 10], [6, 11], [7, 11], [7, 12], [8, 12],
  [9, 10], [10, 11], [11, 12],
  [9, 13], [10, 13], [10, 14], [11, 14], [11, 15], [12, 15],
  [13, 14], [14, 15],
];

const FAILED_EDGE_FRAMES: (number | null)[] = Array(PG_EDGES.length).fill(null);
FAILED_EDGE_FRAMES[12] = 70;
FAILED_EDGE_FRAMES[5] = 87;
FAILED_EDGE_FRAMES[6] = 99;
FAILED_EDGE_FRAMES[17] = 112;
FAILED_EDGE_FRAMES[16] = 118;
FAILED_EDGE_FRAMES[18] = 128;
FAILED_EDGE_FRAMES[19] = 135;

const OFFLINE_NODE_FRAMES: (number | null)[] = Array(PG_NODES.length).fill(null);
OFFLINE_NODE_FRAMES[5] = 122;
OFFLINE_NODE_FRAMES[6] = 138;
OFFLINE_NODE_FRAMES[10] = 150;

const RISK_SCORE_DATA: ({ frame: number; score: number } | null)[] =
  Array(PG_NODES.length).fill(null);
RISK_SCORE_DATA[1] = { frame: 78, score: 0.82 };
RISK_SCORE_DATA[4] = { frame: 100, score: 0.58 };
RISK_SCORE_DATA[5] = { frame: 73, score: 0.94 };
RISK_SCORE_DATA[6] = { frame: 73, score: 0.91 };
RISK_SCORE_DATA[9] = { frame: 110, score: 0.67 };
RISK_SCORE_DATA[10] = { frame: 110, score: 0.88 };
RISK_SCORE_DATA[11] = { frame: 118, score: 0.72 };

const ATTRIBUTION_DATA: number[] = [
  0.18, 0.51, 0.12, 0.08, 0.44, 0.88, 0.82, 0.41, 0.15, 0.09,
  0.06, 0.62, 0.95, 0.58, 0.29, 0.22, 0.71, 0.79, 0.76, 0.68,
  0.38, 0.19, 0.11, 0.35, 0.48, 0.31, 0.14, 0.25, 0.22, 0.17,
  0.13, 0.08, 0.10, 0.07,
];

const TOP_CAUSAL = [12, 5, 6];

// ── Scene 1: Cascading Failure (300f = 10s) ───────────────────────────
export const PG_Cascade: React.FC = () => {
  const frame = useHeldFrame();

  const titleOp = lerp(frame, 0, 1, 5, 28);
  const alertOp = lerp(frame, 0, 1, 248, 268);
  const alertY = lerp(frame, 28, 0, 248, 268);

  return (
    <Shell>
      <div style={{
        position: "absolute", top: 22, left: 0, right: 0,
        textAlign: "center", opacity: titleOp,
        fontFamily: MONO,
      }}>
        <span style={{
          fontSize: fs(12), color: C.dim,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          cascading failure prediction · ieee-24 power grid
        </span>
      </div>

      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {PG_EDGES.map(([from, to], i) => {
          const n1 = PG_NODES[from];
          const n2 = PG_NODES[to];
          const edgeOp = lerp(frame, 0, 1, 5 + i, 18 + i);
          const failF = FAILED_EDGE_FRAMES[i];
          const isFailed = failF !== null && frame >= failF;
          const failProg = failF !== null
            ? lerp(frame, 0, 1, failF, failF + 14)
            : 0;
          return (
            <line key={i}
              x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke={isFailed ? C.red : C.border}
              strokeWidth={isFailed ? 2.5 * failProg + 1.5 * (1 - failProg) : 1.8}
              strokeDasharray={isFailed ? "7,5" : undefined}
              opacity={edgeOp}
            />
          );
        })}

        {PG_NODES.map((node, i) => {
          const nodeOp = lerp(frame, 0, 1, 8 + i * 3, 22 + i * 3);
          const offlineF = OFFLINE_NODE_FRAMES[i];
          const isOffline = offlineF !== null && frame >= offlineF;
          const riskData = RISK_SCORE_DATA[i];
          const isAtRisk = riskData !== null && frame >= riskData.frame && !isOffline;
          const strokeColor = isOffline ? C.dimmer : isAtRisk ? C.amber : C.green;
          const fillColor = isOffline ? "none" : isAtRisk ? `${C.amber}28` : `${C.green}28`;
          const dotColor = isAtRisk ? C.amber : C.green;
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={node.x} cy={node.y} r={18}
                fill={fillColor} stroke={strokeColor} strokeWidth={2} />
              {isOffline ? (
                <text x={node.x} y={node.y + 6}
                  textAnchor="middle" fill={C.dimmer} fontSize={20} fontFamily={MONO}>×</text>
              ) : (
                <circle cx={node.x} cy={node.y} r={5} fill={dotColor} />
              )}
              <text x={node.x} y={node.y + 34}
                textAnchor="middle" fill={C.dim} fontSize={11} fontFamily={MONO}>
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {RISK_SCORE_DATA.map((riskData, i) => {
        if (!riskData) return null;
        const node = PG_NODES[i];
        const badgeOp = lerp(frame, 0, 1, riskData.frame, riskData.frame + 16);
        const isHigh = riskData.score >= 0.85;
        const color = isHigh ? C.red : C.amber;
        return (
          <div key={i} style={{
            position: "absolute",
            left: node.x - 24, top: node.y - 50,
            opacity: badgeOp,
            fontFamily: MONO, fontSize: fs(12), color,
            background: C.bg, border: `1px solid ${color}`,
            borderRadius: 4, padding: "2px 7px",
            pointerEvents: "none",
          }}>
            {riskData.score.toFixed(2)}
          </div>
        );
      })}

      <div style={{
        position: "absolute", bottom: 26, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: alertOp,
        transform: `translateY(${alertY}px)`,
        fontFamily: MONO,
      }}>
        <div style={{
          border: `1.5px solid ${C.red}`,
          background: `${C.red}12`,
          borderRadius: 10, padding: "16px 44px", textAlign: "center",
        }}>
          <div style={{ fontSize: fs(22), color: C.red, fontWeight: 700, marginBottom: 8 }}>
            ⚠ Cascade Detected
          </div>
          <div style={{ fontSize: fs(16), color: C.white }}>
            10-second warning · 3 buses at risk
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 2: ONNX Quantisation (210f = 7s + HOLD) ────────────────────
export const PG_ONNX: React.FC = () => {
  const frame = useHeldFrame();

  // Timing: staggered row reveals, no bars
  const titleOp = lerp(frame, 0, 1, 5, 20);
  const headerOp = lerp(frame, 0, 1, 18, 36);
  const dividerH = lerp(frame, 0, 340, 30, 65);

  // Each row: [reveal start, badge start]
  const ROW_FRAMES = [
    { row: 50, badge: 78 },
    { row: 88, badge: 116 },
    { row: 126, badge: 154 },
  ];

  const footerOp = lerp(frame, 0, 1, 165, 185);

  const ROWS = [
    { label: "Model Size", fp32: "173.2 KB", int8: "80.0 KB", badge: "−53.8%", badgeColor: C.green },
    { label: "CPU Latency", fp32: "0.784 ms", int8: "0.349 ms", badge: "2.25× faster", badgeColor: C.cyan },
    { label: "Agreement", fp32: "100.0%", int8: "99.5%", badge: "✓ match", badgeColor: C.green },
  ];

  // Layout x-positions
  const LX = 100;   // left column start
  const IX = 710;   // INT8 value start
  const BX = 1090;  // badge right edge

  // Row vertical positions
  const TOP_Y = 160;
  const ROW_H = 130;

  return (
    <Shell>
      {/* Title */}
      <div style={{
        position: "absolute", top: 26, left: 0, right: 0,
        textAlign: "center", opacity: titleOp, fontFamily: MONO,
      }}>
        <span style={{ fontSize: fs(11), color: C.dimmer, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          onnx int8 quantisation · edge deployment
        </span>
      </div>

      {/* Column headers */}
      <div style={{ position: "absolute", top: 68, opacity: headerOp, fontFamily: MONO, width: "100%" }}>
        <div style={{
          position: "absolute", left: LX,
          fontSize: fs(13), color: C.dim, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>FP32 Baseline</div>
        <div style={{
          position: "absolute", left: IX,
          fontSize: fs(13), color: C.cyan, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>INT8 Quantised</div>
      </div>

      {/* SVG: vertical divider, header underline, row separators, arrows */}
      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        <line x1={600} y1={58} x2={600} y2={193 + dividerH} stroke={C.border} strokeWidth={1.5} />
        <line x1={LX} y1={100} x2={1100} y2={100} stroke={C.border} strokeWidth={1} opacity={headerOp} />
        {ROW_FRAMES.map((rf, i) => {
          const sepOp = lerp(frame, 0, 1, rf.row, rf.row + 18);
          return (
            <g key={i}>
              <line
                x1={LX} y1={TOP_Y + ROW_H * (i + 1) - 16}
                x2={1100} y2={TOP_Y + ROW_H * (i + 1) - 16}
                stroke={C.border} strokeWidth={0.8} opacity={sepOp}
              />
            </g>
          );
        })}
      </svg>

      {/* Rows */}
      {ROWS.map((row, i) => {
        const rf = ROW_FRAMES[i];
        const rowOp = lerp(frame, 0, 1, rf.row, rf.row + 22);
        const int8Op = lerp(frame, 0, 1, rf.row + 12, rf.row + 34);
        const badgeOp = lerp(frame, 0, 1, rf.badge, rf.badge + 18);
        const int8Y = lerp(frame, 8, 0, rf.row + 12, rf.row + 34);
        const rowY = TOP_Y + ROW_H * i;

        return (
          <div key={row.label} style={{ position: "absolute", fontFamily: MONO, top: rowY, left: 0, right: 0 }}>
            {/* Label */}
            <div style={{
              position: "absolute", left: LX, top: 0,
              opacity: rowOp, fontSize: fs(10), color: C.dimmer,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>{row.label}</div>

            {/* FP32 value */}
            <div style={{
              position: "absolute", left: LX, top: 30,
              opacity: rowOp, fontSize: fs(26), color: C.dim, fontWeight: 600,
              letterSpacing: "0.02em",
            }}>{row.fp32}</div>

            {/* INT8 value */}
            <div style={{
              position: "absolute", left: IX, top: 26 + int8Y,
              opacity: int8Op, fontSize: fs(36), color: C.cyan, fontWeight: 700,
              letterSpacing: "-0.01em",
              textShadow: `0 0 ${20 * int8Op}px ${C.cyan}44`,
            }}>{row.int8}</div>

            {/* Improvement badge */}
            <div style={{
              position: "absolute", right: 1200 - BX, top: 40,
              opacity: badgeOp, fontSize: fs(11),
              color: row.badgeColor,
              border: `1px solid ${row.badgeColor}55`,
              background: `${row.badgeColor}12`,
              borderRadius: 5, padding: "3px 10px",
              fontWeight: 700, letterSpacing: "0.04em",
            }}>{row.badge}</div>
          </div>
        );
      })}
    </Shell>
  );
};

// ── Scene 3: Adversarial Robustness (240f = 8s + HOLD) ───────────────
export const PG_Adversarial: React.FC = () => {
  const frame = useHeldFrame();

  // Line drawing compressed 30→100 (70f = 2.3s); downstream retimed
  const titleOp = lerp(frame, 0, 1, 5, 20);
  const axesOp = lerp(frame, 0, 1, 15, 35);
  const calloutOp = lerp(frame, 0, 1, 102, 120);
  const footerOp = lerp(frame, 0, 1, 128, 148);

  // Chart geometry
  const CX = 160;
  const CW = 870;
  const CY = 80;
  const CH = 400;

  const EPS = [0.0, 0.01, 0.05, 0.1, 0.2, 0.5];
  const GINE = [0.989, 0.9396, 0.9258, 0.8566, 0.7078, 0.5624];
  const XGB = [0.9947, 0.9006, 0.7979, 0.7513, 0.7029, 0.5990];
  const N = EPS.length;

  const cx = (i: number) => CX + (i / (N - 1)) * CW;
  const cy = (v: number) => CY + CH - ((v - 0.5) / 0.5) * CH;

  const ginePath = GINE.map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  const xgbPath = XGB.map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");

  // Precomputed total path lengths (px)
  const GINE_LEN = 956;
  const XGB_LEN = 931;

  const gineOffset = lerp(frame, GINE_LEN, 0, 30, 100);
  const xgbOffset = lerp(frame, XGB_LEN, 0, 30, 100);

  // Dot frames retimed for 30→100 drawing window (proportional to cumulative length)
  const GINE_DOTS = [30, 43, 56, 69, 85, 100];
  const XGB_DOTS = [30, 44, 59, 72, 86, 100];

  const Y_TICKS = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5];

  // Callout at ε=0.05 (i=2)
  const cx2 = cx(2);
  const gineY2 = cy(GINE[2]);
  const xgbY2 = cy(XGB[2]);
  const midY2 = (gineY2 + xgbY2) / 2;

  return (
    <Shell>
      <div style={{
        position: "absolute", top: 22, left: 0, right: 0,
        textAlign: "center", opacity: titleOp, fontFamily: MONO,
      }}>
        <span style={{ fontSize: fs(12), color: C.dim, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          adversarial robustness · feature noise injection
        </span>
      </div>

      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {/* Axes and grid */}
        <g opacity={axesOp}>
          <line x1={CX} y1={CY + CH} x2={CX + CW} y2={CY + CH} stroke={C.border} strokeWidth={1.5} />
          <line x1={CX} y1={CY} x2={CX} y2={CY + CH} stroke={C.border} strokeWidth={1.5} />
          {Y_TICKS.map((v) => {
            const y = cy(v);
            return (
              <g key={v}>
                <line x1={CX} y1={y} x2={CX + CW} y2={y}
                  stroke={C.border} strokeWidth={0.8} strokeDasharray="5,5" opacity={0.5} />
                <text x={CX - 12} y={y + 5}
                  textAnchor="end" fill={C.dimmer}
                  fontSize={fs(11)} fontFamily={MONO}
                >{v.toFixed(1)}</text>
              </g>
            );
          })}
          {EPS.map((e, i) => (
            <g key={e}>
              <line x1={cx(i)} y1={CY + CH} x2={cx(i)} y2={CY + CH + 6}
                stroke={C.border} strokeWidth={1.5} />
              <text x={cx(i)} y={CY + CH + 22}
                textAnchor="middle" fill={C.dimmer}
                fontSize={fs(11)} fontFamily={MONO}
              >{e}</text>
            </g>
          ))}
          <text
            x={CX + CW / 2} y={CY + CH + 50}
            textAnchor="middle" fill={C.dim}
            fontSize={fs(12)} fontFamily={MONO}
            style={{ textTransform: "uppercase" as const, letterSpacing: "0.1em" }}
          >Feature Noise ε</text>
        </g>

        {/* GINe line */}
        <path d={ginePath}
          stroke={C.cyan} strokeWidth={3} fill="none"
          strokeDasharray={GINE_LEN} strokeDashoffset={gineOffset}
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* XGBoost line */}
        <path d={xgbPath}
          stroke={C.amber} strokeWidth={3} fill="none"
          strokeDasharray={XGB_LEN} strokeDashoffset={xgbOffset}
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* GINe dots */}
        {GINE.map((v, i) => {
          const dotOp = lerp(frame, 0, 1, GINE_DOTS[i], GINE_DOTS[i] + 10);
          return <circle key={i} cx={cx(i)} cy={cy(v)} r={5.5} fill={C.cyan} opacity={dotOp} />;
        })}

        {/* XGB dots */}
        {XGB.map((v, i) => {
          const dotOp = lerp(frame, 0, 1, XGB_DOTS[i], XGB_DOTS[i] + 10);
          return <circle key={i} cx={cx(i)} cy={cy(v)} r={5.5} fill={C.amber} opacity={dotOp} />;
        })}

        {/* End-value labels at ε=0.5 (i=5) */}
        <g opacity={lerp(frame, 0, 1, 100, 114)}>
          <text x={cx(5) + 14} y={cy(GINE[5]) + 5}
            fill={C.cyan} fontSize={fs(11)} fontFamily={MONO} fontWeight={700}
          >{GINE[5].toFixed(3)}</text>
          <text x={cx(5) + 14} y={cy(XGB[5]) + 5}
            fill={C.amber} fontSize={fs(11)} fontFamily={MONO} fontWeight={700}
          >{XGB[5].toFixed(3)}</text>
        </g>

        {/* Divergence callout at ε=0.05 */}
        <g opacity={calloutOp}>
          <line x1={cx2} y1={gineY2} x2={cx2} y2={xgbY2}
            stroke={C.red} strokeWidth={1.5} strokeDasharray="4,3" />
          <rect x={cx2 + 20} y={midY2 - 13} width={76} height={24}
            fill={C.bg} stroke={C.red} strokeWidth={1} rx={3} />
          <text x={cx2 + 58} y={midY2 + 5}
            textAnchor="middle" fill={C.red}
            fontSize={fs(12)} fontFamily={MONO} fontWeight={700}
          >Δ0.128</text>
        </g>
      </svg>

      {/* Legend — placed top-right, clear of last data point at x=1030 */}
      <div style={{
        position: "absolute", top: 55, right: 50,
        opacity: axesOp, fontFamily: MONO,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {[
          { label: "GINe", color: C.cyan },
          { label: "XGBoost", color: C.amber },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 3, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: fs(12), color, letterSpacing: "0.06em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 26, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: footerOp, fontFamily: MONO,
      }}>
        <div style={{
          border: `1px solid ${C.cyan}55`,
          background: `${C.cyan}0c`,
          borderRadius: 8, padding: "12px 36px",
          fontSize: fs(14), color: C.cyan,
          letterSpacing: "0.06em",
        }}>
          Topology absorbs noise. Flat features cannot.
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 4: Integrated Gradients (240f = 8s) ─────────────────────────
export const PG_Explainability: React.FC = () => {
  const frame = useHeldFrame();

  const titleOp = lerp(frame, 0, 1, 5, 28);
  const footerOp = lerp(frame, 0, 1, 200, 220);
  const glowStart = 180;

  const STAGGER = 160 / PG_EDGES.length;

  return (
    <Shell>
      <div style={{
        position: "absolute", top: 22, left: 0, right: 0,
        textAlign: "center", opacity: titleOp, fontFamily: MONO,
      }}>
        <span style={{
          fontSize: fs(12), color: C.dim,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          integrated gradients · edge attribution
        </span>
      </div>

      <svg style={{ position: "absolute", inset: 0 }} width="1200" height="630">
        {PG_EDGES.map(([from, to], i) => {
          const n1 = PG_NODES[from];
          const n2 = PG_NODES[to];
          const revealStart = 10 + i * STAGGER;
          const edgeOp = lerp(frame, 0, 1, revealStart, revealStart + 18);
          const score = ATTRIBUTION_DATA[i];
          const color = attrColor(score);
          const isTop = TOP_CAUSAL.includes(i);
          const glowProg = isTop ? lerp(frame, 0, 1, glowStart, glowStart + 22) : 0;
          return (
            <g key={i}>
              {isTop && (
                <line
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                  stroke={color} strokeWidth={10}
                  opacity={glowProg * 0.22}
                />
              )}
              <line
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke={color}
                strokeWidth={isTop ? lerp(frame, 2, 3.5, glowStart, glowStart + 22) : 2}
                opacity={edgeOp}
              />
            </g>
          );
        })}

        {PG_NODES.map((node, i) => {
          const nodeOp = lerp(frame, 0, 1, 8 + i * 3, 22 + i * 3);
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={node.x} cy={node.y} r={15}
                fill={`${C.dim}18`} stroke={C.border} strokeWidth={1.5} />
              <text x={node.x} y={node.y + 32}
                textAnchor="middle" fill={C.dimmer}
                fontSize={11} fontFamily={MONO}>
                {node.label}
              </text>
            </g>
          );
        })}

        {TOP_CAUSAL.map((ei) => {
          const [from, to] = PG_EDGES[ei];
          const n1 = PG_NODES[from];
          const n2 = PG_NODES[to];
          const mx = (n1.x + n2.x) / 2;
          const my = (n1.y + n2.y) / 2;
          const score = ATTRIBUTION_DATA[ei];
          const color = attrColor(score);
          const labelOp = lerp(frame, 0, 1, glowStart + 10, glowStart + 30);
          return (
            <g key={ei} opacity={labelOp}>
              <rect x={mx - 24} y={my - 16} width={48} height={22}
                fill={C.bg} stroke={color} strokeWidth={1} rx={3} />
              <text x={mx} y={my - 1}
                textAnchor="middle" fill={color}
                fontSize={fs(11)} fontFamily={MONO} fontWeight={700}>
                {score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        position: "absolute", top: 60, right: 34,
        fontFamily: MONO, opacity: lerp(frame, 0, 1, 30, 50),
      }}>
        {[
          { label: "low", color: C.border },
          { label: "mid", color: C.blue },
          { label: "high", color: C.red },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 3, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: fs(11), color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", bottom: 26, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: footerOp, fontFamily: MONO,
      }}>
        <div style={{
          border: `1px solid ${C.red}55`,
          background: `${C.red}0c`,
          borderRadius: 8, padding: "12px 36px",
          fontSize: fs(14), color: C.red,
          letterSpacing: "0.08em",
        }}>
          Top-3 causal lines: T6–T7 (0.95) · G2–T6 (0.88) · G2–T7 (0.82)
        </div>
      </div>
    </Shell>
  );
};
