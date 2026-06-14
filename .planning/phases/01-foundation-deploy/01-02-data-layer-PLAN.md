---
phase: 01-foundation-deploy
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/lib/data/videos.json
  - src/lib/data/schema.ts
  - src/lib/data/categories.ts
  - src/lib/data/videos.ts
  - src/lib/data/posters.json
  - src/lib/data/posters.ts
  - src/lib/data/heroSlides.ts
  - src/lib/data/index.ts
  - src/lib/storage.ts
  - src/lib/state/menu.svelte.ts
  - src/lib/state/motion.svelte.ts
  - src/lib/state/network.svelte.ts
  - src/lib/state/visibility.svelte.ts
  - src/lib/state/scrollIdle.svelte.ts
  - src/lib/components/categoryAccent.ts
  - vite.config.ts
  - static/posters/
autonomous: true
requirements: [FND-03]
must_haves:
  truths:
    - "videos.json (56 videos, 8 categories) parses and passes VideoArraySchema (Zod) validation"
    - "$lib/data exports videos, getCategoriesInDisplayOrder, categoryToSlug, producerReelId, getById, getByCategory"
    - "pnpm build still exits 0 with the videos validation Vite plugin active"
    - "categoryAccent + the 5 state runes import cleanly (chrome components in Plan 03 depend on them)"
  artifacts:
    - path: "src/lib/data/videos.json"
      provides: "56-video dataset, 8 categories"
      contains: '"category"'
    - path: "src/lib/data/schema.ts"
      provides: "Zod VideoArraySchema + Video type"
      contains: "VideoArraySchema"
    - path: "src/lib/data/index.ts"
      provides: "public data surface"
      exports: ["videos", "categoryToSlug", "getCategoriesInDisplayOrder", "producerReelId"]
    - path: "vite.config.ts"
      provides: "build-time videos.json schema validation"
      contains: "VideoArraySchema"
  key_links:
    - from: "vite.config.ts"
      to: "src/lib/data/schema.ts"
      via: "import VideoArraySchema in validateVideosPlugin buildStart"
      pattern: "VideoArraySchema"
    - from: "src/lib/data/videos.ts"
      to: "src/lib/data/videos.json"
      via: "import rawVideos + VideoArraySchema.parse"
      pattern: "VideoArraySchema.parse"
---

<objective>
Port `_three`'s validated data layer and its supporting runtime modules: the Zod schema, categories taxonomy, the typed video loader, the poster + hero-slide helpers, the public `$lib/data` surface, the `$lib/storage` helper, the 5 state runes, and the `categoryAccent` map. Re-add the build-time `videos.json` schema-validation Vite plugin. Port the committed poster assets.

Purpose: Satisfy FND-03 — the Zod-validated `videos.json` (56 videos, 8 categories) plus `categories.ts`/`schema.ts` load and pass validation. These modules are also the dependencies the app-shell chrome (Plan 03) imports.
Output: A loading, schema-validated data layer; `pnpm build` stays green with build-time validation enforced.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation-deploy/01-CONTEXT.md
@.planning/phases/01-foundation-deploy/01-01-SUMMARY.md

FORK SOURCE (read directly — port these files):
- ../michelle_ngo_three/src/lib/data/index.ts
- ../michelle_ngo_three/src/lib/data/schema.ts
- ../michelle_ngo_three/src/lib/data/categories.ts
- ../michelle_ngo_three/src/lib/data/videos.ts
- ../michelle_ngo_three/src/lib/data/posters.ts
- ../michelle_ngo_three/src/lib/data/heroSlides.ts
- ../michelle_ngo_three/src/lib/storage.ts
- ../michelle_ngo_three/src/lib/state/*.svelte.ts
- ../michelle_ngo_three/src/lib/components/categoryAccent.ts
- ../michelle_ngo_three/vite.config.ts (port ONLY validateVideosPlugin)

<interfaces>
Public data surface (from _three/src/lib/data/index.ts) that Plan 03 chrome consumes:
```typescript
export type { Video } from './schema';
export type { Category } from './categories';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export { videos, producerReelId, getById, getByCategory,
         getCategoriesInDisplayOrder, getCategoriesWithCounts } from './videos';
```
State runes (module-scope, SSR-safe; consumed by Plan 03 +layout/TopNav):
```typescript
// $lib/state/menu.svelte:       menu.menuOpen, openMenu(), closeMenu()
// $lib/state/motion.svelte:     motion.prefersReducedMotion, initMotionState()
// $lib/state/network.svelte:    network.isCellularLike, initNetworkState()
// $lib/state/visibility.svelte: pageVisibility.documentHidden, initVisibilityListener()
// $lib/state/scrollIdle.svelte: scrollIdle.isScrolling, initScrollIdle(t), teardownScrollIdle()
// $lib/components/categoryAccent: categoryAccent(c), categoryAccentBg(c), categoryAccentRing(c)
```
</interfaces>

<notes>
- These are .svelte.ts rune modules (Svelte 5.55+ rune-scoping). All five state runes import `__isBrowser` from `$lib/storage`. Port storage.ts FIRST in the dependency order.
- DO NOT port the `*.test.ts` companion files — this phase has no test runner installed (Plan 01 omitted vitest). Port only the production modules.
- categoryAccent.ts spells out every `text-cat-*`/`bg-cat-*`/`ring-cat-*` class LITERALLY so Tailwind's scanner emits them — port verbatim, do not DRY into dynamic templates.
- videos.json is the byte-source of truth; copy it unmodified. _three's count is 56 videos (not the ~70 the early roadmap text estimated). 0 hidden. 8 categories.
- posters.json maps "{source}-{id}" -> "/posters/{source}-{id}.jpg" for all 56; posters.ts reads it.
</notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port storage helper + 5 state runes + categoryAccent</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/storage.ts
    - ../michelle_ngo_three/src/lib/state/menu.svelte.ts
    - ../michelle_ngo_three/src/lib/state/motion.svelte.ts
    - ../michelle_ngo_three/src/lib/state/network.svelte.ts
    - ../michelle_ngo_three/src/lib/state/visibility.svelte.ts
    - ../michelle_ngo_three/src/lib/state/scrollIdle.svelte.ts
    - ../michelle_ngo_three/src/lib/components/categoryAccent.ts
  </read_first>
  <action>
    Copy these production modules VERBATIM into michelle_ngo_six (preserve filenames, including the `.svelte.ts` extension which is load-bearing for rune scoping):
    1. `src/lib/storage.ts` — the namespaced localStorage helper + the exported `__isBrowser()` predicate (the runes depend on this; port first). The `STORAGE_PREFIX` literal is `mnp_three_` in the source; rename it to `mnp_six_` for correctness (one-line change, no downstream test this phase).
    2. `src/lib/state/menu.svelte.ts`
    3. `src/lib/state/motion.svelte.ts`
    4. `src/lib/state/network.svelte.ts`
    5. `src/lib/state/visibility.svelte.ts` (imports `./menu.svelte`)
    6. `src/lib/state/scrollIdle.svelte.ts` (imports `$lib/storage`)
    7. `src/lib/components/categoryAccent.ts` (imports `type Category` from `$lib/data` — that surface lands in Task 2 of this same plan, so the import resolves at build time once both tasks complete).
    Prefer verbatim copy; the `__resetForTests`/`__set...ForTests` helpers may remain (no linter/test runner installed this phase, so unused-export noise is not gated).
  </action>
  <acceptance_criteria>
    - `src/lib/storage.ts` exists and exports `__isBrowser`.
    - All 5 files under `src/lib/state/` exist with the `.svelte.ts` extension: menu, motion, network, visibility, scrollIdle.
    - `src/lib/components/categoryAccent.ts` contains the literal `text-cat-pbs` and `ring-cat-other`.
    - `grep -r "mnp_three_" src/lib/` returns nothing (prefix renamed to mnp_six_).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && test -f src/lib/storage.ts && test "$(ls src/lib/state/*.svelte.ts | wc -l)" -eq 5 && grep -q "text-cat-pbs" src/lib/components/categoryAccent.ts && echo OK</automated>
  </verify>
  <done>storage helper, all 5 state runes, and categoryAccent are present with correct extensions and literal accent classes.</done>
</task>

<task type="auto">
  <name>Task 2: Port the data layer (schema, categories, loader, posters, hero, index) + poster assets</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/data/schema.ts
    - ../michelle_ngo_three/src/lib/data/categories.ts
    - ../michelle_ngo_three/src/lib/data/videos.ts
    - ../michelle_ngo_three/src/lib/data/posters.ts
    - ../michelle_ngo_three/src/lib/data/heroSlides.ts
    - ../michelle_ngo_three/src/lib/data/index.ts
    - ../michelle_ngo_three/src/lib/data/videos.json
    - ../michelle_ngo_three/src/lib/data/posters.json
  </read_first>
  <action>
    Copy these VERBATIM into `src/lib/data/`:
    1. `videos.json` — byte-copy (56 records, 8 categories, 0 hidden).
    2. `posters.json` — byte-copy (56 keys: "{source}-{id}" -> "/posters/{source}-{id}.jpg").
    3. `schema.ts` — Zod 4 strictObject discriminatedUnion('source', youtube|vimeo), `VideoArraySchema`, `Video` type, `CategorySchema`.
    4. `categories.ts` — `CATEGORIES` (8), `Category` type, `categoryToSlug`, `slugToCategory`.
    5. `videos.ts` — the typed loader: `videos` (hidden-filtered), `producerReelId = '264677021'`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder` (count-desc, ties-alpha), `getCategoriesWithCounts`.
    6. `posters.ts` — `getPosterFor` (reads posters.json sidecar with deterministic fallback).
    7. `heroSlides.ts` — `getHeroSlides`, `HERO_SLIDE_CAP`.
    8. `index.ts` — the public surface re-exporting the 11 names listed in the interfaces block above.
    Then copy the committed poster assets: copy the entire `../michelle_ngo_three/static/posters/` directory (all 56 `.jpg` files + `.gitkeep`) into `static/posters/`. These are needed so the app.html hero-poster preload (`vimeo-264677021.jpg`) resolves and so later phases find posters.
  </action>
  <acceptance_criteria>
    - `src/lib/data/videos.json` exists with 56 records across 8 categories.
    - `src/lib/data/index.ts` contains `getCategoriesInDisplayOrder` and `producerReelId`.
    - `src/lib/data/schema.ts` contains `VideoArraySchema` and `discriminatedUnion`.
    - `ls static/posters/*.jpg | wc -l` equals 56.
    - `static/posters/vimeo-264677021.jpg` exists (the hero-preload target).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && node -e "const v=require('./src/lib/data/videos.json'); if(v.length!==56||[...new Set(v.map(x=>x.category))].length!==8){process.exit(1)}" && grep -q "producerReelId" src/lib/data/index.ts && grep -q "VideoArraySchema" src/lib/data/schema.ts && test "$(ls static/posters/*.jpg | wc -l)" -eq 56 && test -f static/posters/vimeo-264677021.jpg && echo OK</automated>
  </verify>
  <done>The full data layer is present, videos.json has 56 records / 8 categories, the public index exports the 11-name surface, and all 56 posters are committed.</done>
</task>

<task type="auto">
  <name>Task 3: Add build-time videos schema validation to vite.config.ts and confirm green build</name>
  <read_first>
    - ../michelle_ngo_three/vite.config.ts (port ONLY validateVideosPlugin — NOT validatePostersPlugin, NOT the vitest `test:` block)
    - michelle_ngo_six/vite.config.ts (the minimal version from Plan 01-01)
  </read_first>
  <action>
    Replace michelle_ngo_six/vite.config.ts with a version that adds `validateVideosPlugin` (ported from _three) BETWEEN tailwindcss() and sveltekit():

    1. Keep the imports for sveltekit, defineConfig + type Plugin, tailwindcss.
    2. Add: `import { z } from 'zod'; import { readFileSync } from 'node:fs'; import { resolve, dirname } from 'node:path'; import { fileURLToPath } from 'node:url'; import { VideoArraySchema } from './src/lib/data/schema';` and the `__dirname` derivation.
    3. Port the `validateVideosPlugin(): Plugin` function VERBATIM from _three (buildStart hook: JSON.parse videos.json, VideoArraySchema.safeParse with z.prettifyError on failure, plus the (source,id) uniqueness cross-check).
    4. DO NOT port `validatePostersPlugin` (its sidecar+file gating is heavier than needed for this phase; posters.json + assets already exist so it would pass, but keep config minimal — defer to a later phase if wanted).
    5. DO NOT port the `test:` projects block (no vitest installed).
    6. Final `plugins` array: `[tailwindcss(), validateVideosPlugin(), sveltekit()]`.
    Then run `pnpm build` to confirm the validation plugin passes against the real videos.json and the build stays green.
  </action>
  <acceptance_criteria>
    - `vite.config.ts` contains `validateVideosPlugin` and `VideoArraySchema` and the plugins array `[tailwindcss(), validateVideosPlugin(), sveltekit()]`.
    - `vite.config.ts` does NOT contain `validatePostersPlugin` or a `test:` / `projects:` block.
    - `pnpm build` exits 0 (validation passes) and `build/index.html` still exists.
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "validateVideosPlugin" vite.config.ts && ! grep -q "validatePostersPlugin" vite.config.ts && pnpm build && test -f build/index.html && echo BUILD_GREEN</automated>
  </verify>
  <done>The build-time Zod validation plugin is wired and passing; `pnpm build` is green with the validated data layer in place.</done>
</task>

</tasks>

<verification>
- videos.json: 56 records, 8 categories, parses under VideoArraySchema.
- `$lib/data/index.ts` exports the 11-name public surface.
- `pnpm build` exits 0 with `validateVideosPlugin` active.
- 56 posters committed under static/posters/, including vimeo-264677021.jpg.
</verification>

<success_criteria>
The Zod-validated `videos.json` (56 videos, 8 categories) plus `categories.ts`/`schema.ts` load and pass validation, and the supporting state/storage/accent modules are in place for the app shell (FND-03).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-deploy/01-02-SUMMARY.md`.
</output>
