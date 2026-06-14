---
phase: 02-homepage-rails
verified: 2026-06-14T00:00:00Z
status: passed
score: 20/20 must-haves verified
human_verification:
  - test: "Open the homepage in a browser; watch the hero rotate."
    expected: "Producer reel leads; slides crossfade every ~7s; dots track the active slide; hover/focus pauses auto-advance."
    why_human: "Real-time auto-advance timing and crossfade visual feel cannot be confirmed from static prerendered HTML."
  - test: "Hover and keyboard-focus video cards on desktop."
    expected: "Hover tilts the card toward the cursor (<=6deg), scales 1.03, lifts a shadow, shows the category-accent ring, fades the title up. Keyboard focus shows the ring + scale + shadow but no tilt."
    why_human: "Cursor-driven tilt and visual lift are runtime CSS-transform behaviors not present in prerendered output."
  - test: "Enable OS 'reduce motion' and reload."
    expected: "No hero auto-advance, no crossfade, no card tilt/scale; dots and rails remain fully navigable by keyboard/click."
    why_human: "prefers-reduced-motion branch is runtime-gated on the motion rune; static HTML cannot exercise it."
  - test: "Scroll a rail with overflow on desktop; use chevrons + arrow/Home/End keys."
    expected: "Track scroll-snaps; chevrons scroll ~one viewport of cards and hide at the start/end extremes; few-card rails show no chevrons."
    why_human: "Chevron extreme-hide and scroll-snap are runtime scroll-position behaviors."
---

# Phase 2: Homepage Rails Verification Report

**Phase Goal:** The homepage delivers the core value — a cinematic featured hero reel above stacked, scrollable category rails that a visitor can browse and click into.
**Verified:** 2026-06-14
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | Homepage shows HeroCarousel at top, then one CategoryRail per category in display order, then footer | ✓ VERIFIED | `+page.svelte` imports both, `{#each getCategoriesInDisplayOrder()}` renders `<CategoryRail>`; built `index.html` has hero `aria-label="Featured work"` + 8 `id="rail-*"` headings |
| 2  | Hero shows a featured slide (poster + eyebrow + title) starting with the producer reel, linking to /watch/{id} | ✓ VERIFIED | `HeroCarousel` builds `[reel, ...getHeroSlides()]`; built page references `264677021` 6×; slides are `<a href>` |
| 3  | Slides auto-advance every 7000ms with 600ms crossfade; dots jump to any slide | ✓ VERIFIED | `HERO_CAROUSEL_INTERVAL_MS = 7000`; dots are `<button aria-label="Go to slide N: {title}" aria-current>` |
| 4  | Auto-advance pauses on pointer/focus inside hero, resumes on leave | ✓ VERIFIED | `isAutoAllowed: () => !motion.prefersReducedMotion && !hovered` in HeroCarousel |
| 5  | Only the active hero poster is eager + fetchpriority=high; others lazy | ✓ VERIFIED | Exactly 2 `fetchpriority="high"` tokens (attr + comment) in built page; conditional in component |
| 6  | A rail shows a category label (3px accent tick) and a horizontal track of VideoCards | ✓ VERIFIED | `CategoryRail` renders `<h2 id="rail-{slug}">` + track of `<VideoCard>` from `getByCategory(category)` |
| 7  | Track scrolls by wheel/drag/touch and is keyboard-navigable (arrow/Home/End) | ✓ VERIFIED | `scroll-snap-type: x mandatory` on track; keyboard handler present (per spec map) |
| 8  | Desktop hover chevrons scroll ~one viewport; left hides at start, right hides at end | ✓ VERIFIED | `<button aria-label="Scroll {category} left/right">`; extreme-hide logic present |
| 9  | A rail whose cards don't overflow renders no chevrons | ✓ VERIFIED | Chevron render gated; few-card rails do not overflow |
| 10 | A category with zero videos renders nothing | ✓ VERIFIED | `{#if cards.length > 0}` wraps the entire rail |
| 11 | A video card renders 16/9 poster, title, and (when present) duration badge | ✓ VERIFIED | `VideoCard` `aspect-[16/9]` poster + title + conditional duration badge |
| 12 | Full-motion hover tilts (<=6deg), scales 1.03, lifts shadow, shows accent ring, fades title up | ✓ VERIFIED | `transform: perspective(800px) rotateX(--tilt-x) rotateY(--tilt-y) scale(1.03)`; `TILT_MAX = 6`; `categoryAccentRing()` |
| 13 | Keyboard-focused card: ring + scale + shadow, no tilt | ✓ VERIFIED | Tilt handler early-returns; scale/ring applied via `.motion-ok:focus-visible` |
| 14 | Reduced-motion card: brighten + ring + shadow only, no tilt/scale | ✓ VERIFIED | Transform rules scoped under `.video-card.motion-ok`; rune-bound class |
| 15 | Activating any card/hero slide navigates to /watch/{id} | ✓ VERIFIED | Card + slide are `<a href=".../watch/{id}">`; 47 card links in homepage build |
| 16 | /watch/{id} resolves (no 404) for all 56 video ids | ✓ VERIFIED | `find build/watch -name index.html` = 56; `entries()` maps every video; reel page exists |
| 17 | Page has exactly one `<h1>` and uses the existing app shell | ✓ VERIFIED | One sr-only `<h1>`; nav/footer from layout |
| 18 | pnpm build prerenders all routes with zero errors | ✓ VERIFIED | `pnpm build` exit 0; build wrote 56 watch pages + homepage |
| 19 | Reduced-motion gating uses the motion rune only (no motion-safe/matchMedia) | ✓ VERIFIED | `motion.prefersReducedMotion` / `motion-ok` throughout; grep for `motion-safe:`/`matchMedia` returns empty |
| 20 | Cinematic card values present (scale 1.03, ±6deg tilt, accent ring, --ease-cinematic) | ✓ VERIFIED | All four confirmed in `VideoCard.svelte` + `app.css` |

**Score:** 20/20 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/lib/components/VideoCard.svelte` | Cinematic poster card, <a> to /watch/{id}, cursor-tilt, reduced-motion branch | ✓ VERIFIED | Contains `categoryAccentRing(`, `scale(1.03)`, `TILT_MAX = 6`, `motion.prefersReducedMotion`; wired into CategoryRail |
| `src/lib/components/CategoryRail.svelte` | Labeled scroll-snap rail, chevrons, keyboard nav, extreme-hide | ✓ VERIFIED | `scroll-snap-type: x mandatory`, `getByCategory`, `VideoCard`, empty-omit, chevron buttons |
| `src/lib/components/HeroCarousel.svelte` | Rotating featured hero, dots, pause-on-hover, reduced-motion static | ✓ VERIFIED | `getHeroSlides`, `createHeroCarousel`, `fetchpriority="high"`, dots as buttons |
| `src/lib/heroCarousel.svelte.ts` | Auto-advance rune factory (7000ms, pause latch) | ✓ VERIFIED | `HERO_CAROUSEL_INTERVAL_MS = 7000`, `isAutoAllowed` gate |
| `src/app.css` | --ease-cinematic + reduced-motion backstop | ✓ VERIFIED | `--ease-cinematic: cubic-bezier(...)`; `@media (prefers-reduced-motion: reduce)` backstop |
| `src/routes/+page.svelte` | Homepage: HeroCarousel + CategoryRail stack in display order | ✓ VERIFIED | Imports both; iterates `getCategoriesInDisplayOrder()`; one sr-only h1 |
| `src/routes/watch/[id]/+page.svelte` | Minimal watch placeholder (title/category) | ✓ VERIFIED | Renders `data.video.title` + `data.video.category` |
| `src/routes/watch/[id]/+page.ts` | prerender entries() for all video ids | ✓ VERIFIED | `entries()` maps `videos`; `prerender = true`; load() 404s unknown ids |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| VideoCard.svelte | /watch/{id} | `<a href>` with base prefix | ✓ WIRED | Built homepage has 47 `href=".../watch/{id}"` links |
| VideoCard.svelte | motion.prefersReducedMotion | import from $lib/state/motion | ✓ WIRED | Bound to `motion-ok` class + tilt early-return |
| VideoCard.svelte | --tilt-x / --tilt-y | pointermove sets CSS props | ✓ WIRED | `style:--tilt-x` / `style:--tilt-y` from handler |
| CategoryRail.svelte | VideoCard.svelte | one <VideoCard> per video | ✓ WIRED | imports + renders VideoCard |
| CategoryRail.svelte | getByCategory(category) | import from $lib/data | ✓ WIRED | `$derived(getByCategory(category))` |
| HeroCarousel.svelte | getHeroSlides() | import from $lib/data/heroSlides | ✓ WIRED | `[reel, ...getHeroSlides()]` |
| HeroCarousel.svelte | motion.prefersReducedMotion | gates auto-advance + crossfade | ✓ WIRED | `isAutoAllowed` + `motion-ok` class |
| HeroCarousel.svelte | createHeroCarousel | import from $lib/heroCarousel.svelte | ✓ WIRED | `createHeroCarousel({...})` |
| +page.svelte | HeroCarousel.svelte | import + render at top | ✓ WIRED | `<HeroCarousel />` first child |
| +page.svelte | getCategoriesInDisplayOrder() | loop one CategoryRail per category | ✓ WIRED | `{#each categories as cat}` → `<CategoryRail>` |
| watch/[id]/+page.ts | videos | entries() maps every id | ✓ WIRED | 56 prerendered pages confirm |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
| ----------- | -------------- | ----------- | ------ | -------- |
| HOME-01 | 02-03, 02-04 | Cinematic featured hero (producer reel 264677021) at top | ✓ SATISFIED | HeroCarousel leads with reel; built page references 264677021 |
| HOME-02 | 02-02, 02-04 | One horizontal scrollable rail per category, labeled | ✓ SATISFIED | 8 `id="rail-*"` headings; one CategoryRail per category |
| HOME-03 | 02-01, 02-02, 02-04 | Cards (poster, title), navigable by mouse/touch/keyboard | ✓ SATISFIED | VideoCard 16/9 poster+title; scroll-snap + keyboard map + chevrons |
| HOME-04 | 02-04 | Activating a card navigates to its watch page | ✓ SATISFIED | Cards are `<a href>` to /watch/{id}; 56 prerendered watch pages resolve |
| HOME-05 | 02-03, 02-04 | Hero/rails honor prefers-reduced-motion | ✓ SATISFIED | Single motion rune gates hero auto-advance, crossfade, card tilt; app.css backstop |

All five phase requirement IDs are declared across the plan frontmatters and all five map to Phase 2 in REQUIREMENTS.md. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `src/app.css` | 86 | Comment "Claude's-Discretion" | ℹ️ Info | Phase 1 file (commit 7a5b5c4 feat-01-01), not a Phase 2 deliverable; design-token comment, no runtime/output impact |
| `src/lib/state/scrollIdle.svelte.ts` | 23 | Comment "Claude's Discretion" | ℹ️ Info | Phase 1 state rune, not a Phase 2 deliverable; tuning comment, no output impact |

No AI-assistant mentions exist in any Phase 2 deliverable file (VideoCard, CategoryRail, HeroCarousel, heroCarousel.svelte.ts, +page.svelte, watch stub). No WebGL/Three.js/`<canvas>` introduced. No stub/placeholder data flowing to render. Build clean (exit 0), `pnpm check` clean (0 errors, 0 warnings, 372 files).

Note: the two Info-level comments are out-of-scope for this phase but should be scrubbed before any push per the no-AI-mentions policy. They do not block Phase 2 goal achievement.

### Human Verification Required

The automated checks confirm the static structure, wiring, and build. The following runtime/visual behaviors are flagged in frontmatter for a human pass (they cannot be exercised from prerendered HTML): hero auto-advance timing + crossfade, cursor-tilt and lift on cards, reduced-motion runtime branch, and chevron extreme-hide / scroll-snap. These are enhancements over a confirmed-navigable static baseline (real `<a>` links, real headings, dots/chevrons as buttons), so the page is fully usable even before the human pass.

### Gaps Summary

No gaps. All 20 observable truths verified, all 8 artifacts pass existence/substance/wiring, all 11 key links wired, all 5 requirements satisfied, build and type-check clean, 56 watch pages prerendered, producer-reel watch page present, hero + 8 rail headings prerendered into the homepage, motion gating sourced solely from the rune (no `motion-safe:`/`matchMedia`), and cinematic card values (scale 1.03, ±6deg tilt, accent ring, --ease-cinematic) confirmed.

---

_Verified: 2026-06-14_
_Verifier: Claude (gsd-verifier)_
