import type { UnmatchedAuthor } from "@/types/speaking";
import { MASTERY_LABELS } from "@/types/speaking";

interface Props {
  unmatched: UnmatchedAuthor[];
}

export function UnmatchedAuthorsList({ unmatched }: Props) {
  if (unmatched.length === 0) return null;

  return (
    <details className="of-disclosure">
      <summary className="of-disclosure__summary">
        {unmatched.length} author{unmatched.length !== 1 ? "s" : ""} without a Finance match
      </summary>
      <div className="of-disclosure__body">
        <p style={{ fontSize: 13, color: "var(--mv-text-muted)", marginBottom: 12 }}>
          These authors teach in the masteries but have no Author Entity in the Finance base.
          Either the name needs cleaning up in Finance, or they are unpaid contributors. Cost
          metrics are unavailable until the Finance entity is added.
        </p>
        <div className="of-table-wrap">
          <table className="of-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Author</th>
                <th style={{ textAlign: "center" }}>Sessions</th>
                <th>Masteries</th>
              </tr>
            </thead>
            <tbody>
              {unmatched
                .slice()
                .sort((a, b) => b.sessionCount - a.sessionCount)
                .map((u) => (
                  <tr key={u.normalisedKey}>
                    <td>{u.authorName}</td>
                    <td style={{ textAlign: "center" }}>{u.sessionCount}</td>
                    <td>{u.masteries.map((m) => MASTERY_LABELS[m]).join(", ")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
