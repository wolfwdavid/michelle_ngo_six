# Phase 4: Content Pages - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the three supporting content pages — `/about`, `/contact`, `/press` — on the established design system, with a single source of truth for contact information reused across the footer, about, and contact. Covers PG-01, PG-02, PG-03, PG-04. Content (bio, contact, press credits) is ported verbatim from the `_three` fork; these are static prerendered pages.

</domain>

<decisions>
## Implementation Decisions

### About (PG-01)
- `/about` renders Michelle's **approved bio** ported verbatim from `_three`'s `src/routes/about/+page.svelte`. Do NOT rewrite or paraphrase the bio — copy the approved text.
- Editorial layout consistent with the dark cinematic system: display-serif heading, readable measure (~65ch), Inter body; optional portrait/credits list if `_three` has them.
- Ends with the reusable contact block (ContactBlock) as a CTA.

### Contact (PG-02, PG-04)
- `/contact` shows all contact methods via the existing `ContactBlock.svelte`: email `mynogo@gmail.com`, phone (917) 566-1976, Vimeo `https://vimeo.com/user2149742`, LinkedIn, IMDb.
- **PG-04 single source of truth:** ContactBlock is the one component; it already appears in the Footer. About and Contact both render the SAME ContactBlock — no duplicated contact strings anywhere. If any contact value currently lives only inside ContactBlock, that's the canonical location; do not hardcode contact details in the page files.

### Press (PG-03)
- `/press` ported from `_three`'s press route (it has `_pressCredits.ts` data + `+page.ts` + `+page.svelte`). Port the press credits data file and the page; prerender. Reference `_three/src/routes/press/`.
- If press credits reference external links, keep them; list credits in a clean, scannable layout.

### Routing / prerender
- All three are prerendered static routes (prerender inherited from `+layout.ts`).
- These three routes plus `/pbs-american-portrait/` are currently the only entries left in `svelte.config.js` PENDING_ROUTES (forward-route allow-list). As `/about`, `/contact`, `/press` become real this phase, **prune them from PENDING_ROUTES** so strict prerender genuinely covers them. (Leave `/pbs-american-portrait/` — that page is out of v1 scope / deferred; keep its allow-list entry OR add a minimal stub. Planner's call — prefer keeping the allow-list entry to avoid building an out-of-scope page.)
- TopNav already links to /about, /contact (and possibly /press) — confirm nav links resolve after this phase.

### Accessibility / consistency
- Same system: focus rings, responsive, dark cinematic tokens, display/body fonts. Motion (if any) gated on the `motion` rune. No `motion-safe:`/`matchMedia`. No AI-assistant/planning phrases in code.

### Claude's Discretion
- Exact page layout, portrait usage, press-credit grouping, and heading copy — follow the established aesthetic. Keep it restrained and editorial (isotopefilms/samhendi).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- This repo: `src/lib/components/ContactBlock.svelte` (already used in Footer — the contact source of truth), the dark cinematic tokens, display/body fonts, TopNav/MobileMenu nav links.
- Fork source `_three`: `src/routes/about/+page.svelte` (approved bio), `src/routes/contact/+page.svelte`, `src/routes/press/+page.svelte` + `_pressCredits.ts` + `+page.ts`. Port content verbatim; strip `_three`-only test files (page.test.ts) — this repo has no test harness.

### Established Patterns
- adapter-static strict prerender; `+layout.ts` sets prerender=true/trailingSlash='always'.
- PENDING_ROUTES allow-list currently holds `/about`, `/press`, `/contact`, `/pbs-american-portrait/` — prune the three being built.
- Tailwind v4 + OKLCH tokens; `:focus-visible` double ring.

### Integration Points
- Footer already renders ContactBlock; About + Contact reuse the same component.
- TopNav/MobileMenu link to these routes — they resolve once built.

</code_context>

<specifics>
## Specific Ideas

Port the real approved content from `_three` (bio, contact, press credits) verbatim — do not invent or paraphrase Michelle's bio or credits. Keep one ContactBlock as the contact single-source-of-truth. Editorial, restrained, dark-cinematic to match the rest of the site.

</specifics>

<deferred>
## Deferred Ideas

- Final cinematic/responsive/a11y polish sweep → Phase 5.
- Live PBS American Portrait feed → v2 (its forward-route allow-list entry stays for now).
- Contact form / mailer → out of scope (static site; mailto/links only).

</deferred>
