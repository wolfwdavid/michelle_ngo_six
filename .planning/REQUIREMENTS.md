# Requirements: Michelle Ngo Portfolio (michelle_ngo_six)

**Defined:** 2026-06-14
**Core Value:** A visitor can immediately watch Michelle's work — browsing films/videos by category in an engaging, cinematic, scroll-and-play interface.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FND-01**: SvelteKit 5 + adapter-static project scaffolded with pnpm, building cleanly
- [x] **FND-02**: Tailwind v4 + OKLCH design tokens and self-hosted fonts (Source Serif 4, Inter, JetBrains Mono) ported from `_three`
- [x] **FND-03**: Zod-validated `videos.json` (~70 videos, 8 categories) plus `categories.ts`/`schema.ts` ported and loading
- [x] **FND-04**: App shell — root layout, top navigation, mobile menu, footer

### Homepage

- [x] **HOME-01**: Visitor sees a cinematic featured hero (producer reel, Vimeo `264677021`) at the top of the homepage
- [x] **HOME-02**: Homepage displays one horizontal, scrollable rail per category, each labeled with its category name
- [x] **HOME-03**: Each rail renders video cards (poster, title) and is navigable by mouse, touch, and keyboard
- [x] **HOME-04**: Activating a video card navigates to that video's watch page
- [x] **HOME-05**: Hero and rails honor `prefers-reduced-motion` (no autoplay/auto-advance when reduced)

### Browse

- [x] **BRW-01**: Visitor can open a `/work` page presenting all categories
- [x] **BRW-02**: Visitor can open a per-category page (`/work/[category]`) listing every video in that category
- [x] **BRW-03**: Visitor can switch between categories via a filter/nav control

### Watch

- [x] **WCH-01**: Each video has a watch page (`/watch/[id]`) with an embedded Vimeo/YouTube player
- [x] **WCH-02**: Watch page shows title, category, and description/metadata
- [x] **WCH-03**: Watch page shows a "related work" rail
- [x] **WCH-04**: Video iframes lazy-load (only the hero poster is eager) to protect LCP

### Pages

- [x] **PG-01**: About page displays Michelle's approved bio
- [x] **PG-02**: Contact page shows all contact methods (email, phone, Vimeo, LinkedIn, IMDb)
- [x] **PG-03**: Press page
- [x] **PG-04**: Reusable contact block used across footer / about / contact (single source of truth)

### Design & Accessibility

- [x] **DSN-01**: Dark, cinematic, film-forward theme applied site-wide using the OKLCH token system
- [x] **DSN-02**: Tasteful 3D depth & motion — card hover/tilt, parallax, scroll reveals — implemented via CSS transforms (no WebGL)
- [x] **DSN-03**: Fully responsive across mobile / tablet / desktop (rails and nav adapt)
- [x] **DSN-04**: Accessible — visible focus rings, full keyboard navigation, motion gated on `prefers-reduced-motion`

### Deploy

- [x] **DEP-01**: Site builds static and prerenders all routes (adapter-static)
- [x] **DEP-02**: GitHub Pages workflow deploys with `BASE_PATH=/michelle_ngo_six`
- [x] **DEP-03**: No hardcoded absolute asset paths; all assets resolve under the base path
- [x] **DEP-04**: `sitemap.xml` and `.nojekyll` generated; site reachable at `wolfwdavid.github.io/michelle_ngo_six`

## v2.0 Milestone Requirements (Active)

Scope for milestone v2.0 (Enhancements). Phases continue from v1.0 (start at Phase 6). Same constraints: CSS-only motion (no WebGL), motion gated on the `motion` rune, static client-side only (no backend), no test harness, no AI-assistant mentions.

### Card Preview

- [ ] **PREV-01**: On hover (desktop) or focus, a video card plays a muted, looping inline preview of that video; clicking still opens the watch page
- [ ] **PREV-02**: Preview autoplay is gated on the `motion` rune — under `prefers-reduced-motion` (and on touch where hover is unavailable) the card shows the static poster, no autoplay

### Search

- [ ] **SRCH-01**: A visitor can open a search control from the nav and find videos by title, category, and description across all 56 videos
- [ ] **SRCH-02**: Search runs entirely client-side (static site, prebuilt index); each result links to the video's watch page; empty/no-match states are handled

### PBS American Portrait

- [ ] **PBS-01**: A dedicated, prerendered `/pbs-american-portrait` page presents Michelle's PBS American Portrait work, removing the last `/pbs-american-portrait/` entry from the prerender allow-list
- [ ] **PBS-02**: The PBS page surfaces the PBS American Portrait collection content (curated data file or build-time-fetched feed) beyond the existing in-app category videos

### Profile Links

- [ ] **PROF-01**: LinkedIn and IMDb links resolve to Michelle's real personalized profile URLs (replacing the v1 homepage fallbacks) everywhere `ContactBlock` renders — requires the actual URLs from Michelle

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Heavy WebGL / Three.js 3D scene | Hurts LCP on GitHub Pages; depth achieved via CSS instead |
| CMS / backend / database / auth | Content is static (committed `videos.json`); not needed for a portfolio v1 |
| E-commerce, comments, user accounts | Not relevant to a portfolio |
| Re-tagging into the 5 old WordPress disciplines | Homepage organizes by the 8 existing video categories — zero re-tagging |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 1 | Complete |
| DEP-01 | Phase 1 | Complete |
| DEP-02 | Phase 1 | Complete |
| DEP-03 | Phase 1 | Complete |
| DEP-04 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| HOME-04 | Phase 2 | Complete |
| HOME-05 | Phase 2 | Complete |
| BRW-01 | Phase 3 | Complete |
| BRW-02 | Phase 3 | Complete |
| BRW-03 | Phase 3 | Complete |
| WCH-01 | Phase 3 | Complete |
| WCH-02 | Phase 3 | Complete |
| WCH-03 | Phase 3 | Complete |
| WCH-04 | Phase 3 | Complete |
| PG-01 | Phase 4 | Complete |
| PG-02 | Phase 4 | Complete |
| PG-03 | Phase 4 | Complete |
| PG-04 | Phase 4 | Complete |
| DSN-01 | Phase 5 | Complete |
| DSN-02 | Phase 5 | Complete |
| DSN-03 | Phase 5 | Complete |
| DSN-04 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-06-14*
*Last updated: 2026-06-14 after roadmap creation*
