# Author Intelligence — Sprint Plan

**Product**: Mindvalley Speaker Intelligence System  
**Stack**: Next.js (App Router) + TypeScript + Tailwind v4 + OneFlow DS + Airtable MCP + Claude API + Slack MCP  
**Schema reference**: `dashboard/lib/airtable-schema.ts` (all Airtable IDs verified ✅)  
**Design tokens**: `DESIGN_SYSTEM.md` + `design/oneflow-ds.analysis.md`

---

## Sprint 1 — Project Foundation + Speaking Mastery Baseline [COMPLETE ✅]

**Status**: Complete — see `/prd/.builds/sprint-1-speaking-baseline.build.md`

**Goal**: Scaffold the Next.js app with OneFlow DS and display Author Craft and Curriculum Fit signals for Speaking & Influence from live Airtable data.

**Scope**: Project initialization, OneFlow DS token integration, Airtable MCP connectivity, Speaking & Influence data pull (Lessons + Session Feedback), Author Craft and Curriculum Fit signal computation, basic table UI.

**Acceptance criteria**:

1. Running `npm run dev` opens a web page that loads without console errors and displays the OneFlow DS brand colours (Mindvalley Purple `#7a12d4`) and typography (Google Sans display, Plus Jakarta Sans body).
2. The page displays a table of Speaking & Influence lessons showing Lesson Title, Speaker name, Attendees, Avg Rating, Rec Views (1w), and Enrolled — data sourced live from Airtable base `appKlfvxdXofNlFfk`.
3. Each Speaking author with ≥2 sessions has computed values visible in an Author Craft table: rewatch rate (Rec Views 1w ÷ Enrolled), rewatch long-tail (Rec Views 4w ÷ Rec Views 1w), follow-up rate (% of feedback records where Follow-up Needed = true), and a rating floor flag if Avg Rating < 4.0.
4. Each curriculum slot row displays an attendance rate (Attendees ÷ Enrolled) in a Curriculum Fit table.
5. Authors with a rating floor flag are visually distinguished from others (different row treatment or badge) in the Author Craft table.
6. A "Top 5 / Bottom 5" section is visible, listing the five highest and five lowest Speaking authors by rewatch rate.
7. At least one author or curriculum slot is tagged with a divergence flag — a visible indicator that its craft signal and fit signal point in opposite directions.
8. All Airtable calls use field IDs from `dashboard/lib/airtable-schema.ts`, never hard-coded field names.
9. The full Speaking page loads in under 5 seconds on a local dev machine.

**Dependencies**: None — this is the first sprint.

---

## Sprint 2 — Cross-Mastery Aggregation [COMPLETE ✅]

**Status**: Complete — see `/prd/.builds/sprint-2-cross-mastery-aggregation.build.md`. Includes a follow-on enhancement layer (sortable/filterable table, methodology card, 5 actionable business-insight categories) layered on top of the original 9 ACs.

**Goal**: Extend the data model to all 6 masteries, normalize author names across bases, and display a unified cross-mastery author view with consistency signals.

**Scope**: Multi-base data pull (Lessons + Session Feedback from all 6 bases), fuzzy author name normalization, unified author table, cross-mastery craft signals, curriculum pattern surface, mastery filter UI.

**Acceptance criteria**:

1. All 6 masteries (Speaking, Manifesting, AI Mastery, Entrepreneurship, Spiritual, Social) are represented in a unified author table — no mastery is silently missing.
2. A mastery multi-select filter updates the visible rows within 2 seconds, showing only authors who have taught in the selected masteries.
3. Authors who appear in multiple masteries are shown as a single row (not duplicated), with per-mastery craft signal columns (rewatch rate, rating floor flag, follow-up rate) visible for each mastery they've taught in.
4. A Cross-Program Count badge on each author's row shows the number of distinct masteries they have taught in.
5. Authors appearing in 2 or more masteries display a Rating Consistency score (standard deviation of their Avg Rating across all masteries where they have data).
6. The same person does not appear as two separate rows due to minor name variations — "Dr. Jane Smith" and "Jane Smith" appear as one author.
7. Authors whose names could not be automatically resolved across bases are surfaced in a separate "Unresolved Name Matches" list showing the conflicting name variants and which bases they came from.
8. ≥90% of author records are matched into the unified table (the remainder appear in the unresolved list, not silently dropped).
9. A Cross-Mastery Patterns section displays at least 3 observable patterns across the dataset (example: "Q&A sessions average higher ratings than lecture sessions across 5 of 6 masteries").

**Dependencies**: Sprint 1 complete (data layer and schema usage patterns established).

---

## Sprint 3 — Finance Join & ROI Overlay ✅ COMPLETE

**Status**: Complete. Finance data source reworked from Author Entities rollups to **Actual Transactions** (invoice-level truth). Filters: GL Code = `"Speaker fees"` AND Product Code contains `"mastery"`. Speaker Fee totals aggregated per author per year (2025/2026) and joined to unified author table by name normalisation. 19 of 71 authors matched (27%); unmatched authors surfaced in Unmatched Authors list. Cost per Session and Royalties removed per product decision — Royalties will have a dedicated dashboard page in a future sprint.

**Goal**: Join Finance base confirmed invoice data to the unified author table and surface speaker fee spend per author.

**Scope**: Actual Transactions table filtered to Speaker Fee + Mastery rows, name-matched to unified author table, invoice breakdown panel per author, updated MethodologyCard, removed Cost Efficiency Flags (deferred until Contract data is available).

**Acceptance criteria** (revised):

1. ✅ Speaker Fee totals (2025 and/or 2026) appear in the unified author table for all matched Finance authors.
2. ✅ Totals sourced exclusively from Actual Transactions — no rollups; only GL Code = `"Speaker fees"` rows counted.
3. ✅ Only Mastery product rows counted — non-mastery transactions excluded.
4. ✅ Clicking an author's cost cell opens an invoice-level breakdown panel (number, date, product, memo, amount).
5. ✅ Authors with no matching Finance transactions listed in Unmatched Authors section, not silently hidden.
6. ✅ Finance columns appear alongside — not replacing — Author Craft columns.
7. ✅ MethodologyCard updated to reflect actual calculation methodology.

**Dependencies**: Sprint 2 complete ✅



---



## Sprint 4 — Dashboard UI: Three Production Views [COMPLETE ✅]

**Status**: Complete. The three core dashboard views (Overview, Drill-Down, Author Profile) have been successfully built, heavily filtered, and styled to surface the global and per-mastery insights with cross-referencing capabilities.

**Goal**: Deliver the three-view production dashboard — Cross-Mastery Overview, Per-Mastery Drill-Down, and Author Profile — with navigation, filters, and divergence flags.

**Scope**: Full UI build for all 3 views, mastery/year/session-type filters, divergence flag visual treatment, cohort comparison, author profile page, refresh timestamp, load performance target.

**Acceptance criteria**:

1. The default landing page is the Cross-Mastery Overview, listing all authors across all 6 masteries with craft signals, fit signals, and cost per session in a single scannable table.
2. Filters for mastery (multi-select), year (2024 / 2025 / 2026), and session type (lesson / Q&A / hotseat / workshop) update the visible rows within 2 seconds without a full page reload.
3. Divergence flags — where an author's craft signals and fit signals point in opposite directions — appear as a visible indicator in the overview, with at least one flag present per mastery in the test dataset.
4. A "Top 5 / Bottom 5" prominent section in the overview shows the five highest and five lowest craft-signal authors across the current filter selection.
5. Clicking a mastery name or drill-down link opens the Per-Mastery Drill-Down view showing a lesson-by-lesson table: lesson title, author, attendees, avg rating, rewatch rate, slot position, and module.
6. The Per-Mastery Drill-Down shows a cohort comparison column (2025 vs 2026 rating or rewatch rate) for masteries where both years have data.
7. Clicking any author's name from any view opens their Author Profile page, which shows in a single scroll: avg rating, total sessions, rewatch rate, per-mastery craft signals, 2025/2026 fees and royalties, cost per session, divergence flag (if present), and a cohort-over-cohort trajectory indicator.
8. The Cross-Mastery Overview loads in under 5 seconds with all 6 masteries and Finance data loaded.
9. A refresh timestamp ("Last updated: [date]") is visible in the UI header on every view.
10. A team member with no Airtable access can answer the question "who are the 5 most cost-efficient authors with strong craft signals?" using only the dashboard.

**Dependencies**: Sprints 1–3 complete (the three data models — craft signals, cross-mastery aggregation, and finance overlay — must exist before the UI can display them).

---

## Sprint 5 — AI Transcript & Feedback Analysis [COMPLETE ✅]

**Status**: Complete. Implemented Anthropic SDK integration with a local file-based caching layer to process batched feedback and transcripts. The dashboard now exposes transformation language rates, praise/criticism themes, and topic alignment.

**Goal**: Integrate Claude API to extract transformation language rates from feedback, teaching technique profiles from transcripts, and goal alignment gaps from onboarding surveys — and surface results in the dashboard.

**Scope**: Claude API integration with prompt caching, transcript processing pipeline (topics, teaching techniques, interaction style), feedback NLP pipeline (transformation language rate, craft themes, criticism themes), goal alignment delta, qualitative intelligence cards in the Author Profile view, topic taxonomy in the overview.

**Acceptance criteria**:

1. Each Speaking & Influence author with ≥10 feedback submissions shows a Transformation Language Rate (percentage of feedback records containing transformation phrases such as "I learned", "I'm doing differently", "I realised", or "I applied this to") on their Author Profile page.
2. Each author with ≥5 feedback submissions shows a Qualitative Intelligence card on their profile displaying their top 3 praise themes and top 2 criticism themes, extracted from feedback text — not star ratings.
3. At least one curriculum slot in the Per-Mastery Drill-Down displays a Goal Alignment Delta: a label comparing the topics students stated they wanted to learn (from onboarding survey) versus the topics identified in the session transcript.
4. The Cross-Mastery Overview includes a Topic Taxonomy panel listing the top 10 topics taught across all processed sessions, with transformation language rate shown alongside each topic.
5. Authors whose sessions have been AI-analysed show an "AI Analyzed" indicator on their profile; authors without available transcripts or sufficient feedback show an "Analysis Pending" state — no blank sections or unhandled errors.
6. The feedback processing pipeline handles a batch of 20 feedback records and returns extracted themes without timeout or error.
7. A second call using the same Claude API system prompt resolves faster than the first call (prompt caching is active and reducing repeat-call latency).
8. The Qualitative Intelligence card and Transformation Language Rate appear below — not replacing — the quantitative craft signals in the Author Profile view.

**Dependencies**: Sprint 4 complete (Author Profile view must exist to display qualitative intelligence cards). Sprint 1 complete (transcript and feedback field IDs from `dashboard/lib/airtable-schema.ts` must be accessible).

---

## Sprint 6 — Weekly Slack Intelligence Digest

**Goal**: Automate a weekly Claude-generated digest that posts to Slack with author flags, a standout highlight, and watch items — linking back to dashboard views.

**Scope**: Airtable delta computation (changes since last digest), Claude API digest generation, Slack MCP posting, weekly schedule trigger, flag logic (rating drops, follow-up rate spikes), deep-link generation to dashboard views.

**Acceptance criteria**:

1. A message is posted to the configured Slack channel each week containing: a one-sentence headline, up to 3 flagged authors or curriculum slots, 1 standout author or session, and 1–2 "on the radar" items — all written in plain English with no raw field IDs or data tables.
2. Each flag and standout item in the digest includes a clickable link that opens the corresponding Author Profile or Mastery Drill-Down view in the dashboard.
3. The digest fires on a weekly schedule without any manual action required.
4. An author whose Avg Rating drops by ≥0.5 rating points between two consecutive digest cycles appears as a flag in the next weekly message.
5. An author whose follow-up rate increases by ≥10 percentage points between two consecutive digest cycles appears as a flag in the next weekly message.
6. The total word count of the generated digest is ≤400 words (readable in under 90 seconds).
7. The Slack channel name is configurable via an environment variable — no channel name is hard-coded in the application.
8. After a digest is posted, a thread reply from a team member does not trigger any automated bot response (the system is publish-only).

**Dependencies**: Sprints 1–4 complete (craft signals, cross-mastery data, finance overlay, and dashboard deep-links must all exist before the digest can reference them). Sprint 5 is additive — the digest is richer with AI signals present but not blocked by their absence.

---

## Dependency Graph

```
Sprint 1 ──────────────────────────────────────────────┐
  Project Foundation + Speaking Baseline [COMPLETE ✅]   │
                                                        │
Sprint 2 (depends on Sprint 1) ────────────────────────┤
  Cross-Mastery Aggregation [COMPLETE ✅]                │
                                                        │
Sprint 3 (depends on Sprint 2) ────────────────────────┤
  Finance Join & ROI [COMPLETE ✅]                       │
                                                        │
Sprint 4 (depends on Sprints 1–3) ─────────────────────┤
  Dashboard UI: Three Views                             │
         │                                              │
         ├── Sprint 5 (depends on Sprints 1 + 4)        │
         │     AI Transcript & Feedback Analysis         │
         │                                              │
         └── Sprint 6 (depends on Sprints 1–4)          │
               Weekly Slack Intelligence Digest  ───────┘
```

**Linear path (minimum viable product)**:  
`S1 ✅ → S2 ✅ → S3 ✅ → S4`

**Full system with AI layer**:  
`S1 ✅ → S2 ✅ → S3 ✅ → S4 → S5 → S6`

**Note**: Sprint 5 (AI Analysis) can begin as soon as Sprints 1 and 4 are done — it does not require Sprint 6. Sprint 6 can begin as soon as Sprint 4 is done — it is richer with Sprint 5 signals but not blocked by them.
