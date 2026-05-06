---
title: 'Mindvalley Speaker Intelligence System'
slug: 'speaker-intelligence'
scope: product
status: resolved
parent: null
children:
  - speaker-intelligence/phase-1-speaking-baseline.md
  - speaker-intelligence/phase-2-cross-mastery-aggregation.md
  - speaker-intelligence/phase-3-finance-roi.md
  - speaker-intelligence/phase-4-ai-transcript-analysis.md
  - speaker-intelligence/phase-5-dashboard-ui.md
  - speaker-intelligence/phase-6-slack-digest.md
  - speaker-intelligence/author-finance-dashboard.md
created: 2026-05-04
updated: 2026-05-04

resolution: 8/8
imported-from: "speaker_intelligence_PRD.md"
---

# Mindvalley Speaker Intelligence System

## Problem

Mindvalley runs 6 active Mastery programs (Speaking & Influence, Manifesting, AI Mastery, Entrepreneurship, Spiritual, Social), each with its own Airtable base. Every program has lesson-level data — attendance, ratings, transcripts, feedback, recording views, speaker fees — but this data is analysed **in isolation** per program.

The result:
- No cross-mastery view of which speakers and topic types perform best
- No ROI picture connecting speaker cost to student value delivered
- Curriculum decisions made on gut feel rather than pattern evidence
- Finance data (fees, royalties, invoices) lives in a separate system (`appgZyJyIam1yPgOx`) and is never joined to performance data

This means every cohort planning cycle, Marijana and Marta re-invite speakers based on memory and anecdote rather than a system that surfaces who actually moves students, at what cost, and with what consistency.

## Vision

The Author Relations team has a system that replaces intuition-based author and curriculum decisions — specifically where data now exists to measure them — with shared, defensible pattern evidence. Before every cohort planning cycle, the team can answer two distinct questions for any session, author, or curriculum slot: did this deliver on what the learning arc needed (curriculum fit), and how well did this person teach what they taught (author craft)? These signals are surfaced separately — never collapsed into a single score — and the system flags when they diverge, so a 4.9-rated speaker with no transformation language in feedback and zero rewatch gets surfaced for review rather than buried by their rating. The same diagnostic split works retrospectively (what happened) and prospectively (what to book next, who to develop, which curriculum slots keep failing). The outputs are specific enough to support a difficult conversation with an author and structured enough to walk into a planning meeting without arguing from anecdote.

## Users

Users are defined by the perspective they bring, not their org role. Three distinct perspectives consume this system:

**Perspective 1 — Author Evaluation**
*"Is this author working? Should we rebook them, develop them, or stop?"*
Needs: Author Craft view, trajectory across cohorts, consistency across masteries, transformation language in feedback. Arriving at a re-booking decision with evidence rather than recollection.

**Perspective 2 — Curriculum Design**
*"Is this slot working? Is the right topic being taught by the right person?"*
Needs: Curriculum Fit view, goal alignment delta, slot-level pattern (consistent underperformance regardless of who fills it). Arriving at a cohort planning cycle with a map of what's working structurally, not just who's good.

**Perspective 3 — Financial Accountability**
*"Are we spending author budget wisely? Who is high-cost with low impact?"*
Needs: Finance layer — fee vs. craft and fit signals, ROI view, cost-per-mastery breakdown. Read-only consumers of author and curriculum signals with cost overlaid.

**Anti-user**: the authors being evaluated. This system surfaces sensitive performance and financial data about them. It is not a speaker-facing tool — though its outputs should be defensible in a direct conversation with a speaker.

## Core Capabilities

### 1. Two Evaluation Surfaces (not a composite score)

The system produces two distinct diagnostic views per session, author, and curriculum slot. Signals are never collapsed into a single weighted score — composite scores hide exactly the diagnostic information Author Relations needs to act.

**Surface A — Curriculum Fit View**
The question: *Did this session deliver on what the learning arc needed?*
Signals:
- Goal alignment delta: what students said they wanted to learn (onboarding survey) vs. what the session actually covered (topic extraction from transcript + feedback themes)
- Topic coverage vs. promised: was the curriculum slot's stated learning outcome addressed?
- Transformation language rate: % of feedback containing "I learned X" / "I'm doing Y differently" — not sentiment, not praise, specifically outcome language
- Cross-slot pattern: does this curriculum position consistently underperform regardless of who fills it? (slot-level, not author-level)

Triggers decisions about: curriculum redesign, topic repositioning, slot restructuring.

**Surface B — Author Craft View**
The question: *How well did this person teach what they taught?*
Signals:
- Session rating as a floor signal: below 4.0 flags a problem; above 4.0 is not a ranking signal
- Rewatch rate (Rec Views 1w ÷ Enrolled): revealed preference — students return to sessions that matter
- Rewatch long-tail (Rec Views 4w ÷ 1w): growing interest indicates reference value
- Feedback craft themes: AI-extracted — clarity, pacing, engagement, storytelling, actionability (not overall sentiment)
- Consistency across masteries: std deviation of craft signals where the same author appears in multiple programs
- Trajectory: is this author improving, stable, or declining across cohorts?

Triggers decisions about: author re-booking, author development, discontinuation, fee negotiation.

**Divergence flagging**
When Curriculum Fit and Author Craft diverge — high craft score, low fit; or high fit, low craft — the system surfaces this explicitly. The fix for each divergence is different and must not be conflated.

**Finance layer**
- Speaker fee per session, total cost (fee + expenses), royalties (2025 / 2026)
- ROI view: cost-per-session against craft and fit signals — surfaces high-cost / low-fit authors and high-value / low-cost authors for negotiation decisions
- Finance signals surface alongside, not inside, the two evaluation surfaces

---

### 2. Cross-Mastery Overview Dashboard ("Control Tower")

A single view showing all speakers across all 6 masteries:
- Ranked by composite score
- Filters: by mastery, by year (2024/2025/2026), by session type, by speaker tier
- **Quadrant chart**: Quality (Y axis) vs Cost-Efficiency (X axis) — 4 zones:
  - ⭐ High quality, high ROI → Anchor speakers (invite again)
  - High quality, low ROI → Premium speakers (use selectively)
  - Low quality, high ROI → Develop-or-replace speakers
  - Low quality, low ROI → Discontinue
- Top 5 and bottom 5 speakers by composite score
- Cross-mastery pattern finder: which topics / formats / durations consistently outperform?

---

### 3. Per-Mastery Drill-Down

When a specific mastery is selected (e.g. Speaking & Influence):
- Full lesson-by-lesson performance table
- Each speaker's sessions within that mastery with individual metrics
- Module-level analysis: which modules had highest engagement?
- Cohort comparison: 2025 cohort vs 2026 cohort
- Student journey overlay: onboarding confidence → session ratings → final outcome
- Recording engagement curve: view dropoff per lesson across the curriculum

---

### 4. Speaker Profile View

Per-speaker card showing:
- Composite score and tier (Anchor / Premium / Develop / Discontinue)
- Performance summary: avg rating, sessions, total attendees, rec views, ROI index
- Per-mastery breakdown
- Student feedback themes (AI-extracted: praise and criticism clusters)
- Financial summary: 2025/2026 speaker fees and royalties
- Contract link and summary

---

### 5. Metrics Engine — Canonical Definitions

| Metric | Definition | Source | Notes |
|---|---|---|---|
| Avg Rating | Mean of all student ratings for a speaker's sessions | `Avg Rating` rollup in Lessons | Already computed in Airtable |
| Rating Count | Total feedback submissions | `# Ratings` rollup | Confidence weighting |
| Live Attendance | Headcount on live call | `Attendees` in Lessons | Raw number |
| Attendance Rate | Attendees ÷ Enrolled | Computed from Lessons fields | % |
| Rec Views (1w) | Replay views within first week | `Rec. Views (1 week)` in Lessons | |
| Rec Views (4w) | Replay views by week 4 | `Rec. Views (after 4 weeks)` in Lessons | |
| Rec Retention | Rec Views (1w) ÷ Enrolled | Computed | Normalised replay interest |
| View Long-tail | Rec Views (4w) ÷ Rec Views (1w) | Computed | >1.0 = growing interest |
| Follow-up Rate | % feedback with Follow-up Needed = true | `Follow up Needed` in Session Feedback | Lower = better |
| Speaker Fee | Actual fee paid per engagement | `Fee` in Author x Event; year rollups in Author Entities | Use Actual Transactions for confirmed |
| Royalties | Royalty payments made | `2025/2026 Actual Royalties Amount` in Author Entities | Requires finance join |
| Total Cost | Fee + Other Expenses | `Total Cost` in Author x Event | Per engagement |
| ROI Index | (Avg Rating × Attendees × Rec Retention) ÷ Total Cost | Computed | Normalise 0–100 |
| Cross-Program Count | # of distinct masteries the speaker has taught in | Computed from join | |
| Rating Consistency | Std deviation of Avg Rating across masteries | Computed | Low = reliable |

---

### 6. AI Transcript & Feedback Analysis (Phase 4)

Pass lesson transcripts and feedback batches through Claude API:

- **Transcript analysis**: extract topics covered, teaching techniques, energy level, interaction style, key frameworks, actionability score
- **Feedback analysis**: extract overall sentiment, praise themes, criticism themes, transformation mentions, recommend score
- Cross-reference with student onboarding survey goals
- Surface: which speaking techniques correlate with highest ratings?
- Surface: what do students say about top vs bottom performers?

API model: `claude-sonnet-4-6` (or latest available Sonnet)

---

### 7. Data Model — Join Strategy

**Primary join**: `Speaker.Name` (string match) across all 6 mastery bases → `Author.Name` in Finance base

**Secondary join**: `Product Code` in Actual Transactions → mastery name mapping

**Year filter**: `Year (Cohort)` in Lessons + `Invoice Year` formula in Actual Transactions

**Data sources**:
- 6 Mastery Airtable bases (Lessons, Session Feedback, Student Onboarding Survey tables)
- Finance base `appgZyJyIam1yPgOx` (Authors, Author Entities, Actual Transactions, Product Code tables)

**Key field IDs — Speaking & Influence (`appKlfvxdXofNlFfk`)**:

Lessons (`tblxZy7RMJ2naoHhS`): `fldV2EULr68GXKJS1` (Title), `fldTcENZo3emsSz3p` (Speaker), `fldFcRtvZHHO7qQvE` (Attendees), `fldHL2YJDPy0bywDX` (Avg Rating), `fldhi6fUR8ILI99yk` (# Ratings), `fldSG2wzVP4qsl5Jd` (Rec Views 1w), `fldN90svvI2VMiZ3P` (Rec Views 4w), `fldkTETbjHFWZ0Ljp` (Enrolled), `fldioHdWx7jJJDGFT` (Type), `fldiaV5la37eaNJuE` (Module), `fldzsqcM0etLPYxxA` (Year), `fldhXtb5dyPE1e1Qe` (Transcript)

Session Feedback (`tblIVJT8HaiLcrx62`): `fldqg7Oe7AeNZEruc` (Rating), `flddAP3X5OGwMbIA2` (Feedback text), `fldB8uZjz2X99B1QB` (Speaker lookup), `fldgZbARNY5VHAes8` (Follow-up Needed)

Finance — Author Entities (`tbli5GhmDuR155bO0`): `flds0gjNMqUctMg0C` (2026 Fee), `fldCpirjRxclwWy4T` (2026 Royalties), `fldFLu6IB11sqpyIV` (2025 Fee), `flduvu5wgNDZhMlTC` (2025 Royalties)

Finance — Actual Transactions (`tbluv0jndDIHaTRZA`): `fldfxvxm35njUGKY3` (Invoice Amount), `fldYHy72BTqWsuHgs` (Net Amount), `fldNtu1HoLUA3cbCb` (Invoice Year), `fldM4P5m6hJbrk2ps` (Product Code)

## Boundaries

**In scope:**
- All 6 mastery Airtable bases (Lessons, Session Feedback, Student Onboarding Survey, Speakers tables)
- Finance base (`appgZyJyIam1yPgOx`) — author fees, royalties, actual transactions
- Student-level drill-down: aggregated by default; individual student records accessible to internal users (PII handling policy TBD — see Open Questions)
- Author-level detail views: full craft and fit profile per author, visible to internal users
- External benchmarking against industry data: in scope, data source TBD (see Open Questions)
- Student lifetime value tracking: in scope as a goal; requires data join to financial/CRM system outside Airtable (see Open Questions)

**Out of scope — v1:**
- Author/speaker-facing reports or dashboards: internal only in v1; email summary report deferred to v2
- Author acquisition and scouting: this system evaluates existing authors only, not prospects
- Summit program data: deferred — mastery bases only in v1
- Real-time data: weekly refresh via Airtable MCP is the data freshness model; live session data is not required

**Data freshness model:**
Weekly refresh on demand via Airtable MCP. No streaming or webhook-based updates in v1.

## Success Criteria

| What we measure | Target |
|---|---|
| Speakers scored and ranked | 100% of speakers with ≥2 sessions |
| Cross-mastery coverage | All 6 masteries in unified view |
| Finance join coverage | ≥80% of speakers matched to fee data |
| Dashboard load time | < 5 seconds |
| Insight questions answered | 3 core questions answered: what works / best student outcome / most profitable |
| Team adoption | Marijana + Marta using it for next curriculum planning cycle |

## Open Questions

| Question | Owner | Status |
|---|---|---|
| How do we handle speaker name mismatches between bases? (e.g. "Dr. John Smith" vs "John Smith") | Marta / Rhythm | Open — need fuzzy match or canonical name field |
| Is the Finance base fully populated for 2025 speaker fees? | Jane (Finance) | Mostly done, few empty records |
| Do Entrepreneurship, Spiritual, Social bases have feedback tables? | Marta | Not confirmed — needs schema check |
| What is the right ROI formula weighting? | Marijana | Open — needs sign-off |
| Should royalties be included in cost for ROI or tracked separately? | Finance | Open |
| Who has editorial control over the Speaker Intelligence view? | Marijana | To be confirmed |
| External benchmarking: what data source? | Rhythm | Open — speaker bureau rates? Educator platform benchmarks (Coursera, Masterclass)? Industry NPS standards? Source must be identified before this feature can be scoped |
| Student LTV: where does this data live? | Rhythm / Finance | Open — student purchase history and lifetime revenue is likely in a CRM or financial system outside Airtable; join strategy and data access need to be confirmed |
| Student-level drill-down: PII policy | Rhythm / Legal | Open — individual student records are accessible to internal users; masking rules and access controls need to be defined before building |

## Epics

### Epic 1 — Speaking Mastery Baseline (Phase 1)
**Goal**: Prove the model works on one mastery before scaling.
- Pull all lesson + feedback records from Speaking & Influence (`appKlfvxdXofNlFfk`)
- Compute per-speaker metrics: Avg Rating, # Ratings, Attendees, Rec Views (1w / 4w)
- Rank all Speaking speakers by composite score (quality + reach)
- Generate top 5 / bottom 5 ranked list
- Identify best-performing modules and lesson types (solo vs Q&A vs hotseat)
- Surface: which session durations get highest ratings?
- **Output**: React/HTML artifact — Speaking Mastery speaker performance table, sortable by any metric

### Epic 2 — Cross-Mastery Aggregation (Phase 2)
**Goal**: Join all 6 mastery bases and find cross-program patterns.
- Pull lesson + feedback data from all 6 mastery bases
- Join on speaker name (string match with normalisation for name variants)
- Build unified speaker table: one row per speaker, columns for each mastery's metrics
- Identify speakers appearing in multiple masteries
- Compare rating consistency across masteries
- Surface: which topic categories perform best cross-program?
- **Output**: Cross-mastery comparison table, quadrant chart (Quality vs Reach), pattern summary

### Epic 3 — Finance Join & ROI Scoring (Phase 3)
**Goal**: Connect speaker cost to value delivered — who is worth the money?
- Pull Author Entities financials from Finance base
- Match to speaker records via Author name
- Pull Actual Transactions by Invoice Year (2025 / 2026)
- Compute ROI Index per speaker
- Build 2×2 profitability-quality quadrant
- **Output**: ROI-ranked speaker list, profitability quadrant, finance breakout by mastery

### Epic 4 — AI Transcript & Feedback Analysis (Phase 4)
**Goal**: Go beyond numbers — understand *why* speakers perform the way they do.
- Pass lesson transcripts through Claude API for topic/technique extraction
- Pass feedback text through Claude API for sentiment and theme extraction
- Cross-reference with student onboarding survey goals
- Surface which teaching techniques correlate with highest ratings
- **Output**: Per-speaker qualitative intelligence card, topic taxonomy, feedback theme clusters

### Epic 5 — Dashboard UI (Phase 5)
**Goal**: Deliver the three-view dashboard as a production-ready interface.
- Cross-Mastery Overview with quadrant chart and ranked tables
- Per-Mastery Drill-Down with module heatmap and lesson timeline
- Speaker Profile View with metrics, financials, and feedback themes
- **Output**: Deployed dashboard (React artifact or hosted UI) usable by Marijana and Marta

### Epic 6 — Weekly Slack Intelligence Digest (Phase 6)
**Goal**: Push intelligence to where decisions are made — without requiring a new habit.
- Weekly Claude-generated narrative digest posted to Slack, triggered by the Airtable MCP refresh
- Digest surfaces flags (divergence signals, trajectory drops, follow-up rate spikes), one standout, and items on the radar
- Plain English briefing — readable in 90 seconds — with deep-links into the dashboard for full detail
- No tables, no raw data dumps: a briefing, not a report
- **Output**: Automated weekly Slack post to `#speaker-intelligence` channel, linked to live dashboard views
- **Rationale**: the material of this system (async data + AI analysis) naturally produces a narrative. A dashboard is a pull surface that requires a habit to open. The digest is a push surface that surfaces the signal where Marijana and Marta already are.
