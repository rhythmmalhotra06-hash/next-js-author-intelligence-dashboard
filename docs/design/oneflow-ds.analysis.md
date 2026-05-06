---
title: 'OneFlow Design System — Speaker Intelligence Dashboard'
slug: 'oneflow-ds'
source-type: spec
source-url: 'DESIGN_SYSTEM.md'
package: null
integration: spec
status: analyzed
created: 2026-05-04
updated: 2026-05-04
completed: null
current_step: 0
total_steps: 6
scope:
  apps: [speaker-intelligence-dashboard]
  categories: [colors, typography, spacing, radius, motion, components]
---

# Design Analysis: OneFlow DS → Speaker Intelligence Dashboard

## Decisions

| Decision | Value |
|---|---|
| Tech stack | Next.js (App Router), TypeScript, Tailwind v4 CSS-first |
| Project location | `dashboard/` subdirectory inside `Author-Intelligence` repo |
| Dark mode | Light mode only for v1 — dark token block kept for future |
| Font loading | Google Fonts (Google Sans + Plus Jakarta Sans 400/500/700) |
| Token source | Verified against live `globals.css` + `of.css` from OneFlow repo |

## Resolved Token Values

All values sourced from `/Users/rhythmmalhotra/Documents/GithubDev/auth-js-next-js-prisma-google-login-vendorportal/app/globals.css` and `of.css`.

### Brand Palette
| Token | Value |
|---|---|
| `--mv-brand` | `#7a12d4` |
| `--mv-brand-bright` | `#9b37f2` |
| `--mv-brand-content` | `#680fb4` |
| `--mv-brand-dark` | `#4f0c8a` |
| `--mv-brand-light` | `#f8efff` |
| `--mv-brand-border` | `#eed8fe` |

### Support Palettes
| Token | Value |
|---|---|
| `--mv-blue` | `#005cff` |
| `--mv-blue-bright` | `#329dff` |
| `--mv-blue-content` | `#1c3bd4` |
| `--mv-blue-dark` | `#1832b4` |
| `--mv-blue-light` | `#ebf5ff` |
| `--mv-blue-border` | `#cce6ff` |
| `--mv-green` | `#159f65` |
| `--mv-green-bright` | `#18c176` |
| `--mv-green-content` | `#128756` |
| `--mv-green-dark` | `#0e6742` |
| `--mv-green-light` | `#e8f9f1` |
| `--mv-orange` | `#ed6325` |
| `--mv-orange-bright` | `#ff931f` |
| `--mv-orange-content` | `#c9541f` |
| `--mv-orange-dark` | `#9a4018` |
| `--mv-orange-light` | `#fff4e9` |
| `--mv-pink` | `#df1a6f` |
| `--mv-pink-bright` | `#f72c84` |
| `--mv-pink-light` | `#feeaf3` |
| `--mv-red` | `#f34747` |
| `--mv-red-light` | `#ffe4e4` |
| `--mv-red-content` | `#8a1f1f` |
| `--mv-amber` | `#d4870c` |
| `--mv-amber-light` | `#fff4d9` |
| `--mv-amber-content` | `#7a5c00` |

### Neutral Ramp
| Token | Value |
|---|---|
| `--mv-grey-100` | `#f9f9f9` |
| `--mv-grey-150` | `#f3f4f6` |
| `--mv-grey-200` | `#f3f4f6` |
| `--mv-grey-250` | `#dfe1e5` |
| `--mv-grey-300` | `#ced1d7` |
| `--mv-grey-350` | `#b3b8c1` |
| `--mv-grey-400` | `#979ca5` |
| `--mv-grey-450` | `#71767f` |
| `--mv-grey-500` | `#595e67` |
| `--mv-grey-550` | `#41464f` |
| `--mv-grey-600` | `#292d38` |
| `--mv-grey-650` | `#181d26` |
| `--mv-grey-700` | `#0f131a` |
| `--mv-black` | `#0f131a` |
| `--mv-white` | `#ffffff` |

### Semantic Tokens (Light)
| Token | Value |
|---|---|
| `--mv-bg` | `#ffffff` |
| `--mv-bg-muted` | `#f9f9f9` |
| `--mv-bg-subtle` | `#f3f4f6` |
| `--mv-surface` | `#ffffff` |
| `--mv-surface-elevated` | `#ffffff` |
| `--mv-text` | `#0f131a` |
| `--mv-text-muted` | `#595e67` |
| `--mv-text-subtle` | `#71767f` |
| `--mv-text-disabled` | `#b3b8c1` |
| `--mv-text-inverse` | `#ffffff` |
| `--mv-text-link` | `#7a12d4` |
| `--mv-border` | `#dfe1e5` |
| `--mv-border-strong` | `#ced1d7` |
| `--mv-border-muted` | `#f3f4f6` |
| `--mv-focus-ring` | `#9b37f2` |

### Typography
| Token | Value |
|---|---|
| `--mv-font-display` | "Google Sans", "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif |
| `--mv-font-body` | "Google Sans", "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif |
| `--mv-font-mono` | ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace |
| `--mv-weight-regular` | 400 |
| `--mv-weight-medium` | 500 |
| `--mv-weight-bold` | 700 |

### Radius
| Token | Value |
|---|---|
| `--mv-radius-none` | 0 |
| `--mv-radius-xs` | 4px |
| `--mv-radius-sm` | 8px |
| `--mv-radius-md` | 16px |
| `--mv-radius-lg` | 24px |
| `--mv-radius-full` | 128px |

### Shadows
| Token | Value |
|---|---|
| `--mv-shadow-light` | `0 4px 15px 0 rgba(0,0,0,0.05)` |
| `--mv-shadow-medium` | `0 5px 20px 0 rgba(0,0,0,0.10)` |
| `--mv-shadow-strong` | `0 15px 30px 0 rgba(0,0,0,0.20)` |
| `--mv-shadow-focus` | `0 0 0 4px rgba(155,55,242,0.35)` |

### Motion
| Token | Value |
|---|---|
| `--mv-dur-fast` | 120ms |
| `--mv-dur-base` | 200ms |
| `--mv-dur-slow` | 320ms |
| `--mv-ease-standard` | cubic-bezier(0.2, 0, 0, 1) |
| `--mv-ease-enter` | cubic-bezier(0, 0, 0, 1) |
| `--mv-ease-exit` | cubic-bezier(0.4, 0, 1, 1) |

## Implementation Plan

### Step 1: Scaffold Next.js app at `dashboard/`
- `npx create-next-app@latest dashboard --typescript --app --no-tailwind --no-src-dir --import-alias "@/*"`
- Install Tailwind v4: `npm install tailwindcss @tailwindcss/postcss`
- Add `postcss.config.ts` pointing at `@tailwindcss/postcss`

### Step 2: Write `dashboard/app/globals.css`
- Google Fonts `@import` for Google Sans + Plus Jakarta Sans (400, 500, 700)
- `@import "tailwindcss"`
- `:root` block with every `--mv-*` token (brand, support palettes, grey ramp, semantic, typography weights, radius, shadow, motion)
- `[data-mv-theme="dark"]` block (structure only — not wired up in v1)
- `@theme inline` block (`--font-sans`, `--font-mono`, `--color-background`, `--color-foreground`)
- Base reset (box-sizing, body font/color/antialiasing, `background: var(--mv-bg-muted)`)

### Step 3: Write `dashboard/app/of.css`
Full component CSS from OneFlow:
- `.mv-btn`, `.mv-input`, `.mv-badge`
- `.of-topbar` and all sub-elements
- `.of-page`, `.of-page__header`
- `.of-metrics`, `.of-metric`, `.of-metric__trend`, `.of-sparkline`
- `.of-status` (approved/rejected/review/draft/submitted/backlog)
- `.of-toolbar`, `.of-filter-chip`
- `.of-split`, `.of-row`, `.of-detail`
- `.of-table-wrap`, `.of-table`
- `.of-panels`, `.of-panel`
- `.of-modal-scrim`, `.of-modal`
- `.of-chip-choice`, `.of-segmented`
- `.of-empty`, `.of-skel`
- `.of-tag`, `.of-dot`, `.of-iconbtn`
- `.of-callout`, `.of-timeline`
- `@keyframes` for modal-rise, fade-in, skeleton shimmer

### Step 4: Write `dashboard/app/layout.tsx`
- Import `globals.css` and `of.css`
- `html lang="en"`, metadata title: `"Speaker Intelligence — Mindvalley"`
- Body font via `style={{ fontFamily: 'var(--mv-font-body)' }}` (not a className)

### Step 5: Write `dashboard/app/page.tsx`
- Placeholder shell: topbar + `.of-empty` state
- Verifies tokens render before building the 3 views

### Step 6: Verify build
- `cd dashboard && npm run build`
- Fix any compilation errors, retry up to 2 times

## Progress

- [ ] Step 1: Scaffold Next.js app at `dashboard/`
- [ ] Step 2: Write `dashboard/app/globals.css`
- [ ] Step 3: Write `dashboard/app/of.css`
- [ ] Step 4: Write `dashboard/app/layout.tsx`
- [ ] Step 5: Write `dashboard/app/page.tsx`
- [ ] Step 6: Verify build
