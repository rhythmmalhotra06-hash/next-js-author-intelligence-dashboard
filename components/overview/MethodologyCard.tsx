interface MetricEntry {
  name:    string;
  formula: string;
  why:     string;
}

const ENTRIES: MetricEntry[] = [
  {
    name:    "Overall Rewatch",
    formula: "Average of per-mastery rewatch rates · Per-mastery rewatch = Rec Views (1w) ÷ Enrolled",
    why:     "Re-engagement signal. High rewatch means students return to the recording after the live session.",
  },
  {
    name:    "Avg Rating",
    formula: "Average of per-mastery avg ratings · Per-mastery avg = mean of all lesson ratings in that mastery",
    why:     "Quality signal averaged equally across masteries (not weighted by session count).",
  },
  {
    name:    "Rating Consistency",
    formula: "Standard deviation of avg rating across masteries — only shown for authors in ≥2 masteries",
    why:     "Lower = consistent quality everywhere. Higher = strong in some programs, weak in others.",
  },
  {
    name:    "Cross-Program Count",
    formula: "Count of distinct masteries this author teaches in",
    why:     "Breadth signal. Cross-program authors typically correlate with higher overall ratings.",
  },
  {
    name:    "Rating Floor Flag",
    formula: "Triggered if avg rating < 4.0 in any single mastery",
    why:     "Trip wire for performance review. The author row turns red when triggered.",
  },
  {
    name:    "Speaker Fee (Total)",
    formula: "Sum of Actual Transactions where GL Code = 'Speaker fees' AND Product contains 'Mastery'",
    why:     "Confirmed invoiced spend — not a projection or rollup. Royalties are excluded (tracked separately).",
  },
];

export function MethodologyCard() {
  return (
    <details className="of-disclosure">
      <summary className="of-disclosure__summary">
        How metrics are computed
      </summary>
      <div className="of-disclosure__body">
        {ENTRIES.map((entry) => (
          <div key={entry.name} className="of-disclosure__entry">
            <div className="of-disclosure__entry-name">{entry.name}</div>
            <div className="of-disclosure__entry-formula">{entry.formula}</div>
            <div className="of-disclosure__entry-why">{entry.why}</div>
          </div>
        ))}
      </div>
    </details>
  );
}
