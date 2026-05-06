import Link from "next/link";
import { normaliseName } from "@/lib/signals";
import type { Top5Bottom5 } from "@/types/speaking";

interface TopBottomFiveProps {
  data: Top5Bottom5;
}

function pct(val: number): string {
  return (Math.min(val, 1) * 100).toFixed(1) + "%";
}

export function TopBottomFive({ data }: TopBottomFiveProps) {
  return (
    <div className="of-top-bottom">
      {/* Top 5 */}
      <div className="of-rank-card">
        <div className="of-rank-card__header">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--mv-green)",
            }}
          />
          <span className="of-rank-card__title">Top 5 by rewatch rate</span>
        </div>
        {data.top.length === 0 ? (
          <div className="of-empty" style={{ padding: "24px" }}>
            <p className="of-empty__sub">No data with rewatch rate</p>
          </div>
        ) : (
          data.top.map((a) => (
            <Link
              key={a.authorName}
              href={`/author/${encodeURIComponent(normaliseName(a.authorName))}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="of-rank-item" style={{ cursor: "pointer" }}>
                <span className="of-rank-item__rank">#{a.rank}</span>
                <div className="of-rank-item__name">
                  {a.authorName}
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--mv-text-subtle)",
                      marginTop: 2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {a.sessionCount} sessions
                    {a.avgRating !== null ? ` · ${a.avgRating.toFixed(1)} avg` : ""}
                  </div>
                </div>
                <span
                  className="of-rank-item__value"
                  style={{ color: "var(--mv-green-content)" }}
                >
                  {pct(a.rewatchRate)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom 5 */}
      <div className="of-rank-card">
        <div className="of-rank-card__header">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--mv-orange)",
            }}
          />
          <span className="of-rank-card__title">Bottom 5 by rewatch rate</span>
        </div>
        {data.bottom.length === 0 ? (
          <div className="of-empty" style={{ padding: "24px" }}>
            <p className="of-empty__sub">No data with rewatch rate</p>
          </div>
        ) : (
          data.bottom.map((a) => (
            <Link
              key={a.authorName}
              href={`/author/${encodeURIComponent(normaliseName(a.authorName))}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="of-rank-item" style={{ cursor: "pointer" }}>
                <span className="of-rank-item__rank">#{a.rank}</span>
                <div className="of-rank-item__name">
                  {a.authorName}
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--mv-text-subtle)",
                      marginTop: 2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {a.sessionCount} sessions
                    {a.avgRating !== null ? ` · ${a.avgRating.toFixed(1)} avg` : ""}
                  </div>
                </div>
                <span
                  className="of-rank-item__value"
                  style={{ color: "var(--mv-orange-content)" }}
                >
                  {pct(a.rewatchRate)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
