import type { UnifiedAuthorProfile } from "@/types/speaking";
import { Tooltip } from "@/components/ui/Tooltip";

interface Props {
  authors: UnifiedAuthorProfile[];
  financeMatchRate: number;
}

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  color: "purple" | "green" | "blue" | "orange" | "amber" | "red";
  definition: string;
}

export function SummaryMetrics({ authors, financeMatchRate }: Props) {
  const total = authors.length;

  const withRating = authors.filter(a => a.overallAvgRating !== null);
  const avgRating =
    withRating.length > 0
      ? withRating.reduce((s, a) => s + (a.overallAvgRating ?? 0), 0) / withRating.length
      : null;

  const withRewatch = authors.filter(a => a.overallRewatchRate !== null);
  const avgRewatch =
    withRewatch.length > 0
      ? withRewatch.reduce((s, a) => s + (a.overallRewatchRate ?? 0), 0) / withRewatch.length
      : null;

  const crossProgram = authors.filter(a => a.crossProgramCount >= 2).length;
  const aiAnalyzed = authors.filter(a => a.aiAnalyzed).length;
  const financeMatched = authors.filter(a => a.finance !== undefined).length;

  const cards: MetricCard[] = [
    {
      label: "Authors",
      value: String(total),
      sub: "in current filter",
      color: "purple",
      definition: "Total distinct authors across all selected masteries after applying your active filters.",
    },
    {
      label: "Avg Rating",
      value: avgRating !== null ? avgRating.toFixed(2) : "—",
      sub: `across ${withRating.length} authors`,
      color: "blue",
      definition: "Average of each author's overall rating (itself averaged across their per-mastery sessions). Authors with no rating data are excluded.",
    },
    {
      label: "Avg Rewatch",
      value: avgRewatch !== null ? `${(Math.min(avgRewatch, 1) * 100).toFixed(1)}%` : "—",
      sub: `across ${withRewatch.length} authors`,
      color: "green",
      definition: "Average rewatch rate: the share of students who voluntarily replayed a session. A leading indicator of content quality independent of survey ratings.",
    },
    {
      label: "Cross-Program",
      value: String(crossProgram),
      sub: `of ${total} teach 2+ masteries`,
      color: "amber",
      definition: "Authors who appear in two or more distinct mastery programs — a proxy for versatility and franchise value.",
    },
    {
      label: "Finance Matched",
      value: `${(financeMatchRate * 100).toFixed(0)}%`,
      sub: `${financeMatched} authors linked`,
      color: financeMatchRate > 0.8 ? "green" : "orange",
      definition: "Share of authors successfully matched to an invoice/payment record in the Finance export. Unmatched authors may have name variations not yet resolved.",
    },
    {
      label: "AI Analyzed",
      value: String(aiAnalyzed),
      sub: aiAnalyzed === 0 ? "run build-ai-cache" : `of ${total} authors`,
      color: "purple",
      definition: "Authors with ≥3 feedback responses — enough for Claude to extract qualitative themes and compute a transformation rate.",
    },
  ];

  return (
    <div className="of-metrics">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`of-metric of-metric--${card.color}`}
        >
          <div className="of-metric__label">
            <div className={`of-metric__dot of-metric__dot--${card.color}`} />
            {card.label}
            <Tooltip text={card.definition} />
          </div>
          <div className="of-metric__value">{card.value}</div>
          <div className="of-metric__sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
