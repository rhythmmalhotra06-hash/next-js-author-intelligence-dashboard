import type { UnresolvedNameMatch } from "@/types/speaking";
import { MASTERY_LABELS } from "@/types/speaking";

interface Props {
  matches: UnresolvedNameMatch[];
}

export function UnresolvedNamesList({ matches }: Props) {
  if (matches.length === 0) return null;

  return (
    <div className="of-callout of-callout--warn">
      <svg
        className="of-callout__icon"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8 2L15 14H1L8 2z" strokeLinejoin="round" />
        <path d="M8 7v3M8 12v.5" strokeLinecap="round" />
      </svg>
      <div className="of-callout__body">
        <div className="of-callout__title">
          {matches.length} unresolved name match{matches.length !== 1 ? "es" : ""}
        </div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          These author name variants could not be automatically merged. They are
          counted as separate authors. Review and update names in Airtable if they
          refer to the same person.
        </div>
        <div style={{ marginTop: 8 }}>
          <div className="of-table-wrap">
            <table className="of-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Name variants</th>
                  <th>Masteries</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, i) => (
                  <tr key={i}>
                    <td>
                      {match.variants.map((v, j) => (
                        <span key={j}>
                          {j > 0 && (
                            <span style={{ margin: "0 6px", opacity: 0.5 }}>vs</span>
                          )}
                          <code style={{ fontSize: 12 }}>{v}</code>
                        </span>
                      ))}
                    </td>
                    <td>
                      {match.masteries.map((m) => MASTERY_LABELS[m]).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
