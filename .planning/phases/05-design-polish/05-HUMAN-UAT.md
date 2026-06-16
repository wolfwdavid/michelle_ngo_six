---
status: passed
phase: 05-design-polish
source: [05-VERIFICATION.md]
started: 2026-06-15
updated: 2026-06-15
method: automated (Playwright against local preview) + screenshot review
---

## Current Test

[complete — all 3 items verified via Playwright automation, 21/21 sub-checks passed]

## Tests

### 1. Reduced-motion runtime no-op + hero LCP first paint
expected: reduced-motion → static hero (no Ken-Burns/auto-advance), reveal sections visible; motion-on → hero advances; LCP poster visible at first paint.
result: PASS
evidence:
  - Hero LCP poster (`fetchpriority=high`) visible at first paint, computed opacity = 1.
  - Reveal sections (8 rails) all opacity 1 under reduced-motion (never stuck hidden).
  - Reduced-motion: active slide unchanged after 8.2s ("Producer's Reel" → "Producer's Reel"). No auto-advance.
  - Control (motion allowed): active slide advanced slide 1 → slide 2 after 8.2s. Carousel works when permitted.

### 2. Mobile menu keyboard walk-through (360px)
expected: focus enters menu, Tab traps/cycles, Shift+Tab wraps, body scroll-locked, Escape restores focus to trigger.
result: PASS
evidence:
  - Trigger present @360px; opens `#mobile-menu` with `aria-modal="true"`.
  - Body overflow = hidden while open; restored to visible on close.
  - Focus moved into menu on open; Tab cycled through 13 focusables staying inside; Shift+Tab stayed inside.
  - Escape closed the menu and restored focus to the trigger.

### 3. Contact/press contrast + 360px + screen reader
expected: legible wordmark/CTA over posters, no 360px horizontal overflow, single SR announce (aria-hidden decorative wordmark + sr-only h1).
result: PASS
evidence:
  - /contact and /press: scrollWidth == clientWidth == 360 (no horizontal overflow).
  - Exactly one `<h1>` each; aria-hidden decorative element(s) present (contact: 3, press: 13).
  - No raw `rgba(0,0,0,…)` in inline styles — token scrim (`--scrim-vertical`) in use.
  - Screenshot review: wordmark + white captions legible over the scrim (text-shadow `--text-shadow-cinema`); authoritative contact info also repeated on the solid dark ContactBlock below (fully legible regardless of poster).
  - Minor cosmetic note (non-blocking): mid-splash overlay text relies on the cinema text-shadow over a mid-tone poster region; acceptable for the intended cinematic splash, and the dark ContactBlock guarantees legibility.

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None — all human-UAT items verified (21/21 automated sub-checks passed).
