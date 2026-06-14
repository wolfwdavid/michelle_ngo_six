---
phase: 02-homepage-rails
plan: 04
type: execute
wave: 3
depends_on: ["02-02", "02-03"]
files_modified:
  - src/routes/+page.svelte
  - src/routes/watch/[id]/+page.ts
  - src/routes/watch/[id]/+page.svelte
  - svelte.config.js
autonomous: true
requirements: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05]
must_haves:
  truths:
    - "The homepage shows the HeroCarousel at the top, then one CategoryRail per category in display order, then the footer."
    - "Activating any card or hero slide navigates to /watch/{id} and that route resolves (no 404) for all 56 video ids."
    - "The whole page has exactly one <h1> and uses the existing app shell (nav/footer)."
    - "pnpm build prerenders all routes (homepage + 56 watch pages) with zero errors."
    - "With prefers-reduced-motion, the assembled page has no auto-advancing hero and no card tilt — and is still fully navigable."
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "Homepage: HeroCarousel + CategoryRail stack in display order"
      contains: "CategoryRail"
    - path: "src/routes/watch/[id]/+page.svelte"
      provides: "Minimal watch placeholder (title/category) so HOME-04 links resolve; Phase 3 replaces with the player"
      contains: "video.title"
    - path: "src/routes/watch/[id]/+page.ts"
      provides: "prerender entries() for all video ids"
      contains: "entries"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/HeroCarousel.svelte"
      via: "import + render at top"
      pattern: "HeroCarousel"
    - from: "src/routes/+page.svelte"
      to: "getCategoriesInDisplayOrder()"
      via: "loop one CategoryRail per category"
      pattern: "getCategoriesInDisplayOrder"
    - from: "src/routes/watch/[id]/+page.ts"
      to: "videos"
      via: "entries() maps every video id to a prerendered route"
      pattern: "entries"
---

<objective>
Assemble the homepage (`HeroCarousel` + a `CategoryRail` per category in display order) on the existing app shell, and add a MINIMAL `/watch/[id]` placeholder route so the card/hero links resolve for live visitors between phases (Phase 3 replaces it with the full player). Prune the now-real `/watch` route from the prerender allow-list and keep `pnpm build` green by prerendering all 56 watch pages via `entries()`.

Purpose: Delivers all five HOME requirements end-to-end and keeps the static build green.
Output: rebuilt `src/routes/+page.svelte`; `src/routes/watch/[id]/+page.ts` + `+page.svelte` stub; `svelte.config.js` allow-list note.

NOTE — verification model for THIS repo: there is NO test runner (this project intentionally stripped _three's vitest/CI harness — see 02-CONTEXT). The ONLY gates are `pnpm check` (svelte-check), `pnpm build` (must exit 0 with strict adapter-static), `test -f`/`find` over the BUILD OUTPUT, and grep over source/build. Do NOT add vitest or a `test` script, and do NOT reference any `pnpm test` / `check:paths` / `test:*` script — none exist in package.json.
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
From Plan 02-02: `<CategoryRail {category} eagerFirstCards={i === 0} />` — props `{ category: Category; eagerFirstCards?: boolean }`; renders nothing for empty categories.
From Plan 02-03: `<HeroCarousel />` — no props; self-sources reel + getHeroSlides; LCP-safe.
From src/lib/data/index.ts:
```typescript
export function getCategoriesInDisplayOrder(): readonly Category[];
export const videos: readonly Video[];   // 56 public videos (hidden filtered out)
export function getById(id: string): Video | undefined;
export function categoryToSlug(category: Category): string;
export type Video; export type Category;
```
SvelteKit prerender: `src/routes/+layout.ts` already sets `export const prerender = true; export const trailingSlash = 'always';` — child routes inherit. A dynamic `[id]` route needs a `+page.ts` exporting `entries()` so the crawler-independent prerenderer enumerates all ids. Because `trailingSlash = 'always'`, each prerendered page is written as `build/watch/{id}/index.html` (a directory per id).
`import { base } from '$app/paths';`
</interfaces>

<current_state>
- `src/routes/+page.svelte` is the placeholder ("Site coming soon.") to be REPLACED.
- `svelte.config.js` prerender `handleHttpError` allow-list (PENDING_ROUTES) currently does NOT contain `/watch`. It allows `/work`, `/about`, `/press`, `/contact`, `/pbs-american-portrait/`, and `/work/*`. Adding a real `/watch/[id]` route means `/watch/{id}` links now resolve to a real prerendered page, so nothing needs to be ADDED for /watch; just confirm no allow-list entry references /watch (none does) and leave the rest intact.
- package.json has ONLY `dev`, `build`, `preview`, `check` scripts. There is NO `test` and NO path-lint/`check:paths` script. Absolute-path safety is enforced structurally by every link/poster being built with `${base}` (the repo convention) — verify it by grepping the BUILD OUTPUT, not by running a script.
</current_state>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add the minimal /watch/[id] placeholder route that prerenders all 56 ids</name>
  <read_first>
    - src/routes/+layout.ts (inherited prerender=true + trailingSlash='always' — the new route inherits both; output is build/watch/{id}/index.html)
    - svelte.config.js (the strict prerender adapter + handleHttpError allow-list; confirm strict:true and that /watch is NOT in PENDING_ROUTES)
    - src/lib/data/index.ts (videos array + getById + categoryToSlug + types)
    - src/routes/+page.svelte (existing placeholder styling idiom: bg-neutral-950, font-display, neutral text — match it for the stub)
    - .planning/phases/02-homepage-rails/02-CONTEXT.md § Navigation/linking (HOME-04 stub decision) and 02-UI-SPEC.md AC #13 (links must resolve, build green)
  </read_first>
  <action>
    Create `src/routes/watch/[id]/+page.ts`:
    - `export const prerender = true;` (explicit, though inherited).
    - `export function entries() { return videos.map((v) => ({ id: v.id })); }` importing `{ videos } from '$lib/data'` — this enumerates all 56 ids so adapter-static prerenders `/watch/{id}/` for every video WITHOUT relying on crawl from the homepage.
    - A `load` that resolves the video: `export const load = ({ params }) => { const video = getById(params.id); if (!video) throw error(404, 'Video not found'); return { video }; };` (import `error` from `@sveltejs/kit`, `getById` from `$lib/data`). Type the file with the generated `./$types` (`PageLoad`, `EntryGenerator`) as the rest of the codebase does.

    Create `src/routes/watch/[id]/+page.svelte` — a MINIMAL placeholder (Phase 3 replaces it with the full Vimeo/YouTube player + metadata + related rail). Use `let { data } = $props();` and render on the dark shell:
    - Exactly one `<h1>` = `{data.video.title}` (`font-display`, `text-neutral-50`).
    - A category line = `{data.video.category}` (neutral-300) — optionally accent via categoryAccent if trivial, but neutral is fine for a stub.
    - A small note: e.g. `<p>` "Full player coming soon." (neutral-500) — this is a deliberate placeholder; keep it short. (No iframe yet — Phase 3 owns WCH-01.)
    - A back link `<a href={`${base}/`}>← Back to home</a>` (use `${base}` — every link/asset path in this repo is base-prefixed).
    Match the existing placeholder's Tailwind idiom (centered, `min-h-svh`, `bg-neutral-950`, `px-6`). Do NOT add an iframe, `<canvas>`, or WebGL. Do NOT mention AI assistants.

    Then OPEN `svelte.config.js` and confirm the prerender allow-list does NOT need a `/watch` entry (the route is now real). Leave the existing PENDING_ROUTES intact. If a comment in svelte.config.js implies /watch is forward-pending, update that comment to note `/watch/[id]` now ships as a Phase-2 stub (Phase 3 swaps in the player). Do not weaken `strict: true`.
  </action>
  <acceptance_criteria>
    - `src/routes/watch/[id]/+page.ts` exists; `grep -F "entries" src/routes/watch/[id]/+page.ts` matches AND `grep -F "videos.map" src/routes/watch/[id]/+page.ts` matches.
    - `grep -F "prerender = true" src/routes/watch/[id]/+page.ts` matches.
    - `grep -F "error(404" src/routes/watch/[id]/+page.ts` matches (unknown id 404s).
    - `src/routes/watch/[id]/+page.svelte` exists; `grep -F "data.video.title" src/routes/watch/[id]/+page.svelte` matches AND it contains exactly one `<h1` (`grep -c "<h1" src/routes/watch/[id]/+page.svelte` returns 1).
    - `grep -c "iframe" src/routes/watch/[id]/+page.svelte` returns 0 AND `grep -c "canvas" src/routes/watch/[id]/+page.svelte` returns 0.
    - `grep -F "strict: true" svelte.config.js` still matches (gate not weakened).
    - `pnpm check` reports no errors for the watch route.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && grep -F "videos.map" "src/routes/watch/[id]/+page.ts" && grep -F "error(404" "src/routes/watch/[id]/+page.ts" && [ "$(grep -c '<h1' 'src/routes/watch/[id]/+page.svelte')" = "1" ] && grep -F "strict: true" svelte.config.js && pnpm check</automated>
  </verify>
  <done>A minimal /watch/[id] route exists, enumerates all 56 ids via entries(), 404s unknown ids, renders title+category+back-link with one h1 and no iframe/canvas; strict prerender preserved; pnpm check clean.</done>
</task>

<task type="auto">
  <name>Task 2: Replace +page.svelte with HeroCarousel + CategoryRail stack (display order)</name>
  <read_first>
    - src/routes/+page.svelte (the placeholder being replaced — keep its bg-neutral-950 / font idiom; note <main> wrapper)
    - src/lib/components/HeroCarousel.svelte (Plan 02-03 contract — <HeroCarousel />, no props, full-bleed)
    - src/lib/components/CategoryRail.svelte (Plan 02-02 contract — <CategoryRail {category} eagerFirstCards />, omits empty cats, contained width)
    - src/lib/data/index.ts (getCategoriesInDisplayOrder — count desc, ties alpha)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Layout & Structure (lines ~96-119) — section semantics, spacing (hero->first rail 48px, between rails 32px, last rail->footer 64px), full-bleed hero + contained rails
  </read_first>
  <action>
    Replace `src/routes/+page.svelte` entirely. Structure per UI-SPEC § Layout & Structure:
    - `<main class="bg-neutral-950">` (dark canvas; the app shell from Phase 1 provides nav/footer around it).
    - Hero: `<HeroCarousel />` rendered FULL-BLEED at the very top (edge-to-edge — do NOT wrap it in the contained gutter; the component owns its full-bleed width).
    - Rail stack: `<section aria-label="Browse by category" class="...">` with top spacing 48px from the hero (`pt-12` = 48px / map xl-2xl per spec) and bottom padding 64px before the footer (`pb-16`). Inside, loop `getCategoriesInDisplayOrder()` rendering one `<CategoryRail category={cat} eagerFirstCards={i === 0} />` per category, with 32px vertical gap between rails (`space-y-8` = 32px, or `mt-8` on each after the first). Pass `eagerFirstCards` true ONLY for the first rail (i === 0) so only its first ~4 posters are eager-ish — every other poster stays lazy (LCP: only the active hero poster is eager+high).
    - Page semantics: HeroCarousel already supplies `<section aria-label="Featured work">` and the page's only `<h1>` must live... NOTE: HeroCarousel uses `<h2>` for slide titles (per Plan 02-03), and CategoryRail uses `<h2>` headings. So the HOMEPAGE needs exactly one `<h1>`. Add a visually-hidden `<h1 class="sr-only">Michelle Ngo — Film & Video Portfolio</h1>` (or similar) at the top of `<main>` so the page has a single, screen-reader-available top-level heading without competing with the cinematic hero. (Confirm `sr-only` exists in app.css/Tailwind; Tailwind v4 ships it.)
    - LCP preload: optionally add the hero active-poster `<link rel="preload" as="image">` in `<svelte:head>` only if it is straightforward to compute the slide-0 poster path here; otherwise rely on the component's `fetchpriority="high"` (already sufficient). Do not over-engineer.
    - Do NOT mention AI assistants. No `<canvas>`/WebGL. No raw hex / `rgb(` colors — use tokens/utilities only.
  </action>
  <acceptance_criteria>
    - `grep -F "HeroCarousel" src/routes/+page.svelte` matches AND `grep -F "CategoryRail" src/routes/+page.svelte` matches.
    - `grep -F "getCategoriesInDisplayOrder" src/routes/+page.svelte` matches.
    - `grep -F "eagerFirstCards" src/routes/+page.svelte` matches AND the page passes it conditionally (`grep -E "i === 0|i == 0|index === 0" src/routes/+page.svelte` matches).
    - `grep -c "<h1" src/routes/+page.svelte` returns exactly 1.
    - `grep -F 'aria-label="Browse by category"' src/routes/+page.svelte` matches.
    - `grep -rE "#[0-9a-fA-F]{3,6}|rgb\(" src/routes/+page.svelte` returns NO matches.
    - `grep -c "canvas" src/routes/+page.svelte` returns 0.
    - The old placeholder copy is gone: `grep -c "Site coming soon" src/routes/+page.svelte` returns 0.
    - `pnpm check` reports no errors.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && grep -F "HeroCarousel" src/routes/+page.svelte && grep -F "getCategoriesInDisplayOrder" src/routes/+page.svelte && [ "$(grep -c '<h1' src/routes/+page.svelte)" = "1" ] && [ "$(grep -c 'Site coming soon' src/routes/+page.svelte)" = "0" ] && pnpm check</automated>
  </verify>
  <done>The homepage renders the full-bleed HeroCarousel then one CategoryRail per category in display order on the dark shell, with exactly one (sr-only) h1, correct section semantics and spacing, the first rail eager, and no placeholder copy / hex colors / canvas; pnpm check clean.</done>
</task>

<task type="auto">
  <name>Task 3: Green build + base-prefixed-paths + reduced-motion verification gate</name>
  <read_first>
    - svelte.config.js (strict prerender + adapter-static config — the build must enumerate homepage + 56 watch pages with zero unexpected 404s)
    - src/routes/watch/[id]/+page.ts (entries() must produce all ids — confirm before building)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Acceptance Criteria (the grep-able list — this task is the build/perf + motion gate, AC #13/#14 + reduced-motion #12)
  </read_first>
  <action>
    Run the full static build and fix anything that breaks until it is green. There is NO `pnpm test` in this repo — the gates are `pnpm build`, `pnpm check`, and grep/find over the build output. Specifically:
    - `pnpm build` MUST exit 0 with adapter-static `strict: true`. It must prerender the homepage AND `/watch/{id}/` for all 56 ids (from entries()). If the crawler reports an unexpected 404, trace it (most likely a card/hero href shape mismatch vs the route) and fix the LINK, not the gate. Do NOT add `/watch` to the allow-list — the route is real; a 404 there means a genuine bug.
    - `pnpm check` MUST report no errors (svelte-check over the whole project).
    - Confirm the build output contains a prerendered watch page for the producer reel id: after build, `build/watch/264677021/index.html` should exist.
    - Count check (resilient under `trailingSlash='always'`, which writes one directory + index.html per id): `find build/watch -name index.html | wc -l` MUST equal 56 (one prerendered page per public video). Do NOT use `ls build/watch | wc -l` (brittle — it would also count any stray non-id entries and is sensitive to trailing-slash layout).
    - Base-prefixed-paths gate (replaces the non-existent path-lint script): assert the prerendered HTML uses NO root-absolute asset/link paths (all are base-prefixed via `${base}`). Run an INLINE check over the built homepage, allowing only the in-page `#main` skip-link fragment:
      `! grep -rEq 'src="/[^"]|href="/[^"#]' build/index.html`
      This must return success (exit 0 = no root-absolute `src="/..."` or `href="/..."` matches; the `#`-fragment skip link is excluded by the `[^"#]` class). If it fails, fix the offending link/poster to use `${base}` — do NOT relax the check.
    - Reduced-motion gate: this repo has no test harness, so HOME-05 is evidenced structurally — confirm by grep that the motion gating is rune-bound (not media-query/`motion-safe:`) in both the hero and the card:
      `grep -F "motion-ok" src/lib/components/HeroCarousel.svelte && grep -F "motion-ok" src/lib/components/VideoCard.svelte`
      and that neither component uses `motion-safe:` (`grep -c "motion-safe:" src/lib/components/HeroCarousel.svelte` and `... VideoCard.svelte` both return 0).
      Record in the SUMMARY that HOME-05 evidence = the `motion-ok` rune-bound gating in HeroCarousel + VideoCard plus the global reduced-motion backstop in app.css (no auto-advance, no tilt/scale, instant crossfade).
  </action>
  <acceptance_criteria>
    - `pnpm build` exits 0 (no unexpected prerender 404s; strict adapter-static).
    - `pnpm check` exits 0.
    - After build, `test -f build/watch/264677021/index.html` succeeds (reel watch page prerendered).
    - After build, `find build/watch -name index.html | wc -l` returns 56 (one prerendered page per public video id; resilient to trailingSlash).
    - The base-prefixed-paths inline check passes: `! grep -rEq 'src="/[^"]|href="/[^"#]' build/index.html` returns success (no root-absolute asset/link paths; `#main` skip-link allowed).
    - Reduced-motion is rune-bound: `grep -F "motion-ok" src/lib/components/HeroCarousel.svelte` and `grep -F "motion-ok" src/lib/components/VideoCard.svelte` both match, and `grep -c "motion-safe:"` is 0 in both.
    - `grep -rE "#[0-9a-fA-F]{3,6}|rgb\(" src/routes/+page.svelte src/lib/components/VideoCard.svelte` returns NO matches (UI-SPEC AC #1).
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm check && pnpm build && test -f build/watch/264677021/index.html && [ "$(find build/watch -name index.html | wc -l)" = "56" ] && ! grep -rEq 'src="/[^"]|href="/[^"#]' build/index.html && grep -F "motion-ok" src/lib/components/HeroCarousel.svelte && grep -F "motion-ok" src/lib/components/VideoCard.svelte</automated>
  </verify>
  <done>pnpm build is green and prerenders the homepage + all 56 watch stubs (reel page present, counted via find); pnpm check is green; the base-prefixed-paths inline check over build/index.html passes; reduced-motion is evidenced structurally by the motion-ok rune-bound gating in HeroCarousel + VideoCard.</done>
</task>

</tasks>

<verification>
- `pnpm check` exits 0 and `pnpm build` exits 0 with strict adapter-static; `build/watch/{id}/index.html` exists for all 56 ids (`find build/watch -name index.html | wc -l` == 56).
- Homepage = full-bleed HeroCarousel + CategoryRail-per-category (display order) on the app shell, exactly one h1.
- Every card/hero link resolves to a real /watch/[id] page (no 404, no allow-list workaround).
- No root-absolute asset/link paths in the prerendered homepage (all base-prefixed); `#main` skip-link allowed.
- Reduced-motion: no hero auto-advance, no card tilt — evidenced by the rune-bound `motion-ok` gating; page still fully navigable.
- No raw hex/rgb colors, no <canvas>/WebGL, no AI-assistant mentions.
</verification>

<success_criteria>
- A live visitor lands on the homepage, sees the cinematic featured hero, scrolls labeled category rails, and clicking any card opens a (placeholder) watch page that resolves.
- All five HOME requirements (HOME-01..05) are demonstrable; `pnpm check` + `pnpm build` green; build output passes the find-count + base-path gates.
</success_criteria>

<output>
After completion, create `.planning/phases/02-homepage-rails/02-04-SUMMARY.md` documenting: the chosen HOME-04 stub approach (real /watch/[id] route with entries() — NOT an allow-list workaround), the homepage section/spacing structure, the single-h1 decision, the verification model (pnpm check/build + find-count + base-path grep, NO test runner), and the reduced-motion evidence (the `motion-ok` rune-bound gating in HeroCarousel + VideoCard proving HOME-05). Flag for Phase 3 that it must REPLACE src/routes/watch/[id]/+page.svelte with the full player (keep the +page.ts entries()).
</output>
</content>
