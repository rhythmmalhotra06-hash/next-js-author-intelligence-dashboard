---
title: 'Phase 4 — AI Transcript & Feedback Analysis'
slug: 'phase-4-ai-transcript-analysis'
scope: epic
status: draft
parent: 'speaker-intelligence.md'
children: []
created: 2026-05-04
updated: 2026-05-04
resolution: 0/7
---

# Phase 4 — AI Transcript & Feedback Analysis

> Part of [Mindvalley Speaker Intelligence System](../speaker-intelligence.md)

## Purpose

[UNRESOLVED]

Add the qualitative intelligence layer that quantitative signals cannot provide. Pass lesson transcripts and session feedback through Claude API to extract what was actually taught (topic coverage, teaching techniques, interaction style) and what students actually experienced (transformation language, craft themes, goal alignment). This phase makes the Curriculum Fit signals precise and the Author Craft signals interpretable.

This phase answers: why does this author perform the way they do, what do students specifically say that indicates transformation, and where is the gap between what students came to learn and what they were actually taught?

## User Stories

[UNRESOLVED]

As someone evaluating authors: I want to see specific feedback themes — not "4.6 average" — so I can walk into an author conversation and say "students consistently said your practical tools section was the highest-value part, and they wanted more Q&A time."

As someone designing curriculum: I want to see what was actually taught in each session and compare it to what students said they came to learn, so I can redesign slots where the curriculum promise and the delivery diverge.

As someone evaluating authors: I want transformation language rate per author — what percentage of feedback contains "I learned X" or "I'm doing Y differently" — as a primary craft signal, not an average of stars.

## Workflows

[UNRESOLVED]

**Transcript pipeline:**
1. Pull Lesson Transcript attachments from Lessons table (`fldhXtb5dyPE1e1Qe`) — available in Speaking (confirmed), partial in Manifesting, TBD in others
2. For each transcript, call Claude API (`claude-sonnet-4-6`) with structured extraction prompt:
   - Topics covered
   - Teaching techniques used (lecture / coaching / storytelling / demo / Q&A)
   - Interaction style (one-way delivery vs student-driven)
   - Key frameworks or models introduced
   - Actionability score (1–10: how immediately applicable is the content?)
3. Store extracted data per lesson; aggregate per author across lessons

**Feedback pipeline:**
1. Pull Feedback text from Session Feedback table (`flddAP3X5OGwMbIA2`) per session, batched per author
2. For each feedback batch, call Claude API with transformation language extraction prompt:
   - Flag transformation language: "I learned X", "I'm doing Y differently", "I realised Z", "I applied this to..."
   - Extract craft themes: what students say about how the author taught (clarity, pacing, energy, stories, tools)
   - Extract criticism themes: specific complaints about format, depth, duration, delivery
   - Compute transformation language rate: % of feedback submissions containing transformation language
3. Store extracted themes per author per mastery

**Goal alignment pipeline:**
1. Pull Student Onboarding Survey: Goals + Wants to Learn fields
2. Compare stated goals (what students came wanting) against extracted transcript topics (what was delivered)
3. Compute goal alignment delta per slot: topics most wanted vs topics most covered — gap = curriculum design signal

## Boundaries

[UNRESOLVED]

- Sentiment scoring is explicitly excluded — the system does not score feedback as positive/negative/neutral; it extracts transformation language and craft themes only
- Transcript availability is uneven: Speaking confirmed, Manifesting partial, Entrepreneurship/Spiritual/Social TBD — Phase 4 runs on available transcripts only; missing transcripts do not block the phase
- AI extraction is batch-processed, not real-time — transcripts and feedback are processed on the weekly refresh cycle
- Claude API calls are per-session for transcripts and per-author-batch for feedback — prompt caching should be used for repeated system prompt calls
- Extracted data augments the Author Craft and Curriculum Fit views — it does not replace the quantitative signals from Phases 1–2

## Dependencies

[UNRESOLVED]

- Phases 1 and 2 complete — transcript and feedback data pulled from the same bases; author identity resolution already done
- Claude API access configured with API key
- Transcript attachment download capability confirmed (Airtable attachments are URL-accessible)
- Prompt caching enabled on Claude API calls (system prompts are repeated across many calls)
- Transcript availability per mastery confirmed before estimating Phase 4 scope

## Success Criteria

[UNRESOLVED]

- Transformation language rate computed for all authors with ≥10 feedback submissions
- Craft themes extracted and clustered for all authors with ≥5 feedback submissions
- Goal alignment delta computed for all curriculum slots with onboarding survey data + transcript coverage
- Per-author qualitative intelligence card generated: top 3 praise themes, top 2 criticism themes, transformation language rate
- Topic taxonomy built across all processed sessions: which topics appear most, which correlate with highest transformation language rate

## Features

[UNRESOLVED]

- **Transcript processing pipeline**: batch extraction of topics, teaching techniques, interaction style, actionability per lesson via Claude API
- **Feedback NLP pipeline**: transformation language detection and craft/criticism theme extraction per author-mastery via Claude API
- **Goal alignment delta computation**: onboarding survey intent vs transcript topic delivery gap per curriculum slot
- **Transformation language rate**: primary Author Craft signal computed from feedback text, not star ratings
- **Per-author qualitative intelligence card**: structured summary of craft themes, criticism themes, transformation rate, top topics
- **Topic taxonomy**: cross-mastery map of topics taught, with transformation language rate overlaid per topic
- **Prompt caching**: system prompts cached on Claude API calls to reduce cost on repeated extractions
