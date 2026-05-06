import type { WorkshopFeedbackSummary } from "@/types/speaking";

interface Props {
  summary: WorkshopFeedbackSummary;
  subtitle?: string;
}

function fmt(value: number | null, decimals = 1): string {
  return value !== null ? value.toFixed(decimals) : "—";
}

function ScoreCard({
  label,
  value,
  max,
  decimals = 1,
}: {
  label: string;
  value: number | null;
  max: number;
  decimals?: number;
}) {
  return (
    <div className="of-metric">
      <div className="of-metric__label">{label}</div>
      <div className="of-metric__value">
        {fmt(value, decimals)}
        <span style={{ fontSize: 13, fontWeight: 400, color: "var(--of-text-muted)" }}>
          /{max}
        </span>
      </div>
    </div>
  );
}

export function WorkshopFeedbackPanel({ summary, subtitle }: Props) {
  const {
    responseCount,
    avgNps,
    avgCsat,
    avgExpectationsMet,
    avgBreakoutScore,
    avgConfidenceBefore,
    avgConfidenceAfter,
    confidenceDelta,
  } = summary;

  const deltaSign = confidenceDelta !== null && confidenceDelta > 0 ? "+" : "";
  const deltaBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    marginLeft: 8,
    padding: "1px 7px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    background:
      confidenceDelta === null
        ? "var(--of-surface-2)"
        : confidenceDelta >= 0
        ? "var(--of-green-subtle, #e6f4ea)"
        : "var(--of-red-subtle, #fde8e8)",
    color:
      confidenceDelta === null
        ? "var(--of-text-muted)"
        : confidenceDelta >= 0
        ? "var(--of-green, #1a7a3c)"
        : "var(--of-red, #b91c1c)",
  };

  return (
    <div>
      <p className="of-page__subtitle" style={{ marginBottom: 16 }}>
        {responseCount} responses{subtitle ? ` · ${subtitle}` : ""}
      </p>

      <div className="of-metrics">
        <ScoreCard label="NPS" value={avgNps} max={10} />
        <ScoreCard label="CSAT" value={avgCsat} max={5} />
        <ScoreCard label="Expectations met" value={avgExpectationsMet} max={5} />
        <ScoreCard label="Breakout rooms" value={avgBreakoutScore} max={5} />
      </div>

      {(avgConfidenceBefore !== null || avgConfidenceAfter !== null) && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 8,
            background: "var(--of-surface-1, #f9f9fb)",
            border: "1px solid var(--of-border, #e5e7eb)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--of-text-muted)" }}>
            Confidence (avg, 1–5 scale)
          </span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            {fmt(avgConfidenceBefore)} → {fmt(avgConfidenceAfter)}
          </span>
          {confidenceDelta !== null && (
            <span style={deltaBadgeStyle}>
              {deltaSign}
              {fmt(confidenceDelta)} avg lift
            </span>
          )}
        </div>
      )}
    </div>
  );
}
