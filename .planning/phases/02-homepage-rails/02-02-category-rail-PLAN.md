---
phase: 02-homepage-rails
plan: 02
type: execute
wave: 2
depends_on: ["02-01"]
files_modified:
  - src/lib/components/CategoryRail.svelte
  - src/lib/components/CategoryRail.svelte.test.ts
autonomous: true
requirements: [HOME-02, HOME-03]
must_haves:
  truths:
    - "A rail shows a category label (with a 3px accent tick) and a horizontal track of VideoCards for that category."
    - "The track scrolls by mouse wheel/drag, touch swipe, and is keyboard navigable (arrow/Home/End move card focus and scroll it into view)."
    - "On desktop, hover chevrons scroll the track ~one viewport of cards; the left chevron hides at the start and the right chevron hides at the end."
    - "A rail whose cards do not overflow renders no chevrons."
    - "A category with zero videos renders nothing."
  artifacts:
    - path: "src/lib/components/CategoryRail.svelte"
      provides: "Labeled scroll-snap rail of VideoCards with chevrons + keyboard nav + extreme-hide"
      min_lines: 90
      contains: "scroll-snap-type: x mandatory"
  key_links:
    - from: "src/lib/components/CategoryRail.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "renders one <VideoCard> per video"
      pattern: "VideoCard"
    - from: "src/lib/components/CategoryRail.svelte"
      to: "getByCategory(category)"
      via: "import from $lib/data"
      pattern: "getByCategory"
---

<objective>
Build `CategoryRail.svelte`: one labeled, horizontally scroll-snapping rail of VideoCards for a single category, with desktop hover chevrons (that hide at scroll extremes), CSS scroll-snap, native touch scroll, and full keyboard navigation. Empty categories and non-overflowing rails degrade correctly.

Purpose: This is the repeating unit of the homepage. Plan 04 instantiates one per category via `getCategoriesInDisplayOrder()`.
Output: `src/lib/components/CategoryRail.svelte` + behavior test.
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
From src/lib/components/VideoCard.svelte (Plan 02-01 — already built):
```svelte
<VideoCard {video} eager={false} />   <!-- props: { video: Video; eager?: boolean } -->
```
From src/lib/data/index.ts:
```typescript
export function getByCategory(category: Category): readonly Video[];
export function categoryToSlug(category: Category): string;   // 'PBS American Portrait' -> 'pbs-american-portrait'
export type Category; export type Video;
```
From src/lib/components/categoryAccent.ts:
```typescript
export function categoryAccentBg(category: Category): string; // 'bg-cat-pbs/15' (literal map)
```
Tailwind utilities already in app.css: `scrollbar-hide` (@utility), global `:focus-visible` double-ring.
`--page-gutter` and `--ease-cinematic` tokens exist (added in Plan 02-01).
`import { base } from '$app/paths';`
</interfaces>

<reference>
<!-- Adapt the scroll-snap track mechanics (snap-x snap-mandatory, scrollbar-hide, flex-none cards). -->
<!-- _three's rail has NO chevrons/keyboard/extreme-hide — those are NEW here per UI-SPEC § Rail Spec. -->
@../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte
@../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte.test.ts
</reference>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build the rail track, header tick, scroll-snap, and card-per-video render</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte (snap-x snap-mandatory + scrollbar-hide + flex-none card track to adapt; the {#if rail.length > 0} omit-empty guard)
    - src/lib/components/VideoCard.svelte (the child contract built in Plan 02-01: props { video, eager })
    - src/lib/components/categoryAccent.ts (categoryAccentBg literal map for the accent tick)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Rail Spec (lines ~156-187) + § VideoCard Spec width table — EXACT values
  </read_first>
  <action>
    Create `src/lib/components/CategoryRail.svelte`. Props: `{ category: Category; eagerFirstCards?: boolean }` ($props). In the script: `const slug = categoryToSlug(category)`, `const cards = getByCategory(category)`.

    Top-level guard: render NOTHING when `cards.length === 0` (UI-SPEC: empty categories omitted — `{#if cards.length > 0}` wrapping the whole section).

    Section structure (UI-SPEC § Rail Spec + § Layout):
    - `<section aria-labelledby={`rail-${slug}`} class="category-rail">` contained to `--page-gutter` / `--content-max` (e.g. `mx-auto w-full max-w-[var(--content-max)] px-[var(--page-gutter)]`).
    - Header: a flex row containing an `<h2 id={`rail-${slug}`}>` with a preceding 3px-wide full-height accent tick (a `<span aria-hidden="true">` styled `w-[3px]` with `bg-cat-{slug}` — use a literal class via a small local map OR reuse `categoryAccentBg` then override alpha; pick the literal-class approach so Tailwind generates it). Heading text = the category name verbatim, `font-display text-xl font-semibold text-neutral-50`. Header -> track gap 16px (`mb-4`).
    - Track: `<ul class="rail-track scrollbar-hide" style="perspective: 800px;">` — horizontal flex, `overflow-x: auto`, `scroll-snap-type: x mandatory`, `scroll-padding-inline: var(--page-gutter)`. Card gap 8px mobile / 16px (md) tablet+ (`gap-2 md:gap-4`). The `perspective: 800px` on the track gives child VideoCard tilt its depth (UI-SPEC § VideoCard "Perspective").
    - Each card: `<li class="flex-none" style="scroll-snap-align: start;">` with fixed width `clamp(150px,60vw,220px)` mobile / `200px` tablet / `220px` desktop (use a width style/class per the breakpoint table) wrapping `<VideoCard {video} eager={eagerFirstCards && i < 4} />`. Only the first ~4 cards of the FIRST rail are eager (Plan 04 passes `eagerFirstCards` only to rail #0); all others lazy.

    Use `bind:this` on the track element (you'll need the ref in Task 2 for chevrons + keyboard). Do NOT override `:focus-visible`.
  </action>
  <acceptance_criteria>
    - `grep -F "getByCategory" src/lib/components/CategoryRail.svelte` matches.
    - `grep -F "VideoCard" src/lib/components/CategoryRail.svelte` matches (renders the child).
    - `grep -F "scroll-snap-type: x mandatory" src/lib/components/CategoryRail.svelte` matches (or the equivalent `snap-x snap-mandatory` Tailwind class — at least one).
    - `grep -F "scroll-snap-align: start" src/lib/components/CategoryRail.svelte` OR `grep -F "snap-start" src/lib/components/CategoryRail.svelte` matches.
    - `grep -F "scrollbar-hide" src/lib/components/CategoryRail.svelte` matches.
    - `grep -F "aria-labelledby" src/lib/components/CategoryRail.svelte` and `grep -F "rail-" src/lib/components/CategoryRail.svelte` match.
    - `grep -F "perspective: 800px" src/lib/components/CategoryRail.svelte` matches.
    - `grep -F "cards.length > 0" src/lib/components/CategoryRail.svelte` OR `grep -F "cards.length === 0" src/lib/components/CategoryRail.svelte` matches (empty omit).
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm check 2>&1 | grep -iE "CategoryRail|error" | head -20 || echo "no svelte-check errors for CategoryRail"</automated>
  </verify>
  <done>CategoryRail renders a labeled accent-ticked section with a scroll-snap track of VideoCards from getByCategory(category); empty categories render nothing; the track has perspective for card tilt.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add hover chevrons (extreme-hide), keyboard nav, and the behavior test</name>
  <read_first>
    - src/lib/components/CategoryRail.svelte (the file from Task 1 — you extend it with chevron buttons + keyboard handlers reading the track ref)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Rail Spec "Chevrons" / "Arrows hide at extremes" / "Few-card rails" / keyboard map + "Chevron labels" copy (lines ~166-183, 263)
    - src/lib/state/motion.svelte.ts (chevron scroll uses smooth normally, instant under reduced motion — read motion.prefersReducedMotion; test hooks)
    - ../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte.test.ts (vitest-browser-svelte render + interaction pattern to mirror)
  </read_first>
  <behavior>
    - Left chevron is hidden (`aria-hidden="true"` + `tabindex="-1"`) when `scrollLeft <= 0`; right chevron hidden when `scrollLeft + clientWidth >= scrollWidth - 1`.
    - When the track does not overflow (`scrollWidth <= clientWidth`), neither chevron renders/shows.
    - Chevron `<button>`s have `aria-label="Scroll {category} left"` / `"Scroll {category} right"` and a >=44px hit-area.
    - Pressing `End` while a card is focused moves focus to the last card; `Home` to the first; `ArrowRight`/`ArrowLeft` move focus by one card and scroll it into view.
    - Activating a chevron scrolls the track by ~`clientWidth * 0.8`.
  </behavior>
  <action>
    Extend `src/lib/components/CategoryRail.svelte` per UI-SPEC § Rail Spec:

    Chevrons (desktop-only): two `<button type="button">` absolutely positioned, vertically centered on the track, left at `inset-inline-start: 8px`, right at `inset-inline-end: 8px`; 44x44 hit-area, 40px visible circle `bg-neutral-800/80 backdrop-blur`, inline-SVG chevron glyph in `text-neutral-50` (NEUTRAL — never accent-colored). Gate visibility to `@media (min-width:1024px) and (hover:hover)` (e.g. a `hidden lg:[@media(hover:hover)]:block` utility or a scoped media query in `<style>`). Appear on rail hover/focus-within via `opacity 0->1` 150ms. `aria-label` exactly `Scroll {category} left` / `Scroll {category} right`.
    - Chevron action: `track.scrollBy({ left: ±track.clientWidth * 0.8, behavior: motion.prefersReducedMotion ? 'auto' : 'smooth' })`.

    Extreme-hide: a `$state` `{ atStart, atEnd, overflows }` recomputed by an `updateEdges()` function bound to the track's `onscroll` and a window `resize` listener (and once `onMount`/in an `$effect` after first layout). `atStart = scrollLeft <= 0`; `atEnd = scrollLeft + clientWidth >= scrollWidth - 1`; `overflows = scrollWidth > clientWidth + 1`. Left chevron gets `aria-hidden="true" tabindex="-1"` + `opacity-0 pointer-events-none` when `atStart || !overflows`; right chevron likewise when `atEnd || !overflows`. When `!overflows`, neither chevron is interactive (UI-SPEC few-card rule).

    Keyboard map (UI-SPEC § Rail keyboard table) — attach an `onkeydown` on the track (or each card link) that, when a card is focused:
    - `ArrowRight`/`ArrowLeft`: move focus to next/prev card link and `el.scrollIntoView({ inline: 'nearest', block: 'nearest' })`; `preventDefault()`.
    - `Home`/`End`: focus first/last card link and scroll it into view; `preventDefault()`.
    - (Enter/Space already work via the native `<a>` inside VideoCard — do not re-handle navigation here.)
    Implement focus movement by querying the rendered card anchors within the track (e.g. `track.querySelectorAll('a[href]')`) and indexing relative to `document.activeElement`.

    Chevrons and dots/glyphs are NEUTRAL colored only (UI-SPEC § Color: accent is reserved for the ring/eyebrow/tick — never chevrons).

    Create/extend `src/lib/components/CategoryRail.svelte.test.ts` (mirror ContinueReelRail's harness). Cover the behaviors above. Because jsdom/browser layout may not produce real scroll metrics, drive the extreme-hide test by stubbing `scrollWidth`/`clientWidth`/`scrollLeft` on the track element (Object.defineProperty) then dispatching a `scroll` event and asserting `aria-hidden`/`tabindex` on the chevrons. Cover the `End`-focuses-last-card keyboard behavior with a real `keydown`.
  </action>
  <acceptance_criteria>
    - `grep -F "Scroll " src/lib/components/CategoryRail.svelte` matches AND both `left` and `right` aria-labels exist: `grep -E "Scroll .*(left|right)" src/lib/components/CategoryRail.svelte` returns >=2 lines (or template literals covering both).
    - `grep -F "aria-hidden" src/lib/components/CategoryRail.svelte` and `grep -F 'tabindex="-1"' src/lib/components/CategoryRail.svelte` (or `tabindex={-1}`) match (extreme-hide).
    - `grep -F "scrollBy" src/lib/components/CategoryRail.svelte` matches AND `grep -F "0.8" src/lib/components/CategoryRail.svelte` matches (~one viewport).
    - `grep -E "ArrowRight|ArrowLeft" src/lib/components/CategoryRail.svelte` and `grep -E "'Home'|\"Home\"|Home" src/lib/components/CategoryRail.svelte` and `grep -E "End" src/lib/components/CategoryRail.svelte` match (keyboard map).
    - `grep -F "scrollWidth" src/lib/components/CategoryRail.svelte` and `grep -F "clientWidth" src/lib/components/CategoryRail.svelte` match (extreme computation).
    - `grep -F "hover: hover" src/lib/components/CategoryRail.svelte` OR `grep -F "(hover:hover)" src/lib/components/CategoryRail.svelte` OR `grep -F "lg:" src/lib/components/CategoryRail.svelte` matches (desktop-only chevrons).
    - `grep -F "motion.prefersReducedMotion" src/lib/components/CategoryRail.svelte` matches (smooth vs auto) AND `grep -c "matchMedia" src/lib/components/CategoryRail.svelte` returns 0.
    - `pnpm test -- src/lib/components/CategoryRail.svelte.test.ts` passes.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm test -- src/lib/components/CategoryRail.svelte.test.ts</automated>
  </verify>
  <done>Rail has desktop hover chevrons that hide at both extremes and when it doesn't overflow; full arrow/Home/End keyboard nav; chevron scroll honors reduced-motion; behavior test green.</done>
</task>

</tasks>

<verification>
- `pnpm test -- src/lib/components/CategoryRail.svelte.test.ts` passes.
- Rail reads motion only from `motion.prefersReducedMotion`; chevrons/glyphs are neutral-colored (accent reserved for tick + card ring).
- Empty categories render nothing; non-overflowing rails render no interactive chevrons.
</verification>

<success_criteria>
- Plan 04 can drop `<CategoryRail {category} eagerFirstCards={i === 0} />` in a loop and get a fully keyboard/touch/mouse-navigable labeled rail.
- All Task acceptance_criteria grep/test checks pass.
</success_criteria>

<output>
After completion, create `.planning/phases/02-homepage-rails/02-02-SUMMARY.md` documenting the rail prop contract (`{ category, eagerFirstCards }`), the extreme-hide computation, and the keyboard map for Plan 04.
</output>
