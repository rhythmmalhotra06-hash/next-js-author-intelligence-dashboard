"use client";

import { useState } from "react";
import type { ScheduleRecord } from "@/types/speaking";

interface Props {
  schedule: ScheduleRecord[];
}

function fmtRating(value: number | null): string {
  return value !== null ? value.toFixed(2) : "—";
}

function fmtPct(value: number | null): string {
  return value !== null ? `${(Math.min(value, 1) * 100).toFixed(0)}%` : "—";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function FeedbackCell({ texts }: { texts: string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (texts.length === 0) return <span style={{ color: "var(--of-text-muted)" }}>—</span>;

  const preview = texts[0].length > 80 ? texts[0].slice(0, 80) + "…" : texts[0];

  return (
    <div>
      {expanded ? (
        <div>
          {texts.map((t, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: 12, lineHeight: 1.5 }}>
              {t}
            </p>
          ))}
          <button
            onClick={() => setExpanded(false)}
            style={{
              fontSize: 11,
              color: "var(--of-purple, #7a12d4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Collapse
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <span style={{ fontSize: 12, color: "var(--of-text-secondary)" }}>{preview}</span>
          {texts.length > 0 && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                fontSize: 11,
                color: "var(--of-purple, #7a12d4)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              +{texts.length} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ScheduleTable({ schedule }: Props) {
  const sorted = [...schedule].sort((a, b) => {
    // Sort by order string numerically where possible
    const aNum = parseInt(a.order ?? "9999");
    const bNum = parseInt(b.order ?? "9999");
    return aNum - bNum;
  });

  return (
    <div className="of-table-wrapper">
      <table className="of-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Speaker</th>
            <th>Date</th>
            <th>Cohort</th>
            <th style={{ textAlign: "right" }}>AVR Rating</th>
            <th style={{ textAlign: "right" }}>Responses</th>
            <th style={{ textAlign: "right" }}>Attendees</th>
            <th style={{ textAlign: "right" }}>Enrolled</th>
            <th style={{ textAlign: "right" }}>Attend %</th>
            <th style={{ textAlign: "right" }}>Rec 1w</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const attendanceRate =
              row.enrolled && row.enrolled > 0 && row.attendees !== null
                ? row.attendees / row.enrolled
                : null;
            const hasRating = row.avrRating !== null;

            return (
              <tr key={row.id}>
                <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--of-text-muted)", fontSize: 12 }}>
                  {row.order ?? "—"}
                </td>
                <td style={{ fontWeight: 500 }}>
                  {row.speakerNames.length > 0 ? row.speakerNames.join(", ") : "—"}
                </td>
                <td style={{ fontSize: 12, color: "var(--of-text-secondary)", whiteSpace: "nowrap" }}>
                  {fmtDate(row.dateTime)}
                </td>
                <td style={{ fontSize: 12, color: "var(--of-text-muted)" }}>
                  {row.yearCohort ?? "—"}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {hasRating ? (
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          (row.avrRating ?? 0) >= 9
                            ? "var(--of-green, #1a7a3c)"
                            : (row.avrRating ?? 0) >= 7
                            ? "var(--of-text-primary)"
                            : "var(--of-orange, #b45309)",
                      }}
                    >
                      {fmtRating(row.avrRating)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--of-text-muted)" }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: "right", color: "var(--of-text-muted)", fontSize: 12 }}>
                  {row.countRatings ?? "—"}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {row.attendees ?? "—"}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {row.enrolled ?? "—"}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {fmtPct(attendanceRate)}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {row.recViews1w ?? "—"}
                </td>
                <td style={{ maxWidth: 280 }}>
                  <FeedbackCell texts={row.feedbackRollup} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
