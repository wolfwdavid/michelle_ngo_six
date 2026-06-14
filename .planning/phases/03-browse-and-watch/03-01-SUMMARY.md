---
phase: 03-browse-and-watch
plan: 01
subsystem: ui
tags: [svelte5, sveltekit, vimeo, youtube, prerender, adapter-static, lcp, click-to-load]

# Dependency graph
requires:
  - phase: 02-home-and-shell
    provides: VideoCard, CategoryRail, categoryAccent helpers, data layer ($lib/data), posters helper, motion rune, watch/[id]/+page.ts prerender loader
provides:
  - Full /watch/[id] player page (poster-first, click-to-load embed by source)
  - Title, accent category pill linking to /work/[category], uploader·year, optional description, back-to-work link
  - "Related work" rail of same-category videos with current id excluded and sparse top-up
  - 56 prerendered build/watch/{id}/index.html pages with no embed iframe in static HTML
affects: [work-index, work-category, polish, seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Click-to-load embed: iframe mounted only on user click so no third-party iframe ships in prerendered HTML (protects LCP/privacy)"
    - "Inline embed-URL selection by video.source (no shared iframe adapter in this repo)"
    - "Inline related-work rail (mirrors CategoryRail track classes) so the current id can be excluded — CategoryRail cannot exclude it"

key-files:
  created: []
  modified:
    - "src/routes/watch/[id]/+page.svelte"

key-decisions:
  - "Embed iframe is click-to-load (poster + play overlay first); host chosen inline by source (player.vimeo.com / youtube-nocookie.com)"
  - "Related rail built inline rather than via CategoryRail so the current video is excluded; topped up from other categories when sparse, capped at 12"
  - "Reduced motion gated via the motion-ok class bound to motion.prefersReducedMotion — no media-query motion variant"

patterns-established:
  - "Pattern 1: Poster-first click-to-load player keeps embeds out of prerendered HTML"
  - "Pattern 2: Inline scroll-snap rail mirroring CategoryRail track classes for id-filtered card lists"

requirements-completed: [WCH-01, WCH-02, WCH-03, WCH-04]

# Metrics
duration: 4min
completed: 2026-06-14
---

# Phase 03 Plan 01: Watch Player Summary

**Poster-first /watch/[id] player that mounts a Vimeo/YouTube embed only on click, with title, linked category pill, metadata, and a same-category "Related work" rail — prerendering all 56 watch pages with zero embed iframes in the static HTML.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-14T20:35:16Z
- **Completed:** 2026-06-14T20:38:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Replaced the Phase-2 watch stub with the full cinematic player on the dark app shell
- Click-to-load embed: only the poster + play overlay render on first paint; the iframe mounts on click, choosing player.vimeo.com (vimeo) or youtube-nocookie.com (youtube) by `video.source`
- Below-player chrome: back-to-work link, title, accent category pill linking to `/work/[category]`, uploader·year, optional description
- "Related work" rail of same-category videos with the current id excluded and topped up from other categories when sparse (capped at 12)
- `pnpm build` prerenders all 56 `build/watch/{id}/index.html` pages with no embed iframe host in the static HTML (WCH-04)

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Watch page shell, click-to-load player, and Related work rail** - `4c3a218` (feat)

_Note: Tasks 1 and 2 edit the same single file (`+page.svelte`) and the related-rail data/markup is interwoven with the player shell, so they were authored and committed as one coherent change. Task 2's distinct deliverable — the prerender — was verified by `pnpm build` (exit 0, 56 pages, 0 iframe hosts in static HTML)._

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/routes/watch/[id]/+page.svelte` - Full watch player: poster + play overlay, click-to-load embed by source, title/category-pill/metadata, and an inline same-category "Related work" rail excluding the current id

## Decisions Made
- **Click-to-load embed:** poster + play button render first; the embed iframe is mounted only on user click so no third-party iframe is present in prerendered HTML. autoplay=1 is safe because the iframe only exists post-click.
- **Inline embed URL by source:** no shared iframe adapter exists in this repo, so the host/URL is selected inline (`player.vimeo.com/video/{id}` vs `youtube-nocookie.com/embed/{id}`).
- **Inline related rail:** `CategoryRail` renders the whole category including the current video and cannot exclude it, so the rail is built inline (mirroring CategoryRail's track classes) over `getByCategory(category)` filtered by id, topped up from other categories when fewer than 4 remain.
- **Reduced motion:** the play-overlay hover scale is gated by `class:motion-ok={!motion.prefersReducedMotion}` — no `motion-safe:` variant or `matchMedia`.

## Deviations from Plan

None - plan executed exactly as written. The plan's two tasks both edit the same single file with interwoven logic; they were committed together as one atomic feat commit rather than two, and Task 2's prerender outcome was verified via `pnpm build`.

## Issues Encountered
- A comment originally contained the literal token "matchMedia", which tripped the `grep -E "motion-safe:|matchMedia"` acceptance check (a false positive in prose, not actual usage). Reworded the comment so the grep returns nothing — the mechanism was always the motion rune.

## Verification
- `pnpm check` — 0 errors, 0 warnings (372 files)
- `pnpm build` — exit 0 (adapter-static strict prerender)
- `find build/watch -name index.html | wc -l` == 56
- `test -f build/watch/264677021/index.html` (reel), `build/watch/22397708/index.html` (vimeo), `build/watch/9Zmw69UZSsI/index.html` (youtube) — all present
- `grep -c "player.vimeo.com\|youtube-nocookie.com" build/watch/264677021/index.html` == 0 (WCH-04 — no embed iframe in prerendered HTML)
- `grep -c "Related work" build/watch/264677021/index.html` == 1 (rail rendered into static HTML)
- `git diff --name-only -- src/routes/watch/[id]/+page.ts` empty (loader untouched)
- No `motion-safe:` / `matchMedia` and no planning/assistant phrases in the watch page

## Known Stubs
None — the player, metadata, and related rail are fully wired to the real data layer. Poster assets resolve via `getPosterFor` (Plan 03-03 populates the real sidecar entries; the deterministic fallback path keeps the type non-null in the meantime).

## Next Phase Readiness
- WCH-01..04 complete; watch pages are real and prerendered
- Category pills link to `/work/[category]` and the back link targets `/work` — both depend on Plans 03-02 (work index) and 03-03 (work category) to land their destination pages

## Self-Check: PASSED

- FOUND: src/routes/watch/[id]/+page.svelte
- FOUND: .planning/phases/03-browse-and-watch/03-01-SUMMARY.md
- FOUND: commit 4c3a218

---
*Phase: 03-browse-and-watch*
*Completed: 2026-06-14*
