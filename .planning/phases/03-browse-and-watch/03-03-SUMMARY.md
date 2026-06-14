---
phase: 03-browse-and-watch
plan: 03
subsystem: ui
tags: [sveltekit, adapter-static, prerender, entries, routing]

requires:
  - phase: 03-browse-and-watch (Plan 03-02)
    provides: FilterPillBar dual-mode component, /work index grid pattern, data layer (getByCategory, categoryToSlug, slugToCategory)
provides:
  - /work/[category] prerendered per-category browse route (8 pages)
  - entries() enumerating all 8 category slugs from CATEGORIES
  - load() resolving slug to category with 404 on unknown slug
  - PENDING_ROUTES fully cleared of /work* (strict prerender genuinely covers all work routes)
affects: [phase-04-content-pages, phase-05-polish]

tech-stack:
  added: []
  patterns:
    - "Dynamic route prerendering via entries() over a single source-of-truth array (CATEGORIES)"
    - "FilterPillBar reused in link mode (active prop = current slug, no onselect) for category switching"

key-files:
  created:
    - src/routes/work/[category]/+page.ts
    - src/routes/work/[category]/+page.svelte
  modified:
    - svelte.config.js

key-decisions:
  - "load() returns slug alongside category so the page passes active={data.slug} to FilterPillBar without recomputing"
  - "Sync load() (not async) since adapter-static awaits load() anyway and there is no test runner requiring async 404 rejection"
  - "Removed the /work/ prefix matcher entirely from PENDING_ROUTES so any future broken /work link fails the build"

patterns-established:
  - "Per-category pages mirror the /work index grid classes (grid-cols-2/sm:3/lg:4) for visual consistency"

requirements-completed: [BRW-02]

duration: 8min
completed: 2026-06-14
---

# Phase 3 Plan 03: Work Category Route Summary

**Per-category `/work/[category]` browse route — entries() prerenders all 8 category slugs, load() resolves the category (404 on unknown) and lists its videos as a VideoCard grid with the FilterPillBar in link mode, and PENDING_ROUTES is now fully cleared of /work paths.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-14T20:50:24Z
- **Completed:** 2026-06-14T20:58:00Z
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- `/work/[category]` ships as 8 prerendered pages (build/work/<slug>/index.html), one per category slug derived from CATEGORIES.
- `load()` narrows the slug to a Category via `slugToCategory` and 404s on unknown slugs; videos sorted featured-first then published-descending.
- The category page shows a visible title + count header, the FilterPillBar in link mode (current pill active), and a responsive VideoCard grid matching the /work index.
- Pruned the `/work/` prefix matcher and `isPendingWorkCategory` from `svelte.config.js`; no /work* path remains in PENDING_ROUTES, so strict prerender genuinely crawls all 9 work pages.

## Task Commits

Each task was committed atomically:

1. **Task 1: work category load module (entries + load + 404)** - `ab1bc11` (feat)
2. **Task 2: category page render + prune /work/ from PENDING_ROUTES** - `cb319b2` (feat)

**Plan metadata:** (see final docs commit)

## Files Created/Modified
- `src/routes/work/[category]/+page.ts` - entries() over 8 category slugs; load() resolving category + sorted videos, error(404) on unknown slug; prerender inherited (not redeclared).
- `src/routes/work/[category]/+page.svelte` - Category page: sr-only h1, visible title + count header, FilterPillBar (link mode, active={data.slug}), responsive VideoCard grid.
- `svelte.config.js` - Removed isPendingWorkCategory and the /work/ prefix allowance from handleHttpError; PENDING_ROUTES now holds only /about, /press, /contact, /pbs-american-portrait/.

## Decisions Made
- Used a synchronous `load()` (the fork's async signature existed only for an upstream vitest 404-rejection test, which this repo has no harness for).
- Returned `slug` from `load()` so the page passes `active={data.slug}` directly to FilterPillBar.
- Mirrored the /work index grid classes and dark canvas wrapper for visual consistency rather than the fork's ReelStage.

## Deviations from Plan

None - plan executed exactly as written. (One cosmetic comment word "onselect" in the page comment was reworded so the acceptance grep `onselect == 0` reflects genuine link mode; no functional change.)

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All /work routes (index + 8 categories) are real and strictly prerendered; the prerender allow-list now only covers Phase-4 content pages (/about, /press, /contact, /pbs-american-portrait/).
- BRW-02 complete. Phase 3 browse surfaces are done; remaining Phase 3 watch work (if any) and Phase 4 content pages can proceed.

## Self-Check: PASSED

All created files present (+page.ts, +page.svelte, 03-03-SUMMARY.md); both task commits (ab1bc11, cb319b2) found in git history.

---
*Phase: 03-browse-and-watch*
*Completed: 2026-06-14*
