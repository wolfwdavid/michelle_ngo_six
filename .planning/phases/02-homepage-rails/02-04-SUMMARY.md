---
phase: 02-homepage-rails
plan: 04
subsystem: homepage
tags: [homepage-assembly, watch-stub, prerender, entries, reduced-motion, accessibility, lcp]
requires:
  - src/lib/components/HeroCarousel.svelte (Plan 02-03, full-bleed, no props)
  - src/lib/components/CategoryRail.svelte (Plan 02-02, {category, eagerFirstCards})
  - src/lib/data (getCategoriesInDisplayOrder, videos, getById, Category, Video)
  - src/routes/+layout.ts (prerender=true, trailingSlash='always' — inherited)
  - src/routes/+layout.svelte (supplies <main id="main">, nav, footer)
provides:
  - src/routes/+page.svelte (homepage: full-bleed hero + CategoryRail-per-category in display order)
  - src/routes/watch/[id]/+page.ts (entries() prerenders all 56 video ids; load() 404s unknown ids)
  - src/routes/watch/[id]/+page.svelte (minimal dark-shell watch placeholder)
affects:
  - Phase 3 (WCH-01) MUST replace src/routes/watch/[id]/+page.svelte with the full player; KEEP the +page.ts entries()
tech-stack:
  added: []
  patterns:
    - "Dynamic [id] route prerendered crawler-independently via entries() = videos.map(v => ({ id: v.id })) — all 56 ids enumerated, not crawl-dependent"
    - "trailingSlash='always' => one directory + index.html per id (build/watch/{id}/index.html); count via find -name index.html (not ls)"
    - "Homepage uses a <div> wrapper (NOT a nested <main>) because the Phase-1 layout already provides <main id='main'>"
    - "Single sr-only <h1> for the document outline since hero/rail headings are all <h2>"
    - "eagerFirstCards passed true ONLY for the first rail (i === 0) so the active hero poster stays the sole eager/high LCP image"
    - "Base-prefixed-paths enforced structurally (every link/poster uses ${base}); verified by grepping build/index.html, NOT a path-lint script (none exists)"
key-files:
  created:
    - src/routes/watch/[id]/+page.ts
    - src/routes/watch/[id]/+page.svelte
  modified:
    - src/routes/+page.svelte
    - svelte.config.js
decisions:
  - "HOME-04 stub = a REAL /watch/[id] route with entries() prerendering all 56 ids — NOT a handleHttpError allow-list workaround. /watch must never appear in PENDING_ROUTES; a /watch 404 is a genuine link/id bug."
  - "Homepage spacing per UI-SPEC: hero->first rail 48px (pt-12), 32px between rails (space-y-8), last rail->footer 64px (pb-16)."
  - "Single sr-only h1 ('Michelle Ngo — Film & Video Portfolio') so the page has exactly one top-level heading without competing with the cinematic hero (all hero/rail titles are h2)."
  - "Verification model (no test runner): pnpm check + pnpm build (strict adapter-static, exit 0) + find-count over build output + base-path grep over build/index.html. No vitest, no pnpm test, no check:paths — none exist in package.json."
metrics:
  duration: 4min
  completed: 2026-06-14
---

# Phase 2 Plan 04: Homepage Assembly & Watch Stub Summary

Assembled the homepage (full-bleed `HeroCarousel` + one `CategoryRail` per category in display order on the Phase-1 app shell) and shipped a minimal real `/watch/[id]` route whose `entries()` prerenders all 56 public video ids, so every card/hero link resolves between phases while `pnpm build` stays green under strict adapter-static.

## What Was Built

- **`src/routes/+page.svelte`** — replaced the "Site coming soon." placeholder. A `<div class="bg-neutral-950">` wrapper (not a nested `<main>` — the layout owns `<main id="main">`) containing: one visually-hidden `<h1>`, the full-bleed `<HeroCarousel />`, then a single `<section aria-label="Browse by category">` looping `getCategoriesInDisplayOrder()` with one `<CategoryRail category={cat} eagerFirstCards={i === 0} />` per category. Spacing pt-12 / space-y-8 / pb-16.
- **`src/routes/watch/[id]/+page.ts`** — `prerender = true`, `entries()` returning `videos.map(v => ({ id: v.id }))` (all 56), and a `load()` that resolves `getById(params.id)` and `throw error(404)` for unknown ids. Typed with the generated `EntryGenerator` / `PageLoad`.
- **`src/routes/watch/[id]/+page.svelte`** — minimal dark-shell placeholder: exactly one `<h1>` (the video title), a category line, "Full player coming soon.", and a `${base}/` back link. No embedded player / canvas / WebGL.
- **`svelte.config.js`** — added a comment clarifying `/watch/[id]` is a real Phase-2 stub (never a `PENDING_ROUTES` entry); `strict: true` and the existing allow-list left intact.

## HOME-04 Stub Approach

A REAL `/watch/[id]` route — NOT an allow-list workaround. Because the route physically prerenders (`entries()` enumerates all 56 ids → `build/watch/{id}/index.html` for each), every card/hero `href={`${base}/watch/${id}`}` resolves to a live page with no `handleHttpError` exception. Phase 3 replaces only the `+page.svelte` with the full player and keeps the `+page.ts` `entries()`.

## Verification Model & Results (no test runner)

This repo intentionally has no vitest/CI harness. The gates used:

- `pnpm check` — 0 errors, 0 warnings (372 files).
- `pnpm build` — exit 0 with strict adapter-static; prerenders homepage + all 56 watch pages.
- `test -f build/watch/264677021/index.html` — reel watch page present.
- `find build/watch -name index.html | wc -l` — **56** (one per public video id; resilient to trailingSlash).
- Base-prefixed-paths: `! grep -rEq 'src="/[^"]|href="/[^"#]' build/index.html` — passes (no root-absolute asset/link paths; `#main` skip-link allowed).
- Prerendered homepage content confirmed: "Featured work" hero (1), "Browse by category" section (1), all 8 `id="rail-*"` headings, 50 card watch links, the sr-only h1.

## Reduced-Motion Evidence (HOME-05)

Structurally evidenced (no test harness): the `motion-ok` rune-bound gating in both `HeroCarousel.svelte` and `VideoCard.svelte` is present, and neither component uses `motion-safe:` (`grep -c "motion-safe:"` = 0 in both). Under `prefers-reduced-motion` the hero never auto-advances and crossfade is disabled (instant swaps), the card never tilts/scales, and the global app.css reduced-motion backstop zeroes transition durations — the page stays fully navigable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Homepage wrapper changed from `<main>` to `<div>` to avoid a nested `<main>`**
- **Found during:** Task 2
- **Issue:** The plan's action text suggested `<main class="bg-neutral-950">`, but the Phase-1 `+layout.svelte` already wraps every route in `<main id="main" tabindex="-1">`. Rendering a second `<main>` inside it is an invalid/ambiguous landmark (WCAG/a11y) and would break the skip-link target semantics.
- **Fix:** Used `<div class="bg-neutral-950">` as the homepage wrapper; the layout's `<main>` remains the single content landmark.
- **Files modified:** src/routes/+page.svelte
- **Commit:** ea0a0e1

**2. [Rule 1 - Bug] Reworded watch-stub comment to satisfy the `iframe`/`canvas` zero-match gate**
- **Found during:** Task 1
- **Issue:** An explanatory comment mentioned "Vimeo/YouTube iframe", tripping `grep -c "iframe"` (returned 2; gate requires 0).
- **Fix:** Reworded the comment to "embedded video" / "embedded player"; no functional change.
- **Files modified:** src/routes/watch/[id]/+page.svelte
- **Commit:** bc9140e

**Note (not a deviation):** `grep -rE '#[0-9a-fA-F]{3,6}'` over `+page.svelte` reports a single hit on the Svelte `{#each}` block keyword (`#eac…`), not a color literal. There are zero raw hex/`rgb()` colors in the file; the file uses tokens/utilities only. Comment text in `+page.svelte` was also reworded to remove a literal `<h1>` so the `grep -c "<h1"` count is exactly 1 (the rendered heading).

## Known Stubs

- **`src/routes/watch/[id]/+page.svelte`** — intentional Phase-2 placeholder ("Full player coming soon."). This is the documented HOME-04 stub; it resolves links now and Phase 3 (WCH-01) replaces it with the full player (keeping the `+page.ts` `entries()`). The links it serves are real and the route prerenders for all 56 ids, so the plan goal (every card/hero link resolves) IS achieved.

## For Phase 3

Phase 3 MUST replace `src/routes/watch/[id]/+page.svelte` with the full Vimeo/YouTube player + metadata + related rail, and KEEP `src/routes/watch/[id]/+page.ts` (the `entries()` generator + `load()`). Do not add `/watch` to `PENDING_ROUTES`.

## Self-Check: PASSED

All created/modified files exist; both task commits (bc9140e, ea0a0e1) present in git history.
