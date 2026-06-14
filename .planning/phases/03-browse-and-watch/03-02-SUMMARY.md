---
phase: 03-browse-and-watch
plan: 02
subsystem: ui
tags: [svelte5, sveltekit, runes, prerender, adapter-static, tailwind, filter]

# Dependency graph
requires:
  - phase: 02-home-and-cards
    provides: VideoCard, categoryAccent helpers, getCategoriesInDisplayOrder, motion rune
  - phase: 03-browse-and-watch (03-01)
    provides: watch player route the work grid links into
provides:
  - Dual-mode FilterPillBar (client-side filter callbacks AND base-path-safe links)
  - Prerendered /work browse index with client-side category filtering over all videos
  - /work removed from the prerender allow-list (now genuinely crawled and built)
affects: [03-03-work-category, filtering, navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual-mode component: optional onselect prop switches each pill between <button> (filter) and <a> (link) so one component serves /work and /work/[category]"
    - "Single-page client-side filter via $state('all') + $derived grid, no navigation"
    - "Prune-as-you-ship prerender allow-list: a route leaves PENDING_ROUTES the moment its real page exists"

key-files:
  created:
    - src/lib/components/FilterPillBar.svelte
    - src/routes/work/+page.ts
    - src/routes/work/+page.svelte
  modified:
    - svelte.config.js

key-decisions:
  - "Active pill keyed off an `active` prop (not page.url) so the same component drives both the URL-less client filter and the link route"
  - "Filter mode uses aria-pressed, link mode uses aria-current=page; the active pill is found for scroll-into-view via a shared data-active attribute"

patterns-established:
  - "Dual-mode pill bar: onselect present -> buttons (filter); onselect absent -> anchors (links)"
  - "Browse index = one prerendered page + $derived client-side filter, not per-category prerendered pages"

requirements-completed: [BRW-01, BRW-03]

# Metrics
duration: 5min
completed: 2026-06-14
---

# Phase 03 Plan 02: Work Index Summary

**Prerendered /work browse index — a dual-mode FilterPillBar (All + 8 categories in display order) over a responsive VideoCard grid that filters client-side via $state/$derived, with /work pruned from the prerender allow-list.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-14T20:41:41Z
- **Completed:** 2026-06-14T20:46:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Built a reusable `FilterPillBar` with a dual prop contract: `onselect` present renders each pill as a `<button>` (client-side filter); absent renders each as a base-path-safe `<a>` (for /work/[category] in Plan 03-03). Active pill uses the compound category accent; active "All" pill uses the neutral inverted chip.
- Built `/work` as a single prerendered page: load passes all videos, a responsive 2/3/4-column grid of `VideoCard`s, and a `selected` (`$state`) + `filtered` (`$derived`) client-side filter. Selecting a pill narrows the grid with no navigation; the All pill restores the full set.
- Pruned the bare `'/work'` from `PENDING_ROUTES` in `svelte.config.js` while keeping `isPendingWorkCategory` (`startsWith('/work/')`) — so strict prerender now genuinely crawls and builds `/work` (all 56 cards present in `build/work/index.html`), while `/work/[category]` stays pending until Plan 03-03.

## Task Commits

Each task was committed atomically:

1. **Task 1: Port and adapt FilterPillBar (dual-mode)** - `bc38369` (feat)
2. **Task 2: Build /work index + prune /work from PENDING_ROUTES** - `da4bee2` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/lib/components/FilterPillBar.svelte` - Sticky All+8 category pill bar; dual-mode (filter callbacks or links); active-pill category accent; reduced-motion-aware scroll-into-view.
- `src/routes/work/+page.ts` - Prerendered load returning all videos (prerender/trailingSlash inherited from +layout.ts).
- `src/routes/work/+page.svelte` - Work index: FilterPillBar + responsive VideoCard grid + client-side filter via $state/$derived.
- `svelte.config.js` - Removed bare `'/work'` from PENDING_ROUTES; kept `/work/[category]` pending; updated comment.

## Decisions Made
- Active state is driven by an `active` prop rather than `page.url`, so the one component cleanly serves both the URL-less client filter (/work) and the link route (/work/[category]) without branching on routing internals.
- Filter mode signals state with `aria-pressed`; link mode with `aria-current="page"`. A shared `data-active` attribute lets the scroll-into-view effect locate the active pill in both modes.
- Stripped all `_three`-only scaffolding during the port: `--chrome-nav-height` var (replaced with `top-0`), jsdom/vitest scrollIntoView commentary, eslint-override notes, and the `page`-based active derivation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. `pnpm check` reported 0 errors/0 warnings; `pnpm build` exited 0 with strict prerender green and `/work` now crawled into `build/work/index.html` (56 `/watch/` links present).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `FilterPillBar` is ready for reuse in link mode by Plan 03-03 (/work/[category]); `isPendingWorkCategory` remains in the allow-list so that route can ship before it 404s the build.
- No blockers.

## Self-Check: PASSED

All created files exist (FilterPillBar.svelte, work/+page.ts, work/+page.svelte, build/work/index.html, 03-02-SUMMARY.md) and both task commits (`bc38369`, `da4bee2`) are present in history.

---
*Phase: 03-browse-and-watch*
*Completed: 2026-06-14*
