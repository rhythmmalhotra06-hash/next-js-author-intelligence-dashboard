"use client";

import { useRouter } from "next/navigation";
import type { UnifiedAuthorProfile } from "@/types/speaking";
import { MASTERY_LABELS, MASTERY_COLORS } from "@/types/speaking";

interface Props {
  author: UnifiedAuthorProfile;
}

const DIVERGENCE_LABEL: Record<NonNullable<UnifiedAuthorProfile["divergenceDirection"]>, string> = {
  "high-craft-low-fit": "High craft · Low fit",
  "low-craft-high-fit": "Low craft · High fit",
};

const TRAJECTORY_LABEL: Record<NonNullable<UnifiedAuthorProfile["cohortTrajectory"]>, string> = {
  up: "Rewatch ↑ 2026 vs 2025",
  down: "Rewatch ↓ 2026 vs 2025",
  flat: "Rewatch flat 2026 vs 2025",
};

function pct(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return `${(Math.min(val, 1) * 100).toFixed(0)}%`;
}

function fmt(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2);
}

function currency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

// ---------------------------------------------------------------------------
// Business signal computation
// ---------------------------------------------------------------------------

interface BusinessSignal {
  label: string;
  detail: string;
  variant: "green" | "orange" | "red" | "blue" | "purple";
}

function computeBusinessSignals(author: UnifiedAuthorProfile, totalSessions: number): BusinessSignal[] {
  const signals: BusinessSignal[] = [];

  // Performance concerns first — these are action items
  if (author.overallRatingFloor) {
    const flooredCount = author.perMastery.filter(p => p.ratingFloorFlag).length;
    signals.push({
      label: "Performance Review Required",
      detail: `Avg rating dropped below 4.0 in ${flooredCount} mastery${flooredCount !== 1 ? " programs" : ""}. Schedule a coaching conversation before the next cohort.`,
      variant: "red",
    });
  }

  // ROI concern: high cost + low rating
  if (author.finance?.costPerSession2026 && author.finance.costPerSession2026 > 0 &&
      author.overallAvgRating !== null && author.overallAvgRating < 4.2) {
    signals.push({
      label: "ROI Concern",
      detail: `${currency(author.finance.costPerSession2026)}/session with a ${author.overallAvgRating.toFixed(2)} avg rating. Consider renegotiating the fee or replacing for future cohorts.`,
      variant: "red",
    });
  }

  // Inconsistency across programs
  if (author.ratingConsistency !== null && author.ratingConsistency > 0.3 && author.crossProgramCount >= 2) {
    const weakest = [...author.perMastery]
      .filter(p => p.avgRating !== null)
      .sort((a, b) => (a.avgRating ?? 5) - (b.avgRating ?? 5))[0];
    signals.push({
      label: "Quality Inconsistency",
      detail: `±${author.ratingConsistency.toFixed(2)} std dev across programs — quality varies significantly. Weakest: ${MASTERY_LABELS[weakest?.masteryKey]} (${fmt(weakest?.avgRating ?? null)}).`,
      variant: "orange",
    });
  }

  // Top performer
  if (author.overallAvgRating !== null && author.overallAvgRating >= 4.7 && !author.overallRatingFloor) {
    signals.push({
      label: "Top Performer",
      detail: `${author.overallAvgRating.toFixed(2)} avg rating across ${totalSessions} session${totalSessions !== 1 ? "s" : ""} — in the top tier for audience satisfaction.`,
      variant: "green",
    });
  }

  // Strong rewatch
  if (author.overallRewatchRate !== null && author.overallRewatchRate >= 0.4) {
    signals.push({
      label: "High Re-engagement",
      detail: `${pct(author.overallRewatchRate)} rewatch rate — students are actively returning to this content within a week. Strong content stickiness signal.`,
      variant: "green",
    });
  }

  // Expansion candidate: high rating but only one program
  if (author.overallAvgRating !== null && author.overallAvgRating >= 4.5 && author.crossProgramCount === 1) {
    signals.push({
      label: "Expansion Candidate",
      detail: `Excellent rating in a single mastery — strong candidate for cross-program expansion. Low risk, high potential.`,
      variant: "blue",
    });
  }

  // Franchise anchor: teaching across 3+ programs
  if (author.crossProgramCount >= 3) {
    signals.push({
      label: "Franchise Anchor",
      detail: `Teaching across ${author.crossProgramCount} masteries makes this author operationally critical. Prioritise retention and long-term contracting.`,
      variant: "purple",
    });
  }

  // High transformation impact from AI analysis
  if (author.aiAnalyzed && author.transformationRate !== null && author.transformationRate !== undefined && author.transformationRate >= 0.6) {
    signals.push({
      label: "High Transformation Impact",
      detail: `${pct(author.transformationRate)} of student feedback uses transformation language ("I applied", "This changed how I…") — top-quartile impact signal.`,
      variant: "purple",
    });
  }

  return signals;
}

const SIGNAL_VARIANT_CLASS: Record<BusinessSignal["variant"], string> = {
  green:  "mv-badge--green",
  orange: "mv-badge--orange",
  red:    "mv-badge--red",
  blue:   "mv-badge--blue",
  purple: "mv-badge--purple",
};

const SIGNAL_BORDER: Record<BusinessSignal["variant"], string> = {
  green:  "var(--mv-green)",
  orange: "var(--mv-orange)",
  red:    "var(--mv-red)",
  blue:   "var(--mv-blue)",
  purple: "var(--mv-brand)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthorProfileView({ author }: Props) {
  const router = useRouter();
  const totalSessions = author.perMastery.reduce((acc, p) => acc + p.sessionCount, 0);
  const hasRewatch = author.overallRewatchRate !== null;
  const businessSignals = computeBusinessSignals(author, totalSessions);

  return (
    <div className="of-section">
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <button
            onClick={() => router.back()}
            style={{
              background: "none", border: "1px solid var(--mv-border)", borderRadius: 6,
              color: "var(--mv-text-muted)", fontSize: 12, cursor: "pointer",
              padding: "4px 10px", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 4,
              transition: "all 120ms ease",
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{author.authorName}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {author.masteries.map(m => (
              <span key={m} className={`mv-badge ${MASTERY_COLORS[m]}`}>{MASTERY_LABELS[m]}</span>
            ))}
            {author.divergenceDirection && (
              <span className="mv-badge mv-badge--orange" title="Craft and fit signals diverge">
                {DIVERGENCE_LABEL[author.divergenceDirection]}
              </span>
            )}
            {author.cohortTrajectory && (
              <span
                className={`of-metric__trend of-metric__trend--${author.cohortTrajectory}`}
                title="Cohort-over-cohort rewatch trajectory"
              >
                {TRAJECTORY_LABEL[author.cohortTrajectory]}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="of-table__muted">Cross-Program Count</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{author.crossProgramCount}</div>
        </div>
      </div>

      {/* ── Business signals ────────────────────────────────── */}
      {businessSignals.length > 0 && (
        <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 10 }}>
          {businessSignals.map(signal => (
            <div
              key={signal.label}
              className="of-card"
              style={{ padding: "12px 16px", borderLeft: `3px solid ${SIGNAL_BORDER[signal.variant]}`, display: "flex", alignItems: "baseline", gap: 12 }}
            >
              <span className={`mv-badge ${SIGNAL_VARIANT_CLASS[signal.variant]}`} style={{ flexShrink: 0 }}>
                {signal.label}
              </span>
              <span style={{ fontSize: 13, color: "var(--mv-text-muted)", lineHeight: 1.5 }}>{signal.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Primary metric cards ─────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${hasRewatch ? 4 : 3}, 1fr)`,
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div
          className="of-card"
          style={{ padding: 16, cursor: "help" }}
          title="Average of all per-session student ratings across every mastery this author has taught. Sessions with fewer than 3 ratings are excluded. A rating floor is triggered when the average drops below 4.0 in any single mastery — this flags the author for a performance review."
        >
          <div className="of-table__muted" style={{ marginBottom: 4 }}>Avg Rating ⓘ</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>
            {fmt(author.overallAvgRating)}
            {author.overallRatingFloor && (
              <span
                className="mv-badge mv-badge--red"
                style={{ marginLeft: 8, fontSize: 11 }}
                title="At least one mastery program has an avg rating below 4.0. This is a performance tripwire — the author is flagged for a coaching or replacement review."
              >
                Rating Floor
              </span>
            )}
          </div>
        </div>

        {hasRewatch && (
          <div
            className="of-card"
            style={{ padding: 16, cursor: "help" }}
            title="Share of enrolled students who voluntarily replayed at least one session within 7 days of first watching it. Averaged across all masteries. A strong proxy for content quality independent of survey bias — students don't rewatch content they found unengaging."
          >
            <div className="of-table__muted" style={{ marginBottom: 4 }}>Rewatch Rate (1w) ⓘ</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{pct(author.overallRewatchRate)}</div>
          </div>
        )}

        <div
          className="of-card"
          style={{ padding: 16, cursor: "help" }}
          title="Standard deviation of average session ratings across masteries. Only shown for authors in 2+ programs. A low value (±0.1–0.2) means consistent quality everywhere. A high value (±0.3+) means they excel in some programs but underperform in others — check the per-mastery table below to see which."
        >
          <div className="of-table__muted" style={{ marginBottom: 4 }}>Rating Consistency ⓘ</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>
            {author.ratingConsistency ? `±${author.ratingConsistency.toFixed(2)}` : "—"}
          </div>
        </div>

        <div
          className="of-card"
          style={{ padding: 16, cursor: "help" }}
          title="Total distinct teaching sessions delivered across all masteries. Summit sessions are high-stakes live events (e.g. in-person or flagship cohort sessions). Regular sessions are pre-recorded lessons, Q&As, or workshops."
        >
          <div className="of-table__muted" style={{ marginBottom: 4 }}>Total Sessions ⓘ</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{totalSessions}</div>
          <div className="of-table__muted" style={{ marginTop: 4, fontSize: 12 }}>
            of which {author.summitSessionCount} summit
          </div>
        </div>
      </div>

      {/* ── Finance ──────────────────────────────────────────── */}
      {author.finance && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Financial Performance</h2>
          <div className="of-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32, marginBottom: 24 }}>
              <div>
                <div className="of-table__muted">2026 Speaker Fees</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--mv-purple)" }}>{currency(author.finance.speakerFeeTotal2026)}</div>
                <div className="of-table__muted" style={{ marginTop: 4 }}>
                  Cost per Session: {currency(author.finance.costPerSession2026)}
                </div>
              </div>
              <div>
                <div className="of-table__muted">2025 Speaker Fees</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{currency(author.finance.speakerFeeTotal2025)}</div>
                <div className="of-table__muted" style={{ marginTop: 4 }}>
                  Cost per Session: {currency(author.finance.costPerSession2025)}
                </div>
              </div>
            </div>
            <div className="of-table__muted" style={{ fontSize: 11, marginTop: 8 }}>
              Speaker Fees only — Royalties shown in the dedicated Royalties dashboard.
            </div>
          </div>
        </div>
      )}

      {/* ── AI Qualitative Intelligence ──────────────────────── */}
      {author.aiAnalyzed && author.qualitativeIntelligence ? (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Qualitative Intelligence
            <span className="of-ai-badge" style={{ marginLeft: 12, verticalAlign: "middle" }}>AI Analyzed</span>
          </h2>
          <div className="of-ai-card">
            {author.transformationRate !== null && author.transformationRate !== undefined && (
              <div style={{ marginBottom: 16 }}>
                <div className="of-table__muted" style={{ fontSize: 12, marginBottom: 4 }}>
                  Transformation Language Rate (Speaking &amp; Influence)
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--mv-brand-content)" }}>
                  {pct(author.transformationRate)}
                </div>
                <div className="of-table__muted" style={{ fontSize: 11, marginTop: 2 }}>
                  Share of feedback containing &quot;I learned&quot;, &quot;I applied&quot;, etc.
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div className="of-table__muted" style={{ fontSize: 12, marginBottom: 6 }}>Top praise themes</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(author.qualitativeIntelligence.topPraiseThemes ?? []).map(t => (
                    <li key={t} style={{ marginBottom: 4 }}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="of-table__muted" style={{ fontSize: 12, marginBottom: 6 }}>Top criticism themes</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(author.qualitativeIntelligence.topCriticismThemes ?? []).map(t => (
                    <li key={t} style={{ marginBottom: 4 }}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Qualitative Intelligence
            <span className="mv-badge mv-badge--orange" style={{ marginLeft: 12, verticalAlign: "middle", fontSize: 10 }}>
              Analysis Pending
            </span>
          </h2>
          <div className="of-card of-table__muted" style={{ padding: 16, fontSize: 13 }}>
            Not enough feedback data yet to generate AI insights for this author.
          </div>
        </div>
      )}

      {/* ── Per-Mastery Breakdown ────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Per-Mastery Breakdown</h2>
        <div className="of-table-wrap">
          <table className="of-table">
            <thead>
              <tr>
                <th>Mastery</th>
                <th style={{ textAlign: "right" }}>Sessions</th>
                <th style={{ textAlign: "right" }}>Avg Rating</th>
                {hasRewatch && <th style={{ textAlign: "right" }}>Rewatch Rate</th>}
                <th style={{ textAlign: "right" }}>Follow-up Rate</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {author.perMastery.map((pm) => (
                <tr key={pm.masteryKey}>
                  <td>
                    <span className={`mv-badge ${MASTERY_COLORS[pm.masteryKey]}`}>
                      {MASTERY_LABELS[pm.masteryKey]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>{pm.sessionCount}</td>
                  <td style={{ textAlign: "right" }}>{fmt(pm.avgRating)}</td>
                  {hasRewatch && <td style={{ textAlign: "right" }}>{pct(pm.rewatchRate)}</td>}
                  <td style={{ textAlign: "right" }}>{pct(pm.followUpRate)}</td>
                  <td style={{ textAlign: "center" }}>
                    {pm.ratingFloorFlag ? (
                      <span
                        className="mv-badge mv-badge--red"
                        title="Avg rating below 4.0 — flagged for performance review"
                      >
                        Rating Floor
                      </span>
                    ) : (
                      <span className="mv-badge mv-badge--green">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── How metrics are computed ─────────────────────────── */}
      <details className="of-disclosure">
        <summary className="of-disclosure__summary">How metrics are computed</summary>
        <div className="of-disclosure__body">
          <div className="of-disclosure__entry">
            <div className="of-disclosure__entry-name">Avg Rating</div>
            <div className="of-disclosure__entry-formula">mean(per-mastery avg ratings)</div>
            <div className="of-disclosure__entry-why">Each mastery avg is the mean of all lesson ratings in that program. The overall avg weights each mastery equally, not by session count.</div>
          </div>
          {hasRewatch && (
            <div className="of-disclosure__entry">
              <div className="of-disclosure__entry-name">Rewatch Rate (1w)</div>
              <div className="of-disclosure__entry-formula">Rec Views (1 week) ÷ Enrolled · averaged across masteries</div>
              <div className="of-disclosure__entry-why">Share of enrolled students who voluntarily replayed a session within 7 days. Independent of survey bias — students don&apos;t rewatch content they disliked.</div>
            </div>
          )}
          <div className="of-disclosure__entry">
            <div className="of-disclosure__entry-name">Rating Consistency</div>
            <div className="of-disclosure__entry-formula">std_dev(per-mastery avg ratings) · requires ≥2 masteries</div>
            <div className="of-disclosure__entry-why">Low (±0.1–0.2) = consistent quality across programs. High (±0.3+) = strong in some, weak in others.</div>
          </div>
          <div className="of-disclosure__entry">
            <div className="of-disclosure__entry-name">Rating Floor</div>
            <div className="of-disclosure__entry-formula">any per-mastery avg rating &lt; 4.0</div>
            <div className="of-disclosure__entry-why">Business tripwire. When triggered, the author is flagged for a coaching or replacement conversation before the next cohort.</div>
          </div>
          <div className="of-disclosure__entry">
            <div className="of-disclosure__entry-name">Speaker Fee</div>
            <div className="of-disclosure__entry-formula">sum(Actual Transactions where GL = &apos;Speaker fees&apos; AND Product contains &apos;Mastery&apos;)</div>
            <div className="of-disclosure__entry-why">Confirmed invoiced spend — not a projection. Royalties are excluded and tracked separately.</div>
          </div>
        </div>
      </details>
    </div>
  );
}
