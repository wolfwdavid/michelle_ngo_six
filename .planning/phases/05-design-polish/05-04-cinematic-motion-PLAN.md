---
phase: 05-design-polish
plan: 04
type: execute
wave: 3
depends_on: ["05-01", "05-03"]
files_modified:
  - src/lib/actions/reveal.svelte.ts
  - src/routes/+page.svelte
  - src/routes/watch/[id]/+page.svelte
  - src/routes/press/+page.svelte
  - src/routes/contact/+page.svelte
  - src/lib/components/HeroCarousel.svelte
  - src/lib/components/FilterPillBar.svelte
autonomous: false
requirements: [DSN-02]
must_haves:
  truths:
    - "A reusable rune-gated reveal action exists in $lib and fades/translates sections into view on first scroll-in."
    - "Under prefers-reduced-motion the reveal action is a no-op (content is immediately opaque, never hidden or delayed)."
    - "Homepage rails, the watch metadata/related block, and press sections reveal on scroll (staggered where applicable)."
    - "The hero poster has a rune-gated Ken-Burns scale; the eager LCP poster is never hidden or opacity-0 at first paint."
    - "All motion is gated via the motion rune / class:motion-ok — no motion-safe: or matchMedia is introduced."
  artifacts:
    - path: "src/lib/actions/reveal.svelte.ts"
      provides: "Shared IntersectionObserver reveal Svelte action, rune-gated"
      contains: "prefersReducedMotion"
    - path: "src/routes/+page.svelte"
      provides: "use:reveal applied to category rails"
      contains: "reveal"
  key_links:
    - from: "src/lib/actions/reveal.svelte.ts"
      to: "src/lib/state/motion.svelte.ts"
      via: "import { motion } and early-return on prefersReducedMotion"
      pattern: "motion\\.prefersReducedMotion"
---

<objective>
Use the cinematic ceiling the site currently leaves on the table (DSN-02, UI-REVIEW Pillar 5 / Backlog P2 items 9-12). Add one reusable rune-gated `reveal` IntersectionObserver action, apply it (staggered) to rails / watch metadata / press sections, implement the already-spec'd hero Ken-Burns on the poster, and add a 150ms color transition to FilterPillBar chips. Every effect is gated on the `motion` rune, is a no-op under reduced motion, uses CSS transforms only (no WebGL), and never hides or delays the eager LCP hero poster.

Purpose: Earns the isotopefilms/samhendi cinematic feel through staggered reveals + slow poster motion, without regressing LCP.
Output: `reveal` action + applications + hero Ken-Burns + pill transition.
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
@src/lib/state/motion.svelte.ts

<constraints>
- DEPENDS ON 05-01 (uses --ease-cinematic, already present pre-existing; section tokens) and 05-03 (contact/press already token-clean and structurally settled — this plan adds parallax/reveal to the SAME contact/press files without re-touching their scrim/wordmark).
- Motion is gated ONLY via the `motion` rune (`$lib/state/motion.svelte` → `motion.prefersReducedMotion`) and/or `class:motion-ok`. NEVER use `motion-safe:` or `matchMedia` directly. The global `@media (prefers-reduced-motion: reduce)` CSS backstop in app.css already near-zeros durations as a second net.
- LCP SAFETY (hard rule): the eager hero poster (HeroCarousel `.slide img`) and the eager /contact, /press first posters MUST stay opaque and present at first paint. The reveal action must NOT be applied to the LCP hero poster. Ken-Burns is a transform (scale) on an already-visible poster — it changes transform, never opacity/visibility, and only when `.motion-ok` is set.
- The reveal action must SSR-safely no-op: during prerender (no window/IntersectionObserver) and under reduced motion, the node must end up fully opaque (`opacity:1`), never stuck at 0.
- NO test harness — verify with `pnpm check`, `pnpm build` (exit 0), grep, and a human reduced-motion + LCP checkpoint.
- No new routes; `/pbs-american-portrait/` stays in PENDING_ROUTES; strict prerender stays green.
- No AI-assistant / planning-phase phrases in code or comments.
</constraints>

<interfaces>
Model the action on the existing rune + observer patterns:
- `motion.svelte.ts` exports `motion` with getter `prefersReducedMotion` (SSR default false).
- `visibility.svelte.ts` shows the SSR-guard idiom (typeof checks, module-scope).
- `--ease-cinematic: cubic-bezier(0.4, 0, 0.2, 1)` already in app.css.

UI-REVIEW reference reveal action (F5.1) — adapt to a `.svelte.ts` action that imports the motion rune:
```ts
export function reveal(node, { delay = 0 } = {}) {
  if (motion.prefersReducedMotion) { node.style.opacity = '1'; return; }
  node.style.cssText = 'opacity:0; transform:translateY(12px);' +
    `transition:opacity 500ms ${delay}ms var(--ease-cinematic), transform 500ms ${delay}ms var(--ease-cinematic);`;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { node.style.opacity='1'; node.style.transform='none'; io.disconnect(); }
  }, { rootMargin: '0px 0px -10% 0px' });
  io.observe(node);
  return { destroy: () => io.disconnect() };
}
```
Apply sites:
- Homepage +page.svelte L42-44: `{#each categories as cat, i}` <CategoryRail> — wrap/attach `use:reveal={{ delay: i*60 }}`.
- watch/[id] +page.svelte: the title/meta block (L142-169) and the related <section> (L171+).
- press +page.svelte: each `<article>` inner composition block (NOT the eager first poster image).
- HeroCarousel.svelte L100-106: poster `<img>` — add rune-gated Ken-Burns scale.
- FilterPillBar.svelte L42 baseChip: add a 150ms color/bg/border transition.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create the rune-gated reveal action and apply to rails/watch/press</name>
  <read_first>
    - src/lib/state/motion.svelte.ts (rune shape + SSR default)
    - src/lib/state/visibility.svelte.ts (SSR-guard idiom)
    - src/routes/+page.svelte (rail each-loop, L42-44)
    - src/routes/watch/[id]/+page.svelte (metadata block L142-169, related section L171+)
    - src/routes/press/+page.svelte (article composition block)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F5.1)
  </read_first>
  <action>
    1. Create `src/lib/actions/reveal.svelte.ts` exporting a `reveal(node, { delay = 0 } = {})` Svelte action per the UI-REVIEW F5.1 reference. Requirements:
       - `import { motion } from '$lib/state/motion.svelte';`
       - If `motion.prefersReducedMotion` OR `IntersectionObserver`/`window` is undefined (SSR), set `node.style.opacity = '1'` and return (no-op, fully visible).
       - Otherwise set initial `opacity:0; transform:translateY(12px)` with a 500ms transition using `var(--ease-cinematic)` and the `delay`, observe with `rootMargin: '0px 0px -10% 0px'`, reveal on intersect (opacity 1, transform none), disconnect.
       - Return `{ destroy }` that disconnects the observer.
       - Neutral header comment (no phase/plan/sibling references).
    2. Apply `use:reveal`:
       - Homepage +page.svelte: on each `<CategoryRail>` (or a wrapping element) in the each-loop, `use:reveal={{ delay: i * 60 }}` for a staggered cascade.
       - watch/[id]: on the title/meta block and on the related `<section>` (e.g. `use:reveal` and `use:reveal={{ delay: 80 }}`). Do NOT apply to the player/poster region above.
       - press: on each article's inner composition `<div>` (the wordmark/title/CTA group), NOT on the eager poster `<img>`.
    3. Import the action in each consuming page's `<script>` (`import { reveal } from '$lib/actions/reveal.svelte';`).
    Self-check: confirm no `use:reveal` lands on the hero poster or any eager LCP image.
  </action>
  <verify>
    <automated>test -f "src/lib/actions/reveal.svelte.ts" && grep -q "motion.prefersReducedMotion" src/lib/actions/reveal.svelte.ts && grep -q "IntersectionObserver" src/lib/actions/reveal.svelte.ts && grep -q "use:reveal" src/routes/+page.svelte && grep -q "use:reveal" src/routes/watch/\[id\]/+page.svelte && grep -q "use:reveal" src/routes/press/+page.svelte && ! grep -nE "motion-safe:|matchMedia" src/lib/actions/reveal.svelte.ts && pnpm check && pnpm build</automated>
  </verify>
  <done>reveal action exists, rune-gated, SSR-safe (opacity 1 fallback); applied (staggered on homepage) to rails, watch metadata + related, and press sections; not applied to any eager poster; no motion-safe:/matchMedia; `pnpm check` clean and `pnpm build` exits 0.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Hero Ken-Burns + FilterPillBar transition (rune-gated, LCP-safe)</name>
  <read_first>
    - src/lib/components/HeroCarousel.svelte (poster img L100-106, scrim L110-114, the existing class:motion-ok gating pattern + <style> block L158+)
    - src/lib/components/FilterPillBar.svelte (baseChip L42-45)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F5.2, F5.4)
  </read_first>
  <action>
    1. **Hero Ken-Burns (F5.2):** On the HeroCarousel poster `<img>` (L100-106), add a `motion-ok`-gated slow scale animation (Ken-Burns `scale(1.06) → scale(1)` or `1 → 1.06`) over ~7s in the component `<style>` block, applied only when the slide is active and `.motion-ok` is present (mirror the existing crossfade gating idiom already in this component — find how `class:motion-ok` / the active slide is bound and reuse it). The poster MUST remain `opacity:1`/visible at all times — only `transform` animates. Under reduced motion (no `.motion-ok`) the poster is static at scale 1. Do NOT change `loading`/`fetchpriority` of the poster.
    2. **FilterPillBar transition (F5.4):** Add `transition: background-color 150ms, color 150ms, border-color 150ms` to the chip styling (extend `baseChip` or a scoped `<style>` rule) so active-pill swaps animate. The global reduced-motion backstop already neutralizes it under reduced motion.
    Neutral comments only. Self-check: grep the hero img region to confirm no `opacity:0` or `visibility:hidden` was introduced on the poster.
  </action>
  <verify>
    <automated>grep -qiE "scale\(1\.0?6|ken|kenburns" src/lib/components/HeroCarousel.svelte && grep -q "motion-ok" src/lib/components/HeroCarousel.svelte && grep -qE "transition: ?background-color 150ms|transition:background-color 150ms" src/lib/components/FilterPillBar.svelte && ! grep -nE "motion-safe:|matchMedia" src/lib/components/HeroCarousel.svelte && pnpm check && pnpm build</automated>
  </verify>
  <done>Hero poster has a motion-ok-gated Ken-Burns scale (transform only, poster stays opaque/eager); FilterPillBar chips have a 150ms color transition; no motion-safe:/matchMedia introduced; `pnpm check` clean and `pnpm build` exits 0.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: Verify scroll-reveal, hero Ken-Burns, and reduced-motion LCP safety</name>
  <what-built>Rune-gated scroll-reveal (rails/watch/press), hero Ken-Burns poster motion, and a 150ms pill transition — all CSS-transform, no WebGL.</what-built>
  <action>Human verifies scroll-reveal, hero Ken-Burns, and reduced-motion LCP safety using the steps below; no code is changed in this checkpoint task.</action>
  <how-to-verify>
    1. `pnpm dev`. On the homepage scroll down — rails should fade/slide in (staggered) as they enter view; the hero poster should slowly drift/scale.
    2. Open /watch/[id] and /press — metadata/related and press sections should reveal on scroll-in.
    3. Enable OS "Reduce motion" (or DevTools rendering → prefers-reduced-motion: reduce) and reload: confirm NOTHING is hidden — all content is immediately visible, no reveal animation, hero poster static.
    4. Confirm the hero poster is visible immediately on first paint (it is the LCP image — it must never start invisible). Optionally check a Lighthouse/Performance LCP element is the hero poster.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any reveal/LCP/reduced-motion issue.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm check` clean, `pnpm build` exits 0 (strict prerender, no route changes).
- `test -f src/lib/actions/reveal.svelte.ts` and `grep -q "motion.prefersReducedMotion" src/lib/actions/reveal.svelte.ts` → match.
- `! grep -rnE "motion-safe:|matchMedia" src/lib/actions/reveal.svelte.ts src/lib/components/HeroCarousel.svelte` → no matches (single motion source preserved).
- Human checkpoint confirms reduced-motion no-op + eager LCP poster visible at first paint.
</verification>

<success_criteria>
- DSN-02: tasteful scroll reveals + hero Ken-Burns + pill transition via CSS transforms, no WebGL.
- All gated on the motion rune; reduced-motion is a clean no-op; LCP hero poster never hidden/delayed.
- Build green; no route changes.
</success_criteria>

<output>
After completion, create `.planning/phases/05-design-polish/05-04-SUMMARY.md`
</output>
