"use client";

import React from "react";
import type { FinanceDashboardRow } from "@/types/speaking";

interface Props {
  rows: FinanceDashboardRow[];        // all rows (for lookup)
  selectedIds: Set<string>;
  onRemove: (entityId: string) => void;
  onClear: () => void;
}

function fmt(n: number | null): string {
  if (n === null) return "—";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return (n * 100).toFixed(1) + "%";
}

function fmtRating(n: number | null): string {
  if (n === null) return "—";
  return n.toFixed(2);
}

interface CompareRow {
  label: string;
  values: (string | null)[];
  highlight?: boolean; // bold the highest numeric value
}

export function AuthorComparisonPanel({ rows, selectedIds, onRemove, onClear }: Props) {
  const selected = rows.filter(r => selectedIds.has(r.authorEntityId));
  if (selected.length === 0) return null;

  // 1 selected — show a guidance card instead of an empty comparison
  if (selected.length === 1) {
    const r = selected[0];
    return (
      <div style={{
        border: "1px dashed var(--mv-brand)", borderRadius: 12,
        background: "var(--mv-brand-light)", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{
          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: "var(--mv-brand)", color: "#fff",
        }}>
          1 SELECTED
        </span>
        <span style={{ fontSize: 13, color: "var(--mv-text)" }}>
          <strong>{r.authorName}</strong> selected. Check at least one more author below to compare side-by-side.
        </span>
        <button onClick={onClear} style={{
          marginLeft: "auto", padding: "4px 12px", borderRadius: 6,
          border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
          color: "var(--mv-text-muted)", fontSize: 12, cursor: "pointer",
        }}>
          Clear
        </button>
      </div>
    );
  }

  const compareRows: CompareRow[] = [
    { label: "Payment Type",  values: selected.map(r => r.contractType ?? "—") },
    { label: "Entity",        values: selected.map(r => r.entityName ?? "—") },
    { label: "Total 2025",    values: selected.map(r => fmt(r.totalPaid2025)),  highlight: true },
    { label: "Total 2026",    values: selected.map(r => fmt(r.totalPaid2026)),  highlight: true },
    { label: "Fee 2026",      values: selected.map(r => fmt(r.fee2026)),        highlight: true },
    { label: "Royalties 2026",values: selected.map(r => fmt(r.royalties2026)),  highlight: true },
    { label: "Royalty %",     values: selected.map(r => r.contractTerms.royaltyPct !== null ? `${r.contractTerms.royaltyPct}%` : "—") },
    { label: "Trajectory",    values: selected.map(r => r.feeTrajectory ?? "—") },
    { label: "Sessions",      values: selected.map(r => String(r.sessionCount)), highlight: true },
    { label: "Rewatch Rate",  values: selected.map(r => fmtPct(r.craftSignal)), highlight: true },
    { label: "Avg Rating",    values: selected.map(r => fmtRating(r.feedbackScore)), highlight: true },
    { label: "Masteries",     values: selected.map(r => r.masteries.length > 0 ? r.masteries.join(", ") : "—") },
    { label: "Renewal Date",  values: selected.map(r => r.contractTerms.renewalDate ?? "—") },
    { label: "Tx Count",      values: selected.map(r => String(r.transactions.length)) },
  ];

  // Find highest numeric value per row for highlighting
  function isHighest(rowValues: (string | null)[], idx: number): boolean {
    const nums = rowValues.map(v => {
      if (!v || v === "—") return null;
      const n = parseFloat(v.replace(/[$,%]/g, ""));
      return isNaN(n) ? null : n;
    });
    const max = Math.max(...nums.filter((n): n is number => n !== null));
    return nums[idx] === max && max > 0;
  }

  return (
    <div style={{
      border: "1px solid var(--mv-border)", borderRadius: 12,
      background: "var(--mv-surface)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", background: "var(--mv-surface-subtle)",
        borderBottom: "1px solid var(--mv-border)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mv-text)" }}>
          Comparing {selected.length} authors
        </span>
        {selected.length >= 4 && (
          <span style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>
            ← Scroll horizontally to see all →
          </span>
        )}
        <button onClick={onClear} style={{
          marginLeft: "auto", padding: "4px 12px", borderRadius: 6,
          border: "1px solid var(--mv-border)", background: "transparent",
          color: "var(--mv-text-muted)", fontSize: 12, cursor: "pointer",
        }}>
          Clear all
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: "100%", width: "max-content", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--mv-border)" }}>
              <th style={{
                padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mv-text-subtle)",
                width: 140, minWidth: 140,
                position: "sticky", left: 0, background: "var(--mv-surface)", zIndex: 1,
              }}>
                Metric
              </th>
              {selected.map(r => (
                <th key={r.authorEntityId} style={{ padding: "10px 16px", textAlign: "left", minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mv-text)" }}>{r.authorName}</span>
                    <button
                      onClick={() => onRemove(r.authorEntityId)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mv-text-subtle)", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
                    >
                      ×
                    </button>
                  </div>
                  {r.contractType && (
                    <span style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>{r.contractType}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map(({ label, values, highlight }) => (
              <tr key={label} style={{ borderBottom: "1px solid var(--mv-border)" }}>
                <td style={{
                  padding: "9px 16px", fontSize: 12, fontWeight: 600,
                  color: "var(--mv-text-subtle)", whiteSpace: "nowrap",
                  position: "sticky", left: 0, background: "var(--mv-surface)", zIndex: 1,
                  borderRight: "1px solid var(--mv-border)",
                }}>
                  {label}
                </td>
                {values.map((val, i) => (
                  <td key={i} style={{
                    padding: "9px 16px",
                    minWidth: 200,
                    fontWeight: highlight && isHighest(values, i) ? 700 : 400,
                    color: highlight && isHighest(values, i) ? "var(--mv-brand)" : "var(--mv-text)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {val ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
