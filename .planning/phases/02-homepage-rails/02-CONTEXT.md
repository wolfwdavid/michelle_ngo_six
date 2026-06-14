# Phase 2: Homepage Rails - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the YouTube-style homepage — the project's core value. A featured hero at the top, then stacked horizontal category rails of video cards below, on the existing app shell. Covers HOME-01..05. Watch-page *content* is Phase 3, but cards link to `/watch/[id]` now.

</domain>

<decisions>
## Implementation Decisions

### Hero (HOME-01)
- **Rotating featured carousel** (NOT the ambient autoplay reel). Cycles through featured pieces as poster + title cards.
- Source the slides from `_three`'s `heroSlides.ts` logic — one featured (or first) video per category, capped ~6. Producer reel (Vimeo `264677021`) is the natural lead slide.
- Auto-advance every ~7s with clickable position dots; pause on hover/focus; each slide click-throughs to that video's `/watch/[id]`.
- Eager-load only the active slide's poster (LCP); no autoplaying iframes in the hero for this variant.
- `prefers-reduced-motion`: no auto-advance — show the first/featured slide statically with working dots for manual navigation.

### Rails (HOME-02, HOME-03)
- One labeled horizontal rail per category; **categories ordered data-driven by video count desc** via `getCategoriesInDisplayOrder()` (existing).
- **Hover chevron arrows** (left/right) on desktop + **CSS scroll-snap**; touch drag/swipe on mobile; **keyboard** arrow/Home/End navigation with a visible focus ring on the focused card.
- Arrows hide at scroll extremes (no left arrow at start, no right at end); rails with few cards don't overflow/scroll.
- Lazy-load posters below the fold (only first rail's first cards eager-ish); rails virtualize lightly or just rely on native lazy `loading="lazy"` on poster imgs.

### Cards (HOME-03, visual)
- **Cinematic depth + tilt:** rounded poster cards; subtle 3D tilt toward the cursor (CSS transform, perspective); shadow lift + category-accent ring on hover/focus; title fades up. Reuse/extend `_three`'s `VideoCard.svelte` + `categoryAccent` map.
- Tilt and lift are CSS-transform only (no WebGL); all motion gated on `prefers-reduced-motion` (reduced → no tilt, simple brighten + ring).
- Card shows poster, title, and category accent; duration badge if available in data.

### Navigation / linking (HOME-04)
- Activating a card (click, Enter/Space) navigates to `/watch/[id]` for that video.
- Watch pages are built in Phase 3. To keep HOME-04 demonstrable and the build green now, the planner MAY add a minimal placeholder `/watch/[id]` route this phase (Phase 3 replaces it with the full player), OR keep the forward-route prerender allow-list and let Phase 3 deliver the page. Prefer a minimal stub so links don't 404 for a live visitor between phases — planner's call, but flag whichever is chosen.

### Accessibility / motion (HOME-05)
- Single source of truth for motion: the existing `motion` state rune (`prefers-reduced-motion`). Hero auto-advance, card tilt, and any parallax all read it.
- Rails are keyboard-operable; cards are real links (`<a href>`); focus-visible rings from the existing design system.

### Claude's Discretion
- Exact tilt magnitude, easing, shadow values, chevron styling, dot styling, and rail gutter/spacing — apply the UI/UX Pro Max and Anthropic Frontend Design skills during the UI-SPEC/implementation to make it genuinely cinematic (dark, film-forward à la isotopefilms/samhendi) while protecting LCP.
- Whether the hero and first rail share a section or the hero is full-bleed.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `_three` components to port/adapt: `VideoCard.svelte`, `PosterImage.svelte`, `FilterPillBar.svelte`, `HeroAmbient.svelte` (reference for carousel mechanics — but we want the rotating-featured variant), `ContinueReelRail.svelte` (rail mechanics reference).
- Data surface (already in this repo from Phase 1): `$lib/data` — `getCategoriesInDisplayOrder()`, `categoryToSlug`, `producerReelId`, video loader, `posters.json`, `heroSlides.ts`.
- `categoryAccent` map (`src/lib/components/categoryAccent.ts`) for per-category accent rings.
- State runes: `motion.svelte.ts` (reduced-motion), `visibility.svelte.ts`, `scrollIdle.svelte.ts`.

### Established Patterns
- Tailwind v4 + OKLCH tokens; self-hosted fonts; strict prerender with a base-aware forward-route `handleHttpError` allow-list (prune `/watch` entry if a stub route is added).
- Dark canvas (`neutral-950`); 8 category accent tokens already defined.

### Integration Points
- `src/routes/+page.svelte` currently a placeholder — this phase replaces it with hero + rails.
- Cards link to `/watch/[id]`; ensure `categoryToSlug`/ids match Phase 3's route params.

</code_context>

<specifics>
## Specific Ideas

YouTube browse layout is the explicit metaphor: stacked horizontal rails, hover chevrons, scroll-snap. Cinematic/dark inspiration: isotopefilms.com, samhendi.com. "Claude 3D website" inspiration realized as CSS depth/tilt/parallax, not WebGL. Reduced-motion users get a fully static, fully navigable experience.

</specifics>

<deferred>
## Deferred Ideas

- Full watch-page player + metadata + related rail → Phase 3.
- Browse `/work` and `/work/[category]` pages → Phase 3.
- Hover-to-preview autoplay on cards → v2 (ENH-01).
- Site-wide search → v2.

</deferred>
