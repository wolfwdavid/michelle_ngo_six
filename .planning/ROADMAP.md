# Roadmap: Michelle Ngo Portfolio (michelle_ngo_six)

## Overview

A cinematic, YouTube-style portfolio for filmmaker Michelle Ngo, forked from the proven `michelle_ngo_three` SvelteKit site. We stand up the foundation and wire GitHub Pages deploy first so every later phase ships continuously. Then we build the headline feature — a hero reel plus stacked, scrollable category rails on the homepage. Next we make the work navigable end-to-end via browse and watch pages. We round out the site with the content pages (about, contact, press), and finish by layering on the dark cinematic design language, CSS-based 3D depth/motion, full responsiveness, and accessibility. The result: a visitor lands and can immediately watch Michelle's work, browsing by category in an engaging, fast, accessible interface.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Deploy** - Fork scaffold, tokens/fonts, data, app shell, and live GitHub Pages deploy
- [ ] **Phase 2: Homepage Rails** - Cinematic hero reel + horizontal, scrollable category rails (the headline feature)
- [ ] **Phase 3: Browse & Watch** - Browse-by-category pages and per-video watch pages with embedded players
- [ ] **Phase 4: Content Pages** - About, contact, press, and a reusable contact block
- [ ] **Phase 5: Design Polish** - Dark cinematic theme, CSS depth/motion, responsiveness, and accessibility

## Phase Details

### Phase 1: Foundation & Deploy
**Goal**: A SvelteKit 5 site forked from `_three` builds cleanly, prerenders, and is live on GitHub Pages with the app shell, design tokens, fonts, and validated video data in place.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. The project builds and prerenders all routes locally with no errors via adapter-static.
  2. A visitor reaching `wolfwdavid.github.io/michelle_ngo_six` sees a rendered page with top nav, mobile menu, and footer (assets resolve under the base path; `sitemap.xml` and `.nojekyll` present).
  3. The OKLCH design tokens and self-hosted fonts (Source Serif 4, Inter, JetBrains Mono) are applied site-wide.
  4. `videos.json` (56 videos, 8 categories) plus `categories.ts`/`schema.ts` load and pass Zod validation.
**Plans**: 4 plans
Plans:
- [x] 01-01-scaffold-tooling-tokens-PLAN.md — Scaffold SvelteKit 5 + adapter-static (pnpm), Tailwind v4 + OKLCH tokens, fonts, static assets, green placeholder build (FND-01, FND-02, DEP-01)
- [x] 01-02-data-layer-PLAN.md — Port Zod-validated data layer (videos.json, schema, categories, loader, posters, hero), storage + state runes + categoryAccent, build-time validation plugin (FND-03)
- [x] 01-03-app-shell-PLAN.md — Port app shell: root layout, TopNav, MobileMenu, Footer, ContactBlock (FND-04)
- [x] 01-04-sitemap-and-deploy-PLAN.md — Phase-scoped sitemap.xml, minimal GitHub Pages deploy workflow with BASE_PATH, no-absolute-paths check, push + live verify (DEP-02, DEP-03, DEP-04)

### Phase 2: Homepage Rails
**Goal**: The homepage delivers the core value — a cinematic featured hero reel above stacked, scrollable category rails that a visitor can browse and click into.
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. A visitor lands on the homepage and sees a cinematic featured hero playing/representing the producer reel (Vimeo `264677021`) at the top.
  2. Below the hero, one labeled horizontal rail appears per category, each showing video cards with poster and title.
  3. A visitor can scroll each rail by mouse, touch, and keyboard, and activating a card navigates to that video's watch page.
  4. With `prefers-reduced-motion` enabled, the hero and rails do not autoplay or auto-advance.
**Plans**: 4 plans
Plans:
- [x] 02-01-tokens-and-videocard-PLAN.md — Motion tokens (--ease-cinematic, reduced-motion backstop) + cinematic VideoCard with cursor-tilt, accent ring, /watch link (HOME-03)
- [x] 02-02-category-rail-PLAN.md — CategoryRail: scroll-snap track of VideoCards, desktop hover chevrons (extreme-hide), keyboard arrow/Home/End nav, empty-omit (HOME-02, HOME-03)
- [x] 02-03-hero-carousel-PLAN.md — Rotating featured HeroCarousel (poster+title, reel-first), 7000ms/600ms crossfade auto-advance, dots, pause-on-hover, reduced-motion static (HOME-01, HOME-05)
- [ ] 02-04-homepage-assembly-and-watch-stub-PLAN.md — Assemble +page.svelte (hero + rails in display order) + minimal /watch/[id] stub (entries() prerenders all 56) + green build/reduced-motion gate (HOME-01..05)

### Phase 3: Browse & Watch
**Goal**: A visitor can browse all work by category and watch any individual video on a dedicated page with player and metadata.
**Depends on**: Phase 2
**Requirements**: BRW-01, BRW-02, BRW-03, WCH-01, WCH-02, WCH-03, WCH-04
**Success Criteria** (what must be TRUE):
  1. A visitor can open `/work` to see all categories and switch categories via a filter/nav control.
  2. A per-category page (`/work/[category]`) lists every video in that category.
  3. Each video's watch page (`/watch/[id]`) embeds a working Vimeo/YouTube player and shows title, category, and description/metadata.
  4. The watch page shows a "related work" rail, and video iframes lazy-load (only the hero poster is eager) so LCP is protected.
**Plans**: TBD

### Phase 4: Content Pages
**Goal**: The supporting content pages are live and the contact information has a single source of truth used everywhere.
**Depends on**: Phase 1
**Requirements**: PG-01, PG-02, PG-03, PG-04
**Success Criteria** (what must be TRUE):
  1. The About page displays Michelle's approved bio.
  2. The Contact page shows all contact methods (email, phone, Vimeo, LinkedIn, IMDb).
  3. A Press page exists and renders.
  4. A reusable contact block renders consistently across footer / about / contact from a single source.
**Plans**: TBD

### Phase 5: Design Polish
**Goal**: The site looks and feels cinematic and is responsive and accessible across the board — the visual finish that makes the experience film-forward without hurting performance.
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: DSN-01, DSN-02, DSN-03, DSN-04
**Success Criteria** (what must be TRUE):
  1. A dark, cinematic, film-forward theme is applied site-wide using the OKLCH token system.
  2. Cards tilt/hover, sections parallax, and content reveals on scroll — all via CSS transforms, with no WebGL.
  3. Every page is fully usable across mobile, tablet, and desktop (rails and nav adapt to viewport).
  4. A keyboard-only visitor can navigate the whole site with visible focus rings, and all motion is gated behind `prefers-reduced-motion`.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Deploy | 0/4 | Not started | - |
| 2. Homepage Rails | 0/TBD | Not started | - |
| 3. Browse & Watch | 0/TBD | Not started | - |
| 4. Content Pages | 0/TBD | Not started | - |
| 5. Design Polish | 0/TBD | Not started | - |
