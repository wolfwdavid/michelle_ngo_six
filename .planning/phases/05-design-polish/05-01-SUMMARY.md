---
phase: 05-design-polish
plan: 01
subsystem: ui
tags: [tailwind, svelte, design-tokens, typography, oklch, css]

# Dependency graph
requires:
  - phase: 02-homepage-rails
    provides: "@theme token system (--content-max, --page-gutter, --ease-cinematic, OKLCH neutral + accent ramps)"
  - phase: 04-content-pages
    provides: "about/contact/press surfaces and chrome (TopNav, Footer, FilterPillBar)"
provides:
  - "Four-size display ramp in @theme (--text-hero/h1/h2/meta)"
  - "Section vertical-rhythm tokens (--section-y, --section-y-sm)"
  - "Wordmark identity + body leading tokens (--tracking-wordmark, --leading-body)"
  - "Scrim tokens for poster overlays (--scrim-vertical, --scrim-strong, --text-shadow-cinema) consumed by Plans 05-03/05-04"
  - "Chrome aligned to the content-max boundary; text-xs removed from chrome; visible 'All Work' header on /work"
affects: [05-03-contrast-contact-press, 05-04-cinematic-motion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Heading sizes referenced via Tailwind arbitrary length utility: text-[length:var(--text-h1)]"
    - "Editorial section padding via py-[var(--section-y)] / pt-[var(--section-y-sm)]"

key-files:
  created: []
  modified:
    - src/app.css
    - src/lib/components/TopNav.svelte
    - src/lib/components/FilterPillBar.svelte
    - src/lib/components/Footer.svelte
    - src/routes/watch/[id]/+page.svelte
    - src/routes/work/+page.svelte
    - src/routes/work/[category]/+page.svelte
    - src/routes/about/+page.svelte

key-decisions:
  - "Heading sizes consumed via text-[length:var(--text-*)] arbitrary utilities (Tailwind v4 has no first-class --text-* heading classes for these custom names)"
  - "Grid py-8 on /work and /work/[category] left as-is — grids are not editorial sections, only the page header gets section rhythm"
  - "/work 'All Work' header reports data.videos.length (full catalog total), independent of the active client-side filter"

patterns-established:
  - "Single heading ramp: hero/h1/h2/meta is the only display scale across chrome and pages"
  - "Section rhythm: editorial sections use --section-y / --section-y-sm, never ad-hoc py-8/16/24"
  - "12px is reserved for font-mono badges only; chrome text floors at text-sm (14px)"

requirements-completed: [DSN-01]

# Metrics
duration: 11min
completed: 2026-06-15
---

# Phase 5 Plan 01: Tokens, Typography, and Spacing Summary

**Collapsed the sitewide display scale to a four-size heading ramp, unified editorial section rhythm and the chrome/content boundary, and added OKLCH scrim tokens — all defined once in `app.css` `@theme` and remapped across chrome, browse, watch, and about.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-06-14T23:55:01Z
- **Completed:** 2026-06-15T00:05:28Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Added a four-size heading ramp (`--text-hero/h1/h2/meta`), section-rhythm tokens (`--section-y`, `--section-y-sm`), wordmark/leading tokens, and a shared scrim idiom (`--scrim-vertical`, `--scrim-strong`, `--text-shadow-cinema`) to the existing `@theme` block.
- Lifted `text-xs` out of TopNav nav links and FilterPillBar chips to `text-sm`, reserving 12px for font-mono badges only.
- Aligned TopNav and Footer to `--content-max` so chrome edges match content edges top-to-bottom.
- Remapped the watch title and `/work/[category]` header to `--text-h1`, the related heading to `--text-h2`, and applied `--section-y`/`--section-y-sm` to about, watch metadata, and the category header.
- Added a visible "All Work" header with total video count to the `/work` index, matching the `/work/[category]` entry hierarchy.

## Task Commits

Each task was committed atomically (all `--no-verify`):

1. **Task 1: Add heading/section/tracking/scrim tokens to app.css @theme** - `ccb4182` (feat)
2. **Task 2: Remap chrome + browse/watch/about to the new tokens** - `76b076c` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/app.css` - Added heading ramp, section-rhythm, wordmark/leading, and scrim tokens inside `@theme`
- `src/lib/components/TopNav.svelte` - `max-w-7xl` → `max-w-[var(--content-max)]`; nav links `text-xs` → `text-sm`
- `src/lib/components/FilterPillBar.svelte` - chip `text-xs` → `text-sm`
- `src/lib/components/Footer.svelte` - `max-w-7xl` → `max-w-[var(--content-max)]`
- `src/routes/watch/[id]/+page.svelte` - title → `--text-h1`, related heading → `--text-h2`, container `py-8` → `py-[var(--section-y-sm)]`
- `src/routes/work/+page.svelte` - added visible "All Work" header with total count
- `src/routes/work/[category]/+page.svelte` - header → `--text-h1`, `pt-8` → `pt-[var(--section-y-sm)]`
- `src/routes/about/+page.svelte` - `py-16 md:py-24` → `py-[var(--section-y)]`

## Decisions Made
- Heading sizes are consumed via `text-[length:var(--text-*)]` arbitrary utilities rather than synthesized Tailwind classes, since these custom heading names are not first-class `--text-*` font-size tokens in this setup.
- Grid `py-8` on `/work` and `/work/[category]` was intentionally left unchanged — grids are not editorial sections, so only the page header receives section rhythm (per plan note).
- The `/work` "All Work" header reports `data.videos.length` (full catalog total), kept independent of the active client-side filter so the header reads as a stable section title.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Mid-run, `pnpm check` reported two type errors in `MobileMenu.svelte`. That file is owned by the parallel Plan 05-02 (explicitly out of this plan's scope and not to be touched). The errors did not originate from this plan's files: `pnpm build` exited 0 throughout, and once 05-02 resolved them a clean `pnpm check` ran 0 errors / 0 warnings. No action taken on MobileMenu from this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- DSN-01 progressed: heading ramp + section rhythm + chrome-width unified and applied across chrome/browse/watch/about; display sizes collapsed from five to four; `text-xs` removed from chrome.
- Scrim tokens (`--scrim-vertical`, `--scrim-strong`, `--text-shadow-cinema`) and `--text-hero` are defined and ready for Plan 05-03 (contact/press contrast remap) and Plan 05-04 (cinematic motion) to consume.
- `/contact` and `/press` intentionally untouched (owned by 05-03). No route changes; strict prerender green.

## Self-Check

- FOUND: src/app.css (`--text-hero`, `--section-y`, `--scrim-vertical`)
- FOUND: src/routes/work/+page.svelte ("All Work" header)
- FOUND commit: ccb4182
- FOUND commit: 76b076c
- `pnpm check`: 0 errors / 0 warnings
- `pnpm build`: exit 0, strict prerender intact

## Self-Check: PASSED

---
*Phase: 05-design-polish*
*Completed: 2026-06-15*
