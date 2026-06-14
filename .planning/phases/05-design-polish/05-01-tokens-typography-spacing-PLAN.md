---
phase: 05-design-polish
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app.css
  - src/lib/components/TopNav.svelte
  - src/lib/components/FilterPillBar.svelte
  - src/lib/components/Footer.svelte
  - src/routes/watch/[id]/+page.svelte
  - src/routes/work/+page.svelte
  - src/routes/work/[category]/+page.svelte
  - src/routes/about/+page.svelte
autonomous: true
requirements: [DSN-01]
must_haves:
  truths:
    - "The site uses a single heading ramp (4 display sizes) defined in app.css @theme, applied across watch/work/about and chrome."
    - "text-xs no longer appears in TopNav or FilterPillBar; 12px is reserved for font-mono badges only."
    - "Editorial sections share one --section-y vertical-rhythm token instead of ad-hoc py-8/py-16/py-24."
    - "Chrome (TopNav + Footer) and page content align on the same --content-max boundary."
    - "The /work index has a visible 'All Work' header matching the /work/[category] header."
  artifacts:
    - path: "src/app.css"
      provides: "Heading ramp, section-rhythm, wordmark-tracking, scrim tokens in @theme"
      contains: "--text-hero"
    - path: "src/routes/work/+page.svelte"
      provides: "Visible 'All Work' header with total count"
      contains: "All Work"
  key_links:
    - from: "src/lib/components/TopNav.svelte"
      to: "src/app.css --content-max"
      via: "max-w utility swap from max-w-7xl"
      pattern: "content-max"
---

<objective>
Consolidate the typographic and spacing system (DSN-01). Define a small set of heading-size, section-rhythm, wordmark-tracking, and scrim tokens in `app.css` `@theme`, then remap chrome and content surfaces to them so the site reads as one design system instead of "several designers." Collapses 5 display sizes to 4, removes reintroduced `text-xs`, unifies section vertical rhythm and the content boundary.

Purpose: The UI-SPEC promised "4 sizes / 3 weights" restraint; this enforces it sitewide (UI-REVIEW Pillar 2 + 4, Backlog P1 items 4-8).
Output: New `@theme` tokens + remapped TopNav, FilterPillBar, Footer, watch, work, work/[category], about.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-design-polish/05-UI-REVIEW.md
@.planning/phases/05-design-polish/05-CONTEXT.md

<constraints>
- NO test harness. Verify ONLY with: `pnpm check` (clean), `pnpm build` (exit 0), and `grep`/`find`/`test -f`. There is no vitest, no test script.
- This plan does NOT touch /contact or /press (Plan 05-03 owns those two files — including their heading/wordmark remap). Do not edit them here.
- This plan adds the `--scrim-vertical`, `--scrim-strong`, `--text-shadow-cinema` tokens to app.css (consumed by Plans 05-03 and 05-04) but does not yet wire them into contact/press.
- No new routes. Keep `/pbs-american-portrait/` in PENDING_ROUTES. Strict prerender must stay green (homepage + 56 watch + 9 work + about/contact/press).
- No AI-assistant / planning-phase phrases in any code or comment you write.
</constraints>

<interfaces>
Current app.css @theme already defines: --ease-cinematic, --content-max (1440px), --page-gutter, the neutral ramp, and 8 --color-cat-* accents (src/app.css L73-113). Add new tokens INSIDE the existing `@theme { … }` block.

Drift to fix (file:line from UI-REVIEW):
- Display sizes in use: text-xl, text-2xl/3xl (work/[category] L37), text-3xl/4xl (watch title L143), text-6xl (contact/press wordmarks — handled in 05-03), hero clamp(28px,5vw,48px).
- text-xs: TopNav.svelte L171 (desktop nav links), FilterPillBar.svelte L43 (baseChip).
- Section padding ad hoc: about L22 (py-16 md:py-24), work L45 (py-8), watch L133 (py-8), work/[category] L35 (pt-8).
- Chrome width: TopNav L162 + Footer L41 use max-w-7xl; content uses max-w-[var(--content-max)].
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add heading/section/tracking/scrim tokens to app.css @theme</name>
  <read_first>
    - src/app.css (the existing @theme block, L73-113 — append new tokens here)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F2.1 heading ramp, F4.1 section-y, F2.3 tracking, F3.1/F3.4 scrim, F2.4 leading)
  </read_first>
  <action>
    Inside the existing `@theme { … }` block in src/app.css, add these tokens (values from UI-REVIEW F2.1, F4.1, F3.1, F3.4 — exact strings):

    ```css
    /* Heading ramp — collapse drift to 4 display sizes (UI-REVIEW Pillar 2). */
    --text-hero: clamp(28px, 5vw, 48px); /* hero + press/contact wordmark */
    --text-h1: clamp(26px, 3.5vw, 36px); /* watch title, page H2 headers */
    --text-h2: 20px;                     /* rail labels, related, section heads */
    --text-meta: 14px;                   /* counts, meta, eyebrows */

    /* Section vertical rhythm — one scale for editorial sections (UI-REVIEW Pillar 4). */
    --section-y: clamp(3rem, 6vw, 6rem);
    --section-y-sm: clamp(2rem, 4vw, 3rem);

    /* Wordmark identity + body leading (UI-REVIEW F2.3, F2.4). */
    --tracking-wordmark: 0.18em;
    --leading-body: 1.5;

    /* Vertical scrim idiom — single source for poster overlays (UI-REVIEW F3.1, F3.4).
       Consumed by contact/press in Plan 05-03 and the hero/card scrims. */
    --scrim-vertical: linear-gradient(
      180deg,
      oklch(0.16 0 0 / 0.6) 0%,
      transparent 28%,
      transparent 64%,
      oklch(0.16 0 0 / 0.78) 100%
    );
    --scrim-strong: oklch(0.16 0 0 / 0.78);
    --text-shadow-cinema: 0 1px 12px oklch(0.16 0 0 / 0.8);
    ```

    Write a neutral comment header for the block (e.g. "Typographic ramp + section rhythm + scrim tokens"). Do NOT reference planning phases, sibling repos, or D-xx ids in the comment.
  </action>
  <verify>
    <automated>grep -q -- "--text-hero" src/app.css && grep -q -- "--section-y" src/app.css && grep -q -- "--scrim-vertical" src/app.css && grep -q -- "--tracking-wordmark" src/app.css && pnpm check</automated>
  </verify>
  <done>app.css @theme contains --text-hero, --text-h1, --text-h2, --text-meta, --section-y, --section-y-sm, --tracking-wordmark, --leading-body, --scrim-vertical, --scrim-strong, --text-shadow-cinema; `pnpm check` is clean.</done>
</task>

<task type="auto">
  <name>Task 2: Remap chrome + browse/watch/about to the new tokens</name>
  <read_first>
    - src/lib/components/TopNav.svelte (L162 max-w-7xl, L166 wordmark tracking-widest, L171 text-xs nav links)
    - src/lib/components/FilterPillBar.svelte (L43 baseChip text-xs)
    - src/lib/components/Footer.svelte (L41 max-w-7xl)
    - src/routes/watch/[id]/+page.svelte (L133 py-8, L143 text-3xl/text-4xl title, L175 text-xl related head)
    - src/routes/work/+page.svelte (L40 sr-only h1, L45 py-8 grid — add visible header)
    - src/routes/work/[category]/+page.svelte (L35 pt-8, L37 text-2xl/3xl header)
    - src/routes/about/+page.svelte (L22 py-16 md:py-24)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F1.2, F2.1, F2.2, F4.1, F4.4)
  </read_first>
  <action>
    Apply the tokens (exact remaps from UI-REVIEW Backlog 4-7):

    1. **text-xs removal (F2.2):** In TopNav.svelte L171 change the desktop nav `<ul>` from `text-xs` to `text-sm`. In FilterPillBar.svelte L43 change `baseChip` from `text-xs` to `text-sm`. (Keep `tracking-wider`.) Reserve 12px for font-mono badges only — do not introduce new text-xs anywhere.

    2. **Chrome width unify (F4.4):** In TopNav.svelte L162 and Footer.svelte L41 change `max-w-7xl` to `max-w-[var(--content-max)]` so chrome edges align with content edges.

    3. **Heading ramp (F2.1):** watch/[id] title (L142-144) — replace `text-3xl … md:text-4xl` with `text-[length:var(--text-h1)]`. Related heading (L175) stays at the h2 tier; set it to `text-[length:var(--text-h2)]`. work/[category] header (L37) — replace `text-2xl … sm:text-3xl` with `text-[length:var(--text-h1)]`.

    4. **Section rhythm (F4.1):** Replace the ad-hoc vertical padding with the token: about/+page.svelte L22 `py-16 md:py-24` → `py-[var(--section-y)]`; watch/[id] below-player container L133 `py-8` → `py-[var(--section-y-sm)]`; work/[category] header L35 `pt-8` → `pt-[var(--section-y-sm)]`. (Leave the grid `py-8` on /work and /work/[category] as-is — grids are not editorial sections.)

    5. **/work visible header (F1.2):** In work/+page.svelte, above the FilterPillBar (after the sr-only h1, L40-42), add a visible header matching /work/[category]:
       ```svelte
       <header class="mx-auto max-w-[var(--content-max)] px-[var(--page-gutter)] pt-[var(--section-y-sm)]">
         <h2 class="font-display text-[length:var(--text-h1)] tracking-tight text-neutral-50">All Work</h2>
         <p class="mt-1 text-[length:var(--text-meta)] text-neutral-400">{data.videos.length} videos</p>
       </header>
       ```
       (Confirm `data.videos` is the full list available in that file's load/props; use the existing total-count source.)

    Do not edit /contact or /press here. Do not change leading on the watch title beyond what the heading-ramp swap implies (leave existing leading-snug if present, or align to leading-[1.1] only if trivial — your discretion, no regression).
  </action>
  <verify>
    <automated>! grep -nE "text-xs" src/lib/components/TopNav.svelte src/lib/components/FilterPillBar.svelte && ! grep -nE "max-w-7xl" src/lib/components/TopNav.svelte src/lib/components/Footer.svelte && grep -q "All Work" src/routes/work/+page.svelte && grep -q -- "--text-h1" src/routes/watch/\[id\]/+page.svelte && grep -q -- "--section-y" src/routes/about/+page.svelte && pnpm check && pnpm build</automated>
  </verify>
  <done>No text-xs in TopNav/FilterPillBar; no max-w-7xl in TopNav/Footer; watch title + work/[category] header use --text-h1; about/watch/work[category] sections use --section-y/--section-y-sm; /work renders a visible "All Work" header; `pnpm check` clean and `pnpm build` exits 0 with strict prerender intact.</done>
</task>

</tasks>

<verification>
- `pnpm check` clean, `pnpm build` exits 0 (strict prerender, no new PENDING_ROUTES change).
- `grep -q -- "--text-hero" src/app.css` → match (token exists for 05-03 wordmark remap).
- `! grep -rnE "text-xs" src/lib/components/TopNav.svelte src/lib/components/FilterPillBar.svelte` → no matches.
- No new absolute asset paths introduced.
</verification>

<success_criteria>
- DSN-01: heading ramp + section rhythm + chrome-width tokens defined once and applied across chrome/browse/watch/about; display sizes collapsed from 5 to 4; text-xs removed from chrome.
- /contact and /press untouched (owned by 05-03).
- Build green; no route changes.
</success_criteria>

<output>
After completion, create `.planning/phases/05-design-polish/05-01-SUMMARY.md`
</output>
