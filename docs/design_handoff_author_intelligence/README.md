# Handoff: Author Intelligence — Redesign

## Overview

Redesign of an internal "Author Intelligence" dashboard used by Mindvalley's Author Relations, Growth team, COO and CEO to track cross-author performance and finances. The bundle covers two screens — **Overview** (cross-author roll-up) and **Author Profile** (single author detail, modeled on Jimmy Naraine).

The redesign keeps the exact same metrics and sections that exist in the current app today (see `original-screenshots/`), but improves: brand identity, navigation, hierarchy, density, empty-data handling, and the visual relationship between the two screens.

## About the Design Files

The files in this bundle are **design references created in HTML/React/Babel** — prototypes that show intended look and behavior. They are *not* production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (Next.js + Tailwind, plain React, Rails + Hotwire, whatever it is) using that codebase's established component library and patterns.

If no frontend environment exists yet for this product, the recommended stack is **Next.js + TypeScript + Tailwind CSS + Radix primitives** — the design uses standard primitives (table, badge, avatar, tabs, segmented control) that map cleanly to Radix.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and component states are all specified. Recreate pixel-by-pixel using the codebase's existing libraries — but follow the rules in this README, not the inline `style={…}` objects in the JSX (those are quick prototype shorthand, not authoritative).

## Brand & Naming

- **Product name**: `Author Intelligence` (drop "OneFlow | Speaker Intelligence" entirely).
- **Logo lockup**: A two-disc mark + the wordmark "Author**Intelligence**", where "Intelligence" takes the brand-purple color. The mark is two overlapping circles (purple `#7A12D4` left, pink `#DF1A6F` right) with `mix-blend-mode: multiply`, plus a small white core circle. SVG source is in `brand.jsx` (`AILogoMark`, `AILogoLockup`).
- **Tagline (sub-text under wordmark when needed)**: "Author Intelligence" eyebrow, all caps, 0.12em tracking.

## Design Tokens (canonical)

All tokens come from the Mindvalley design system, exposed as CSS custom properties in `tokens.css`. Use those directly; do not invent new values.

### Colors

| Role | Token | Hex |
|---|---|---|
| Primary brand / links / focus | `--mv-brand` | `#7A12D4` |
| Brand bright / accent | `--mv-brand-bright` | `#9B37F2` |
| Brand content (AA on white) | `--mv-brand-content` | `#680FB4` |
| Brand light fill | `--mv-brand-light` | `#F8EFFF` |
| Pink (community / accent2) | `--mv-pink` | `#DF1A6F` |
| Pink light | `--mv-pink-light` | `#FEEAF3` |
| Green (success / positive trend) | `--mv-green` | `#159F65` |
| Green content | `--mv-green-content` | `#128756` |
| Green light | `--mv-green-light` | `#E8F9F1` |
| Orange (warning / urgency) | `--mv-orange` | `#ED6325` |
| Orange content | `--mv-orange-content` | `#C9541F` |
| Orange light | `--mv-orange-light` | `#FFF4E9` |
| Blue (informational) | `--mv-blue` | `#005CFF` |
| Red (destructive) | `--mv-red` | `#F34747` |
| Ink / primary text | `--mv-text` | `#0F131A` |
| Muted text | `--mv-text-muted` | `#595E67` |
| Subtle text | `--mv-text-subtle` | `#71767F` |
| Disabled | `--mv-text-disabled` | `#B3B8C1` |
| Border | `--mv-border` | `#DFE1E5` |
| Border muted | `--mv-border-muted` | `#F3F4F6` |
| Bg muted | `--mv-bg-muted` | `#F9F9F9` |

### Type

- **Family**: `Google Sans` (Regular 400, Medium 500, Bold 700) — both display and body. Loaded via Google Fonts.
- **Tracking**: `-0.02em` for display, `0` for body, `0.08em–0.16em` uppercase for overlines.
- **Tabular numerals**: `font-variant-numeric: tabular-nums` on every numeric value (KPI tile values, table cells, ratings, money, percentages).

| Use | Size | Weight | Line height |
|---|---|---|---|
| Page H1 | 28px | 700 | 1.15 |
| Section H2 | 16px | 600 | 1.3 |
| KPI value | 26px | 700 | 1.0 |
| KPI label | 12px | 500 | 1.3 |
| Body | 14px | 400 | 1.5 |
| Table cell | 13px | 400/600 | 1.4 |
| Overline (eyebrow) | 11px | 600, uppercase, 0.10em tracking | 1.0 |

### Space

4px base grid. Section gutters between cards: `28px`. Card padding: `22px`. Table row padding: `10px 16px` (dense) / `14px 16px` (default).

### Radius

- Buttons & badges (pill): `999px`
- Cards & framed strips: `14px`
- Inputs & smaller chips: `8–10px`
- Avatar: `50%`

### Shadow

Resting cards use `border: 1px solid var(--mv-border-muted)` instead of a shadow — flat, calm, analytical.

## Global Chrome (both screens)

### Header (`SimpleHeader`)
- 60px tall, white background, 1px bottom border `--mv-border-muted`.
- Padding: `0 32px`.
- Contents (left to right): `AILogoLockup` 16px size → 1px × 22px divider in `--mv-border` → "Author Intelligence" text in `--mv-text-muted` 13px/500 → flex spacer → "Last updated · May 5, 2026 · 10:44 AM" in `--mv-text-subtle` 12px.

### Tab nav (`SimpleNav`)
- 48px tall, white, 1px bottom border, sticky `top: 0; z-index: 10`.
- Padding: `0 32px`.
- Tabs: **Overview · Authors · Performance · Feedback** — gap 4px, each `padding: 0 14px`.
- Active tab: `color: var(--mv-text)`, `border-bottom: 2px solid <accent>`. Inactive: `color: var(--mv-text-muted)`, transparent border.
- Right side: search box, 240px wide, 32px tall, `border-radius: 8px`, `background: var(--mv-grey-100)`, contains a 14px search icon, placeholder "Search authors…", and a `⌘K` kbd hint.

## Screen 1 — Author Profile (Jimmy Naraine)

Body wrapper: `padding: 28px 32px 40px`, `max-width: 1240px`, `display: flex; flex-direction: column; gap: 28px`.

### 1. Identity row
Flex row, gap 18px, align-items center.
- **Avatar** 64px, gradient `linear-gradient(135deg,#329dff,#7a12d4,#df1a6f)`, white initials "JN", 600 weight, font-size = 38% of avatar size.
- Middle column (flex 1):
  - Eyebrow: "DASHBOARD / AUTHOR PROFILE", 11px/600, 0.10em tracking, uppercase, `--mv-text-subtle`.
  - H1: "Jimmy Naraine", 28px/700, `-0.02em` tracking.
  - Subtitle: "Cross-program performance and financial overview", 14px, `--mv-text-muted`.
- Right: ghost "Export" button — `height: 36px`, `padding: 8px 14px`, `border-radius: 10px`, `border: 1px solid var(--mv-border)`, white bg, 13px/500, with a 14px download icon.

### 2. KPI strip (6 columns)
Single bordered container, `border: 1px solid var(--mv-border-muted)`, `border-radius: 14px`, `overflow: hidden`. CSS grid `repeat(6, 1fr)`. Each cell:
- Padding `16px 18px`, vertical divider `border-right: 1px solid var(--mv-border-muted)` (none on the last column).
- Min height 88px.
- Label row (gap 6): label text 12px/500 `--mv-text-muted` + optional badge.
- Value: 26px/700, `-0.02em` tracking, tabular-nums, `--mv-text`. Optional unit (13px/500 `--mv-text-subtle`) baseline-aligned.
- Empty state: `<NotMeasured />` pill (see "Empty-data treatment" below) instead of value.

The six tiles, in order, with current values for Jimmy:

| # | Label | Value | Unit | Badge |
|---|---|---|---|---|
| 1 | Programs Taught | `1` | — | `AI Analyzed` (green) |
| 2 | Overall Rewatch Rate | _Not yet measured_ | — | — |
| 3 | Transformation Language | `65.0` | `%` | — |
| 4 | Feedback Submissions | `34` | — | — |
| 5 | Avg Rating | `8.65` | — | — |
| 6 | Summit Sessions | `0` | — | — |

### 3. Qualitative Intelligence
- Section title H2: "Qualitative Intelligence" (16px/600, `-0.01em`, margin-bottom 12px).
- Card: `border: 1px solid var(--mv-border-muted)`, `border-radius: 14px`, `padding: 22px`, white bg.
- Two columns, divider `border-left: 1px solid var(--mv-border-muted)` on the right column with `padding-left: 22px`.
- Each column has a 13px/600 sub-heading ("Top Praise Themes" / "Top Criticism Themes") then a list. Each list item is a row, `padding: 8px 0`, `display: flex`, `gap: 10px`, with a 6px round dot (green for praise, orange for criticism) and 14px text in `--mv-text`.

Praise themes (Jimmy): Actionable frameworks · High energy delivery · Clear storytelling.
Criticism themes (Jimmy): Felt rushed at the end · Wanted more Q&A time.

### 4. Per-Mastery Performance (table)
- Section title "Per-Mastery Performance".
- Table component (white card, `border-radius: 14px`, `border: 1px solid var(--mv-border-muted)`, overflow hidden):
  - Header row: `background: var(--mv-grey-100)`, `padding: 10px 16px`, 10.5px/600, 0.08em tracking, uppercase, `--mv-text-subtle`.
  - Body row: `padding: 10px 16px`, bottom border `--mv-border-muted` between rows.

Columns:

| Column | Width | Render |
|---|---|---|
| Mastery | minmax(280px, 2fr) | Purple badge with mastery name |
| Lessons | 1fr (center) | Number, tabular-nums |
| Avg rating | 1fr (center) | Number to 2dp, tabular-nums, 500 weight |
| Rewatch rate | 1fr (center) | Percent OR `<NotMeasured />` |
| Follow-up rate | 1fr (center) | Percent, tabular-nums |
| Flags | 80px (center) | Orange badge with count, or em-dash if 0 |

Sample row: `Speaking & Influence | 12 | 8.65 | Not yet measured | 8.8% | 1`.

### 5. Finance Overview
- Section title "Finance Overview".
- KPI strip — same component as #2 but `repeat(4, 1fr)`:
  1. 2026 Speaker Fees → _Not yet measured_
  2. 2026 Cost / Session → _Not yet measured_
  3. 2025 Speaker Fees → `$20,000`
  4. 2025 Cost / Session → `$10,000`
- Margin-bottom 14px between strip and invoice table.
- Invoice table columns:

| Column | Width | Render |
|---|---|---|
| Invoice date | 1fr | Plain text |
| Invoice number | 1.2fr | `font-family: var(--mv-font-mono)`, 12px |
| Product | 1fr | Grey badge |
| Memo | 3fr | Plain text |
| Amount | 1fr (right) | `$X,XXX`, tabular-nums, 600 |

Sample rows:
- `Oct 21, 2025 | SpeakerFee_102125 | Mastery | Speaking and Influence Mastery Presenter Fee | $5,000`
- `Jul 3, 2025 | SpeakerFee_070325 | Mastery | Social Media Mastery Bonus Workshop fee (2 sessions, 4 hours total) | $15,000`

## Screen 2 — Overview

Same chrome (header + tab nav, but with "Overview" tab active). Same body wrapper as Author Profile.

### 1. Page header
- Eyebrow: "DASHBOARD / OVERVIEW".
- H1: "All authors".
- Subtitle: "Cross-author performance and financial overview".
- No avatar, no Export button — keep it light.

### 2. KPI strip (6 columns) — cross-author rollup

| # | Label | Value | Unit | Badge |
|---|---|---|---|---|
| 1 | Active Authors | `148` | — | — |
| 2 | Overall Rewatch Rate | `68.0` | `%` | — |
| 3 | Transformation Language | `71.0` | `%` | `AI Analyzed` |
| 4 | Feedback Submissions | `2,184` | — | — |
| 5 | Avg Rating | `8.84` | — | — |
| 6 | Summit Sessions | `42` | — | — |

### 3. Qualitative Intelligence (rolled up across all authors)
Identical card to Author Profile, but each list item also shows a count on the right (12px, `--mv-text-subtle`, tabular-nums).

Top Praise Themes (with counts):
- Actionable frameworks · 412
- High energy delivery · 308
- Clear storytelling · 287
- Personal vulnerability · 196
- Practical exercises · 184

Top Criticism Themes:
- Felt rushed at the end · 89
- Wanted more Q&A time · 74
- Slides hard to read · 41
- Audio quality issues · 28

### 4. Per-Author Performance (table)
- Section title "Per-Author Performance".
- Same table chrome as Per-Mastery, columns:

| Column | Width | Render |
|---|---|---|
| Author | minmax(240px, 2fr) | 28px gradient avatar + name (13px/600) + role (11px subtle) |
| Programs | 1fr (center) | Number |
| Avg rating | 1fr (center) | 2dp number |
| Rewatch rate | 1fr (center) | Percent or `<NotMeasured short />` (compact "n/m" pill) |
| Transformation | 1fr (center) | Percent |
| Flags | 80px (center) | Orange badge or em-dash |

Source data for the 8 sample authors lives in `data.jsx` (the `AUTHORS` array). The table has no built-in sorting in the prototype — the developer should add server-side sort + pagination to the production build.

## Empty-data treatment — `<NotMeasured />`

This is a key rule. Every place the original UI shows a dead em-dash `—` for missing data should instead render a small explicit pill:

- Inline pill: `padding: 2px 8px`, `border-radius: 999px`, `background: var(--mv-grey-150)` (`#F3F4F6`), `color: var(--mv-text-subtle)`, `font-size: 11px`, `font-weight: 500`, `border: 1px dashed var(--mv-border-strong)` (`#CED1D7`).
- Contains a 11px info icon + label "Not yet measured" (full) or "n/m" (short variant for tight table cells).
- `cursor: help` and a `title="Not yet measured"` tooltip — the production app should swap this for a proper popover with the reason ("First cohort hasn't reached the rewatch window yet").

The KPI tile component handles this via a `measured={false}` prop: when false, it renders the pill in place of the number.

## Components & Atoms

The prototype splits the UI into these components — the developer should map each to the codebase's equivalent (or create them if missing):

| Component | Purpose | Source file |
|---|---|---|
| `AILogoMark` / `AILogoLockup` | Brand mark + wordmark | `brand.jsx` |
| `Avatar` | 28/32/64px circular gradient avatars with initials | `ui.jsx` |
| `Badge` | Pill with variants: purple, green, orange, blue, pink, grey, red, outline; sizes sm/md | `ui.jsx` |
| `NotMeasured` | Empty-data pill (described above) | `ui.jsx` |
| `Table` | Lightweight grid table; takes `columns: [{label, key, width, align, render}]` and `rows` | `ui.jsx` |
| `SimpleKPI` | The KPI tile in the framed strip | `simple.jsx` |
| `SimpleHeader` / `SimpleNav` | Global chrome | `simple.jsx` |
| Icons | Feather-style 24px grid, 1.75 stroke; full set in `icons.jsx` | `icons.jsx` |

## Interactions & Behavior

- **Tabs (top nav)**: client-side route between `/overview`, `/authors`, `/authors/:id`, `/performance`, `/feedback`. Active tab shows the 2px accent underline.
- **Search (⌘K)**: opens a global authors+programs search palette (not designed in this round — placeholder spec: fuzzy match, recent, scoped by entity type).
- **Table rows**: rows in the Per-Author table should be clickable, navigating to that author's profile. Hover state: `background: var(--mv-grey-100)`. Cursor: pointer when navigable.
- **NotMeasured pill**: hover shows a tooltip with the reason; clicking it (in a future iteration) opens a panel explaining what the metric needs.
- **Last updated** in the header should be live (relative time, refreshes every minute).
- **Export button** (Author Profile only): opens a dropdown — "Export PDF" / "Export CSV".

## State Management

For each screen, the consumer needs:

- **Overview**: `{ activeAuthors, rewatchRate, transformationLang, feedbackCount, avgRating, summitSessions, praiseThemes[], criticismThemes[], authors[] }`. Themes are `{ theme, count, change }`. Authors are `{ id, name, role, gradient, programs, rating, rewatch, transformation, flags, status }`.
- **Author Profile**: `{ name, role, joined, contract, manager, bio, metrics: { programs, rewatch?, transformationLang?, feedback, rating, summit }, praise[], critique[], programs: [{ name, lessons, rating, rewatch?, followup, flags }], invoices: [{ date, number, product, memo, amount }] }`. Any `?`-marked field can be null and should render as `<NotMeasured />`.

Loading states: skeleton bars matching tile/table dimensions. Error states: a small inline alert above the section that failed, in `var(--mv-orange-content)` on `var(--mv-orange-light)`.

## Responsive

Designed for desktop (≥1280px). For tablet (≥768px), KPI strip wraps to `repeat(3, 1fr)` over two rows; tables become horizontally scrollable inside the card. Mobile is out of scope for this iteration — the audience (Author Relations, Growth, COO/CEO) is desktop-first.

## Accessibility

- All interactive elements need a visible focus ring — use `box-shadow: 0 0 0 4px rgba(155, 55, 242, 0.35)` (`--mv-shadow-focus`) on `:focus-visible`.
- Color is never the only signal: every status badge has a text label, every chart sparkline has a number next to it, every "Not yet measured" pill has an info icon.
- Tabular figures: `font-variant-numeric: tabular-nums` on all numbers for column alignment.
- Tables have proper `<thead>` / `<th scope="col">` markup in production (the prototype uses divs for speed — do not copy that).

## Files in this bundle

```
design_handoff_author_intelligence/
├── README.md                                ← this file
├── Author Intelligence.html                 ← entry point
├── tokens.css                               ← design tokens (CSS custom props)
├── components.css                           ← Mindvalley component styles
├── brand.jsx                                ← AILogoMark + AILogoLockup
├── icons.jsx                                ← icon set (feather-style)
├── ui.jsx                                   ← Badge, Avatar, NotMeasured, Table, KPI primitives
├── charts.jsx                               ← Sparkline, BarChart, AreaChart, RatingDist, Donut
├── shell.jsx                                ← (alternate sidebar layout — not used in simplified version)
├── simple.jsx                               ← SimpleHeader, SimpleNav, OverviewSimple, AuthorProfileSimple
├── data.jsx                                 ← mock data: AUTHORS, JIMMY, THEMES_PRAISE, THEMES_CRITIQUE
├── design-canvas.jsx                        ← prototype harness (ignore)
├── tweaks-panel.jsx                         ← prototype harness (ignore)
└── original-screenshots/                    ← BEFORE — current UI for context
    ├── overview.png
    └── author-jimmy-naraine.png
```

The relevant files for implementation are: `tokens.css`, `components.css`, `simple.jsx`, `ui.jsx`, `brand.jsx`, `icons.jsx`, `data.jsx`. Everything else is harness or alternate explorations.

## Assets

- **Logo**: `assets/logo-mindvalley.svg` (Mindvalley parent wordmark) and `assets/logo-mark-wing.svg` (Mindvalley wing glyph). The Author Intelligence dual-disc mark is generated inline via SVG in `brand.jsx`.
- **Avatars**: gradient backgrounds with initials — no photo assets needed for the prototype. Production should swap in real headshots when available, falling back to the gradient + initials.
- **Icons**: all generated inline as SVG in `icons.jsx`. In production, swap to the codebase's existing icon library (Feather, Lucide, Phosphor) — whichever the app already uses. The visual spec is: 24px grid, 1.75px stroke, rounded joins/caps.

## Out of scope for this handoff

These were considered but intentionally omitted to stay close to the original screenshot's surface area:
- Risk feed / flag triage UI
- AI conversational query ("Ask AI") panel
- Author leaderboard with sparklines + composite score
- Trend area charts
- Dark "command center" mode
- Settings / contract management screens

If the team wants any of these, ask the designer for a new round.
