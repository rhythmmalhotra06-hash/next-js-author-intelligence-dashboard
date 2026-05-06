"use client";
import { useState, useMemo } from "react";
import type { CurriculumFitSlot } from "@/types/speaking";
import { Tooltip } from "@/components/ui/Tooltip";

type SortCol = "lessonTitle" | "speaker" | "module" | "yearCohort" | "type" | "attendees" | "enrolled" | "attendanceRate";

function pct(val: number | null): string {
  if (val === null) return "—";
  return (Math.min(val, 1) * 100).toFixed(1) + "%";
}

function fmt(val: number | null): string {
  if (val === null) return "—";
  return val.toLocaleString("en-US");
}

function attendanceColor(rate: number | null): string {
  if (rate === null) return "var(--mv-text-subtle)";
  if (rate < 0.5)  return "var(--mv-red-content)";
  if (rate < 0.75) return "var(--mv-orange-content)";
  return "var(--mv-green-content)";
}

function getSortVal(s: CurriculumFitSlot, col: SortCol): number | string {
  switch (col) {
    case "lessonTitle":    return s.lessonTitle;
    case "speaker":        return s.speakerNames.join(", ");
    case "module":         return s.module ?? "";
    case "yearCohort":     return s.yearCohort ?? "";
    case "type":           return s.type ?? "";
    case "attendees":      return s.attendees ?? -Infinity;
    case "enrolled":       return s.enrolled ?? -Infinity;
    case "attendanceRate": return s.attendanceRate ?? -Infinity;
  }
}

const SELECT_STYLE: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px", borderRadius: 6,
  border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
  color: "var(--mv-text)", cursor: "pointer",
};

export function CurriculumFitTable({ slots }: { slots: CurriculumFitSlot[] }) {
  const [sortCol, setSortCol] = useState<SortCol>("attendanceRate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const years = useMemo(() => {
    const vals = [...new Set(slots.map(s => s.yearCohort).filter(Boolean) as string[])].sort();
    return vals;
  }, [slots]);

  const types = useMemo(() => {
    const vals = [...new Set(slots.map(s => s.type).filter(Boolean) as string[])].sort();
    return vals;
  }, [slots]);

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

  const filtered = useMemo(() => {
    let rows = [...slots];
    if (yearFilter !== "all") rows = rows.filter(s => s.yearCohort === yearFilter);
    if (typeFilter !== "all") rows = rows.filter(s => s.type === typeFilter);
    return rows.sort((a, b) => {
      const av = getSortVal(a, sortCol);
      const bv = getSortVal(b, sortCol);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [slots, sortCol, sortDir, yearFilter, typeFilter]);

  if (slots.length === 0) {
    return (
      <div className="of-table-wrap">
        <div className="of-table-wrap__header">
          <span className="of-table-wrap__title">Curriculum fit</span>
        </div>
        <div className="of-empty">
          <div className="of-empty__art" />
          <p className="of-empty__title">No curriculum slots found</p>
          <p className="of-empty__sub">No lessons data available.</p>
        </div>
      </div>
    );
  }

  const thStyle: React.CSSProperties = { cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  return (
    <div className="of-table-wrap">
      <div className="of-table-wrap__header">
        <div>
          <div className="of-table-wrap__title">Curriculum fit</div>
          <p style={{ fontSize: 12, color: "var(--mv-text-subtle)", marginTop: 4, marginBottom: 0, maxWidth: 560 }}>
            Each row is one author delivering one lesson in one cohort year. Attendance rate = attendees ÷ enrolled.
            Green ≥ 75%, orange 50–74%, red &lt; 50% — low rates may signal content misalignment or scheduling issues.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="of-table-wrap__count">{filtered.length} of {slots.length} slots</span>
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
                Lesson {sortArrow("lessonTitle")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("speaker")}>
                Speaker {sortArrow("speaker")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("module")}>
                Module {sortArrow("module")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("yearCohort")}>
                Year {sortArrow("yearCohort")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("type")}>
                Type {sortArrow("type")}
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("attendees")}>
                Attendees {sortArrow("attendees")}
                <Tooltip text="Number of enrolled students who attended this session." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("enrolled")}>
                Enrolled {sortArrow("enrolled")}
                <Tooltip text="Total students enrolled in this cohort at the time of the session." />
              </th>
              <th className="of-table__amount" style={thStyle} onClick={() => toggleSort("attendanceRate")}>
                Attendance rate {sortArrow("attendanceRate")}
                <Tooltip text="Attendees ÷ Enrolled. Green ≥ 75%, orange 50–74%, red < 50%." />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.lessonId}>
                <td style={{ maxWidth: 280 }}>
                  <span style={{ fontWeight: "var(--mv-weight-medium)" as string }}>{s.lessonTitle}</span>
                </td>
                <td className="of-table__muted">{s.speakerNames.join(", ") || "—"}</td>
                <td className="of-table__muted">{s.module ?? "—"}</td>
                <td className="of-table__muted">{s.yearCohort ?? "—"}</td>
                <td>
                  {s.type ? (
                    <span className="mv-badge">{s.type}</span>
                  ) : (
                    <span className="of-table__muted">—</span>
                  )}
                </td>
                <td className="of-table__amount">{fmt(s.attendees)}</td>
                <td className="of-table__amount">{fmt(s.enrolled)}</td>
                <td className="of-table__amount">
                  <span style={{ color: attendanceColor(s.attendanceRate), fontWeight: "var(--mv-weight-medium)" as string }}>
                    {pct(s.attendanceRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
