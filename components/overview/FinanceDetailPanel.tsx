import type { UnifiedAuthorProfile, FinanceTransactionDetail } from "@/types/speaking";

interface Props {
  author:  UnifiedAuthorProfile;
  onClose: () => void;
}

function money(val: number | null): string {
  if (val === null || val === 0) return "—";
  return `$${Math.round(val).toLocaleString("en-US")}`;
}

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  // Airtable returns ISO dates like "2025-03-14"
  try {
    return new Date(raw).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}

export function FinanceDetailPanel({ author, onClose }: Props) {
  const finance = author.finance;
  if (!finance) {
    return (
      <div className="of-callout of-callout--info">
        <div className="of-callout__body">
          <div className="of-callout__title">No Finance match</div>
          <div>{author.authorName} has no Speaker Fee transactions for Mastery products.</div>
        </div>
      </div>
    );
  }

  const transactions: FinanceTransactionDetail[] = author.transactions ?? [];

  // Group transactions by year for the summary header
  const tx2025 = transactions.filter((t) => t.invoiceYear === "2025");
  const tx2026 = transactions.filter((t) => t.invoiceYear === "2026");

  return (
    <div className="of-panel" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="of-panel__title" style={{ marginBottom: 4 }}>
            {author.authorName} — Speaker Fee breakdown
          </div>
          <div style={{ fontSize: 12, color: "var(--mv-text-muted)" }}>
            Source: Actual Transactions · GL Code: Speaker Fee · Mastery products only
          </div>
        </div>
        <button className="mv-btn mv-btn--ghost mv-btn--sm" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Year summary cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { year: "2025", total: finance.speakerFeeTotal2025, count: tx2025.length },
          { year: "2026", total: finance.speakerFeeTotal2026, count: tx2026.length },
        ].map(({ year, total, count }) => (
          <div
            key={year}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              background: "var(--mv-surface-subtle, rgba(0,0,0,0.04))",
              border: "1px solid var(--mv-border-subtle, rgba(0,0,0,0.08))",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mv-text-muted)", marginBottom: 4 }}>
              {year} Speaker Fees
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--mv-text)" }}>
              {money(total)}
            </div>
            <div style={{ fontSize: 12, color: "var(--mv-text-muted)", marginTop: 2 }}>
              {count} invoice{count !== 1 ? "s" : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Individual invoice table */}
      {transactions.length > 0 ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: "var(--mv-text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {transactions.length} invoice{transactions.length !== 1 ? "s" : ""}
          </div>
          <div className="of-table-wrap">
            <table className="of-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Memo</th>
                  <th className="of-table__amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .sort((a, b) => {
                    // Sort newest first
                    const ay = a.invoiceYear ?? "0";
                    const by = b.invoiceYear ?? "0";
                    if (ay !== by) return by.localeCompare(ay);
                    return (b.invoiceDate ?? "").localeCompare(a.invoiceDate ?? "");
                  })
                  .map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{tx.invoiceNumber ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(tx.invoiceDate)}</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.productName ?? "—"}
                      </td>
                      <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--mv-text-muted)", fontSize: 12 }}>
                        {tx.billMemo ?? "—"}
                      </td>
                      <td className="of-table__amount" style={{ fontWeight: 500 }}>
                        {money(tx.invoiceAmount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--mv-text-muted)" }}>
          No individual invoice records available.
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--mv-text-subtle)" }}>
        Royalties are excluded from this view and will appear in a dedicated Royalties dashboard.
      </div>
    </div>
  );
}
