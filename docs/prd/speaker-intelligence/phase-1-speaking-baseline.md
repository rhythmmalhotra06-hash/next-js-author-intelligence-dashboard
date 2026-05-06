---
title: 'Phase 1 — Speaking Mastery Baseline'
slug: 'phase-1-speaking-baseline'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-04
updated: 2026-05-04
resolution: 0/7
---

# Phase 1 — Speaking Mastery Baseline

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

[UNRESOLVED]

Prove the two-surface evaluation model (Curriculum Fit + Author Craft) on a single mastery before scaling. Speaking & Influence is the pilot because it has the most complete data: confirmed session feedback, transcripts, attendance, and recording views. If the model works here, it works everywhere.

This phase answers: within Speaking & Influence, which authors are delivering student transformation, which curriculum slots are underperforming, and where do craft and fit diverge?

## User Stories

[UNRESOLVED]

As someone evaluating authors: I want to see every Speaking author's craft signals — transformation language rate, rewatch rate, rating as a floor, feedback themes — so I can arrive at the next re-booking conversation with evidence, not recollection.

As someone designing curriculum: I want to see which slots in the Speaking curriculum consistently underperform regardless of who fills them, and where the gap between student intent (onboarding) and session delivery is largest.

## Workflows

[UNRESOLVED]

1. Pull all Lessons records from Speaking & Influence (`appKlfvxdXofNlFfk`, `tblxZy7RMJ2naoHhS`) — Lesson Title, Speaker, Attendees, Avg Rating, # Ratings, Rec Views (1w / 4w), Enrolled, Type, Module, Year
2. Pull all Session Feedback records (`tblIVJT8HaiLcrx62`) — Rating, Feedback text, Speaker lookup, Follow-up Needed
3. Pull Student Onboarding Survey records — Goals, Wants to Learn fields
4. Compute per-author Author Craft signals:
   - Rating floor flag (below 4.0)
   - Rewatch rate: Rec Views (1w) ÷ Enrolled
   - Rewatch long-tail: Rec Views (4w) ÷ Rec Views (1w)
   - Follow-up rate: % feedback with Follow-up Needed = true
   - (Phase 4 dependency: transformation language rate — deferred to Phase 4)
5. Compute per-slot Curriculum Fit signals:
   - Attendance rate: Attendees ÷ Enrolled
   - Goal alignment: match between onboarding survey "Wants to Learn" and lesson topic (manual or keyword-based in Phase 1; AI-based in Phase 4)
6. Flag divergence: slots or authors where Craft and Fit signals point in opposite directions
7. Produce ranked Author Craft view and Curriculum Fit view for Speaking

## Boundaries

[UNRESOLVED]

- Speaking & Influence mastery only — no other bases touched in this phase
- No finance join — cost signals are Phase 3
- No AI transcript or feedback analysis — that is Phase 4; transformation language rate is not available in Phase 1
- Goal alignment in Phase 1 is keyword/manual approximation only, not NLP-based
- No cross-mastery comparison — single mastery baseline only
- Output is internal analytical view, not a production UI (Phase 5)

## Dependencies

[UNRESOLVED]

- Airtable MCP access to Speaking & Influence base (`appKlfvxdXofNlFfk`)
- Session Feedback table confirmed present (`tblIVJT8HaiLcrx62`)
- Student Onboarding Survey table accessible
- Key field IDs confirmed (see parent PRD — Airtable Field ID Reference section)
- No upstream epic dependencies — this is the first phase

## Success Criteria

[UNRESOLVED]

- All Speaking authors with ≥2 sessions have a computed Author Craft profile
- All curriculum slots have a computed Curriculum Fit signal
- Divergence flags surface at least one author or slot where craft and fit point in opposite directions
- Top 5 and bottom 5 authors by craft signals are identifiable
- Output is reviewable by Author Relations team without needing to query Airtable directly

## Features

[UNRESOLVED]

- **Data pull**: Lessons + Session Feedback + Onboarding Survey from Speaking base
- **Author Craft computation**: rewatch rate, long-tail, rating floor flag, follow-up rate per author
- **Curriculum Fit computation**: attendance rate, slot-level pattern detection, goal alignment (keyword approximation)
- **Divergence detection**: flag authors/slots where craft and fit diverge
- **Author Craft view**: ranked table of all Speaking authors by craft signals, with floor flags visible
- **Curriculum Fit view**: ranked table of all curriculum slots by fit signals, with underperforming slots highlighted
