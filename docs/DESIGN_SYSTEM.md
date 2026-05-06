# OneFlow Design System — Engineering Guidelines

> **Audience:** Every engineer and designer shipping UI in the OneFlow Vendor Spend Management Portal.
> **Status:** Source of truth. If code in the repo contradicts this document, **the doc wins** and the code is legacy to be migrated.
> **Last revised:** April 2026 — aligned with the OneFlow Redesign handoff.

---

## 0 · Why this exists

The portal currently has **two competing visual languages** in the codebase:

| | Legacy (pre-redesign) | OneFlow DS (current) |
|---|---|---|
| Where | `IntakeForm.tsx`, `StatusBadge.tsx`, `page.tsx`, most 2024-era code | `app/globals.css`, `app/of.css`, `design_handoff_oneflow/` |
| Colors | Ad-hoc Tailwind (`bg-neutral-950`, `focus:ring-blue-500`, `text-yellow-800`) | MV brand tokens (`--mv-brand`, `--mv-green-content`, `--mv-text-muted`) |
| Typography | Geist / system default | Google Sans → Plus Jakarta Sans fallback |
| Radius | `rounded-lg`, `rounded-full` mixed freely | `--mv-radius-xs/sm/md/lg/full` scale |
| Dark mode | Per-component `dark:` utilities | Single `[data-mv-theme="dark"]` token swap |
| Buttons | Inline Tailwind | `.mv-btn`, `.mv-btn--primary` etc. |
| Shape | Bootstrap-ish, dense | Mindvalley-branded: pill buttons, generous radii, purple accents |

**Rule:** All **new** features must be built against the OneFlow DS (this document). Legacy code is migrated opportunistically (§ 12).

---

## 1 · Brand foundation

### 1.1 Identity
OneFlow is an **internal Mindvalley product**. It inherits the Mindvalley brand system:
- **Primary hue:** Mindvalley Purple (`#7a12d4`). Used for brand marks, primary CTAs, active nav, selected rows, focus rings, progress fills.
- **Voice:** Calm, confident, slightly premium. Not playful, not corporate-grey. Copy is human ("Get started in 2 minutes", not "Submit request form").
- **Shape language:** Generous pill radii on interactive chrome (buttons, chips, inputs with full radius), 16px/24px on cards, 8px on inputs. Avoid sharp 2–4px radii except for tiny pills and monospace chips.

### 1.2 Logo lockup
Top-left of every authenticated screen. Always:
- 28×28 gradient mark (`linear-gradient(135deg, var(--mv-brand), var(--mv-brand-bright))`), rounded 8px
- "OneFlow" wordmark, `--mv-weight-bold`, 18px, tracking `-0.01em`
- Optional `|` divider + product scope tag in `--mv-text-muted` (e.g. "| Spend")

Implementation: `.of-topbar__brand` / `.of-topbar__brand-mark`.

---

## 2 · Color system

All color lives in `app/globals.css` as CSS custom properties. **Never** hard-code hex, rgb, or Tailwind color utilities in component code.

### 2.1 Brand palette — `--mv-brand-*`
| Token | Hex | Use |
|---|---|---|
| `--mv-brand` | `#7a12d4` | Primary buttons, brand marks, progress fills |
| `--mv-brand-bright` | `#9b37f2` | Hover states, focus ring base |
| `--mv-brand-content` | `#680fb4` | **Text on brand-light backgrounds**, nav-active text, links |
| `--mv-brand-dark` | `#4f0c8a` | Pressed states, dense visualizations |
| `--mv-brand-light` | `#f8efff` | Subtle brand tints — selected rows, active chips, info callouts |
| `--mv-brand-border` | `#eed8fe` | Border on brand-light backgrounds |

**Pairing rule:** `background: --mv-brand-light` **must** pair with `color: --mv-brand-content` (never `--mv-brand` — contrast fails).

### 2.2 Support palette
Five supporting hues follow the same 5-rung pattern (`*`, `*-bright`, `*-content`, `*-dark`, `*-light`):
- **Blue** `--mv-blue-*` — informational, "Submitted", links in dark mode
- **Green** `--mv-green-*` — approved, completed, positive trend
- **Orange** `--mv-orange-*` — "Needs details", negative trend in spend context
- **Pink** `--mv-pink-*` — accent only (avatars, empty-state art)
- **Red** `--mv-red-*` — rejected, destructive, SLA breach
- **Amber** `--mv-amber-*` — warnings (distinct from orange: amber is advisory, orange is "returned for rework")

### 2.3 Neutrals — `--mv-grey-100` → `--mv-grey-700`
13-step ramp. **Use semantic tokens (§ 2.4) for 99% of cases** — only reach for raw grey tokens when a semantic token doesn't exist yet (then: add one).

### 2.4 Semantic tokens — **use these, not raw palette**
| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--mv-bg` | white | `#0f131a` | App background, under everything |
| `--mv-bg-muted` | `#f9f9f9` | `#181d26` | Page content background, under cards |
| `--mv-bg-subtle` | `#f3f4f6` | `#292d38` | Input fills, table header row |
| `--mv-surface` | white | `#181d26` | Cards, modals, top bar |
| `--mv-surface-elevated` | white | `#292d38` | Popovers, dropdowns, floating panels |
| `--mv-text` | `#0f131a` | white | Primary body text, headings |
| `--mv-text-muted` | `#595e67` | `#b3b8c1` | Labels, helper text, secondary copy |
| `--mv-text-subtle` | `#71767f` | `#979ca5` | Captions, metadata, placeholder |
| `--mv-text-disabled` | `#b3b8c1` | `#595e67` | Disabled state only |
| `--mv-text-inverse` | white | `#0f131a` | Text on brand/solid backgrounds |
| `--mv-text-link` | `--mv-brand` | `--mv-brand-bright` | Inline links |
| `--mv-border` | `#dfe1e5` | `#41464f` | Default borders (inputs, cards) |
| `--mv-border-strong` | `#ced1d7` | `#595e67` | Emphasized borders (secondary button) |
| `--mv-border-muted` | `#f3f4f6` | `#292d38` | Hairline dividers, table rows |
| `--mv-focus-ring` | `--mv-brand-bright` | `--mv-brand-bright` | Focus ring solid color |

### 2.5 Status color map — **canonical**

Everything that represents request state or pipeline state **must** use these mappings. Do not invent new ones per feature.

| State | Background | Text | Dot | Token trio |
|---|---|---|---|---|
| Draft / Backlog | `--mv-grey-150` | `--mv-grey-550` | `--mv-grey-350` | grey |
| Submitted | `--mv-blue-light` | `--mv-blue-content` | `--mv-blue` | blue |
| In review | `--mv-orange-light` | `--mv-orange-content` | `--mv-orange` | orange |
| Needs details / Returned | `#ffe9eb` | `#c13030` | `--mv-red` | red-soft |
| Approved | `--mv-green-light` | `--mv-green-content` | `--mv-green` | green |
| Rejected | `--mv-red-light` | `--mv-red-content` | `--mv-red` | red |
| Upload on Airbase | `--mv-brand-light` | `--mv-brand-content` | `--mv-brand` | brand |

Implementation: `.of-status` + modifier, or `.mv-badge` + modifier. **Never inline Tailwind for status pills.**

### 2.6 Color accessibility rules
1. Body text must hit **WCAG AA** (4.5:1) against its background. All semantic pairings above are pre-verified.
2. Large text (≥ 18.66px bold or 24px regular) may use 3:1 — applies to metric values and headings, never body.
3. **Never** layer `--mv-text-muted` on `--mv-bg-muted` (3.8:1 — borderline). Always move text-muted to `--mv-surface`.
4. Focus rings must remain visible on every surface, including dark mode. Use `--mv-shadow-focus` (4px ring @ 35% alpha).
5. Color alone never conveys state — every status has an icon, label, or dot alongside.

---

## 3 · Typography

### 3.1 Families
```css
--mv-font-display: "Google Sans", "Plus Jakarta Sans", ui-sans-serif, system-ui, ...;
--mv-font-body:    "Google Sans", "Plus Jakarta Sans", ui-sans-serif, system-ui, ...;
--mv-font-mono:    ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace;
```

- **Display** (`--mv-font-display`): Titles, metric values, hero numbers. Tight tracking (`-0.01em` to `-0.02em`).
- **Body**: Same face, different tracking. Everything non-display.
- **Mono**: Request IDs, file names, fixed-width numerics where alignment matters. Always in a neutral color.

> Legacy `Geist` / `Geist_Mono` imports in `app/layout.tsx` are **deprecated** — leave them until migration but do not add new components that depend on them.

### 3.2 Weights
Only three, loaded: **400, 500, 700**. Do not specify 600 in new code (it won't load; browser fakes it).

- **400** — body copy, long-form
- **500** — UI chrome default (buttons, labels, form field values, nav items)
- **700** — display, headings, metric values, brand wordmark

### 3.3 Scale

| Role | Size | Weight | Line-height | Tracking | Use |
|---|---|---|---|---|---|
| Display XL | 32px | 700 | 1.0 | `-0.02em` | Metric big numbers, finops KPIs |
| Display L | 28–30px | 700 | 1.15 | `-0.02em` | Page titles, modal titles, confirm hero |
| Display M | 22px | 700 | 1.2 | `-0.01em` | Section headers, detail pane title |
| Display S | 17–18px | 600–700 | 1.25 | `-0.01em` | Form card titles, panel titles |
| Body L | 16px | 400–500 | 1.5 | 0 | Default body |
| Body | 14px | 400–500 | 1.45 | 0 | UI default — table cells, form values |
| Caption | 13px | 400–500 | 1.4 | 0 | Helper text, table captions, tabs |
| Micro | 12px | 400–500 | 1.4 | 0 | Meta, timestamps, hints |
| Eyebrow | 11px | 500–600 | 1.2 | `0.06–0.1em` UPPER | Section labels, metric labels |
| Mono | 11–13px | 400 | 1.3 | 0 | IDs, hashes, file names |

**No text below 11px.** If you think you need it, the layout is wrong.

### 3.4 Copy conventions
- Titles: **sentence case**, no trailing period ("Spend requests", not "Spend Requests." or "SPEND REQUESTS")
- Eyebrow labels: **UPPERCASE** with 0.06–0.1em letter-spacing
- Buttons: imperative verb first ("Submit request", "Approve", "Request changes" — never "OK" or "Yes")
- Numbers: always tabular — `font-variant-numeric: tabular-nums` for anything in a column
- Currency: `$12,450.00` for USD, `RM 12,450.00` for MYR, etc. Symbol + non-breaking space before amount for non-$ currencies
- Dates: relative for recent (`3h ago`, `Yesterday`), ISO-ish for old (`Apr 12, 2026`)
- Empty-state messaging: tell them **what goes here and how to create one** — never just "No data."

---

## 4 · Spacing & layout

### 4.1 Spacing scale (4px base)
Use multiples of 4. Named steps, in px:

| Name | Value | Use |
|---|---|---|
| `xs` | 4 | Icon-label gap, tight dot-text |
| `sm` | 8 | Button icon gap, pill internal |
| `md` | 12 | Inline groups, form field label-to-input |
| `lg` | 16 | Card internal column gap, grid gutter sm |
| `xl` | 20 | Grid gutter default, card outer margin |
| `2xl` | 24 | Section vertical rhythm, card padding |
| `3xl` | 32 | Page padding, section spacing |
| `4xl` | 48 | Major vertical breaks, empty-state padding |
| `5xl` | 64 | Page bottom padding (room to breathe past footer) |

> Tailwind equivalents: `gap-1`=4px, `gap-2`=8px, `gap-3`=12px, `gap-4`=16px, `gap-5`=20px, `gap-6`=24px, `gap-8`=32px. Stick to these; skip 10/14/18/22.

### 4.2 Radius — `--mv-radius-*`
| Token | Value | Use |
|---|---|---|
| `none` | 0 | — |
| `xs` | 4px | Mono-chip, ID pill |
| `sm` | 8px | Inputs, small cards, dropdowns |
| `md` | 16px | Cards, metric cards, side panels |
| `lg` | 24px | Modals, hero surfaces |
| `full` | 128px | Pills — buttons, chips, badges, status, avatars |

**Button default = `--mv-radius-full`** (pill). This is a brand-distinctive choice — do not override to `rounded-lg`.

### 4.3 Shadows — `--mv-shadow-*`
| Token | Use |
|---|---|
| `light` | Card hover lift, default popover |
| `medium` | Dropdowns, active cards |
| `strong` | Modals, fullscreen overlays |
| `focus` | **Focus ring only** — 4px @ 35% purple |

No custom shadows. No multi-layer ambient/penumbra shadows. No text-shadow anywhere.

### 4.4 Page layout anatomy

Every authenticated page follows:

```
┌─────────────────────────────────────────────────┐
│  .of-topbar  — sticky, 64px, full-width          │
├─────────────────────────────────────────────────┤
│  .of-page  — padding: 32px 32px 64px              │
│  ┌──────────────────────────────────────────┐    │
│  │ .of-page__header                          │    │
│  │   eyebrow · title · subtitle · actions    │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ .of-metrics  (optional, 4-col grid)       │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ main content: .of-split | .of-table-wrap  │    │
│  │               | .of-panels | custom       │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Form flows** (spend request, offboarding) use `.of-formshell` instead — a 280px rail + scrollable content + sticky footer. Not a modal, not a page. See § 7.2.

### 4.5 Responsive behavior
- **Desktop first**, min design width 1280px, optimized for 1440px. The portal runs on laptops — mobile is a secondary concern.
- Breakpoints: `≥1440` full, `1024–1439` slight density tightening, `<1024` single-column stack. No mobile-specific views until a PRD explicitly asks.
- Never use `<` `md:` / `lg:` / `xl:` Tailwind breakpoints in new code without designer sign-off — it almost always means you're reinventing responsive logic the DS already handles.

---

## 5 · Iconography

### 5.1 Source
- **Primary:** Inline SVG via a single `Icon` component (to be created — track in `lib/ui/icons/`). Size default 16px, 1.5px stroke, currentColor.
- **Fallback:** Lucide glyphs via copy-pasted inline SVG.
- **Never:** Emoji, Font Awesome, Material Icons, PNG icons. Emoji is explicitly off-brand per the frontend-design guidelines.

### 5.2 Sizes
`12 · 14 · 16 · 20 · 24 · 32`. Anything else is wrong.

| Size | Use |
|---|---|
| 12 | Inline with micro text |
| 14 | Input trailing, chip icon |
| 16 | Default button, nav, table cell |
| 20 | Page header actions, metric card icon |
| 24 | Empty-state art, modal header |
| 32 | Hero affordances only |

### 5.3 Color
Icons inherit `currentColor`. Never give an icon its own fill that doesn't match the surrounding text. Colored icons (green check, red X) are **status symbols**, placed intentionally next to a text status — not default ornament.

---

## 6 · Motion

### 6.1 Tokens
```
--mv-dur-fast: 120ms   (micro: hover, focus, press)
--mv-dur-base: 200ms   (default: state changes, chip selection)
--mv-dur-slow: 320ms   (choreographed: modal rise, panel slide)

--mv-ease-standard: cubic-bezier(0.2, 0, 0, 1)    (default)
--mv-ease-enter:    cubic-bezier(0, 0, 0, 1)      (element entering)
--mv-ease-exit:     cubic-bezier(0.4, 0, 1, 1)    (element leaving)
```

### 6.2 Rules
- Hover/focus transitions: **`fast` + `standard`** on color/background/border properties only.
- State changes (selected, expanded): **`base` + `standard`**.
- Layout shifts (modal open, drawer slide, accordion): **`slow` + `enter`** in, **`base` + `exit`** out.
- **Never animate**: `width`, `height`, `top/left/right/bottom`. Use `transform` and `opacity`.
- **Respect `prefers-reduced-motion`**: all non-essential motion becomes an instant state change. Add this to any new animated component:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 6.3 Choreography
- Modals rise **and** fade in. Scrim fades first (120ms), modal rises 8px as it fades (320ms).
- Drawers slide from the right, never the left. 320ms.
- Row selection: 120ms background fade + 120ms left accent bar appear (`::before`). No bounce, no scale.
- Success states (post-submit confirmation): a single 200ms fade-in of the tick. No confetti, no pulsing checkmark.

---

## 7 · Components — canonical recipes

All component CSS lives in `app/of.css` (DO NOT split into per-component stylesheets until we adopt CSS Modules repo-wide). React wrappers go in `components/ui/` (new directory — to be created).

### 7.1 Buttons — `.mv-btn`

Single class + modifiers. **Always pill-radius.** Default padding `14px 28px`, `--sm` variant `9px 16px`, `--lg` `18px 36px`.

| Variant | Class | Use |
|---|---|---|
| Primary | `.mv-btn.mv-btn--primary` | Main CTA per screen — one per view ideally |
| Secondary | `.mv-btn.mv-btn--secondary` | Paired with primary, cancel-like |
| Ghost | `.mv-btn.mv-btn--ghost` | Tertiary, inline, toolbars |
| Danger | `.mv-btn.mv-btn--danger` | Destructive only: reject, delete, offboard confirm |

Rules:
- **One primary per screen**, max. Two is a red flag — revisit the hierarchy.
- Icon + label: 8px gap, icon 16px, icon before label.
- Disabled state is `opacity: 0.45 + cursor: not-allowed`. Do not grey out the color separately.
- Loading state: swap label for `<Spinner size={14} />` + keep width — use `min-width` pre-measured.
- Never add box-shadow to buttons except the focus ring.

### 7.2 Forms — `.of-formshell`

**All multi-step forms** (spend request, offboarding, vendor onboarding, updates) use this shell:

```
┌─────────────────────────────────────────┐
│  .of-formshell__bar — breadcrumb + close │
├──────────┬──────────────────────────────┤
│          │                               │
│  280px   │   max-width 920px content     │
│  rail    │   stacked .of-formcard's      │
│ stepper  │   with gap 20px               │
│          │                               │
├──────────┴──────────────────────────────┤
│  .of-formshell__footer — sticky, progress│
└─────────────────────────────────────────┘
```

- Each **form card** (`.of-formcard`) = one logical section, with its own eyebrow + title, gradient header, and `.of-field-grid` (two columns on ≥1024, one on smaller).
- Stepper numbers: grey default → purple active → green completed. Clicking a step jumps to it. Completed steps remain clickable (no "locked forward" UX).
- Sticky footer shows progress bar (`.of-formshell__progress`), back button (ghost), next/submit (primary). Progress reflects **required fields complete**, not steps visited.
- Autosave indicator lives above the footer: `Saved 2s ago` in `--mv-text-subtle`. Save on blur + every 5s if dirty.
- Field required marker: tiny red `*` via `.of-field__req`. Label text first, then asterisk. Never put `(required)` in the label.

Field primitives:
- `.mv-input` — text, number, email, date, select, textarea all share. 42px min height, 8px radius, `--mv-bg-muted` fill → `--mv-surface` on focus.
- `.of-chip-choice` — selectable chip groups (segmented-like but multi-wrap). Use instead of `<select>` when ≤ 6 options.
- `.of-segmented` — segmented control, ≤ 4 items, single-select only.
- `.of-moneyrow` — currency picker + amount + converted-to-USD display. Used once per screen max.
- `.of-quote` — file upload row, with add variant `.of-quote--add`.
- `.of-vendor-pick` — vendor search result card, for selecting an existing vendor.
- `.of-systems` — checkbox list for system-offboarding actions.

### 7.3 Badges & status — `.mv-badge` / `.of-status`

- **`.mv-badge`** — neutral label for categories, counts, flags ("1-time", "Recurring", "Budgeted").
- **`.of-status`** — request state only. Uses the canonical § 2.5 map.

Rules:
- Max 4 badges per row on any card — more than that, use a "+N" overflow chip.
- Never stack badges vertically.
- Dot badges (`.of-status__dot`) are 6px, flush with currentColor.

### 7.4 Metric cards — `.of-metric`

```
┌───────────────────────────────┐
│ ● LABEL IN EYEBROW             │
│                                │
│ 32px bold value  sub-unit      │
│ caption with ↑ trend pill      │
│                    ╱╲ sparkline│
└───────────────────────────────┘
```

- Grid: 4 columns default (`.of-metrics`), 5 for FinOps (`.of-finops__kpis`).
- One color dot per card (`.of-metric__dot--purple/orange/green/blue`). Color maps to **domain**, not value direction.
- Trend pill is separate: up=green, down=orange (or red for spend overrun context), flat=grey.
- Sparklines are **optional**; when present, bottom-right absolute, 88×32, SVG only, `currentColor` with 0.9 opacity.
- Whole card is clickable → drills into a filtered list. Show hover lift (`--mv-shadow-medium` + `translateY(-1px)`).

### 7.5 Tables — `.of-table`

- Header row: `--mv-bg-muted` background, 11px uppercase eyebrow text, tracking `0.05em`.
- Body rows: 15px 20px padding, hover `--mv-grey-100`, row is clickable → detail pane or drawer.
- Cells with numbers: `font-variant-numeric: tabular-nums` on the cell or a `.of-table__amount` class.
- Vendor cells: use `.of-table__vendor` with 32px logo, name, mono ID.
- Stage bars: `.of-table__stage-bars` with 4px-tall segments, done=green, active=brand, remaining=border color. Use for any 3-to-5 step pipeline rendered in a row.
- No zebra striping. Hairline dividers only.
- Sortable columns: chevron icon (14px) after label, rotates on toggle. Default sort state has no chevron visible.
- Empty table: swap `<tbody>` for a full-row `.of-empty` (48px vertical padding, art + title + subtitle + CTA).

### 7.6 Split view — `.of-split`

For list+detail pages (My requests, Approvals). Grid `1fr | 1.3fr` on desktop.
- Left list: `.of-split__list` with sticky header (title + count).
- Rows `.of-row` — 3-column grid (icon · body · right-rail).
- Selected row: `--mv-brand-light` background + 3px brand accent bar on the left edge via `::before`.
- Right detail: sticky at `top: 80px`, never scrolls below top bar. Has gradient header (brand-light → surface), kv grid body, and sticky `.of-detail__actions` footer.

### 7.7 Modals — `.of-modal`

- Scrim `rgba(15,19,26,0.55)` — dark mode same. Fades in 200ms.
- Modal: 640px default width, `--mv-radius-lg`, `--mv-shadow-strong`. Rises 8px on enter (320ms).
- Header: title (display L) + optional sub + close X (24px, `.of-iconbtn`).
- Footer: `--mv-bg-muted` surface, buttons right-aligned, secondary left / primary right. A subtle helper link can live on the left ("Learn how approvals work →").
- Modal for: creating a new resource, destructive confirm, focused decision. **Not for:** multi-step forms (use `.of-formshell`), viewing details (use split view or drawer).
- One modal at a time. No stacked modals. Ever.

### 7.8 Callouts & feedback — `.of-callout`

Inline information strip. Variants:
- `.of-callout--info` — brand-tinted, "FYI, here's what happens next"
- `.of-callout--warn` — amber-tinted, "Heads up, this might cause friction"
- `.of-callout--error` — red-tinted, "Something's wrong, fix before continuing"

Use toasts for **transient** feedback (save confirmations, errors on submit). Toasts are not yet implemented — when we build them, they live in `components/ui/Toast.tsx` and share these three variant styles.

### 7.9 Empty states — `.of-empty`

Every list / table / tab **must** have an empty state. Recipe:
```
72×72 gradient art (brand-light → pink-soft)
→ 18px bold title ("No approvals waiting")
→ 14px muted subtitle explaining why + when they would see something
→ Primary or ghost CTA ("Create your first request")
```
Never ship a blank region. Never ship "No data" as the only copy.

### 7.10 Loading — `.of-skel`

Skeleton rows, not spinners, for list/table loads. Match the final layout geometry so there's no jump. Use `--mv-grey-150` → `--mv-grey-200` shimmer over 1.4s.

Full-page route loading (`loading.tsx`): 40% opacity logo + skeleton shell. No centered spinner.

---

## 8 · Data display patterns

### 8.1 Numbers & currency
- Always `tabular-nums` in grids/tables.
- Round currency to 2 decimals, always show them (`$1,200.00`, never `$1,200`).
- Amounts ≥ 1M: abbreviate in metric cards only (`$2.4M`), never in tables or detail views (show full).
- Negative amounts: parentheses `($500.00)`, not leading minus. Color in `--mv-red-content` when variance-to-budget, `--mv-text` otherwise.

### 8.2 Dates & times
- Timestamp in feeds: `3h ago` → `Yesterday` → `Apr 12` → `Apr 12, 2025` (cross-year).
- Full datetime in detail views: `Apr 12, 2026 · 2:34 PM UTC+8` (always show TZ).
- Date inputs: ISO `YYYY-MM-DD` format internally, display as localized long date.

### 8.3 People
- Avatar 32px default in top bar, 26px in tables, 28px in activity feeds.
- Generated from initials on a color taken from a stable hash of the email. Never use the user's actual photo unless uploaded (no Gravatar auto-pull).
- Name + role format: name on top (14px, weight 500, `--mv-text`) + role below (11px, `--mv-text-subtle`).

### 8.4 Request IDs
- Always monospace: `.of-mono` or `--mv-font-mono`.
- 11px, `--mv-text-subtle`, sometimes inside a small `--mv-radius-xs` chip with `--mv-border-muted` border.
- Shorten for inline: `rec…9A42` with full on hover/copy.

---

## 9 · Dark mode

- Single switch: `data-mv-theme="dark"` on `<html>` or `<body>`. All token values flip.
- **Never** use per-component `dark:` Tailwind utilities in new code. They bypass the token system and break the single-switch promise.
- Surfaces get darker (more grey, not pure black) as they become more elevated — inverts the light-mode convention. Validated in tokens.
- Brand remains `--mv-brand` (purple stays purple); text-link shifts to `--mv-brand-bright` for contrast on dark surfaces.
- Shadows get heavier alphas (0.45 → 0.65) since they're fighting a dark background.
- Persistence: user's choice written to `localStorage.mvTheme`, re-applied in a `<script>` inside `<head>` before first paint to avoid flash.

---

## 10 · Accessibility

### 10.1 Baseline
- **Target: WCAG 2.1 AA.** Every new component ships ≥ AA; AAA on body copy is a bonus.
- Keyboard navigable: Tab-order matches visual order; every interactive element has a visible `:focus-visible` state using `--mv-shadow-focus`.
- Forms: every input has a `<label>` (not placeholder-as-label), errors are announced via `aria-live="polite"` regions.
- Modals: trap focus on open, return focus to trigger on close, Esc dismisses, scrim click dismisses (with unsaved-changes guard if form-ish).
- Tables: `<th scope="col">` on headers, proper `<caption>` for screen readers.

### 10.2 Motion & transparency
- Honor `prefers-reduced-motion` globally (already in `of.css` base).
- No auto-playing video, no auto-rotating carousels.
- No animations longer than 320ms on route changes.

### 10.3 Not acceptable
- `<div onClick>` instead of `<button>`. Never.
- Placeholder text as the only label.
- Disabled buttons with no explanation of why.
- Relying on color alone to convey state (always pair with icon/text).
- Custom focus styles that remove the ring (never `outline: none` without replacement shadow).

---

## 11 · File & code conventions

### 11.1 Where styles live
```
app/globals.css          ← TOKENS ONLY (CSS vars, theme data-attrs, base reset)
app/of.css               ← COMPONENT CLASSES (.mv-btn, .of-*, etc.)
components/ui/*.tsx      ← React wrappers for the classes (thin, typed)
components/<domain>/*.tsx← Feature components that USE ui/*
```

### 11.2 Naming
- CSS classes: `mv-*` for cross-product primitives (button, badge, input), `of-*` for OneFlow-specific compositions (topbar, formshell, queue, funnel). Don't mix prefixes within one class.
- React components: `PascalCase.tsx`, matching default export name.
- Hooks: `useCamelCase.ts` in `lib/hooks/`.
- CSS custom properties: `--mv-<scope>-<variant>` (no camelCase).

### 11.3 Tailwind usage policy

**Tailwind v4 is in the repo and stays.** But:

| ✅ Do | ❌ Don't |
|---|---|
| Use `flex`, `grid`, `gap-*`, `items-*`, `min-h-*` for layout primitives | Use `bg-neutral-950`, `text-yellow-800`, `ring-blue-500` — go through tokens |
| Use `@apply` sparingly in `of.css` to compose utility bundles | Hard-code raw hex in className strings |
| Let the DS class (`.mv-btn--primary`) handle all color/typography/motion | Override DS classes with ad-hoc Tailwind on top |
| Use Tailwind for prototype-only scratch work | Ship a PR where a component mixes DS classes and `dark:bg-neutral-800` |

Rule of thumb: **if a Tailwind utility touches color, radius, typography, or motion, replace it with a token-backed class.** Tailwind is allowed for layout-only.

### 11.4 Component file structure

Every shipped component has this file layout:

```tsx
// components/ui/Button.tsx
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;        // default: "primary"
  size?: Size;              // default: "md"
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
}

export function Button({ variant = "primary", size = "md", ... }: ButtonProps) {
  return (
    <button
      className={clsx(
        "mv-btn",
        `mv-btn--${variant}`,
        size !== "md" && `mv-btn--${size}`,
        props.className,
      )}
      {...props}
    >
      ...
    </button>
  );
}
```

Rules:
- Props are typed, variants are a discriminated union.
- `className` always accepted and composed last.
- Default variant hard-coded in the destructure, never "default unset".
- Never re-implement focus/hover/disabled at the component level — let the class do it.

---

## 12 · Migration plan — living section

### 12.1 Priority list (from audit)

| File | Issue | Action |
|---|---|---|
| `app/page.tsx` | `bg-neutral-950 text-white` hard-coded | Use `--mv-bg` / `--mv-text` via the `.of-*` shell classes |
| `components/spend-request/StatusBadge.tsx` | Tailwind color utilities per state | Replace body with `<span className={`of-status of-status--${mapStatus(status)}`}>` — see § 2.5 |
| `components/spend-request/IntakeForm.tsx` | Inline `inputCls`, `selectCls` with raw Tailwind; SectionHeader uses neutral greys directly | Migrate to `.of-formshell` + `.of-formcard` structure, swap inputs to `.mv-input`, labels to `.of-field__label` |
| `components/spend-request/RequestCard.tsx` | Unknown — audit next | — |
| `components/offboarding/OffboardingForm.tsx` | Same pattern as IntakeForm | Use `.of-formshell` + `.of-check` |
| `components/vendors/VendorDataTable.tsx` | Audit for Tailwind color utilities | Migrate to `.of-table` structure |
| `app/layout.tsx` | Imports Geist fonts | Remove Geist imports; body already uses `--mv-font-body` |

### 12.2 Per-PR rule
When touching a legacy file for any reason:
1. If the change is < 10 lines: leave existing styles, flag a TODO with `// TODO(ds-migration):` prefix.
2. If the change is ≥ 10 lines OR touches visible chrome: migrate the component to DS classes as part of the PR. No new Tailwind color utilities.
3. If the file is > 300 lines: file a migration ticket, size it, do it in a dedicated PR the same sprint.

### 12.3 "Adding a new feature"
1. Read this doc.
2. Check `design_handoff_oneflow/OneFlow Redesign.html` for a screen that resembles yours — odds are half your UI already has a recipe.
3. Compose existing `.of-*` / `.mv-*` classes. **Do not create new class names unless you genuinely need a new primitive.**
4. If you do need a new primitive:
   - Propose it in `#design-system` (Slack) with a sketch
   - Add the CSS to `app/of.css` using only semantic tokens
   - Add a React wrapper in `components/ui/`
   - Document it here before merge

---

## 13 · Anti-patterns — what we don't do

- ❌ **Emoji in UI.** Ever. Not in empty states, not in confirmation tick screens, not in buttons.
- ❌ **Gradient backgrounds on content surfaces.** We use gradients only for: (a) the brand logo mark, (b) avatar color fills, (c) detail-pane header fade, (d) empty-state art. Never on cards, buttons, headers.
- ❌ **Rounded-corner left-border callout cards** (the "bootstrap alert" pattern). We use `.of-callout` with full surrounding border instead.
- ❌ **Inventing new hex colors** mid-feature ("the figma mock has `#6b46c1`"). Map it to the nearest `--mv-*` token or escalate to add one.
- ❌ **Per-component dark mode.** Single `[data-mv-theme]` switch only.
- ❌ **`<img>` for icons.** Inline SVG only.
- ❌ **Multiple primary buttons on one screen.**
- ❌ **Scroll-hijacking**, sticky things that fight the top bar, or `scrollIntoView` — it wars with the form shell.
- ❌ **"Just this once" exceptions.** Every deviation compounds. If you genuinely need one, document it as an extension to this file in the same PR.
- ❌ **Stacked modals**, toast-over-modal, drawer-from-modal. One surface of focus at a time.
- ❌ **AI-generated icon SVGs or illustrations.** Use the designed set or a placeholder block.

---

## 14 · Governance

- **Owner:** Design systems (embed, currently: @alex-design) + Frontend platform (currently: @priya-fe)
- **Changes:** PR to `DESIGN_SYSTEM.md` + `app/globals.css` / `app/of.css` together. Two approvals required, one from each owner group.
- **Versioning:** Semver-ish. Breaking token renames = major. New tokens/components = minor. Doc clarifications = patch.
- **Review cadence:** Monthly DS sync, reviewing (a) migration progress on § 12, (b) pending primitive proposals, (c) misuses found in PR review.
- **Audit tool (future):** ESLint rule that blocks raw hex colors and blocks Tailwind color utilities outside a narrow allowlist. Tracked in `plans/sprint-plan.md`.

---

## 15 · Quick-reference cheat sheet

```
BUTTON:    .mv-btn .mv-btn--primary | --secondary | --ghost | --danger
INPUT:     .mv-input (same class for input/select/textarea)
BADGE:     .mv-badge | --green | --orange | --blue | --grey | --red
STATUS:    .of-status .of-status--review | --approved | --rejected | ...
CARD:      .of-metric | .of-formcard | .of-panel | .of-confirm__card
MODAL:     .of-modal-scrim > .of-modal > __header/__body/__footer
FORM:      .of-formshell > __bar + __layout(__rail + __content) + __footer
TABLE:     .of-table-wrap > table.of-table
LIST:      .of-split > __list (.of-row's) + .of-detail
TOOLBAR:   .of-toolbar with .of-filter-chip's
EMPTY:     .of-empty > __art + __title + __sub + CTA button
TOKENS:    --mv-{brand,blue,green,orange,pink,red,amber}-{base|bright|content|dark|light}
           --mv-{bg,surface,text,border}-{muted|subtle|strong|inverse}
           --mv-{radius,shadow,dur,ease}-{...}
           --mv-font-{display,body,mono}, --mv-weight-{regular,medium,bold}
```

When in doubt: **copy the closest recipe from `design_handoff_oneflow/OneFlow Redesign.html` and adapt.** That file is the living reference implementation of this document.
