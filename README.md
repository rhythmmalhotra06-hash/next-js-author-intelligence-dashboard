# Author Intelligence Dashboard

A Next.js portal for **Mindvalley Speaker Intelligence** — surfaces author craft, curriculum fit, financial intelligence, and contract context in one place. Built for the Author Relations team and the COO.

Deployed via [Kessel](https://kessel.mindvalley.team).

## Routes

| Route | What it shows |
|---|---|
| `/overview` | Cross-mastery unified author table — performance signals + business-decision insights |
| `/finance` | Author Finance Intelligence — payment structures, transaction history, contract intelligence, strategic decisions |
| `/speaking` | Speaking & Influence mastery dashboard — craft signals, curriculum fit, schedule, workshop feedback |
| `/mastery/[key]` | Per-mastery drill-down (`speaking`, `manifesting`, `ai_mastery`, `entrepreneurship`, `spiritual`, `social`) |
| `/author/[id]` | Per-author profile |

## Local development

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and set AIRTABLE_PAT
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.local.example`](./.env.local.example) for the full list.

**Required**:
- `AIRTABLE_PAT` — Airtable Personal Access Token with `data.records:read` and `schema.bases:read` scopes. Create at https://airtable.com/create/tokens.

**Optional** (for AI enrichment features — without these the app falls back to mock values):
- `GROQ_API_KEY` — Groq API key, used via the OpenAI SDK pointed at Groq's OpenAI-compatible endpoint. Powers feedback theme extraction, transcript analysis, and goal alignment in `lib/ai-analysis.ts`. Create at https://console.groq.com/keys.

> **Kessel deployment note**: set both `AIRTABLE_PAT` and `GROQ_API_KEY` in Kessel's secret manager / build-env config. All data-fetching pages are marked `dynamic = "force-dynamic"` so the build itself doesn't hit Airtable, but missing env vars will surface as runtime errors.

## Project structure

```
.
├── app/                Next.js App Router pages
├── components/         UI components grouped by feature (overview/, finance/, speaking/, mastery/, author/, shell/)
├── lib/                Data fetchers, signal computation, AI enrichment, Airtable schema
├── types/              Shared TypeScript types
├── public/             Static assets
├── scripts/            Operational scripts (e.g. AI cache prebake)
└── docs/               Product docs — PRDs, plans, design system, design handoff
    ├── prd/            Active PRD documents (resolved + in-progress)
    ├── plans/          Sprint and implementation plans
    ├── design/
    ├── design_handoff_author_intelligence/
    ├── DESIGN_SYSTEM.md
    └── speaker_intelligence_PRD.md
```

## Architecture notes

- **Data source**: All data is read live from Airtable (multiple bases — Speaking, Manifesting, AI Mastery, Entrepreneurship, Spiritual, Social, Finance). See `lib/airtable-schema.ts` for the field-ID registry.
- **Signal computation**: `lib/signals.ts` joins, normalises, and scores authors across masteries; computes finance flags, decision recommendations, and strategic insights.
- **AI enrichment**: `lib/ai-analysis.ts` and `lib/ai-enrichment.ts` provide transformation-rate, qualitative themes, and topic taxonomy. Cached on disk via `lib/ai-cache.ts`.
- **Rate limiting**: Airtable's 5 req/sec/base is respected via per-base request gates with retry on 429 (see `lib/finance-dashboard-airtable.ts`).

## Documentation

The most relevant docs to read before changing things:

- [`docs/prd/speaker-intelligence.md`](./docs/prd/speaker-intelligence.md) — product-level PRD
- [`docs/prd/speaker-intelligence/author-finance-dashboard.md`](./docs/prd/speaker-intelligence/author-finance-dashboard.md) — Finance Intelligence epic (built)
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — visual / token system
- [`docs/prd/.builds/author-finance-dashboard.build.md`](./docs/prd/.builds/author-finance-dashboard.build.md) — build log for the Finance dashboard (Phase 1–3 changes)
