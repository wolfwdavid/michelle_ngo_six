# Phase 1: Foundation & Deploy - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the SvelteKit 5 project by forking the proven architecture of the sibling site `michelle_ngo_three`: scaffold + build tooling, Tailwind v4 + OKLCH design tokens, self-hosted fonts, the validated `videos.json` data layer, the app shell (root layout, top nav, mobile menu, footer), and the GitHub Pages deploy workflow with `BASE_PATH=/michelle_ngo_six`. The deliverable is a site that builds, prerenders all routes, and is live on GitHub Pages — no page content beyond the shell yet. Covers FND-01..04 and DEP-01..04.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
- All implementation choices are at Claude's discretion — pure infrastructure phase.
- Fork source of truth: `C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_websites\michelle_ngo_three`. Reuse its `svelte.config.js`, `vite.config.ts`, Tailwind/OKLCH `app.css`, `/static/fonts/`, `src/lib/data/` (videos.json, categories.ts, schema.ts, posters.json), and chrome components (TopNav, MobileMenu, Footer, ContactBlock).
- Package manager: pnpm (match `_three`).
- Deploy workflow: base it on `_three`/`_four` `deploy.yml` but simplify to `_four`'s minimal form to start; set `BASE_PATH=/michelle_ngo_six`. Ensure `.nojekyll` and `sitemap.xml` are emitted.
- `BASE_PATH` empty in dev, `/michelle_ngo_six` in CI build (read in svelte.config.js).
- Strip `_three`-specific CI guards (drift-check against _four, route-manifest traps) that don't apply to a standalone repo.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `_three` components: `HeroAmbient`, `VideoCard`, `PosterImage`, `FilterPillBar`, `TopNav`, `MobileMenu`, `Footer`, `ContactBlock`, `ContinueReelRail`. Phase 1 ports the chrome (TopNav/MobileMenu/Footer/ContactBlock); the rest land in later phases.
- `_three` data: `src/lib/data/videos.json` (~70 Zod-validated videos, 8 categories), `categories.ts`, `heroSlides.ts`, `posters.json`, `schema.ts`.
- `_three` tokens: `src/app.css` `@theme` block with OKLCH neutrals + 8 category accents; self-hosted fonts in `/static/fonts/`.

### Established Patterns
- adapter-static + full prerender; `BASE_PATH` env drives `paths.base`.
- Tailwind v4 via `@tailwindcss/vite`.
- Lint guard against hardcoded absolute asset paths.

### Integration Points
- Root `+layout.svelte` wires TopNav + MobileMenu + Footer around `<slot/>`.
- GitHub Actions `deploy.yml` builds with `BASE_PATH=/michelle_ngo_six` and publishes `build/` to Pages.

</code_context>

<specifics>
## Specific Ideas

Fork `michelle_ngo_three` rather than scaffolding from scratch — it is the most advanced sibling and already contains Michelle's real content and a working Pages pipeline. The goal of this phase is a clean, deployable foundation, not new features.

</specifics>

<deferred>
## Deferred Ideas

- Homepage hero + category rails → Phase 2.
- Browse/watch pages → Phase 3.
- About/contact/press content → Phase 4.
- Cinematic 3D depth/motion + a11y polish → Phase 5.

</deferred>
