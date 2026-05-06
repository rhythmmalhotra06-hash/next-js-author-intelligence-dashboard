import Link from "next/link";
import type { BusinessInsight } from "@/types/speaking";

interface Props {
  insights: BusinessInsight[];
}

const CATEGORY_DOT: Record<BusinessInsight["category"], string> = {
  top_performers:     "of-metric__dot--purple",
  hidden_gems:        "of-metric__dot--blue",
  at_risk:            "of-metric__dot--red",
  inconsistent:       "of-metric__dot--orange",
  volume_leaders:     "of-metric__dot--green",
  anchor_speakers:    "of-metric__dot--purple",
  develop_or_replace: "of-metric__dot--red",
};

export function BusinessInsights({ insights }: Props) {
  return (
    <div className="of-insights">
      {insights.map((insight) => (
        <div key={insight.category} className="of-rank-card">
          <div className="of-rank-card__header">
            <div className={`of-metric__dot ${CATEGORY_DOT[insight.category]}`} />
            <div style={{ flex: 1 }}>
              <div className="of-rank-card__title">{insight.title}</div>
              <div className="of-rank-card__action">
                {insight.action} · {insight.description}
              </div>
            </div>
          </div>

          {insight.authors.length === 0 ? (
            <div className="of-rank-item__empty">No authors match this category yet</div>
          ) : (
            insight.authors.map((author, idx) => (
              <Link
                key={author.normalisedKey}
                href={`/author/${encodeURIComponent(author.normalisedKey)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="of-rank-item" style={{ cursor: "pointer" }}>
                  <span className="of-rank-item__rank">{idx + 1}</span>
                  <span className="of-rank-item__name">
                    {author.authorName}
                    <div className="of-rank-item__detail">{author.detail}</div>
                  </span>
                  <span className="of-rank-item__value">{author.primaryMetric}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
