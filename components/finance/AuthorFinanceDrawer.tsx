"use client";

import React, { useState, useEffect, useMemo } from "react";
import type {
  FinanceDashboardRow,
  FinanceDashboardTransaction,
  SpendBreakdownEntry,
  FinanceAttachment,
  DecisionAction,
  AuthorEngagement,
} from "@/types/speaking";

const DECISION_META: Record<DecisionAction, { label: string; color: string; tagline: string }> = {
  anchor:      { label: "ANCHOR",      color: "var(--mv-brand)",         tagline: "High perf · High cost — renew at current terms" },
  invest:      { label: "INVEST",      color: "var(--mv-green, #22c55e)",tagline: "High perf · Below-median cost — lock in early" },
  renegotiate: { label: "RENEGOTIATE", color: "var(--mv-red, #ef4444)",  tagline: "High cost · Performance gap — push for fee cut" },
  develop:     { label: "DEVELOP",     color: "var(--mv-amber, #f59e0b)",tagline: "Low cost · Low signal — coach or replace" },
  watch:       { label: "WATCH",       color: "var(--mv-text-subtle)",   tagline: "Insufficient data — collect signal" },
};

interface Props {
  row: FinanceDashboardRow | null;
  onClose: () => void;
}

function fmt(n: number | null, currency: string | null = null): string {
  if (n === null) return "—";
  const symbol = !currency || currency === "USD" ? "$" : "";
  const amount = n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return symbol ? `${symbol}${amount}` : `${amount} ${currency}`;
}

function noteKey(entityId: string): string {
  return `finance-note-${entityId}`;
}

function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function paymentStage(tx: FinanceDashboardTransaction): "completed" | "in_transit" | "approved" | "pending" {
  if (tx.paymentCompletionDate || (tx.paymentStatus ?? "").toLowerCase().match(/completed|paid/)) return "completed";
  if (tx.paymentInitiatedDate || (tx.paymentStatus ?? "").toLowerCase().match(/initiated|processing|transit/)) return "in_transit";
  if (tx.billApprovedOn || (tx.billStatus ?? "").toLowerCase().includes("approved")) return "approved";
  return "pending";
}

const STAGE_META: Record<ReturnType<typeof paymentStage>, { label: string; color: string }> = {
  pending:    { label: "Pending approval", color: "var(--mv-text-subtle)" },
  approved:   { label: "Approved",         color: "var(--mv-amber, #f59e0b)" },
  in_transit: { label: "In transit",       color: "var(--mv-brand)" },
  completed:  { label: "Completed",        color: "var(--mv-green, #22c55e)" },
};

export function AuthorFinanceDrawer({ row, onClose }: Props) {
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [expandedTx, setExpandedTx] = useState<Set<string>>(new Set());
  const [activeBreakdown, setActiveBreakdown] = useState<"glCode" | "product" | "department">("glCode");

  // Load note from localStorage when row changes
  useEffect(() => {
    if (!row) return;
    const saved = localStorage.getItem(noteKey(row.authorEntityId));
    setNote(saved ?? "");
    setNoteSaved(false);
    setExpandedTx(new Set());
  }, [row?.authorEntityId]);

  // Group transactions by year (ALWAYS run hooks before early return)
  const byYear = useMemo(() => {
    const m = new Map<string, FinanceDashboardTransaction[]>();
    for (const tx of row?.transactions ?? []) {
      const yr = tx.invoiceYear ?? "Unknown";
      if (!m.has(yr)) m.set(yr, []);
      m.get(yr)!.push(tx);
    }
    return m;
  }, [row]);

  const years = useMemo(
    () => Array.from(byYear.keys()).sort((a, b) => b.localeCompare(a)),
    [byYear]
  );

  if (!row) return null;

  const pipeline = row.paymentPipeline;
  const breakdown = activeBreakdown === "glCode"
    ? row.spendBreakdown.byGlCode
    : activeBreakdown === "product"
    ? row.spendBreakdown.byProduct
    : row.spendBreakdown.byDepartment;

  function toggleTx(id: string) {
    setExpandedTx(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function saveNote() {
    if (!row) return;
    localStorage.setItem(noteKey(row.authorEntityId), note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500,
  };
  const drawer: React.CSSProperties = {
    position: "fixed", top: 0, right: 0, bottom: 0, width: "min(720px, 96vw)",
    background: "var(--mv-surface)", borderLeft: "1px solid var(--mv-border)",
    overflowY: "auto", zIndex: 501, display: "flex", flexDirection: "column",
  };
  const section: React.CSSProperties = {
    padding: "20px 24px", borderBottom: "1px solid var(--mv-border)",
  };
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.06em", color: "var(--mv-text-subtle)", marginBottom: 6,
  };

  return (
    <>
      <div style={overlay} onClick={onClose} />
      <div style={drawer}>
        {/* Header */}
        <div style={{ ...section, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--mv-text)", marginBottom: 4 }}>
              {row.authorName}
            </div>
            {row.entityName && (
              <div style={{ fontSize: 13, color: "var(--mv-text-muted)" }}>{row.entityName}</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {row.contractType && (
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--mv-brand-light)", color: "var(--mv-brand)" }}>
                  {row.contractType}
                </span>
              )}
              {pipeline.currencies.map(c => (
                <span key={c} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--mv-surface-subtle)", border: "1px solid var(--mv-border)", color: "var(--mv-text-muted)" }}>
                  {c}
                </span>
              ))}
              {pipeline.currencies.length > 1 && (
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--mv-amber, #f59e0b)20", color: "var(--mv-amber, #f59e0b)" }}>
                  💱 FX exposure
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mv-text-subtle)", fontSize: 22, lineHeight: 1, padding: "4px 8px" }}>
            ×
          </button>
        </div>

        {/* Decision Card */}
        <div style={section}>
          <DecisionCard row={row} />
        </div>

        {/* Fee summary */}
        <div style={section}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Fee 2025",       val: fmt(row.fee2025) },
              { label: "Royalties 2025", val: fmt(row.royalties2025) },
              { label: "Fee 2026",       val: fmt(row.fee2026) },
              { label: "Royalties 2026", val: fmt(row.royalties2026) },
            ].map(({ label: l, val }) => (
              <div key={l} style={{ background: "var(--mv-surface-subtle)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ ...label, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Pipeline */}
        <div style={section}>
          <div style={{ ...label, marginBottom: 10 }}>Payment Pipeline</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
            <PipelineBucket label="Pending"      bucket={pipeline.pendingApproval} color="var(--mv-text-subtle)" />
            <PipelineBucket label="Approved"     bucket={pipeline.approvedNotPaid} color="var(--mv-amber, #f59e0b)" />
            <PipelineBucket label="In transit"   bucket={pipeline.inTransit}        color="var(--mv-brand)" />
            <PipelineBucket label="Completed"    bucket={pipeline.completed}        color="var(--mv-green, #22c55e)" />
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--mv-text-muted)" }}>
            {pipeline.avgDaysToPay !== null && (
              <span>Avg days to pay: <strong style={{ color: "var(--mv-text)" }}>{pipeline.avgDaysToPay.toFixed(0)}</strong></span>
            )}
            {pipeline.stuckCount > 0 && (
              <span style={{ color: "var(--mv-amber, #f59e0b)" }}>
                ⏱ {pipeline.stuckCount} stuck payment{pipeline.stuckCount === 1 ? "" : "s"} (approved 60+ days ago)
              </span>
            )}
          </div>
        </div>

        {/* Engagements (Author x Event) */}
        {row.engagements.list.length > 0 && (
          <div style={section}>
            <EngagementsSection engagements={row.engagements} />
          </div>
        )}

        {/* Spend Breakdown */}
        {row.transactions.length > 0 && (
          <div style={section}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={label}>Spend Breakdown</span>
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                <BreakdownTab label="By GL code"    active={activeBreakdown === "glCode"}     onClick={() => setActiveBreakdown("glCode")} />
                <BreakdownTab label="By product"    active={activeBreakdown === "product"}    onClick={() => setActiveBreakdown("product")} />
                <BreakdownTab label="By department" active={activeBreakdown === "department"} onClick={() => setActiveBreakdown("department")} />
              </div>
            </div>
            {breakdown.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--mv-text-subtle)" }}>No data for this dimension.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {breakdown.slice(0, 6).map((entry: SpendBreakdownEntry) => (
                  <BreakdownBar key={entry.category} entry={entry} />
                ))}
                {breakdown.length > 6 && (
                  <div style={{ fontSize: 11, color: "var(--mv-text-subtle)", marginTop: 4 }}>
                    +{breakdown.length - 6} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Performance context */}
        {(row.craftSignal !== null || row.feedbackScore !== null || row.sessionCount > 0) && (
          <div style={section}>
            <div style={{ ...label, marginBottom: 8 }}>Performance Context</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {row.sessionCount > 0 && <Stat label="Sessions" value={String(row.sessionCount)} />}
              {row.craftSignal !== null && <Stat label="Rewatch rate" value={`${(row.craftSignal * 100).toFixed(1)}%`} />}
              {row.feedbackScore !== null && <Stat label="Avg rating" value={row.feedbackScore.toFixed(2)} />}
              {row.contractTerms.royaltyPct !== null && <Stat label="Royalty %" value={`${row.contractTerms.royaltyPct}%`} />}
              {row.contractTerms.renewalDate && <Stat label="Renewal" value={row.contractTerms.renewalDate} highlight />}
            </div>
            {row.masteries.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {row.masteries.map(m => (
                  <span key={m} style={{ padding: "2px 8px", borderRadius: 999, background: "var(--mv-surface-subtle)", border: "1px solid var(--mv-border)", fontSize: 11 }}>{m}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contract summary text */}
        {row.contractSummary && (
          <div style={section}>
            <div style={{ ...label, marginBottom: 8 }}>Contract Summary (AI)</div>
            <div style={{
              fontSize: 13, color: "var(--mv-text-muted)", lineHeight: 1.6,
              background: "var(--mv-surface-subtle)", borderRadius: 8, padding: "12px 14px",
              whiteSpace: "pre-wrap",
            }}>
              {row.contractSummary}
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div style={section}>
          <div style={{ ...label, marginBottom: 12 }}>
            Transactions ({row.transactions.length}) — click any row to expand
          </div>
          {row.transactions.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--mv-text-subtle)" }}>No transactions found.</div>
          ) : (
            years.map(year => (
              <div key={year} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--mv-text-subtle)", marginBottom: 6 }}>{year}</div>
                <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--mv-border)" }}>
                  {(byYear.get(year) ?? []).map((tx, i) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      isExpanded={expandedTx.has(tx.id)}
                      onToggle={() => toggleTx(tx.id)}
                      isFirst={i === 0}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notes */}
        <div style={{ ...section, borderBottom: "none", flex: 1 }}>
          <div style={{ ...label, marginBottom: 8 }}>Notes (private, not saved to Airtable)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add notes before a renewal call… e.g. 'Discuss royalty cap' or 'Check contract expiry'"
            rows={4}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid var(--mv-border)", background: "var(--mv-surface-subtle)",
              color: "var(--mv-text)", fontSize: 13, lineHeight: 1.5,
              resize: "vertical", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, gap: 8, alignItems: "center" }}>
            {noteSaved && <span style={{ fontSize: 12, color: "var(--mv-green, #22c55e)" }}>Saved</span>}
            <button
              onClick={saveNote}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: "var(--mv-brand)", color: "#fff", fontSize: 13, fontWeight: 600,
              }}
            >
              Save note
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PipelineBucket({ label, bucket, color }: {
  label: string; bucket: { count: number; amount: number }; color: string;
}) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`,
      padding: "8px 12px", borderRadius: "0 8px 8px 0",
      background: "var(--mv-surface-subtle)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mv-text-subtle)" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
        ${bucket.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
      <div style={{ fontSize: 11, color: "var(--mv-text-muted)" }}>{bucket.count} tx</div>
    </div>
  );
}

function BreakdownTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: active ? 700 : 400,
      border: "1px solid var(--mv-border)",
      background: active ? "var(--mv-brand)" : "transparent",
      color: active ? "#fff" : "var(--mv-text-muted)",
      cursor: "pointer",
    }}>
      {label}
    </button>
  );
}

function BreakdownBar({ entry }: { entry: SpendBreakdownEntry }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: "var(--mv-text)", fontWeight: 500 }}>{entry.category}</span>
        <span style={{ color: "var(--mv-text-muted)", fontVariantNumeric: "tabular-nums" }}>
          ${entry.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} · {(entry.pct * 100).toFixed(0)}% · {entry.count}tx
        </span>
      </div>
      <div style={{ height: 6, background: "var(--mv-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.max(2, entry.pct * 100)}%`,
          background: "var(--mv-brand)", borderRadius: 3,
        }} />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ fontSize: 13 }}>
      <span style={{ color: "var(--mv-text-subtle)" }}>{label}: </span>
      <strong style={{ color: highlight ? "var(--mv-amber, #f59e0b)" : "var(--mv-text)" }}>{value}</strong>
    </div>
  );
}

function TransactionRow({
  tx, isExpanded, onToggle, isFirst,
}: {
  tx: FinanceDashboardTransaction; isExpanded: boolean; onToggle: () => void; isFirst: boolean;
}) {
  const stage = paymentStage(tx);
  const stageMeta = STAGE_META[stage];

  return (
    <div style={{ borderTop: isFirst ? "none" : "1px solid var(--mv-border)" }}>
      {/* Summary row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "10px 12px", display: "grid",
          gridTemplateColumns: "auto 80px 1fr auto auto auto",
          gap: 10, alignItems: "center",
          background: isExpanded ? "var(--mv-surface-subtle)" : "transparent",
          border: "none", cursor: "pointer", textAlign: "left",
          transition: "background 80ms",
        }}
        onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLButtonElement).style.background = "var(--mv-surface-subtle)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isExpanded ? "var(--mv-surface-subtle)" : "transparent"; }}
      >
        <span style={{ fontSize: 12, color: "var(--mv-text-subtle)", width: 12 }}>{isExpanded ? "▾" : "▸"}</span>
        <span style={{ fontSize: 12, color: "var(--mv-text-muted)", fontVariantNumeric: "tabular-nums" }}>
          {tx.invoiceDate ?? "—"}
        </span>
        <span style={{ fontSize: 12, color: "var(--mv-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tx.glCode ?? "—"}
          {tx.productName && <span style={{ color: "var(--mv-text-subtle)" }}> · {tx.productName}</span>}
        </span>
        <span style={{ padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: stageMeta.color + "25", color: stageMeta.color, whiteSpace: "nowrap" }}>
          {stageMeta.label}
        </span>
        {tx.attachments.length > 0 && (
          <span style={{ fontSize: 11, color: "var(--mv-text-subtle)" }} title={`${tx.attachments.length} attachment${tx.attachments.length === 1 ? "" : "s"}`}>
            📎{tx.attachments.length}
          </span>
        )}
        <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 80 }}>
          {fmt(tx.invoiceAmount, tx.currency)}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ padding: "0 16px 16px 32px", display: "flex", flexDirection: "column", gap: 14, background: "var(--mv-surface-subtle)" }}>
          {/* Lifecycle timeline */}
          <Lifecycle tx={tx} />

          {/* Categorisation */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px 16px", fontSize: 12 }}>
            <DetailRow label="Invoice #"     value={tx.invoiceNumber} />
            <DetailRow label="Currency"      value={tx.currency} />
            <DetailRow label="Net amount"    value={tx.netAmount !== null ? fmt(tx.netAmount, tx.currency) : null} />
            <DetailRow label="GL code"       value={tx.glCode} />
            <DetailRow label="Account code"  value={tx.accountCode} />
            <DetailRow label="Department"    value={tx.department} />
            <DetailRow label="Project tag"   value={tx.lineTagProject} />
            <DetailRow label="Bill status"   value={tx.billStatus} />
          </div>

          {/* Attachment Summary (the AI-generated content from the actual invoice) */}
          {tx.attachmentSummary && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mv-brand)", marginBottom: 6 }}>
                AI Summary of Invoice / Attachments
              </div>
              <div style={{
                fontSize: 12, lineHeight: 1.55, color: "var(--mv-text)",
                padding: "10px 12px", borderRadius: 6,
                background: "var(--mv-surface)", border: "1px solid var(--mv-border)",
                whiteSpace: "pre-wrap",
              }}>
                {tx.attachmentSummary}
              </div>
            </div>
          )}

          {/* Bill memo (raw note) */}
          {tx.billMemo && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mv-text-subtle)", marginBottom: 6 }}>
                Bill Memo
              </div>
              <div style={{ fontSize: 12, color: "var(--mv-text-muted)", whiteSpace: "pre-wrap" }}>{tx.billMemo}</div>
            </div>
          )}

          {/* Attachment list */}
          {tx.attachments.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mv-text-subtle)", marginBottom: 6 }}>
                Attached Documents
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tx.attachments.map((a) => <AttachmentLink key={a.id} att={a} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Lifecycle({ tx }: { tx: FinanceDashboardTransaction }) {
  const steps = [
    { label: "Invoice",        date: tx.invoiceDate },
    { label: "Bill approved",  date: tx.billApprovedOn },
    { label: "Payment sent",   date: tx.paymentInitiatedDate },
    { label: "Completed",      date: tx.paymentCompletionDate },
  ];
  const totalDays = daysBetween(tx.invoiceDate, tx.paymentCompletionDate);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 4 }}>
        {steps.map((s, i) => {
          const filled = !!s.date;
          return (
            <React.Fragment key={s.label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: filled ? "var(--mv-green, #22c55e)" : "var(--mv-border)",
                  border: filled ? "none" : "1px solid var(--mv-border)",
                }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: filled ? "var(--mv-text)" : "var(--mv-text-subtle)", marginTop: 4, textAlign: "center" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--mv-text-subtle)", marginTop: 1 }}>
                  {s.date ?? "—"}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flexShrink: 0, height: 2, width: 20, background: filled && steps[i + 1].date ? "var(--mv-green, #22c55e)" : "var(--mv-border)", marginBottom: 22 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {totalDays !== null && (
        <div style={{ fontSize: 11, color: "var(--mv-text-muted)", textAlign: "right" }}>
          Cycle time: <strong style={{ color: "var(--mv-text)" }}>{totalDays} days</strong>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span style={{ color: "var(--mv-text-subtle)" }}>{label}: </span>
      <span style={{ color: value ? "var(--mv-text)" : "var(--mv-text-subtle)", fontWeight: value ? 500 : 400 }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function DecisionCard({ row }: { row: FinanceDashboardRow }) {
  const decision = row.decision;
  const meta = DECISION_META[decision.action];
  const confColor =
    decision.confidence === "high"   ? "var(--mv-green, #22c55e)" :
    decision.confidence === "medium" ? "var(--mv-amber, #f59e0b)" :
                                       "var(--mv-text-subtle)";

  return (
    <div style={{
      borderLeft: `4px solid ${meta.color}`,
      borderRadius: "0 10px 10px 0",
      padding: "12px 16px",
      background: "var(--mv-surface-subtle)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{
          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800,
          background: meta.color, color: "#fff", letterSpacing: "0.04em",
        }}>
          {meta.label}
        </span>
        <span style={{ fontSize: 11, color: "var(--mv-text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          {meta.tagline}
        </span>
        <span style={{
          marginLeft: "auto", padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600,
          background: confColor + "25", color: confColor,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {decision.confidence} confidence
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--mv-text)", lineHeight: 1.55, marginBottom: 8 }}>
        {decision.rationale}
      </div>
      {decision.drivers.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {decision.drivers.map((d, i) => (
            <span key={i} style={{
              padding: "2px 8px", borderRadius: 999, fontSize: 11,
              background: "var(--mv-surface)", border: "1px solid var(--mv-border)",
              color: "var(--mv-text-muted)",
            }}>
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EngagementsSection({ engagements }: { engagements: FinanceDashboardRow["engagements"] }) {
  const { list, totalFee, totalProjected, totalVariance, varianceTxnCount, engagementTypeCounts } = engagements;
  const typeEntries = Object.entries(engagementTypeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mv-text-subtle)" }}>
          Engagements ({list.length})
        </span>
        {typeEntries.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {typeEntries.slice(0, 4).map(([type, n]) => (
              <span key={type} style={{
                padding: "1px 8px", borderRadius: 999, fontSize: 10,
                background: "var(--mv-surface-subtle)", border: "1px solid var(--mv-border)",
                color: "var(--mv-text-muted)",
              }}>
                {type} · {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variance summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        <MiniStat label="Total Actual"    value={fmt(totalFee)}          />
        <MiniStat label="Total Projected" value={fmt(totalProjected)}    />
        <MiniStat
          label={`Variance · ${varianceTxnCount} over`}
          value={`${totalVariance >= 0 ? "+" : ""}${fmt(totalVariance)}`}
          color={totalVariance > 0 ? "var(--mv-red, #ef4444)" : totalVariance < 0 ? "var(--mv-green, #22c55e)" : "var(--mv-text)"}
        />
      </div>

      {/* Engagement table */}
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--mv-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--mv-surface-subtle)" }}>
              <th style={engHeader}>Engagement</th>
              <th style={engHeader}>Type</th>
              <th style={engHeader}>Status</th>
              <th style={{ ...engHeader, textAlign: "right" }}>Projected</th>
              <th style={{ ...engHeader, textAlign: "right" }}>Actual</th>
              <th style={{ ...engHeader, textAlign: "right" }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e: AuthorEngagement) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--mv-border)" }}>
                <td style={engCell}>
                  <div style={{ fontWeight: 600, color: "var(--mv-text)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.name ?? "(unnamed)"}
                  </div>
                  {e.notes && (
                    <div style={{ fontSize: 10, color: "var(--mv-text-subtle)", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.notes}
                    </div>
                  )}
                </td>
                <td style={engCell}>
                  {e.engagementType ? (
                    <span style={{ padding: "1px 6px", borderRadius: 999, background: "var(--mv-brand-light)", color: "var(--mv-brand)", fontSize: 10, fontWeight: 600 }}>
                      {e.engagementType}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ ...engCell, color: "var(--mv-text-muted)" }}>
                  {e.status ?? "—"}
                </td>
                <td style={{ ...engCell, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--mv-text-muted)" }}>
                  {fmt(e.projectedFee)}
                </td>
                <td style={{ ...engCell, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  {fmt(e.fee)}
                </td>
                <td style={{
                  ...engCell, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600,
                  color: e.variance === null ? "var(--mv-text-subtle)" :
                         e.variance > 0     ? "var(--mv-red, #ef4444)" :
                         e.variance < 0     ? "var(--mv-green, #22c55e)" :
                                              "var(--mv-text)",
                }}>
                  {e.variance === null ? "—" : `${e.variance >= 0 ? "+" : ""}${fmt(e.variance)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const engHeader: React.CSSProperties = {
  padding: "7px 10px", textAlign: "left", fontSize: 10, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mv-text-subtle)",
  whiteSpace: "nowrap",
};

const engCell: React.CSSProperties = {
  padding: "8px 10px", fontSize: 12, color: "var(--mv-text)",
};

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "var(--mv-surface-subtle)", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mv-text-subtle)" }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2, color: color ?? "var(--mv-text)" }}>
        {value}
      </div>
    </div>
  );
}

function AttachmentLink({ att }: { att: FinanceAttachment }) {
  const inner = (
    <>
      <span style={{ fontSize: 12 }}>📄</span>
      <span style={{ fontSize: 12, color: att.url ? "var(--mv-brand)" : "var(--mv-text-muted)", textDecoration: att.url ? "underline" : "none", textUnderlineOffset: 2 }}>
        {att.filename}
      </span>
      {att.size !== null && (
        <span style={{ fontSize: 10, color: "var(--mv-text-subtle)" }}>
          · {(att.size / 1024).toFixed(0)}kb
        </span>
      )}
    </>
  );
  if (att.url) {
    return (
      <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 6, alignItems: "center", textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return <div style={{ display: "flex", gap: 6, alignItems: "center" }}>{inner}</div>;
}
