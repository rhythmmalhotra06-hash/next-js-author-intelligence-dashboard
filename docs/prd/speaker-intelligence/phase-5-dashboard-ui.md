---
title: 'Phase 5 — Dashboard UI'
slug: 'phase-5-dashboard-ui'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-04
updated: 2026-05-04
resolution: 0/7
---

# Phase 5 — Dashboard UI

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

[UNRESOLVED]

Deliver the three-view interface that makes all analytical signals from Phases 1–4 accessible to internal users without querying Airtable or reading raw output. The dashboard is the production surface — the thing Author Relations and Financial Accountability users actually open before a planning meeting.

This phase answers: how do we make the signal accessible, legible, and actionable to the people who need to use it — not just to the analyst who built it?

## User Stories

[UNRESOLVED]

As someone evaluating authors: I want to open an author's profile and immediately see their craft signals, curriculum fit performance, cost overlay, and qualitative themes — all in one place — without switching between Airtable bases or reading exported spreadsheets.

As someone designing curriculum: I want to filter the cross-mastery view by mastery, year, and topic type, then see which slots are underperforming and which authors are flagged for divergence — in under 30 seconds.

As someone with financial accountability: I want to see the cost-efficiency view — authors sorted by cost per session against craft signals — without needing to understand how the data was joined.

## Workflows

[UNRESOLVED]

**View 1 — Cross-Mastery Overview**
1. Load unified author table from Phase 2 with finance overlay from Phase 3
2. Display all authors across all 6 masteries with craft signals, fit signals, and cost per session
3. Filters: by mastery (multi-select), by year (2024 / 2025 / 2026), by session type (lesson / Q&A / hotseat), by cost tier
4. Divergence flags visible at a glance — authors where craft and fit point in opposite directions are surfaced
5. Top 5 / bottom 5 authors by craft signals shown prominently
6. Cross-program pattern summary: at least 3 patterns derived from Phase 2 analysis

**View 2 — Per-Mastery Drill-Down**
1. Select a mastery from the overview to enter drill-down
2. Full lesson-by-lesson table: lesson title, author, attendees, rating, rewatch rate, slot position, module
3. Module-level summary: which modules had highest craft and fit signals
4. Cohort comparison: 2025 vs 2026 where data exists
5. Student journey overlay: onboarding confidence → session transformation language rate
6. Recording engagement: rewatch rate per lesson across the curriculum arc

**View 3 — Author Profile**
1. Select any author from any view to open their profile
2. Performance summary: avg rating (as floor indicator), sessions total, transformation language rate, rewatch rate
3. Per-mastery breakdown: craft and fit signals per program the author has taught in
4. Qualitative intelligence card (Phase 4): top praise themes, top criticism themes, transformation language rate
5. Financial summary: 2025 and 2026 fees and royalties, cost per session
6. Divergence flag: does this author's craft score differ significantly from their fit score?
7. Trajectory: cohort-over-cohort trend

**Weekly refresh**
- Dashboard data refreshes weekly via Airtable MCP pull
- Refresh timestamp visible in the UI
- No live data — weekly cadence is sufficient for planning cycle use

## Boundaries

[UNRESOLVED]

- Internal-facing only — no public URL, no author-facing access in v1
- Author email summary report is explicitly out of scope for v1 (deferred)
- No real-time data — weekly refresh model only
- Dashboard displays signals; it does not allow editing Airtable records
- External benchmarking view is deferred until a data source is confirmed (open question from parent PRD)
- Student LTV overlay is deferred until data join to financial/CRM system is confirmed (open question from parent PRD)
- Load time target: <5 seconds for the Cross-Mastery Overview with full dataset

## Dependencies

[UNRESOLVED]

- Phases 1–3 complete as minimum viable dataset for dashboard (Phase 4 AI signals are additive, not blocking)
- Output format decision: React artifact (Claude-generated) vs hosted web app vs Airtable interface — to be confirmed before building
- PII policy confirmed for student-level drill-down (open question from parent PRD)
- Access control: who can access the dashboard, and is any role-based restriction needed?

## Success Criteria

[UNRESOLVED]

- All 3 views functional and navigable without analyst support
- Cross-Mastery Overview loads in <5 seconds with full 6-mastery dataset
- Divergence flags surface at least one author and one curriculum slot per mastery
- Marijana and Marta are using the dashboard for the next cohort planning cycle (adoption target from parent PRD)
- A person with no Airtable access can answer the 3 core questions (what works / best student outcome / most cost-efficient author) using the dashboard alone

## Features

[UNRESOLVED]

- **Cross-Mastery Overview**: unified author table with craft signals, fit signals, cost overlay, divergence flags, top/bottom author lists, cross-program pattern summary
- **Mastery Drill-Down**: per-mastery lesson table, module heatmap, cohort comparison, student journey overlay, recording engagement curve
- **Author Profile**: full craft/fit/finance/qualitative card per author with trajectory and divergence flag
- **Filters**: mastery, year, session type, cost tier — cross-cutting across all views
- **Weekly refresh mechanism**: Airtable MCP pull on schedule, refresh timestamp in UI
- **Divergence flagging UI**: visual treatment distinguishing authors/slots where craft and fit signals conflict
