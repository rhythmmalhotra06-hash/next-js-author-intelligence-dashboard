---
title: 'Phase 3 — Finance Join & ROI'
slug: 'phase-3-finance-roi'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-04
updated: 2026-05-04
resolution: 0/7
---

# Phase 3 — Finance Join & ROI

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

[UNRESOLVED]

Join author cost data from the Finance base to the craft and fit signals built in Phases 1–2. Surface the financial dimension as a third overlay — never collapsed into the craft or fit scores — so that re-booking and fee negotiation decisions have cost context alongside performance evidence.

This phase answers: who is high-cost with low craft impact, who is high-value relative to their fee, and where is author spend concentrated relative to program outcomes?

## User Stories

[UNRESOLVED]

As someone with financial accountability: I want to see each author's total cost (fee + expenses) alongside their craft signals across masteries, so I can identify where budget is being spent on authors who are not delivering student transformation.

As someone evaluating authors: I want cost context when making a re-booking decision — not to let cost override craft, but to understand whether a high-performing author is also a high-cost author and price accordingly.

As someone evaluating authors: I want to see which authors deliver strong craft and fit signals at relatively low cost, so I can anchor those relationships and protect them.

## Workflows

[UNRESOLVED]

1. Pull Author Entities table (`tbli5GhmDuR155bO0`) from Finance base (`appgZyJyIam1yPgOx`):
   - 2025 Actual Speaker Fee Amount, 2025 Actual Royalties Amount
   - 2026 Actual Speaker Fee Amount, 2026 Actual Royalties Amount
2. Pull Actual Transactions table (`tbluv0jndDIHaTRZA`) filtered by Invoice Year:
   - Invoice Amount, Net Amount, Invoice Year, Product Code, GL Expense Code
3. Pull Author x Event table (`tblgq4Ta5X9N3wyqm`):
   - Fee, Projected Fee, Other Expenses, Total Cost per engagement
4. Match finance records to mastery author records via Author Name (same fuzzy match as Phase 2; reuse resolved name mapping)
5. Classify transactions: speaker fee vs royalties using GL Expense Code
6. Map transactions to masteries using Product Code → mastery name lookup
7. Compute per-author finance signals:
   - Total spend 2025 and 2026 (fees + royalties)
   - Cost per session (Total Cost ÷ sessions in that year)
   - Fee trajectory (2025 vs 2026 — increasing / stable / decreasing)
8. Overlay finance signals on the unified author table from Phase 2
9. Surface the cost-efficiency view: craft signals vs cost per session, flagging high-cost/low-craft and low-cost/high-craft authors

## Boundaries

[UNRESOLVED]

- Finance join covers authors where a name match exists — target ≥80% match rate; unmatched records flagged
- Royalties and speaker fees are tracked separately (not combined into a single cost figure) — Finance team decision per parent PRD open questions
- ROI formula weighting requires Marijana sign-off before being used for ranking — cost signals surface as raw data until formula is agreed
- Student LTV is out of scope in this phase — cost is author spend only, not connected to student revenue
- No student-level financial data — aggregated author cost only
- Output is internal analytical overlay, not a production UI (Phase 5)

## Dependencies

[UNRESOLVED]

- Phase 2 complete — name resolution mapping reused for finance join
- Finance base access confirmed (`appgZyJyIam1yPgOx`) with read permissions on Author Entities, Author x Event, Actual Transactions, Product Code tables
- Finance base population confirmed for 2025 (mostly complete; few empty records per parent PRD)
- ROI formula weighting decision from Marijana (open question — signals surface without formula ranking until resolved)
- Royalties inclusion decision from Finance team (open question)

## Success Criteria

[UNRESOLVED]

- ≥80% of authors from the unified table matched to Finance base cost records
- Per-author cost signals (fee, royalties, total cost, cost per session) computed for matched authors
- Cost-efficiency view surfaces at least 5 high-cost/low-craft and 5 low-cost/high-craft authors
- Finance signals visible alongside (not inside) Author Craft view in the output
- Unmatched authors flagged with count and list for manual resolution

## Features

[UNRESOLVED]

- **Finance data pull**: Author Entities + Author x Event + Actual Transactions from Finance base
- **Finance-to-author name matching**: reuse Phase 2 name resolution; flag new conflicts
- **Transaction classification**: fee vs royalties via GL Expense Code
- **Mastery attribution**: Product Code → mastery name mapping for per-program cost breakdown
- **Per-author cost computation**: total spend, cost per session, year-over-year fee trajectory
- **Cost-efficiency overlay**: finance signals surfaced alongside Author Craft and Curriculum Fit views
- **High-cost/low-craft flag**: explicit flag for authors where cost is high relative to craft signals
