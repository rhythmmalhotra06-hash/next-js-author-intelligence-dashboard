/* Shared UI primitives — KPI tiles, badges, tables, "not yet measured" treatment. */

/* ================================
   "Not yet measured" — explicit empty state with hover tooltip.
   Replaces the dead "—" character in the original. */
const NotMeasured = ({ tip = "Not yet measured", short = false }) => (
  <span title={tip} style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 999,
    background: "var(--mv-grey-150)", color: "var(--mv-text-subtle)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
    whiteSpace: "nowrap", cursor: "help",
    border: "1px dashed var(--mv-border-strong)",
  }}>
    <IcInfo size={11} color="var(--mv-text-subtle)" />
    {short ? "n/m" : "Not yet measured"}
  </span>
);

/* KPI tile — premium analytics style. Shows label, value, delta + sparkline. */
const KPITile = ({ label, value, unit, delta, deltaLabel = "vs last 90d", spark, color = "var(--mv-brand)", measured = true, hint, tag, dense = false }) => {
  const positive = (delta || 0) >= 0;
  return (
    <div style={{
      padding: dense ? "14px 16px" : "18px 20px",
      borderRadius: 14,
      background: "#fff",
      border: "1px solid var(--mv-border-muted)",
      display: "flex", flexDirection: "column", gap: dense ? 8 : 12,
      minHeight: dense ? 100 : 120,
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--mv-text-subtle)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
        {tag ? <span style={{
          fontSize: 9.5, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
          background: "var(--mv-green-light)", color: "var(--mv-green-content)",
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{tag}</span> : null}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: "var(--mv-font-display)" }}>
        {measured ? (
          <>
            <span style={{ fontSize: dense ? 24 : 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--mv-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {value}
            </span>
            {unit ? <span style={{ fontSize: 13, color: "var(--mv-text-subtle)", fontWeight: 500 }}>{unit}</span> : null}
          </>
        ) : (
          <NotMeasured />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
        {measured && delta != null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: positive ? "var(--mv-green-content)" : "var(--mv-red)" }}>
            {positive ? <IcArrowUp size={11} /> : <IcArrowDown size={11} />}
            <span>{Math.abs(delta)}%</span>
            <span style={{ color: "var(--mv-text-subtle)", fontWeight: 400, marginLeft: 2 }}>{deltaLabel}</span>
          </div>
        ) : hint ? (
          <div style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>{hint}</div>
        ) : <div />}
        {measured && spark ? <Sparkline data={spark} color={color} width={80} height={24} /> : null}
      </div>
    </div>
  );
};

/* Badge variants */
const Badge = ({ children, variant = "purple", icon: Icon, size = "md" }) => {
  const map = {
    purple: { bg: "var(--mv-brand-light)", fg: "var(--mv-brand-content)" },
    green: { bg: "var(--mv-green-light)", fg: "var(--mv-green-content)" },
    orange: { bg: "var(--mv-orange-light)", fg: "var(--mv-orange-content)" },
    blue: { bg: "var(--mv-blue-light)", fg: "var(--mv-blue-content)" },
    pink: { bg: "var(--mv-pink-light)", fg: "#9c1450" },
    grey: { bg: "var(--mv-grey-150)", fg: "var(--mv-grey-550)" },
    red: { bg: "#fef0f0", fg: "#a82828" },
    outline: { bg: "transparent", fg: "var(--mv-text-muted)", border: "1px solid var(--mv-border-strong)" },
  };
  const s = map[variant] || map.grey;
  const pad = size === "sm" ? "2px 7px" : "3px 9px";
  const fs = size === "sm" ? 10.5 : 11.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: pad, borderRadius: 999,
      background: s.bg, color: s.fg, border: s.border || "none",
      fontSize: fs, fontWeight: 600, letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      {Icon ? <Icon size={fs} color={s.fg} /> : null}
      {children}
    </span>
  );
};

/* Avatar */
const Avatar = ({ name, size = 32, gradient = "linear-gradient(135deg,#7a12d4,#df1a6f)", img }) => {
  const initials = (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: img ? `url(${img}) center/cover` : gradient,
      color: "#fff", display: "grid", placeItems: "center",
      fontWeight: 600, fontSize: size * 0.38,
      flex: "none",
      letterSpacing: "0.02em",
    }}>
      {img ? null : initials}
    </div>
  );
};

/* Star rating */
const Stars = ({ value, max = 10, size = 12 }) => {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ display: "flex", gap: 2, color: "var(--mv-grey-250)" }}>
          {[0,1,2,3,4].map((i) => <IcStar key={i} size={size} color="var(--mv-grey-250)" />)}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 2, color: "#f59e0b", overflow: "hidden", width: `${pct}%` }}>
          {[0,1,2,3,4].map((i) => <IcStar key={i} size={size} color="#f59e0b" />)}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "var(--mv-text-muted)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(2)}</span>
    </div>
  );
};

/* Section header */
const SectionHeader = ({ overline, title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
    <div>
      {overline ? <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--mv-brand)", marginBottom: 6 }}>{overline}</div> : null}
      <div style={{ fontSize: 18, fontWeight: 600, color: "var(--mv-text)", letterSpacing: "-0.01em" }}>{title}</div>
      {sub ? <div style={{ fontSize: 13, color: "var(--mv-text-muted)", marginTop: 4 }}>{sub}</div> : null}
    </div>
    {action || null}
  </div>
);

/* Pill button group (segmented control) */
const SegGroup = ({ options, value, onChange }) => (
  <div style={{ display: "inline-flex", padding: 3, background: "var(--mv-grey-100)", borderRadius: 10, border: "1px solid var(--mv-border-muted)" }}>
    {options.map((o) => (
      <button key={o.value} onClick={() => onChange?.(o.value)} style={{
        padding: "6px 12px", borderRadius: 7, border: "none",
        background: value === o.value ? "#fff" : "transparent",
        color: value === o.value ? "var(--mv-text)" : "var(--mv-text-muted)",
        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        boxShadow: value === o.value ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
        transition: "all 120ms",
      }}>{o.label}</button>
    ))}
  </div>
);

/* Filter chip */
const Chip = ({ icon: Icon, children, removable }) => (
  <button style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px", height: 32,
    borderRadius: 999,
    border: "1px solid var(--mv-border)",
    background: "#fff",
    color: "var(--mv-text-muted)",
    fontSize: 12.5, fontWeight: 500, cursor: "pointer",
  }}>
    {Icon ? <Icon size={13} /> : null}
    {children}
    {removable ? <IcChevDown size={11} /> : null}
  </button>
);

/* Table primitive (lightweight) */
const Table = ({ columns, rows, dense = false, onRowClick }) => (
  <div style={{
    background: "#fff", borderRadius: 14, border: "1px solid var(--mv-border-muted)", overflow: "hidden",
  }}>
    <div style={{
      display: "grid", gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
      padding: "10px 16px", borderBottom: "1px solid var(--mv-border-muted)",
      background: "var(--mv-grey-100)",
      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
      color: "var(--mv-text-subtle)",
    }}>
      {columns.map((c, i) => <div key={i} style={{ textAlign: c.align || "left" }}>{c.label}</div>)}
    </div>
    {rows.map((r, ri) => (
      <div key={ri} onClick={() => onRowClick?.(r)} style={{
        display: "grid", gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
        padding: dense ? "10px 16px" : "14px 16px", borderBottom: ri < rows.length - 1 ? "1px solid var(--mv-border-muted)" : "none",
        alignItems: "center", gap: 12,
        cursor: onRowClick ? "pointer" : "default",
        transition: "background 120ms",
      }} onMouseEnter={(e) => e.currentTarget.style.background = onRowClick ? "var(--mv-grey-100)" : ""} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
        {columns.map((c, i) => (
          <div key={i} style={{ textAlign: c.align || "left", fontSize: 13, color: "var(--mv-text)", minWidth: 0 }}>
            {typeof c.render === "function" ? c.render(r) : r[c.key]}
          </div>
        ))}
      </div>
    ))}
  </div>
);

Object.assign(window, { NotMeasured, KPITile, Badge, Avatar, Stars, SectionHeader, SegGroup, Chip, Table });
