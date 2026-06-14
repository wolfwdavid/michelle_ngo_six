# Phase 5: Design Polish - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

The final cinematic + accessibility + responsive pass across all built surfaces. Implement the prioritized backlog from the 6-pillar UI audit (`.planning/phases/05-design-polish/05-UI-REVIEW.md`), without regressing performance (LCP) or adding WebGL. Covers DSN-01, DSN-02, DSN-03, DSN-04. Also scrubs leaked planning annotations from ported code (codebase hygiene). The UI-REVIEW.md backlog is the contract for this phase.

</domain>

<decisions>
## Implementation Decisions

### Source of truth
- `.planning/phases/05-design-polish/05-UI-REVIEW.md` (the audit + prioritized Polish Backlog, P0→P3, tagged [token]/[a11y]/[cinema]) drives the work. Implement P0/P1 fully; P2/P3 as far as they don't risk regressions.

### Accessibility & responsive (DSN-04, DSN-03) — highest priority
- **Contrast/raw-color fix (P0, [a11y]/[token]):** replace raw `rgba(0,0,0,…)` gradients on `/contact` and `/press` with the canvas token (`oklch(0.16 0 0 / α)`); ensure wordmarks/CTAs over poster gradients meet WCAG 1.4.3 (add a sufficient scrim so text never sits on raw bright poster pixels).
- **MobileMenu (P0, [a11y]):** add focus trap, body scroll-lock while open, and focus-restore to the trigger on close (it's `aria-modal="true"` but Tab currently escapes). Esc closes (verify).
- **Responsive sweep (DSN-03):** verify/refine layouts at 360px / tablet / desktop on every page (hero, rails, grids, watch, content pages). No horizontal overflow at 360px.

### Typography & spacing tokens (DSN-01, P1, [token])
- Tame the cross-page drift: define a small set of heading-size + section-rhythm tokens in `app.css` `@theme` and apply them so the site uses ~4 display sizes / 3 weights and a consistent section padding scale (per UI-SPEC restraint). Remove stray `text-xs`/extra display sizes where the audit flags them (TopNav, FilterPillBar).

### Cinematic motion (DSN-02, P1/P2, [cinema]) — all rune-gated, LCP-safe, no WebGL
- **Scroll-reveal entrance:** one reusable rune-gated `IntersectionObserver` action/component (e.g. `reveal` action in `$lib`) that fades/translates sections in on first view; apply to rails, watch metadata, press sections, content pages. No-op under `prefers-reduced-motion`; never delays/hides the LCP hero.
- **Hero Ken-Burns/parallax:** implement the spec'd-but-unimplemented subtle hero poster motion (slow scale/translate) gated on the rune; must not regress the eager LCP poster.
- Keep all motion consistent with the existing `motion` rune single-source (no `motion-safe:`/`matchMedia`).

### Codebase hygiene (cross-cutting)
- Scrub leaked planning/sibling annotations from ported source comments across `src/` (26 files reference `_three`/`_four`/`D-xx`/`Phase N`/`PLAN.md`). Replace with neutral comments or remove. This includes the `ContactBlock.svelte` header noted in Phase 4. Zero `_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md` matches in `src/` after this phase. (And of course zero AI-assistant/`discretion`/`claude|gemini|...` mentions — already clean.)

### Guardrails
- `pnpm check` clean; `pnpm build` exits 0 (strict prerender) after every change. No new absolute asset paths. No regression to the 56 watch / 9 work / homepage prerender.
- Do NOT build the deferred `/pbs-american-portrait/` page (stays in PENDING_ROUTES). No new routes.

### Claude's Discretion
- Exact reveal easing/distance/duration, parallax magnitude, heading token scale values, scrim opacity — choose tasteful values consistent with the dark cinematic references and the UI-SPEC; document them. Implement the highest-value subset of P2/P3 backlog items time permits without risking regressions.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app.css` (token system — add heading/section/reveal tokens here), the `motion` rune (`$lib/state/motion.svelte`), `visibility.svelte.ts`/`scrollIdle.svelte.ts` (IntersectionObserver/scroll patterns already in repo to model the reveal action on).
- All page + component files are built and working — this phase refines them in place.

### Established Patterns
- Single motion source (`motion` rune); global reduced-motion CSS backstop; `:focus-visible` double ring; OKLCH tokens; 8 category accents; adapter-static strict prerender.

### Integration Points
- Reveal action applied in layout/pages; token changes in app.css cascade site-wide; MobileMenu fix is self-contained; contrast fixes are local to contact/press.

</code_context>

<specifics>
## Specific Ideas

Close the gap to the isotopefilms/samhendi cinematic ceiling: tasteful scroll-reveal + subtle hero motion, tightened typographic/spacing rhythm, airtight a11y (focus trap, contrast). All within the existing token system and the reduced-motion rune. Leave the codebase clean of sibling/planning annotations. Implement the UI-REVIEW backlog.

</specifics>

<deferred>
## Deferred Ideas

- Hover-to-preview autoplay on cards, search, live PBS feed → v2.
- `/pbs-american-portrait/` page → out of v1 scope (allow-list entry stays).
- Any WebGL/heavy-3D centerpiece → explicitly out of scope (CSS depth only).

</deferred>
