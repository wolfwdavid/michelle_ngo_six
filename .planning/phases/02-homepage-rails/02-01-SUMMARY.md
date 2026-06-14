---
phase: 02-homepage-rails
plan: 01
subsystem: ui
tags: [svelte5, tailwind-v4, motion, css-tilt, reduced-motion, oklch]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "OKLCH design tokens in app.css, categoryAccent map, motion.svelte rune, data layer (Video type, getPosterFor)"
provides:
  - "src/app.css motion/layout tokens: --ease-cinematic, --content-max, --page-gutter (16px -> 24px @640px)"
  - "Global prefers-reduced-motion CSS backstop"
  - "VideoCard.svelte: cinematic /watch/{id} link card with cursor-tilt, accent ring, lift shadow, title fade-up; props { video, eager }"
affects: [02-02-category-rail, 02-03-hero-carousel, 02-04-homepage-assembly-and-watch-stub]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reduced-motion gating via a rune-bound `class:motion-ok={!motion.prefersReducedMotion}` instead of Tailwind media-query motion variants — single source of truth is the motion rune"
    - "CSS custom props --tilt-x/--tilt-y set from a pointermove handler; CSS reads them in a transform under .motion-ok"
    - "Category accent applied via literal class from categoryAccentRing() so the Tailwind scanner generates ring-cat-*/40"

key-files:
  created:
    - src/lib/components/VideoCard.svelte
  modified:
    - src/app.css

key-decisions:
  - "Tilt math: pointer offset normalized to 0..1 from card rect, mapped to (offset-0.5)*2*6 and clamped to ±6deg; rotateX uses (0.5 - py) so the top edge tilts toward the cursor"
  - "Reduced-motion mechanism is the motion-ok class (rune-bound), NOT motion-safe: — the scale/tilt transform rule is scoped under .video-card.motion-ok:hover/:focus-visible so it never applies under reduced motion"
  - "Ring is revealed only on hover/focus via literal hover:ring-2 focus-visible:ring-2 utilities combined with the mapped ring-cat-*/40 color"

patterns-established:
  - "Pattern: motion-rune-gated CSS via class:motion-ok — reusable for hero carousel and rail chevrons in Plans 02-03/02-02"
  - "Pattern: VideoCard prop contract { video: Video; eager?: boolean } — rails pass eager for above-the-fold cards"

requirements-completed: [HOME-03]

# Metrics
duration: 5min
completed: 2026-06-14
---

# Phase 2 Plan 01: Tokens and VideoCard Summary

**Cinematic VideoCard primitive — a real /watch/{id} link with CSS-only cursor-tilt (clamped ±6deg), category-accent ring, lift shadow, and title fade-up, all gated on the single `motion.prefersReducedMotion` rune — plus the app.css motion/layout tokens it consumes.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-14T19:41:45Z
- **Completed:** 2026-06-14T19:46:44Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- Added `--ease-cinematic`, `--content-max`, `--page-gutter` (with the 640px override) to the app.css `@theme`/`:root`, plus a global `prefers-reduced-motion` backstop, leaving the existing `:focus-visible` double-ring rule untouched.
- Built `VideoCard.svelte`: 16/9 rounded poster, `m:ss` duration badge, 2-line title, real `<a>` to `${base}/watch/${video.id}` with `aria-label="Watch {title}"`.
- Cursor-tilt writes `--tilt-x`/`--tilt-y` custom props from a pointermove handler that early-returns under reduced motion; hover/focus applies `scale(1.03)` + lift shadow + accent ring + brighten + title fade-up.
- Reduced-motion branch (driven solely by the motion rune via the `motion-ok` class) drops tilt and scale, leaving only brighten + ring + shadow + instant title color.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add motion tokens + reduced-motion backstop to app.css** - `344bfdd` (feat)
2. **Task 2: Build VideoCard.svelte with cursor-tilt + reduced-motion branch** - `c88f2e6` (feat)

## Files Created/Modified
- `src/app.css` - Added `--ease-cinematic`, `--content-max`, `--page-gutter` (+ 640px override) and the global reduced-motion backstop.
- `src/lib/components/VideoCard.svelte` - Cinematic poster card; `<a href>` to `/watch/{id}`; cursor-tilt; rune-gated reduced-motion branch.

## Decisions Made
- **Tilt math:** normalize pointer to 0..1 within the card rect, map to `(p-0.5)*2*6`, clamp to ±6deg. `rotateY` from horizontal offset, `rotateX` from `(0.5 - py)` so the top tilts toward the cursor. Tilt vars stay `0deg` under reduced motion because the handler early-returns.
- **Reduced-motion mechanism:** the `motion-ok` class (bound to `!motion.prefersReducedMotion`). The `scale(1.03)`/tilt transform lives only under `.video-card.motion-ok:hover, .video-card.motion-ok:focus-visible`, so reduced-motion users never tilt or scale. Chose this over `motion-safe:` per UI-SPEC/CONTEXT lock (single motion source of truth).
- **Ring reveal:** `ring-cat-*/40` color (from `categoryAccentRing`) combined with literal `hover:ring-2 focus-visible:ring-2` and `ring-offset-2 ring-offset-neutral-950` so the accent ring appears only on hover/focus. Confirmed `ring-cat-pbs/40`, `ring-2`, and `ring-offset-2` are generated in the built CSS.

## VideoCard Prop Contract (for Plan 02 to consume)
```ts
{ video: Video; eager?: boolean }  // eager defaults to false; rails pass eager=true for the first above-the-fold cards
```
- Renders an `<a>` to `${base}/watch/${video.id}` (preload-on-hover).
- Duration badge renders only when `video.duration_seconds` is present.
- Accent ring color comes from `categoryAccentRing(video.category)`; the rail track should set `perspective` if it wants deeper tilt (the card already applies `perspective(800px)` on its own transform).

## Deviations from Plan
None - plan executed exactly as written.

(Minor implementation note, not a deviation: explanatory `matchMedia`/`motion-safe:` mentions were kept out of the component's comments so the grep acceptance assertions — which forbid those substrings anywhere in the file — pass. The rune-only mechanism is documented in the header comment without using those literal strings.)

## Issues Encountered
None. `pnpm check` reports 0 errors / 0 warnings; `pnpm build` exits 0 and prerender succeeds.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- VideoCard is a finished, accessible, /watch-linked leaf primitive ready for Plan 02-02 (category rail) to render in a scroll-snap track and Plan 02-04 (homepage assembly + watch stub) to wire the `/watch/[id]` route those links target.
- No `/watch/[id]` route exists yet — links currently resolve at build (prerender green) but a stub route lands in Plan 02-04 per the UI-SPEC acceptance criteria.

---
*Phase: 02-homepage-rails*
*Completed: 2026-06-14*

## Self-Check: PASSED
- FOUND: src/app.css
- FOUND: src/lib/components/VideoCard.svelte
- FOUND: .planning/phases/02-homepage-rails/02-01-SUMMARY.md
- FOUND commit: 344bfdd (Task 1)
- FOUND commit: c88f2e6 (Task 2)
