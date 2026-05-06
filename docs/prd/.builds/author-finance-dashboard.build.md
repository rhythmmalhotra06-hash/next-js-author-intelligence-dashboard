---
prd: 'prd/speaker-intelligence/author-finance-dashboard.md'
feature: 'Author Finance Intelligence Dashboard'
started: 2026-05-06
status: completed
completed: 2026-05-06
current_step: 11
total_steps: 11
---

# Build Log: Author Finance Intelligence Dashboard

## Approved Plan

**Source PRD:** `prd/speaker-intelligence/author-finance-dashboard.md`
**Affected areas:** schema, types, finance fetcher, signals, 4 components, 1 page, 1 client wrapper, 1 loading skeleton, sidebar

## Progress

- [x] Step 1: airtable-schema.ts — added CONTRACT_TYPE (fld f693gRQFLklU94, singleSelect) + CONTRACT_SUMMARY (fldn7VN7b6GxtoBr7, aiText) to FINANCE.AUTHOR_ENTITIES; added AUTHOR_ENTITY_NAME (fld7QV6paxUZlrEay) to ACTUAL_TRANSACTIONS
- [x] Step 2: types/speaking.ts — added ContractTerms, FinanceFlag, FinanceDashboardRow, FinanceDashboardTransaction, FinanceDashboardData
- [x] Step 3: lib/finance-dashboard-airtable.ts — parallel fetch of Author Entities (contract + rollup fields) + ALL Actual Transactions (no GL/product filter, all years); groups txns by Author Entity ID with name-based fallback join
- [x] Step 4: lib/signals.ts — added extractContractTerms (regex-based royalty%, renewal date, fee amount), computeFeeTrajectory, buildFinanceDashboardRows (joins finance + unified profiles), computeFinanceFlags (high-cost/low-craft, trajectory anomaly, renewal alert)
- [x] Step 5: components/finance/FinanceDashboardTable.tsx — sortable/filterable table, 14 columns, checkbox multi-select, renewal highlighting, search bar
- [x] Step 6: components/finance/AuthorFinanceDrawer.tsx — slide-in panel with contract details, fee breakdown, transaction history by year, localStorage notes
- [x] Step 7: components/finance/AuthorComparisonPanel.tsx — side-by-side comparison table for ≥2 selected authors, highlights highest values
- [x] Step 8: components/finance/FinanceFlagsPanel.tsx — collapsible flags panel with type-filter tabs, severity indicators, author click-through
- [x] Step 9: app/finance/page.tsx + app/finance/FinanceClient.tsx — server component for parallel data fetch; client wrapper for drawer/comparison/flag state
- [x] Step 10: app/finance/loading.tsx — skeleton following overview/loading.tsx pattern
- [x] Step 11: components/shell/SidebarNav.tsx — added Finance nav item between Overview and Mastery Drill-downs

## Files created (9)
- dashboard/lib/finance-dashboard-airtable.ts
- dashboard/components/finance/FinanceDashboardTable.tsx
- dashboard/components/finance/AuthorFinanceDrawer.tsx
- dashboard/components/finance/AuthorComparisonPanel.tsx
- dashboard/components/finance/FinanceFlagsPanel.tsx
- dashboard/app/finance/page.tsx
- dashboard/app/finance/FinanceClient.tsx
- dashboard/app/finance/loading.tsx

## Files modified (4)
- dashboard/lib/airtable-schema.ts (+ CONTRACT_TYPE, CONTRACT_SUMMARY on AUTHOR_ENTITIES; + AUTHOR_ENTITY_NAME on ACTUAL_TRANSACTIONS)
- dashboard/types/speaking.ts (+ finance dashboard types)
- dashboard/lib/signals.ts (+ buildFinanceDashboardRows, extractContractTerms, computeFinanceFlags)
- dashboard/components/shell/SidebarNav.tsx (+ Finance nav item)

## Verification
- `tsc --noEmit`: clean (0 errors)

## Phase 2 — Transaction-level intelligence (2026-05-06)

User feedback: "transactions are attached, you have a lot more detail on actual transactions tab — this isn't very detailed or very intelligent."

Pulled the rich per-transaction fields that were previously skipped:
- **Attachment Summary** (Airtable AI-generated text from each invoice/receipt PDF)
- **Payment lifecycle** — invoice date → bill approved → payment initiated → payment completed
- **Currency** field (per-transaction, with FX exposure flagging)
- **Department, Account Code, Line Tag Project** — full categorisation chain
- **Attachments** — filenames + count (URLs lost to cellFormat=string; v3 candidate)

Added per-author intelligence layer:
- **SpendBreakdown** — totals + share of spend by GL code / product / department
- **PaymentPipeline** — pending / approved-not-paid / in-transit / completed buckets, with avgDaysToPay metric and stuck-payment count (approved >60d, not paid)

Two new flag types:
- **stuck_payment** — bills approved >60d but not completed; severity scales with count
- **fx_exposure** — author paid across multiple currencies

Drawer redesigned:
- Header now surfaces contract type + currency badges + FX warning
- New "Payment Pipeline" section with 4-bucket grid + avg days-to-pay + stuck count
- New "Spend Breakdown" section with toggle (GL/Product/Department) + horizontal bar chart
- Transactions are now collapsible rows; each expands to show:
  - Lifecycle timeline (4-step visual: invoice → approved → sent → completed) with cycle-time
  - Categorisation grid (invoice #, currency, net amount, GL/account/department/project tag, bill status)
  - **AI Summary of Invoice / Attachments** (the key intelligence)
  - Bill memo
  - Attachment list with filenames + sizes

### Files modified (Phase 2)
- dashboard/lib/airtable-schema.ts (+ 11 fields on ACTUAL_TRANSACTIONS)
- dashboard/types/speaking.ts (+ FinanceAttachment, SpendBreakdown, PaymentPipeline; extended FinanceDashboardTransaction with 11 fields; extended FinanceDashboardRow with spendBreakdown + paymentPipeline; extended FinanceFlag union with stuck_payment + fx_exposure)
- dashboard/lib/finance-dashboard-airtable.ts (+ parseAttachments helper; pull all new fields)
- dashboard/lib/signals.ts (+ computeSpendBreakdown, computePaymentPipeline, stuck-payment + FX flags)
- dashboard/components/finance/AuthorFinanceDrawer.tsx (full redesign)
- dashboard/components/finance/FinanceFlagsPanel.tsx (+ icons for new flag types)

### Verification (Phase 2)
- `tsc --noEmit`: clean (0 errors)

## Phase 3 — Strategic decisions + Author x Event integration (2026-05-06)

User feedback: "How can we add more business insights and decisions that will help COO and Head of Author Relations based on all the data we have. Maybe also add the Author x Event so we know."

### What was added

**Author x Event integration** — pulled the per-engagement detail table (Status, Engagement Type, Calendar Event, Fee, Projected Fee, Other Expenses, Total Cost, Notes, Contract attachments). Joined to Author Entities by author name. Drives "variance to projection" computation and a new Engagements section in the drawer.

**Per-author Decision Card** — every author gets one of 5 recommendations classified by a 2-axis (cost × performance) classifier using dataset medians as thresholds:
- ANCHOR (high cost · high perf) — renew at current terms
- INVEST (low cost · high perf) — lock in early
- RENEGOTIATE (high cost · low/no perf) — push for fee cut
- DEVELOP (low cost · low perf) — coach or replace
- WATCH (insufficient data)

Each decision includes rationale + 2-3 specific drivers (the metrics that drove the call) + confidence rating (high/medium/low).

**Strategic Insights Panel** — 5 page-level cards above the flags panel:
1. Spend Concentration — top 10 authors as % of total 2026 spend
2. Renewal Queue — count + $ of contracts renewing in next 90 days
3. Renegotiation Targets — count + total spend of authors classified `renegotiate`
4. Investment Targets — count + total spend of authors classified `invest`
5. Variance to Budget — Σ(actual fee − projected fee) across all engagements; lists worst over-runs

**Decision column on the main table** — at-a-glance badge per row, with hover tooltip showing rationale. Plus a Decision filter dropdown to slice the table by recommendation type.

**Engagements section in drawer** — between Payment Pipeline and Spend Breakdown:
- Engagement type counts as badges
- 3-stat summary (Total Actual / Total Projected / Variance + over-run count)
- Per-engagement table with Variance column (color-coded: red over, green under)

### Files modified (Phase 3)
- dashboard/lib/airtable-schema.ts (+ AUTHOR_X_EVENT fields: STATUS, CALENDAR_EVENT, ENGAGEMENT_TYPE, NOTES, CONTRACT, SESSIONS, ENGAGEMENT)
- dashboard/types/speaking.ts (+ AuthorEngagement, EngagementRollup, DecisionAction, DecisionRecommendation, SpendConcentration, RenewalQueueItem, DecisionCohort, VarianceSummary, StrategicInsights; extended FinanceDashboardRow with engagements + decision; extended FinanceDashboardData with insights)
- dashboard/lib/finance-dashboard-airtable.ts (+ engagement fetch + author-name → entity join via AUTHOR linked record)
- dashboard/lib/signals.ts (+ computeEngagementRollup, deriveDecisionContext, computeDecision, computeStrategicInsights)
- dashboard/components/finance/FinanceDashboardTable.tsx (+ Decision column + filter)
- dashboard/components/finance/AuthorFinanceDrawer.tsx (+ DecisionCard component + EngagementsSection component)
- dashboard/app/finance/FinanceClient.tsx (+ StrategicInsightsPanel section)

### Files created (Phase 3)
- dashboard/components/finance/StrategicInsightsPanel.tsx

### Verification (Phase 3)
- `tsc --noEmit`: clean (0 errors)
