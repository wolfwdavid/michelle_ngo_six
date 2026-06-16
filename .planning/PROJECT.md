# Michelle Ngo Portfolio (michelle_ngo_six)

## What This Is

A cinematic, YouTube-style portfolio website for filmmaker and producer Michelle Ngo — a ground-up redesign of her current flat WordPress site (michellengo.net). The homepage presents her body of work the way YouTube presents content: a featured hero reel up top, then stacked horizontal "rails" — one per category — that visitors scroll through, with each card opening a watch page. Built in SvelteKit, deployed static to GitHub Pages.

## Core Value

A visitor lands on the homepage and can immediately *watch Michelle's work* — browsing her films/videos by category in an engaging, cinematic, scroll-and-play interface. If everything else fails, the homepage rails + watch experience must work.

## Current Milestone: v2.0 Enhancements

**Goal:** Layer the deferred discovery + richness features onto the shipped v1.0 site without regressing performance or the cinematic feel.

**Target features:**
- Hover/focus video-card previews (YouTube-style, muted, reduced-motion-safe)
- Site-wide client-side search across all videos
- A real `/pbs-american-portrait` page (removing the last prerender allow-list exception) with the PBS American Portrait collection
- Michelle's personalized LinkedIn / IMDb profile URLs (replace the v1 homepage fallbacks)

Same stack and constraints as v1.0: SvelteKit 5 + adapter-static + Tailwind v4, GitHub Pages, CSS depth/motion only (no WebGL), motion gated on the `motion` rune, no AI-assistant mentions in code/commits, no test harness (verify via `pnpm check`/`pnpm build` + grep). Phase numbering continues from v1.0 (starts at Phase 6). Custom-domain cutover to michellengo.net is staged on `launch/custom-domain`.

## Requirements

### Validated

- ✓ SvelteKit 5 + adapter-static foundation forked from `_three`, building clean — Phase 1
- ✓ Tailwind v4 + OKLCH tokens + self-hosted fonts (Source Serif 4, Inter, JetBrains Mono) — Phase 1
- ✓ Zod-validated `videos.json` data layer (56 videos, 8 categories) + state runes — Phase 1
- ✓ App shell (root layout, TopNav, MobileMenu, Footer, ContactBlock) — Phase 1
- ✓ Static prerender live on GitHub Pages at `/michelle_ngo_six` (sitemap, base-path assets) — Phase 1
- ✓ YouTube-style homepage: rotating featured hero + horizontal category rails (cinematic VideoCard, scroll-snap, keyboard nav) — Phase 2
- ✓ Browse work by category (`/work` + `/work/[category]`) and watch any video on `/watch/[id]` (click-to-load player, metadata, related rail) — Phase 3
- ✓ About (approved bio), Contact, and Press pages with a single-source-of-truth ContactBlock (email, phone, Vimeo, LinkedIn, IMDb) — Phase 4
- ✓ Static prerender deployed to GitHub Pages at `/michelle_ngo_six` — Phase 1
- ✓ Dark, cinematic, film-forward design with CSS depth/motion (card tilt, scroll-reveal, hero Ken-Burns) — Phase 5
- ✓ Responsive + accessible (focus trap, keyboard nav, `prefers-reduced-motion`, double focus rings, token-scrim contrast) — Phase 5

### Active

<!-- Milestone v2.0 — building toward these. v1.0 fully validated above. -->

- [ ] Hover/focus card preview (muted loop, YouTube-style, reduced-motion-safe)
- [ ] Site-wide client-side search across all videos
- [ ] Dedicated `/pbs-american-portrait` page + PBS American Portrait collection (remove last prerender allow-list exception)
- [ ] Personalized LinkedIn / IMDb profile URLs (replace homepage fallbacks)

### Out of Scope

- Heavy WebGL / Three.js 3D scene — would hurt LCP on GitHub Pages and add maintenance weight; depth/motion is achieved with CSS transforms, parallax, and scroll reveals instead.
- CMS / backend / auth — content is static (committed `videos.json`); a film portfolio doesn't need a database for v1.
- E-commerce, comments, user accounts — not relevant to a portfolio.
- Re-tagging content into the 5 old WordPress disciplines — homepage organizes by the 8 existing video categories the data already uses.

## Context

**Origin:** Redesign of michellengo.net (currently WordPress.com — minimalist, text-heavy, no carousel/grid). Michelle is a multilingual director/producer/writer based in NYC; credits include PBS American Portrait, HBO, ABC News, Music Box Films, and the Oscar-nominated documentary *The Betrayal*.

**Proven sibling architecture:** Three sibling SvelteKit sites already exist (`michelle_ngo_two/three/four`). We FORK `michelle_ngo_three`, which is the most advanced:
- SvelteKit 5 + `@sveltejs/adapter-static`, pnpm, Tailwind v4 with OKLCH design tokens.
- Self-hosted fonts: Source Serif 4 (display), Inter (body), JetBrains Mono (mono).
- Existing components to reuse: `HeroAmbient` (hero carousel), `VideoCard`, `PosterImage`, `FilterPillBar`, `TopNav`, `MobileMenu`, `Footer`, `ContactBlock`, `ContinueReelRail`.
- Existing data: `src/lib/data/videos.json` — ~70 real Vimeo/YouTube videos, Zod-validated, plus `categories.ts`, `heroSlides.ts`, `posters.json`, `schema.ts`.
- Existing GitHub Pages `deploy.yml` (sets `BASE_PATH=/<repo>`).
- Route structure: `/`, `/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/contact`, `/press`, `/pbs-american-portrait`, `sitemap.xml`.

**Content (reuse verbatim from `_three`):**
- 8 categories: PBS American Portrait, Promos & Trailers, Branded Content, Documentary / Short Film, Reel, Personal / Tribute, Educational / Nonprofit, Other.
- Producer reel: Vimeo id `264677021`.
- Contact: `mynogo@gmail.com`, (917) 566-1976, Vimeo `https://vimeo.com/user2149742`, LinkedIn, IMDb.
- Approved bio (filmmaker/producer, NYC; credits above).

**Design inspiration:** isotopefilms.com, yvonnerusso.com/press, samhendi.com (dark, minimal, film-forward) + the "Claude Design" 3D-website aesthetic (depth, motion, polish) — applied as CSS depth/parallax/tilt, not WebGL. The headline UX metaphor is YouTube's browse layout (stacked horizontal rails).

**Design tooling:** UI/UX Pro Max and Anthropic Frontend Design skills are used during UI phases.

## Constraints

- **Tech stack**: SvelteKit 5 + adapter-static + Tailwind v4 + pnpm — match `_three` so components/data port cleanly.
- **Hosting**: GitHub Pages (static, prerendered). Requires `BASE_PATH=/michelle_ngo_six`; no hardcoded absolute asset paths.
- **Performance**: Cinematic but fast — protect LCP. No heavy 3D/WebGL. Lazy-load video iframes; eager-load only the hero poster.
- **Accessibility**: Honor `prefers-reduced-motion`; keyboard-navigable rails; visible focus rings (carried from `_three`'s design system).
- **Repo**: Own git repo, remote `https://github.com/wolfwdavid/michelle_ngo_six.git` (user `wolfwdavid`).
- **Commits**: No mention of AI assistants in commit messages or code.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork `michelle_ngo_three` architecture | Most advanced sibling; has hero carousel, VideoCard, validated videos.json, Pages deploy — fastest path to a quality result | — Pending |
| Homepage = hero + YouTube-style category rails | Direct interpretation of the headline requirement ("think YouTube"); cinematic and content-first | — Pending |
| 8 video categories (not the 5 WordPress disciplines) | Matches existing `videos.json` exactly — zero content re-tagging | — Pending |
| Depth/motion via CSS, not WebGL | Cinematic feel from the 3D inspiration without sacrificing LCP on GitHub Pages | — Pending |
| Skip 4-agent ecosystem research | Stack/features/pitfalls already known from proven sibling — research would rediscover, not discover | — Pending |
| Balanced (Sonnet) planning agents, Standard granularity, YOLO mode | "standard please" — recommended GSD defaults | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-16 — milestone v2.0 (Enhancements) started; v1.0 complete + live*
