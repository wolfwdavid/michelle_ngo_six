---
phase: 04-content-pages
plan: 01
subsystem: content-pages
tags: [about, contact, press, prerender, contactblock]
requires:
  - "ContactBlock.svelte (shared contact source of truth)"
  - "$lib/data (videos, producerReelId, getById)"
  - "$lib/data/posters (getPosterFor)"
provides:
  - "/about route (verbatim bio + ContactBlock CTA)"
  - "/contact route (poster splash + ContactBlock)"
  - "/press route (broadcast credits from videos.json)"
  - "getPressCredits() flat-array deriver"
affects:
  - "svelte.config.js PENDING_ROUTES (now only /pbs-american-portrait/)"
tech-stack:
  added: []
  patterns:
    - "Page files render <section> inside the layout's <main>; sr-only h1 landmark"
    - "Static poster background + two-stop gradient overlay (no iframes)"
    - "Single-source-of-truth contact via shared ContactBlock"
key-files:
  created:
    - "src/routes/press/_pressCredits.ts"
    - "src/routes/press/+page.ts"
    - "src/routes/press/+page.svelte"
    - "src/routes/contact/+page.svelte"
    - "src/routes/about/+page.svelte"
  modified:
    - "svelte.config.js"
decisions:
  - "Omitted the Person JSON-LD block from /about to avoid duplicating IMDb/LinkedIn/Vimeo URLs into the page file (preserves PG-04 single source of truth)"
  - "Adapted /about to a restrained editorial section because _six has no HeroAmbient component"
  - "Dropped the motion-safe:transition-colors on the press Watch CTA; hover color swaps instantly (no Tailwind motion variant)"
metrics:
  duration: "~5 min"
  completed: 2026-06-14
  tasks: 3
  files: 6
---

# Phase 4 Plan 01: Content Pages Summary

Shipped the three supporting content pages — /about, /contact, /press — on the established `_six` dark cinematic system. Michelle's approved bio and the press credits were ported verbatim from the `_three` fork; About and Contact both render the single shared `ContactBlock.svelte` so contact details have exactly one source of truth. Pruned `/about`, `/contact`, `/press` from the prerender allow-list so the strict build genuinely covers them.

## What Was Built

- **/press** — `_pressCredits.ts` derives a flat `{ network, video }[]` array from `videos.json` in fixed prestige order (HBO Max first), excluding Michelle's own uploads; `+page.ts` loads it; `+page.svelte` renders one scroll-snap section per credit with a static poster background, network wordmark, title caption, and a ▷ Watch CTA. 13 credits rendered.
- **/contact** — producer-reel poster splash with the MICHELLE NGO wordmark, the shared `ContactBlock` centered, and a ↓ scroll-cue to the Footer.
- **/about** — verbatim approved bio paragraph on a restrained editorial section, with the shared `ContactBlock` as the CTA. No HeroAmbient (it does not exist in `_six`); no JSON-LD (would duplicate contact URLs).
- **svelte.config.js** — `PENDING_ROUTES` reduced to exactly `/pbs-american-portrait/` (deferred to a later release).

## Verification

- `pnpm check` exits 0 (no type errors).
- `pnpm build` exits 0 (strict prerender; no allow-list escape hatch for the three pages).
- `build/about/index.html`, `build/contact/index.html`, `build/press/index.html` present.
- Content proven in built HTML: bio text in `/about`, `mynogo@gmail.com` in `/contact` (reaching the page only via the shared ContactBlock), `HBO Max` in `/press`.
- No contact strings hardcoded in the about/contact page source files.
- No `_three` annotations, AI/planning phrases, `motion-safe:`, `matchMedia`, or `eslint-disable` pragmas in the new code.
- No `*.test.ts` ported.

## Deviations from Plan

None - plan executed exactly as written. The `/about` shell adaptation (no HeroAmbient) and JSON-LD omission were explicitly directed by the plan, not discovered deviations.

## Self-Check: PASSED
