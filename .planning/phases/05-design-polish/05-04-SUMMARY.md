---
phase: 05-design-polish
plan: 04
subsystem: ui
tags: [svelte5, svelte-action, intersection-observer, motion, css-transform, ken-burns, accessibility]

# Dependency graph
requires:
  - phase: 05-01
    provides: --ease-cinematic + section-rhythm tokens used by the reveal transition
  - phase: 05-03
    provides: token-clean contact/press surfaces (reveal added without re-touching their scrim/wordmark)
provides:
  - Reusable rune-gated `reveal` IntersectionObserver Svelte action ($lib/actions/reveal.svelte.ts)
  - Staggered scroll reveals on homepage rails, watch metadata/related, and press sections
  - Hero Ken-Burns scale on the active poster (transform-only, LCP-safe)
  - 150ms color transition on FilterPillBar chips
affects: [future motion work, any new scroll-revealed surface]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rune-gated Svelte action: import the motion rune, early-return (set opacity:1) under reduced motion or SSR before touching any browser API"
    - "Ken-Burns via @keyframes on the active poster img, gated by the existing .motion-ok class — transform only, never opacity/visibility"

key-files:
  created:
    - src/lib/actions/reveal.svelte.ts
  modified:
    - src/routes/+page.svelte
    - src/routes/watch/[id]/+page.svelte
    - src/routes/press/+page.svelte
    - src/lib/components/HeroCarousel.svelte
    - src/lib/components/FilterPillBar.svelte

key-decisions:
  - "reveal feature-checks BOTH window and IntersectionObserver before observing, so prerender (which has neither) and reduced-motion both end fully opaque — content is never stuck at opacity 0"
  - "Homepage rails are wrapped in a <div use:reveal> since Svelte actions attach to DOM nodes, not components; stagger via delay = i*60"
  - "Ken-Burns animates the active slide's <img> transform only; the eager LCP poster keeps loading=eager/fetchpriority=high and is opacity:1 at first paint"
  - "FilterPillBar transition uses a scoped .chip rule (compiled to .chip.svelte-xxxx) rather than a Tailwind class, keeping the 150ms timing in one place and covered by the global reduced-motion backstop"
  - "Did NOT apply reveal to the /contact splash (single eager LCP poster) — tasks scoped reveal to rails/watch/press only; contact stays static and LCP-safe"

patterns-established:
  - "Single motion source preserved: every effect gated on motion.prefersReducedMotion / class:motion-ok; no motion-safe: or matchMedia anywhere"

requirements-completed: [DSN-02]

# Metrics
duration: 30min
completed: 2026-06-15
---

# Phase 5 Plan 04: Cinematic Motion Summary

**A reusable rune-gated IntersectionObserver `reveal` action driving staggered scroll entrances on rails/watch/press, plus a transform-only hero Ken-Burns and a 150ms FilterPillBar color transition — all no-ops under reduced motion and SSR, with the eager LCP hero poster untouched.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-06-15T14:59Z (approx)
- **Completed:** 2026-06-15T15:27Z
- **Tasks:** 2 auto tasks complete; 1 human-verify checkpoint deferred (see below)
- **Files modified:** 6 (1 created, 5 modified)

## Accomplishments

- New `src/lib/actions/reveal.svelte.ts`: a single shared IntersectionObserver Svelte action that fades + slides sections in on first scroll-in (opacity 0→1, translateY 12px→none, 500ms `--ease-cinematic`, optional stagger `delay`). Under reduced motion OR SSR/prerender (no `window`/`IntersectionObserver`) it is a pure no-op that sets `opacity:1` — content is never left hidden.
- Applied `use:reveal` to: homepage category rails (staggered `delay: i*60`), the `/watch/[id]` title/meta block and related `<section>` (`delay: 80`), and each `/press` article composition block (never the eager poster img).
- Hero Ken-Burns: `@keyframes ken-burns` `scale(1)→scale(1.06)` over 7s on the active slide's poster `<img>`, gated by the existing `.slide.motion-ok.is-active` selector. Transform only — the poster keeps `loading="eager"`/`fetchpriority="high"` and stays `opacity:1` at first paint. Reduced motion = static at scale 1.
- FilterPillBar chips gained a scoped 150ms `background-color, color, border-color` transition so active-pill swaps animate; the global reduced-motion backstop neutralizes it automatically.

## Task Commits

1. **Task 1: reveal action + apply to rails/watch/press** - `90c05d0` (feat)
2. **Task 2: hero Ken-Burns + FilterPillBar transition** - `2d08331` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified

- `src/lib/actions/reveal.svelte.ts` - new rune-gated IntersectionObserver reveal action (created)
- `src/routes/+page.svelte` - rails wrapped in `<div use:reveal={{ delay: i*60 }}>`
- `src/routes/watch/[id]/+page.svelte` - reveal on title/meta block and related section
- `src/routes/press/+page.svelte` - reveal on each article composition block
- `src/lib/components/HeroCarousel.svelte` - Ken-Burns keyframe on the active poster, motion-ok gated
- `src/lib/components/FilterPillBar.svelte` - scoped 150ms chip color transition

## Decisions Made

- reveal feature-checks both `window` and `IntersectionObserver` before observing → prerender and reduced-motion both finish fully opaque (never stuck hidden).
- Homepage rails wrapped in a `<div use:reveal>` because Svelte actions attach to DOM nodes, not the `<CategoryRail>` component.
- Ken-Burns animates the active `<img>` transform only; the eager LCP poster's loading/priority attributes are unchanged.
- FilterPillBar uses a scoped `.chip` style rule (compiled to `.chip.svelte-xxxx`) so the chip element — which already carries the component scope hash — matches the transition without leaking globally.
- `/contact` (single eager LCP splash poster) was intentionally left without reveal; the tasks scoped reveal to rails/watch/press. `files_modified` frontmatter listed contact aspirationally but applying reveal there would put an opacity:0 start on the LCP poster.

## Deviations from Plan

**1. [Rule 1 - Bug] reveal callback null-guard for strict TypeScript**
- **Found during:** Task 1 (`pnpm check`)
- **Issue:** Destructured `([entry]) => entry.isIntersecting` failed svelte-check under strict noUncheckedIndexedAccess ("'entry' is possibly 'undefined'").
- **Fix:** Changed to optional chaining `entry?.isIntersecting`.
- **Files modified:** src/lib/actions/reveal.svelte.ts
- **Verification:** `pnpm check` 0 errors.
- **Committed in:** `90c05d0` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial correctness fix; no scope creep.

## Issues Encountered

None beyond the strict-mode null-guard above.

## Verification

Automated (all passing):
- `pnpm check` → 0 errors / 0 warnings (391 files)
- `pnpm build` → exit 0, static site written, strict prerender green (no route changes)
- `test -f src/lib/actions/reveal.svelte.ts` + `grep motion.prefersReducedMotion` → match
- `grep IntersectionObserver` in action → match
- `grep use:reveal` in +page / watch / press → match (none on any eager `<img>`)
- `grep scale(1.06)` + `motion-ok` in HeroCarousel → match
- `grep "transition: background-color 150ms"` in FilterPillBar → match
- No `motion-safe:` / `matchMedia` in any touched file → confirmed absent (single motion source preserved)

## Deferred Verification (human-verify checkpoint — not blocking)

The plan's Task 3 is a `checkpoint:human-verify`. Implementation and structural verification are complete; the following manual steps are deferred for a human to confirm in `pnpm dev`:

1. Homepage scroll-down: rails fade/slide in (staggered) as they enter view; hero poster slowly drifts/scales.
2. `/watch/[id]` and `/press`: metadata/related and press sections reveal on scroll-in.
3. Enable OS/DevTools `prefers-reduced-motion: reduce` and reload: nothing hidden — all content immediately visible, no reveal animation, hero poster static.
4. Confirm the hero poster is visible at first paint (it is the LCP image); optionally confirm via Lighthouse that the LCP element is the hero poster.

## Known Stubs

None — no placeholder data or unwired components introduced.

## Next Phase Readiness

- DSN-02 (tasteful scroll reveals + hero Ken-Burns + pill transition via CSS transforms, no WebGL) delivered.
- `reveal` is reusable for any future scroll-revealed surface; remaining UI-REVIEW P2 items 11 (scroll-cue bounce / press first-panel cue, F5.3/F6.5) and contact/press poster parallax (F5.2) are still open backlog if pursued.

## Self-Check: PASSED

All 7 created/modified files present on disk; both task commits (`90c05d0`, `2d08331`) found in git history.

---
*Phase: 05-design-polish*
*Completed: 2026-06-15*
