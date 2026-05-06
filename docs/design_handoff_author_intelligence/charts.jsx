/* Lightweight inline charts — pure SVG, no library. */

const Sparkline = ({ data, width = 120, height = 36, color = "var(--mv-brand)", fill = true }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill ? <path d={area} fill={color} opacity="0.12" /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3" fill={color} />
    </svg>
  );
};

/* Vertical bar chart for trends */
const BarChart = ({ data, width = 320, height = 120, color = "var(--mv-brand)", labels, axis = true }) => {
  const max = Math.max(...data) * 1.1 || 1;
  const padL = axis ? 28 : 0, padB = labels ? 18 : 6;
  const w = width - padL - 4, h = height - padB - 4;
  const bw = w / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {axis ? (
        <>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - 4} y1={4 + h * (1 - t)} y2={4 + h * (1 - t)} stroke="var(--mv-border-muted)" strokeWidth="1" strokeDasharray={t === 0 ? "" : "2 3"} />
              <text x={padL - 6} y={4 + h * (1 - t) + 3} textAnchor="end" fontSize="9" fill="var(--mv-text-subtle)" fontFamily="var(--mv-font-body)">{Math.round(max * t)}</text>
            </g>
          ))}
        </>
      ) : null}
      {data.map((v, i) => {
        const bh = (v / max) * h;
        const x = padL + i * bw + bw * 0.2;
        const y = 4 + h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw * 0.6} height={bh} rx="2" fill={color} opacity={i === data.length - 1 ? 1 : 0.85} />
            {labels ? (
              <text x={padL + i * bw + bw / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--mv-text-subtle)">{labels[i]}</text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

/* Multi-line area chart */
const AreaChart = ({ series, width = 480, height = 180, labels }) => {
  const all = series.flatMap((s) => s.data);
  const min = Math.min(...all, 0);
  const max = Math.max(...all) * 1.05 || 1;
  const padL = 32, padB = labels ? 22 : 8, padT = 8, padR = 8;
  const w = width - padL - padR, h = height - padB - padT;
  const n = series[0].data.length;
  const stepX = w / (n - 1);
  const yFor = (v) => padT + h - ((v - min) / (max - min)) * h;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={width - padR} y1={padT + h * t} y2={padT + h * t} stroke="var(--mv-border-muted)" strokeWidth="1" />
          <text x={padL - 6} y={padT + h * t + 3} textAnchor="end" fontSize="9" fill="var(--mv-text-subtle)">{Math.round(max - (max - min) * t)}</text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [padL + i * stepX, yFor(v)]);
        const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
        const area = `${path} L${padL + (n - 1) * stepX},${padT + h} L${padL},${padT + h} Z`;
        return (
          <g key={si}>
            <path d={area} fill={s.color} opacity="0.1" />
            <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill={s.color} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        );
      })}
      {labels ? labels.map((l, i) => (
        <text key={i} x={padL + i * stepX} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--mv-text-subtle)">{l}</text>
      )) : null}
    </svg>
  );
};

/* Horizontal bar (used for distributions) */
const HBar = ({ value, max = 100, color = "var(--mv-brand)", height = 6, bg = "var(--mv-grey-150)" }) => (
  <div style={{ height, borderRadius: 999, background: bg, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: 999 }} />
  </div>
);

/* Rating distribution histogram */
const RatingDist = ({ buckets, color = "var(--mv-brand)" }) => {
  const max = Math.max(...buckets.map((b) => b.count)) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {buckets.map((b) => (
        <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <div style={{ width: 22, color: "var(--mv-text-muted)", fontVariantNumeric: "tabular-nums" }}>{b.label}</div>
          <div style={{ flex: 1 }}>
            <HBar value={b.count} max={max} color={color} />
          </div>
          <div style={{ width: 28, textAlign: "right", color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{b.count}</div>
        </div>
      ))}
    </div>
  );
};

/* Donut */
const Donut = ({ value, max = 100, size = 88, stroke = 10, color = "var(--mv-brand)", track = "var(--mv-grey-150)", label, sub }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--mv-text)", letterSpacing: "-0.01em" }}>{label}</div>
        {sub ? <div style={{ fontSize: 10, color: "var(--mv-text-subtle)", marginTop: 2 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/* Heatmap-ish dot grid (for cross-mastery view) */
const DotGrid = ({ rows, cols, values, color = "var(--mv-brand)" }) => {
  // values: 2d array rows x cols, 0..1
  const cell = 14, gap = 3;
  return (
    <svg width={cols * (cell + gap)} height={rows * (cell + gap)}>
      {values.flatMap((row, ri) => row.map((v, ci) => (
        <rect key={`${ri}-${ci}`} x={ci * (cell + gap)} y={ri * (cell + gap)}
          width={cell} height={cell} rx="3"
          fill={v == null ? "var(--mv-grey-150)" : color}
          opacity={v == null ? 1 : 0.15 + v * 0.85} />
      )))}
    </svg>
  );
};

Object.assign(window, { Sparkline, BarChart, AreaChart, HBar, RatingDist, Donut, DotGrid });
