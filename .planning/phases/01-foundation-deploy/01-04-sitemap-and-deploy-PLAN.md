---
phase: 01-foundation-deploy
plan: 04
type: execute
wave: 4
depends_on: [01, 02, 03]
files_modified:
  - src/routes/sitemap.xml/+server.ts
  - .github/workflows/deploy.yml
autonomous: false
requirements: [DEP-02, DEP-03, DEP-04]
must_haves:
  truths:
    - "pnpm build emits build/sitemap.xml containing the homepage URL"
    - "The build emits build/.nojekyll"
    - "A GitHub Actions workflow builds with BASE_PATH=/michelle_ngo_six and publishes build/ to Pages"
    - "No source file hardcodes an absolute internal asset path (assets resolve under the base path)"
    - "After push, wolfwdavid.github.io/michelle_ngo_six serves a rendered page with nav + footer (human-verified)"
  artifacts:
    - path: "src/routes/sitemap.xml/+server.ts"
      provides: "prerendered sitemap.xml of routes that exist this phase"
      contains: "urlset"
    - path: ".github/workflows/deploy.yml"
      provides: "minimal GitHub Pages deploy with BASE_PATH"
      contains: "BASE_PATH"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "BASE_PATH=/michelle_ngo_six"
      via: "Build step env using github.event.repository.name"
      pattern: "BASE_PATH"
    - from: "src/routes/sitemap.xml/+server.ts"
      to: "build/sitemap.xml"
      via: "prerender = true GET handler"
      pattern: "prerender = true"
---

<objective>
Ship a prerendered `sitemap.xml` route limited to routes that exist this phase, add a MINIMAL GitHub Pages deploy workflow (based on `_four`'s) that builds with `BASE_PATH=/michelle_ngo_six`, verify no hardcoded absolute asset paths leak, push, and human-verify the live site.

Purpose: Satisfy DEP-02 (Pages workflow with BASE_PATH), DEP-03 (no hardcoded absolute asset paths), DEP-04 (sitemap.xml + .nojekyll generated; site reachable at wolfwdavid.github.io/michelle_ngo_six).
Output: A live, statically-deployed site with a valid sitemap and base-path-correct assets.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation-deploy/01-CONTEXT.md
@.planning/phases/01-foundation-deploy/01-03-SUMMARY.md

FORK SOURCE (read directly):
- ../michelle_ngo_four/.github/workflows/deploy.yml (the MINIMAL workflow — base the new one on THIS)
- ../michelle_ngo_three/src/routes/sitemap.xml/+server.ts (adapt — trim to existing routes)

<notes>
- Remote is ALREADY configured: origin = https://github.com/wolfwdavid/michelle_ngo_six.git (public, empty repo). DO NOT add a remote. The executor pushes to `main`.
- _four's deploy.yml is the template: checkout → setup-node 22 → pnpm 11.0.9 standalone → `pnpm install --frozen-lockfile` → Build with `BASE_PATH: /${{ github.event.repository.name }}` → upload-pages-artifact build/ → deploy-pages. DO NOT copy _three's deploy.yml — it has drift-check / route-manifest / lighthouse / localStorage-grep / playwright jobs that are _three-specific and reference siblings/scripts this repo doesn't have.
- The repo name is `michelle_ngo_six`, so `BASE_PATH: /${{ github.event.repository.name }}` resolves to `/michelle_ngo_six` automatically — matches CONTEXT. Keep the dynamic form (no hardcoded literal).
- _three's sitemap emits /about, /press, /contact, /work, /work/[category], /watch/[id] — those routes DO NOT exist this phase. Trim the sitemap to ONLY the routes that exist now (the homepage `/`). Later phases extend it as they add routes.
- robots.txt currently disallows all (noindex staging posture, carried from _three). That is fine for a staging Pages URL; the sitemap still ships per DEP-04. Leave robots.txt as-is.
- `pnpm install --frozen-lockfile` requires pnpm-lock.yaml to be committed — confirm it exists (Plan 01-01 generated it on first install). If the lockfile is missing or stale, run `pnpm install` locally and commit it before pushing.
</notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Ship a phase-scoped prerendered sitemap.xml</name>
  <read_first>
    - ../michelle_ngo_three/src/routes/sitemap.xml/+server.ts (structure: prerender=true, GET returns application/xml; trim the route set)
    - michelle_ngo_six/src/lib/data/index.ts (available exports, in case later expansion is wanted)
  </read_first>
  <action>
    Create `src/routes/sitemap.xml/+server.ts`:
    1. `export const prerender = true;`
    2. A `GET()` handler that returns a `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` containing exactly ONE `<url>` for the homepage this phase. Use the production canonical host `https://michellengo.net/` for `<loc>` (matches _three's posture — the sitemap advertises the production URL, not the staging base path; this is intentional and documented in _three). Include `<lastmod>` as the build-time `new Date().toISOString().slice(0,10)`.
    3. Set the response `Content-Type: application/xml; charset=utf-8`.
    4. Add a code comment: routes are added to this sitemap as later phases ship them (/work, /watch/[id], /about, /press, /contact). For now only `/` exists.
    Then run `pnpm build` and confirm `build/sitemap.xml` is emitted.
  </action>
  <acceptance_criteria>
    - `src/routes/sitemap.xml/+server.ts` contains `prerender = true` and `urlset`.
    - `pnpm build` exits 0 and `build/sitemap.xml` exists.
    - `build/sitemap.xml` contains `<loc>` and is valid XML (starts with `<?xml`).
    - `build/.nojekyll` exists.
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "prerender = true" src/routes/sitemap.xml/+server.ts && pnpm build && test -f build/sitemap.xml && grep -q "urlset" build/sitemap.xml && test -f build/.nojekyll && echo OK</automated>
  </verify>
  <done>A prerendered sitemap.xml ships in build/, alongside .nojekyll.</done>
</task>

<task type="auto">
  <name>Task 2: Add the minimal GitHub Pages deploy workflow + verify no absolute asset paths</name>
  <read_first>
    - ../michelle_ngo_four/.github/workflows/deploy.yml (copy this shape)
  </read_first>
  <action>
    1. Create `.github/workflows/deploy.yml` based on `_four`'s MINIMAL workflow:
       - `name: Deploy to GitHub Pages`
       - triggers: `push: branches:[main]` + `workflow_dispatch`
       - permissions: contents read, pages write, id-token write
       - concurrency group pages, cancel-in-progress false
       - job `build` (ubuntu-latest): checkout@v4 → setup-node@v4 node 22 → pnpm/action-setup@v4 version 11.0.9 standalone:true → `pnpm install --frozen-lockfile` → Build step with `env: BASE_PATH: /${{ github.event.repository.name }}` running `pnpm build` → upload-pages-artifact@v3 path build/
       - job `deploy` (needs build): environment github-pages → deploy-pages@v4
       Do NOT add drift-check, lighthouse, localStorage-grep, route-manifest, or playwright steps.
    2. Verify NO hardcoded absolute internal asset paths exist in source (DEP-03). All internal asset/route references must go through `{base}` / `$app/paths` or Vite's `%sveltekit.assets%`. Grep the source for suspicious patterns:
       - `src="/` or `href="/` (a bare leading-slash internal path that bypasses base) in `src/**/*.svelte` — EXCEPT the skip-link `href="#main"` (a fragment, fine) and `%sveltekit.assets%/...` in app.html (Vite-rewritten, fine) and external `https://`/`mailto:`/`tel:` links (fine).
       Confirm the only leading-slash references are the app.css `/fonts/*.woff2` (Vite resolves under base) and app.html `%sveltekit.assets%` tokens. Document the grep result in the summary.
    3. Confirm `pnpm-lock.yaml` is committed (required by `--frozen-lockfile`); if absent/stale run `pnpm install` and stage it.
  </action>
  <acceptance_criteria>
    - `.github/workflows/deploy.yml` contains `BASE_PATH: /${{ github.event.repository.name }}`, `upload-pages-artifact`, and `deploy-pages`.
    - `.github/workflows/deploy.yml` does NOT contain `drift-check`, `lighthouse`, or `playwright`.
    - No `.svelte` file under src/ contains a bare absolute internal asset src/href except the documented exceptions (skip-link fragment, %sveltekit.assets%). Verified by grep.
    - `pnpm-lock.yaml` exists at repo root.
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "BASE_PATH: /\${{ github.event.repository.name }}" .github/workflows/deploy.yml && grep -q "deploy-pages" .github/workflows/deploy.yml && ! grep -qE "drift-check|lighthouse|playwright" .github/workflows/deploy.yml && test -f pnpm-lock.yaml && echo OK</automated>
  </verify>
  <done>The minimal Pages workflow is in place with BASE_PATH set dynamically; no hardcoded absolute internal asset paths remain; lockfile committed.</done>
</task>

<task type="auto">
  <name>Task 3: Commit and push to origin/main to trigger the deploy</name>
  <read_first>
    - michelle_ngo_six/.gitignore (confirm build/ and node_modules/ ignored)
  </read_first>
  <action>
    1. Stage all phase-1 work: configs, src/, static/, .github/workflows/deploy.yml, pnpm-lock.yaml. (build/ and node_modules/ are gitignored.)
    2. Commit with a message describing the foundation scaffold + deploy — NO mention of AI assistants. Example: `feat: scaffold SvelteKit foundation, app shell, data layer, and Pages deploy`.
    3. Push to `origin main` (remote already configured; repo is empty so this is the initial push to main). Use the existing origin — do NOT add a remote.
    4. Confirm the push succeeded and the Actions workflow was triggered (`gh run list --limit 1` or report the run URL). If GitHub Pages source is not yet set to "GitHub Actions", note it for the human checkpoint (Settings → Pages → Source: GitHub Actions).
  </action>
  <acceptance_criteria>
    - `git log -1 --pretty=%s` shows the foundation commit and the message contains no AI-assistant mention.
    - `git push` to origin/main exits 0.
    - The deploy workflow run is triggered (a run appears in `gh run list`).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && git rev-parse --abbrev-ref HEAD && git log -1 --pretty=%s && git ls-remote origin main | head -1 && echo PUSHED</automated>
  </verify>
  <done>Phase-1 foundation is committed (no AI mention) and pushed to origin/main; the Pages deploy workflow is running.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    A SvelteKit static site deployed to GitHub Pages at the repo base path, with the app shell (top nav, mobile menu, footer), OKLCH dark tokens, self-hosted fonts, a validated 56-video data layer, and a sitemap.xml + .nojekyll. The deploy workflow ran on push to main.
  </what-built>
  <how-to-verify>
    1. Wait for the GitHub Actions "Deploy to GitHub Pages" run to finish green (check `gh run list` or the repo Actions tab). If the `deploy` job failed because Pages source isn't set, go to repo Settings → Pages → Source → "GitHub Actions", then re-run the workflow.
    2. Visit https://wolfwdavid.github.io/michelle_ngo_six/ in a browser.
    3. Confirm: the page renders (not a blank/404) with the "Michelle Ngo" wordmark in the top nav, the footer ("© 2026 Michelle Ngo · Built with SvelteKit") at the bottom, and the dark cinematic background (tokens applied). Fonts should be the serif/sans (not default Times/Arial).
    4. Open DevTools → Network, reload, and confirm font/asset requests resolve under `/michelle_ngo_six/` (200s, not 404s under root).
    5. Visit https://wolfwdavid.github.io/michelle_ngo_six/sitemap.xml and confirm it returns XML.
    6. On a narrow viewport (or DevTools device mode), confirm the hamburger opens the mobile menu and Escape/close dismisses it.
  </how-to-verify>
  <resume-signal>Type "approved" if the live site renders with nav + footer + tokens and assets resolve under the base path; otherwise describe what 404'd or rendered wrong.</resume-signal>
</task>

</tasks>

<verification>
- `build/sitemap.xml` and `build/.nojekyll` emitted by `pnpm build`.
- `.github/workflows/deploy.yml` builds with `BASE_PATH=/michelle_ngo_six` (via repository.name) and deploys.
- No hardcoded absolute internal asset paths (DEP-03) — grep-verified.
- Live site at wolfwdavid.github.io/michelle_ngo_six renders with nav + footer; assets resolve under base path (human-verified).
</verification>

<success_criteria>
The site builds static, emits sitemap.xml + .nojekyll, deploys via GitHub Actions with BASE_PATH=/michelle_ngo_six, uses no hardcoded absolute asset paths, and is reachable and rendered at wolfwdavid.github.io/michelle_ngo_six (DEP-02, DEP-03, DEP-04).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-deploy/01-04-SUMMARY.md`.
</output>
