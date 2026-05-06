/* Simple redesign — sticks to the elements visible in the original screenshots.
   Overview: header strip, KPI tiles for the same metrics. (kept light)
   Author profile: identity, KPI strip, Qualitative Intelligence, Per-Mastery, Finance + invoices. */

const SimpleHeader = ({ title, subtitle, accent }) => (
  <header style={{
    height: 60, padding: "0 32px",
    display: "flex", alignItems: "center", gap: 16,
    borderBottom: "1px solid var(--mv-border-muted)",
    background: "#fff",
  }}>
    <AILogoLockup size={16} color="var(--mv-text)" accent={accent} accent2="var(--mv-pink)" />
    <div style={{ width: 1, height: 22, background: "var(--mv-border)" }} />
    <div style={{ fontSize: 13, color: "var(--mv-text-muted)", fontWeight: 500 }}>Author Intelligence</div>
    <div style={{ flex: 1 }} />
    <div style={{ fontSize: 12, color: "var(--mv-text-subtle)" }}>Last updated · May 5, 2026 · 10:44 AM</div>
  </header>
);

const SimpleNav = ({ active = "authors", accent }) => (
  <nav style={{
    padding: "0 32px",
    display: "flex", gap: 4, alignItems: "center", height: 48,
    borderBottom: "1px solid var(--mv-border-muted)",
    background: "#fff",
    position: "sticky", top: 0, zIndex: 10,
  }}>
    {[
      { id: "overview", label: "Overview" },
      { id: "authors", label: "Authors" },
      { id: "performance", label: "Performance" },
      { id: "feedback", label: "Feedback" },
    ].map((t) => (
      <a key={t.id} href="#" onClick={(e)=>e.preventDefault()} style={{
        padding: "0 14px", height: 48,
        display: "inline-flex", alignItems: "center",
        textDecoration: "none",
        color: active === t.id ? "var(--mv-text)" : "var(--mv-text-muted)",
        borderBottom: active === t.id ? `2px solid ${accent}` : "2px solid transparent",
        fontSize: 13.5, fontWeight: 500,
      }}>{t.label}</a>
    ))}
    <div style={{ flex: 1 }} />
    <div style={{
      display: "flex", alignItems: "center", gap: 8, height: 32,
      padding: "0 12px", borderRadius: 8,
      background: "var(--mv-grey-100)",
      color: "var(--mv-text-subtle)", fontSize: 12.5, width: 240,
    }}>
      <IcSearch size={14} />
      <span style={{ flex: 1 }}>Search authors…</span>
      <span style={{ fontSize: 10.5, padding: "1px 5px", border: "1px solid var(--mv-border)", borderRadius: 4 }}>⌘K</span>
    </div>
  </nav>
);

/* Compact KPI tile aligned to original screenshot's "label / value" pattern */
const SimpleKPI = ({ label, value, unit, tag, measured = true, hint }) => (
  <div style={{ padding: "16px 18px", borderRight: "1px solid var(--mv-border-muted)", display: "flex", flexDirection: "column", gap: 6, minHeight: 88 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--mv-text-muted)", fontWeight: 500 }}>{label}</span>
      {tag ? <Badge variant="green" size="sm">{tag}</Badge> : null}
    </div>
    {measured ? (
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontFamily: "var(--mv-font-display)" }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "var(--mv-text)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</span>
        {unit ? <span style={{ fontSize: 13, color: "var(--mv-text-subtle)", fontWeight: 500 }}>{unit}</span> : null}
      </div>
    ) : <NotMeasured />}
    {hint ? <div style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>{hint}</div> : null}
  </div>
);

/* ===================== Simple Author Profile ===================== */
const AuthorProfileSimple = ({ accent = "var(--mv-brand)" }) => {
  const a = JIMMY;
  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "var(--mv-font-body)" }}>
      <SimpleHeader accent={accent} />
      <SimpleNav active="authors" accent={accent} />

      <div style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 1240 }}>

        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Avatar name="Jimmy Naraine" size={64} gradient="linear-gradient(135deg,#329dff,#7a12d4,#df1a6f)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mv-text-subtle)", marginBottom: 4 }}>
              Dashboard / Author profile
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--mv-text)", lineHeight: 1.15 }}>
              {a.name}
            </h1>
            <div style={{ fontSize: 14, color: "var(--mv-text-muted)", marginTop: 4 }}>Cross-program performance and financial overview</div>
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", height: 36, borderRadius: 10,
            border: "1px solid var(--mv-border)", background: "#fff",
            fontSize: 13, fontWeight: 500, color: "var(--mv-text)", cursor: "pointer",
          }}><IcDownload size={14} />Export</button>
        </div>

        {/* KPI strip — same metrics as screenshot */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: "1px solid var(--mv-border-muted)", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
          <SimpleKPI label="Programs Taught" value="1" tag="AI Analyzed" />
          <SimpleKPI label="Overall Rewatch Rate" measured={false} />
          <SimpleKPI label="Transformation Language" value="65.0" unit="%" />
          <SimpleKPI label="Feedback Submissions" value="34" />
          <SimpleKPI label="Avg Rating" value="8.65" />
          <SimpleKPI label="Summit Sessions" value="0" />
        </div>

        {/* Qualitative Intelligence */}
        <section>
          <h2 style={sectionTitle}>Qualitative Intelligence</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, border: "1px solid var(--mv-border-muted)", borderRadius: 14, padding: 22, background: "#fff" }}>
            <div>
              <div style={qualLabel}>Top Praise Themes</div>
              <ul style={qualList}>
                {a.praise.map((p) => (
                  <li key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mv-green)", flex: "none" }} />
                    <span style={{ fontSize: 14, color: "var(--mv-text)" }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ borderLeft: "1px solid var(--mv-border-muted)", paddingLeft: 22 }}>
              <div style={qualLabel}>Top Criticism Themes</div>
              <ul style={qualList}>
                {a.critique.map((c) => (
                  <li key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mv-orange)", flex: "none" }} />
                    <span style={{ fontSize: 14, color: "var(--mv-text)" }}>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Per-Mastery Performance */}
        <section>
          <h2 style={sectionTitle}>Per-Mastery Performance</h2>
          <Table
            dense
            rows={a.programs}
            columns={[
              { label: "Mastery", key: "name", width: "minmax(280px, 2fr)", render: r => <Badge variant="purple">{r.name}</Badge> },
              { label: "Lessons", key: "lessons", width: "1fr", align: "center", render: r => <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.lessons}</span> },
              { label: "Avg rating", key: "rating", width: "1fr", align: "center", render: r => <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{r.rating.toFixed(2)}</span> },
              { label: "Rewatch rate", key: "rewatch", width: "1fr", align: "center", render: r => r.rewatch == null ? <NotMeasured /> : <span>{r.rewatch}%</span> },
              { label: "Follow-up rate", key: "followup", width: "1fr", align: "center", render: r => <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.followup}%</span> },
              { label: "Flags", key: "flags", width: "80px", align: "center", render: r => r.flags > 0 ? <Badge variant="orange">{r.flags}</Badge> : <span style={{ color: "var(--mv-text-disabled)" }}>—</span> },
            ]}
          />
        </section>

        {/* Finance Overview */}
        <section>
          <h2 style={sectionTitle}>Finance Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid var(--mv-border-muted)", borderRadius: 14, background: "#fff", overflow: "hidden", marginBottom: 14 }}>
            <SimpleKPI label="2026 Speaker Fees" measured={false} />
            <SimpleKPI label="2026 Cost / Session" measured={false} />
            <SimpleKPI label="2025 Speaker Fees" value="$20,000" />
            <SimpleKPI label="2025 Cost / Session" value="$10,000" />
          </div>
          <Table
            dense
            rows={a.invoices}
            columns={[
              { label: "Invoice date", key: "date", width: "1fr" },
              { label: "Invoice number", key: "number", width: "1.2fr", render: r => <span style={{ fontFamily: "var(--mv-font-mono)", fontSize: 12 }}>{r.number}</span> },
              { label: "Product", key: "product", width: "1fr", render: r => <Badge variant="grey">{r.product}</Badge> },
              { label: "Memo", key: "memo", width: "3fr" },
              { label: "Amount", key: "amount", width: "1fr", align: "right", render: r => <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>${r.amount.toLocaleString()}</span> },
            ]}
          />
        </section>

      </div>
    </div>
  );
};

/* ===================== Simple Overview ===================== */
const OverviewSimple = ({ accent = "var(--mv-brand)" }) => {
  // Aggregate cross-author metrics in the same style as the profile screenshot
  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "var(--mv-font-body)" }}>
      <SimpleHeader accent={accent} />
      <SimpleNav active="overview" accent={accent} />

      <div style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 1240 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mv-text-subtle)", marginBottom: 4 }}>Dashboard / Overview</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--mv-text)", lineHeight: 1.15 }}>All authors</h1>
          <div style={{ fontSize: 14, color: "var(--mv-text-muted)", marginTop: 4 }}>Cross-author performance and financial overview</div>
        </div>

        {/* KPI strip mirroring author screen */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: "1px solid var(--mv-border-muted)", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
          <SimpleKPI label="Active Authors" value="148" />
          <SimpleKPI label="Overall Rewatch Rate" value="68.0" unit="%" />
          <SimpleKPI label="Transformation Language" value="71.0" unit="%" tag="AI Analyzed" />
          <SimpleKPI label="Feedback Submissions" value="2,184" />
          <SimpleKPI label="Avg Rating" value="8.84" />
          <SimpleKPI label="Summit Sessions" value="42" />
        </div>

        {/* Qualitative Intelligence — global */}
        <section>
          <h2 style={sectionTitle}>Qualitative Intelligence</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, border: "1px solid var(--mv-border-muted)", borderRadius: 14, padding: 22, background: "#fff" }}>
            <div>
              <div style={qualLabel}>Top Praise Themes</div>
              <ul style={qualList}>
                {THEMES_PRAISE.slice(0,5).map((p) => (
                  <li key={p.theme} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mv-green)", flex: "none" }} />
                    <span style={{ fontSize: 14, color: "var(--mv-text)", flex: 1 }}>{p.theme}</span>
                    <span style={{ fontSize: 12, color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{p.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ borderLeft: "1px solid var(--mv-border-muted)", paddingLeft: 22 }}>
              <div style={qualLabel}>Top Criticism Themes</div>
              <ul style={qualList}>
                {THEMES_CRITIQUE.slice(0,5).map((c) => (
                  <li key={c.theme} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mv-orange)", flex: "none" }} />
                    <span style={{ fontSize: 14, color: "var(--mv-text)", flex: 1 }}>{c.theme}</span>
                    <span style={{ fontSize: 12, color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Per-Author Performance — same layout pattern as Per-Mastery */}
        <section>
          <h2 style={sectionTitle}>Per-Author Performance</h2>
          <Table
            dense
            rows={AUTHORS}
            columns={[
              { label: "Author", key: "name", width: "minmax(240px, 2fr)", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.name} size={28} gradient={r.gradient} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>{r.role}</div>
                  </div>
                </div>
              ) },
              { label: "Programs", key: "programs", width: "1fr", align: "center", render: r => <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.programs}</span> },
              { label: "Avg rating", key: "rating", width: "1fr", align: "center", render: r => <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{r.rating.toFixed(2)}</span> },
              { label: "Rewatch rate", key: "rewatch", width: "1fr", align: "center", render: r => r.rewatch == null ? <NotMeasured short /> : <span>{r.rewatch}%</span> },
              { label: "Transformation", key: "transformation", width: "1fr", align: "center", render: r => <span>{r.transformation}%</span> },
              { label: "Flags", key: "flags", width: "80px", align: "center", render: r => r.flags > 0 ? <Badge variant="orange">{r.flags}</Badge> : <span style={{ color: "var(--mv-text-disabled)" }}>—</span> },
            ]}
          />
        </section>
      </div>
    </div>
  );
};

const sectionTitle = { fontSize: 16, fontWeight: 600, color: "var(--mv-text)", letterSpacing: "-0.01em", margin: "0 0 12px" };
const qualLabel = { fontSize: 13, fontWeight: 600, color: "var(--mv-text)", marginBottom: 6 };
const qualList = { listStyle: "none", padding: 0, margin: 0 };

Object.assign(window, { OverviewSimple, AuthorProfileSimple });
