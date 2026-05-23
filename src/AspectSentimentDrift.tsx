import {
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { C, MONO, fs, Shell } from "./theme.tsx";

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

// ── Shared data ────────────────────────────────────────────────────
const ASPECTS = [
  { label: "battery",     color: C.cyan   },
  { label: "camera",      color: C.green  },
  { label: "display",     color: C.amber  },
  { label: "performance", color: C.purple },
  { label: "value",       color: C.blue   },
];

const SENTIMENT_DATA: Record<string, number[]> = {
  battery:     [0.55, 0.52, 0.58, 0.60, 0.57, 0.53, 0.50, 0.48, 0.45, 0.42, 0.44, 0.46],
  camera:      [0.70, 0.72, 0.68, 0.65, 0.60, 0.55, 0.50, 0.42, -0.10, -0.28, -0.32, -0.25],
  display:     [0.40, 0.42, 0.44, 0.43, 0.45, 0.47, 0.46, 0.48, 0.49, 0.50, 0.48, 0.50],
  performance: [0.30, 0.28, 0.32, 0.35, 0.38, 0.40, 0.42, 0.41, 0.38, 0.36, 0.35, 0.37],
  value:       [0.20, 0.22, 0.25, 0.24, 0.23, 0.20, 0.18, 0.17, 0.15, 0.13, 0.14, 0.16],
};

const TOKENS = [
  { word: "Battery", score: 0.62, color: C.amber  },
  { word: "drains",  score: 0.89, color: C.red    },
  { word: "so",      score: 0.11, color: C.dimmer },
  { word: "fast",    score: 0.71, color: C.red    },
  { word: "after",   score: 0.15, color: C.dimmer },
  { word: "update",  score: 0.95, color: C.red    },
];

// ── Scene 1: Scale  (150f = 5s) ────────────────────────────────────
export const ASD_Scale: React.FC = () => {
  const frame = useCurrentFrame();

  const headlineOp = lerp(frame, 0, 1, 8, 30);
  const headlineY  = lerp(frame, 14, 0, 8, 30);
  const counterOp  = lerp(frame, 0, 1, 12, 32);
  const subtitleOp = lerp(frame, 0, 1, 28, 48);

  return (
    <Shell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingTop: 64,
      }}>
        <div style={{
          opacity: headlineOp,
          transform: `translateY(${headlineY}px)`,
          fontSize: fs(15), color: C.dim,
          letterSpacing: "0.22em", textTransform: "uppercase",
          marginBottom: 30,
        }}>
          aspect-level sentiment extraction
        </div>

        <div style={{
          opacity: counterOp,
          fontSize: fs(96), fontWeight: 700, color: C.white,
          letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10,
        }}>
          {Math.floor(lerp(frame, 0, 312000, 5, 110)).toLocaleString()}
        </div>

        <div style={{
          opacity: subtitleOp,
          fontSize: fs(20), color: C.dimmer,
          letterSpacing: "0.16em", textTransform: "uppercase",
          marginBottom: 56,
        }}>
          Amazon smartphone reviews
        </div>

        {/* Aspect pills */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {ASPECTS.map((a, i) => {
            const sf = 65 + i * 16;
            return (
              <div key={a.label} style={{
                opacity: lerp(frame, 0, 1, sf, sf + 18),
                transform: `translateY(${lerp(frame, 10, 0, sf, sf + 18)}px)`,
                padding: "10px 26px", borderRadius: 4,
                border: `1px solid ${a.color}`,
                background: `${a.color}18`,
                fontSize: fs(20), color: a.color,
                letterSpacing: "0.08em",
              }}>
                {a.label}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 2: Sentiment Time Series  (210f = 7s) ────────────────────
export const ASD_TimeSeries: React.FC = () => {
  const frame = useCurrentFrame();
  const CHART_W = 484;
  const CHART_H = 58;
  const MONTHS  = 12;
  const DRIFT_F = 155;

  function buildPath(aspect: string, w: number, h: number): string {
    const data = SENTIMENT_DATA[aspect];
    const pts = data.map((v, i) => [
      (i / (MONTHS - 1)) * w,
      h / 2 - (v * h) / 2.2,
    ] as [number, number]);
    return `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ");
  }

  const sectionOp = lerp(frame, 0, 1, 5, 25);
  const statCards = [
    { label: "products evaluated", value: "331", color: C.amber, sf: 20 },
    { label: "aspects tracked",    value: "5",   color: C.cyan,  sf: 40 },
    { label: "month window",       value: "12",  color: C.blue,  sf: 60 },
  ];

  return (
    <Shell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "row",
        alignItems: "center",
        padding: "0 48px", gap: 48,
      }}>
        {/* Left: sparklines */}
        <div style={{ flexShrink: 0, width: 648 }}>
          <div style={{ opacity: sectionOp, fontSize: fs(14), color: C.dim, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>
            sentiment time series — by aspect
          </div>

          {ASPECTS.map((a, i) => {
            const sf = 10 + i * 20;
            const rowOp  = lerp(frame, 0, 1, sf, sf + 20);
            const clipW  = lerp(frame, 0, CHART_W, sf + 6, sf + 100);
            const pathD  = buildPath(a.label, CHART_W, CHART_H);
            const driftX = (8 / (MONTHS - 1)) * CHART_W;
            const showDrift = a.label === "camera" && frame >= DRIFT_F;
            const driftOp   = lerp(frame, 0, 1, DRIFT_F, DRIFT_F + 20);

            return (
              <div key={a.label} style={{
                opacity: rowOp,
                display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
              }}>
                <div style={{ width: 140, fontSize: fs(17), color: a.color, textAlign: "right", letterSpacing: "0.06em", flexShrink: 0 }}>
                  {a.label}
                </div>
                <svg width={CHART_W} height={CHART_H} style={{ display: "block", overflow: "visible" }}>
                  <defs>
                    <clipPath id={`clip-${a.label}`}>
                      <rect x={0} y={-12} width={clipW} height={CHART_H + 24} />
                    </clipPath>
                  </defs>
                  <line x1={0} y1={CHART_H / 2} x2={CHART_W} y2={CHART_H / 2} stroke={C.border} strokeWidth={0.8} />
                  <path d={pathD} fill="none" stroke={a.color} strokeWidth={2.5}
                    strokeLinejoin="round" strokeLinecap="round"
                    clipPath={`url(#clip-${a.label})`} />
                  {showDrift && (
                    <g opacity={driftOp}>
                      <line x1={driftX} y1={-8} x2={driftX} y2={CHART_H + 8}
                        stroke={C.red} strokeWidth={1.5} strokeDasharray="4,3" />
                      <text x={driftX + 6} y={12} fill={C.red} fontSize={fs(13)} fontFamily={MONO}>⚑ drift</text>
                    </g>
                  )}
                </svg>
              </div>
            );
          })}

          <div style={{ opacity: sectionOp, fontSize: fs(14), color: C.dimmer, marginTop: 8, letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", width: 140 + 16 + CHART_W }}>
            <span>← Jan</span><span>Dec →</span>
          </div>
        </div>

        {/* Right: stat cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              opacity: lerp(frame, 0, 1, s.sf, s.sf + 18),
              transform: `translateX(${lerp(frame, 28, 0, s.sf, s.sf + 22)}px)`,
              background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "26px 30px",
            }}>
              <div style={{ fontSize: fs(46), color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: fs(16), color: C.dim, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 3: Model Comparison  (180f = 6s) ─────────────────────────
export const ASD_Models: React.FC = () => {
  const frame = useCurrentFrame();

  const MODELS = [
    { name: "LSTM-AE", p: 0.87, r: 0.84, f1: 0.855, best: true  },
    { name: "PELT",    p: 0.71, r: 0.68, f1: 0.695, best: false },
    { name: "CUSUM",   p: 0.65, r: 0.72, f1: 0.683, best: false },
  ];
  const METRICS = [
    { label: "precision", key: "p"  as const },
    { label: "recall",    key: "r"  as const },
    { label: "F1",        key: "f1" as const },
  ];
  const BAR_MAX_W = 200;

  const titleOp    = lerp(frame, 0, 1, 5, 25);
  const subtitleOp = lerp(frame, 0, 1, 148, 165);

  return (
    <Shell>
      <div style={{ position: "absolute", inset: 0, paddingTop: 80 }}>
        <div style={{
          opacity: titleOp,
          fontSize: fs(14), color: C.dim, letterSpacing: "0.18em",
          textTransform: "uppercase", textAlign: "center", marginBottom: 38,
        }}>
          drift detection model comparison
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 40, paddingLeft: 32, paddingRight: 32 }}>
          {MODELS.map((model, mi) => {
            const colSf     = 15 + mi * 16;
            const colOp     = lerp(frame, 0, 1, colSf, colSf + 20);
            const badgeOp   = model.best ? lerp(frame, 0, 1, 138, 155) : 0;

            return (
              <div key={model.name} style={{
                opacity: colOp,
                flex: 1, maxWidth: 300,
                background: "#ffffff",
                border: `1px solid ${model.best ? C.cyan : C.border}`,
                borderRadius: 10, padding: "26px 30px",
                boxShadow: model.best ? `0 0 20px ${C.cyan}22` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                  <div style={{ fontSize: fs(28), color: model.best ? C.cyan : C.white, fontWeight: 700 }}>
                    {model.name}
                  </div>
                  <div style={{ opacity: badgeOp, fontSize: fs(16), color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: "3px 10px" }}>
                    ✓ best
                  </div>
                </div>

                {METRICS.map((metric, ki) => {
                  const barSf    = colSf + 20 + ki * 14;
                  const barW     = lerp(frame, 0, model[metric.key] * BAR_MAX_W, barSf, barSf + 40);
                  const barColor = model.best ? C.cyan : C.dimmer;
                  return (
                    <div key={metric.label} style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: fs(17), marginBottom: 8 }}>
                        <span style={{ color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{metric.label}</span>
                        <span style={{ color: model.best ? C.cyan : C.white }}>{model[metric.key].toFixed(3)}</span>
                      </div>
                      <div style={{ height: 10, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: barW, borderRadius: 3,
                          background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                          boxShadow: model.best ? `0 0 8px ${barColor}55` : "none",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={{
          opacity: subtitleOp,
          textAlign: "center", marginTop: 30,
          fontSize: fs(17), color: C.dimmer, letterSpacing: "0.1em",
        }}>
          evaluated across 331 dense products
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 4: Token Explainability  (240f = 8s) ─────────────────────
export const ASD_Explainability: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOp   = lerp(frame, 0, 1, 8, 35);
  const reviewOp  = lerp(frame, 0, 1, 25, 52);
  const footerOp  = lerp(frame, 0, 1, 200, 222);

  return (
    <Shell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          opacity: titleOp,
          fontSize: fs(14), color: C.dim, letterSpacing: "0.2em",
          textTransform: "uppercase", marginBottom: 44,
        }}>
          Integrated Gradients — token attribution
        </div>

        <div style={{ opacity: reviewOp, fontSize: fs(15), color: C.dimmer, letterSpacing: "0.12em", marginBottom: 36 }}>
          review: &quot;Battery drains so fast after update&quot;
        </div>

        {/* Token spans — one every 22f starting at frame 55 */}
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
          {TOKENS.map((tok, i) => {
            const sf    = 55 + i * 22;
            const tokOp = lerp(frame, 0, 1, sf, sf + 26);
            const tokY  = lerp(frame, 14, 0, sf, sf + 26);
            const barW  = lerp(frame, 0, tok.score * 64, sf + 10, sf + 48);
            const isDim = tok.score < 0.3;

            return (
              <div key={tok.word} style={{
                opacity: tokOp,
                transform: `translateY(${tokY}px)`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  padding: "13px 20px", borderRadius: 6,
                  border: `1px solid ${isDim ? C.border : tok.color}`,
                  background: isDim ? "transparent" : `${tok.color}1a`,
                  color: isDim ? C.dimmer : tok.color,
                  fontSize: fs(24), letterSpacing: "0.04em",
                  boxShadow: isDim ? "none" : `0 0 16px ${tok.color}44`,
                  minWidth: 68, textAlign: "center",
                }}>
                  {tok.word}
                </div>
                <div style={{ width: 68, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: barW, borderRadius: 3, background: isDim ? C.dimmer : tok.color }} />
                </div>
                <div style={{ fontSize: fs(14), color: isDim ? C.dimmer : tok.color, letterSpacing: "0.04em" }}>
                  {tok.score.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          opacity: footerOp,
          marginTop: 44,
          padding: "15px 30px",
          border: `1px solid ${C.red}44`,
          borderRadius: 6,
          background: `${C.red}0d`,
          fontSize: fs(18), color: C.red, letterSpacing: "0.06em",
        }}>
          &apos;update&apos; attribution: 0.95 — strongest signal of sentiment shift
        </div>
      </div>
    </Shell>
  );
};

// ── Scene 5: Early Warning  (120f = 4s) ───────────────────────────
export const ASD_Alert: React.FC = () => {
  const frame = useCurrentFrame();

  const alertY  = lerp(frame, 34, 0, 5, 32);
  const alertOp = lerp(frame, 0, 1, 5, 32);
  const tagOp   = lerp(frame, 0, 1, 55, 75);
  const brandOp = lerp(frame, 0, 1, 82, 98);

  return (
    <Shell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingTop: 64,
      }}>
        <div style={{
          opacity: alertOp,
          transform: `translateY(${alertY}px)`,
          border: `1.5px solid ${C.red}`,
          background: `${C.red}10`,
          boxShadow: `0 0 28px ${C.red}33`,
          borderRadius: 14, padding: "36px 60px",
          textAlign: "center", maxWidth: 700,
        }}>
          <div style={{ fontSize: fs(56), marginBottom: 18 }}>⚠</div>
          <div style={{ fontSize: fs(32), color: C.red, fontWeight: 700, marginBottom: 14, letterSpacing: "0.02em" }}>
            Camera sentiment declining
          </div>
          <div style={{ fontSize: fs(22), color: C.white, letterSpacing: "0.04em" }}>
            14 days before star-rating drop
          </div>
          <div style={{ marginTop: 20, fontSize: fs(18), color: C.dim }}>
            Product: Galaxy S23 · Aspect: camera · Confidence: 0.91
          </div>
        </div>

        <div style={{
          opacity: tagOp,
          marginTop: 38, fontSize: fs(18), color: C.dim,
          letterSpacing: "0.12em", textAlign: "center",
        }}>
          early warning for consumer electronics brand teams
        </div>

        <div style={{
          opacity: brandOp,
          position: "absolute", bottom: 22, right: 34,
          fontSize: fs(15), color: C.dimmer, letterSpacing: "0.14em",
        }}>
          aspect-sentiment-drift
        </div>
      </div>
    </Shell>
  );
};
