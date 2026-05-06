/* App shell — sidebar nav + topbar.
   Used inside artboards to make screens feel like a real product. */

const NavItem = ({ icon: Icon, label, active, badge, accent = "var(--mv-brand)" }) => (
  <a href="#" onClick={(e) => e.preventDefault()} style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px",
    margin: "1px 8px",
    borderRadius: 10,
    color: active ? "#fff" : "rgba(255,255,255,0.72)",
    background: active ? accent : "transparent",
    textDecoration: "none",
    fontSize: 14, fontWeight: 500,
    transition: "background 120ms, color 120ms",
    position: "relative",
  }}>
    <Icon size={18} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge ? (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
        background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(255,255,255,0.85)",
      }}>{badge}</span>
    ) : null}
  </a>
);

const NavSection = ({ label, children }) => (
  <div style={{ margin: "16px 0 4px" }}>
    {label ? (
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        padding: "0 20px 8px",
      }}>{label}</div>
    ) : null}
    {children}
  </div>
);

const Sidebar = ({ active = "overview", accent = "var(--mv-brand)", accent2 = "var(--mv-pink)", width = 248 }) => (
  <aside style={{
    width, flex: "none",
    background: "var(--mv-grey-700)",
    color: "#fff",
    display: "flex", flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    height: "100%",
  }}>
    {/* logo */}
    <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <AILogoLockup size={16} color="#fff" accent={accent} accent2={accent2} />
      <button style={{
        width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
        display: "grid", placeItems: "center", cursor: "pointer",
      }}>
        <IcChevRight size={14} />
      </button>
    </div>

    {/* org switcher */}
    <button style={{
      margin: "2px 12px 8px",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      textAlign: "left",
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#7a12d4,#df1a6f)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>M</div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Mindvalley</div>
      <IcChevDown size={14} color="rgba(255,255,255,0.5)" />
    </button>

    <nav style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
      <NavSection>
        <NavItem icon={IcDashboard} label="Overview" active={active === "overview"} accent={accent} />
        <NavItem icon={IcUsers} label="Authors" badge="148" active={active === "authors"} accent={accent} />
        <NavItem icon={IcChart} label="Performance" active={active === "performance"} accent={accent} />
        <NavItem icon={IcMessage} label="Feedback" badge="3" active={active === "feedback"} accent={accent} />
      </NavSection>

      <NavSection label="Insights">
        <NavItem icon={IcSparkle} label="AI Themes" active={active === "themes"} accent={accent} />
        <NavItem icon={IcFlag} label="Risk Signals" badge="2" active={active === "risk"} accent={accent} />
        <NavItem icon={IcStar} label="Top Performers" active={active === "top"} accent={accent} />
      </NavSection>

      <NavSection label="Library">
        <NavItem icon={IcCalendar} label="Programs" active={active === "programs"} accent={accent} />
        <NavItem icon={IcExternal} label="Summits & Events" active={active === "events"} accent={accent} />
      </NavSection>
    </nav>

    {/* user */}
    <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#329dff,#7a12d4)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>NK</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Naveen K.</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Author Relations</div>
      </div>
      <IcSettings size={16} color="rgba(255,255,255,0.5)" />
    </div>
  </aside>
);

const Topbar = ({ breadcrumb, title, right, search = true }) => (
  <header style={{
    height: 64, padding: "0 28px",
    display: "flex", alignItems: "center", gap: 20,
    borderBottom: "1px solid var(--mv-border-muted)",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(8px)",
    position: "sticky", top: 0, zIndex: 10,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {breadcrumb ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--mv-text-subtle)", marginBottom: 2 }}>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <IcChevRight size={11} color="var(--mv-text-disabled)" /> : null}
              <span style={{ color: i === breadcrumb.length - 1 ? "var(--mv-text-muted)" : "var(--mv-text-subtle)", fontWeight: i === breadcrumb.length - 1 ? 500 : 400 }}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      ) : null}
      {title ? <div style={{ fontSize: 16, fontWeight: 600, color: "var(--mv-text)", letterSpacing: "-0.01em" }}>{title}</div> : null}
    </div>

    {search ? (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        height: 36, width: 280,
        padding: "0 12px",
        borderRadius: 10,
        background: "var(--mv-grey-100)",
        border: "1px solid var(--mv-border-muted)",
        color: "var(--mv-text-subtle)",
      }}>
        <IcSearch size={15} />
        <span style={{ fontSize: 13, flex: 1 }}>Search authors, programs…</span>
        <span style={{ fontSize: 11, padding: "2px 6px", border: "1px solid var(--mv-border)", borderRadius: 4, fontFamily: "var(--mv-font-mono)" }}>⌘K</span>
      </div>
    ) : null}

    {right || (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={iconBtn}><IcBell size={17} /></button>
        <button style={iconBtn}><IcSettings size={17} /></button>
      </div>
    )}
  </header>
);

const iconBtn = {
  width: 36, height: 36, borderRadius: 10,
  border: "1px solid var(--mv-border-muted)",
  background: "var(--mv-white)",
  color: "var(--mv-text-muted)",
  display: "grid", placeItems: "center", cursor: "pointer",
};

Object.assign(window, { Sidebar, Topbar, NavItem });
