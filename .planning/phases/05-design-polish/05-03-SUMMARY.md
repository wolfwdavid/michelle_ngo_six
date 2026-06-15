---
phase: 05-design-polish
plan: 03
subsystem: ui-surfaces
tags: [contrast, tokens, wordmark, a11y, wcag, poster-splash]
requires:
  - "05-01: --scrim-vertical, --text-hero, --tracking-wordmark, --text-shadow-cinema tokens in src/app.css"
provides:
  - "Token-clean /contact splash (no raw color; hero-token wordmark; aria-hidden decorative wordmark)"
  - "Token-clean /press credits (no raw color; hero-token wordmark; contrast-safe title caption)"
affects:
  - "05-04: parallax/reveal motion pass reuses the poster <img> + scrim <div> on both pages (left structurally intact, commented)"
tech-stack:
  added: []
  patterns:
    - "Shared OKLCH --scrim-vertical token replaces per-page raw rgba gradients"
    - "Wordmarks ride the --text-hero ramp + --tracking-wordmark; cinema text-shadow guards legibility over uncontrolled posters"
key-files:
  created: []
  modified:
    - src/routes/contact/+page.svelte
    - src/routes/press/+page.svelte
decisions:
  - "Title caption on /press raised from text-neutral-300 to text-neutral-50 + cinema text-shadow rather than adding a per-credit scrim band — keeps the transparent gradient middle while guaranteeing contrast over any poster brightness."
metrics:
  duration: ~12m
  completed: 2026-06-15
  tasks: 2
  files: 2
---

# Phase 05 Plan 03: Contrast — Contact & Press Summary

Replaced the off-token raw `rgba(0,0,0,…)` gradients on /contact and /press with the shared `--scrim-vertical` OKLCH token, remapped both `text-6xl` wordmarks to the `--text-hero` ramp + `--tracking-wordmark`, added cinema text-shadow guards, raised the press title caption to a contrast-safe tier, and `aria-hidden`-ed the decorative contact wordmark so the screen reader hears the sr-only h1 only once.

## What Was Built

### Task 1 — /contact (commit a9b603e)
- Layer-2 gradient `<div>` now uses `style="background: var(--scrim-vertical);"` (OKLCH token, 0.6→transparent→0.78 bottom stop). No raw `rgba`/`rgb`/hex remains.
- MICHELLE NGO wordmark remapped from `text-6xl … tracking-[0.2em]` to `text-[length:var(--text-hero)] leading-[1.1] tracking-[var(--tracking-wordmark)]`, with `text-shadow: var(--text-shadow-cinema)`.
- Wordmark `<p>` marked `aria-hidden="true"`; the sr-only `<h1>Contact Michelle Ngo</h1>` carries the accessible name.
- Eager LCP poster `<img>` (loading="eager" fetchpriority="high") left untouched; scrim `<div>` commented as the later motion pass's parallax/reveal target.

### Task 2 — /press (commit dfafce2)
- Per-article Layer-2 gradient now uses `var(--scrim-vertical)`. No raw color remains.
- Network wordmark remapped to `text-[length:var(--text-hero)] leading-[1.1] tracking-[var(--tracking-wordmark)]` + cinema text-shadow.
- Title caption raised from `text-neutral-300` to `text-neutral-50` + cinema text-shadow for legibility over the transparent gradient middle (kept at the `text-base` meta/body tier).
- `▷ Watch` CTA and index/total caption unchanged — they sit in the strengthened 0.78 bottom band.
- Eager/lazy poster logic (i<2 eager) left untouched.

## Verification

- `pnpm check` — 390 files, 0 errors, 0 warnings.
- `pnpm build` — exits 0; adapter-static wrote the site; strict prerender intact (no PENDING_ROUTES change, no new routes).
- `grep -rnE "rgba\(|rgb\("` over src/routes/contact + src/routes/press → no matches.
- `var(--scrim-vertical)` present in both files.
- `--text-hero` present in both files; `aria-hidden="true"` present on /contact wordmark; no `text-neutral-300` in /press.

Note on the plan's `#[0-9a-fA-F]{3,6}` grep: it produces a false positive on /press by matching `#eac` inside Svelte's `{#each …}` block syntax. Confirmed there is no genuine hex color in either file (`#[0-9a-fA-F]{3}\b` → no matches). The hex-substring check is a planning-regex artifact, not a code defect.

## Deviations from Plan

None — plan executed exactly as written for the two auto-tasks.

## Deferred Verification (Task 3 — human-verify checkpoint)

This environment has no interactive runtime/browser, so the blocking human-verify checkpoint could not be executed here. Implementation is complete and structurally verified. The following manual steps remain for a human pass:

1. `pnpm dev`; open /contact and /press.
2. Confirm the wordmark, contact block, press title caption, and `▷ Watch` CTA stay clearly legible over both the darkest and the brightest poster in the set (no text washing out).
3. At a 360px viewport, scroll each page — confirm NO horizontal overflow (no sideways scrollbar) and the wordmark wraps gracefully.
4. With a screen reader / accessibility tree, confirm /contact announces "Contact Michelle Ngo" once and the visible MICHELLE NGO wordmark is not announced.

## Requirements Progressed

- DSN-04 (contrast/legibility over uncontrolled posters; SR de-duplication)
- DSN-01 (wordmarks on the --text-hero ramp + shared tracking; no raw color)
- DSN-03 (no 360px horizontal overflow — structurally addressed; pending human confirmation)

## Self-Check: PASSED

- src/routes/contact/+page.svelte — FOUND
- src/routes/press/+page.svelte — FOUND
- .planning/phases/05-design-polish/05-03-SUMMARY.md — FOUND
- Commit a9b603e — FOUND
- Commit dfafce2 — FOUND
