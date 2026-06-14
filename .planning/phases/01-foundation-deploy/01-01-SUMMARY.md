---
phase: 01-foundation-deploy
plan: 01
subsystem: foundation
tags: [sveltekit, adapter-static, tailwind-v4, oklch, fonts, pnpm, prerender]
dependency_graph:
  requires: []
  provides:
    - "SvelteKit 5 + adapter-static project that installs, type-checks, and prerenders to build/"
    - "OKLCH @theme design tokens (fonts, focus ring, neutral ramp, 8 category accents)"
    - "Self-hosted woff2 fonts (Source Serif 4, Inter, JetBrains Mono)"
    - "HTML shell (app.html) + minimal app shell layout importing app.css"
    - "BASE_PATH-driven paths.base for GitHub Pages subpath deploy"
  affects:
    - "01-02 (data layer) extends vite.config.ts with the videos validation plugin"
    - "01-03 (app shell) replaces the minimal +layout.svelte with TopNav/Footer/skip-link"
    - "02-02 ships static/posters/ and removes the scoped handleHttpError allowance"
tech_stack:
  added:
    - "@sveltejs/kit 2.59.1"
    - "@sveltejs/adapter-static 3.0.10"
    - "@sveltejs/vite-plugin-svelte 7.1.2"
    - "svelte 5.55.5"
    - "tailwindcss 4.3.0 + @tailwindcss/vite 4.3.0 + @tailwindcss/typography 0.5.19"
    - "vite 8.0.7"
    - "typescript 5.9.3 + svelte-check 4.4.6"
    - "zod 4.4.3"
  patterns:
    - "Tailwind v4 plugin BEFORE sveltekit plugin in vite.config.ts (Phase 1 Pattern)"
    - "Layout-level prerender = true so every route inherits prerenderability"
    - "OKLCH design tokens via Tailwind v4 @theme"
    - "Self-hosted fonts, font-display: swap, zero cross-origin"
key_files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - .npmrc
    - .nvmrc
    - .gitignore
    - tsconfig.json
    - svelte.config.js
    - vite.config.ts
    - src/app.d.ts
    - src/app.css
    - src/app.html
    - src/routes/+layout.ts
    - src/routes/+layout.svelte
    - src/routes/+page.svelte
    - static/fonts/ (7 woff2)
    - static/.nojekyll
    - static/robots.txt
    - static/og-image.jpg
    - static/favicon.ico
    - static/favicon.png
    - static/favicon-16.png
    - static/favicon-32.png
    - static/favicon-192.png
    - static/favicon-512.png
    - static/apple-touch-icon.png
  modified: []
decisions:
  - "Scoped handleHttpError to the single pending poster preload so the foundation build stays green until Plan 02-02 ships posters; strict prerender preserved for everything else."
metrics:
  duration_min: 43
  tasks: 3
  files: 24
  completed: 2026-06-14
---

# Phase 01 Plan 01: Scaffold, Tooling & Tokens Summary

Scaffolded a SvelteKit 5 + adapter-static project (pnpm) forked from `michelle_ngo_three`: ported the build tooling, Tailwind v4 OKLCH design tokens, self-hosted woff2 fonts, static assets, and HTML shell, then shipped a minimal placeholder homepage so `pnpm build` is green and prerenders a static `build/index.html`.

## What Was Built

- **Task 1 — Project config & tooling** (`27b2919`): `package.json` (name `michelle-ngo-six`, minimal devDependencies, dev/build/preview/check scripts), `svelte.config.js` (adapter-static + `paths.base` from `BASE_PATH`), minimal `vite.config.ts` (tailwindcss before sveltekit), `tsconfig.json` (strict + noUncheckedIndexedAccess + noImplicitOverride), `.npmrc`, `.nvmrc`, `.gitignore`, `pnpm-workspace.yaml`, `src/app.d.ts`. `pnpm install` exits 0.
- **Task 2 — Tokens, fonts, shell, assets** (`7a5b5c4`): `src/app.css` (Tailwind v4 import, 7 `@font-face` rules, `@theme` OKLCH tokens — 3 font vars, focus ring tokens, 8-step neutral ramp, 8 `--color-cat-*` accents, chrome-height vars, global `:focus-visible` double-ring, `@utility scrollbar-hide`), `src/app.html` (sveltekit head/body tokens + LCP poster preload), 7 self-hosted woff2 fonts, favicons, og-image, robots.txt, `.nojekyll`. No CNAME, no posters.
- **Task 3 — Placeholder homepage + green build** (`787c072`): `+layout.ts` (prerender=true, trailingSlash='always'), minimal `+layout.svelte` importing `app.css`, placeholder `+page.svelte` exercising `font-display`/neutral tokens. `pnpm build` exits 0 and emits `build/index.html`, `build/.nojekyll`, `build/_app/`.

## Verification

- `pnpm install` → exit 0 (generates pnpm-lock.yaml + node_modules).
- `pnpm build` → exit 0; `build/index.html` contains prerendered "Michelle Ngo"; `build/.nojekyll` and `build/_app/` present.
- `pnpm check` → 0 errors, 0 warnings across 263 files.
- `grep "@theme" src/app.css` matches; `ls static/fonts/*.woff2` = 7; `static/CNAME` absent.
- `svelte.config.js` reads `process.env.BASE_PATH`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scoped prerender error handling for the pending poster preload**
- **Found during:** Task 3 (first `pnpm build`).
- **Issue:** `app.html` (ported verbatim per Task 2) preloads `/posters/vimeo-264677021.jpg`, which does not ship until Plan 02-02. The plan's note predicted this 404 would be "non-fatal," but adapter-static's `strict: true` posture treats it as a fatal prerender error (`Error: 404 /posters/vimeo-264677021.jpg (linked from /)`), so the build exited 1.
- **Fix:** Added a narrowly-scoped `kit.prerender.handleHttpError` to `svelte.config.js` that ignores ONLY `/posters/vimeo-264677021.jpg` and re-throws every other HTTP error — preserving strict prerender for all other links. This is the SvelteKit-recommended mechanism (the build error itself points to it).
- **Files modified:** `svelte.config.js`.
- **Commit:** `787c072` (committed with Task 3).
- **Follow-up:** Plan 02-02 ships `static/posters/` and should remove this allowance to restore fully-strict prerender.

## Known Stubs

- `src/routes/+page.svelte` is an intentional minimal placeholder ("Site coming soon"). The real YouTube-style hero + category rails homepage lands in Phase 2 (per plan notes — no `$lib/components` exist yet). Documented as expected, not blocking.
- `src/routes/+layout.svelte` is a minimal CSS-only shell; the full app shell (TopNav/Footer/skip-link/state init) lands in Plan 01-03.

## Self-Check: PASSED
