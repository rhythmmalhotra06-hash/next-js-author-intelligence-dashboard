"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CurriculumFitSlot } from "@/types/speaking";
import { normaliseName } from "@/lib/signals";
import { Tooltip } from "@/components/ui/Tooltip";

interface Props { slots: CurriculumFitSlot[]; }

type SortCol = "module" | "title" | "att2025" | "att2026" | "delta" | "rating" | "rewatch";

function pct(val: number | null): string {
  if (val === null) return "—";
  return `${(Math.min(val, 1) * 100).toFixed(0)}%`;
}

function fmt(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2);
}

const SELECT_STYLE: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px", borderRadius: 6,
  border: "1px solid var(--mv-border)", background: "var(--mv-surface)",
  color: "var(--mv-text)", cursor: "pointer",
};

export function MasteryDrillDownTable({ slots }: Props) {
  const [sortCol, setSortCol] = useState<SortCol>("module");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = useMemo(() => {
    const vals = [...new Set(slots.map(s => s.module).filter(Boolean) as string[])].sort();
    return vals;
  }, [slots]);

  const grouped = useMemo(() => {
    const filtered = moduleFilter === "all" ? slots : slots.filter(s => s.module === moduleFilter);

    const map = new Map<string, { title: string; module: string | null; slots: CurriculumFitSlot[] }>();
    for (const slot of filtered) {
      if (!map.has(slot.lessonTitle)) {
        map.set(slot.lessonTitle, { title: slot.lessonTitle, module: slot.module, slots: [] });
      }
      map.get(slot.lessonTitle)!.slots.push(slot);
    }

    const rows = Array.from(map.values())
      .map(g => {
        const s2025 = g.slots.find(s => s.yearCohort === "2025");
        const s2026 = g.slots.find(s => s.yearCohort === "2026");
        const delta = s2026?.attendanceRate != null && s2025?.attendanceRate != null
          ? s2026.attendanceRate - s2025.attendanceRate
          : null;
        return { ...g, s2025, s2026, delta };
      })
      // Only show lessons that have year-cohort data — rows where both are undefined
      // mean the yearCohort field is not populated in Airtable for those records.
      .filter(r => r.s2025 !== undefined || r.s2026 !== undefined);

    return rows.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortCol) {
        case "module":  av = a.module ?? ""; bv = b.module ?? ""; break;
        case "title":   av = a.title; bv = b.title; break;
        case "att2025": av = a.s2025?.attendanceRate ?? -Infinity; bv = b.s2025?.attendanceRate ?? -Infinity; break;
        case "att2026": av = a.s2026?.attendanceRate ?? -Infinity; bv = b.s2026?.attendanceRate ?? -Infinity; break;
        case "delta":   av = a.delta ?? -Infinity; bv = b.delta ?? -Infinity; break;
        case "rating":  av = a.s2026?.avgRating ?? -Infinity; bv = b.s2026?.avgRating ?? -Infinity; break;
        case "rewatch": av = a.s2026?.rewatchRate ?? -Infinity; bv = b.s2026?.rewatchRate ?? -Infinity; break;
        default:        av = 0; bv = 0;
      }
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [slots, sortCol, sortDir, moduleFilter]);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir(col === "module" || col === "title" ? "asc" : "desc"); }
  }

  function sortArrow(col: SortCol) {
    return (
      <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.2, fontSize: 10 }}>
        {sortCol === col && sortDir === "desc" ? "↓" : "↑"}
      </span>
    );
  }

  const thStyle: React.CSSProperties = { cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };

  if (grouped.length === 0) {
    return (
      <div>
        <p style={{ fontSize: 12, color: "var(--mv-text-subtle)", marginBottom: 12 }}>
          Year-over-year comparison per curriculum slot. Only lessons with a 2025 or 2026 cohort year appear here.
        </p>
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--mv-text-subtle)", fontSize: 13 }}>
          No lessons with 2025 or 2026 cohort data found
          {moduleFilter !== "all" && " — try clearing the module filter"}.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "var(--mv-text-subtle)", margin: 0, maxWidth: 560 }}>
          Year-over-year comparison per curriculum slot. A positive Att. Δ (green) means the 2026 cohort engaged more than 2025 — use this to identify which lessons improved and which declined.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {modules.length > 1 && (
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={SELECT_STYLE}>
              <option value="all">All modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          <span style={{ fontSize: 12, color: "var(--mv-text-subtle)" }}>{grouped.length} lessons</span>
        </div>
      </div>
      <div className="of-table-container">
        <table className="of-table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort("module")}>
                Module {sortArrow("module")}
              </th>
              <th style={thStyle} onClick={() => toggleSort("title")}>
                Lesson Title {sortArrow("title")}
              </th>
              <th style={{ textAlign: "center" }}>2025 Authors</th>
              <th style={{ textAlign: "right", ...thStyle }} onClick={() => toggleSort("att2025")}>
                2025 Att. {sortArrow("att2025")}
                <Tooltip text="Attendees ÷ Enrolled for the 2025 cohort" />
              </th>
              <th style={{ textAlign: "center" }}>2026 Authors</th>
              <th style={{ textAlign: "right", ...thStyle }} onClick={() => toggleSort("att2026")}>
                2026 Att. {sortArrow("att2026")}
                <Tooltip text="Attendees ÷ Enrolled for the 2026 cohort" />
              </th>
              <th style={{ textAlign: "right", ...thStyle }} onClick={() => toggleSort("delta")}>
                Att. Δ {sortArrow("delta")}
                <Tooltip text="Change in attendance rate between 2025 and 2026. Green = improved, red = declined." />
              </th>
              <th style={{ textAlign: "right", ...thStyle }} onClick={() => toggleSort("rating")}>
                2026 Avg Rating {sortArrow("rating")}
                <Tooltip text="Average student rating for the 2026 cohort session." />
              </th>
              <th style={{ textAlign: "right", ...thStyle }} onClick={() => toggleSort("rewatch")}>
                2026 Rewatch {sortArrow("rewatch")}
                <Tooltip text="Share of students who rewatched the session in 2026." />
              </th>
              <th>
                Goal Alignment
                <Tooltip text="AI-assessed alignment between session content and students' onboarding goals. Scored 0–100." />
              </th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ title, module, s2025, s2026, delta }) => (
              <tr key={title}>
                <td className="of-table__muted">{module || "—"}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{title}</div>
                </td>
                <td style={{ textAlign: "center" }}>
                  {s2025?.speakerNames.map(name => (
                    <Link key={name} href={`/author/${encodeURIComponent(normaliseName(name))}`}
                      className="of-badge of-badge--clickable" style={{ marginRight: 4 }}>
                      {name}
                    </Link>
                  ))}
                </td>
                <td style={{ textAlign: "right" }}>{pct(s2025?.attendanceRate ?? null)}</td>
                <td style={{ textAlign: "center" }}>
                  {s2026?.speakerNames.map(name => (
                    <Link key={name} href={`/author/${encodeURIComponent(normaliseName(name))}`}
                      className="of-badge of-badge--clickable" style={{ marginRight: 4 }}>
                      {name}
                    </Link>
                  ))}
                </td>
                <td style={{ textAlign: "right" }}>{pct(s2026?.attendanceRate ?? null)}</td>
                <td style={{
                  textAlign: "right",
                  color: delta && delta > 0 ? "var(--mv-green)" : delta && delta < 0 ? "var(--mv-red)" : "inherit",
                }}>
                  {delta !== null ? (delta > 0 ? "+" : "") + (delta * 100).toFixed(0) + "%" : "—"}
                </td>
                <td style={{ textAlign: "right" }}>{fmt(s2026?.avgRating ?? null)}</td>
                <td style={{ textAlign: "right" }}>{pct(s2026?.rewatchRate ?? null)}</td>
                <td>
                  {(() => {
                    const ai = s2026?.aiGoalAlignment ?? s2025?.aiGoalAlignment;
                    if (!ai) return <span className="of-table__muted">—</span>;
                    return (
                      <span className="of-ai-badge" title={`Alignment score ${ai.score}/100`}>
                        {ai.deltaLabel}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
