"use client";
import { useState, useMemo } from "react";
import type { LessonRecord } from "@/types/speaking";
import { Tooltip } from "@/components/ui/Tooltip";

type SortCol = "lessonTitle" | "speaker" | "type" | "yearCohort" | "attendees" | "enrolled" | "avgRating" | "recViews1w";

function fmt(val: number | null, decimals = 0): string {
  if (val === null) return "—";
  return val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtRating(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(1);
}

function getSortVal(l: LessonRecord, col: SortCol): number | string {
  switch (col) {
    case "lessonTitle":  return l.lessonTitle;
    case "speaker":      return l.speakerNames.join(", ");
    case "type":         return l.type ?? "";
    case "yearCohort":   return l.yearCohort ?? "";
    case "attendees":    return l.attendees ?? -Infinity;
    case "enrolled":     return l.enrolled ?? -Infinity;
    case "avgRating":    return l.avgRating ?? -Infinity;
    case "recViews1w":   return l.recViews1w ?? -Infinity;
  }
}

const SELECT_STYLE: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px", borderRadius: 6,
  border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
  color: "var(--mv-text)", cursor: "pointer",
};

export function LessonsTable({ lessons }: { lessons: LessonRecord[] }) {
  const [sortCol, setSortCol] = useState<SortCol>("avgRating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const years = useMemo(() => [...new Set(lessons.map(l => l.yearCohort).filter(Boolean) as string[])].sort(), [lessons]);
  const types = useMemo(() => [...new Set(lessons.map(l => l.type).filter(Boolean) as string[])].sort(), [lessons]);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir(col === "lessonTitle" || col === "speaker" ? "asc" : "desc"); }
  }

  function sortArrow(col: SortCol) {
    return (
      <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.2, fontSize: 10 }}>
        {sortCol === col && sortDir === "desc" ? "↓" : "↑"}
      </span>
    );
  }

  const filtered = useMemo(() => {
    let rows = [...lessons];
    if (yearFilter !== "all") rows = rows.filter(l => l.yearCohort === yearFilter);
    if (typeFilter !== "all") rows = rows.filter(l => l.type === typeFilter);
    return rows.sort((a, b) => {
      const av = getSortVal(a, sortCol);
      const bv = getSortVal(b, sortCol);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [lessons, sortCol, sortDir, yearFilter, typeFilter]);

  if (lessons.length === 0) {
    return (
      <div className="of-table-wrap">
        <div className="of-table-wrap__header">
          <span className="of-table-wrap__title">All lessons</span>
        </div>
        <div className="of-empty">
          <div className="of-empty__art" />
          <p className="of-empty__title">No lessons found</p>
          <p className="of-empty__sub">Check your Airtable connection and AIRTABLE_PAT environment variable.</p>
        </div>
      </div>
    );
  }

  const thStyle: React.CSSProperties = { cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  return (
    <div className="of-table-wrap">
      <div className="of-table-wrap__header">
        <div>
          <div className="of-table-wrap__title">All lessons</div>
          <p style={{ fontSize: 12, color: "var(--mv-text-subtle)", marginTop: 4, marginBottom: 0, maxWidth: 560 }}>
            Raw lesson records from Airtable. Use year and type filters to narrow down. Click any column header to sort.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="of-table-wrap__count">{filtered.length} of {lessons.length}</span>
          {years.length > 1 && (
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={SELECT_STYLE}>
              <option value="all">All years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {types.length > 1 && (
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={SELECT_STYLE}>
              <option value="all">All types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="of-table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort("lessonTitle")}>
                Lesson title {sortArrow("lessonTitle")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("speaker")}>
                Speaker {sortArrow("speaker")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("type")}>
                Type {sortArrow("type")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("yearCohort")}>
                Year {sortArrow("yearCohort")}
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("attendees")}>
                Attendees {sortArrow("attendees")}
                <Tooltip text="Number of enrolled students who attended this session." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("enrolled")}>
                Enrolled {sortArrow("enrolled")}
                <Tooltip text="Total students enrolled in the cohort at the time of this session." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("avgRating")}>
                Avg rating {sortArrow("avgRating")}
                <Tooltip text="Average student rating for this session. Red = below 4.0, green = 4.0 and above." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("recViews1w")}>
                Rec views (1w) {sortArrow("recViews1w")}
                <Tooltip text="Recorded views within the first week after the session — an early signal of content engagement." />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ maxWidth: 320 }}>
                  <span style={{ fontWeight: "var(--mv-weight-medium)" as string }}>{l.lessonTitle}</span>
                  {l.module && (
                    <div className="of-table__muted" style={{ fontSize: 12, marginTop: 2 }}>{l.module}</div>
                  )}
                </td>
                <td>{l.speakerNames.join(", ") || <span className="of-table__muted">—</span>}</td>
                <td>
                  {l.type ? <span className="mv-badge">{l.type}</span> : <span className="of-table__muted">—</span>}
                </td>
                <td className="of-table__muted">{l.yearCohort ?? "—"}</td>
                <td className="of-table__amount">{fmt(l.attendees)}</td>
                <td className="of-table__amount">{fmt(l.enrolled)}</td>
                <td className="of-table__amount">
                  {l.avgRating !== null ? (
                    <span style={{
                      color: l.avgRating < 4.0 ? "var(--mv-red-content)" : "var(--mv-green-content)",
                      fontWeight: "var(--mv-weight-medium)" as string,
                    }}>
                      {fmtRating(l.avgRating)}
                    </span>
                  ) : <span className="of-table__muted">—</span>}
                </td>
                <td className="of-table__amount">{fmt(l.recViews1w)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
