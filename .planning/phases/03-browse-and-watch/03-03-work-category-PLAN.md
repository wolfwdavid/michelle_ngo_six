---
phase: 03-browse-and-watch
plan: 03
type: execute
wave: 3
depends_on: ["03-02"]
files_modified:
  - src/routes/work/[category]/+page.ts
  - src/routes/work/[category]/+page.svelte
  - svelte.config.js
autonomous: true
requirements: [BRW-02]
must_haves:
  truths:
    - "Opening /work/[category] for any of the 8 category slugs lists every video in that category as a VideoCard grid"
    - "Each category page shows the category title and video count, plus the FilterPillBar (link mode) with that category's pill active"
    - "An unknown category slug returns a 404"
    - "All 8 category pages prerender via entries() and strict prerender passes with the /work/ prefix removed from PENDING_ROUTES"
  artifacts:
    - path: "src/routes/work/[category]/+page.ts"
      provides: "entries() for 8 slugs + load() resolving category + its videos, 404 on unknown"
      contains: "EntryGenerator"
    - path: "src/routes/work/[category]/+page.svelte"
      provides: "Category page: title + count + FilterPillBar (link mode) + grid"
      contains: "FilterPillBar"
  key_links:
    - from: "src/routes/work/[category]/+page.ts"
      to: "getByCategory(category)"
      via: "load() narrows slug then fetches videos"
      pattern: "getByCategory"
    - from: "svelte.config.js"
      to: "PENDING_ROUTES"
      via: "isPendingWorkCategory /work/ prefix removed"
      pattern: "PENDING_ROUTES"
---

<objective>
Build the per-category browse route `/work/[category]`: `entries()` prerendering all
8 category slugs, a `load()` that resolves the category and its videos (404 on unknown
slug), and a page that lists every video in that category as a VideoCard grid with the
FilterPillBar (link mode) and a title + count header. Covers BRW-02. Finally prune the
`/work/` prefix from PENDING_ROUTES so strict prerender genuinely covers all 8 pages.

Purpose: a visitor can deep-link to any category and see exactly its videos, switching
categories via the pill bar.

Output: 8 prerendered category pages, the prerender allow-list fully cleared of /work
routes, and strict prerender green.
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
export const CATEGORIES: readonly Category[];          // the 8-item source-of-truth array
export function categoryToSlug(category: Category): string;
export function slugToCategory(slug: string): Category | undefined;  // narrow before use
export function getByCategory(category: Category): readonly Video[];
```

From @sveltejs/kit: `error(404, msg)` — returns `never`, narrows `Category | undefined` → `Category`.

From src/lib/components/FilterPillBar.svelte (built in Plan 03-02):
```
let { active = 'all', onselect } = $props();
// LINK MODE = pass `active` (the current slug) and OMIT `onselect`; pills become <a href={base}/work/{slug}>.
```

From src/lib/components/VideoCard.svelte: `let { video, eager=false } = $props()`.

svelte.config.js (the line to remove this plan):
```js
const isPendingWorkCategory = normalized.startsWith('/work/');  // REMOVE — /work/[category] now real
// ...and drop isPendingWorkCategory from the final `if (... )` condition.
```
NOTE: by this plan, the bare `'/work'` entry was already removed in Plan 03-02. Only `'/about'`, `'/press'`, `'/contact'`, `'/pbs-american-portrait/'` should remain in PENDING_ROUTES.
</interfaces>

<!-- Fork references — proven mechanics to ADAPT (grid not ReelStage): -->
@../michelle_ngo_three/src/routes/work/[category]/+page.ts
@../michelle_ngo_three/src/routes/work/[category]/+page.svelte
</context>

<constraints>
- NO test harness. Verify ONLY with `pnpm check`, `pnpm build` (exit 0), grep, find, test -f. Do NOT add vitest, a test script, or a `check:paths`/no-absolute-paths script.
- `prerender = true` and `trailingSlash = 'always'` are INHERITED from src/routes/+layout.ts — do NOT redeclare them in this route's +page.ts (matches the existing watch/[id]/+page.ts and homepage convention).
- `entries()` is MANDATORY under adapter-static `strict: true` for this dynamic route — without it the 8 pages won't prerender. Mirror the watch/[id] entries() pattern but over CATEGORIES → slugs.
- Reuse FilterPillBar in LINK mode (omit `onselect`); do NOT duplicate pill markup here.
- Use the same responsive grid + VideoCard pattern as the /work index (Plan 03-02) for visual consistency. Match the Phase-2 aesthetic (dark, cinematic).
- Base-path safety: all hrefs use `${base}`. trailingSlash='always'.
- NO `motion-safe:`/`matchMedia`; NO planning-phase phrases or assistant/agent names in code or comments (CLAUDE.md, strict).
</constraints>

<tasks>

<task type="auto">
  <name>Task 1: Create /work/[category]/+page.ts — entries() for 8 slugs + load() with 404</name>
  <files>src/routes/work/[category]/+page.ts</files>
  <read_first>
    - ../michelle_ngo_three/src/routes/work/[category]/+page.ts (the proven entries()/load()/404 pattern to adapt)
    - src/routes/watch/[id]/+page.ts (this repo's entries() convention — prerender inherited, EntryGenerator import)
    - src/lib/data/categories.ts (CATEGORIES, categoryToSlug, slugToCategory)
    - src/lib/data/videos.ts (getByCategory)
  </read_first>
  <action>
    Create src/routes/work/[category]/+page.ts adapted from `_three`:
    ```ts
    import { error } from '@sveltejs/kit';
    import type { EntryGenerator, PageLoad } from './$types';
    import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data';

    // entries(): mandatory under adapter-static strict — one prerendered page per
    // category slug (8 total → build/work/<slug>/index.html).
    export const entries: EntryGenerator = () =>
      CATEGORIES.map((c) => ({ category: categoryToSlug(c) }));

    // prerender + trailingSlash inherited from +layout.ts — do NOT redeclare.
    export const load: PageLoad = ({ params }) => {
      const category = slugToCategory(params.category);
      if (!category) error(404, 'Category not found');
      const videos = [...getByCategory(category)].toSorted((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.published.localeCompare(a.published);
      });
      return { category, slug: params.category, videos };
    };
    ```
    Keep the featured-first then published-desc sort (matches `_three`). Return `slug`
    too so the page can pass it to FilterPillBar's `active` prop without recomputing.
    Strip `_three`'s vitest-rejection `async` comment unless you keep `async` — either
    sync or async is fine here; do not add test-runner commentary.
  </action>
  <acceptance_criteria>
    - `test -f src/routes/work/[category]/+page.ts` succeeds
    - `grep -c "EntryGenerator" src/routes/work/[category]/+page.ts` >= 1
    - `grep -c "CATEGORIES.map" src/routes/work/[category]/+page.ts` >= 1 (8 entries from source of truth)
    - `grep -c "slugToCategory" src/routes/work/[category]/+page.ts` >= 1
    - `grep -c "error(404" src/routes/work/[category]/+page.ts` >= 1 (unknown slug 404s)
    - `grep -c "export const prerender" src/routes/work/[category]/+page.ts` == 0 (inherited, not redeclared)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <done>
    The route's load module enumerates all 8 category slugs via entries(), resolves the
    category + sorted videos in load(), 404s on unknown slugs, and does not redeclare
    prerender. `pnpm check` clean.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create /work/[category]/+page.svelte (title + count + FilterPillBar link mode + grid) and prune /work/ from PENDING_ROUTES</name>
  <files>src/routes/work/[category]/+page.svelte, svelte.config.js</files>
  <read_first>
    - ../michelle_ngo_three/src/routes/work/[category]/+page.svelte (page shape — title/meta/h1; ADAPT: grid not ReelStage)
    - src/routes/work/+page.svelte (this repo's /work index from Plan 03-02 — reuse its grid classes + VideoCard import for consistency)
    - src/lib/components/FilterPillBar.svelte (link mode — pass active, omit onselect)
    - svelte.config.js (the isPendingWorkCategory /work/ prefix to remove)
  </read_first>
  <action>
    1. Create src/routes/work/[category]/+page.svelte:
       - `let { data } = $props()` → `data.category`, `data.slug`, `data.videos`.
       - `<svelte:head>`: `<title>{data.category} — Michelle Ngo</title>` +
         `<meta name="description" content={`${data.videos.length} videos by Michelle Ngo in ${data.category}.`} />`.
       - A single `<h1 class="sr-only">{data.category} — Filmography</h1>` (sr-only,
         matching the /work index convention).
       - `<FilterPillBar active={data.slug} />` (LINK mode — no `onselect`, so pills
         are `<a>` and the current category's pill is active).
       - A VISIBLE header showing the category title + count, e.g.
         `<h2 class="font-display ...">{data.category}</h2>
          <p class="...">{data.videos.length} videos</p>` inside the contained wrapper.
       - The SAME responsive grid as /work index: `<ul class="grid grid-cols-2 gap-4
         sm:grid-cols-3 lg:grid-cols-4 max-w-[var(--content-max)] mx-auto
         px-[var(--page-gutter)] py-8">` with
         `{#each data.videos as video (video.id)}<li><VideoCard {video} /></li>{/each}`.
       - Wrap in a `<div>`/section, not a nested `<main>` (the layout owns `<main>`).

    2. Prune svelte.config.js: remove the `isPendingWorkCategory` line
       (`const isPendingWorkCategory = normalized.startsWith('/work/');`) AND remove
       `isPendingWorkCategory` from the `if (status === 404 && (... || isPendingWorkCategory))`
       condition. After this, PENDING_ROUTES contains ONLY `'/about'`, `'/press'`,
       `'/contact'`, `'/pbs-american-portrait/'` and no /work* path is allow-listed —
       every /work and /work/[category] 404 would now be a genuine build failure.
       Update the surrounding comment to drop the /work/[category] "pending" claim.
  </action>
  <acceptance_criteria>
    - `test -f src/routes/work/[category]/+page.svelte` succeeds
    - `grep -c "FilterPillBar" src/routes/work/[category]/+page.svelte` >= 1
    - `grep -E "active=\\{data.slug\\}|active=" src/routes/work/[category]/+page.svelte` matches (link-mode active pill)
    - `grep -c "onselect" src/routes/work/[category]/+page.svelte` == 0 (link mode — no filter callback)
    - `grep -c "import VideoCard" src/routes/work/[category]/+page.svelte` >= 1
    - `grep -E "grid-cols" src/routes/work/[category]/+page.svelte` matches
    - `grep -c "startsWith('/work/')" svelte.config.js` == 0 (work-category prefix pruned)
    - `grep -c "isPendingWorkCategory" svelte.config.js` == 0 (variable and its use removed)
    - `pnpm build` exits 0 (strict prerender green with NO /work* in the allow-list)
    - `find build/work -name index.html | wc -l` == 9 (the /work index + 8 categories)
    - one sample category page present, e.g. `test -f build/work/branded-content/index.html` succeeds
  </acceptance_criteria>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>
    Each of the 8 category pages prerenders to build/work/<slug>/index.html showing the
    category title + count, the FilterPillBar (link mode, current pill active), and a
    grid of that category's VideoCards. The /work/ prefix is removed from PENDING_ROUTES;
    `find build/work -name index.html | wc -l` == 9 and strict `pnpm build` is green.
  </done>
</task>

</tasks>

<verification>
- `pnpm check` and `pnpm build` both exit 0.
- `find build/work -name index.html | wc -l` == 9 (/work + 8 categories).
- `test -f build/work/branded-content/index.html` (a known category slug) succeeds.
- `grep -c "isPendingWorkCategory" svelte.config.js` == 0 and `grep -c "'/work'" svelte.config.js` == 0
  (PENDING_ROUTES holds only /about, /press, /contact, /pbs-american-portrait/).
- An unknown slug is NOT in entries() so it is never prerendered (404 contract holds);
  no `/work/*` path remains allow-listed, so any future broken /work link fails the build.
- No `motion-safe:`/`matchMedia`/AI-agent phrases in new code.
</verification>

<success_criteria>
- BRW-02: /work/[category] lists every video in that category (8 prerendered pages,
  entries() over the 8 slugs), with title + count and the switchable FilterPillBar.
- Phase prerender integrity: all /work routes are genuinely crawled by strict
  adapter-static — nothing /work-related remains in the prerender allow-list.
</success_criteria>

<output>
After completion, create `.planning/phases/03-browse-and-watch/03-03-SUMMARY.md`.
</output>
