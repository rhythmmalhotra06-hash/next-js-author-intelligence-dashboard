# Mindvalley Speaker Intelligence System — PRD
**Version:** 1.0  
**Date:** May 2026  
**Author:** Rhythm Malhotra (AR)  
**Status:** Draft — for Claude Project context

---

## 1. Purpose & Problem Statement

Mindvalley currently runs 6 active Mastery programs (Speaking & Influence, Manifesting, AI Mastery, Entrepreneurship, Spiritual, Social), each with its own Airtable base. Every program has lesson-level data — attendance, ratings, transcripts, feedback, recording views, speaker fees — but this data is analysed **in isolation** for each program individually.

The result:
- No cross-mastery view of which speakers and topic types perform best
- No ROI picture connecting speaker cost to student value delivered
- Curriculum decisions made on gut feel rather than pattern evidence
- Finance data (fees, royalties, invoices) lives in a separate system and is never joined to performance data

**We need a Speaker Intelligence System that:**
1. Unifies all 6 mastery data sources into a single analytical layer
2. Scores every speaker on quality, reach, and cost-efficiency
3. Enables both a holistic cross-mastery view AND drill-down into each individual mastery
4. Answers: *What works? What generates the best student outcomes? What is most profitable?*

---

## 2. Data Sources & What We Have

### 2.1 Mastery Program Bases (6 total)

All 6 Mastery bases share a near-identical schema. The primary tables per mastery are:

| Table | Key Fields | What It Tells Us |
|---|---|---|
| **📗 Lessons** | Lesson Title, Speaker, Module, Type, Status, Attendees, Avg Rating, # Ratings, Rec Views (1w / 4w), Transcript, Chat, Slides, Duration, Year (Cohort) | Per-session performance and content |
| **📆 Schedule** | Date/Time, Zoom link, AVR Rating rollup, COUNT Ratings rollup, Feedback Rollup, Attendees, Rec Views (1w / 2w / 4w), Enrolled, Year (Cohort) | Scheduling layer with engagement metrics |
| **📩 Session Feedback** | Rating (1–5), Feedback text (rich text), Email, Follow-up Needed, Follow-up Done, Turnaround Time, CX Notes, Feedback Calculation formula | Granular per-student session feedback |
| **🙋 Student Onboarding Survey** | Confidence rating, Comfort rating, Goals, Techniques, Focus, Daily practice, Age group, Gender, Location | Student baseline — what they want and where they start |
| **🙋 Speakers** | Name, Credential, Bio, # Lessons, Program Speaker (yes/no), Mastery Lessons linked | Speaker roster per mastery |
| **🏁 Modules / Parts** | Module name, Lesson count, Year | Curriculum structure — how lessons are grouped |
| **Cohorts** | Start/End date, Recordings access until, Format, Braze Tag, Product ID | Program configuration — each cohort run |

**Mastery bases and IDs:**
- Speaking & Influence: `appKlfvxdXofNlFfk` (table: `tblxZy7RMJ2naoHhS`)
- Manifesting: `appRBp4Lhmtf6im3W` (table: `tblxZy7RMJ2naoHhS`)
- AI Mastery: `appHS19yXObg8sHZv`
- Entrepreneurship: `appJVtywkn9mTFbLs`
- Spiritual: `appsRrP9oJQMD5nZU`
- Social: `appf3Molaaw26nIH8`

**Key notes on data availability:**
- Session feedback (ratings + text): confirmed in Speaking, Manifesting, AI
- Lesson transcripts (as attachments): Speaking has them; Manifesting partial
- Attendees + recording views: available in all 6 masteries
- Student onboarding surveys: Speaking, Manifesting, AI confirmed

---

### 2.2 Finance & Author Base (ROI Layer)

**Base:** `appgZyJyIam1yPgOx`

This base is the financial source of truth for all speaker costs. Key tables:

#### Authors (`tblAV7GcgFFjH3pHg`)
Central author entity with:
- `Name` — primary join key to mastery speaker records
- `MV Score`, `Final Weighted Score`, `Author Tier` — existing internal scoring
- `Fame Of Teacher` (rating field)
- Social reach: `Instagram Followers`, `YouTube Subscribers`, `TikTok Followers`, `Email List Size`, `Total Social Reach`
- `90d Growth %`, `Engagement Rate`
- Scoring dimensions: `R – Values Alignment Score`, `N – Production Quality Score`, `N – Community Strength Score`, `I – Revenue Potential Score`, `I – Curriculum Fit Score`, `I – Growth Velocity Score`, `I – Engagement Quality Score`
- `Deal Status`, `Year of Onboarding`
- `Selection Recommendation`, `Required Gate Status`

#### Author x Event (`tblgq4Ta5X9N3wyqm`)
Per-engagement cost record with:
- `Fee` (currency) — confirmed speaker fee
- `Projected Fee` (currency) — planned fee
- `Other Expenses` (currency) — travel, accommodation, etc.
- `Total Cost` (currency) — all-in cost per engagement
- `Contract` (attachment)
- Linked to `Author` and `Calendar (Event)`

#### Author Entities (`tbli5GhmDuR155bO0`)
Legal entity layer with actual rolled-up financials:
- `2026 Actual Speaker Fee Amount` (rollup)
- `2026 Actual Royalties Amount` (rollup)
- `2025 Actual Speaker Fee Amount` (rollup)
- `2025 Actual Royalties Amount` (rollup)
- `Contract Summary` (AI-extracted)

#### Actual Transactions (`tbluv0jndDIHaTRZA`)
Invoice-level financial records:
- `Invoice Amount`, `Net Amount`
- `Invoice Date`, `Invoice Year` (formula)
- `Bill Status`, `Payment Status`
- `Product Code` (links to mastery product)
- `GL Expense Code` — speaker fee vs royalties classification
- `Author Entity` (linked) → to resolve which author

#### Product Code (`tblxpmoOGCyJhZt12`)
Maps financial transactions to masteries:
- `2025 Speaker Fee` (rollup)
- `2026 Speaker Fee` (rollup)
- `2025 Royalties` (rollup)
- `2026 Royalties` (rollup)
- `Product Name`, `Product Code`, `Business Unit`

---

## 3. What We Want to Build

### 3.1 The Speaker Scorecard

For every speaker across all masteries, we want a single composite score built from:

```
Speaker Score = f(Quality, Reach, Cost-Efficiency, Cross-Program Performance)
```

**Quality Score** (40% weight):
- Average session rating (1–5 stars, from Session Feedback)
- # of ratings received (sample size confidence)
- Feedback follow-up rate (% of submissions flagged for follow-up — lower = better)
- Student-stated goal alignment (topic match between lesson and onboarding survey wants)

**Reach Score** (30% weight):
- Live attendees (absolute count)
- Attendance rate (attendees / enrolled)
- Recording retention: Rec Views (1 week) — indicates immediate replay value
- Recording long-tail: Rec Views (4 weeks) — indicates lasting value
- View decay rate: (4w views – 1w views) / 1w views

**Cost-Efficiency Score** (30% weight) — requires finance join:
- Speaker fee per session
- Total cost (fee + expenses) per session
- Royalties paid (2025 / 2026)
- ROI Index = (Avg Rating × Attendees × Rec Retention Index) ÷ Total Cost
- Normalised across all speakers for comparison

**Cross-Program Bonus:**
- Number of masteries featured in (breadth)
- Consistency of rating across masteries (variance — low variance = reliable performer)
- Year-over-year trend (improving / stable / declining)

---

### 3.2 Two Views: Holistic + Drill-Down

#### View 1 — Cross-Mastery Overview (the "control tower")
A single dashboard that shows:
- All speakers across all 6 masteries ranked by composite score
- Filters: by mastery, by year (2024/2025/2026), by session type, by speaker tier
- Quadrant view: Quality (Y axis) vs Cost-Efficiency (X axis) — 4 zones:
  - ⭐ High quality, high ROI → Anchor speakers (invite again)
  - 🔍 High quality, low ROI → Premium speakers (use selectively)
  - 🔄 Low quality, high ROI → Develop-or-replace speakers
  - ❌ Low quality, low ROI → Discontinue
- Top 5 and bottom 5 speakers by composite score
- Cross-mastery pattern finder: Which topics / formats / durations consistently outperform?

#### View 2 — Per-Mastery Intelligence Drill-Down
When you select a specific mastery (e.g. Speaking & Influence):
- Full lesson-by-lesson performance table
- Each speaker's sessions within that mastery, with individual metrics
- Module-level analysis: which modules had highest engagement?
- Cohort comparison: 2025 cohort vs 2026 cohort (if available)
- Student journey overlay: onboarding confidence → session ratings → final outcome
- Recording engagement curve: view dropoff per lesson across the curriculum

---

## 4. Data Model — How Everything Joins

```
Finance Base (appgZyJyIam1yPgOx)
│
├── Authors (tblAV7GcgFFjH3pHg)
│     └── Name [JOIN KEY → Speaker.Name in each mastery base]
│
├── Author Entities (tbli5GhmDuR155bO0)
│     ├── 2025 Speaker Fee Amount (rollup)
│     ├── 2026 Speaker Fee Amount (rollup)
│     ├── 2025 Royalties Amount (rollup)
│     └── 2026 Royalties Amount (rollup)
│
└── Actual Transactions (tbluv0jndDIHaTRZA)
      ├── Invoice Amount
      ├── Net Amount
      ├── Invoice Year
      └── Product Code → [maps to mastery name]
          └── 2025/2026 Speaker Fee & Royalties rollups

Mastery Bases (×6)
│
├── 📗 Lessons
│     ├── Lesson Title
│     ├── Speaker [JOIN KEY → Author.Name]
│     ├── Attendees
│     ├── Avg Rating (rollup from Feedback)
│     ├── Rec Views (1w), Rec Views (4w)
│     ├── Type (lesson / Q&A / hotseats)
│     ├── Duration
│     ├── Module
│     └── Year (Cohort)
│
├── 📩 Session Feedback
│     ├── Rating (1–5)
│     ├── Feedback (text — for sentiment analysis)
│     └── Follow-up Needed
│
└── 🙋 Student Onboarding Survey
      ├── Confidence (rating) → baseline
      ├── Comfort (rating) → baseline
      ├── Goals (text)
      └── Wants to Learn (multi-select)
```

**Join strategy:**
- Primary join: `Speaker.Name` (string match) across mastery bases and Finance base
- Secondary join: `Product Code` in Actual Transactions → mastery name mapping
- Year filter: `Year (Cohort)` field in Schedule / Lessons + `Invoice Year` formula in Actual Transactions

---

## 5. Metrics Definitions (Canonical)

| Metric | Definition | Source Field(s) | Notes |
|---|---|---|---|
| Avg Rating | Mean of all student ratings for a speaker's sessions | `Avg Rating` rollup in Lessons | Already computed in Airtable |
| Rating Count | Total feedback submissions | `# Ratings` rollup | Use for confidence weighting |
| Live Attendance | Headcount on live call | `Attendees` in Lessons | Raw number |
| Attendance Rate | Attendees / Enrolled | `Attendees` ÷ `Enrolled` in Lessons | % |
| Rec Views (1w) | Replay views within first week | `Rec. Views (1 week)` in Lessons | |
| Rec Views (4w) | Replay views by week 4 | `Rec. Views (after 4 weeks)` in Lessons | |
| Rec Retention | Rec Views (1w) ÷ Enrolled | Computed | Normalised replay interest |
| View Long-tail | Rec Views (4w) ÷ Rec Views (1w) | Computed | > 1.0 = growing interest |
| Follow-up Rate | % feedback with Follow-up Needed = true | `Follow up Needed` in Session Feedback | Lower = better |
| Speaker Fee | Actual fee paid per engagement | `Fee` in Author x Event; `2025/2026 Actual Speaker Fee Amount` in Author Entities | Use Actual Transactions for confirmed |
| Royalties | Royalty payments made | `2025/2026 Actual Royalties Amount` in Author Entities | Requires finance join |
| Total Cost | Fee + Other Expenses | `Total Cost` in Author x Event | Per engagement |
| ROI Index | (Avg Rating × Attendees × Rec Retention) ÷ Total Cost | Computed | Normalise 0–100 for display |
| Cross-Program Count | # of distinct masteries the speaker has taught in | Computed from join | |
| Rating Consistency | Std deviation of Avg Rating across masteries | Computed | Low = reliable |

---

## 6. Features — Prioritised

### Phase 1 — Speaking Mastery Baseline (no new data needed)
**Goal:** Prove the model works on one mastery before scaling.

- [ ] Pull all lesson records from Speaking & Influence Airtable
- [ ] Compute per-speaker metrics: Avg Rating, # Ratings, Attendees, Rec Views (1w / 4w)
- [ ] Rank all speakers in Speaking by composite score (quality + reach)
- [ ] Generate top 5 / bottom 5 ranked list
- [ ] Identify best-performing modules and lesson types (solo lesson vs Q&A vs hotseat)
- [ ] Surface: Which session durations get highest ratings?

**Output:** A Claude artifact (React dashboard or HTML) showing Speaking Mastery speaker performance table, sortable by any metric.

---

### Phase 2 — Cross-Mastery Aggregation
**Goal:** Join all 6 mastery bases and find cross-program patterns.

- [ ] Pull lesson + feedback data from all 6 mastery bases
- [ ] Join on speaker name (string match, with normalisation for name variants)
- [ ] Build unified speaker table: one row per speaker, columns for each mastery's metrics
- [ ] Identify speakers who appear in multiple masteries
- [ ] Compare rating consistency across masteries (who is reliably great everywhere vs. highly variable?)
- [ ] Surface: Which topic categories (mindset, technique, practical tools, Q&A) perform best?

**Output:** Cross-mastery speaker comparison table. Quadrant chart (Quality vs Reach). Pattern summary.

---

### Phase 3 — Finance Join & ROI Scoring
**Goal:** Connect speaker cost to value delivered. Answer: who is worth the money?

- [ ] Pull Author Entities financials from Finance base (`appgZyJyIam1yPgOx`)
- [ ] Match to speaker records via Author name
- [ ] Pull Actual Transactions by Invoice Year (2025 / 2026)
- [ ] Compute ROI Index per speaker: (Avg Rating × Attendees × Rec Retention) ÷ Total Cost
- [ ] Build the 2×2 profitability-quality quadrant (Rhythm's demo)
- [ ] Identify: High quality, low cost speakers (anchor these)
- [ ] Identify: High cost, low quality speakers (review these)

**Output:** ROI-ranked speaker list. Profitability quadrant visual. Finance breakout by mastery (using Product Code mapping).

---

### Phase 4 — AI Transcript & Feedback Analysis
**Goal:** Go beyond numbers — understand *why* speakers perform the way they do.

- [ ] Pass lesson transcripts through Claude API (claude-sonnet-4-6)
- [ ] Extract: topics covered, teaching techniques used, energy level, interaction style
- [ ] Pass feedback text through Claude API
- [ ] Extract: sentiment, themes, specific praise and criticism patterns
- [ ] Cross-reference with student onboarding survey goals
- [ ] Surface: Which speaking techniques correlate with highest ratings?
- [ ] Surface: What do students say about top vs bottom performers?

**Output:** Per-speaker qualitative intelligence card. Topic taxonomy across curriculum. Feedback theme clusters.

---

## 7. Claude API Integration Design

For the AI analysis features (Phase 4), use the Anthropic API directly:

```javascript
// Transcript topic extraction
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are a curriculum analyst for Mindvalley. 
    Analyse this lesson transcript and return ONLY a JSON object with:
    {
      "topics": ["topic1", "topic2"],
      "teaching_techniques": ["technique1"],
      "energy_level": "high|medium|low",
      "interaction_style": "lecture|interactive|coaching|qa",
      "key_frameworks": ["framework1"],
      "actionability_score": 1-10
    }`,
    messages: [{ role: "user", content: transcriptText }]
  })
});
```

```javascript
// Feedback sentiment extraction
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are a CX analyst. Analyse this batch of session feedback and return ONLY JSON:
    {
      "overall_sentiment": "positive|mixed|negative",
      "praise_themes": ["theme1", "theme2"],
      "criticism_themes": ["theme1"],
      "transformation_mentions": true|false,
      "recommend_score": 0-10
    }`,
    messages: [{ role: "user", content: feedbackBatch }]
  })
});
```

---

## 8. Dashboard UI — What It Should Look Like

### 8.1 Top-Level View (Cross-Mastery)

```
┌─────────────────────────────────────────────────────────────┐
│  MINDVALLEY SPEAKER INTELLIGENCE                             │
│  Filter: [All Masteries ▾] [2025 ▾] [All Types ▾]          │
├─────────────────────────────────────────────────────────────┤
│  ⭐ 4.7 avg  |  47 speakers  |  243 sessions  |  $2.1M cost │
├──────────────────────┬──────────────────────────────────────┤
│  QUALITY vs ROI      │  TOP SPEAKERS                        │
│  (quadrant chart)    │  1. Speaker A  ⭐4.9  ROI: 94        │
│                      │  2. Speaker B  ⭐4.8  ROI: 88        │
│  ⭐High Quality      │  3. Speaker C  ⭐4.7  ROI: 82        │
│  ROI High | ROI Low  │  ...                                 │
│  ──────────────────  │                                      │
│  ⭐Low Quality       │  BOTTOM SPEAKERS                     │
│  ROI High | ROI Low  │  43. Speaker X  ⭐3.1  ROI: 12      │
│                      │  ...                                 │
└──────────────────────┴──────────────────────────────────────┘
│  PATTERN INSIGHTS                                            │
│  • Hotseats sessions score 0.4★ higher than lectures        │
│  • 90-min sessions outperform 60-min by 12% on rec views    │
│  • Speakers with 3+ masteries score 0.3★ higher on average  │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Mastery Drill-Down View (e.g. Speaking & Influence)

```
┌─────────────────────────────────────────────────────────────┐
│  ← All Masteries    SPEAKING & INFLUENCE MASTERY            │
│  [2025 Cohort ▾]   43 lessons  |  8 speakers  |  ⭐4.5 avg  │
├──────────────────┬──────────────────────────────────────────┤
│  MODULE HEATMAP  │  SPEAKER BREAKDOWN                       │
│  Module 1: ⭐4.8 │  Speaker    Rating  Attend  Rec(1w) Cost │
│  Module 2: ⭐4.3 │  Name A     ⭐4.9    142     89%   $X    │
│  Module 3: ⭐4.6 │  Name B     ⭐4.7    118     71%   $X    │
│  Module 4: ⭐4.1 │  Name C     ⭐4.2     98     43%   $X    │
│                  │  ...                                      │
├──────────────────┴──────────────────────────────────────────┤
│  LESSON TIMELINE                                             │
│  [lesson 1] [lesson 2] [lesson 3] ... ← rating sparkline    │
├─────────────────────────────────────────────────────────────┤
│  STUDENT JOURNEY                                             │
│  Avg confidence at signup: 2.8/5  →  Feedback sentiment: +  │
│  Top goals stated: Public speaking, Storytelling, Stage pres.│
│  Topics students most wanted: Nervousness, Vocal presence    │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Speaker Profile View

```
┌─────────────────────────────────────────────────────────────┐
│  SPEAKER: [Name]              [Contact] [Contract] [History]│
│  Tier: ⭐ Anchor  |  Score: 91/100  |  3 masteries          │
├─────────────────────────────────────────────────────────────┤
│  PERFORMANCE SUMMARY                                         │
│  Avg Rating: 4.8  |  Sessions: 12  |  Total Attendees: 1,247│
│  Rec Views (1w): 74%  |  Rec Long-tail: 1.3×  |  Fee: $X   │
│  ROI Index: 88 (top 10%)                                     │
├─────────────────────────────────────────────────────────────┤
│  BY MASTERY                                                  │
│  Speaking 2025: ⭐4.9 — 3 sessions — ROI: 94               │
│  Manifesting 2025: ⭐4.7 — 2 sessions — ROI: 81             │
├─────────────────────────────────────────────────────────────┤
│  STUDENT FEEDBACK THEMES                                     │
│  👍 Practical tools, Real stories, Energy, Clarity          │
│  👎 Wanted more Q&A time, Slides dense                      │
├─────────────────────────────────────────────────────────────┤
│  FINANCIAL                                                   │
│  2025 Speaker Fee: $X  |  2025 Royalties: $X               │
│  2026 Speaker Fee: $X  |  2026 Royalties: $X               │
│  Contract: [View] [Summarise]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Build Approach — What to Tell Claude

When starting a new Claude session or Claude Code project, use this as the system prompt / context file:

```
You are a data analyst and full-stack developer building 
the Mindvalley Speaker Intelligence System.

CONTEXT:
- Mindvalley runs 6 Mastery programs, each with an Airtable base
- All 6 masteries share the same schema: Lessons, Schedule, 
  Session Feedback, Student Survey, Speakers, Modules, Cohorts
- There is a separate Finance base (appgZyJyIam1yPgOx) with:
  Authors, Author x Event (fees), Author Entities (rollup financials),
  Actual Transactions (invoice-level)
- The primary join key is Speaker Name (string) across all bases

WHAT YOU HAVE ACCESS TO:
- Airtable MCP connector (connected)
- All 6 mastery bases
- Finance/Author base

WHAT WE WANT TO BUILD:
1. Cross-mastery speaker performance dashboard (React artifact)
2. Per-mastery drill-down view
3. Speaker profile cards with metrics + financial data
4. ROI quadrant chart (Quality vs Cost-Efficiency)

START WITH:
Pull data from Speaking & Influence Mastery (appKlfvxdXofNlFfk):
- Lessons table (tblxZy7RMJ2naoHhS)
- Session Feedback table (tblIVJT8HaiLcrx62)
Build the speaker scorecard for this mastery as proof of concept.
```

---

## 10. Success Metrics for This Project

| What we measure | Target |
|---|---|
| Speakers scored and ranked | 100% of speakers with ≥2 sessions |
| Cross-mastery coverage | All 6 masteries in unified view |
| Finance join coverage | ≥80% of speakers matched to fee data |
| Dashboard load time | < 5 seconds |
| Insight questions answered | 3 core questions (what works / best outcome / most profitable) |
| Team adoption | Marijana + Marta using it for next curriculum planning cycle |

---

## 11. Open Questions & Dependencies

| Question | Owner | Status |
|---|---|---|
| How do we handle speaker name mismatches between bases? (e.g. "Dr. John Smith" vs "John Smith") | Marta / Rhythm | Open — need fuzzy match or canonical name field |
| Is the Finance base fully populated for 2025 speaker fees? | Jane (Finance) | Rhythm confirmed mostly done, few empty records |
| Do Entrepreneurship, Spiritual, Social bases have feedback tables? | Marta | Not confirmed — needs schema check |
| What is the right ROI formula weighting? | Marijana | Open — needs sign-off |
| Should royalties be included in cost for ROI or tracked separately? | Finance | Open |
| Who has editorial control over the Speaker Intelligence view? | Marijana | To be confirmed |

---

## 12. Airtable Field ID Reference (Speaking & Influence)

For Claude Code / API use — key field IDs in the Speaking base:

**Lessons (`tblxZy7RMJ2naoHhS`):**
- `fldV2EULr68GXKJS1` — Lesson Title
- `fldTcENZo3emsSz3p` — Speaker (linked)
- `fldFcRtvZHHO7qQvE` — Attendees
- `fldHL2YJDPy0bywDX` — Avg Rating (rollup)
- `fldhi6fUR8ILI99yk` — # Ratings (rollup)
- `fldSG2wzVP4qsl5Jd` — Rec Views (1 week)
- `fldN90svvI2VMiZ3P` — Rec Views (after 4 weeks)
- `fldkTETbjHFWZ0Ljp` — Enrolled
- `fldioHdWx7jJJDGFT` — Type (lesson / Q&A / etc.)
- `fldiaV5la37eaNJuE` — Module (linked)
- `fldzsqcM0etLPYxxA` — Year (Cohort)
- `fldhXtb5dyPE1e1Qe` — Transcript (attachment)

**Session Feedback (`tblIVJT8HaiLcrx62`):**
- `fldqg7Oe7AeNZEruc` — Rating (1–5)
- `flddAP3X5OGwMbIA2` — Feedback (rich text)
- `fldB8uZjz2X99B1QB` — Speaker (lookup)
- `fldgZbARNY5VHAes8` — Follow-up Needed
- `fldpVhE6iYiA9wXE5` — Feedback Calculation (formula)

**Finance — Author Entities (`tbli5GhmDuR155bO0`):**
- `flds0gjNMqUctMg0C` — 2026 Actual Speaker Fee Amount
- `fldCpirjRxclwWy4T` — 2026 Actual Royalties Amount
- `fldFLu6IB11sqpyIV` — 2025 Actual Speaker Fee Amount
- `flduvu5wgNDZhMlTC` — 2025 Actual Royalties Amount

**Finance — Actual Transactions (`tbluv0jndDIHaTRZA`):**
- `fldfxvxm35njUGKY3` — Invoice Amount
- `fldYHy72BTqWsuHgs` — Net Amount
- `fldNtu1HoLUA3cbCb` — Invoice Year (formula)
- `fldM4P5m6hJbrk2ps` — Product Code (linked)

---

*End of PRD — v1.0*
