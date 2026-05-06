"use client";
import { useState, useMemo } from "react";
import type { AuthorCraftProfile } from "@/types/speaking";
import { Tooltip } from "@/components/ui/Tooltip";

type SortCol = "authorName" | "sessionCount" | "avgRating" | "rewatchRate" | "rewatchLongTail" | "followUpRate" | "feedbackCount";
type FlagFilter = "all" | "ratingFloor" | "highFollowUp";

function pct(val: number | null): string {
  if (val === null) return "—";
  return (Math.min(val, 1) * 100).toFixed(1) + "%";
}

function fmtRating(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2);
}

function fmtLongTail(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2) + "×";
}

function getSortVal(p: AuthorCraftProfile, col: SortCol): number | string {
  switch (col) {
    case "authorName":      return p.authorName;
    case "sessionCount":    return p.sessionCount;
    case "avgRating":       return p.avgRating ?? -Infinity;
    case "rewatchRate":     return p.rewatchRate ?? -Infinity;
    case "rewatchLongTail": return p.rewatchLongTail ?? -Infinity;
    case "followUpRate":    return p.followUpRate ?? -Infinity;
    case "feedbackCount":   return p.feedbackCount;
  }
}

const SELECT_STYLE: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px", borderRadius: 6,
  border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
  color: "var(--mv-text)", cursor: "pointer",
};

export function AuthorCraftTable({ profiles }: { profiles: AuthorCraftProfile[] }) {
  const [sortCol, setSortCol] = useState<SortCol>("avgRating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function sortArrow(col: SortCol) {
    return (
      <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.2, fontSize: 10 }}>
        {sortCol === col && sortDir === "desc" ? "↓" : "↑"}
      </span>
    );
  }

  const sorted = useMemo(() => {
    let rows = [...profiles];
    if (flagFilter === "ratingFloor")  rows = rows.filter(p => p.ratingFloorFlag);
    if (flagFilter === "highFollowUp") rows = rows.filter(p => p.followUpRate !== null && p.followUpRate > 0.2);

    return rows.sort((a, b) => {
      const av = getSortVal(a, sortCol);
      const bv = getSortVal(b, sortCol);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [profiles, sortCol, sortDir, flagFilter]);

  if (profiles.length === 0) {
    return (
      <div className="of-table-wrap">
        <div className="of-table-wrap__header">
          <span className="of-table-wrap__title">Author craft signals</span>
        </div>
        <div className="of-empty">
          <div className="of-empty__art" />
          <p className="of-empty__title">No authors with ≥ 2 sessions</p>
          <p className="of-empty__sub">Author craft profiles require at least 2 sessions of data.</p>
        </div>
      </div>
    );
  }

  const thStyle: React.CSSProperties = { cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  return (
    <div className="of-table-wrap">
      <div className="of-table-wrap__header">
        <div>
          <div className="of-table-wrap__title">Author craft signals</div>
          <p style={{ fontSize: 12, color: "var(--mv-text-subtle)", marginTop: 4, marginBottom: 0, maxWidth: 560 }}>
            Per-author aggregation across all their sessions (≥ 2 required). Use ratings and rewatch signals to spot consistently strong content and authors who need coaching.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="of-table-wrap__count">{sorted.length} of {profiles.length} authors</span>
          <select value={flagFilter} onChange={e => setFlagFilter(e.target.value as FlagFilter)} style={SELECT_STYLE}>
            <option value="all">All authors</option>
            <option value="ratingFloor">Rating floor only</option>
            <option value="highFollowUp">High follow-up only</option>
          </select>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="of-table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort("authorName")}>
                Author {sortArrow("authorName")}
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("sessionCount")}>
                Sessions {sortArrow("sessionCount")}
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("avgRating")}>
                Avg rating {sortArrow("avgRating")}
                <Tooltip text="Average student rating across all sessions. Authors below 4.0 are flagged." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("rewatchRate")}>
                Rewatch rate {sortArrow("rewatchRate")}
                <Tooltip text="Share of students who rewatched the lesson. Higher = stronger content pull." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("rewatchLongTail")}>
                Long-tail {sortArrow("rewatchLongTail")}
                <Tooltip text="Rec Views (4w) ÷ Rec Views (1w). Values above 1.0 mean the content keeps being rewatched beyond the first week — a sign of durable, re-consultable content." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("followUpRate")}>
                Follow-up rate {sortArrow("followUpRate")}
                <Tooltip text="Share of students who submitted a follow-up or support request after the session. Above 20% is flagged as unusually high." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("feedbackCount")}>
                Feedback {sortArrow("feedbackCount")}
                <Tooltip text="Total number of feedback submissions received across all sessions." />
              </th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.authorName} className={p.ratingFloorFlag ? "of-table__row--flagged" : ""}>
                <td>
                  <span style={{ fontWeight: "var(--mv-weight-medium)" as string }}>{p.authorName}</span>
                </td>
                <td className="of-table__amount">{p.sessionCount}</td>
                <td className="of-table__amount">
                  {p.avgRating !== null ? (
                    <span style={{
                      color: p.ratingFloorFlag ? "var(--mv-red-content)" : "var(--mv-text)",
                      fontWeight: p.ratingFloorFlag ? ("var(--mv-weight-medium)" as string) : undefined,
                    }}>
                      {fmtRating(p.avgRating)}
                    </span>
                  ) : <span className="of-table__muted">—</span>}
                </td>
                <td className="of-table__amount">{pct(p.rewatchRate)}</td>
                <td className="of-table__amount">{fmtLongTail(p.rewatchLongTail)}</td>
                <td className="of-table__amount">
                  {p.followUpRate !== null ? (
                    <span style={{ color: p.followUpRate > 0.2 ? "var(--mv-orange-content)" : "var(--mv-text)" }}>
                      {pct(p.followUpRate)}
                    </span>
                  ) : <span className="of-table__muted">—</span>}
                </td>
                <td className="of-table__amount of-table__muted">{p.feedbackCount}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {p.ratingFloorFlag && <span className="mv-badge mv-badge--red">Rating floor</span>}
                    {p.followUpRate !== null && p.followUpRate > 0.2 && (
                      <span className="mv-badge mv-badge--orange">High follow-ups</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
