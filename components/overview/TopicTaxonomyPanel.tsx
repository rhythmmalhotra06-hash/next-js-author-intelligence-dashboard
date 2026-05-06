import type { TopicTaxonomy } from "@/types/speaking";

interface Props {
  topics: TopicTaxonomy[];
  source?: "module" | "ai";
}

function pct(val: number | null): string {
  if (val === null) return "—";
  return `${(Math.min(val, 1) * 100).toFixed(0)}%`;
}

export function TopicTaxonomyPanel({ topics, source = "module" }: Props) {
  if (topics.length === 0) {
    return (
      <div className="of-empty">
        <div className="of-empty__art" />
        <p className="of-empty__title">No topics found</p>
        <p className="of-empty__sub">Module data is unavailable across the current dataset.</p>
      </div>
    );
  }

  return (
    <div className="of-table-wrap">
      <table className="of-table" style={{ fontSize: 13 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Topic / Module</th>
            <th style={{ textAlign: "right" }}>Lessons</th>
            <th>Top authors</th>
            <th style={{ textAlign: "right" }}>Transformation rate</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t, i) => (
            <tr key={t.topic}>
              <td className="of-table__muted">#{i + 1}</td>
              <td style={{ fontWeight: 500 }}>{t.topic}</td>
              <td style={{ textAlign: "right" }}>{t.lessonCount}</td>
              <td className="of-table__muted">{(t.topAuthors ?? []).join(", ") || "—"}</td>
              <td style={{ textAlign: "right" }}>{pct(t.transformationRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="of-table__muted" style={{ fontSize: 11, marginTop: 6 }}>
        {source === "ai"
          ? "Topics extracted from lesson transcripts via Claude. Transformation rate averaged across teaching authors."
          : "Topics derived from lesson Module field. Transformation rate populates once the AI feedback pipeline runs."}
      </div>
    </div>
  );
}
