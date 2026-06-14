---
phase: 01-foundation-deploy
plan: 03
type: execute
wave: 3
depends_on: [01, 02]
files_modified:
  - src/routes/+layout.svelte
  - src/lib/components/TopNav.svelte
  - src/lib/components/MobileMenu.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/ContactBlock.svelte
autonomous: true
requirements: [FND-04]
must_haves:
  truths:
    - "The root layout renders TopNav, the page content, and Footer around every route"
    - "TopNav shows the wordmark, the 8 categories, About/Press/Contact links, and a hamburger that opens MobileMenu"
    - "Footer shows a ContactBlock, the 8 category links, and a secondary nav, all under the base path"
    - "pnpm build exits 0 with the full app shell mounted and prerenders build/index.html"
  artifacts:
    - path: "src/routes/+layout.svelte"
      provides: "app shell wiring: skip link + TopNav + main + Footer + state init"
      contains: "TopNav"
    - path: "src/lib/components/TopNav.svelte"
      provides: "sticky top nav with categories + hamburger"
      contains: "openMenu"
    - path: "src/lib/components/MobileMenu.svelte"
      provides: "full-screen mobile overlay menu"
      contains: "closeMenu"
    - path: "src/lib/components/Footer.svelte"
      provides: "3-column footer with ContactBlock + category mirror"
      contains: "ContactBlock"
    - path: "src/lib/components/ContactBlock.svelte"
      provides: "single-source-of-truth contact channels"
      contains: "mailto:"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/TopNav.svelte"
      via: "import + render TopNav above <main>"
      pattern: "import TopNav"
    - from: "src/lib/components/TopNav.svelte"
      to: "$lib/data"
      via: "getCategoriesInDisplayOrder + categoryToSlug"
      pattern: "getCategoriesInDisplayOrder"
    - from: "src/lib/components/Footer.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import + render ContactBlock"
      pattern: "import ContactBlock"
---

<objective>
Port the app-shell chrome from `_three`: the root `+layout.svelte` (skip-link + TopNav + `<main>` + Footer + state-rune init), `TopNav.svelte`, `MobileMenu.svelte`, `Footer.svelte`, and `ContactBlock.svelte`. This replaces the minimal Plan 01-01 layout with the real chrome. NO Phase-2/3 components (HeroAmbient, ReelStage, rails) — the homepage stays a placeholder.

Purpose: Satisfy FND-04 — the app shell (root layout, top navigation, mobile menu, footer).
Output: Every route renders inside the chrome; `pnpm build` stays green and prerenders the homepage with nav + footer.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation-deploy/01-CONTEXT.md
@.planning/phases/01-foundation-deploy/01-01-SUMMARY.md
@.planning/phases/01-foundation-deploy/01-02-SUMMARY.md

FORK SOURCE (read directly — port these files):
- ../michelle_ngo_three/src/routes/+layout.svelte
- ../michelle_ngo_three/src/lib/components/TopNav.svelte
- ../michelle_ngo_three/src/lib/components/MobileMenu.svelte
- ../michelle_ngo_three/src/lib/components/Footer.svelte
- ../michelle_ngo_three/src/lib/components/ContactBlock.svelte

<interfaces>
Dependencies these chrome components import (all shipped in Plan 01-02):
```typescript
// $lib/data:            base nav data — getCategoriesInDisplayOrder(), categoryToSlug(c)
// $lib/components/categoryAccent: categoryAccent(c)
// $lib/state/scrollIdle.svelte:  scrollIdle.isScrolling, initScrollIdle(t), teardownScrollIdle()
// $lib/state/menu.svelte:        menu.menuOpen, openMenu(), closeMenu()
// $lib/state/motion.svelte:      initMotionState()
// $lib/state/network.svelte:     initNetworkState()
// $lib/state/visibility.svelte:  initVisibilityListener()
// $app/paths:  base    $app/state: page
```
</interfaces>

<notes>
- TopNav and Footer link to `/work/[slug]`, `/about`, `/press`, `/contact`, `/pbs-american-portrait/` — those ROUTES do not exist yet (Phases 2-4). That is OK: these are runtime `<a href>` links, not prerender entry points. With adapter-static `strict:true`, a hardcoded internal href that points to a non-existent route would only fail the build IF the route were CRAWLED as a prerender target. Because `+layout.ts` sets `prerender = true` and SvelteKit crawls links, these links COULD trigger prerender-crawl errors. MITIGATION: set `export const prerender = true` but DO NOT rely on link-crawling for missing routes — confirm via the build. If `pnpm build` errors on a missing crawled route, add `data-sveltekit-preload-data` is not enough; instead the executor MUST either (a) point the nav hrefs that 404 to `${base}/` placeholders this phase, OR (b) keep hrefs but verify build passes because SvelteKit's crawler only errors on entries reachable from a prerendered page's hyperlinks. Prefer (b); fall back to (a) only if the build fails — document which path was taken.
- The chrome-fade logic in TopNav reads `page.route.id` against REEL_ROUTE_IDS (/work, /work/[category], /pbs-american-portrait, /press). On the placeholder homepage `page.route.id` is `/`, so chrome never fades — correct, no behavior change needed.
- Port +layout.svelte's skip-link + `<main id="main" tabindex="-1">` + the svelte:head (favicons, OG, robots noindex). Keep the `onMount` triple init (initMotionState/initNetworkState/initVisibilityListener).
- Do NOT re-import or reference HeroAmbient/ReelStage/VideoCard/PosterImage/FilterPillBar — none exist this phase.
</notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port ContactBlock + Footer</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/ContactBlock.svelte
    - ../michelle_ngo_three/src/lib/components/Footer.svelte
    - michelle_ngo_six/src/lib/data/index.ts (confirm getCategoriesInDisplayOrder + categoryToSlug exported)
  </read_first>
  <action>
    1. Copy `ContactBlock.svelte` VERBATIM to `src/lib/components/ContactBlock.svelte`. It has no props; hardcoded channels: mailto:mynogo@gmail.com, tel:+19175661976, IMDb (https://www.imdb.com/), LinkedIn (https://www.linkedin.com/), Vimeo (https://vimeo.com/user2149742). This is the single source of truth (PG-04 forward-ship; used by Footer now).
    2. Copy `Footer.svelte` VERBATIM to `src/lib/components/Footer.svelte`. It imports `base` from `$app/paths`, `getCategoriesInDisplayOrder` + `categoryToSlug` from `$lib/data`, and `ContactBlock`. 3-column grid: column 1 ContactBlock, column 2 the 8 category links (PBS retargeted to `${base}/pbs-american-portrait/`), column 3 secondary nav (About/Press/Contact/View All Work). Bottom strip "© 2026 Michelle Ngo · Built with SvelteKit".
  </action>
  <acceptance_criteria>
    - `src/lib/components/ContactBlock.svelte` contains `mailto:mynogo@gmail.com` and `vimeo.com/user2149742`.
    - `src/lib/components/Footer.svelte` contains `import ContactBlock` and `getCategoriesInDisplayOrder` and `Built with SvelteKit`.
    - Both files use `${base}` (no leading-slash absolute internal hrefs).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "mailto:mynogo@gmail.com" src/lib/components/ContactBlock.svelte && grep -q "import ContactBlock" src/lib/components/Footer.svelte && grep -q "getCategoriesInDisplayOrder" src/lib/components/Footer.svelte && echo OK</automated>
  </verify>
  <done>ContactBlock and Footer are ported and wired to the data layer; internal links use the base path.</done>
</task>

<task type="auto">
  <name>Task 2: Port TopNav + MobileMenu</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/TopNav.svelte
    - ../michelle_ngo_three/src/lib/components/MobileMenu.svelte
    - michelle_ngo_six/src/lib/state/menu.svelte.ts
    - michelle_ngo_six/src/lib/state/scrollIdle.svelte.ts
    - michelle_ngo_six/src/lib/components/categoryAccent.ts
  </read_first>
  <action>
    1. Copy `TopNav.svelte` VERBATIM to `src/lib/components/TopNav.svelte`. It imports `page` ($app/state), `base` ($app/paths), `getCategoriesInDisplayOrder` + `categoryToSlug` ($lib/data), `categoryAccent` (./categoryAccent), `scrollIdle`/`initScrollIdle`/`teardownScrollIdle` ($lib/state/scrollIdle.svelte), `menu`/`openMenu` ($lib/state/menu.svelte), and `MobileMenu` (./MobileMenu.svelte). Sticky header (h-14), wordmark, desktop category links + About/Press/Contact, hamburger button (`onclick={openMenu}`), conditional `{#if menu.menuOpen}<MobileMenu />`. Keep the chrome-fade $effect verbatim — it is dormant on `/` (page.route.id is `/`, not a reel route).
    2. Copy `MobileMenu.svelte` VERBATIM to `src/lib/components/MobileMenu.svelte`. Full-screen overlay (`role="dialog" aria-modal="true"`), category links, secondary nav, Escape-to-close $effect, `closeMenu` on link click + close button. Imports `base`, `getCategoriesInDisplayOrder`+`categoryToSlug` ($lib/data), `closeMenu` ($lib/state/menu.svelte).
    NOTE: _three disables `svelte/no-navigation-without-resolve` per-file via eslint.config.js. This phase has NO eslint installed (Plan 01 omitted it), so no lint override is needed — the hardcoded `${base}/...` hrefs are fine.
  </action>
  <acceptance_criteria>
    - `src/lib/components/TopNav.svelte` contains `openMenu`, `getCategoriesInDisplayOrder`, and `import MobileMenu`.
    - `src/lib/components/MobileMenu.svelte` contains `closeMenu`, `aria-modal="true"`, and `Escape`.
    - Neither file imports `HeroAmbient`, `ReelStage`, `VideoCard`, `PosterImage`, or `FilterPillBar`.
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "openMenu" src/lib/components/TopNav.svelte && grep -q "import MobileMenu" src/lib/components/TopNav.svelte && grep -q "aria-modal" src/lib/components/MobileMenu.svelte && ! grep -qE "HeroAmbient|ReelStage|FilterPillBar" src/lib/components/TopNav.svelte src/lib/components/MobileMenu.svelte && echo OK</automated>
  </verify>
  <done>TopNav and MobileMenu are ported and wired to the menu/scrollIdle runs and data layer; no Phase-2 component imports.</done>
</task>

<task type="auto">
  <name>Task 3: Wire the real +layout.svelte and confirm green build</name>
  <read_first>
    - ../michelle_ngo_three/src/routes/+layout.svelte
    - michelle_ngo_six/src/routes/+layout.svelte (the minimal version from Plan 01-01 — replace it)
    - michelle_ngo_six/src/routes/+layout.ts (prerender=true; trailingSlash='always')
  </read_first>
  <action>
    Replace michelle_ngo_six/src/routes/+layout.svelte with the FULL app shell ported from _three:
    1. `<script lang="ts">`: `import '../app.css'; import { base } from '$app/paths'; import { onMount } from 'svelte';` the three init helpers (`initMotionState` from $lib/state/motion.svelte, `initNetworkState` from $lib/state/network.svelte, `initVisibilityListener` from $lib/state/visibility.svelte), `import TopNav from '$lib/components/TopNav.svelte'; import Footer from '$lib/components/Footer.svelte';` and `let { children } = $props();`. In `onMount`, call all three init helpers (SSR-safe, idempotent).
    2. `<svelte:head>`: robots noindex/nofollow, `<title>Michelle Ngo</title>`, the favicon set using `{base}/favicon*`, the OG/Twitter card meta. Port verbatim from _three (the `michellengo.net{base}` og:image absolute URL is fine — harmless on staging).
    3. Body: the skip-to-content `<a href="#main" class="sr-only focus:not-sr-only ...">`, then `<TopNav />`, then `<main id="main" tabindex="-1" class="block">{@render children()}</main>`, then `<Footer />`.
    Then run `pnpm build`. If the prerender crawler errors on a missing route reachable via a nav link (e.g. /work, /about), apply the fallback from the plan notes: temporarily point ONLY the 404-ing internal hrefs to `${base}/` for this phase and document it in the summary; re-run build to green. Prefer leaving hrefs intact if the build already passes.
  </action>
  <acceptance_criteria>
    - `src/routes/+layout.svelte` contains `import TopNav`, `import Footer`, `initMotionState`, and `id="main"`.
    - `src/routes/+layout.svelte` does NOT import `HeroAmbient` or `ReelStage`.
    - `pnpm build` exits 0.
    - `build/index.html` exists AND contains the text `Michelle Ngo` (the wordmark renders server-side) AND `Built with SvelteKit` (footer prerendered).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "import TopNav" src/routes/+layout.svelte && grep -q "initMotionState" src/routes/+layout.svelte && pnpm build && test -f build/index.html && grep -q "Built with SvelteKit" build/index.html && echo SHELL_BUILD_GREEN</automated>
  </verify>
  <done>The full chrome (skip link + TopNav + main + Footer + state init) wraps every route; the prerendered homepage includes the wordmark and footer; `pnpm build` is green.</done>
</task>

</tasks>

<verification>
- All 5 chrome files present and importing the Plan 01-02 modules.
- `pnpm build` exits 0; `build/index.html` contains the wordmark and footer copy.
- No Phase-2/3 component references anywhere in the shell.
</verification>

<success_criteria>
The app shell — root layout, top navigation, mobile menu, footer — is in place and prerenders around the placeholder homepage (FND-04).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-deploy/01-03-SUMMARY.md`.
</output>
