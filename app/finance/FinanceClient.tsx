"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { FinanceDashboardData, FinanceDashboardRow } from "@/types/speaking";
import { FinanceDashboardTable } from "@/components/finance/FinanceDashboardTable";
import { AuthorFinanceDrawer } from "@/components/finance/AuthorFinanceDrawer";
import { AuthorComparisonPanel } from "@/components/finance/AuthorComparisonPanel";
import { FinanceFlagsPanel } from "@/components/finance/FinanceFlagsPanel";
import { StrategicInsightsPanel } from "@/components/finance/StrategicInsightsPanel";

interface Props {
  data: FinanceDashboardData;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

export function FinanceClient({ data }: Props) {
  const [drawerRow, setDrawerRow] = useState<FinanceDashboardRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterByHighFlags, setFilterByHighFlags] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const prevSelectedSize = useRef(0);

  // When the user goes from 0/1 → 2 selected, scroll the panel into view
  useEffect(() => {
    if (selectedIds.size >= 2 && prevSelectedSize.current < 2 && comparisonRef.current) {
      comparisonRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevSelectedSize.current = selectedIds.size;
  }, [selectedIds]);

  const handleSelectRow = useCallback((row: FinanceDashboardRow) => {
    setDrawerRow(row);
  }, []);

  const handleToggleComparison = useCallback((entityId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  }, []);

  const handleRemoveFromComparison = useCallback((entityId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(entityId);
      return next;
    });
  }, []);

  const handleFlagAuthorClick = useCallback((authorName: string) => {
    const row = data.rows.find(r => r.authorName === authorName);
    if (row) setDrawerRow(row);
  }, [data.rows]);

  // Summary metrics — fees and royalties tracked separately per user request
  const totalFees2026      = data.rows.reduce((acc, r) => acc + (r.fee2026 ?? 0), 0);
  const totalRoyalties2026 = data.rows.reduce((acc, r) => acc + (r.royalties2026 ?? 0), 0);
  const totalFees2025      = data.rows.reduce((acc, r) => acc + (r.fee2025 ?? 0), 0);
  const totalRoyalties2025 = data.rows.reduce((acc, r) => acc + (r.royalties2025 ?? 0), 0);
  const royaltyAuthors     = data.rows.filter(r => r.contractType?.toLowerCase().includes("royalt")).length;
  const fixedFeeAuthors    = data.rows.filter(r => r.contractType?.toLowerCase().includes("fixed")).length;
  const highFlags          = data.flags.filter(f => f.severity === "high").length;

  const fmtUSD = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  // Set of author names that have at least one high-severity flag
  const highFlagAuthorNames = useMemo(
    () => new Set(data.flags.filter(f => f.severity === "high").map(f => f.authorName)),
    [data.flags]
  );

  // Rows shown in the table — narrowed when the high-flag filter is active
  const visibleRows = useMemo(
    () => filterByHighFlags
      ? data.rows.filter(r => highFlagAuthorNames.has(r.authorName))
      : data.rows,
    [data.rows, filterByHighFlags, highFlagAuthorNames]
  );

  const handleHighFlagsClick = useCallback(() => {
    setFilterByHighFlags(prev => !prev);
    // Scroll to the table after the next paint so the user sees the filtered result
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const clearHighFlagsFilter = useCallback(() => setFilterByHighFlags(false), []);

  return (
    <main className="of-page">
      {/* Header */}
      <div className="of-page__header">
        <div>
          <p className="of-page__eyebrow">Author Relations</p>
          <h1 className="of-page__title">Finance Intelligence</h1>
          <p className="of-page__subtitle">
            Author payment structures, spend history, and contract intelligence
          </p>
        </div>
        <div className="of-table__muted" style={{ fontSize: 12, textAlign: "right" }} suppressHydrationWarning>
          Last updated: {formatTimestamp(data.fetchedAt)}
        </div>
      </div>

      {/* Summary metrics — fees + royalties always shown separately */}
      <div className="of-metrics">
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--purple" />
            Author entities
          </div>
          <div className="of-metric__value">{data.rows.length}</div>
          <div className="of-metric__sub">{royaltyAuthors} royalty · {fixedFeeAuthors} fixed fee</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--blue" />
            Speaker Fees 2026
          </div>
          <div className="of-metric__value">{fmtUSD(totalFees2026)}</div>
          <div className="of-metric__sub">Year-to-date fixed fees</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--teal" />
            Royalties 2026
          </div>
          <div className="of-metric__value">{fmtUSD(totalRoyalties2026)}</div>
          <div className="of-metric__sub">Year-to-date royalty payouts</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--blue" />
            Speaker Fees 2025
          </div>
          <div className="of-metric__value">{fmtUSD(totalFees2025)}</div>
          <div className="of-metric__sub">Full-year fixed fees</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--teal" />
            Royalties 2025
          </div>
          <div className="of-metric__value">{fmtUSD(totalRoyalties2025)}</div>
          <div className="of-metric__sub">Full-year royalty payouts</div>
        </div>
        <button
          className="of-metric"
          onClick={handleHighFlagsClick}
          disabled={highFlags === 0}
          style={{
            cursor: highFlags === 0 ? "default" : "pointer",
            textAlign: "left",
            border: filterByHighFlags ? "2px solid var(--mv-red, #ef4444)" : undefined,
            background: filterByHighFlags ? "var(--mv-red, #ef4444)15" : undefined,
            outline: "none",
            font: "inherit",
          }}
          title={highFlags === 0 ? "No high-priority flags" : filterByHighFlags ? "Click to clear filter" : "Click to filter the table to authors with high-priority flags"}
        >
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--red" />
            High-priority flags
            {filterByHighFlags && (
              <span style={{
                marginLeft: 6, padding: "1px 6px", borderRadius: 999,
                fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
                background: "var(--mv-red, #ef4444)", color: "#fff",
              }}>
                FILTERING
              </span>
            )}
          </div>
          <div className="of-metric__value">{highFlags}</div>
          <div className="of-metric__sub">
            {highFlags === 0
              ? `${data.flags.length} total flags`
              : filterByHighFlags
                ? "Click to clear filter"
                : `${data.flags.length} total · click to filter table`}
          </div>
        </button>
      </div>

      {/* Comparison panel — appears as soon as ≥1 author is selected */}
      {selectedIds.size >= 1 && (
        <div className="of-section" ref={comparisonRef}>
          <AuthorComparisonPanel
            rows={data.rows}
            selectedIds={selectedIds}
            onRemove={handleRemoveFromComparison}
            onClear={() => setSelectedIds(new Set())}
          />
        </div>
      )}

      {/* Main table — primary working surface, kept near the top */}
      <div className="of-section" ref={tableRef}>
        <h2 className="of-section__title">Author Finance Table</h2>
        <p className="of-page__subtitle" style={{ marginBottom: 14 }}>
          Click any row to view full transaction history and contract details.
          Check boxes to compare authors side-by-side.
        </p>

        {filterByHighFlags && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", marginBottom: 12,
            borderRadius: 8, border: "1px solid var(--mv-red, #ef4444)",
            background: "var(--mv-red, #ef4444)15",
          }}>
            <span style={{
              padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: "var(--mv-red, #ef4444)", color: "#fff", letterSpacing: "0.04em",
            }}>
              FILTERED
            </span>
            <span style={{ fontSize: 13, color: "var(--mv-text)" }}>
              Showing <strong>{visibleRows.length}</strong> of {data.rows.length} authors with high-priority flags.
            </span>
            <button
              onClick={clearHighFlagsFilter}
              style={{
                marginLeft: "auto", padding: "4px 12px", borderRadius: 6,
                border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
                color: "var(--mv-text-muted)", fontSize: 12, cursor: "pointer", fontWeight: 600,
              }}
            >
              Clear filter
            </button>
          </div>
        )}

        <FinanceDashboardTable
          rows={visibleRows}
          onSelectRow={handleSelectRow}
          selectedForComparison={selectedIds}
          onToggleComparison={handleToggleComparison}
        />
      </div>

      {/* Flags panel */}
      <div className="of-section">
        <FinanceFlagsPanel
          flags={data.flags}
          unmatchedEntities={data.unmatchedEntities}
          onAuthorClick={handleFlagAuthorClick}
        />
      </div>

      {/* Strategic Insights — the deeper "what should we do" cards, last on the page */}
      <div className="of-section">
        <h2 className="of-section__title">Strategic Insights</h2>
        <p className="of-page__subtitle" style={{ marginBottom: 14 }}>
          Top-of-mind questions for the COO and Head of Author Relations — click any name to drill in.
        </p>
        <StrategicInsightsPanel
          insights={data.insights}
          onAuthorClick={handleFlagAuthorClick}
        />
      </div>

      {/* Per-author drawer */}
      <AuthorFinanceDrawer
        row={drawerRow}
        onClose={() => setDrawerRow(null)}
      />
    </main>
  );
}
