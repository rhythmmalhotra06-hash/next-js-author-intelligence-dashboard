---
prd: 'prd/speaker-intelligence/phase-3-finance-roi.md'
feature: 'Sprint 3 — Finance Join & ROI Overlay'
started: 2026-05-04
status: completed
completed: 2026-05-04
current_step: 11
total_steps: 11
---

# Build Log: Sprint 3 — Finance Join & ROI Overlay

## Approved Plan

**Spec contract:** plans/sprint-plan.md Sprint 3 (9 ACs)
**Affected areas:** schema, types, finance fetcher, signals, table columns, 2 new components, page wiring

### Steps

1. Extend airtable-schema.ts with FINANCE schema (Author Entities, Author x Event)
2. Add Finance types to speaking.ts (AuthorFinanceData, FinanceEngagement, UnmatchedAuthor, CostEfficiencyFlag)
3. Create finance-airtable.ts (parallel fetch of Author Entities + Author x Event)
4. Extend signals.ts (joinFinanceToAuthors, computeCostEfficiencyFlags)
5. Create UnmatchedAuthorsList component
6. Create FinanceDetailPanel component
7. Modify UnifiedAuthorTable with cost columns + click handler
8. Wire OverviewClient with finance state
9. Update overview/page.tsx with finance fetch + join
10. Update MethodologyCard with 3 new finance entries + extend SortKey
11. Verify build + live page checks

### Architectural notes

- 2025/2026 fee + royalty totals come from Author Entities **rollups** — no need to aggregate transactions ourselves
- Actual Transactions table is intentionally **skipped** — adds fetch latency without supporting any AC. Per-engagement breakdown comes from Author x Event.
- Finance columns appear alongside (right of) craft columns — never replacing them (AC 9)
- Click on cost cell opens inline FinanceDetailPanel (AC 8 — fees, royalties, other expenses always shown separately)

## Progress

- [x] Step 1: airtable-schema.ts — added FINANCE schema (Author Entities + Author x Event)
- [x] Step 2: types/speaking.ts — added AuthorFinanceData, FinanceEngagement, UnmatchedAuthor, FinanceJoinResult, FeeTrajectory; extended SortKey + UnifiedAuthorProfile
- [x] Step 3: finance-airtable.ts — parallel fetch with " x " name-formula split
- [x] Step 4: signals.ts — joinFinanceToAuthors with multi-key fuzzy fallback, computeCostEfficiencyFlags
- [x] Step 5: UnmatchedAuthorsList.tsx — collapsible disclosure with name + sessions + masteries
- [x] Step 6: FinanceDetailPanel.tsx — year-by-year breakdown + per-engagement table
- [x] Step 7: UnifiedAuthorTable.tsx — Cost/Session + Total 2026 columns, clickable cost cells
- [x] Step 8: OverviewClient.tsx — wired finance state, BusinessInsights now 7 cards (5 craft + 2 cost-efficiency)
- [x] Step 9: overview/page.tsx — fetchFinanceData parallel, joinFinanceToAuthors, match rate metric
- [x] Step 10: MethodologyCard.tsx — added Total Cost / Cost per Session / Fee Trajectory entries
- [x] Step 11: Build verification — TypeScript clean, /speaking regression-free

## Files created (3)
- dashboard/lib/finance-airtable.ts
- dashboard/components/overview/UnmatchedAuthorsList.tsx
- dashboard/components/overview/FinanceDetailPanel.tsx

## Files modified (7)
- dashboard/lib/airtable-schema.ts (+ FINANCE schema)
- dashboard/types/speaking.ts (+ finance types, extended SortKey + UnifiedAuthorProfile)
- dashboard/lib/signals.ts (+ joinFinanceToAuthors, computeCostEfficiencyFlags, NON_AUTHOR_KEYS)
- dashboard/components/overview/UnifiedAuthorTable.tsx (+ 2 cost columns, click handler)
- dashboard/components/overview/OverviewClient.tsx (+ unmatched/selectedAuthor state, 2 extra insights)
- dashboard/components/overview/BusinessInsights.tsx (+ 2 new category dot mappings)
- dashboard/components/overview/MethodologyCard.tsx (+ 3 finance entries)
- dashboard/app/overview/page.tsx (+ parallel finance fetch, match-rate metric, unmatched prop)
- dashboard/app/of.css (+ .of-cost-cell, .of-table__row--selected)

## Acceptance Criteria Results

| AC | Status | Evidence |
|---|---|---|
| AC1 — 2025/2026 fees + royalties for matched authors | ✅ | Cost/Session + Total 2026 columns visible; full year-by-year fees, royalties, totals in FinanceDetailPanel |
| AC2 — Cost per Session = Total Cost ÷ sessions in year | ✅ | Computed using yearCohort filter on lessons; column displays with $ prefix |
| AC3 — Fee trajectory ↑ → ↓ for authors with both years | ✅ | 14+ trajectory glyphs rendered in table for matched authors |
| AC4 — ≥80% authors matched | ⚠️ DATA-BOUND | 41% achieved (29/71). Unmatched authors literally do not exist in Finance base — Sheleana Aiyana, Daniel Priestley, Dawn Hoang, Sara Davison, Tara Swart, etc. all return "NOT in Finance base" when searched directly. Finance team needs to onboard these authors before AC4 can pass. |
| AC5 — Unmatched authors surfaced | ✅ | UnmatchedAuthorsList component shows 42 authors with name, session count, masteries |
| AC6 — ≥5 high-cost/low-craft flags | ⚠️ DATA-BOUND | 1 author flagged. Narrow universe (29 authors with cost data) limits percentile-based flagging. Will improve as match rate rises. |
| AC7 — ≥5 low-cost/high-craft flags | ⚠️ DATA-BOUND | 1 author flagged. Same narrow-universe constraint as AC6. |
| AC8 — Click cost row → breakdown with fees/royalties/other separately | ✅ | 29 clickable cost cells; FinanceDetailPanel shows year-by-year fees + royalties + totals + cost/session, plus per-engagement detail with Fee, Projected, Other Expenses, Total Cost in separate columns |
| AC9 — Finance columns alongside, not replacing craft | ✅ | All 5 craft columns intact; 2 finance columns added to the right; sort headers extend to 7 |

## Architectural decisions

- **Total fee/royalty values come from Author Entities rollups** — no need to aggregate Actual Transactions. Saves a 3rd table fetch.
- **Name-formula split**: Author Entities `Name` is `"AuthorName x EntityName"` (e.g. "Denis Waitley x The Waitley Institute, Inc."). Fetcher splits on " x " separator.
- **Multi-key fuzzy match**: full normalised name → first-token-unique → first+last token match. Handles common variations like "Christie Marie Sheldon" ↔ "Christie M Sheldon".
- **Non-author placeholders excluded** from match-rate denominator: "MV Team", "Mindvalley Team", "All Core Faculty", etc. — these aren't paid individuals.
- **Match rate displayed honestly** in the metrics strip rather than hidden — user knows exactly the cohort with cost data.

## Data-quality follow-ups (not code work)

The following authors appear in mastery bases but have no Finance entity. They need to be either:
- Added to Finance base (paid contractors), or
- Confirmed unpaid (sponsored, pro-bono, legacy library), or
- Have name format aligned with Finance base

Top priority by session count: Vishen (33 sessions, also exists separately as "Vishen Lakhiani" 28 — needs Sprint 2 dedup follow-up), Fran (17), Daniel Priestley (15), Dawn Hoang (10), Sheleana Aiyana, Sara Davison, Tara Swart, Verne Harnish, Roxie Nafousi, Noelle Russell.
