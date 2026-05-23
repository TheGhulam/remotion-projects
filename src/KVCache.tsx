import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

// ── timing (frames @ 30fps) ──────────────────────────────────────
const T = {
  titleIn: 0,
  prefillStart: 45,
  prefillPeak: 120,
  peakFlash: 125,
  compressFire: 150,
  memoryDrop: 165,
  memorySettle: 210,
  end: 270,
};

function easeInOut(t: number) {
  return Easing.bezier(0.4, 0, 0.2, 1)(t);
}

function lerp(frame: number, from: number, to: number, start: number, end: number) {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
}

// ── palette ──────────────────────────────────────────────────────
const C = {
  bg: "#080c10",
  grid: "#0d1520",
  border: "#1a2535",
  amber: "#f5a623",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  white: "#e2eaf4",
  dim: "#8ba3bc",
  dimmer: "#566a7f",
  orange: "#fb923c",
};

// ── MemBar component ──────────────────────────────────────────────
function MemBar({
  label,
  gb,
  maxGb,
  color,
  animated,
  frame,
  startFrame,
}: {
  label: string;
  gb: number;
  maxGb: number;
  color: string;
  animated?: boolean;
  frame: number;
  startFrame: number;
}) {
  const pct = Math.max(0, Math.min(1, gb / maxGb));
  const barW = animated
    ? lerp(frame, 0, pct * 100, startFrame, startFrame + 30)
    : pct * 100;

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: "'Courier New', monospace",
          fontSize: 20,
          color: C.dim,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>{gb.toFixed(1)} GB</span>
      </div>
      <div
        style={{
          height: 14,
          background: C.dimmer,
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barW}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 3,
            boxShadow: `0 0 10px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
export const KVCache: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOp = lerp(frame, 0, 1, T.titleIn, T.titleIn + 20);

  const memoryGb = (() => {
    if (frame < T.prefillStart) return 21;
    if (frame < T.prefillPeak) return lerp(frame, 21, 34, T.prefillStart, T.prefillPeak);
    if (frame < T.compressFire) return 34;
    if (frame < T.memorySettle) return lerp(frame, 34, 34 * 0.3 + 21 * 0.7, T.memoryDrop, T.memorySettle);
    return 34 * 0.3 + 21 * 0.7;
  })();
  const maxGb = 48;

  const peakVisible = frame >= T.peakFlash;
  const peakPulse = frame >= T.peakFlash
    ? Math.sin((frame - T.peakFlash) * 0.3) * 0.3 + 0.7
    : 0;

  const compressOp = lerp(frame, 0, 1, T.compressFire, T.compressFire + 15);

  const phase: "idle" | "prefill" | "peak" | "compress" | "done" = (() => {
    if (frame < T.prefillStart) return "idle";
    if (frame < T.peakFlash) return "prefill";
    if (frame < T.compressFire) return "peak";
    if (frame < T.memorySettle) return "compress";
    return "done";
  })();

  const tokenCount = Math.floor(
    frame < T.prefillStart
      ? 0
      : frame < T.prefillPeak
      ? lerp(frame, 0, 8192, T.prefillStart, T.prefillPeak)
      : 8192
  );

  const TOP_BAR = 64;
  const PAD = 32;
  const GAP = 28;
  const RIGHT_W = 340;
  const LEFT_W = 1200 - PAD * 2 - GAP - RIGHT_W; // 764

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        fontFamily: "'Courier New', monospace",
        overflow: "hidden",
      }}
    >
      {/* grid background */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.3 }}
        width="1200"
        height="630"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.grid} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1200" height="630" fill="url(#grid)" />
      </svg>

      {/* ── top bar ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: TOP_BAR,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${PAD}px`,
          background: "linear-gradient(180deg, #0d1520 0%, transparent 100%)",
        }}
      >
        <div style={{ display: "flex", gap: 40, fontSize: 24, color: C.dim }}>
          <span>
            tokens:{" "}
            <span style={{ color: C.cyan }}>{tokenCount.toLocaleString()}</span>
          </span>
          <span>
            context: <span style={{ color: C.blue }}>8192</span>
          </span>
          <span>
            model: <span style={{ color: C.white }}>llama-3.1-8b</span>
          </span>
        </div>
      </div>

      {/* ── left: chart ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: TOP_BAR + 18,
          left: PAD,
          width: LEFT_W,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: C.dim,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          memory timeline — 8k context
        </div>

        <MemoryChart
          frame={frame}
          peakVisible={peakVisible}
          peakPulse={peakPulse}
          compressOp={compressOp}
          width={LEFT_W}
        />

        {/* phase labels */}
        <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
          {[
            { label: "idle", color: C.dim, active: phase === "idle" },
            { label: "prefill", color: C.amber, active: phase === "prefill" || phase === "peak" },
            { label: "peak", color: C.red, active: phase === "peak" },
            { label: "compression", color: C.green, active: phase === "compress" || phase === "done" },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                padding: "7px 18px",
                borderRadius: 4,
                border: `1px solid ${p.active ? p.color : C.border}`,
                fontSize: 18,
                color: p.active ? p.color : C.dimmer,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: p.active ? `${p.color}18` : "transparent",
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── right: vram allocation panel ────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: TOP_BAR + 18,
          right: PAD,
          width: RIGHT_W,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: C.dim,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          vram allocation
        </div>

        <div
          style={{
            background: "#0d1520",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "24px 28px",
          }}
        >
          <MemBar
            label="weights"
            gb={15.5}
            maxGb={maxGb}
            color={C.blue}
            animated
            frame={frame}
            startFrame={20}
          />
          <MemBar
            label="kv cache"
            gb={Math.max(0, memoryGb - 15.5 - 2)}
            maxGb={maxGb}
            color={frame >= T.compressFire ? C.green : C.amber}
            animated={false}
            frame={frame}
            startFrame={20}
          />
          <MemBar
            label="activations"
            gb={2}
            maxGb={maxGb}
            color={C.cyan}
            animated
            frame={frame}
            startFrame={28}
          />

          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: 22,
            }}
          >
            <span style={{ color: C.dim }}>total</span>
            <span style={{ color: C.white, fontWeight: 700 }}>
              {memoryGb.toFixed(1)}{" "}
              <span style={{ color: C.dim, fontWeight: 400, fontSize: 18 }}>/ 48 GB</span>
              {"  "}
              <span
                style={{
                  fontSize: 18,
                  color: memoryGb > 40 ? C.red : memoryGb > 30 ? C.amber : C.green,
                }}
              >
                {Math.round((memoryGb / 48) * 100)}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Memory chart SVG ─────────────────────────────────────────────
function MemoryChart({
  frame,
  peakVisible,
  peakPulse,
  compressOp,
  width,
}: {
  frame: number;
  peakVisible: boolean;
  peakPulse: number;
  compressOp: number;
  width: number;
}) {
  const W = width;
  const H = 390;
  const pad = { top: 24, right: 28, bottom: 58, left: 80 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxGb = 48;

  const yScale = (gb: number) => chartH - (gb / maxGb) * chartH;
  const xScale = (f: number) => (f / 270) * chartW;

  const points: [number, number][] = [];
  for (let f = 0; f <= Math.min(frame, 270); f += 3) {
    let gb: number;
    if (f < T.prefillStart) gb = 21;
    else if (f < T.prefillPeak)
      gb = 21 + ((f - T.prefillStart) / (T.prefillPeak - T.prefillStart)) * 13;
    else if (f < T.compressFire) gb = 34;
    else if (f < T.memorySettle) {
      const tc = Math.max(0, Math.min(1, (f - T.memoryDrop) / (T.memorySettle - T.memoryDrop)));
      gb = 34 - tc * (34 - (34 * 0.3 + 21 * 0.7));
    } else gb = 34 * 0.3 + 21 * 0.7;
    points.push([xScale(f), yScale(gb)]);
  }

  const pathD =
    points.length > 1
      ? `M ${points[0][0]} ${points[0][1]} ` +
        points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ")
      : "";

  const fillD =
    points.length > 1
      ? pathD + ` L ${points[points.length - 1][0]} ${chartH} L ${points[0][0]} ${chartH} Z`
      : "";

  const currentGb =
    frame < T.prefillStart ? 21
    : frame < T.prefillPeak ? 21 + ((frame - T.prefillStart) / (T.prefillPeak - T.prefillStart)) * 13
    : frame < T.compressFire ? 34
    : frame < T.memorySettle ? 34 - Math.max(0, Math.min(1, (frame - T.memoryDrop) / (T.memorySettle - T.memoryDrop))) * (34 - (34 * 0.3 + 21 * 0.7))
    : 34 * 0.3 + 21 * 0.7;

  const currentX = xScale(Math.min(frame, 270));
  const currentY = yScale(Math.max(0, currentGb));

  const yLabels = [0, 12, 24, 36, 48];
  const xPhases = [
    { f: T.prefillStart, label: "prefill", color: C.amber },
    { f: T.prefillPeak, label: "peak", color: C.red },
    { f: T.memoryDrop, label: "compress", color: C.green },
  ];

  return (
    <svg
      width={W}
      height={H}
      style={{
        display: "block",
        background: "#0d1520",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
      }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.amber} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C.amber} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lineGradCompress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.green} stopOpacity="0.28" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="chartClip">
          <rect x={pad.left} y={pad.top} width={chartW} height={chartH} />
        </clipPath>
      </defs>

      <g transform={`translate(${pad.left}, ${pad.top})`}>
        {/* y-axis grid + labels */}
        {yLabels.map((gb) => (
          <g key={gb}>
            <line
              x1={0} y1={yScale(gb)} x2={chartW} y2={yScale(gb)}
              stroke={C.border} strokeWidth={0.8} strokeDasharray="3,5"
            />
            <text
              x={-12} y={yScale(gb) + 6}
              textAnchor="end" fill={C.dim}
              fontSize={20} fontFamily="'Courier New', monospace"
            >
              {gb}
            </text>
          </g>
        ))}

        {/* OOM danger line */}
        <line
          x1={0} y1={yScale(48)} x2={chartW} y2={yScale(48)}
          stroke={C.red} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="6,4"
        />
        <text
          x={chartW - 8} y={yScale(48) - 8}
          textAnchor="end" fill={C.red}
          fontSize={18} fontFamily="'Courier New', monospace" fillOpacity={0.7}
        >
          OOM
        </text>

        {/* compression region shading */}
        {frame >= T.memoryDrop && (
          <rect
            x={xScale(T.memoryDrop)} y={0}
            width={xScale(Math.min(frame, 270)) - xScale(T.memoryDrop)}
            height={chartH}
            fill={C.green} fillOpacity={0.05}
            clipPath="url(#chartClip)"
          />
        )}

        {/* area fill */}
        {fillD && (
          <path
            d={fillD}
            fill={frame >= T.compressFire ? "url(#lineGradCompress)" : "url(#lineGrad)"}
            clipPath="url(#chartClip)"
          />
        )}

        {/* main line */}
        {pathD && (
          <path
            d={pathD} fill="none"
            stroke={frame >= T.compressFire ? C.green : C.amber}
            strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round"
            clipPath="url(#chartClip)"
          />
        )}

        {/* phase vertical markers */}
        {xPhases.map(({ f, label, color }) =>
          frame > f ? (
            <line key={label}
              x1={xScale(f)} y1={0} x2={xScale(f)} y2={chartH}
              stroke={color} strokeWidth={1} strokeOpacity={0.4}
              strokeDasharray="4,4" clipPath="url(#chartClip)"
            />
          ) : null
        )}

        {/* peak dashed horizontal */}
        {peakVisible && (
          <>
            <line
              x1={0} y1={yScale(34)} x2={chartW} y2={yScale(34)}
              stroke={C.red} strokeWidth={2} strokeDasharray="6,3"
              strokeOpacity={peakPulse}
            />
            <text
              x={chartW - 8} y={yScale(34) - 9}
              textAnchor="end" fill={C.red}
              fontSize={18} fontFamily="'Courier New', monospace"
              fillOpacity={peakPulse} fontWeight="bold"
            >
              PEAK 34 GB ▲
            </text>
          </>
        )}

        {/* compression label */}
        {frame >= T.compressFire && (
          <g opacity={compressOp}>
            <text
              x={xScale(T.compressFire) + 10} y={chartH + 28}
              fill={C.green} fontSize={18} fontFamily="'Courier New', monospace"
            >
              ✂ compression fires
            </text>
          </g>
        )}

        {/* current dot */}
        {points.length > 0 && (
          <circle
            cx={currentX} cy={currentY} r={7}
            fill={frame >= T.compressFire ? C.green : C.amber}
            stroke={C.bg} strokeWidth={3}
          />
        )}

        {/* x-axis */}
        <line
          x1={0} y1={chartH} x2={chartW} y2={chartH}
          stroke={C.border} strokeWidth={1}
        />
        <text
          x={chartW / 2} y={chartH + 42}
          textAnchor="middle" fill={C.dim}
          fontSize={18} fontFamily="'Courier New', monospace"
        >
          time →
        </text>

        {/* y-axis label */}
        <text
          x={-chartH / 2} y={-56}
          textAnchor="middle" fill={C.dim}
          fontSize={18} fontFamily="'Courier New', monospace"
          transform="rotate(-90)"
        >
          vram (gb)
        </text>
      </g>
    </svg>
  );
}
