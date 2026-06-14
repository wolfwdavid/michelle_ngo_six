# Phase 3: Browse & Watch - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the two browsing surfaces and the real watch experience on top of the established design system: a `/work` index (all categories), `/work/[category]` pages, and the full `/watch/[id]` player that replaces the Phase-2 stub. Covers BRW-01, BRW-02, BRW-03, WCH-01, WCH-02, WCH-03, WCH-04. Reuses VideoCard, CategoryRail, the data layer, and the dark cinematic tokens already in this repo.

</domain>

<decisions>
## Implementation Decisions

### Watch page (WCH-01..04) — replaces the Phase-2 stub
- Replace `src/routes/watch/[id]/+page.svelte` with the full player. **KEEP `+page.ts`** (its `entries()` prerenders all 56 ids and `load()` resolves the video) — do NOT add `/watch` to PENDING_ROUTES.
- Player: responsive 16:9 embedded iframe. Choose embed by `video.source`: Vimeo → `player.vimeo.com/video/{id}`, YouTube → `youtube-nocookie.com/embed/{id}`. Reference `_three`'s `watch/[id]/+page.svelte` for the exact embed/aspect/markup pattern.
- **WCH-04 lazy-load:** the iframe is NOT rendered at prerender — render the poster with a play button; the iframe mounts only on user activation (click) OR on mount client-side. Prefer click-to-load (poster + play overlay) to protect LCP and avoid 56 autoplaying embeds; reduced-motion irrelevant (user-initiated). This keeps prerender light.
- Metadata (WCH-02): title (display serif), category accent tag (links to `/work/[category]`), description/uploader/published/duration when present in data.
- **WCH-03 related rail:** a "Related work" `CategoryRail`-style row of other videos in the same category (exclude current id); if the category has too few, fall back to other featured videos. Reuse the rail/card components.
- Back-to-work link; correct `<svelte:head>` title/meta per video for SEO.

### Browse — /work index (BRW-01, BRW-03)
- `/work` lists ALL work. Layout: a `FilterPillBar` (port from `_three`) of the 8 categories (in display order) + an "All" pill, above a responsive **grid** of VideoCards (not rails — grid suits a full index). Selecting a pill filters client-side OR navigates to `/work/[category]`.
- BRW-03 (switch categories): the pill bar is the switch control, present on `/work` and `/work/[category]`; active pill uses the category accent.

### Browse — /work/[category] (BRW-02)
- `src/routes/work/[category]/+page.ts` with `entries()` for all 8 category slugs (prerender each) + `load()` resolving the category + its videos via `getByCategory`. 404/redirect for unknown slug.
- Grid of that category's VideoCards, category title + count, the FilterPillBar for switching. Reference `_three`'s `work/[category]` route.

### Accessibility / motion / perf
- Same system as Phase 2: motion gated on the `motion` rune; visible focus rings; cards are `<a>`; grids responsive; posters lazy below the fold.
- Everything prerenders; `pnpm build` stays green and strict; no new absolute asset paths.

### Claude's Discretion
- Grid column counts per breakpoint, pill styling, play-overlay visual, related-rail heading copy, and exact metadata layout — follow the UI-SPEC/Phase-2 aesthetic (dark, cinematic, isotopefilms/samhendi restraint).
- Whether `/work` filtering is client-side (one prerendered page) or pill-links to `/work/[category]` — pick the simpler that keeps all routes prerendered (client-side filter on a single `/work` page is fine).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- This repo: `VideoCard.svelte`, `CategoryRail.svelte`, `$lib/data` (getByCategory, getCategoriesInDisplayOrder, categoryToSlug, getById, videos, getPosterFor), `categoryAccent.ts`, `motion` rune, the watch stub route (`watch/[id]/+page.ts` to keep, `+page.svelte` to replace).
- Fork source `_three`: `watch/[id]/+page.svelte` (player + related), `work/+page.svelte` + `work/[category]/+page.svelte` (grid + filter), `FilterPillBar.svelte`, `PosterImage.svelte`.

### Established Patterns
- adapter-static strict prerender; `entries()` for dynamic routes; `trailingSlash='always'`.
- Tailwind v4 + OKLCH tokens; dark canvas; 8 category accents; `:focus-visible` double ring.
- Single motion source (`motion` rune); no `matchMedia`/`motion-safe:` in components.

### Integration Points
- TopNav already links to `/work`; nav hrefs to `/work` and `/watch` currently in the prerender allow-list — once these routes are real, prune the corresponding PENDING_ROUTES entries in `svelte.config.js` so strict prerender covers them genuinely.
- Watch pages link from every VideoCard (`/watch/[id]`) — now resolve to the full player.

</code_context>

<specifics>
## Specific Ideas

Keep the watch experience cinematic and fast: poster + play button, click to load the embed (no wall of autoplaying iframes). Browsing mirrors the homepage aesthetic but uses grids for full indexes. Reference the `_three` watch/work routes for proven mechanics; adapt to this repo's data/component surface.

</specifics>

<deferred>
## Deferred Ideas

- Final cinematic polish, parallax, responsive/a11y sweep → Phase 5.
- About/contact/press content pages → Phase 4.
- Hover-preview autoplay, search, live PBS feed → v2.

</deferred>
