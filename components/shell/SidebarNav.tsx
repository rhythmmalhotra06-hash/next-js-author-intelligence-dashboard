"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";

const MASTERIES = [
  { key: "entrepreneurship", label: "Entrepreneurship", color: "var(--mv-blue)" },
  { key: "social",           label: "Social Media",     color: "var(--mv-pink)" },
  { key: "manifesting",      label: "Manifesting",      color: "var(--mv-green)" },
  { key: "spiritual",        label: "Spiritual",        color: "var(--mv-amber)" },
  { key: "ai_mastery",       label: "AI Mastery",       color: "var(--mv-teal)" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("mv-theme") as "dark"|"light") ?? "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-mv-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("mv-theme", next);
    setTheme(next);
    document.documentElement.setAttribute("data-mv-theme", next);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0,
      width: "var(--mv-sidebar-width)",
      background: "var(--mv-surface)",
      borderRight: "1px solid var(--mv-border)",
      display: "flex", flexDirection: "column",
      zIndex: 200, overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--mv-border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <BrandMark size={32} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--mv-text)", letterSpacing: "-0.01em" }}>
              Speaker Intelligence
            </div>
            <div style={{ fontSize: 11, color: "var(--mv-text-subtle)", marginTop: 1 }}>Mindvalley</div>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: "12px 12px 0" }}>
        <NavItem href="/overview" label="Overview" icon="◎" active={isActive("/overview")} />
        <NavItem href="/finance" label="Finance" icon="$" active={isActive("/finance")} />

        <div style={{ margin: "20px 0 8px 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mv-text-subtle)" }}>
          Mastery Drill-downs
        </div>
        {MASTERIES.map((m) => (
          <NavItem
            key={m.key}
            href={`/mastery/${m.key}`}
            label={m.label}
            active={pathname === `/mastery/${m.key}`}
            dot={m.color}
          />
        ))}
        <NavItem href="/speaking" label="Speaking" icon="◉" active={pathname === "/speaking"} />
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--mv-border)" }}>
        <button
          onClick={toggleTheme}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            background: "var(--mv-surface-subtle)", border: "1px solid var(--mv-border)",
            color: "var(--mv-text-muted)", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, label, icon, active, dot }: {
  href: string; label: string; icon?: string; active: boolean; dot?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8, marginBottom: 2,
        background: active ? "var(--mv-brand-light)" : "transparent",
        color: active ? "var(--mv-brand-content)" : "var(--mv-text-muted)",
        fontSize: 13, fontWeight: active ? 600 : 400,
        transition: "all 120ms ease",
        borderLeft: active ? "2px solid var(--mv-brand)" : "2px solid transparent",
      }}>
        {dot ? (
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        ) : icon ? (
          <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
        ) : null}
        {label}
      </div>
    </Link>
  );
}
