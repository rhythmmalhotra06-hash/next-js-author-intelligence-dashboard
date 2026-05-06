"use client";

import React, { useState } from "react";
import type { FinanceFlag } from "@/types/speaking";

interface Props {
  flags: FinanceFlag[];
  unmatchedEntities: string[];
  onAuthorClick?: (authorName: string) => void;
}

const FLAG_CONFIG: Record<FinanceFlag["type"], { icon: string; title: string; color: string }> = {
  high_cost_low_craft:    { icon: "⚠",  title: "High Cost, Low Craft",   color: "var(--mv-red, #ef4444)" },
  fee_trajectory_anomaly: { icon: "↑",  title: "Fee Trajectory Anomaly", color: "var(--mv-amber, #f59e0b)" },
  renewal_alert:          { icon: "📅", title: "Renewal Alert",          color: "var(--mv-brand)" },
  stuck_payment:          { icon: "⏱",  title: "Stuck Payment",          color: "var(--mv-amber, #f59e0b)" },
  fx_exposure:            { icon: "💱", title: "FX Exposure",            color: "var(--mv-text-subtle)" },
  unmatched_entity:       { icon: "?",  title: "No Performance Data",    color: "var(--mv-text-subtle)" },
};

const SEVERITY_BORDER: Record<FinanceFlag["severity"], string> = {
  high:   "var(--mv-red, #ef4444)",
  medium: "var(--mv-amber, #f59e0b)",
  low:    "var(--mv-border)",
};

export function FinanceFlagsPanel({ flags, unmatchedEntities, onAuthorClick }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeType, setActiveType] = useState<FinanceFlag["type"] | "all">("all");

  const allFlags: FinanceFlag[] = [
    ...flags,
    ...unmatchedEntities.map(name => ({
      type: "unmatched_entity" as const,
      authorName: name,
      detail: "This author entity has finance records but no matching performance profile in the mastery data.",
      severity: "low" as const,
    })),
  ];

  const typeCounts = allFlags.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const visible = activeType === "all" ? allFlags : allFlags.filter(f => f.type === activeType);

  if (allFlags.length === 0) {
    return (
      <div style={{
        border: "1px solid var(--mv-border)", borderRadius: 12, padding: "20px 24px",
        background: "var(--mv-surface)", color: "var(--mv-text-subtle)", fontSize: 13,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>✓</span>
        No flags to surface — all authors have complete data and normal cost trajectories.
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--mv-border)", borderRadius: 12, background: "var(--mv-surface)", overflow: "hidden" }}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: "100%", padding: "14px 20px", background: "var(--mv-surface-subtle)",
          borderBottom: collapsed ? "none" : "1px solid var(--mv-border)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--mv-text)", flex: 1 }}>
          Analysis &amp; Flags
          <span style={{
            marginLeft: 8, padding: "2px 8px", borderRadius: 999,
            background: allFlags.filter(f => f.severity === "high").length > 0 ? "var(--mv-red, #ef4444)" : "var(--mv-border)",
            color: allFlags.filter(f => f.severity === "high").length > 0 ? "#fff" : "var(--mv-text)",
            fontSize: 11, fontWeight: 700,
          }}>
            {allFlags.length}
          </span>
        </span>
        <span style={{ fontSize: 12, color: "var(--mv-text-subtle)" }}>{collapsed ? "Show" : "Hide"}</span>
      </button>

      {!collapsed && (
        <div style={{ padding: "16px 20px" }}>
          {/* Type filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <Tab label={`All (${allFlags.length})`} active={activeType === "all"} onClick={() => setActiveType("all")} />
            {(Object.keys(FLAG_CONFIG) as FinanceFlag["type"][]).map(type => (
              typeCounts[type] ? (
                <Tab
                  key={type}
                  label={`${FLAG_CONFIG[type].icon} ${FLAG_CONFIG[type].title} (${typeCounts[type]})`}
                  active={activeType === type}
                  onClick={() => setActiveType(type)}
                />
              ) : null
            ))}
          </div>

          {/* Flag list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map((flag, i) => {
              const cfg = FLAG_CONFIG[flag.type];
              return (
                <div key={i} style={{
                  borderLeft: `3px solid ${SEVERITY_BORDER[flag.severity]}`,
                  padding: "10px 14px", borderRadius: "0 8px 8px 0",
                  background: "var(--mv-surface-subtle)",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <button
                        onClick={() => onAuthorClick?.(flag.authorName)}
                        style={{
                          background: "none", border: "none", padding: 0, cursor: onAuthorClick ? "pointer" : "default",
                          fontSize: 13, fontWeight: 700, color: "var(--mv-text)",
                          textDecoration: onAuthorClick ? "underline" : "none",
                          textUnderlineOffset: 2,
                        }}
                      >
                        {flag.authorName}
                      </button>
                      <span style={{
                        padding: "1px 6px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        background: SEVERITY_BORDER[flag.severity] + "25",
                        color: SEVERITY_BORDER[flag.severity],
                      }}>
                        {flag.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--mv-text-muted)", lineHeight: 1.5 }}>
                      {flag.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 999, border: "1px solid var(--mv-border)",
        background: active ? "var(--mv-brand)" : "var(--mv-surface-subtle)",
        color: active ? "#fff" : "var(--mv-text-muted)",
        fontSize: 11, fontWeight: active ? 700 : 400, cursor: "pointer",
        transition: "all 100ms",
      }}
    >
      {label}
    </button>
  );
}
