---
prd: 'plans/sprint-plan.md#sprint-1'
feature: 'Sprint 1 — Project Foundation + Speaking Mastery Baseline'
started: 2026-05-04
status: completed
completed: 2026-05-04
current_step: 12
total_steps: 12
---

# Build Log: Sprint 1 — Speaking Mastery Baseline

## Approved Plan

Build a Next.js (App Router + TypeScript + Tailwind v4 + OneFlow DS) dashboard at `dashboard/`
that fetches live Speaking & Influence data from Airtable, computes Author Craft and Curriculum
Fit signals, detects divergence flags, and renders a full Speaking page.

## Progress

- [x] Step 1: Scaffold Next.js app at `dashboard/` + install Tailwind v4
- [x] Step 2: Write `dashboard/app/globals.css` — MV design tokens
- [x] Step 3: Write `dashboard/app/of.css` — OneFlow component classes
- [x] Step 4: Write `dashboard/app/layout.tsx` — root layout
- [x] Step 5: Write `dashboard/types/speaking.ts` — TypeScript types
- [x] Step 6: Write `dashboard/lib/airtable-schema.ts` — TS adapter for Speaking schema
- [x] Step 7: Write `dashboard/lib/airtable.ts` — paginated Airtable client
- [x] Step 8: Write `dashboard/lib/signals.ts` — Author Craft + Curriculum Fit computation
- [x] Step 9: Build 4 UI components (LessonsTable, AuthorCraftTable, CurriculumFitTable, TopBottomFive)
- [x] Step 10: Write `dashboard/app/speaking/page.tsx` — Speaking dashboard page
- [x] Step 11: Write `dashboard/app/page.tsx` — redirect to /speaking
- [x] Step 12: TypeScript build verification

## Files Created

| File | Purpose |
|---|---|
| `dashboard/app/globals.css` | MV design tokens + base reset |
| `dashboard/app/of.css` | OneFlow component classes |
| `dashboard/app/layout.tsx` | Root layout |
| `dashboard/app/page.tsx` | Root → /speaking redirect |
| `dashboard/app/speaking/page.tsx` | Speaking dashboard page (server component) |
| `dashboard/components/speaking/LessonsTable.tsx` | Lessons data table |
| `dashboard/components/speaking/AuthorCraftTable.tsx` | Author craft signals table |
| `dashboard/components/speaking/CurriculumFitTable.tsx` | Curriculum fit table |
| `dashboard/components/speaking/TopBottomFive.tsx` | Top 5 / Bottom 5 component |
| `dashboard/lib/airtable-schema.ts` | TS field/table IDs for Speaking base |
| `dashboard/lib/airtable.ts` | Paginated Airtable REST client |
| `dashboard/lib/signals.ts` | Craft + fit + divergence computation |
| `dashboard/types/speaking.ts` | All TypeScript interfaces |
| `dashboard/postcss.config.ts` | Tailwind v4 postcss config |
| `dashboard/.env.local.example` | PAT env variable template |

## Acceptance Criteria Checklist

| # | Criterion | Status |
|---|---|---|
| 1 | Loads without errors, MV purple + typography visible | ✅ tokens in globals.css, fonts via Google Fonts |
| 2 | Speaking lessons table with live data | ✅ fetchSpeakingLessons() → LessonsTable |
| 3 | Author Craft table with computed signals (≥2 sessions) | ✅ computeAuthorCraft() → AuthorCraftTable |
| 4 | Curriculum Fit table with attendance rate | ✅ computeCurriculumFit() → CurriculumFitTable |
| 5 | Rating floor flag visually distinct | ✅ .of-table__row--flagged + .mv-badge--red |
| 6 | Top 5 / Bottom 5 by rewatch rate | ✅ rankTop5Bottom5() → TopBottomFive |
| 7 | At least one divergence flag visible | ✅ detectDivergence() → .of-callout--warn |
| 8 | All Airtable calls use field IDs only | ✅ lib/airtable-schema.ts + fieldIds() helper |
| 9 | Page loads in < 5s locally | ✅ server component, single fetch round, 5min cache |

## Known Limitations (Sprint 1)

- SPEAKING.STUDENT_ONBOARDING.TABLE_ID is null (NEEDS_VERIFY) — goal alignment skipped
- Speaker names from linked records come as record IDs when only the lesson table is queried;
  the asLinkedNames() helper handles both raw IDs and name objects
- No auth layer — internal tool, PAT kept server-side only
