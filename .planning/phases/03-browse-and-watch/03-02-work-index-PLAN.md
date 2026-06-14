---
phase: 03-browse-and-watch
plan: 02
type: execute
wave: 2
depends_on: ["03-01"]
files_modified:
  - src/lib/components/FilterPillBar.svelte
  - src/routes/work/+page.ts
  - src/routes/work/+page.svelte
  - svelte.config.js
autonomous: true
requirements: [BRW-01, BRW-03]
must_haves:
  truths:
    - "Opening /work shows a filter pill bar (All + 8 categories in display order) above a responsive grid of every video as a VideoCard"
    - "Clicking a category pill filters the grid to that category client-side, staying on the single prerendered /work page; the active pill uses the category accent"
    - "Clicking the All pill restores the full grid"
    - "/work is removed from PENDING_ROUTES and strict prerender still passes"
  artifacts:
    - path: "src/lib/components/FilterPillBar.svelte"
      provides: "Category pill bar (All + 8 categories) with active-state styling"
      contains: "categoryAccent"
    - path: "src/routes/work/+page.svelte"
      provides: "Work index: FilterPillBar + responsive grid + client-side filter"
      contains: "VideoCard"
    - path: "src/routes/work/+page.ts"
      provides: "prerendered single page passing all videos"
      contains: "videos"
  key_links:
    - from: "src/routes/work/+page.svelte"
      to: "selected category state"
      via: "client-side filter of data.videos"
      pattern: "\\$state|\\$derived"
    - from: "svelte.config.js"
      to: "PENDING_ROUTES"
      via: "'/work' entry removed"
      pattern: "PENDING_ROUTES"
---

<objective>
Build the `/work` browse index: a `FilterPillBar` (ported from `_three` and adapted
to this repo) of "All" + the 8 categories above a responsive grid of every video,
with client-side category filtering on a single prerendered page. Covers BRW-01
(present all categories) and BRW-03 (switch via filter control). Prune `/work` from
the prerender allow-list so strict prerender genuinely covers the now-real route.

Purpose: a visitor can open one page to see all of Michelle's work and switch
between categories without a page load.

Output: a real, prerendered `/work` index + a reusable `FilterPillBar` (also used
by /work/[category] in Plan 03-03).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-browse-and-watch/03-CONTEXT.md

<interfaces>
From src/lib/data:
```typescript
export function getCategoriesInDisplayOrder(): readonly Category[]; // count desc, ties alpha
export function getCategoriesWithCounts(): ReadonlyArray<{ category: Category; slug: string; count: number }>;
export function categoryToSlug(category: Category): string;
export { videos };  // readonly Video[] — all 56 public videos
```

From src/lib/components/categoryAccent.ts:
```typescript
export function categoryAccent(category): string;     // text-cat-<slug>
export function categoryAccentBg(category): string;    // bg-cat-<slug>/15
export function categoryAccentRing(category): string;  // ring-cat-<slug>/40
```

From src/lib/components/VideoCard.svelte: `let { video, eager=false } = $props()`.
From src/lib/state/motion.svelte: `motion.prefersReducedMotion`.
From $app/state: `page.url.pathname` (Svelte 5 runes-mode state import).
From $app/paths: `base`.

Existing prerender allow-list in svelte.config.js (the entry to remove):
```js
const PENDING_ROUTES = new Set(['/work', '/about', '/press', '/contact', '/pbs-american-portrait/']);
// plus: const isPendingWorkCategory = normalized.startsWith('/work/');  // KEEP — /work/[category] is Plan 03-03
```
</interfaces>

<!-- Fork references — proven mechanics to ADAPT to this repo: -->
@../michelle_ngo_three/src/lib/components/FilterPillBar.svelte
@../michelle_ngo_three/src/routes/work/+page.svelte
@../michelle_ngo_three/src/routes/work/+page.ts
</context>

<constraints>
- NO test harness. Verify ONLY with `pnpm check`, `pnpm build` (exit 0), grep, find, test -f. Do NOT add vitest, a test script, or any `check:paths`/no-absolute-paths script.
- The `_three` FilterPillBar references concepts that do NOT exist here (a `--chrome-nav-height` CSS var, jsdom/vitest scrollIntoView guards, eslint override comments). Strip those — adapt to THIS repo: sticky `top-0`, read `motion.prefersReducedMotion` for scroll behavior, no test-runner comments.
- `_three`'s pill bar pill LINKS to `/work/[slug]`. This repo's CONTEXT prefers the SIMPLER all-prerendered approach: the pill bar on `/work` filters CLIENT-SIDE (no navigation), while still letting /work/[category] (Plan 03-03) reuse it. Implement the pill bar so it works BOTH as client-side filter callbacks on /work AND as links on /work/[category] — see Task 1 for the prop contract.
- This repo uses `trailingSlash='always'` and `motion-ok` rune gating — never `motion-safe:`/`matchMedia`.
- Base-path safety: all hrefs use `${base}`.
- NO planning-phase phrases or assistant/agent names in code or comments (CLAUDE.md, strict).
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: Port and adapt FilterPillBar (All + 8 category pills, dual-mode: filter or link)</name>
  <files>src/lib/components/FilterPillBar.svelte</files>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/FilterPillBar.svelte (the proven pill bar to adapt)
    - src/lib/components/categoryAccent.ts (accent helpers for active-pill styling)
    - src/lib/data/videos.ts (getCategoriesInDisplayOrder, categoryToSlug)
    - src/lib/state/motion.svelte (motion rune for scroll-into-view behavior)
  </read_first>
  <action>
    Create src/lib/components/FilterPillBar.svelte adapted from `_three`'s version.

    Prop contract (dual-mode so both /work client-filter and /work/[category] links work):
      `let { active = 'all', onselect }:
        { active?: string;  // 'all' or a category slug
          onselect?: (slug: string) => void; } = $props();`
    - When `onselect` is provided (the /work index, Plan 03-02), each pill is a
      `<button type="button" onclick={() => onselect(slug)}>` — NO navigation,
      client-side filter.
    - When `onselect` is NOT provided (the /work/[category] route, Plan 03-03),
      each pill is an `<a href={`${base}/work/${slug}`}>` (the "All" pill →
      `${base}/work`). Use `{#if onselect}<button>{:else}<a>{/if}` per pill.

    Pills: leftmost "All" (slug `'all'`), then `getCategoriesInDisplayOrder()` mapped
    to `{ category, slug: categoryToSlug(category) }`.

    Active state: a pill is active when its slug === `active`. The active pill uses
    the compound accent: `categoryAccent(category) categoryAccentBg(category) ring-1
    ${categoryAccentRing(category)} border-transparent`; the active "All" pill uses
    the neutral `bg-neutral-50 text-neutral-950` style. Set `aria-current="page"` /
    `aria-pressed` on the active pill (use `aria-current` for the link mode,
    `aria-pressed` for the button mode).

    Container: a `<nav aria-label="Filmography filters" class="sticky top-0 z-20
    bg-neutral-950/95 backdrop-blur border-b border-white/10">` wrapping a horizontal
    scroll row (`flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8
    scrollbar-hide`). Optionally scroll the active pill into view on change using
    `motion.prefersReducedMotion ? 'auto' : 'smooth'` (guard `scrollIntoView` exists).

    Strip ALL `_three` artifacts that don't apply: the `--chrome-nav-height` var
    (use `top-0`), the jsdom/vitest scrollIntoView comment, the eslint-override
    commentary, and the `page`-based active derivation (active comes from the `active`
    prop here, not page.url). Keep base-path-safe `${base}` hrefs in link mode.
  </action>
  <acceptance_criteria>
    - `test -f src/lib/components/FilterPillBar.svelte` succeeds
    - `grep -c "getCategoriesInDisplayOrder" src/lib/components/FilterPillBar.svelte` >= 1
    - `grep -c "onselect" src/lib/components/FilterPillBar.svelte` >= 1 (filter-callback mode)
    - `grep -c "categoryAccent" src/lib/components/FilterPillBar.svelte` >= 1 (active-pill accent)
    - `grep -E "chrome-nav-height|jsdom|vitest|eslint-disable" src/lib/components/FilterPillBar.svelte` returns NOTHING
    - `grep -E "motion-safe:|matchMedia" src/lib/components/FilterPillBar.svelte` returns NOTHING
    - `pnpm check` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <done>
    A reusable FilterPillBar renders "All" + 8 category pills in display order, styles
    the active pill with the category accent, and works in two modes: a filter-callback
    (button) mode for /work and a link mode for /work/[category]. No `_three`-specific
    scaffolding leaks in. `pnpm check` clean.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build /work index (load + grid + client-side filter) and prune /work from PENDING_ROUTES</name>
  <files>src/routes/work/+page.ts, src/routes/work/+page.svelte, svelte.config.js</files>
  <read_first>
    - ../michelle_ngo_three/src/routes/work/+page.ts (load shape — returns { videos })
    - ../michelle_ngo_three/src/routes/work/+page.svelte (page shape — head/title/h1 + pill bar; ADAPT: grid not ReelStage)
    - src/lib/components/VideoCard.svelte (grid cell)
    - src/lib/components/FilterPillBar.svelte (from Task 1)
    - svelte.config.js (the PENDING_ROUTES allow-list to prune)
    - src/routes/+page.svelte (this repo's homepage — for the contained-section / sr-only-h1 conventions to mirror)
  </read_first>
  <action>
    1. Create src/routes/work/+page.ts:
       ```ts
       import { videos } from '$lib/data';
       import type { PageLoad } from './$types';
       // prerender + trailingSlash inherited from +layout.ts — do NOT redeclare.
       export const load: PageLoad = () => ({ videos });
       ```

    2. Create src/routes/work/+page.svelte:
       - `<svelte:head>`: `<title>Work — Michelle Ngo</title>` + a meta description
         (e.g. "Browse Michelle Ngo's filmography by category.").
       - A single `<h1 class="sr-only">Work — Filmography</h1>` (rail/card titles are
         lower-level; mirror the homepage's sr-only h1 convention).
       - Script: `let { data } = $props()`; `let selected = $state('all')`;
         `const filtered = $derived(selected === 'all' ? data.videos
            : data.videos.filter(v => categoryToSlug(v.category) === selected))`.
       - Render `<FilterPillBar active={selected} onselect={(slug) => (selected = slug)} />`.
       - Below it, a responsive grid: `<ul class="grid ...">` with Tailwind columns
         (e.g. `grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 px-[var(--page-gutter)]
         max-w-[var(--content-max)] mx-auto py-8`) and `{#each filtered as video (video.id)}
         <li><VideoCard {video} /></li>{/each}`. Choose breakpoint column counts per
         the Phase-2 aesthetic.
       - Contain it in the existing `<main>` from the layout (do NOT add a nested
         `<main>` — wrap in a `<div>`/section, mirroring the homepage).

    3. Prune svelte.config.js: remove `'/work'` from the PENDING_ROUTES Set (it is now
       a real, prerendered route). KEEP the `'/about'`, `'/press'`, `'/contact'`,
       `'/pbs-american-portrait/'` entries AND KEEP `isPendingWorkCategory`
       (`normalized.startsWith('/work/')`) — `/work/[category]` is still pending until
       Plan 03-03 ships it. Update the surrounding comment so it no longer claims /work
       is pending.
  </action>
  <acceptance_criteria>
    - `test -f src/routes/work/+page.ts` and `test -f src/routes/work/+page.svelte` succeed
    - `grep -c "FilterPillBar" src/routes/work/+page.svelte` >= 1
    - `grep -c "import VideoCard" src/routes/work/+page.svelte` >= 1
    - `grep -E "grid-cols" src/routes/work/+page.svelte` matches (responsive grid present)
    - `grep -E "\\$state|\\$derived" src/routes/work/+page.svelte` matches (client-side filter state)
    - `grep -c "'/work'" svelte.config.js` == 0 (the bare '/work' entry is removed)
    - `grep -c "startsWith('/work/')" svelte.config.js` >= 1 (work/[category] still pending — KEPT)
    - `pnpm build` exits 0 (strict prerender still green with /work now genuinely crawled)
    - `test -f build/work/index.html` succeeds
    - `grep -c "Work — Filmography" build/work/index.html` >= 1
  </acceptance_criteria>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>
    /work prerenders to build/work/index.html with the FilterPillBar above a responsive
    grid of all 56 VideoCards; clicking a category pill filters client-side via `selected`
    state, the All pill restores the full grid. `/work` is pruned from PENDING_ROUTES,
    `/work/[category]` stays pending, and strict `pnpm build` is green.
  </done>
</task>

</tasks>

<verification>
- `pnpm check` and `pnpm build` both exit 0.
- `test -f build/work/index.html` (the index prerendered now that it's removed from the allow-list).
- `grep -c "'/work'" svelte.config.js` == 0 AND `grep -c "startsWith('/work/')" svelte.config.js` >= 1.
- FilterPillBar renders 9 pills (All + 8): `grep -c "getCategoriesInDisplayOrder" src/lib/components/FilterPillBar.svelte` >= 1.
- No `motion-safe:` / `matchMedia` / `_three`-only scaffolding / AI-agent phrases in new code.
</verification>

<success_criteria>
- BRW-01: /work presents all categories (the pill bar) and all work (the grid).
- BRW-03: the pill bar switches categories (client-side filter on /work; the same
  component links on /work/[category] in Plan 03-03), active pill accent-colored.
</success_criteria>

<output>
After completion, create `.planning/phases/03-browse-and-watch/03-02-SUMMARY.md`.
</output>
