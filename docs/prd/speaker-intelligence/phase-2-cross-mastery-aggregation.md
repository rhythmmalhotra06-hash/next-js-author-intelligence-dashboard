---
title: 'Phase 2 — Cross-Mastery Aggregation'
slug: 'phase-2-cross-mastery-aggregation'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-04
updated: 2026-05-04
resolution: 0/7
---

# Phase 2 — Cross-Mastery Aggregation

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

[UNRESOLVED]

Scale the evaluation model from one mastery to all 6. Join Lessons and Session Feedback data across Speaking & Influence, Manifesting, AI Mastery, Entrepreneurship, Spiritual, and Social — normalise author names across bases — and surface patterns that are invisible when each mastery is analysed in isolation.

This phase answers: which authors perform consistently across programs, which topics succeed or fail regardless of who teaches them, and where does an author excel in one mastery but underperform in another?

## User Stories

[UNRESOLVED]

As someone evaluating authors: I want to see an author's craft signals across every mastery they've taught in — not one program in isolation — so I can assess whether they're reliably good or highly variable depending on context.

As someone designing curriculum: I want to see which topic categories (mindset, technique, Q&A, practical tools) consistently outperform across all 6 masteries, so curriculum decisions are informed by pattern evidence, not single-program recollection.

As someone evaluating authors: I want to see authors who appear in multiple masteries ranked by rating consistency (low variance = reliable), so I can identify the authors worth anchoring across the portfolio.

## Workflows

[UNRESOLVED]

1. Pull Lessons + Session Feedback data from all 6 mastery bases
2. Normalise author names across bases — apply fuzzy match (e.g. "Dr. John Smith" → "John Smith") to resolve the same author appearing under different name variants; flag unresolved matches for manual review
3. Build unified author table: one row per author, columns for each mastery's craft signals (rewatch rate, rating floor, follow-up rate, attendance rate)
4. Compute cross-mastery signals:
   - Cross-Program Count: # of distinct masteries the author has taught in
   - Rating Consistency: std deviation of avg rating across masteries (low = reliable)
   - Trajectory: cohort-over-cohort trend where data exists (2024 → 2025 → 2026)
5. Compute cross-mastery Curriculum Fit signals:
   - Which topic types (lesson / Q&A / hotseat / workshop) perform best across programs?
   - Which session duration bands (60-min / 90-min / 120-min) correlate with highest engagement?
   - Which curriculum slot positions (module opening, mid-module, closing) show consistent patterns?
6. Produce cross-mastery Author Craft view and Curriculum Fit view

## Boundaries

[UNRESOLVED]

- All 6 mastery bases, but only Lessons and Session Feedback tables — Schedule, Cohorts, and Modules tables are referenced for context but not primary signal sources in this phase
- No finance join — cost signals are Phase 3
- No AI analysis — transformation language rate deferred to Phase 4
- Name normalisation is best-effort fuzzy match; unresolved conflicts are flagged, not silently dropped
- Feedback table availability is not confirmed for Entrepreneurship, Spiritual, and Social — if absent, those masteries contribute attendance and rating rollup signals only (no feedback-level signals)
- Output is internal analytical view, not a production UI (Phase 5)

## Dependencies

[UNRESOLVED]

- Phase 1 complete — cross-mastery model extends the single-mastery baseline
- Airtable MCP access to all 6 mastery bases confirmed
- Schema check on Entrepreneurship (`appJVtywkn9mTFbLs`), Spiritual (`appsRrP9oJQMD5nZU`), Social (`appf3Molaaw26nIH8`) to confirm feedback table availability (open question from parent PRD)
- Name normalisation strategy agreed — fuzzy match threshold and manual review process defined

## Success Criteria

[UNRESOLVED]

- All 6 masteries represented in the unified author view
- Authors appearing in multiple masteries identified with cross-program craft profiles
- Rating consistency (std deviation) computed for all multi-mastery authors
- Cross-program topic and format patterns surfaced (at least 3 actionable patterns)
- Name match coverage ≥90% of author records (remainder flagged for manual resolution)

## Features

[UNRESOLVED]

- **Multi-base data pull**: Lessons + Session Feedback from all 6 mastery bases
- **Name normalisation engine**: fuzzy match + conflict flagging for cross-base author identity resolution
- **Unified author table**: one row per author, craft signals per mastery, cross-mastery aggregates
- **Cross-mastery Author Craft view**: authors ranked by consistency and cross-program performance
- **Cross-mastery Curriculum Fit view**: topic types, session formats, and slot positions ranked by engagement signals
- **Pattern summary**: narrative or structured output of the top cross-program patterns found
