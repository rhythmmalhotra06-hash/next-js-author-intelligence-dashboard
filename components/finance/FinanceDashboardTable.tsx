"use client";

import React, { useState, useMemo } from "react";
import type { FinanceDashboardRow, DecisionAction } from "@/types/speaking";

const DECISION_BADGE: Record<DecisionAction, { label: string; color: string }> = {
  anchor:      { label: "ANCHOR",      color: "var(--mv-brand)" },
  invest:      { label: "INVEST",      color: "var(--mv-green, #22c55e)" },
  renegotiate: { label: "RENEGOTIATE", color: "var(--mv-red, #ef4444)" },
  develop:     { label: "DEVELOP",     color: "var(--mv-amber, #f59e0b)" },
  watch:       { label: "WATCH",       color: "var(--mv-text-subtle)" },
};

type SortKey = keyof Pick<
  FinanceDashboardRow,
  | "authorName"
  | "contractType"
  | "totalPaid2025"
  | "totalPaid2026"
  | "fee2026"
  | "royalties2026"
  | "feeTrajectory"
  | "feedbackScore"
  | "craftSignal"
  | "sessionCount"
>;
type SortDir = "asc" | "desc";

interface Props {
  rows: FinanceDashboardRow[];
  onSelectRow: (row: FinanceDashboardRow) => void;
  selectedForComparison: Set<string>;
  onToggleComparison: (entityId: string) => void;
}

const CONTRACT_TYPE_COLORS: Record<string, string> = {
  royalty:   "var(--mv-brand)",
  "fixed fee": "var(--mv-teal, #14b8a6)",
  default:   "var(--mv-text-subtle)",
};

const TRAJECTORY_COLORS: Record<string, string> = {
  Increasing: "var(--mv-green, #22c55e)",
  Decreasing: "var(--mv-red,  #ef4444)",
  Stable:     "var(--mv-text-subtle)",
};

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

function isWithin90Days(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const diff = d.getTime() - Date.now();
    return diff >= 0 && diff <= 90 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export function FinanceDashboardTable({ rows, onSelectRow, selectedForComparison, onToggleComparison }: Props) {
  const [sortKey, setSortKey]   = useState<SortKey>("totalPaid2026");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMastery, setFilterMastery] = useState<string>("all");
  const [filterTrajectory, setFilterTrajectory] = useState<string>("all");
  const [filterDecision, setFilterDecision] = useState<DecisionAction | "all">("all");
  const [search, setSearch] = useState("");

  // Derive filter options
  const contractTypes = useMemo(() => {
    const s = new Set<string>();
    rows.forEach(r => { if (r.contractType) s.add(r.contractType); });
    return Array.from(s).sort();
  }, [rows]);

  const masteries = useMemo(() => {
    const s = new Set<string>();
    rows.forEach(r => r.masteries.forEach(m => s.add(m)));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.authorName.toLowerCase().includes(q) ||
        (r.entityName ?? "").toLowerCase().includes(q) ||
        r.productCodes.some(p => p.toLowerCase().includes(q))
      );
    }
    if (filterType !== "all")       result = result.filter(r => r.contractType === filterType);
    if (filterMastery !== "all")    result = result.filter(r => r.masteries.includes(filterMastery));
    if (filterTrajectory !== "all") result = result.filter(r => r.feeTrajectory === filterTrajectory);
    if (filterDecision !== "all")   result = result.filter(r => r.decision.action === filterDecision);

    return [...result].sort((a, b) => {
      const av = a[sortKey] as string | number | null ?? null;
      const bv = b[sortKey] as string | number | null ?? null;
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, search, filterType, filterMastery, filterTrajectory, filterDecision, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortArrow({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "var(--mv-text-subtle)", fontSize: 10 }}>⇅</span>;
    return <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const th: React.CSSProperties = {
    padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mv-text-subtle)",
    borderBottom: "1px solid var(--mv-border)", whiteSpace: "nowrap", cursor: "pointer",
    userSelect: "none",
  };
  const td: React.CSSProperties = {
    padding: "10px 12px", fontSize: 13, borderBottom: "1px solid var(--mv-border)",
    verticalAlign: "middle",
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input
          type="search"
          placeholder="Search author or mastery…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "7px 12px", borderRadius: 8, border: "1px solid var(--mv-border)",
            background: "var(--mv-surface-subtle)", color: "var(--mv-text)",
            fontSize: 13, minWidth: 220,
          }}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-surface-subtle)", color: "var(--mv-text)", fontSize: 13 }}>
          <option value="all">All payment types</option>
          {contractTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterMastery} onChange={e => setFilterMastery(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-surface-subtle)", color: "var(--mv-text)", fontSize: 13 }}>
          <option value="all">All masteries</option>
          {masteries.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterTrajectory} onChange={e => setFilterTrajectory(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-surface-subtle)", color: "var(--mv-text)", fontSize: 13 }}>
          <option value="all">All trajectories</option>
          <option value="Increasing">Increasing</option>
          <option value="Stable">Stable</option>
          <option value="Decreasing">Decreasing</option>
        </select>
        <select value={filterDecision} onChange={e => setFilterDecision(e.target.value as DecisionAction | "all")}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-surface-subtle)", color: "var(--mv-text)", fontSize: 13 }}>
          <option value="all">All decisions</option>
          <option value="anchor">Anchor</option>
          <option value="invest">Invest</option>
          <option value="renegotiate">Renegotiate</option>
          <option value="develop">Develop</option>
          <option value="watch">Watch</option>
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--mv-text-subtle)" }}>
          {filtered.length} author{filtered.length !== 1 ? "s" : ""}
          {selectedForComparison.size > 0 && (
            <> · <span style={{ color: "var(--mv-brand)", fontWeight: 600 }}>{selectedForComparison.size} selected for comparison</span></>
          )}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--mv-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--mv-surface-subtle)" }}>
              <th style={{ ...th, width: 36 }} />
              <th style={th}>Decision</th>
              <th style={th} onClick={() => toggleSort("authorName")}>Author <SortArrow k="authorName" /></th>
              <th style={th}>Entity</th>
              <th style={th} onClick={() => toggleSort("contractType")}>Type <SortArrow k="contractType" /></th>
              <th style={th}>GL Code</th>
              <th style={th}>Masteries</th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("totalPaid2025")}>Total 2025 <SortArrow k="totalPaid2025" /></th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("totalPaid2026")}>Total 2026 <SortArrow k="totalPaid2026" /></th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("fee2026")}>Fee 2026 <SortArrow k="fee2026" /></th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("royalties2026")}>Royalties 2026 <SortArrow k="royalties2026" /></th>
              <th style={th}>Royalty %</th>
              <th style={th} onClick={() => toggleSort("feeTrajectory")}>Trajectory <SortArrow k="feeTrajectory" /></th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("craftSignal")}>Craft Signal <SortArrow k="craftSignal" /></th>
              <th style={{ ...th, textAlign: "right" }} onClick={() => toggleSort("feedbackScore")}>Rating <SortArrow k="feedbackScore" /></th>
              <th style={th}>Renewal</th>
              <th style={{ ...th, width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={17} style={{ ...td, textAlign: "center", color: "var(--mv-text-subtle)", padding: 32 }}>
                  No authors match the current filters.
                </td>
              </tr>
            ) : filtered.map((row) => {
              const isSelected = selectedForComparison.has(row.authorEntityId);
              const isRenewalSoon = isWithin90Days(row.contractTerms.renewalDate);
              const typeColor = CONTRACT_TYPE_COLORS[(row.contractType ?? "").toLowerCase()] ?? CONTRACT_TYPE_COLORS.default;
              const trajColor = row.feeTrajectory ? TRAJECTORY_COLORS[row.feeTrajectory] : "var(--mv-text-subtle)";

              return (
                <tr
                  key={row.authorEntityId}
                  onClick={() => onSelectRow(row)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "var(--mv-brand-light)" : "transparent",
                    transition: "background 80ms",
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "var(--mv-surface-subtle)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isSelected ? "var(--mv-brand-light)" : "transparent"; }}
                >
                  {/* Comparison checkbox */}
                  <td
                    style={{ ...td, textAlign: "center", cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); onToggleComparison(row.authorEntityId); }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleComparison(row.authorEntityId)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: "pointer", accentColor: "var(--mv-brand)", width: 16, height: 16 }}
                    />
                  </td>

                  {/* Decision badge */}
                  <td style={td}>
                    {(() => {
                      const meta = DECISION_BADGE[row.decision.action];
                      return (
                        <span
                          title={row.decision.rationale}
                          style={{
                            padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                            background: meta.color, color: "#fff", letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {meta.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Author name */}
                  <td style={{ ...td, fontWeight: 600, color: "var(--mv-text)" }}>
                    {row.authorName}
                    {row.transactions.length > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--mv-text-subtle)" }}>
                        {row.transactions.length} tx
                      </span>
                    )}
                  </td>

                  {/* Entity */}
                  <td style={{ ...td, color: "var(--mv-text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.entityName ?? "—"}
                  </td>

                  {/* Contract type */}
                  <td style={td}>
                    {row.contractType ? (
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: `${typeColor}20`, color: typeColor }}>
                        {row.contractType}
                      </span>
                    ) : "—"}
                  </td>

                  {/* GL codes */}
                  <td style={{ ...td, color: "var(--mv-text-muted)", fontSize: 12 }}>
                    {row.glCodes.length > 0 ? row.glCodes.slice(0, 2).join(", ") + (row.glCodes.length > 2 ? "…" : "") : "—"}
                  </td>

                  {/* Masteries */}
                  <td style={{ ...td, fontSize: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {row.masteries.slice(0, 3).map(m => (
                        <span key={m} style={{ padding: "1px 6px", borderRadius: 999, background: "var(--mv-surface-subtle)", border: "1px solid var(--mv-border)", fontSize: 11 }}>{m}</span>
                      ))}
                      {row.masteries.length > 3 && <span style={{ fontSize: 11, color: "var(--mv-text-subtle)" }}>+{row.masteries.length - 3}</span>}
                      {row.masteries.length === 0 && <span style={{ color: "var(--mv-text-subtle)" }}>—</span>}
                    </div>
                  </td>

                  {/* Total 2025 */}
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(row.totalPaid2025)}</td>

                  {/* Total 2026 */}
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: row.totalPaid2026 !== null ? 600 : 400 }}>{fmt(row.totalPaid2026)}</td>

                  {/* Fee 2026 */}
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12, color: "var(--mv-text-muted)" }}>{fmt(row.fee2026)}</td>

                  {/* Royalties 2026 */}
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12, color: "var(--mv-text-muted)" }}>{fmt(row.royalties2026)}</td>

                  {/* Royalty % */}
                  <td style={{ ...td, fontSize: 12 }}>
                    {row.contractTerms.royaltyPct !== null ? `${row.contractTerms.royaltyPct}%` : "—"}
                  </td>

                  {/* Trajectory */}
                  <td style={{ ...td, color: trajColor, fontWeight: 600, fontSize: 12 }}>
                    {row.feeTrajectory ?? "—"}
                  </td>

                  {/* Craft signal */}
                  <td style={{ ...td, textAlign: "right" }}>
                    {row.craftSignal !== null ? (
                      <span style={{ color: row.craftSignal >= 0.3 ? "var(--mv-green, #22c55e)" : row.craftSignal < 0.15 ? "var(--mv-red, #ef4444)" : "var(--mv-text)" }}>
                        {fmtPct(row.craftSignal)}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Rating */}
                  <td style={{ ...td, textAlign: "right" }}>
                    {row.feedbackScore !== null ? (
                      <span style={{ color: row.feedbackScore >= 4.0 ? "var(--mv-green, #22c55e)" : "var(--mv-red, #ef4444)" }}>
                        {fmtRating(row.feedbackScore)}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Renewal date */}
                  <td style={{ ...td, fontSize: 12, color: isRenewalSoon ? "var(--mv-amber, #f59e0b)" : "var(--mv-text-muted)" }}>
                    {row.contractTerms.renewalDate ? (
                      <span style={{ fontWeight: isRenewalSoon ? 600 : 400 }}>
                        {isRenewalSoon ? "⚠ " : ""}{row.contractTerms.renewalDate}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Arrow */}
                  <td style={{ ...td, textAlign: "center", color: "var(--mv-text-subtle)" }}>›</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
