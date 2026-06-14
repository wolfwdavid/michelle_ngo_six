---
phase: 01-foundation-deploy
plan: 04
subsystem: deploy
tags: [sitemap, prerender, github-pages, base-path, ci, deploy, dep-02, dep-03, dep-04]
dependency_graph:
  requires:
    - "01-01 (scaffold): adapter-static + strict prerender + paths.base = BASE_PATH + pnpm-lock.yaml"
    - "01-03 (app shell): prerendered homepage with TopNav/Footer chrome; scoped handleHttpError allow-list for forward-phase routes"
  provides:
    - "src/routes/sitemap.xml/+server.ts — phase-scoped prerendered sitemap (homepage only, prerender = true)"
    - ".github/workflows/deploy.yml — minimal GitHub Pages workflow building with BASE_PATH=/${{ github.event.repository.name }} and publishing build/ via upload-pages-artifact + deploy-pages"
    - "Base-aware prerender handleHttpError: forward-phase 404 allow-list now strips the BASE_PATH prefix so the base-path CI build matches the same way the empty-base local build does"
  affects:
    - "Orchestrator: owns the push to origin/main, GitHub Pages source enablement (Settings -> Pages -> GitHub Actions), and the live human-verify at wolfwdavid.github.io/michelle_ngo_six"
    - "Phase 2-4: each new route (/work, /watch/[id], /about, /press, /contact, /pbs-american-portrait) adds a <url> to the sitemap and prunes its handleHttpError allow-list entry"
tech_stack:
  added: []
  patterns:
    - "Phase-scoped sitemap: advertise only routes that exist now; production canonical host (https://michellengo.net/) in <loc>, not the staging base path (intentional, sibling-aligned)"
    - "Minimal Pages workflow forked from michelle_ngo_four (no drift-check/lighthouse/playwright/route-manifest jobs that reference _three-specific scripts)"
    - "Base-aware handleHttpError: debase the prerenderer-reported path (which is BASE_PATH-prefixed under CI) before matching the forward-phase allow-list"
key_files:
  created:
    - src/routes/sitemap.xml/+server.ts
    - .github/workflows/deploy.yml
  modified:
    - svelte.config.js
decisions:
  - "Sitemap emits the production canonical host https://michellengo.net/ (not the staging base path) and only the homepage URL this phase — later phases append URLs as their routes ship."
  - "Forked _four's MINIMAL deploy.yml (not _three's) and kept BASE_PATH dynamic via /${{ github.event.repository.name }} so it resolves to /michelle_ngo_six with no hardcoded literal."
  - "Made the prerender handleHttpError allow-list base-aware (strip BASE_PATH prefix before matching) — required because the base-path build reports forward-phase 404s as /michelle_ngo_six/work etc., which the un-prefixed allow-list missed."
metrics:
  duration_min: 9
  tasks: 2
  files: 3
  completed: 2026-06-14
---

# Phase 01 Plan 04: Sitemap and Deploy Summary

Shipped a phase-scoped prerendered `sitemap.xml` (homepage only, `prerender = true`, production canonical host) and a MINIMAL GitHub Pages deploy workflow forked from `michelle_ngo_four` that builds with `BASE_PATH=/${{ github.event.repository.name }}` (resolves to `/michelle_ngo_six`) and publishes `build/` via `upload-pages-artifact` + `deploy-pages`. Verified DEP-03 (no hardcoded absolute internal asset paths) by grep and by inspecting the built output — every internal asset reference is relative (`./favicon.png`, `../../../fonts/*.woff2`) or `{base}`-prefixed, so all assets resolve under the base path. **The push, GitHub Pages source enablement, and live human-verify (Task 3 + Task 4) are delegated to the orchestrator** — this executor performed the local tasks only and did NOT push.

While proving the base-path build (the actual CI condition, which had never been exercised locally before this plan), found and fixed a real blocking bug: the Plan 01-03 `handleHttpError` allow-list matched un-prefixed paths and therefore 404-failed the build when `BASE_PATH` was set. Fixed it to be base-aware. `pnpm build` now exits 0 both with `BASE_PATH=/michelle_ngo_six` (CI) and with the empty base (local dev).

## What Was Built

- **Task 1 — Phase-scoped sitemap** (`fcfce00`): `src/routes/sitemap.xml/+server.ts` — `export const prerender = true`, a `GET()` returning a `<urlset>` with exactly one `<url>` for the homepage `/`, `<loc>https://michellengo.net/</loc>` (production canonical host, sibling-aligned posture — search engines won't crawl the noindex staging Pages URL), `<lastmod>` = build-time `new Date().toISOString().slice(0,10)`, `Content-Type: application/xml; charset=utf-8`. A header comment documents adding `/work`, `/watch/[id]`, `/about`, `/press`, `/contact`, `/pbs-american-portrait` as later phases ship them. `pnpm build` emits `build/sitemap.xml` (valid XML, starts with `<?xml`, contains `urlset` + `<loc>`) alongside `build/.nojekyll`.
- **Task 2 — Minimal Pages workflow + DEP-03 verify + base-aware fix** (`72939e1`): `.github/workflows/deploy.yml` forked from `_four`'s minimal template — `name: Deploy to GitHub Pages`, triggers `push: branches:[main]` + `workflow_dispatch`, permissions `contents: read` / `pages: write` / `id-token: write`, `concurrency: { group: pages, cancel-in-progress: false }`; `build` job (ubuntu-latest): checkout@v4 -> setup-node@v4 node 22 -> pnpm/action-setup@v4 `version: 11.0.9` `standalone: true` -> `pnpm install --frozen-lockfile` -> Build step `env: BASE_PATH: /${{ github.event.repository.name }}` running `pnpm build` -> `upload-pages-artifact@v3` `path: build/`; `deploy` job (`needs: build`): `github-pages` environment -> `deploy-pages@v4`. No drift-check / lighthouse / localStorage-grep / route-manifest / playwright jobs. Plus the base-aware `handleHttpError` fix in `svelte.config.js` (see Deviations).

## Verification

- **Task 1 gate:** `src/routes/sitemap.xml/+server.ts` contains `prerender = true`; `pnpm build` exits 0; `build/sitemap.xml` exists, starts with `<?xml`, contains `urlset` and `<loc>`; `build/.nojekyll` exists. PASS.
- **Task 2 gate:** `.github/workflows/deploy.yml` contains `BASE_PATH: /${{ github.event.repository.name }}`, `upload-pages-artifact`, `deploy-pages`; does NOT contain `drift-check|lighthouse|playwright`; `pnpm-lock.yaml` exists at repo root (unchanged, already committed). PASS.
- **DEP-03 grep (documented):** `grep -rnE '(src|href)="/' src --include='*.svelte'` -> **no matches** in any `.svelte` file. The only leading-slash internal references in the source are the documented, base-safe exceptions:
  - `src/app.html`: `%sveltekit.assets%/favicon.png` and `%sveltekit.assets%/posters/vimeo-264677021.jpg` — Vite-rewritten under base.
  - `src/app.css`: `url("/fonts/*.woff2")` (8 font faces) — Vite resolves these against the CSS asset base; the built CSS emits them as relative `url(../../../fonts/*.woff2)`, base-safe.
  - `src/routes/+layout.svelte` head: all favicons use `{base}/...`; OG/Twitter images use absolute production host `https://michellengo.net{base}/og-image.jpg`; skip-link is the `href="#main"` fragment.
- **Built-output leak check:** ran `BASE_PATH=/michelle_ngo_six pnpm build` and grepped `build/index.html` — **no bare-root internal asset ref outside `/michelle_ngo_six/`**. All asset refs are relative (`./favicon.png`, `../../../fonts/*.woff2`), so they resolve correctly under any base. PASS.
- **Base-path build (mirrors CI):** `BASE_PATH=/michelle_ngo_six pnpm build` exits 0; sitemap + `.nojekyll` emitted.
- **Empty-base regression:** `pnpm build` (no base) exits 0; sitemap emitted. No regression to local dev.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking build] Base-path build 404-failed: handleHttpError allow-list was not base-aware**
- **Found during:** Task 2 (proving the workflow's `BASE_PATH=/michelle_ngo_six` build — the actual CI condition, which had never been run locally; Plans 01-01..01-03 only ever built with the empty base).
- **Issue:** With `BASE_PATH` set, the SvelteKit prerenderer reports forward-phase route 404s **prefixed with the base** (e.g. `[404] GET /michelle_ngo_six/work/pbs-american-portrait`, `.../about`, `.../press`, `.../contact`, `.../pbs-american-portrait/`). The Plan 01-03 `kit.prerender.handleHttpError` allow-list in `svelte.config.js` matched **un-prefixed** paths (`/work`, `/about`, ...), so under the base build every forward-phase 404 missed the allow-list, hit `throw new Error(message)`, and `pnpm build` exited 1. This would have failed the GitHub Actions deploy on the very first push.
- **Fix:** Hoisted `BASE_PATH` to a module const and made `handleHttpError` debase the reported path (strip the `BASE_PATH` prefix, mapping `/michelle_ngo_six/work` -> `/work`) before matching the forward-phase allow-list, and switched the exact-match check from the raw `path` to the debased value. Behavior is unchanged for the empty-base local build (debasing is a no-op when `BASE_PATH` is `''`). Forward-phase nav hrefs stay intact; unexpected 404s (typos, broken assets) still fail the build.
- **Files modified:** `svelte.config.js`
- **Commit:** `72939e1` (bundled with the Task 2 workflow, since the workflow is what triggers the base-path build path this fix unblocks)

(Note: a transient local Windows/MSYS artifact — Git Bash POSIX-converting `BASE_PATH=/michelle_ngo_six` into a Windows path — was worked around locally with `MSYS_NO_PATHCONV=1` only to reproduce the CI condition. It does NOT affect the ubuntu-latest CI runner and required no code change.)

## Delegated to Orchestrator (Task 3 + Task 4 — NOT performed here)

Per the execution scope, this executor did the LOCAL tasks only and did **not** push or run the live check:
- **Task 3 (commit + push to origin/main):** The two task commits exist locally (`fcfce00`, `72939e1`) on top of the committed Plan 01-01..01-03 foundation. The push to `origin main` (remote already configured as `https://github.com/wolfwdavid/michelle_ngo_six.git`; empty repo, so this is the initial push) is delegated to the orchestrator. Do NOT add a remote.
- **Task 4 (human-verify checkpoint):** After the orchestrator pushes, it must ensure GitHub Pages source is set to **GitHub Actions** (Settings -> Pages -> Source -> GitHub Actions; re-run the workflow if the first `deploy` job failed for lack of a configured source), then human-verify at https://wolfwdavid.github.io/michelle_ngo_six/ — page renders with the "Michelle Ngo" wordmark + footer + dark tokens + correct fonts, assets resolve under `/michelle_ngo_six/` (Network 200s), `/michelle_ngo_six/sitemap.xml` returns XML, and the mobile hamburger menu opens/closes.

The deploy files are ready: the workflow builds green with `BASE_PATH=/michelle_ngo_six` locally, the sitemap + `.nojekyll` are emitted, and no absolute asset paths leak.

## Known Stubs

None. The sitemap is intentionally homepage-only this phase (the single route that exists) and is documented to grow as later phases add routes — this is correct scope, not a stub.

## Self-Check: PASSED

- Files on disk: `src/routes/sitemap.xml/+server.ts` FOUND; `.github/workflows/deploy.yml` FOUND; `svelte.config.js` modified.
- Commits in history: `fcfce00` FOUND; `72939e1` FOUND.
- Working tree clean after commits. No push performed (delegated to orchestrator).
