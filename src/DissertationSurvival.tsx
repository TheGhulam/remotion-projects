import React from "react";
import { interpolate, Easing, spring, useVideoConfig } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
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

function fadeIn(frame: number, start: number, dur = 20) {
  return lerp(frame, 0, 1, start, start + dur);
}

// ── Scene 1: DS-Pipeline (2-D academic pipeline) ─────────────────────
export const DS_Pipeline: React.FC = () => {
  const frame = useHeldFrame();

  const titleOp = fadeIn(frame, 5, 20);

  // Block fade-ins
  const b1Op = fadeIn(frame, 10, 18);
  const b2Op = fadeIn(frame, 65, 18);
  const b3Op = fadeIn(frame, 130, 18);
  const b4Op = fadeIn(frame, 198, 18);

  // Arrow draw progress
  const a1p = lerp(frame, 0, 1, 50, 68);
  const a2p = lerp(frame, 0, 1, 115, 133);
  const a3p = lerp(frame, 0, 1, 183, 200);

  // Sensor waveform draw
  const waveP = lerp(frame, 0, 1, 18, 55);

  // Foundation model name cycling
  const MODEL_NAMES = ["MOMENT", "Chronos", "Moirai"];
  const fmIdx = Math.floor(frame / 50) % 3;
  const fmNameOp = 1 - lerp(
    frame, 0, 1,
    Math.floor(frame / 50) * 50 + 43,
    Math.floor(frame / 50) * 50 + 50
  );

  // Head row appearances
  const head0Op = fadeIn(frame, 138, 14);
  const head1Op = fadeIn(frame, 163, 14);
  const head2Op = fadeIn(frame, 178, 14);

  const arrowPath1 = "M 245 315 L 308 315";
  const arrowPath2 = "M 560 315 L 638 315";
  const arrowPath3 = "M 890 315 L 978 315";

  const { strokeDasharray: sa1, strokeDashoffset: so1 } = evolvePath(a1p, arrowPath1);
  const { strokeDasharray: sa2, strokeDashoffset: so2 } = evolvePath(a2p, arrowPath2);
  const { strokeDasharray: sa3, strokeDashoffset: so3 } = evolvePath(a3p, arrowPath3);

  // Sensor waveforms (3 channels)
  const makeWave = (freq: number, amp: number, yOff: number) =>
    Array.from({ length: 44 }, (_, i) => {
      const x = 70 + (i / 43) * 156;
      const y = yOff + Math.sin((i / 43) * Math.PI * 2 * freq) * amp;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  const waves = [
    { path: makeWave(2.5, 13, 258), color: C.cyan },
    { path: makeWave(1.7, 9, 295), color: C.green },
    { path: makeWave(3.1, 7, 330), color: C.amber },
  ];

  // Transformer-layer stack constants
  const LAYER_TOP = 264;
  const LAYER_H = 36;
  const LAYER_GAP = 10;
  const LAYER_X = 322;
  const LAYER_W = 224;

  // Survival heads
  const HEADS = [
    { label: "CoxPH", sub: "proportional hazards", color: C.green, yTop: 250 },
    { label: "DeepHit", sub: "discrete time", color: C.cyan, yTop: 318 },
    { label: "MTLR", sub: "multi-task logistic", color: C.purple, yTop: 386 },
  ];
  const headOps = [head0Op, head1Op, head2Op];

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width={1200} height={630}>

        {/* Title */}
        <text x={600} y={55} fontFamily={MONO} fontSize={fs(16)} fill={C.dim}
          textAnchor="middle" letterSpacing="0.18em" opacity={titleOp}>
          C-MAPSS · N-CMAPSS — MODEL ARCHITECTURE
        </text>

        {/* ── Block 1: Sensor Data ── */}
        <g opacity={b1Op}>
          <rect x={50} y={185} width={195} height={260} rx={8}
            fill={C.bg} stroke={C.border} strokeWidth={2} />
          <text x={147} y={214} fontFamily={MONO} fontSize={fs(12)} fill={C.dim}
            textAnchor="middle" letterSpacing="0.14em">SENSOR DATA</text>
          <line x1={60} y1={222} x2={234} y2={222} stroke={C.border} strokeWidth={1} />
          {waves.map(({ path, color }, i) => {
            const { strokeDasharray, strokeDashoffset } = evolvePath(waveP, path);
            return (
              <path key={i} d={path} fill="none" stroke={color} strokeWidth={2.2}
                strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
            );
          })}
          <text x={70} y={252} fontFamily={MONO} fontSize={fs(11)} fill={C.cyan}>T2</text>
          <text x={70} y={289} fontFamily={MONO} fontSize={fs(11)} fill={C.green}>P3</text>
          <text x={70} y={324} fontFamily={MONO} fontSize={fs(11)} fill={C.amber}>NRf</text>
          <text x={147} y={400} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
            textAnchor="middle">21 sensors · T cycles</text>
        </g>

        {/* Arrow 1 */}
        <path d={arrowPath1} stroke={C.dim} strokeWidth={2.5} fill="none"
          strokeDasharray={sa1} strokeDashoffset={so1} />
        <path d="M 303 309 L 310 315 L 303 321" fill={C.dim}
          opacity={a1p > 0.9 ? 1 : 0} />

        {/* ── Block 2: Foundation Model ── */}
        <g opacity={b2Op}>
          <rect x={310} y={135} width={250} height={360} rx={8}
            fill={`${C.cyan}10`} stroke={C.cyan} strokeWidth={2.5} />
          <text x={435} y={165} fontFamily={MONO} fontSize={fs(12)} fill={C.cyan}
            textAnchor="middle" letterSpacing="0.14em">FOUNDATION MODEL</text>
          <line x1={320} y1={174} x2={550} y2={174} stroke={`${C.cyan}55`} strokeWidth={1} />

          {/* FROZEN badge */}
          <rect x={375} y={182} width={120} height={28} rx={5}
            fill={`${C.cyan}22`} stroke={C.cyan} strokeWidth={1.5} />
          <text x={435} y={201} fontFamily={MONO} fontSize={fs(11)} fill={C.cyan}
            textAnchor="middle" letterSpacing="0.1em">⬡ FROZEN</text>

          {/* Cycling model name */}
          <text x={435} y={244} fontFamily={MONO} fontSize={fs(18)} fill={C.white}
            textAnchor="middle" fontWeight={700} opacity={fmNameOp}>
            {MODEL_NAMES[fmIdx]}
          </text>

          {/* Transformer layer stack */}
          {Array.from({ length: 4 }, (_, i) => {
            const ly = LAYER_TOP + i * (LAYER_H + LAYER_GAP);
            return (
              <g key={i} opacity={fadeIn(frame, 78 + i * 8, 14)}>
                <rect x={LAYER_X} y={ly} width={LAYER_W} height={LAYER_H} rx={4}
                  fill={`${C.cyan}18`} stroke={`${C.cyan}70`} strokeWidth={1.2} />
                <text x={LAYER_X + LAYER_W / 2} y={ly + 23} fontFamily={MONO}
                  fontSize={fs(11)} fill={C.dim} textAnchor="middle">
                  {i < 3 ? `Encoder Layer ${i + 1}` : "Encoder Layer N"}
                </text>
              </g>
            );
          })}

          {/* Embedding label */}
          <rect x={350} y={448} width={170} height={34} rx={4}
            fill={`${C.cyan}15`} stroke={`${C.cyan}55`} strokeWidth={1} />
          <text x={435} y={470} fontFamily={MONO} fontSize={fs(12)} fill={C.cyan}
            textAnchor="middle">ℝ⁵¹² embeddings</text>
        </g>

        {/* Arrow 2 */}
        <path d={arrowPath2} stroke={C.dim} strokeWidth={2.5} fill="none"
          strokeDasharray={sa2} strokeDashoffset={so2} />
        <path d="M 633 309 L 640 315 L 633 321" fill={C.dim}
          opacity={a2p > 0.9 ? 1 : 0} />

        {/* ── Block 3: Survival Head ── */}
        <g opacity={b3Op}>
          <rect x={640} y={160} width={250} height={310} rx={8}
            fill={`${C.green}08`} stroke={C.green} strokeWidth={2} />
          <text x={765} y={190} fontFamily={MONO} fontSize={fs(12)} fill={C.green}
            textAnchor="middle" letterSpacing="0.14em">SURVIVAL HEAD</text>
          <line x1={650} y1={199} x2={880} y2={199} stroke={`${C.green}55`} strokeWidth={1} />

          {/* TRAINABLE badge */}
          <rect x={697} y={207} width={136} height={28} rx={5}
            fill={`${C.green}22`} stroke={C.green} strokeWidth={1.5} />
          <text x={765} y={226} fontFamily={MONO} fontSize={fs(11)} fill={C.green}
            textAnchor="middle" letterSpacing="0.1em">⬡ TRAINABLE</text>

          {/* Head rows */}
          {HEADS.map(({ label, sub, color, yTop }, i) => (
            <g key={label} opacity={headOps[i]}>
              <rect x={658} y={yTop} width={214} height={54} rx={5}
                fill={`${color}14`} stroke={`${color}70`} strokeWidth={1.5} />
              <text x={765} y={yTop + 24} fontFamily={MONO} fontSize={fs(14)} fill={color}
                textAnchor="middle" fontWeight={700}>{label}</text>
              <text x={765} y={yTop + 42} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
                textAnchor="middle">{sub}</text>
            </g>
          ))}
        </g>

        {/* Arrow 3 */}
        <path d={arrowPath3} stroke={C.dim} strokeWidth={2.5} fill="none"
          strokeDasharray={sa3} strokeDashoffset={so3} />
        <path d="M 973 309 L 980 315 L 973 321" fill={C.dim}
          opacity={a3p > 0.9 ? 1 : 0} />

        {/* ── Block 4: Output ── */}
        <g opacity={b4Op}>
          <rect x={980} y={210} width={170} height={210} rx={8}
            fill={C.bg} stroke={C.border} strokeWidth={2} />
          <text x={1065} y={238} fontFamily={MONO} fontSize={fs(12)} fill={C.dim}
            textAnchor="middle" letterSpacing="0.14em">OUTPUT</text>
          <line x1={990} y1={247} x2={1140} y2={247} stroke={C.border} strokeWidth={1} />
          <text x={1065} y={312} fontFamily={MONO} fontSize={fs(38)} fill={C.green}
            textAnchor="middle" fontWeight={700}>S(t)</text>
          <text x={1065} y={350} fontFamily={MONO} fontSize={fs(12)} fill={C.dimmer}
            textAnchor="middle">P(T &gt; t)</text>
          <text x={1065} y={385} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
            textAnchor="middle">survival over</text>
          <text x={1065} y={403} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
            textAnchor="middle">flight cycles</text>
        </g>

      </svg>
    </Shell>
  );
};

// ── Scene 3: DS-SurvivalCurve ────────────────────────────────────────
const ENGINES = [
  {
    color: C.green,
    label: "Engine 1",
    // step pairs [cycle, survival_prob * 420 y-space]
    steps: [0, 1, 20, 0.97, 40, 0.91, 60, 0.82, 80, 0.70, 100, 0.55, 120, 0.36, 140, 0.18, 160, 0.05],
  },
  {
    color: C.cyan,
    label: "Engine 2",
    steps: [0, 1, 30, 0.98, 55, 0.94, 80, 0.86, 110, 0.71, 140, 0.51, 170, 0.28, 200, 0.08],
  },
  {
    color: C.amber,
    label: "Engine 3",
    steps: [0, 1, 25, 0.99, 50, 0.92, 70, 0.78, 90, 0.60, 110, 0.42, 130, 0.22, 150, 0.07],
  },
  {
    color: C.purple,
    label: "Engine 4",
    steps: [0, 1, 15, 0.95, 35, 0.85, 55, 0.70, 75, 0.52, 95, 0.33, 115, 0.15, 135, 0.04],
  },
];

function makeSurvivalPath(
  steps: number[],
  xFn: (c: number) => number,
  yFn: (s: number) => number
) {
  const pts: string[] = [];
  for (let i = 0; i < steps.length; i += 2) {
    const c = steps[i];
    const s = steps[i + 1];
    if (i === 0) {
      pts.push(`M ${xFn(c).toFixed(1)} ${yFn(s).toFixed(1)}`);
    } else {
      // horizontal step then vertical drop
      pts.push(`L ${xFn(c).toFixed(1)} ${yFn(steps[i - 1]).toFixed(1)}`);
      pts.push(`L ${xFn(c).toFixed(1)} ${yFn(s).toFixed(1)}`);
    }
  }
  return pts.join(" ");
}

export const DS_SurvivalCurve: React.FC = () => {
  const frame = useHeldFrame();

  const L = 120, R = 1080, T = 80, B = 520;
  const xFn = (c: number) => L + (c / 200) * (R - L);
  const yFn = (s: number) => B - s * (B - T);

  // Axes fade in
  const axisOp = fadeIn(frame, 5, 20);

  // Each curve draws in sequentially (40f each)
  const curvePaths = ENGINES.map((e) =>
    makeSurvivalPath(e.steps, xFn, yFn)
  );
  const curveProgs = ENGINES.map((_, i) => lerp(frame, 0, 1, 20 + i * 35, 60 + i * 35));
  const curveEvolved = curvePaths.map((p, i) => evolvePath(curveProgs[i], p));

  // Annotation: appears at frame 160
  const annoOp = fadeIn(frame, 155, 25);

  // Dashed regression line at t=47
  const regressionOp = fadeIn(frame, 130, 20);

  // Confidence band for engine 1 — appears at frame 100
  const bandOp = lerp(frame, 0, 0.2, 100, 130);
  const upperSteps = [0, 1, 20, 0.99, 40, 0.96, 60, 0.90, 80, 0.80, 100, 0.67, 120, 0.48, 140, 0.28, 160, 0.12];
  const lowerSteps = [0, 1, 20, 0.94, 40, 0.85, 60, 0.73, 80, 0.59, 100, 0.43, 120, 0.24, 140, 0.10, 160, 0.01];

  const bandPoints = (() => {
    const upper: Array<[number, number]> = [];
    const lower: Array<[number, number]> = [];
    for (let i = 0; i < upperSteps.length; i += 2) {
      upper.push([xFn(upperSteps[i]), yFn(upperSteps[i + 1])]);
      lower.push([xFn(lowerSteps[i]), yFn(lowerSteps[i + 1])]);
    }
    const forwardPts = upper.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const backwardPts = lower.slice().reverse().map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return `${forwardPts} ${backwardPts}`;
  })();

  const annotation90x = xFn(30);
  const annotation90y = yFn(0.9);

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width={1200} height={630}>

        {/* Title */}
        <text x={600} y={55} fontFamily={MONO} fontSize={fs(16)} fill={C.dim}
          textAnchor="middle" letterSpacing="0.18em" opacity={axisOp}>
          SURVIVAL ANALYSIS — S(t) OVER FLIGHT CYCLES
        </text>

        {/* Axes */}
        <g opacity={axisOp}>
          <line x1={L} y1={B} x2={R} y2={B} stroke={C.border} strokeWidth={2} />
          <line x1={L} y1={T} x2={L} y2={B} stroke={C.border} strokeWidth={2} />
          {/* X ticks */}
          {[0, 50, 100, 150, 200].map((v) => (
            <g key={v}>
              <line x1={xFn(v)} y1={B} x2={xFn(v)} y2={B + 6} stroke={C.border} strokeWidth={1.5} />
              <text x={xFn(v)} y={B + 22} fontFamily={MONO} fontSize={fs(12)} fill={C.dimmer} textAnchor="middle">{v}</text>
            </g>
          ))}
          {/* Y ticks */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
            <g key={v}>
              <line x1={L - 6} y1={yFn(v)} x2={L} y2={yFn(v)} stroke={C.border} strokeWidth={1.5} />
              <text x={L - 14} y={yFn(v) + 4} fontFamily={MONO} fontSize={fs(12)} fill={C.dimmer} textAnchor="end">{v.toFixed(2)}</text>
            </g>
          ))}
          <text x={600} y={B + 50} fontFamily={MONO} fontSize={fs(14)} fill={C.dimmer} textAnchor="middle">Cycles</text>
          <text x={L - 52} y={300} fontFamily={MONO} fontSize={fs(14)} fill={C.dimmer} textAnchor="middle"
            transform={`rotate(-90, ${L - 72}, 300)`}>S(t)</text>
        </g>

        {/* Confidence band */}
        <polygon points={bandPoints} fill={`${C.green}`} opacity={bandOp} />

        {/* Survival curves */}
        {ENGINES.map((e, i) => (
          <path key={i} d={curvePaths[i]} fill="none" stroke={e.color} strokeWidth={3}
            strokeDasharray={curveEvolved[i].strokeDasharray}
            strokeDashoffset={curveEvolved[i].strokeDashoffset} />
        ))}

        {/* Legend */}
        {ENGINES.map((e, i) => (
          <g key={i} opacity={fadeIn(frame, 60 + i * 35, 15)}>
            <line x1={910} y1={100 + i * 28} x2={940} y2={100 + i * 28}
              stroke={e.color} strokeWidth={3} />
            <text x={948} y={105 + i * 28} fontFamily={MONO} fontSize={fs(12)} fill={C.dim}>{e.label}</text>
          </g>
        ))}

        {/* Regression threshold line */}
        <g opacity={regressionOp}>
          <line x1={xFn(47)} y1={T} x2={xFn(47)} y2={B} stroke={C.amber} strokeWidth={2}
            strokeDasharray="8,5" />
          <text x={xFn(47) + 8} y={T + 330} fontFamily={MONO} fontSize={fs(12)} fill={C.amber}>
            47 cycles
          </text>
          <text x={xFn(47) + 8} y={T + 347} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}>
            (regression estimate)
          </text>
        </g>

        {/* 90% annotation — box placed right-of-regression to avoid overlap */}
        <g opacity={annoOp}>
          <circle cx={annotation90x} cy={annotation90y} r={4} fill={C.green} />
          <line x1={annotation90x} y1={annotation90y} x2={250} y2={250}
            stroke={C.dim} strokeWidth={1.5} />
          <rect x={130} y={250} width={200} height={54}
            rx={6} fill={`${C.green}22`} stroke={C.green} strokeWidth={1.5} />
          <text x={230} y={270} fontFamily={MONO} fontSize={fs(13)} fill={C.green}
            textAnchor="middle">90% survive past</text>
          <text x={230} y={290} fontFamily={MONO} fontSize={fs(13)} fill={C.green}
            textAnchor="middle">30 cycles</text>
        </g>
      </svg>
    </Shell>
  );
};

// ── Scene 4: DS-ModelRace ────────────────────────────────────────────
const HEADS = [
  { label: "CoxPH", cindex: 0.949, color: C.green, delay: 0, note: "" },
  { label: "MTLR", cindex: 0.821, color: C.cyan, delay: 15, note: "" },
  { label: "DeepHit", cindex: 0.793, color: C.blue, delay: 30, note: "" },
  { label: "CoxTime", cindex: 0.771, color: C.purple, delay: 45, note: "" },
  { label: "DSM", cindex: 0.512, color: C.red, delay: 60, note: "⚠ degenerate" },
  { label: "Weibull", cindex: 0.503, color: C.red, delay: 75, note: "⚠ degenerate" },
];

export const DS_ModelRace: React.FC = () => {
  const frame = useHeldFrame();
  const { fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 5, 20);
  const BAR_MAX_W = 750;
  const barX = 210;
  const rowH = 72;
  const topY = 90;

  const badgeOp = fadeIn(frame, 110, 20);

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width={1200} height={630}>

        {/* Title */}
        <text x={600} y={55} fontFamily={MONO} fontSize={fs(16)} fill={C.dim}
          textAnchor="middle" letterSpacing="0.18em" opacity={titleOp}>
          SURVIVAL HEAD PERFORMANCE — N-CMAPSS · CHRONOS
        </text>

        {HEADS.map((h, i) => {
          const sp = spring({ frame: frame - h.delay, fps, config: { damping: 200 } });
          const barW = Math.min(sp, 1) * h.cindex * BAR_MAX_W;
          const y = topY + i * rowH;
          const labelOp = fadeIn(frame, h.delay + 5, 15);

          return (
            <g key={h.label}>
              {/* Row label */}
              <text x={barX - 16} y={y + 28} fontFamily={MONO} fontSize={fs(18)} fill={h.color}
                textAnchor="end" fontWeight={700} opacity={labelOp}>
                {h.label}
              </text>
              {/* Bar background */}
              <rect x={barX} y={y + 6} width={BAR_MAX_W} height={40} rx={4}
                fill={`${C.border}44`} opacity={labelOp} />
              {/* Bar fill */}
              <rect x={barX} y={y + 6} width={Math.max(0, barW)} height={40} rx={4}
                fill={h.color} opacity={0.85} />
              {/* C-index value */}
              <text x={barX + Math.max(barW + 12, 60)} y={y + 32} fontFamily={MONO}
                fontSize={fs(16)} fill={h.color} opacity={labelOp}>
                {h.cindex.toFixed(3)}
              </text>
              {/* Degenerate note */}
              {h.note && (
                <text x={barX + barW + 80} y={y + 32} fontFamily={MONO}
                  fontSize={fs(12)} fill={C.red} opacity={labelOp}>
                  {h.note}
                </text>
              )}
            </g>
          );
        })}

        {/* C-index axis */}
        <g opacity={fadeIn(frame, 85, 15)}>
          <line x1={barX} y1={520} x2={barX + BAR_MAX_W} y2={520}
            stroke={C.border} strokeWidth={1.5} />
          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
            <g key={v}>
              <line x1={barX + v * BAR_MAX_W} y1={518} x2={barX + v * BAR_MAX_W} y2={524}
                stroke={C.border} strokeWidth={1.5} />
              <text x={barX + v * BAR_MAX_W} y={540} fontFamily={MONO} fontSize={fs(11)}
                fill={C.dimmer} textAnchor="middle">{v.toFixed(2)}</text>
            </g>
          ))}
          <text x={barX + BAR_MAX_W / 2} y={568} fontFamily={MONO} fontSize={fs(12)}
            fill={C.dimmer} textAnchor="middle">C-index (concordance)</text>
          <line x1={barX + 0.5 * BAR_MAX_W} y1={90} x2={barX + 0.5 * BAR_MAX_W} y2={516}
            stroke={`${C.border}80`} strokeWidth={1} strokeDasharray="4,4" />
          <text x={barX + 0.5 * BAR_MAX_W - 55} y={80} fontFamily={MONO} fontSize={fs(11)}
            fill={C.dimmer}>random chance</text>
        </g>
      </svg>
    </Shell>
  );
};

// ── Scene 7: DS-Bearing ──────────────────────────────────────────────
export const DS_Bearing: React.FC = () => {
  const frame = useHeldFrame();
  const { fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 0);

  // Waveform: amplitude increases over time (bearing degradation)
  const waveW = 900;
  const waveX0 = 150;
  const waveY0 = 200;
  const waveProgress = lerp(frame, 0, 1, 5, 100);
  const ampGrowth = lerp(frame, 0.08, 1.0, 0, 120);

  const wavePts = Array.from({ length: 200 }, (_, i) => {
    const t = i / 199;
    const x = waveX0 + t * waveW;
    const amp = 70 * (0.1 + 0.9 * (t * ampGrowth));
    const freq = 4 + t * 8; // increasing frequency
    const y = waveY0 + Math.sin(t * Math.PI * 2 * freq) * amp;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const { strokeDasharray: waveDA, strokeDashoffset: waveDO } = evolvePath(waveProgress, wavePts);

  // Gauge: semi-circle from 0.607 → 0.828
  // Centre at gy=455 with gr=130 keeps bottom at 455+130=585, within 630px canvas
  const gx = 600, gy = 555;
  const gr = 130;
  const baseVal = 0.607;
  const targetVal = 0.828;
  const gaugeVal = lerp(frame, baseVal, targetVal, 60, 150);

  // Map C-index 0→1 to angle -180°→0° (left semicircle)
  const ciToAngle = (ci: number) =>
    interpolate(ci, [0, 1], [-Math.PI, 0]);

  const baseAngle = ciToAngle(baseVal);
  const currentAngle = ciToAngle(gaugeVal);
  const targetAngle = ciToAngle(targetVal);

  const arcX = (a: number) => gx + gr * Math.cos(a);
  const arcY = (a: number) => gy + gr * Math.sin(a);

  // Background arc (full semi-circle)
  const bgArcPath = `M ${arcX(-Math.PI)} ${arcY(-Math.PI)} A ${gr} ${gr} 0 0 1 ${arcX(0)} ${arcY(0)}`;
  // Baseline arc (to 0.607)
  const baseArcPath = `M ${arcX(-Math.PI)} ${arcY(-Math.PI)} A ${gr} ${gr} 0 0 1 ${arcX(baseAngle)} ${arcY(baseAngle)}`;
  // Current arc (animated)
  const currentLargeArc = currentAngle - (-Math.PI) > Math.PI ? 1 : 0;
  const currentArcPath = `M ${arcX(-Math.PI)} ${arcY(-Math.PI)} A ${gr} ${gr} 0 ${currentLargeArc} 1 ${arcX(currentAngle)} ${arcY(currentAngle)}`;

  // Needle
  const needleAngle = currentAngle;
  const needleX = gx + (gr - 20) * Math.cos(needleAngle);
  const needleY = gy + (gr - 20) * Math.sin(needleAngle);

  // +21 pp badge
  const badgeSp = spring({ frame: frame - 100, fps, config: { damping: 200 } });
  const badgeOp = fadeIn(frame, 100, 20);

  return (
    <Shell>
      <svg style={{ position: "absolute", inset: 0 }} width={1200} height={630}>

        {/* Title */}
        <text x={600} y={55} fontFamily={MONO} fontSize={fs(16)} fill={C.dim}
          textAnchor="middle" letterSpacing="0.18em" opacity={titleOp}>
          XJTU-SY BEARING — CROSS-DOMAIN TRANSFER
        </text>

        {/* Waveform label */}
        <text x={waveX0} y={waveY0 - 95} fontFamily={MONO} fontSize={fs(14)} fill={C.dimmer}
          opacity={fadeIn(frame, 5)}>
          Vibration signal (accelerometer)
        </text>
        {/* Waveform axes */}
        <line x1={waveX0} y1={waveY0 - 80} x2={waveX0} y2={waveY0 + 80}
          stroke={C.border} strokeWidth={1.5} opacity={fadeIn(frame, 5)} />
        <line x1={waveX0} y1={waveY0 + 80} x2={waveX0 + waveW} y2={waveY0 + 80}
          stroke={C.border} strokeWidth={1.5} opacity={fadeIn(frame, 5)} />
        <text x={waveX0 + waveW} y={waveY0 + 102} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
          textAnchor="end" opacity={fadeIn(frame, 5)}>time →</text>
        {/* Degradation arrow */}
        <path d={`M ${waveX0 + waveW - 100} ${waveY0 - 90} L ${waveX0 + waveW - 8} ${waveY0 - 90}`}
          stroke={C.red} strokeWidth={2}
          opacity={fadeIn(frame, 80)} />
        <path d={`M ${waveX0 + waveW - 14} ${waveY0 - 96} L ${waveX0 + waveW} ${waveY0 - 90} L ${waveX0 + waveW - 14} ${waveY0 - 84}`}
          fill="none" stroke={C.red} strokeWidth={2} strokeLinejoin="round"
          opacity={fadeIn(frame, 80)} />
        <text x={waveX0 + waveW - 180} y={waveY0 - 76} fontFamily={MONO} fontSize={fs(11)} fill={C.red}
          opacity={fadeIn(frame, 80)}>increasing wear</text>

        {/* Waveform path */}
        <path d={wavePts} fill="none" stroke={C.cyan} strokeWidth={2}
          strokeDasharray={waveDA} strokeDashoffset={waveDO} />

        {/* Gauge background */}
        <path d={bgArcPath} fill="none" stroke={`${C.border}`} strokeWidth={18} strokeLinecap="round"
          opacity={fadeIn(frame, 55)} />
        {/* Baseline bar (grey) */}
        <path d={baseArcPath} fill="none" stroke={C.dimmer} strokeWidth={18} strokeLinecap="round"
          opacity={fadeIn(frame, 55)} />
        {/* Current progress */}
        <path d={currentArcPath} fill="none" stroke={C.green} strokeWidth={18} strokeLinecap="round"
          opacity={fadeIn(frame, 60)} />

        {/* Needle */}
        <line x1={gx} y1={gy} x2={needleX} y2={needleY}
          stroke={C.white} strokeWidth={3} strokeLinecap="round"
          opacity={fadeIn(frame, 60)} />
        <circle cx={gx} cy={gy} r={10} fill={C.dim} opacity={fadeIn(frame, 60)} />

        {/* Gauge labels */}
        <text x={arcX(-Math.PI) - 10} y={arcY(-Math.PI) + 8} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
          textAnchor="end" opacity={fadeIn(frame, 55)}>0.0</text>
        <text x={arcX(0) + 10} y={arcY(0) + 8} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
          textAnchor="start" opacity={fadeIn(frame, 55)}>1.0</text>
        <text x={gx} y={gy + 28} fontFamily={MONO} fontSize={fs(14)} fill={C.dimmer}
          textAnchor="middle" opacity={fadeIn(frame, 55)}>C-index</text>

        {/* Current value */}
        <text x={gx} y={gy - 52} fontFamily={MONO} fontSize={fs(31)} fill={C.green}
          textAnchor="middle" fontWeight={700} opacity={fadeIn(frame, 60)}>
          {gaugeVal.toFixed(3)}
        </text>

        {/* Baseline label */}
        <text x={arcX(baseAngle)} y={arcY(baseAngle) - 32} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
          textAnchor="middle" opacity={fadeIn(frame, 60)}>
          LSTM+DeepHit
        </text>
        <text x={arcX(baseAngle)} y={arcY(baseAngle) - 20} fontFamily={MONO} fontSize={fs(11)} fill={C.dimmer}
          textAnchor="middle" opacity={fadeIn(frame, 60)}>
          0.607
        </text>

        {/* Target label */}
        <text x={arcX(targetAngle) + 12} y={arcY(targetAngle) - 12} fontFamily={MONO} fontSize={fs(11)} fill={C.green}
          opacity={fadeIn(frame, 110)}>
          Moirai+CoxPH
        </text>
        <text x={arcX(targetAngle) + 12} y={arcY(targetAngle)} fontFamily={MONO} fontSize={fs(11)} fill={C.green}
          opacity={fadeIn(frame, 110)}>
          0.828
        </text>

        {/* +21 pp badge */}
        <g opacity={badgeOp} transform={`translate(950, 480) scale(${Math.min(badgeSp, 1)})`}
          style={{ transformOrigin: "0 0" }}>
          <rect x={-60} y={-30} width={120} height={60} rx={10} fill={C.green} />
          <text x={0} y={10} fontFamily={MONO} fontSize={fs(24)} fill={C.bg}
            textAnchor="middle" fontWeight={700}>+21 pp</text>
        </g>
      </svg>
    </Shell>
  );
};