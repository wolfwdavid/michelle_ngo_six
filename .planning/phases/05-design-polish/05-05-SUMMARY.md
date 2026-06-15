---
phase: 05-design-polish
plan: 05
subsystem: infra
tags: [hygiene, comments, codebase-cleanup, svelte, sveltekit]

# Dependency graph
requires:
  - phase: 05-design-polish
    provides: "Final state of every src/ file after Plans 05-01..05-04 churn"
provides:
  - "src/ comments free of leaked planning/sibling annotations (_three, _four, D-NN, Phase N, PLAN.md)"
  - "src/ free of AI-assistant / discretion phrasing"
  - "Ship-clean codebase with no internal scaffolding visible in shipped source"
affects: [release, deploy]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Comments-only scrub verified by grep gates + pnpm check + pnpm build"]

key-files:
  created:
    - .planning/phases/05-design-polish/05-05-SUMMARY.md
  modified:
    - src/app.css
    - src/routes/+layout.svelte
    - src/routes/+page.svelte
    - src/routes/sitemap.xml/+server.ts
    - src/routes/watch/[id]/+page.ts
    - src/lib/components/TopNav.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/ContactBlock.svelte
    - src/lib/components/MobileMenu.svelte
    - src/lib/components/CategoryRail.svelte
    - src/lib/components/HeroCarousel.svelte
    - src/lib/components/VideoCard.svelte
    - src/lib/components/categoryAccent.ts
    - src/lib/data/categories.ts
    - src/lib/data/schema.ts
    - src/lib/data/videos.ts
    - src/lib/data/heroSlides.ts
    - src/lib/data/posters.ts
    - src/lib/data/index.ts
    - src/lib/heroCarousel.svelte.ts
    - src/lib/storage.ts
    - src/lib/state/menu.svelte.ts
    - src/lib/state/motion.svelte.ts
    - src/lib/state/network.svelte.ts
    - src/lib/state/scrollIdle.svelte.ts
    - src/lib/state/visibility.svelte.ts

key-decisions:
  - "Rephrased the FND-04 requirement id in +layout.svelte because the gate pattern D-[0-9]{2} matches the D-04 substring inside it; meaning preserved as 'App shell layout.'"
  - "Preserved genuinely useful intent in neutral prose rather than deleting comments wholesale"

patterns-established:
  - "Comments-only scrub: edit comment prose, never code tokens; verify byte-equivalent behaviour via build"

requirements-completed: [DSN-01, DSN-02, DSN-03, DSN-04]

# Metrics
duration: 14min
completed: 2026-06-15
---

# Phase 5 Plan 5: Annotation Scrub Summary

**Removed every leaked planning/sibling-repo annotation (_three, _four, D-NN decision ids, Phase N, PLAN.md, and a stray `quick` id) from src/ comments across 26 files — comments-only, behaviour byte-equivalent, build green.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-06-15T16:23Z
- **Completed:** 2026-06-15T16:37Z
- **Tasks:** 2
- **Files modified:** 26

## Accomplishments
- Scrubbed sibling-repo references (`_three`, `_four`, `../michelle_ngo_four/...`), locked-decision ids (`D-NN`), phase labels (`Phase N`), plan filenames/ids (`PLAN.md`, `Plan NN-NN`, `quick NNNNNN`) from all flagged `src/` comments.
- Confirmed zero AI-assistant / `discretion` phrasing remains in `src/`.
- Verified byte-equivalent behaviour: `pnpm check` clean (0 errors, 0 warnings) and `pnpm build` exits 0 with strict prerender intact.

## Task Commits

Each task was committed atomically:

1. **Task 1: Scrub component + route files (src/app.css, src/routes/**, src/lib/components/**)** - `a547f23` (refactor)
2. **Task 2: Scrub data/state/util files + final full-tree sweep** - `a4f28f8` (refactor)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/app.css` - Neutralized design-system token-block comments (decision ids, phase labels, sibling `_four` path note).
- `src/routes/+layout.svelte` - Dropped `FND-04` (matched the `D-04` gate substring); now "App shell layout."
- `src/routes/+page.svelte`, `src/routes/sitemap.xml/+server.ts`, `src/routes/watch/[id]/+page.ts` - Removed phase/plan references; kept behavioural notes.
- `src/lib/components/TopNav.svelte`, `Footer.svelte`, `ContactBlock.svelte`, `MobileMenu.svelte`, `CategoryRail.svelte`, `HeroCarousel.svelte`, `VideoCard.svelte`, `categoryAccent.ts` - Removed sibling-repo mirror notes and decision/phase/plan ids from header and inline comments.
- `src/lib/data/{categories,schema,videos,heroSlides,posters,index}.ts` - Decision-id and phase references in JSDoc converted to neutral "Conventions:" prose; removed a `quick 260611-jnh` id.
- `src/lib/heroCarousel.svelte.ts`, `src/lib/storage.ts`, `src/lib/state/{menu,motion,network,scrollIdle,visibility}.svelte.ts` - Neutralized rune/helper doc comments; kept `__resetForTests`/`__set*ForTests` helpers and all code intact.

## Decisions Made
- The gate pattern `D-[0-9]{2}` matches the `D-04` substring inside the legitimate requirement id `FND-04` in `+layout.svelte`. To satisfy the gate while preserving meaning, the line was reworded to "App shell layout." (no other prefixed requirement ids appeared in `src/`).
- Comments were rewritten in neutral language preserving intent rather than deleted wholesale, except where the annotation carried no residual value.

## Deviations from Plan

None - plan executed exactly as written. The `quick 260611-jnh` planning id in `heroSlides.ts` (called out in the environment notes) was removed as part of the comments-only scrub.

## Issues Encountered
- One TopNav.svelte edit initially failed string-match due to a Unicode apostrophe in "/press's"; resolved by matching a shorter unique substring.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Codebase is ship-clean: zero leaked planning/sibling annotations and zero AI-assistant phrasing in `src/`.
- Build green with strict prerender; no route changes; `/pbs-american-portrait/` remains in PENDING_ROUTES.
- Phase 05 ready for verification.

## Self-Check: PASSED
- `src/` leaked-annotation grep: 0 matches (exit 1 on grep = negation passes)
- `src/` AI/discretion grep: 0 matches
- `pnpm check`: 0 errors, 0 warnings
- `pnpm build`: exit 0, strict prerender intact
- Commits `a547f23` and `a4f28f8` exist in history

---
*Phase: 05-design-polish*
*Completed: 2026-06-15*
