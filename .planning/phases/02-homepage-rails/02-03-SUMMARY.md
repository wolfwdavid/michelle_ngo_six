---
phase: 02-homepage-rails
plan: 03
subsystem: homepage
tags: [hero, carousel, crossfade, lcp, reduced-motion, accessibility]
requires:
  - src/lib/data (producerReelId, getById, Video)
  - src/lib/data/heroSlides (getHeroSlides, HERO_SLIDE_CAP)
  - src/lib/data/posters (getPosterFor)
  - src/lib/components/categoryAccent (categoryAccent)
  - src/lib/state/motion.svelte (motion.prefersReducedMotion)
provides:
  - src/lib/heroCarousel.svelte.ts (createHeroCarousel, HERO_CAROUSEL_INTERVAL_MS)
  - src/lib/components/HeroCarousel.svelte
affects:
  - Plan 02-04 (homepage assembly: drops <HeroCarousel /> at top of +page.svelte)
  - Phase 5 (any forward hero reuse of the rune factory / motion-ok gating pattern)
tech-stack:
  added: []
  patterns:
    - "Rune factory owns only activeSlide index + setInterval; per-tick isAutoAllowed() gate keeps it $effect-free"
    - "userPaused one-way latch: any manual nav (next/prev/goTo) disables auto-advance for the instance lifetime"
    - "Slide set = [getById(producerReelId)!, ...getHeroSlides()] — reel leads; getHeroSlides already excludes the reel so no dedup"
    - "Pause flag (hovered $state) fed into isAutoAllowed: () => !motion.prefersReducedMotion && !hovered"
    - "Crossfade gated by rune-bound class:motion-ok (NOT Tailwind motion-prefixed variant) + a .motion-ok-only opacity transition in <style>"
    - "Active poster rendered in its own {#if} branch carrying the literal loading=eager fetchpriority=high (one LCP image at a time); inactive branch lazy"
key-files:
  created:
    - src/lib/heroCarousel.svelte.ts
    - src/lib/components/HeroCarousel.svelte
  modified: []
decisions:
  - "Active poster is split into an {#if active}/{:else} two-branch <img> so the active image carries the LITERAL fetchpriority=\"high\"/loading=\"eager\" attributes (a conditional fetchpriority={...} never emits the literal LCP hint and bypasses the grep contract). Exactly one branch renders per slide → exactly one eager/high poster."
  - "Crossfade gating uses class:motion-ok={!motion.prefersReducedMotion} + a `.slide.motion-ok { transition: opacity 600ms }` rule. Under reduced motion the class is absent so swaps are instant. Deliberately NOT motion-safe: (which reads the media query directly and would bypass the locked single-source motion rune)."
  - "This variant is poster-only (no autoplaying embed) — diverges from _three's HeroAmbient ambient reel by CONTEXT lock for LCP protection. All iframe/PreviewLoop/defer/IntersectionObserver/network logic stripped."
  - "Dots are neutral (--color-neutral-500 rest, --color-neutral-50 active pill) — never accent-colored, per UI-SPEC wayfinding."
metrics:
  duration: ~5m
  completed: 2026-06-14
---

# Phase 2 Plan 02-03: Hero Carousel Summary

A rotating-featured, LCP-safe hero: poster + uppercase category eyebrow + title slides, each a single `<a>` to that video's `/watch/{id}`. Slide 0 is the producer reel; slides 1..N are one representative non-reel video per category (`getHeroSlides()`, capped at 6). Slides auto-advance every 7000ms with a 600ms opacity crossfade, neutral position dots jump to any slide, auto-advance pauses while the pointer/focus is inside the hero, and under `prefers-reduced-motion` the hero shows slide 0 statically with instant (transition-free) dot navigation. No autoplaying embed, no 3D surface, no media-query API call.

## Drop-in for Plan 04

```svelte
<HeroCarousel />
```

No props — the component self-sources its slide set. Plan 04 places it full-bleed at the top of `+page.svelte`, above the contained rail stack (48px gap to the first rail per UI-SPEC).

## Slide Set Construction

```ts
const reel = getById(producerReelId);          // throws if missing (data guard)
const slides = [reel, ...getHeroSlides()];     // reel leads; getHeroSlides excludes the reel
const slideCount = slides.length;              // 1 + (≤ HERO_SLIDE_CAP)
```

`getHeroSlides()` already excludes `producerReelId` (and the entire `Reel` category), so prepending the reel needs no dedup. The `{#if slideCount > 0}` guard is defensive only — slide 0 is always the reel, so the empty case is effectively unreachable.

## Pause-Flag Wiring (for Plan 04 + Phase 5)

The component owns a `hovered = $state(false)` flag toggled by the section's `onpointerenter/onpointerleave/onfocusin/onfocusout`. It feeds the factory's per-tick gate:

```ts
const carousel = createHeroCarousel({
  slideCount,
  isAutoAllowed: () => !motion.prefersReducedMotion && !hovered,
});
$effect(() => { carousel.startAuto(); return () => carousel.dispose(); });
```

The factory's `setInterval` re-reads `isAutoAllowed()` every tick, so auto-advance halts the moment the pointer/focus enters and resumes on leave — unless the visitor clicked a dot, which latches `userPaused` permanently (manual control wins for the instance lifetime).

## Crossfade Gating Mechanism (the `motion-ok` pattern)

Reduced motion is gated by the single-source `motion` rune on BOTH paths:

1. **Auto-advance** — `isAutoAllowed()` returns false when `motion.prefersReducedMotion`, so the timer never advances.
2. **Crossfade** — each slide layer carries `class:motion-ok={!motion.prefersReducedMotion}`; the opacity transition lives in a `.slide.motion-ok { transition: opacity 600ms var(--ease-cinematic) }` rule. When the rune flips to reduced-motion the class drops and dot swaps are instant (no transition).

This is the locked alternative to Tailwind's `motion-safe:` variant — that variant reads `prefers-reduced-motion` directly via the media query and would bypass the single-source rune. The component contains no `matchMedia`, no `motion-safe:`, no embed, and no 3D surface.

## LCP Protection

The active slide's poster is rendered in its own `{#if i === carousel.activeSlide}` branch carrying the literal `loading="eager" fetchpriority="high"`; every other slide renders the `{:else}` branch with `loading="lazy"`. Because exactly one branch renders per slide, exactly one poster is ever eager/high at a time — the LCP element.

## Deviations from Plan

None — plan executed as written. The two-branch active-poster split (rather than a single `<img>` with conditional attributes) is a faithful implementation of the plan's "exactly ONE poster may be eager/high at a time" + the `grep -c 'fetchpriority="high"'` >= 1 acceptance contract; documented above as a decision.

## Verification

- `pnpm check` → 0 errors, 0 warnings (368 files).
- `pnpm build` → exits 0; prerender succeeds; static site written to `build/`.
- Task 1 greps: `HERO_CAROUSEL_INTERVAL_MS = 7000`, `createHeroCarousel`, `isAutoAllowed`, `typeof window === 'undefined'` all present; 0 AI-assistant refs; no `*.test.ts` created.
- Task 2 greps: `fetchpriority="high"`=3 occurrences (>=1), `loading="lazy"` present, `getHeroSlides`/`producerReelId`/`createHeroCarousel`/`startAuto`/`activeSlide` present, `Go to slide`/`aria-current` dots present, `categoryAccent(`/`0.08em` eyebrow present, `watch/`/`Watch ` links present, `motion.prefersReducedMotion`/`motion-ok` present, scrim `oklch(0.16 0 0 / 0.92)` present; `motion-safe:`=0, `matchMedia`=0, `iframe`=0, `canvas`=0; 0 AI-assistant refs; 251 lines (>= 90).

## Self-Check: PASSED

All created files verified on disk (heroCarousel.svelte.ts, HeroCarousel.svelte, 02-03-SUMMARY.md); both task commits (9b9bb4e, 330e7ce) verified in git log.
