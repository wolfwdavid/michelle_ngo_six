---
phase: 04-content-pages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/about/+page.svelte
  - src/routes/contact/+page.svelte
  - src/routes/press/+page.svelte
  - src/routes/press/+page.ts
  - src/routes/press/_pressCredits.ts
  - svelte.config.js
autonomous: true
requirements: [PG-01, PG-02, PG-03, PG-04]

must_haves:
  truths:
    - "Visiting /about renders Michelle's approved bio (verbatim) and the shared ContactBlock as a CTA"
    - "Visiting /contact renders all contact methods via the shared ContactBlock (email, phone, Vimeo, LinkedIn, IMDb)"
    - "Visiting /press renders broadcast credits (one section per credit) sourced from videos.json"
    - "Contact details (email/phone/social URLs) live ONLY in ContactBlock.svelte — never duplicated into the new page files"
    - "pnpm build is strict-green with about/contact/press prerendered (no PENDING_ROUTES escape hatch for them)"
  artifacts:
    - path: "src/routes/about/+page.svelte"
      provides: "Approved bio + ContactBlock CTA"
      contains: "ContactBlock"
    - path: "src/routes/contact/+page.svelte"
      provides: "Contact splash rendering ContactBlock"
      contains: "ContactBlock"
    - path: "src/routes/press/_pressCredits.ts"
      provides: "PRESTIGE_ORDER + getPressCredits() flat-array deriver"
      exports: ["getPressCredits", "PressCredit"]
    - path: "src/routes/press/+page.ts"
      provides: "load() returning credits"
      exports: ["load"]
    - path: "src/routes/press/+page.svelte"
      provides: "Per-credit scroll-snap sections"
      contains: "data.credits"
  key_links:
    - from: "src/routes/about/+page.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import ContactBlock + render <ContactBlock />"
      pattern: "import ContactBlock.*ContactBlock"
    - from: "src/routes/contact/+page.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import ContactBlock + render <ContactBlock />"
      pattern: "import ContactBlock.*ContactBlock"
    - from: "src/routes/press/+page.ts"
      to: "src/routes/press/_pressCredits.ts"
      via: "import getPressCredits"
      pattern: "getPressCredits"
    - from: "svelte.config.js"
      to: "PENDING_ROUTES"
      via: "remove /about, /press, /contact entries; keep /pbs-american-portrait/"
      pattern: "pbs-american-portrait"
---

<objective>
Ship the three supporting content pages — `/about`, `/contact`, `/press` — on the established `_six` design system, porting Michelle's APPROVED content VERBATIM from the `_three` fork. About and Contact both render the SAME existing `ContactBlock.svelte` (the single source of truth for contact details); the new page files MUST NOT hardcode any email/phone/social string. Press ports the `_pressCredits.ts` data deriver + `+page.ts` + `+page.svelte`. Finally, prune `/about`, `/press`, `/contact` from `svelte.config.js` PENDING_ROUTES so strict prerender genuinely covers them, keeping `/pbs-american-portrait/` (out of v1 scope).

Purpose: Satisfies PG-01..PG-04 — the supporting content pages are live and contact info has one source of truth.
Output: 5 route files created + svelte.config.js edited; strict-green build with build/about/, build/contact/, build/press/ prerendered.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-content-pages/04-CONTEXT.md

<repo_facts>
CRITICAL constraints for this repo (verified by inspection, not assumed):

1. NO test harness. `package.json` scripts are only `dev`, `build` (`vite build`), `preview`, `check` (`svelte-kit sync && svelte-check`). There is NO `test` script, NO vitest, NO eslint config file. Verify ONLY with `pnpm check`, `pnpm build`, `grep`, `find`, `test -f`. Do NOT port `_three`'s `*.test.ts` files. Do NOT add a test script.

2. `_six` has NO `HeroAmbient` component (only HeroCarousel). `_three`'s /about uses HeroAmbient — you CANNOT port that wrapper verbatim. Port the bio TEXT + ContactBlock verbatim; adapt the page shell to `_six` primitives (the producer-reel poster pattern, same as /contact below). The verbatim parts are: the bio paragraph and the `<ContactBlock />`.

3. `_six` has NO eslint config, so `_three`'s `eslint-disable svelte/no-navigation-without-resolve` and `eslint-disable-next-line svelte/no-at-html-tags` comments are unnecessary — strip them when porting.

4. NO AI-assistant or planning-process phrases in code or comments. Strip `_three`'s "Phase 6 Plan 06-0X", "D-09", "06-03-PLAN.md", "_four", decision-ID and planning-workflow references from ported comments. Keep only plain, behavior-describing comments.

5. Motion: NEVER use Tailwind `motion-safe:` variants or `matchMedia`. `_three`'s /press CTA has `motion-safe:transition-colors duration-200` — remove the `motion-safe:` (and the transition, since hover color change is fine instantly) OR gate via the motion rune. Cleanest: drop `motion-safe:transition-colors duration-200` so the class is just the hover color swap. No motion is required on these pages this phase (polish is Phase 5).

6. Contact single-source-of-truth (PG-04): ContactBlock.svelte already holds the literal email/phone/social URLs and is already used in Footer. About + Contact render the SAME component. Do NOT paste `mynogo@gmail.com`, `+19175661976`, `vimeo.com/user2149742`, etc. into the new page files. (The /contact page MAY reference `producerReelId` for the poster background — that is a video id, not a contact string, and is allowed.)
</repo_facts>

<existing_data_surface>
Available `_six` exports the ported pages depend on (all confirmed present):

From `$lib/data` (src/lib/data/index.ts):
```typescript
export const producerReelId = '264677021';
export function getById(id: string): Video | undefined;
export type Video; // { source, id, title, uploader, published, category, ... }
```

From `$lib/data/posters` (src/lib/data/posters.ts):
```typescript
export function getPosterFor(video: Pick<Video,'source'|'id'>): string; // returns "/posters/<source>-<id>.jpg"
```

From `$app/paths`:
```typescript
export const base: string; // '' locally, '/michelle_ngo_six' on Pages
```

Shared component:
```
src/lib/components/ContactBlock.svelte  // no props; renders the 5-link vertical contact list
```

Motion rune (only if a transition is genuinely needed):
```typescript
import { motion } from '$lib/state/motion.svelte';
// motion.prefersReducedMotion  ->  bind class:motion-ok={!motion.prefersReducedMotion}
```

Layout already sets `prerender = true` and `trailingSlash = 'always'` (src/routes/+layout.ts) — child routes inherit it. The layout already renders `<main>` and the site-wide `<Footer />` (which contains ContactBlock). Page files render a `<section>`, NOT a nested `<main>`.
</existing_data_surface>

<three_source_paths>
Port FROM (read these exact files):
- C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three\src\routes\about\+page.svelte  (bio text + ContactBlock — verbatim bio)
- C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three\src\routes\contact\+page.svelte
- C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three\src\routes\press\+page.svelte
- C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three\src\routes\press\_pressCredits.ts
- C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three\src\routes\press\+page.ts

The APPROVED bio paragraph to port verbatim (straight apostrophes, em-dash —) is:
"I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News, and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject matter is human — real people telling true stories about how they live, what they make, and why it matters. If you have a project that needs a steady hand and a quick turn, get in touch."
</three_source_paths>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port /press route (data deriver + load + page), verbatim</name>
  <files>src/routes/press/_pressCredits.ts, src/routes/press/+page.ts, src/routes/press/+page.svelte</files>
  <read_first>
    - src/routes/press/_pressCredits.ts (target — does not exist yet, create it)
    - src/routes/press/+page.ts (target — create)
    - src/routes/press/+page.svelte (target — create)
    - C:\...\michelle_ngo_three\src\routes\press\_pressCredits.ts (source — port verbatim)
    - C:\...\michelle_ngo_three\src\routes\press\+page.ts (source — port verbatim)
    - C:\...\michelle_ngo_three\src\routes\press\+page.svelte (source — port, scrub comments + motion-safe)
    - src/lib/data/index.ts and src/lib/data/posters.ts (confirm `videos`, `Video`, `getPosterFor` import paths)
  </read_first>
  <action>
    Create `src/routes/press/_pressCredits.ts` by porting `_three`'s file VERBATIM: keep the `PRESTIGE_ORDER` array (`'HBO Max','HBO','PBS','ABC News','U2','Amazon News','Music Box Films','Monument Releasing','Cargo Film & Releasing','AZPM','HBODocs','GrasshalmClips','Lenny Cooke (Movie)'`), the `PressCredit` interface, and the `getPressCredits()` function (filters `uploader !== 'Michelle Ngo'`, groups by uploader, emits prestige-ordered flat array, appends unknowns last). Keep `import { videos, type Video } from '$lib/data';`. SCRUB the header comment of planning/decision references ("Phase 6 Plan 06-02 D-08", "_four/_pressCredits.ts:24-38", "D-18", "D-08") — replace with a plain comment describing what the file does (derives a flat press-credit list from videos.json in prestige order; underscore prefix excludes it from route detection). Keep behavior byte-identical.

    Create `src/routes/press/+page.ts` by porting `_three`'s verbatim: `import { getPressCredits, type PressCredit } from './_pressCredits';` and `export const load: PageLoad<{ credits: PressCredit[] }> = () => ({ credits: getPressCredits() });`. Import the generated `PageLoad` from `'./$types'`. Scrub planning comments. Do NOT add `entries()` (parameterless route). Prerender is inherited from +layout.ts.

    Create `src/routes/press/+page.svelte` by porting `_three`'s markup: `<svelte:head>` title "Press — Michelle Ngo" + description; sr-only `<h1>Press</h1>`; the scroll-snap region iterating `data.credits` with one `<article>` per credit — poster bg via `${base}${getPosterFor(credit.video)}`, gradient overlay, network wordmark (top), `credit.video.title` (center), and a `▷ Watch` link to `${base}/watch/${credit.video.id}`, plus the `NN / NN` index caption. Imports: `import { base } from '$app/paths';`, `import { getPosterFor } from '$lib/data/posters';`, `import type { PageData } from './$types';`, and `let { data }: { data: PageData } = $props();`.
    REMOVE `motion-safe:transition-colors duration-200` from the Watch CTA class (Tailwind motion variant is forbidden) — leave the hover color classes (`hover:bg-neutral-50 hover:text-neutral-950`) as an instant swap. SCRUB all `eslint-disable` comments and planning/decision-ID comments; keep plain behavior comments only.
  </action>
  <acceptance_criteria>
    - `test -f src/routes/press/_pressCredits.ts && test -f src/routes/press/+page.ts && test -f src/routes/press/+page.svelte` all succeed.
    - `grep -q "export function getPressCredits" src/routes/press/_pressCredits.ts` (deriver exported).
    - `grep -q "'HBO Max'" src/routes/press/_pressCredits.ts` and `grep -q "'Music Box Films'" src/routes/press/_pressCredits.ts` (PRESTIGE_ORDER ported).
    - `grep -q "uploader !== 'Michelle Ngo'" src/routes/press/_pressCredits.ts` (filter intact).
    - `grep -q "getPressCredits" src/routes/press/+page.ts` (page.ts wired to deriver).
    - `grep -q "data.credits" src/routes/press/+page.svelte` (page renders credits).
    - `! grep -rqi "motion-safe" src/routes/press/` (no Tailwind motion variant).
    - `! grep -rqi "eslint-disable" src/routes/press/` (no eslint pragmas — repo has no eslint).
    - `! grep -rqiE "Phase 6|06-0[0-9]|_four|D-[0-9]|PLAN\.md|claude|gemini|AI assistant" src/routes/press/` (no planning/AI phrases).
    - NO `*.test.ts` ported: `! test -f src/routes/press/_pressCredits.test.ts`.
    - `pnpm check` exits 0 (no type errors in the press route).
  </acceptance_criteria>
  <verify>
    <automated>cd "C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_six" && pnpm check</automated>
  </verify>
  <done>/press route files exist, port the deriver/load/page verbatim with scrubbed comments and no motion-safe, and `pnpm check` is clean.</done>
</task>

<task type="auto">
  <name>Task 2: Create /contact and /about (both render shared ContactBlock; no hardcoded contact strings)</name>
  <files>src/routes/contact/+page.svelte, src/routes/about/+page.svelte</files>
  <read_first>
    - src/routes/contact/+page.svelte (target — create)
    - src/routes/about/+page.svelte (target — create)
    - src/lib/components/ContactBlock.svelte (the single source of truth — confirm it has no props and renders the 5 links)
    - C:\...\michelle_ngo_three\src\routes\contact\+page.svelte (source — ports cleanly; producerReelId/getById/getPosterFor all exist in _six)
    - C:\...\michelle_ngo_three\src\routes\about\+page.svelte (source — bio text verbatim; HeroAmbient does NOT exist in _six, adapt the shell)
    - src/lib/data/index.ts (confirm producerReelId, getById exports), src/lib/data/posters.ts (getPosterFor)
  </read_first>
  <action>
    Create `src/routes/contact/+page.svelte` by porting `_three`'s file (it ports cleanly — all imports exist in `_six`):
    `import { base } from '$app/paths';`, `import { producerReelId, getById } from '$lib/data';`, `import { getPosterFor } from '$lib/data/posters';`, `import ContactBlock from '$lib/components/ContactBlock.svelte';`. Resolve `const producerReel = getById(producerReelId); if (!producerReel) throw new Error('/contact: producer reel video missing from $lib/data'); const heroPosterUrl = \`${base}${getPosterFor(producerReel)}\`;`.
    Markup: `<svelte:head>` title "Contact — Michelle Ngo" + description; an `h-svh` `<section>` with the static poster `<img loading="eager" fetchpriority="high">`, the two-stop gradient overlay div, then a centered column with the `MICHELLE NGO` display wordmark (top), sr-only `<h1>Contact Michelle Ngo</h1>`, `<ContactBlock />` (center), and a `↓` scroll-cue (bottom). SCRUB planning/decision comments + the eslint-disable comment.

    Create `src/routes/about/+page.svelte`. Port the APPROVED bio paragraph VERBATIM (the exact text in <three_source_paths> above — straight apostrophes, em-dash —; do NOT paraphrase) and render `<ContactBlock />` as the CTA. Because `_six` has NO HeroAmbient, do NOT import it. Build a restrained editorial shell consistent with /contact and the dark system:
    `import ContactBlock from '$lib/components/ContactBlock.svelte';` (and, if you want the same poster-backed splash header as /contact, also `base`/`producerReelId`/`getById`/`getPosterFor` — optional, your discretion; if used it is a video-id poster, not a contact string).
    Markup: `<svelte:head>` title "About — Michelle Ngo" + description "Michelle Ngo — filmmaker and producer based in New York City."; a `<section class="bg-neutral-950 py-16 md:py-24">` with `<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">` containing sr-only `<h1>About Michelle Ngo</h1>`, the bio `<p class="font-sans text-base font-normal leading-relaxed text-neutral-50">…verbatim bio…</p>`, then `<div class="mt-12"><ContactBlock /></div>`.
    Do NOT port `_three`'s Person JSON-LD block that duplicates the IMDb/LinkedIn/Vimeo URLs (it would duplicate contact strings into the page file, violating PG-04 single-source-of-truth). Omit the JSON-LD. Render a `<section>`, NOT a nested `<main>` (layout provides main). SCRUB planning/decision/`_four`/PLAN.md comments and eslint pragmas.
  </action>
  <acceptance_criteria>
    - `test -f src/routes/contact/+page.svelte && test -f src/routes/about/+page.svelte` succeed.
    - Both render the shared component: `grep -q "import ContactBlock from '\$lib/components/ContactBlock.svelte'" src/routes/contact/+page.svelte` AND same for about; `grep -q "<ContactBlock" src/routes/contact/+page.svelte` AND `grep -q "<ContactBlock" src/routes/about/+page.svelte`.
    - PG-04 single-source-of-truth — NO hardcoded contact strings in either page file:
      `! grep -q "mynogo@gmail.com" src/routes/about/+page.svelte` and `! grep -q "mynogo@gmail.com" src/routes/contact/+page.svelte`;
      `! grep -q "9175661976" src/routes/about/+page.svelte` and `! grep -q "9175661976" src/routes/contact/+page.svelte`;
      `! grep -qi "vimeo.com/user2149742" src/routes/about/+page.svelte` and `! grep -qi "linkedin.com" src/routes/about/+page.svelte` and `! grep -qi "imdb.com" src/routes/about/+page.svelte` (about omits the JSON-LD sameAs URLs).
    - Approved bio ported verbatim: `grep -q "filmmaker and producer based in New York City" src/routes/about/+page.svelte` AND `grep -q "PBS American Portrait, HBO Max" src/routes/about/+page.svelte` AND `grep -q "steady hand and a quick turn" src/routes/about/+page.svelte`.
    - No HeroAmbient import (it does not exist in _six): `! grep -q "HeroAmbient" src/routes/about/+page.svelte`.
    - `! grep -rqi "motion-safe" src/routes/about/ src/routes/contact/` and `! grep -rqi "eslint-disable" src/routes/about/ src/routes/contact/`.
    - `! grep -rqiE "Phase 6|06-0[0-9]|_four|D-[0-9]|PLAN\.md|claude|gemini|AI assistant" src/routes/about/ src/routes/contact/`.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_six" && pnpm check</automated>
  </verify>
  <done>/about renders the verbatim bio + ContactBlock with no duplicated contact strings and no HeroAmbient; /contact renders the poster splash + ContactBlock; `pnpm check` clean.</done>
</task>

<task type="auto">
  <name>Task 3: Prune PENDING_ROUTES and prove strict-green prerender of all three pages</name>
  <files>svelte.config.js</files>
  <read_first>
    - svelte.config.js (target — edit the PENDING_ROUTES Set in handleHttpError)
    - src/routes/about/+page.svelte, src/routes/contact/+page.svelte, src/routes/press/+page.svelte (must exist from Tasks 1-2 so prerender succeeds)
  </read_first>
  <action>
    In `svelte.config.js`, inside `prerender.handleHttpError`, edit the `PENDING_ROUTES` Set: REMOVE `'/about'`, `'/press'`, and `'/contact'`. KEEP `'/pbs-american-portrait/'` (that page is out of v1 scope / deferred to v2; its forward-route allow-list entry stays so the crawler does not 404 on the Footer's PBS category link). The resulting Set must contain exactly one entry: `'/pbs-american-portrait/'`.
    Update the surrounding comment so it no longer claims /about, /press, /contact are forward-phase routes — they are now real prerendered routes; only /pbs-american-portrait/ remains pending. Keep the comment free of AI/planning-workflow phrasing (a plain "deferred to a later release / out of v1 scope" note is fine; describe the route state, not the plan).
    Then run a strict build and confirm the three pages prerender to static HTML.
  </action>
  <acceptance_criteria>
    - `! grep -q "'/about'" svelte.config.js` AND `! grep -q "'/contact'" svelte.config.js` AND `! grep -q "'/press'" svelte.config.js` (the three pruned from the allow-list).
    - `grep -q "/pbs-american-portrait/" svelte.config.js` (PBS entry kept).
    - `pnpm build` exits 0 (strict prerender; any unexpected 404 fails the build).
    - Prerendered HTML present: `test -f build/about/index.html && test -f build/contact/index.html && test -f build/press/index.html`.
    - Content actually rendered (not empty shells): `grep -q "filmmaker and producer based in New York City" build/about/index.html`; `grep -q "mynogo@gmail.com" build/contact/index.html` (ContactBlock's email reached the page via the shared component, confirming single-source wiring); `grep -qi "HBO Max" build/press/index.html` (a known press credit network rendered).
    - `! grep -rqiE "claude|gemini|AI assistant" svelte.config.js`.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_six" && pnpm build && test -f build/about/index.html && test -f build/contact/index.html && test -f build/press/index.html && grep -q "filmmaker and producer based in New York City" build/about/index.html && grep -q "mynogo@gmail.com" build/contact/index.html && grep -qi "HBO Max" build/press/index.html</automated>
  </verify>
  <done>PENDING_ROUTES holds only /pbs-american-portrait/; pnpm build is strict-green; build/about, build/contact, build/press each prerender real content (bio, ContactBlock email, a press network).</done>
</task>

</tasks>

<verification>
Phase-level checks (all via this repo's real tooling — no test harness exists):

1. `pnpm check` exits 0 (no svelte-check type errors across the new routes).
2. `pnpm build` exits 0 (strict prerender; PENDING_ROUTES no longer covers /about, /press, /contact).
3. `test -f build/about/index.html && test -f build/contact/index.html && test -f build/press/index.html`.
4. PG-04 single-source-of-truth: contact strings appear in the BUILT html (via ContactBlock) but NOT in the page source files:
   `grep -q "mynogo@gmail.com" build/contact/index.html` AND `! grep -q "mynogo@gmail.com" src/routes/contact/+page.svelte` AND `! grep -q "mynogo@gmail.com" src/routes/about/+page.svelte`.
5. No AI/planning phrases anywhere added this phase:
   `! grep -rqiE "claude|gemini|AI assistant" src/routes/about src/routes/contact src/routes/press svelte.config.js`.
6. No test files ported: `! find src/routes/press -name '*.test.ts' | grep -q .`.
</verification>

<success_criteria>
- /about prerenders Michelle's approved bio VERBATIM and the shared ContactBlock CTA (PG-01).
- /contact prerenders all contact methods via the shared ContactBlock (PG-02).
- /press prerenders the broadcast-credit sections derived from videos.json (PG-03).
- ContactBlock.svelte remains the ONE source of contact details — About, Contact, and Footer all render it; no contact string is duplicated into a page file (PG-04).
- svelte.config.js PENDING_ROUTES contains only /pbs-american-portrait/; `pnpm build` is strict-green with all three new pages prerendered.
</success_criteria>

<output>
After completion, create `.planning/phases/04-content-pages/04-01-SUMMARY.md`.
</output>
