---
phase: 02-homepage-rails
plan: 02
subsystem: homepage
tags: [rail, scroll-snap, keyboard-nav, accessibility, chevrons]
requires:
  - src/lib/components/VideoCard.svelte (Plan 02-01)
  - src/lib/components/categoryAccent.ts (categoryAccentBg)
  - src/lib/data (getByCategory, categoryToSlug, Category, Video)
  - src/lib/state/motion.svelte (motion.prefersReducedMotion)
provides:
  - src/lib/components/CategoryRail.svelte
affects:
  - Plan 02-04 (homepage assembly: instantiates one CategoryRail per category)
tech-stack:
  added: []
  patterns:
    - "$derived props (slug/cards) so a re-render with a new category stays correct"
    - "Extreme-hide via $state edges {atStart, atEnd, overflows} recomputed on scroll + resize + first layout"
    - "Keyboard nav by querying card anchors within the track and indexing off document.activeElement"
    - "Chevron scroll honors motion.prefersReducedMotion (smooth vs auto) — single locked rune, no matchMedia"
    - "Desktop-only chevrons gated via @media (min-width:1024px) and (hover:hover)"
key-files:
  created:
    - src/lib/components/CategoryRail.svelte
  modified: []
decisions:
  - "Rail tick color comes from categoryAccentBg(category) (the literal SHORT-token bg-cat-*/15 map class). NEVER bg-cat-${categoryToSlug(category)} — that LONG slug has no Tailwind utility and would silently render no background."
  - "slug (from categoryToSlug) is used ONLY for the rail id / aria-labelledby string."
  - "Both planned tasks (track+render, chevrons+keyboard) ship in one new file, so the component lands as one atomic commit rather than splitting partial content of a single new file."
metrics:
  duration: ~8m
  completed: 2026-06-14
---

# Phase 2 Plan 02-02: Category Rail Summary

A labeled, horizontally scroll-snapping rail of `VideoCard`s for a single category — the repeating unit of the homepage. Desktop hover chevrons scroll ~one viewport and hide at both extremes (and when the track doesn't overflow); full Arrow/Home/End keyboard nav moves card focus and scrolls it into view; the 3px accent tick is colored via `categoryAccentBg(category)`; empty categories render nothing.

## Prop Contract (for Plan 04)

```svelte
<CategoryRail {category} eagerFirstCards={i === 0} />
```

- `category: Category` — required. Drives the heading text (verbatim), the `categoryAccentBg` tick color, the `rail-{slug}` id, and `getByCategory(category)` for the cards.
- `eagerFirstCards?: boolean` (default `false`) — when `true`, the first 4 cards render `eager`. Plan 04 passes `true` ONLY to rail #0 (LCP region); all other rails leave it `false` so every other poster stays `loading="lazy"`.

Plan 04 drops `<CategoryRail {category} eagerFirstCards={i === 0} />` in a `{#each getCategoriesInDisplayOrder() as category, i}` loop and gets a fully keyboard/touch/mouse-navigable labeled rail. A category with zero videos self-omits, so no empty-rail guard is needed at the call site.

## Accent Tick — Color Source (DO NOT regress)

The 3px tick background is `categoryAccentBg(category)` — the literal `bg-cat-*/15` class from `categoryAccent.ts`, keyed by Category NAME. It is NEVER constructed from `categoryToSlug()`: that yields a LONGER slug (e.g. `pbs-american-portrait`) for which no `bg-cat-*` utility exists, and Tailwind's scanner would never generate it (silent no-op background). `slug` in this file is used ONLY for the `id`/`aria-labelledby` string.

## Extreme-hide Computation

`updateEdges()` reads the track's `scrollLeft`, `clientWidth`, `scrollWidth` into `$state` `edges`:
- `atStart = scrollLeft <= 0`
- `atEnd = scrollLeft + clientWidth >= scrollWidth - 1`
- `overflows = scrollWidth > clientWidth + 1`

Bound to the track's `onscroll`, a window `resize` listener, and run once after first layout via `$effect`. The left chevron gets `aria-hidden`/`tabindex=-1`/`is-hidden` when `atStart || !overflows`; the right chevron likewise when `atEnd || !overflows`. When the track doesn't overflow, neither chevron is interactive or visible (UI-SPEC few-card rule). Chevrons are desktop-only (`@media (min-width:1024px) and (hover:hover)`) and neutral-colored (accent reserved for the tick + card ring).

## Keyboard Map

A delegating `onkeydown` on the track acts only when a card anchor is the active element:

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowLeft` | move focus to next/prev card anchor, `scrollIntoView({ inline: 'nearest', block: 'nearest' })`, `preventDefault()` |
| `Home` / `End` | focus first/last card anchor and scroll it into view, `preventDefault()` |
| `Enter` / `Space` | native `<a>` behavior inside VideoCard (not re-handled here) |

Focus traversal queries `track.querySelectorAll('a[href]')` and indexes relative to `document.activeElement`.

## Chevron Scroll + Reduced Motion

`scrollByViewport(±1)` calls `track.scrollBy({ left: dir * clientWidth * 0.8, behavior: motion.prefersReducedMotion ? 'auto' : 'smooth' })`. The reduced-motion branch reads the single locked `motion.prefersReducedMotion` rune — no `matchMedia` anywhere in the file.

## Deviations from Plan

None for behavior. Two clean-ups beyond the literal plan text, both within the current task's file and required for a warning-free `pnpm check`:

- **[Rule 1 - Bug] `$derived` props.** `const slug`/`const cards` initially captured only the prop's initial value (svelte-check `state_referenced_locally` warning). Changed to `$derived(categoryToSlug(category))` / `$derived(getByCategory(category))` so a re-render with a new `category` stays correct. Files: `src/lib/components/CategoryRail.svelte`. Commit: c2b7f05.
- **[Rule 2 - a11y] Delegation lint.** The track's delegating `onkeydown` triggered `a11y_no_noninteractive_element_interactions`. The handler only acts when a real, natively-focusable card anchor is active, so the lint is a known false-positive for this delegation pattern; suppressed with a documented `<!-- svelte-ignore -->` rather than restructuring focus handling. Files: `src/lib/components/CategoryRail.svelte`. Commit: c2b7f05.

## Verification

- `pnpm check` → 368 FILES, 0 ERRORS, 0 WARNINGS.
- `pnpm build` → exit 0, prerender succeeded (`✔ done`, wrote site to `build`).
- All Task 1 + Task 2 grep acceptance criteria pass, including the forbidden `bg-cat-${slug}` trap returning no matches and `matchMedia` count = 0.

## Known Stubs

None. The rail is fully wired to live data via `getByCategory(category)`; no placeholder/mock data paths.

## Self-Check: PASSED

- FOUND: src/lib/components/CategoryRail.svelte
- FOUND: commit c2b7f05
