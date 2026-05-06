"use client";

import React from "react";
import type { StrategicInsights } from "@/types/speaking";

interface Props {
  insights: StrategicInsights;
  onAuthorClick?: (authorName: string) => void;
}

function fmtUSD(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--mv-border)",
  borderRadius: 12,
  background: "var(--mv-surface)",
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minHeight: 180,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--mv-text-subtle)",
};

const headlineStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "var(--mv-text)",
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--mv-text-muted)",
  lineHeight: 1.4,
};

const linkAuthorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--mv-text)",
  fontWeight: 500,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

export function StrategicInsightsPanel({ insights, onAuthorClick }: Props) {
  const { spendConcentration, renewalQueue, renegotiateCohort, investCohort, varianceSummary } = insights;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 12,
    }}>
      {/* Spend Concentration */}
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Spend Concentration</div>
        <div style={headlineStyle}>{(spendConcentration.topNPct * 100).toFixed(0)}%</div>
        <div style={subtitleStyle}>
          Top {spendConcentration.topNCount} authors take{" "}
          <strong style={{ color: "var(--mv-text)" }}>{fmtUSD(spendConcentration.topNTotal, true)}</strong>{" "}
          of {fmtUSD(spendConcentration.grandTotal, true)} total 2026 spend.
          {spendConcentration.topNPct > 0.7 && (
            <span style={{ color: "var(--mv-amber, #f59e0b)" }}> Concentration risk — diversify.</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
          {spendConcentration.topNAuthors.slice(0, 3).map((a) => (
            <div key={a.authorName} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <button
                onClick={() => onAuthorClick?.(a.authorName)}
                style={{ ...linkAuthorStyle, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}
              >
                {a.authorName}
              </button>
              <span style={{ color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(a.amount, true)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Queue */}
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Renewal Queue · 90 days</div>
        <div style={{ ...headlineStyle, color: renewalQueue.length > 0 ? "var(--mv-amber, #f59e0b)" : "var(--mv-text)" }}>
          {renewalQueue.length}
        </div>
        <div style={subtitleStyle}>
          {renewalQueue.length === 0 ? (
            "No contracts renewing in the next 90 days."
          ) : (
            <>
              <strong style={{ color: "var(--mv-text)" }}>
                {fmtUSD(renewalQueue.reduce((s, r) => s + (r.totalPaid2026 ?? 0), 0), true)}
              </strong>{" "}
              total 2026 spend at stake.
            </>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
          {renewalQueue.slice(0, 3).map((r) => (
            <div key={r.authorName} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <button onClick={() => onAuthorClick?.(r.authorName)} style={linkAuthorStyle}>
                {r.authorName}
              </button>
              <span style={{ color: "var(--mv-amber, #f59e0b)", fontWeight: 600 }}>
                {r.daysUntil}d
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Renegotiate Cohort */}
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Renegotiation Targets</div>
        <div style={{ ...headlineStyle, color: "var(--mv-red, #ef4444)" }}>
          {renegotiateCohort.count}
        </div>
        <div style={subtitleStyle}>
          High-cost authors without backing performance.{" "}
          <strong style={{ color: "var(--mv-text)" }}>{fmtUSD(renegotiateCohort.totalSpend, true)}</strong>{" "}
          potential COGS reduction if fees normalised.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
          {renegotiateCohort.authors.slice(0, 3).map((a) => (
            <div key={a.authorName} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <button onClick={() => onAuthorClick?.(a.authorName)} style={linkAuthorStyle}>
                {a.authorName}
              </button>
              <span style={{ color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(a.amount, true)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invest Cohort */}
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Investment Targets</div>
        <div style={{ ...headlineStyle, color: "var(--mv-green, #22c55e)" }}>
          {investCohort.count}
        </div>
        <div style={subtitleStyle}>
          Below-median cost, above-median rewatch + rating.
          Lock these in before market repricing.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
          {investCohort.authors.slice(0, 3).map((a) => (
            <div key={a.authorName} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <button onClick={() => onAuthorClick?.(a.authorName)} style={linkAuthorStyle}>
                {a.authorName}
              </button>
              <span style={{ color: "var(--mv-text-subtle)", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(a.amount, true)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Variance to Budget */}
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Variance to Budget</div>
        <div style={{
          ...headlineStyle,
          color: varianceSummary.totalVariance > 0 ? "var(--mv-red, #ef4444)" : "var(--mv-green, #22c55e)",
        }}>
          {varianceSummary.totalVariance >= 0 ? "+" : ""}
          {fmtUSD(varianceSummary.totalVariance, true)}
        </div>
        <div style={subtitleStyle}>
          Actual vs Projected fee across {varianceSummary.overrunEngagements} over-run engagement{varianceSummary.overrunEngagements === 1 ? "" : "s"}.
          {varianceSummary.totalProjected > 0 && (
            <> Projected: <strong style={{ color: "var(--mv-text)" }}>{fmtUSD(varianceSummary.totalProjected, true)}</strong></>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
          {varianceSummary.worstOverruns.slice(0, 3).map((o, i) => (
            <div key={`${o.authorName}-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <button onClick={() => onAuthorClick?.(o.authorName)} style={{ ...linkAuthorStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                {o.authorName}
              </button>
              <span style={{ color: "var(--mv-red, #ef4444)", fontWeight: 600 }}>
                +{fmtUSD(o.variance, true)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
