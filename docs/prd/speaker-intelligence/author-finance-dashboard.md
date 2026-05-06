---
title: 'Author Finance Intelligence Dashboard'
slug: 'author-finance-dashboard'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-06
updated: 2026-05-06

resolution: 7/7
status: resolved
build-status: built
build-date: 2026-05-06
build-log: .builds/author-finance-dashboard.build.md
---

# Author Finance Intelligence Dashboard

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

A dedicated Finance Intelligence page within the Author Intelligence portal, built for Eni's author relations team. Surfaces — for the first time as structured, queryable data — what Mindvalley has actually paid each author, under what payment structure (royalty vs fixed fee), for which masteries, and alongside the author's performance and student feedback signals.

Primary use case: Eni opens this page before an author renewal or fee negotiation call to understand the full financial and performance picture in one place. Secondary use case: comparing authors on cost and performance to inform payment structure decisions.

## User Stories

As Eni (author relations), I want to see a table of all authors with their payment type, total spend, and mastery — sortable and filterable — so I can quickly orient before any negotiation or renewal conversation.

As Eni, I want to see how much we paid a specific author, broken down by transaction (what, when, which mastery) alongside their student feedback and craft performance signals, so I have the full picture before a renewal call.

As Eni, I want to compare two authors side-by-side on cost and performance for similar masteries, so I can negotiate fees with reference to what similar authors cost us.

As the COO (secondary), I want visibility into author payment structures and COGS concentration by mastery and author type, so I can identify where renegotiation would most improve EBITDA.

## Workflows

### Primary Flow — Table View
1. Eni navigates to `/finance` page in the Author Intelligence portal
2. Page loads a sortable, filterable table of all authors with the following columns:
   - **Author Name** — linked to author profile
   - **Entity** — legal entity the payment was made to
   - **Payment Type** — Royalty or Fixed Fee (AI-extracted from contract summary)
   - **GL Code** — expense classification code from Actual Transactions
   - **Cost Category** — Royalty vs Speaker Fee (derived from GL Expense Code)
   - **Product Code** — mastery/program the payment relates to
   - **Total Paid 2025** — sum of all transactions in 2025
   - **Total Paid 2026** — sum of all transactions to date in 2026
   - **Royalty %** — if payment type is royalty, extracted from contract summary via AI
   - **Fee Trajectory** — 2025→2026 trend: Increasing / Stable / Decreasing
   - **Cost per Session** — Total Paid ÷ sessions delivered (from Phase 1 data)
   - **Craft Signal** — author craft score from Phase 1/2 (visual indicator)
   - **Student Feedback Score** — aggregated student feedback from Phase 1/4
   - **Contract Renewal Date** — AI-extracted from contract summary; highlighted if within 90 days
3. Eni can filter by: Payment Type, Product Code/Mastery, Year, Entity, GL Code, Fee Trajectory
4. Eni can sort by any column — most common use: sort by Total Paid descending to see highest-cost authors first
5. Eni clicks a row → per-author detail drawer/page with full transaction history (each invoice: amount, date, mastery, GL code) + contract summary text + AI-extracted terms

### Secondary Flow — Comparison
1. Eni selects 2 authors using checkboxes in the table
2. A comparison panel opens showing both authors side-by-side: payment structure, total spend, cost per session, craft signal, student feedback
3. Used before negotiations to anchor fee expectations against a comparable author

### Analysis & Flags Section
Below the table, a persistent AI-generated panel surfaces:
- **High-cost / low-craft flags** — authors where total spend is above mastery average but craft signal is below median
- **Fee trajectory anomalies** — authors with 2025→2026 spend increase >20% without a corresponding performance improvement
- **Royalty vs Fixed Fee insight** — for royalty authors, AI estimates whether a fixed fee would have been cheaper given actual transaction volume
- **Renewal alerts** — authors with contract renewal date within 90 days, with their current cost and performance summary
- **Unmatched records** — transactions in the Finance base that couldn't be matched to an author; flagged for manual resolution
- **Notes field** — Eni can add a free-text note per author (e.g. "discuss royalty cap in next call") that persists on the page

## Boundaries

- Shows all historical years where Finance data exists — not limited to 2025/2026
- Eni has notes-only write access — she can add/edit per-author notes but cannot modify contract fields, transaction records, or any Airtable data
- Comparison panel is open-ended multi-select — no cap on number of authors compared simultaneously
- No student-level financial data — author spend only (no revenue or LTV data in this phase)
- No write-back to Airtable — all data is read-only from source; notes are stored locally in the dashboard
- AI contract parsing is best-effort — unextracted fields shown as blank, not hidden; raw contract summary always accessible in per-author drawer

## Dependencies

- Phase 3 Finance data pipeline — Author Entities, Author x Event, Actual Transactions tables from Finance base (`appgZyJyIam1yPgOx`)
- Phase 1 data — sessions delivered per author for cost-per-session calculation
- Phase 1/4 — craft signals and student feedback scores
- Contract summary field in Airtable (existing) — AI parsing to extract: payment type, royalty %, fee amount, contract dates
- Phase 2 — author name resolution/fuzzy match reused for finance join
- AI enrichment layer (already exists in `dashboard/lib/ai-enrichment.ts`) — extended to parse contract summaries

## Success Criteria

- Eni can prepare for an author renewal call by reviewing this page alone — without opening Airtable, a spreadsheet, or requesting data from Finance
- ≥80% of authors in the portal have complete finance records (payment type, total paid, at least one year of transactions)
- AI contract parsing extracts payment type correctly for ≥90% of authors who have a contract summary field populated
- All columns in the table are populated for ≥80% of rows — blank fields are the exception, not the norm
- Analysis panel surfaces at least one actionable flag (renewal alert, high-cost/low-craft, trajectory anomaly) per dashboard load when data warrants it
- Per-author transaction drawer loads within 2 seconds

## Features

- **Author Finance Table** — sortable/filterable table with all columns listed in Workflows; default sort by Total Paid 2026 descending
- **Contract Intelligence** — AI parses contract summary field to extract: payment type, royalty %, fee amount, renewal date; surfaced as structured columns
- **Per-Author Transaction Drawer** — click any author to see itemised transaction list + raw contract summary + AI-extracted terms
- **Author Comparison Panel** — select 2 authors to compare on cost, structure, and performance side-by-side
- **AI Analysis Panel** — persistent section below table with flags: high-cost/low-craft, fee trajectory anomalies, royalty-vs-fixed-fee estimates, renewal alerts, unmatched records
- **Renewal Date Tracker** — contract renewal dates surfaced in table; authors renewing within 90 days highlighted
- **Eni's Notes** — per-author free-text note field, persisted in the dashboard (not written back to Airtable)
