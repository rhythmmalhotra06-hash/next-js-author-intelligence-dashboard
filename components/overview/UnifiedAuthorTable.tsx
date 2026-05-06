"use client";

import Link from "next/link";
import type { UnifiedAuthorProfile, SortKey, SortDirection } from "@/types/speaking";
import { MASTERY_LABELS, MASTERY_COLORS } from "@/types/speaking";

interface Props {
  authors: UnifiedAuthorProfile[];
  sortKey: SortKey;
  sortDir: SortDirection;
  onSort: (key: SortKey) => void;
  onCostClick?: (author: UnifiedAuthorProfile) => void;
}

function pct(val: number | null): string {
  if (val === null) return "—";
  return `${(Math.min(val, 1) * 100).toFixed(0)}%`;
}

function fmt(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2);
}

function currency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(val);
}

export function UnifiedAuthorTable({ authors, sortKey, sortDir, onSort, onCostClick }: Props) {
  if (authors.length === 0) {
    return (
      <div className="of-table-container">
        <div className="of-empty" style={{ padding: "48px 24px" }}>
          <div className="of-empty__art">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mv-text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="of-empty__title">No authors match</p>
          <p className="of-empty__sub">Try clearing some filters or broadening your search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="of-table-container">
      <table className="of-table">
        <thead>
          <tr>
            <th onClick={() => onSort("authorName")} style={{ cursor: "pointer" }}>
              Author {sortKey === "authorName" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th>Masteries</th>
            <th onClick={() => onSort("overallRewatchRate")} style={{ cursor: "pointer", textAlign: "right" }}>
              Rewatch Rate {sortKey === "overallRewatchRate" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("overallAvgRating")} style={{ cursor: "pointer", textAlign: "right" }}>
              Avg Rating {sortKey === "overallAvgRating" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("ratingConsistency")} style={{ cursor: "pointer", textAlign: "right" }}>
              Consistency {sortKey === "ratingConsistency" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("totalCost2026")} style={{ cursor: "pointer", textAlign: "right" }}>
              2026 Fees {sortKey === "totalCost2026" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr
              key={author.normalisedKey}
              className={
                author.divergenceDirection
                  ? "of-table__row--diverge"
                  : author.overallRatingFloor
                  ? "of-table__row--flagged"
                  : ""
              }
            >
              <td>
                <Link href={`/author/${encodeURIComponent(author.normalisedKey)}`} style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
                  {author.authorName}
                </Link>
                {author.overallRatingFloor && (
                  <span className="mv-badge mv-badge--red" style={{ marginLeft: 8, fontSize: 10 }}>Floor</span>
                )}
                {author.divergenceDirection && (
                  <span className="mv-badge mv-badge--orange" style={{ marginLeft: 4, fontSize: 10 }}>Divergence</span>
                )}
              </td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  {author.masteries.map(m => (
                    <span key={m} className={`mv-badge ${MASTERY_COLORS[m]}`} title={MASTERY_LABELS[m]}>
                      {MASTERY_LABELS[m].split(" ")[0]}
                    </span>
                  ))}
                </div>
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span>{pct(author.overallRewatchRate)}</span>
                  {author.overallRewatchRate !== null && (
                    <div style={{ width: 48, height: 3, borderRadius: 2, background: "var(--mv-border)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 2,
                        width: `${Math.min(100, (author.overallRewatchRate / 0.5) * 100)}%`,
                        background: author.overallRewatchRate >= 0.5 ? "var(--mv-green)" : "var(--mv-orange)",
                      }} />
                    </div>
                  )}
                </div>
              </td>
              <td style={{ textAlign: "right" }}>{fmt(author.overallAvgRating)}</td>
              <td style={{ textAlign: "right", color: author.ratingConsistency && author.ratingConsistency > 0.5 ? "var(--mv-red)" : "inherit" }}>
                {author.ratingConsistency ? `±${author.ratingConsistency.toFixed(2)}` : "—"}
              </td>
              <td style={{ textAlign: "right" }}>
                {author.finance && onCostClick ? (
                  <button
                    type="button"
                    className="of-cost-cell"
                    onClick={() => onCostClick(author)}
                    title="View invoice breakdown"
                  >
                    {currency(author.totalCost2026)}
                  </button>
                ) : (
                  currency(author.totalCost2026)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}