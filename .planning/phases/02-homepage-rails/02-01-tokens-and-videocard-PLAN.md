---
phase: 02-homepage-rails
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app.css
  - src/lib/components/VideoCard.svelte
  - src/lib/components/VideoCard.svelte.test.ts
autonomous: true
requirements: [HOME-03]
must_haves:
  truths:
    - "A video card renders a 16/9 poster, a title, and (when present) a duration badge."
    - "Hovering a card with full motion tilts it toward the cursor (max +/-6deg), scales 1.03, lifts a shadow, shows a category-accent ring, and fades the title up."
    - "A keyboard-focused card shows the global focus ring, scale + ring + shadow, but no tilt."
    - "With prefers-reduced-motion, the card never tilts or scales — only brighten + ring + shadow + instant title color change."
    - "Activating a card navigates to /watch/{id}."
  artifacts:
    - path: "src/lib/components/VideoCard.svelte"
      provides: "Cinematic poster card; <a href> to /watch/{id}; cursor-tilt; reduced-motion branch"
      min_lines: 80
      contains: "categoryAccentRing("
    - path: "src/app.css"
      provides: "--ease-cinematic token + global reduced-motion backstop"
      contains: "--ease-cinematic"
  key_links:
    - from: "src/lib/components/VideoCard.svelte"
      to: "/watch/{video.id}"
      via: "<a href> with base prefix"
      pattern: "watch/"
    - from: "src/lib/components/VideoCard.svelte"
      to: "motion.prefersReducedMotion"
      via: "import from $lib/state/motion.svelte"
      pattern: "motion\\.prefersReducedMotion"
    - from: "src/lib/components/VideoCard.svelte"
      to: "--tilt-x / --tilt-y"
      via: "pointermove handler sets CSS custom props"
      pattern: "--tilt-"
---

<objective>
Build the foundational motion tokens and the cinematic VideoCard component that every rail (Plan 02) renders. The card is a real link to /watch/{id} with a CSS-only cursor-tilt, accent ring, lift shadow, and title fade-up — all gated on the single `motion.prefersReducedMotion` rune.

Purpose: VideoCard is the leaf primitive of the homepage. Building it first (with its own behavior test) lets the rail and homepage-assembly plans consume a finished, tested contract instead of exploring.
Output: `src/app.css` motion tokens + reduced-motion backstop; `src/lib/components/VideoCard.svelte`; `VideoCard.svelte.test.ts`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-homepage-rails/02-CONTEXT.md
@.planning/phases/02-homepage-rails/02-UI-SPEC.md

<interfaces>
<!-- Contracts the executor needs — use directly, no codebase exploration. -->

From src/lib/data/index.ts and src/lib/data/schema.ts:
```typescript
export type Video = { source: 'youtube' | 'vimeo'; id: string; title: string;
  uploader: string; published: string /* YYYY-MM-DD */; category: Category;
  description?: string; duration_seconds?: number; featured: boolean; hidden: boolean; tags: string[]; ... };
export type Category = 'PBS American Portrait' | 'Promos & Trailers' | 'Branded Content'
  | 'Documentary / Short Film' | 'Reel' | 'Personal / Tribute' | 'Educational / Nonprofit' | 'Other';
```

From src/lib/data/posters.ts:
```typescript
export function getPosterFor(video: Pick<Video, 'source' | 'id'>): string; // returns a path like "/posters/vimeo-264677021.jpg"
```

From src/lib/components/categoryAccent.ts:
```typescript
export function categoryAccent(category: Category): string;     // "text-cat-pbs" etc (literal map — Tailwind scanner safe)
export function categoryAccentRing(category: Category): string; // "ring-cat-pbs/40" etc
```

From src/lib/state/motion.svelte.ts (SINGLE SOURCE OF TRUTH for motion):
```typescript
export const motion: { readonly prefersReducedMotion: boolean };
export function __setPrefersReducedMotionForTests(v: boolean): void; // test-only
export function __resetMotionStateForTests(): void;                  // test-only
```

From $app/paths: `import { base } from '$app/paths';` — every href is `` `${base}/watch/${id}` ``.
</interfaces>

<reference>
<!-- Adapt these _three components for poster + card markup. NOTE: _three has NO VideoCard.svelte; -->
<!-- the closest card mechanics are the rail card markup inside ContinueReelRail.svelte and PosterImage.svelte. -->
@../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte
@../michelle_ngo_three/src/lib/components/PosterImage.svelte
</reference>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add motion tokens + reduced-motion backstop to app.css</name>
  <read_first>
    - src/app.css (the file being modified — confirm existing :root @theme block, --chrome-nav-height, scrollbar-hide @utility, and global :focus-visible rule are present)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § Motion Tokens (lines ~228-247) and § Layout (--content-max, --page-gutter)
  </read_first>
  <action>
    In `src/app.css`, inside the existing `:root` / `@theme` block (alongside the existing `--ring-focus*` and `--chrome-nav-height` tokens), add these three custom properties verbatim from the UI-SPEC:
    - `--ease-cinematic: cubic-bezier(0.4, 0, 0.2, 1);`
    - `--content-max: 1440px;`
    - `--page-gutter: 16px;` with a `@media (min-width: 640px) { :root { --page-gutter: 24px; } }` override (UI-SPEC: 16px mobile -> 24px >=640px).

    Then add the global reduced-motion backstop at the top level of app.css (copy exactly from UI-SPEC § Motion Tokens):
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```
    Do NOT introduce any new color tokens — the 8 `--color-cat-*` and `--color-neutral-*` tokens already exist. Do NOT override the existing global `:focus-visible` rule.
  </action>
  <acceptance_criteria>
    - `grep -F "--ease-cinematic: cubic-bezier(0.4, 0, 0.2, 1)" src/app.css` returns a match.
    - `grep -F "--content-max: 1440px" src/app.css` returns a match.
    - `grep -F "--page-gutter" src/app.css` returns at least two matches (base + 640px override).
    - `grep -F "prefers-reduced-motion: reduce" src/app.css` returns a match AND `grep -F "transition-duration: 0.001ms" src/app.css` returns a match.
    - The existing `:focus-visible` rule is unchanged: `grep -F "outline: 2px solid var(--ring-focus)" src/app.css` still returns a match.
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && grep -F "--ease-cinematic" src/app.css && grep -F "transition-duration: 0.001ms" src/app.css</automated>
  </verify>
  <done>app.css contains --ease-cinematic, --content-max, --page-gutter (with 640px override), and the global reduced-motion backstop; the existing :focus-visible rule is intact.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build VideoCard.svelte with cursor-tilt + reduced-motion branch (+ behavior test)</name>
  <read_first>
    - ../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte (card anchor markup: aspect-video poster <a>, line-clamp title, base-prefixed /watch/{id} href)
    - ../michelle_ngo_three/src/lib/components/PosterImage.svelte (poster <img> attrs: object-cover, decoding="async", aspect-ratio container)
    - src/lib/components/categoryAccent.ts (categoryAccent / categoryAccentRing literal-map contract — DO NOT build dynamic class strings; Tailwind scanner only sees literals)
    - src/lib/state/motion.svelte.ts (the rune + test hooks __setPrefersReducedMotionForTests / __resetMotionStateForTests)
    - .planning/phases/02-homepage-rails/02-UI-SPEC.md § VideoCard Spec (lines ~190-225) — EXACT hover/focus/reduced-motion values
    - ../michelle_ngo_three/src/lib/components/ContinueReelRail.svelte.test.ts (vitest-browser-svelte render pattern to mirror in the new test)
  </read_first>
  <behavior>
    - Renders an `<a href>` whose href ends with `/watch/{video.id}` and has `aria-label="Watch {title}"`.
    - Renders a poster `<img>` with `alt={video.title}`, `loading="lazy"` (default), `decoding="async"`, inside an `aspect-[16/9]` `rounded-xl` container.
    - When `video.duration_seconds` is present, renders an `m:ss` mono duration badge; when absent, renders no badge.
    - With `__setPrefersReducedMotionForTests(true)`: the card's inline `transform` stays `none` / no `--tilt-*` is applied on pointermove (tilt handler early-returns).
    - With reduced-motion false: a simulated pointermove sets `--tilt-x` / `--tilt-y` within +/-6deg.
    - The card applies `categoryAccentRing(video.category)` on hover/focus.
  </behavior>
  <action>
    Create `src/lib/components/VideoCard.svelte`. Props: `{ video: Video; eager?: boolean }` ($props). Implement per the UI-SPEC § VideoCard Spec EXACT values:

    Markup:
    - Root: `<a href={`${base}/watch/${video.id}`} aria-label={`Watch ${video.title}`} data-sveltekit-preload-data="hover" class="video-card ...">`. (eslint `svelte/no-navigation-without-resolve` is config-disabled for these literal hrefs as in the ported chrome — if it warns, add the same per-file config exception the existing TopNav/MobileMenu use; do NOT inline a directive if config handles it.)
    - Poster container: `aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900` with `<img src={`${base}${getPosterFor(video)}`} alt={video.title} decoding="async" loading={eager ? 'eager' : 'lazy'} class="h-full w-full object-cover" />`. Default `eager=false` (rail passes `eager` for the first cards).
    - Duration badge (only `{#if video.duration_seconds}`): bottom-right, 4px inset, `font-mono text-xs`, text `--color-neutral-50` on `oklch(0.16 0 0 / 0.78)` pill, `rounded` (4px). Format seconds as `m:ss` (e.g. 95 -> "1:35") via a small helper in the script.
    - Title: `<span>` below poster, `font-sans` 16px weight 500 (`text-base font-medium`), `--color-neutral-50`, 2-line clamp (`line-clamp-2`), 8px top gap (`mt-2`).

    Motion (single source: `import { motion } from '$lib/state/motion.svelte'`):
    - Two CSS custom props `--tilt-x` / `--tilt-y` default `0deg`, set on the root via `style:--tilt-x` / `style:--tilt-y` bound to `$state` values.
    - `onpointermove`: if `motion.prefersReducedMotion` -> return immediately (no tilt). Otherwise compute pointer offset from card center, map to rotation, CLAMP each to [-6deg, 6deg], write to the tilt state.
    - `onpointerleave` / `onblur`: reset tilt state to `0deg`.
    - Hover/focus visual via CSS in the `<style>` block, EXACT from UI-SPEC:
      - Rest: `transform: none; box-shadow: 0 1px 2px oklch(0.16 0 0 / 0.4);`
      - `:where(.video-card:hover, .video-card:focus-visible)` (full motion): `transform: perspective(800px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(1.03);` lift shadow `0 12px 28px -8px oklch(0.16 0 0 / 0.7), 0 2px 6px oklch(0.16 0 0 / 0.5);` poster `filter: brightness(1.06);` title color neutral-300 -> neutral-50 + translateY(4px->0) over 180ms.
      - Transition: `transform 180ms var(--ease-cinematic), box-shadow 180ms, filter 180ms;` (tilt itself follows cursor with no transition).
    - Accent ring: apply `categoryAccentRing(video.category)` (literal class from the map) on hover/focus-visible together with `ring-2 ring-offset-2 ring-offset-neutral-950`. Bind the ring class onto the root conditionally on a `$state` `active` flag toggled by pointerenter/leave/focus/blur, OR via Tailwind `hover:`/`focus-visible:` variants combined with the mapped `ring-cat-*/40` literal — pick whichever keeps the class literal so Tailwind generates it.
    - Reduced-motion branch (UI-SPEC): when `motion.prefersReducedMotion` is true, NO tilt/scale — only `filter: brightness(1.08)` + the accent ring (2px) + lift shadow, plus instant title color change. Achieve this by guarding the tilt JS (already) AND scoping the transform rule under `:where(...)` only when not reduced — simplest: keep `transform` reading the tilt vars which stay `0deg` under reduced motion, and drop the `scale(1.03)` when reduced by binding a class `motion-ok` derived from `!motion.prefersReducedMotion`. Document the chosen mechanism in a code comment.
    - Do NOT call `matchMedia` anywhere. Do NOT override `:focus-visible`. No `<canvas>` / WebGL.

    Also create `src/lib/components/VideoCard.svelte.test.ts` mirroring the ContinueReelRail test harness (vitest-browser-svelte). Cover the behaviors above; use `__setPrefersReducedMotionForTests` + `__resetMotionStateForTests` (afterEach) to assert the reduced-motion branch leaves transform `none` / no tilt vars set.
  </action>
  <acceptance_criteria>
    - `grep -F 'aria-label={`Watch ${video.title}`}' src/lib/components/VideoCard.svelte` OR `grep -F "Watch " src/lib/components/VideoCard.svelte` returns a match, and `grep -F "watch/" src/lib/components/VideoCard.svelte` returns a match (link to /watch/{id}).
    - `grep -F "aspect-[16/9]" src/lib/components/VideoCard.svelte` and `grep -F "rounded-xl" src/lib/components/VideoCard.svelte` both match.
    - `grep -F "scale(1.03)" src/lib/components/VideoCard.svelte` matches.
    - `grep -F "categoryAccentRing(" src/lib/components/VideoCard.svelte` matches.
    - `grep -F "motion.prefersReducedMotion" src/lib/components/VideoCard.svelte` matches AND `grep -c "matchMedia" src/lib/components/VideoCard.svelte` returns 0.
    - `grep -F "--tilt-x" src/lib/components/VideoCard.svelte` and `grep -F "--tilt-y" src/lib/components/VideoCard.svelte` both match; `grep -F "6deg" src/lib/components/VideoCard.svelte` matches (clamp).
    - `grep -F "var(--ease-cinematic)" src/lib/components/VideoCard.svelte` matches.
    - `grep -c "canvas" src/lib/components/VideoCard.svelte` returns 0.
    - `pnpm test -- src/lib/components/VideoCard.svelte.test.ts` passes (reduced-motion branch test asserts no tilt).
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_six" && pnpm test -- src/lib/components/VideoCard.svelte.test.ts</automated>
  </verify>
  <done>VideoCard renders poster+title+optional badge as an <a> to /watch/{id}; full-motion hover tilts (clamped ±6deg)/scales/lifts/rings/fades; reduced-motion branch (driven solely by the motion rune) drops tilt+scale; behavior test green.</done>
</task>

</tasks>

<verification>
- `pnpm test -- src/lib/components/VideoCard.svelte.test.ts` passes.
- VideoCard reads motion exclusively from `motion.prefersReducedMotion` (no `matchMedia`).
- No raw hex / `rgb(` colors and no `<canvas>`/WebGL introduced.
- app.css adds the three tokens + reduced-motion backstop without touching the focus-visible rule.
</verification>

<success_criteria>
- A different executor can render `<VideoCard {video} />` and get a cinematic, accessible, /watch-linked card with the exact UI-SPEC hover/reduced-motion behavior.
- All Task acceptance_criteria grep/test checks pass.
</success_criteria>

<output>
After completion, create `.planning/phases/02-homepage-rails/02-01-SUMMARY.md` documenting: the exact tilt math used, the chosen reduced-motion mechanism, and the VideoCard prop contract (`{ video, eager }`) for Plan 02 to consume.
</output>
