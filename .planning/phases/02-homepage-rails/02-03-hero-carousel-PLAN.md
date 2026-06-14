---
phase: 02-homepage-rails
plan: 03
type: execute
wave: 2
depends_on: ["02-01"]
files_modified:
  - src/lib/heroCarousel.svelte.ts
  - src/lib/heroCarousel.svelte.test.ts
  - src/lib/components/HeroCarousel.svelte
  - src/lib/components/HeroCarousel.svelte.test.ts
autonomous: true
requirements: [HOME-01, HOME-05]
must_haves:
  truths:
    - "The hero shows a featured slide (poster + category eyebrow + title) starting with the producer reel, as a link to that video's /watch/{id}."
    - "Slides auto-advance every 7000ms with a 600ms crossfade; position dots let a visitor jump to any slide."
    - "Auto-advance pauses while the pointer/focus is inside the hero and resumes on leave."
    - "Only the active slide's poster is eager + fetchpriority=high; all other posters are lazy."
    - "With prefers-reduced-motion, there is no auto-advance and no crossfade — slide 0 shows statically and the dots still navigate."
  artifacts:
    - path: "src/lib/components/HeroCarousel.svelte"
      provides: "Rotating featured hero carousel (poster+title), dots, pause-on-hover, reduced-motion static"
      min_lines: 90
      contains: "fetchpriority=\"high\""
    - path: "src/lib/heroCarousel.svelte.ts"
      provides: "Auto-advance rune factory (7000ms, userPaused latch, isAutoAllowed gate)"
      contains: "HERO_CAROUSEL_INTERVAL_MS = 7000"
  key_links:
    - from: "src/lib/components/HeroCarousel.svelte"
      to: "getHeroSlides()"
      via: "import from $lib/data/heroSlides"
      pattern: "getHeroSlides"
    - from: "src/lib/components/HeroCarousel.svelte"
      to: "motion.prefersReducedMotion"
      via: "import from $lib/state/motion.svelte (gates auto-advance + crossfade)"
      pattern: "motion\\.prefersReducedMotion"
    - from: "src/lib/components/HeroCarousel.svelte"
      to: "createHeroCarousel"
      via: "import from $lib/heroCarousel.svelte"
      pattern: "createHeroCarousel"
---

<objective>
Build the rotating featured hero carousel: poster + category eyebrow + title slides sourced from `getHeroSlides()` (producer reel leads), 7000ms auto-advance with 600ms crossfade, clickable position dots, pause-on-hover/focus, and a fully static reduced-motion variant. NO autoplaying iframe (poster-only — LCP protection). Each slide links to `/watch/{id}`.

Purpose: HOME-01 (cinematic featured hero) + the hero half of HOME-05 (reduced-motion). This variant deliberately differs from `_three`'s ambient autoplay reel.
Output: ported `heroCarousel.svelte.ts` factory + tests; `HeroCarousel.svelte` + behavior test.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-homepage-rails/02-CONTEXT.md
@.planning/phases/02-homepage-rails/02-UI-SPEC.md

<interfaces>
From src/lib/data/heroSlides.ts (already in this repo):
```typescript
export const HERO_SLIDE_CAP = 6;
export function getHeroSlides(): readonly Video[]; // ≤6 representative non-reel videos, display order
```
From src/lib/data/index.ts:
```typescript
export const producerReelId = '264677021';
export function getById(id: string): Video | undefined;
```
From src/lib/data/posters.ts: `export function getPosterFor(video): string;`
From src/lib/components/categoryAccent.ts: `export function categoryAccent(category): string; // 'text-cat-pbs' literal`
From src/lib/state/motion.svelte.ts: `export const motion: { readonly prefersReducedMotion: boolean }; __setPrefersReducedMotionForTests(v); __resetMotionStateForTests();`
`import { base } from '$app/paths';`

NOTE — slide set for THIS variant: slide 0 = the producer reel video (`getById(producerReelId)`), slides 1..N = `getHeroSlides()`. So `slides = [getById(producerReelId)!, ...getHeroSlides()]`; `slideCount = slides.length`. (getHeroSlides already EXCLUDES the reel, so no dedup needed.)
</interfaces>

<reference>
<!-- PORT the factory verbatim (it is self-contained, already correct). ADAPT the carousel/dots/crossfade -->
<!-- markup from HeroAmbient.svelte but STRIP all iframe/PreviewLoop/defer/network logic — this variant is -->
<!-- poster-only. The dots block + crossfade-via-opacity pattern in HeroAmbient is the template. -->
@../michelle_ngo_three/src/lib/heroCarousel.svelte.ts
@../michelle_ngo_three/src/lib/heroCarousel.svelte.test.ts
@../michelle_ngo_three/src/lib/components/HeroAmbient.svelte
</reference>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port the heroCarousel rune factory + its test</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/heroCarousel.svelte.ts (the factory to port verbatim: HERO_CAROUSEL_INTERVAL_MS=7000, activeSlide, next/prev/goTo latch userPaused, startAuto per-tick isAutoAllowed gate, SSR no-op, idempotent dispose)
    - ../michelle_ngo_three/src/lib/heroCarousel.svelte.test.ts (port the test alongside; adjust import paths only)
    - src/lib/ (confirm there is no existing heroCarousel.svelte.ts in this repo before creating)
  </read_first>
  <action>
    Copy `../michelle_ngo_three/src/lib/heroCarousel.svelte.ts` to `src/lib/heroCarousel.svelte.ts` VERBATIM (it is self-contained — no imports to rewire). It already exports `HERO_CAROUSEL_INTERVAL_MS = 7000`, the `HeroCarousel` type, and `createHeroCarousel({ slideCount, intervalMs?, isAutoAllowed })` with the userPaused one-way latch, per-tick `isAutoAllowed()` gate, `typeof window === 'undefined'` SSR no-op, and idempotent `startAuto`/`dispose`.

    Scrub any forward-phase / iframe-specific comment references that don't apply to this poster-only variant ONLY if they mention components not in this repo; keep the behavioral comments. Do NOT mention AI assistants anywhere.

    Copy the matching test to `src/lib/heroCarousel.svelte.test.ts`, fixing only the import path (`./heroCarousel.svelte`). Confirm it exercises: 7000ms interval, manual nav latches userPaused, isAutoAllowed=false blocks ticks, dispose stops the timer.
  </action>
  <acceptance_criteria>
    - `grep -F "HERO_CAROUSEL_INTERVAL_MS = 7000" src/lib/heroCarousel.svelte.ts` matches.
    - `grep -F "createHeroCarousel" src/lib/heroCarousel.svelte.ts` matches AND `grep -F "isAutoAllowed" src/lib/heroCarousel.svelte.ts` matches.
    - `grep -F "typeof window === 'undefined'" src/lib/heroCarousel.svelte.ts` matches (SSR no-op).
    - `grep -ci "claude\|gemini\|copilot\|ai assistant" src/lib/heroCarousel.svelte.ts` returns 0.
    - `pnpm test -- src/lib/heroCarousel.svelte.test.ts` passes.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm test -- src/lib/heroCarousel.svelte.test.ts</automated>
  </verify>
  <done>The 7000ms auto-advance factory with userPaused latch + per-tick gate + SSR no-op is in this repo and its ported test is green.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build HeroCarousel.svelte (poster+title slides, dots, crossfade, pause, reduced-motion) + test</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/HeroAmbient.svelte (crossfade-via-opacity slide stack + dots-row markup to ADAPT; STRIP all iframe/PreviewLoop/defer/network/IntersectionObserver code — this variant is poster-only)
    - src/lib/heroCarousel.svelte.ts (the factory from Task 1: createHeroCarousel, activeSlide, goTo, startAuto, dispose)
    - src/lib/data/heroSlides.ts (getHeroSlides + HERO_SLIDE_CAP) and src/lib/data/index.ts (producerReelId, getById)
    - src/lib/state/motion.svelte.ts (the gate + test hooks)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Hero Carousel Spec (lines ~133-153) + § Copywriting (dot label) + breakpoint hero-height table — EXACT values
  </read_first>
  <behavior>
    - Renders `slideCount` slides; slide 0 is the producer reel; each slide is an `<a href>` ending `/watch/{id}` with accessible name `Watch {title}`.
    - The active slide's poster `<img>` has `loading="eager"` and `fetchpriority="high"`; every other poster has `loading="lazy"` (and no fetchpriority high).
    - Renders one dot `<button>` per slide with `aria-label="Go to slide {n}: {title}"` and `aria-current="true"` on the active dot; clicking a dot calls `carousel.goTo(i)`.
    - With `__setPrefersReducedMotionForTests(true)`: no `setInterval` advance occurs (isAutoAllowed returns false) and dots still change the active slide.
    - `pointerenter`/`focusin` within the hero pause auto-advance; `pointerleave`/`focusout` resume (a `paused` flag feeds `isAutoAllowed`).
  </behavior>
  <action>
    Create `src/lib/components/HeroCarousel.svelte`. No props needed (self-sourcing). Script:
    - `const reel = getById(producerReelId);` throw if missing (mirror HeroAmbient's guard). `const slides = [reel, ...getHeroSlides()];` `const slideCount = slides.length;`
    - `let hovered = $state(false);` (pause flag). `const carousel = createHeroCarousel({ slideCount, isAutoAllowed: () => !motion.prefersReducedMotion && !hovered });`
    - `$effect(() => { carousel.startAuto(); return () => carousel.dispose(); });`
    - `const dotLabels = slides.map(s => s.title);`

    Markup per UI-SPEC § Hero Carousel Spec (EXACT):
    - `<section aria-label="Featured work" class="hero" onpointerenter={() => hovered = true} onpointerleave={() => hovered = false} onfocusin={() => hovered = true} onfocusout={() => hovered = false}>` — full-bleed (edge-to-edge, NO page gutter), `position: relative; overflow: hidden;` height per breakpoint table: mobile `56vh` (min 360px), tablet `60vh`, desktop `clamp(440px, 64vh, 640px)`.
    - Slide stack: one absolutely-positioned layer per slide, crossfaded by `opacity` over 600ms `var(--ease-cinematic)` (use `motion-safe:transition-opacity motion-safe:duration-700`-style gating OR a class bound to `!motion.prefersReducedMotion` so reduced-motion swaps are instant). Inactive layers `opacity-0 pointer-events-none`. NO translate/slide. (Optional Ken-Burns scale(1.04->1) is OUT for v1 unless trivial — skip to protect LCP.)
    - Per slide:
      - Poster `<img src={`${base}${getPosterFor(slide)}`} alt={slide.title} class="absolute inset-0 h-full w-full object-cover" object-position center, with `loading={i === carousel.activeSlide ? 'eager' : 'lazy'}` and `fetchpriority={i === carousel.activeSlide ? 'high' : undefined}`. IMPORTANT: exactly ONE poster may be eager/high at a time.
      - Bottom scrim: a `pointer-events-none absolute inset-0` div with `background: linear-gradient(to top, oklch(0.16 0 0 / 0.92) 0%, oklch(0.16 0 0 / 0.55) 28%, transparent 60%);`
      - Content `<a href={`${base}/watch/${slide.id}`} aria-label={`Watch ${slide.title}`}>` bottom-left aligned, overlay padding 32px desktop / 24px mobile:
        - Eyebrow `<span>` = `slide.category` UPPERCASE, `letter-spacing: 0.08em`, 14px Inter 400, colored via `categoryAccent(slide.category)` (literal class).
        - Title `<h2>` (NOT h1 — the page reserves h1) `font-display` `clamp(28px,5vw,48px)` weight 700, `text-neutral-50`, line-height 1.1, `line-clamp-2`.
      - The whole active slide link is the click target; inactive slide links get `pointer-events-none`.
    - Dots row: bottom-center, gap 4px. One `<button type="button">` per slide, 44px hit-area (`h-11 w-11 flex items-center justify-center`), inner glyph rest = 8px circle `bg-neutral-500`, active = 24px-wide pill `bg-neutral-50` (NEUTRAL — never accent). `aria-label={`Go to slide ${i+1}: ${slides[i].title}`}`, `aria-current={carousel.activeSlide === i ? 'true' : undefined}`, `onclick={() => carousel.goTo(i)}`. Left/Right arrow on a focused dot moves to prev/next dot and selects it (optional enhancement per UI-SPEC focus order — implement if straightforward; dots remain Tab-reachable regardless).

    Reduced-motion (UI-SPEC): the rune already blocks auto-advance via `isAutoAllowed`. ALSO ensure crossfade transitions are gated so switches are instant under reduced motion (use `motion-safe:` Tailwind variants or class-bind on `!motion.prefersReducedMotion`). Render slide 0 statically by default (activeSlide starts at 0). Do NOT call `matchMedia`. Do NOT override `:focus-visible`. NO iframe, NO `<canvas>`/WebGL.

    Defensive empty state (UI-SPEC § Rail "Empty/edge"): if `slides.length === 0` the section should not render a broken shell — but slide 0 is always the reel, so this is effectively unreachable; add a `{#if slideCount > 0}` guard anyway.

    Create `src/lib/components/HeroCarousel.svelte.test.ts` (mirror HeroAmbient.svelte.test.ts harness). Assert: exactly one `fetchpriority="high"` poster; dots are buttons with aria-label/aria-current; reduced-motion (`__setPrefersReducedMotionForTests(true)` + fake timers) produces no auto-advance while dot `goTo` still changes the active slide; slide links point to `/watch/{id}`.
  </action>
  <acceptance_criteria>
    - `grep -F "getHeroSlides" src/lib/components/HeroCarousel.svelte` matches AND `grep -F "producerReelId" src/lib/components/HeroCarousel.svelte` matches (reel leads).
    - `grep -c 'fetchpriority="high"' src/lib/components/HeroCarousel.svelte` returns >=1, and the attribute is conditional on the active slide (`grep -F "activeSlide" src/lib/components/HeroCarousel.svelte` matches near it).
    - `grep -F 'loading="lazy"' src/lib/components/HeroCarousel.svelte` matches (non-active posters lazy).
    - `grep -F "createHeroCarousel" src/lib/components/HeroCarousel.svelte` and `grep -F "7000" src/lib/heroCarousel.svelte.ts` (interval) — verified via Task 1; here assert `grep -F "startAuto" src/lib/components/HeroCarousel.svelte` matches.
    - `grep -F "Go to slide" src/lib/components/HeroCarousel.svelte` and `grep -F "aria-current" src/lib/components/HeroCarousel.svelte` match (dots).
    - `grep -F "categoryAccent(" src/lib/components/HeroCarousel.svelte` matches (eyebrow), AND `grep -F "0.08em" src/lib/components/HeroCarousel.svelte` matches (eyebrow letter-spacing).
    - `grep -F "watch/" src/lib/components/HeroCarousel.svelte` and `grep -F "Watch " src/lib/components/HeroCarousel.svelte` match (slide links).
    - `grep -F "motion.prefersReducedMotion" src/lib/components/HeroCarousel.svelte` matches AND `grep -c "matchMedia" src/lib/components/HeroCarousel.svelte` returns 0 AND `grep -c "iframe" src/lib/components/HeroCarousel.svelte` returns 0 AND `grep -c "canvas" src/lib/components/HeroCarousel.svelte` returns 0.
    - `grep -F "oklch(0.16 0 0 / 0.92)" src/lib/components/HeroCarousel.svelte` matches (scrim).
    - `pnpm test -- src/lib/components/HeroCarousel.svelte.test.ts` passes.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm test -- src/lib/components/HeroCarousel.svelte.test.ts</automated>
  </verify>
  <done>HeroCarousel renders reel-first poster+title slides as /watch links with exactly one eager+high poster, neutral dots (aria-label/aria-current), 7000ms/600ms crossfade auto-advance that pauses on hover/focus, and a static-but-navigable reduced-motion variant — no iframe/canvas/matchMedia; test green.</done>
</task>

</tasks>

<verification>
- `pnpm test -- src/lib/heroCarousel.svelte.test.ts src/lib/components/HeroCarousel.svelte.test.ts` passes.
- Exactly one poster is `fetchpriority="high"` (LCP); all others lazy. No iframe/canvas/WebGL/matchMedia in the hero.
- Auto-advance + crossfade are gated solely on `motion.prefersReducedMotion` (+ hover pause).
</verification>

<success_criteria>
- Plan 04 can drop `<HeroCarousel />` at the top of `+page.svelte` and get a cinematic, LCP-safe, reduced-motion-correct featured hero.
- All Task acceptance_criteria grep/test checks pass.
</success_criteria>

<output>
After completion, create `.planning/phases/02-homepage-rails/02-03-SUMMARY.md` documenting: the slide set construction (`[reel, ...getHeroSlides()]`), the pause-flag wiring into `isAutoAllowed`, and the crossfade gating mechanism for Plan 04 + Phase 5.
</output>
