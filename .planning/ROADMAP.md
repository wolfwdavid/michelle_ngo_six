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
- [x] 02-04-homepage-assembly-and-watch-stub-PLAN.md — Assemble +page.svelte (hero + rails in display order) + minimal /watch/[id] stub (entries() prerenders all 56) + green build/reduced-motion gate (HOME-01..05)

### Phase 3: Browse & Watch
**Goal**: A visitor can browse all work by category and watch any individual video on a dedicated page with player and metadata.
**Depends on**: Phase 2
**Requirements**: BRW-01, BRW-02, BRW-03, WCH-01, WCH-02, WCH-03, WCH-04
**Success Criteria** (what must be TRUE):
  1. A visitor can open `/work` to see all categories and switch categories via a filter/nav control.
  2. A per-category page (`/work/[category]`) lists every video in that category.
  3. Each video's watch page (`/watch/[id]`) embeds a working Vimeo/YouTube player and shows title, category, and description/metadata.
  4. The watch page shows a "related work" rail, and video iframes lazy-load (only the hero poster is eager) so LCP is protected.
**Plans**: 3 plans
Plans:
- [x] 03-01-watch-player-PLAN.md — Replace the /watch/[id] stub with the full click-to-load player (poster→iframe by source), title/category/uploader/description metadata, and a same-category "Related work" rail (WCH-01, WCH-02, WCH-03, WCH-04)
- [x] 03-02-work-index-PLAN.md — Port/adapt a dual-mode FilterPillBar (All + 8 categories) + the prerendered /work index: responsive VideoCard grid with client-side filtering; prune /work from PENDING_ROUTES (BRW-01, BRW-03)
- [x] 03-03-work-category-PLAN.md — /work/[category] route: entries() prerendering all 8 category slugs + load() (404 on unknown), title/count + FilterPillBar (link mode) + grid; prune the /work/ prefix from PENDING_ROUTES (BRW-02)

### Phase 4: Content Pages
**Goal**: The supporting content pages are live and the contact information has a single source of truth used everywhere.
**Depends on**: Phase 1
**Requirements**: PG-01, PG-02, PG-03, PG-04
**Success Criteria** (what must be TRUE):
  1. The About page displays Michelle's approved bio.
  2. The Contact page shows all contact methods (email, phone, Vimeo, LinkedIn, IMDb).
  3. A Press page exists and renders.
  4. A reusable contact block renders consistently across footer / about / contact from a single source.
**Plans**: 1 plan
Plans:
- [x] 04-01-content-pages-PLAN.md — Port verbatim bio (/about + ContactBlock CTA), /contact splash (ContactBlock), and /press (port _pressCredits.ts + page); prune /about, /press, /contact from PENDING_ROUTES (keep /pbs-american-portrait/); strict-green prerender (PG-01, PG-02, PG-03, PG-04)

### Phase 5: Design Polish
**Goal**: The site looks and feels cinematic and is responsive and accessible across the board — the visual finish that makes the experience film-forward without hurting performance.
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: DSN-01, DSN-02, DSN-03, DSN-04
**Success Criteria** (what must be TRUE):
  1. A dark, cinematic, film-forward theme is applied site-wide using the OKLCH token system.
  2. Cards tilt/hover, sections parallax, and content reveals on scroll — all via CSS transforms, with no WebGL.
  3. Every page is fully usable across mobile, tablet, and desktop (rails and nav adapt to viewport).
  4. A keyboard-only visitor can navigate the whole site with visible focus rings, and all motion is gated behind `prefers-reduced-motion`.
**Plans**: 5 plans
Plans:
- [x] 05-01-tokens-typography-spacing-PLAN.md — Heading/section/scrim tokens in app.css  + remap chrome/browse/watch/about; collapse 5 display sizes to 4, drop text-xs, unify content-max (DSN-01)
- [x] 05-02-mobilemenu-a11y-PLAN.md — MobileMenu focus-trap + body scroll-lock + initial focus + focus-restore (DSN-04)
- [x] 05-03-contrast-contact-press-PLAN.md — Token --scrim-vertical on contact/press, hero-token wordmarks, contrast-safe captions, aria-hidden decorative wordmark, 360px overflow check (DSN-04, DSN-01, DSN-03)
- [x] 05-04-cinematic-motion-PLAN.md — Rune-gated reveal IntersectionObserver action applied to rails/watch/press + hero Ken-Burns + pill transition; LCP-safe, no WebGL (DSN-02)
- [x] 05-05-annotation-scrub-PLAN.md — Scrub leaked _three/_four/D-NN/Phase N/PLAN.md annotations from all src/ comments; zero matches (hygiene; DSN-01..04)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Deploy | 0/4 | Not started | - |
| 2. Homepage Rails | 0/TBD | Not started | - |
| 3. Browse & Watch | 0/3 | Not started | - |
| 4. Content Pages | 0/1 | Not started | - |
| 5. Design Polish | 0/TBD | Not started | - |

---

# Milestone v2.0 — Enhancements

**Started:** 2026-06-16 · **Granularity:** standard · **Phases:** 6–8 (continue from v1.0; do not renumber).

Layer the deferred discovery + richness features onto the shipped, live v1.0 site **without regressing performance or the cinematic feel**. Same stack/constraints as v1.0: SvelteKit 5 + adapter-static + Tailwind v4, GitHub Pages, CSS-only motion gated on the `motion` rune (no WebGL), client-side-only data (no backend), no test harness (verify via `pnpm check` / `pnpm build` + grep), no AI-assistant mentions in code/commits.

## Phases (v2.0)

- [ ] **Phase 6: Card Preview & Profile Links** - Hover/focus muted inline video previews (motion-rune-gated) + Michelle's real LinkedIn/IMDb profile URLs
- [ ] **Phase 7: Site Search** - Client-side search across all 56 videos (title/category/description) with a prebuilt static index
- [ ] **Phase 8: PBS American Portrait Page** - Real prerendered `/pbs-american-portrait` page + curated PBS collection content (removes the last prerender allow-list exception)

## Phase Details (v2.0)

### Phase 6: Card Preview & Profile Links
**Goal**: Video cards come alive with YouTube-style muted inline previews on hover/focus while preserving LCP and reduced-motion behavior, and every contact surface points at Michelle's real social profiles.
**Depends on**: Phase 5 (v1.0 complete — VideoCard, motion rune, and ContactBlock all shipped)
**Requirements**: PREV-01, PREV-02, PROF-01
**Constraints / Risks**:
  - Previews MUST reuse the existing `motion` rune as the single source of motion truth — no separate motion flag.
  - Protect LCP: never autoplay the whole rail. Only the hovered/focused card loads/plays its muted loop; previews are lazy and capped (e.g. one active at a time), so no extra media ships in the prerendered HTML or fires on initial paint.
  - Under `prefers-reduced-motion` (rune off) and on touch/no-hover devices, cards stay static posters — no autoplay.
  - **PROF-01 is BLOCKED** until Michelle supplies her real LinkedIn + IMDb URLs. Until then, the work is wiring/centralization in `ContactBlock`; the actual URL values are a drop-in once received. Do not invent URLs.
**Success Criteria** (what must be TRUE):
  1. On a hover-capable device with motion enabled, hovering or keyboard-focusing a video card starts a muted, looping inline preview of that video; moving away stops it.
  2. Clicking/activating a previewing card still navigates to that video's watch page (preview never blocks the existing click target).
  3. With `prefers-reduced-motion` (motion rune off) or on a touch/no-hover device, the card shows only the static poster — no preview autoplays.
  4. The homepage's initial LCP is unchanged — no preview media loads on first paint; previews load only on interaction.
  5. Everywhere `ContactBlock` renders (footer, about, contact), the LinkedIn and IMDb links resolve to Michelle's real personalized profile URLs (or are cleanly flagged as awaiting-input if her URLs have not yet been provided).
**Plans**: TBD

### Phase 7: Site Search
**Goal**: A visitor can find any of Michelle's videos from anywhere on the site via a fast, fully client-side search.
**Depends on**: Phase 6 (only ordering; technically independent of preview work)
**Requirements**: SRCH-01, SRCH-02
**Constraints / Risks**:
  - Search MUST be 100% client-side on a prerendered static site — no backend, no runtime API. Use a prebuilt static index (generated at build time from `videos.json`) shipped as a static asset / module.
  - Index must stay in sync with the 56 videos in `videos.json` (single source of truth); regenerate as part of the build, never hand-maintain.
  - Keep the search bundle off the critical path (lazy-load the index/search code on open) to protect LCP.
**Success Criteria** (what must be TRUE):
  1. A visitor can open a search control from the nav on any page.
  2. Typing a query returns matching videos by title, category, and/or description across all 56 videos.
  3. Each result links to that video's `/watch/[id]` page.
  4. Empty-query and no-match states render a clear, handled message (not a blank or broken view).
  5. Search works on the deployed static GitHub Pages build with no network/API calls (verifiable offline / in devtools network panel).
**Plans**: TBD

### Phase 8: PBS American Portrait Page
**Goal**: Michelle's PBS American Portrait work gets a dedicated, real, prerendered page — closing the last prerender allow-list exception left open from v1.0.
**Depends on**: Phase 5 (v1.0 routing/prerender config); independent of Phases 6–7.
**Requirements**: PBS-01, PBS-02
**Constraints / Risks**:
  - PBS-01 MUST remove the `/pbs-american-portrait/` entry from `svelte.config.js` PENDING_ROUTES and have the real route prerender strictly (no handleHttpError exception remaining for it).
  - PBS-02 content comes from a curated static data file or a build-time-fetched feed (resolved at build, committed/static) — never a runtime fetch (static-site / no-backend constraint).
  - Must surface PBS collection content beyond the existing in-app PBS category videos without duplicating or desyncing from `videos.json`.
**Success Criteria** (what must be TRUE):
  1. `/pbs-american-portrait` is a real, prerendered page reachable from the deployed site (not a stub or redirect).
  2. The `/pbs-american-portrait/` entry is gone from PENDING_ROUTES and `pnpm build` prerenders the route under strict crawling with no allow-list exception for it.
  3. The page presents Michelle's PBS American Portrait collection content — richer than the in-app category rail (curated data file or build-time feed).
  4. The page is responsive, on-theme (OKLCH tokens, cinematic), and accessible, consistent with the rest of the site.
**Plans**: TBD

## Progress (v2.0)

**Execution Order:**
v2.0 phases execute in numeric order after v1.0: 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Card Preview & Profile Links | 0/TBD | Not started | - |
| 7. Site Search | 0/TBD | Not started | - |
| 8. PBS American Portrait Page | 0/TBD | Not started | - |

### Coverage (v2.0)

| Requirement | Phase |
|-------------|-------|
| PREV-01 | Phase 6 |
| PREV-02 | Phase 6 |
| PROF-01 | Phase 6 |
| SRCH-01 | Phase 7 |
| SRCH-02 | Phase 7 |
| PBS-01 | Phase 8 |
| PBS-02 | Phase 8 |

- v2.0 requirements: 7 total
- Mapped to phases: 7 (100%)
- Unmapped / orphaned: 0
