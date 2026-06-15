---
status: partial
phase: 05-design-polish
source: [05-VERIFICATION.md]
started: 2026-06-15
updated: 2026-06-15
---

## Current Test

[awaiting human testing — code complete, build green]

## Tests

### 1. Reduced-motion runtime no-op + hero LCP first paint
expected: With OS "reduce motion" ON, the hero shows a static slide (no Ken-Burns, no crossfade) and scroll-reveal sections appear fully visible (never stuck hidden). With it OFF, hero poster is visible at first paint (no flash), then Ken-Burns plays; sections fade/slide in on scroll. LCP hero poster never hidden by reveal.
result: [pending]

### 2. Mobile menu keyboard walk-through (≤640px)
expected: Open menu → focus lands on Close; Tab cycles only within the menu; Shift+Tab from first wraps to last; body does not scroll behind the menu; Escape or Close returns focus to the hamburger trigger.
result: [pending]

### 3. Contact/press contrast + 360px + screen reader
expected: On /contact and /press, the wordmark/CTA text stays legible (WCAG 1.4.3) over both the darkest and brightest poster frames; no horizontal overflow at 360px width; the page name is announced exactly once by a screen reader (decorative wordmark is aria-hidden, sr-only h1 carries the name).
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
