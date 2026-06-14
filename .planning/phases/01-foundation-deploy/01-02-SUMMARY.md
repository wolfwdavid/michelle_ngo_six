---
phase: 01-foundation-deploy
plan: 02
subsystem: data-layer
tags: [zod, videos-json, svelte5-runes, localstorage, vite-plugin, posters, prerender]
dependency_graph:
  requires:
    - "01-01 (scaffold): SvelteKit 5 + adapter-static + Tailwind v4 + vite.config.ts base"
  provides:
    - "Zod-validated $lib/data surface (videos, getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts, categoryToSlug, slugToCategory, CATEGORIES, producerReelId, Video, Category)"
    - "videos.json (56 videos, 8 categories, 0 hidden) + posters.json sidecar"
    - "$lib/data/posters (getPosterFor) + $lib/data/heroSlides (getHeroSlides, HERO_SLIDE_CAP)"
    - "$lib/storage namespaced localStorage helper (mnp_six_) + __isBrowser"
    - "5 SSR-safe module-scope state runes: menu, motion, network, visibility, scrollIdle"
    - "categoryAccent map (literal text/bg/ring-cat-* classes for Tailwind scanner)"
    - "build-time validateVideosPlugin enforcing schema + (source,id) uniqueness"
    - "56 committed poster assets under static/posters/ (incl. hero vimeo-264677021.jpg)"
  affects:
    - "01-03 (app shell): TopNav/Footer/MobileMenu consume the state runes + $lib/data + categoryAccent"
    - "01-04 (sitemap/deploy): sitemap reads $lib/data"
tech_stack:
  added: []
  patterns:
    - "validateVideosPlugin between tailwindcss() and sveltekit() (fail-fast buildStart Zod validation)"
    - ".svelte.ts extension for module-scope runes (Svelte 5.55+ rune-scoping)"
    - "Literal Tailwind accent classes (no dynamic templates) so the v4 scanner emits them"
    - "Loader parse() materializes Zod .default() values (featured/hidden/tags)"
key_files:
  created:
    - src/lib/storage.ts
    - src/lib/state/menu.svelte.ts
    - src/lib/state/motion.svelte.ts
    - src/lib/state/network.svelte.ts
    - src/lib/state/visibility.svelte.ts
    - src/lib/state/scrollIdle.svelte.ts
    - src/lib/components/categoryAccent.ts
    - src/lib/data/videos.json
    - src/lib/data/posters.json
    - src/lib/data/schema.ts
    - src/lib/data/categories.ts
    - src/lib/data/videos.ts
    - src/lib/data/posters.ts
    - src/lib/data/heroSlides.ts
    - src/lib/data/index.ts
    - static/posters/ (56 jpg + .gitkeep)
  modified:
    - vite.config.ts
    - svelte.config.js
decisions:
  - "Renamed storage prefix mnp_three_ -> mnp_six_ so this fork's localStorage namespace is its own (Trap D origin-sharing mitigation)."
  - "Ported ONLY validateVideosPlugin from _three's vite.config.ts; deferred validatePostersPlugin and the vitest test:/projects: block (no test runner this phase)."
  - "Removed the 01-01 temporary handleHttpError poster-preload allowance and restored fully-strict prerender now that static/posters/ ships vimeo-264677021.jpg."
metrics:
  duration_min: 18
  tasks: 3
  files: 71
  completed: 2026-06-14
---

# Phase 01 Plan 02: Data Layer Summary

Ported `michelle_ngo_three`'s Zod-validated data layer (56 videos / 8 categories) and its supporting runtime — the typed loader, poster + hero helpers, the public `$lib/data` surface, the namespaced `$lib/storage` helper, the 5 SSR-safe state runes, and the literal `categoryAccent` map — then re-added the build-time `validateVideosPlugin` and restored strict prerender. `pnpm build` exits 0 with schema validation enforced.

## What Was Built

- **Task 1 — storage + state runes + categoryAccent** (`314f383`): `$lib/storage.ts` (namespaced localStorage helper, prefix renamed `mnp_three_` -> `mnp_six_`, exports `__isBrowser`); five `.svelte.ts` module-scope runes (`menu`, `motion`, `network`, `visibility`, `scrollIdle`) each SSR-safe via `__isBrowser`/`typeof document` guards; `$lib/components/categoryAccent.ts` with every `text/bg/ring-cat-*` class spelled out literally so Tailwind v4's scanner emits them.
- **Task 2 — data layer + 56 posters** (`6a00c64`): byte-copied `videos.json` (56 records, 8 categories, 0 hidden) and `posters.json` (56 keys); `schema.ts` (`VideoArraySchema`, `discriminatedUnion('source', youtube|vimeo)`, strictObject, `z.iso.date()`), `categories.ts` (8-entry `CATEGORIES`, `categoryToSlug`/`slugToCategory`), `videos.ts` (typed loader: `videos` hidden-filtered, `producerReelId='264677021'`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder` count-desc/ties-alpha, `getCategoriesWithCounts`), `posters.ts` (`getPosterFor` sidecar read + deterministic fallback), `heroSlides.ts` (`getHeroSlides`, `HERO_SLIDE_CAP`), `index.ts` (11-name public surface). Shipped 56 poster jpgs under `static/posters/` including the hero-preload target `vimeo-264677021.jpg`.
- **Task 3 — build-time validation + strict prerender** (`f80343c`): rewrote `vite.config.ts` to add `validateVideosPlugin` (Zod `safeParse` with `z.prettifyError`, plus `(source,id)` uniqueness cross-check) between `tailwindcss()` and `sveltekit()` — `[tailwindcss(), validateVideosPlugin(), sveltekit()]`. Deliberately omitted `validatePostersPlugin` and the vitest `test:`/`projects:` block. Removed the temporary 01-01 `handleHttpError` poster-preload allowance from `svelte.config.js`, restoring fully-strict prerender. `pnpm build` exits 0; `build/index.html` present.

## Verification

- `node -e` count check: `videos.json` = 56 records across 8 distinct categories.
- `src/lib/data/index.ts` exports `producerReelId` + `getCategoriesInDisplayOrder`; `schema.ts` contains `VideoArraySchema` + `discriminatedUnion`.
- `ls static/posters/*.jpg` = 56; `static/posters/vimeo-264677021.jpg` present.
- `vite.config.ts` contains `validateVideosPlugin`; does NOT contain `validatePostersPlugin` or `test:`/`projects:`.
- `svelte.config.js` no longer contains `handleHttpError` (strict prerender restored).
- 5 `.svelte.ts` files under `src/lib/state/`; `categoryAccent.ts` contains literal `text-cat-pbs` and `ring-cat-other`; `grep mnp_three_ src/lib/` returns nothing.
- `pnpm build` exits 0 with validation active; `build/index.html` exists.
- `pnpm check` → 0 errors, 0 warnings across 358 files.

## Deviations from Plan

None — plan executed exactly as written. The plan explicitly instructed removing the 01-01 `handleHttpError` allowance (carry-over follow-up) and renaming the storage prefix; both are recorded as Key Decisions, not deviations.

## Carry-over Resolved

Plan 01-01's temporary `kit.prerender.handleHttpError` allowance (which ignored the missing `/posters/vimeo-264677021.jpg` preload) has been removed. The poster now ships under `static/posters/`, so strict prerender is fully restored and `pnpm build` still exits 0.

## Known Stubs

None. The data layer is fully wired and validated; the `__resetForTests`/`__set...ForTests` helpers on the runes are intentional test-surface exports (no test runner installed this phase, so they are unused but harmless and preserved verbatim for parity with `_three`).

## Self-Check: PASSED
