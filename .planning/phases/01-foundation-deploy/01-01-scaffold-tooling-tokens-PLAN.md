---
phase: 01-foundation-deploy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-workspace.yaml
  - svelte.config.js
  - tsconfig.json
  - .npmrc
  - .nvmrc
  - .gitignore
  - src/app.html
  - src/app.css
  - src/app.d.ts
  - static/.nojekyll
  - static/robots.txt
  - static/favicon.ico
  - static/favicon.png
  - static/favicon-16.png
  - static/favicon-32.png
  - static/favicon-192.png
  - static/favicon-512.png
  - static/apple-touch-icon.png
  - static/og-image.jpg
  - static/fonts/
autonomous: true
requirements: [FND-01, FND-02, DEP-01]
must_haves:
  truths:
    - "pnpm install completes and pnpm build exits 0 producing a build/ directory"
    - "build/ contains index.html (the prerendered homepage)"
    - "The OKLCH @theme tokens and self-hosted woff2 fonts (Source Serif 4, Inter, JetBrains Mono) are present in app.css"
    - "BASE_PATH env drives paths.base in svelte.config.js (empty in dev, /michelle_ngo_six in CI)"
  artifacts:
    - path: "svelte.config.js"
      provides: "adapter-static + paths.base from BASE_PATH"
      contains: "adapter-static"
    - path: "src/app.css"
      provides: "Tailwind v4 import + OKLCH @theme tokens + @font-face self-hosted fonts"
      contains: "@theme"
    - path: "src/app.html"
      provides: "HTML shell with sveltekit head/body tokens"
      contains: "%sveltekit.body%"
    - path: "static/.nojekyll"
      provides: "GitHub Pages Jekyll bypass for _-prefixed asset dirs"
    - path: "src/routes/+page.svelte"
      provides: "minimal placeholder homepage so the build is green"
  key_links:
    - from: "svelte.config.js"
      to: "process.env.BASE_PATH"
      via: "paths.base assignment"
      pattern: "BASE_PATH"
    - from: "src/app.css"
      to: "static/fonts/*.woff2"
      via: "@font-face src url"
      pattern: "@font-face"
---

<objective>
Scaffold the SvelteKit 5 + adapter-static project (pnpm), port `_three`'s build tooling, Tailwind v4 + OKLCH design tokens, self-hosted fonts, static assets, and HTML shell — then ship a MINIMAL placeholder homepage so `pnpm build` is green and prerenders to `build/index.html`.

Purpose: Establish the deployable foundation (FND-01, FND-02) and the static-prerender capability (DEP-01) every later phase builds on.
Output: A SvelteKit project that installs, type-checks, and builds to a static `build/` directory.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-deploy/01-CONTEXT.md

FORK SOURCE (read these directly when porting — do NOT invent structures):
- ../michelle_ngo_three/package.json
- ../michelle_ngo_three/svelte.config.js
- ../michelle_ngo_three/tsconfig.json
- ../michelle_ngo_three/src/app.css
- ../michelle_ngo_three/src/app.html

<notes>
- DO NOT copy ../michelle_ngo_three/vite.config.ts verbatim — its validateVideosPlugin/validatePostersPlugin/vitest projects reference data + posters that don't exist until Plan 02-02. Write a MINIMAL vite.config.ts here (tailwindcss + sveltekit plugins only). Plan 02-02 will extend it with the videos validation plugin.
- DO NOT copy static/CNAME from _three — that pins michellengo.net (a different site). This staging repo deploys at wolfwdavid.github.io/michelle_ngo_six.
- DO NOT port the homepage +page.svelte/+page.ts from _three — they import HeroAmbient/ReelStage (Phase 2). Write a minimal placeholder instead.
- _three's package name is "michelle-ngo-three"; set this project's to "michelle-ngo-six".
</notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold project config and tooling files</name>
  <read_first>
    - ../michelle_ngo_three/package.json (copy devDependencies + scripts; drop husky/lint-staged/playwright-only entries not needed yet — keep dev/build/preview/check)
    - ../michelle_ngo_three/svelte.config.js (adapter-static + paths.base pattern)
    - ../michelle_ngo_three/tsconfig.json
    - ../michelle_ngo_three/.npmrc
    - ../michelle_ngo_three/.nvmrc
    - ../michelle_ngo_three/.gitignore
    - ../michelle_ngo_three/pnpm-workspace.yaml
  </read_first>
  <action>
    Create the project root config files in michelle_ngo_six:

    1. `package.json` — name "michelle-ngo-six", "type":"module", "packageManager":"pnpm@11.0.9", engines node>=22. Scripts: `dev:"vite dev"`, `build:"vite build"`, `preview:"vite preview"`, `check:"svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"`. devDependencies (copy these exact versions from _three): @sveltejs/adapter-static 3.0.10, @sveltejs/kit 2.59.1, @sveltejs/vite-plugin-svelte 7.1.2, @tailwindcss/vite 4.3.0, tailwindcss 4.3.0, @tailwindcss/typography 0.5.19, @types/node 22.19.18, svelte 5.55.5, svelte-check 4.4.6, typescript 5.9.3, vite 8.0.7, zod 4.4.3. (Omit eslint/prettier/husky/playwright/vitest for this phase — keep it minimal; they can return later.)
    2. `pnpm-workspace.yaml` — copy verbatim from _three (`packages: []` + allowBuilds sharp/esbuild).
    3. `.npmrc` — `engine-strict=true` (verbatim from _three).
    4. `.nvmrc` — `22` (verbatim from _three).
    5. `.gitignore` — copy from _three (node_modules, /build, /.svelte-kit, /package, .env*, vite timestamps, OS files, __pycache__). Drop the Playwright + .embed-check-report lines.
    6. `tsconfig.json` — copy verbatim from _three (extends ./.svelte-kit/tsconfig.json; strict, noUncheckedIndexedAccess, noImplicitOverride).
    7. `svelte.config.js` — adapter-static with `pages:'build', assets:'build', fallback:'404.html', precompress:false, strict:true`; `paths.base: process.env.BASE_PATH ?? ''`; `preprocess: vitePreprocess()`. Drop _three's stale Plan-06 comment block.
    8. `vite.config.ts` — MINIMAL: `import { sveltekit } from '@sveltejs/kit/vite'; import { defineConfig } from 'vite'; import tailwindcss from '@tailwindcss/vite'; export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });`. (Plugin order: tailwindcss BEFORE sveltekit — Phase 1 Pattern. Plan 02-02 extends with the videos validation plugin.)
    9. `src/app.d.ts` — standard SvelteKit App namespace stub: `declare global { namespace App {} } export {};`
  </action>
  <acceptance_criteria>
    - `package.json` exists, `grep '"name": "michelle-ngo-six"' package.json` matches, and contains `"@sveltejs/adapter-static"` and `"zod"`.
    - `svelte.config.js` contains the string `adapter-static` (via import) AND `BASE_PATH`.
    - `vite.config.ts` contains `tailwindcss()` and `sveltekit()` and does NOT contain `validateVideosPlugin`.
    - `tsconfig.json` contains `noUncheckedIndexedAccess`.
    - `.npmrc` contains `engine-strict=true`; `.nvmrc` contains `22`.
    - `pnpm install` exits 0 (generates pnpm-lock.yaml and node_modules).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && pnpm install && test -f node_modules/.bin/vite && echo OK</automated>
  </verify>
  <done>Project installs cleanly with pnpm; all config files present and matching the criteria above.</done>
</task>

<task type="auto">
  <name>Task 2: Port design tokens, fonts, HTML shell, and static assets</name>
  <read_first>
    - ../michelle_ngo_three/src/app.css (the @font-face + @theme OKLCH block — port verbatim except comments referencing later phases may be trimmed)
    - ../michelle_ngo_three/src/app.html (head/body tokens + favicon + OG/preload)
    - ../michelle_ngo_three/static/ (font files, favicons, og-image, robots.txt, .nojekyll)
  </read_first>
  <action>
    1. Copy `../michelle_ngo_three/src/app.css` to `src/app.css` VERBATIM. It already uses BASE_PATH-relative `/fonts/*.woff2` urls (Vite resolves these under paths.base at runtime), the `@import "tailwindcss";` directive, the 7 `@font-face` rules, the `@theme` block (3 font vars, focus ring tokens, 8 neutral OKLCH ramp values, 8 `--color-cat-*` accents), the `:root` chrome-height vars, the global `:focus-visible` double-ring rule, and the `@utility scrollbar-hide`. Do not alter token values.
    2. Copy `../michelle_ngo_three/src/app.html` to `src/app.html` VERBATIM (it uses `%sveltekit.assets%` + `{base}`-free favicon ref + the vimeo-264677021 poster preload + `%sveltekit.head%`/`%sveltekit.body%` tokens). The preload poster file ships in Plan 02-02; harmless to reference now (404 only if missing, non-fatal for build).
    3. Copy the entire `../michelle_ngo_three/static/fonts/` directory (7 .woff2 files: inter-latin-400/500/600, jetbrains-mono-latin-400, source-serif-4-latin-400/600/700) into `static/fonts/`.
    4. Copy these static files from `../michelle_ngo_three/static/` into `static/`: `favicon.ico`, `favicon.png`, `favicon-16.png`, `favicon-32.png`, `favicon-192.png`, `favicon-512.png`, `apple-touch-icon.png`, `og-image.jpg`, `robots.txt`, `.nojekyll`.
    5. DO NOT copy `static/CNAME` (it pins michellengo.net — wrong host for this repo).
    6. DO NOT copy `static/posters/` here — that is Plan 02-02's responsibility (it pairs with the data layer).
  </action>
  <acceptance_criteria>
    - `src/app.css` contains `@theme`, `@import "tailwindcss"`, `--color-cat-pbs`, `--color-neutral-950`, and at least one `@font-face` with `source-serif-4-latin-400.woff2`.
    - `ls static/fonts/*.woff2 | wc -l` equals 7.
    - `static/.nojekyll` exists; `static/robots.txt` exists; `static/favicon.png` exists; `static/og-image.jpg` exists.
    - `static/CNAME` does NOT exist (`test ! -f static/CNAME`).
    - `src/app.html` contains `%sveltekit.body%` and `%sveltekit.head%`.
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && grep -q "@theme" src/app.css && grep -q "color-cat-pbs" src/app.css && test "$(ls static/fonts/*.woff2 | wc -l)" -eq 7 && test -f static/.nojekyll && test ! -f static/CNAME && echo OK</automated>
  </verify>
  <done>Tokens, fonts, HTML shell, favicons, og-image, robots.txt, and .nojekyll are in place; CNAME is absent.</done>
</task>

<task type="auto">
  <name>Task 3: Minimal placeholder homepage + layout-level prerender, build green</name>
  <read_first>
    - ../michelle_ngo_three/src/routes/+layout.ts (prerender = true; trailingSlash = 'always')
    - ../michelle_ngo_three/src/routes/+page.svelte (DO NOT port — it imports Phase-2 components; write a placeholder instead)
  </read_first>
  <action>
    Create a buildable route tree WITHOUT any Phase-2/3 components:

    1. `src/routes/+layout.ts` — `export const prerender = true;` and `export const trailingSlash = 'always';` (copy these two lines from _three's +layout.ts; drop the Plan-06 comment).
    2. `src/routes/+layout.svelte` — MINIMAL shell for THIS plan: `<script lang="ts"> import '../app.css'; let { children } = $props(); </script>` then `{@render children()}`. (The full app shell — TopNav/Footer/skip-link/state init — lands in Plan 02-03. This minimal layout only imports the CSS so tokens/fonts apply during the green-build check.)
    3. `src/routes/+page.svelte` — minimal placeholder: a `<main>` with an `<h1 class="font-display">Michelle Ngo</h1>` and a one-line `<p>` note like "Site coming soon." Use the design tokens (e.g. `class="font-display"`, neutral text colors) so the token system is visibly exercised. NO imports from `$lib/components` (none exist yet).
    4. Do NOT create a `+page.ts` (the placeholder needs no load data).
  </action>
  <acceptance_criteria>
    - `src/routes/+layout.ts` contains `prerender = true`.
    - `src/routes/+page.svelte` contains `Michelle Ngo` and does NOT contain `HeroAmbient` or `ReelStage` or `$lib/components`.
    - `pnpm build` exits 0.
    - `build/index.html` exists after build.
    - `build/.nojekyll` exists after build (adapter copies static/.nojekyll).
    - `build/_app/` directory exists (the JS/CSS asset bundle).
  </acceptance_criteria>
  <verify>
    <automated>cd michelle_ngo_six && pnpm build && test -f build/index.html && test -f build/.nojekyll && test -d build/_app && echo BUILD_GREEN</automated>
  </verify>
  <done>`pnpm build` produces a static `build/` with index.html, .nojekyll, and the _app bundle; no Phase-2 component references exist.</done>
</task>

</tasks>

<verification>
- `pnpm install` exits 0.
- `pnpm build` exits 0 and emits `build/index.html`, `build/.nojekyll`, `build/_app/`.
- `grep "@theme" src/app.css` matches; 7 woff2 fonts present in static/fonts/.
- `svelte.config.js` reads `process.env.BASE_PATH`.
</verification>

<success_criteria>
A SvelteKit 5 + adapter-static project installs with pnpm, applies the ported OKLCH tokens and self-hosted fonts, and prerenders a minimal homepage to a static `build/` directory (FND-01, FND-02, DEP-01).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-deploy/01-01-SUMMARY.md`.
</output>
