---
phase: 05-design-polish
plan: 02
subsystem: mobile-navigation
tags: [a11y, focus-trap, modal, scroll-lock, wcag]
requires:
  - "MobileMenu mounted only while menu.menuOpen (TopNav conditional render)"
provides:
  - "WCAG-compliant modal MobileMenu: focus enters, is trapped, body locked, restored on close"
affects:
  - "src/lib/components/MobileMenu.svelte"
tech-stack:
  added: []
  patterns:
    - "Single $effect modal lifecycle: setup on open, cleanup on close (mount/destroy maps to open/close because the component is conditionally rendered)"
    - "requestAnimationFrame for initial focus so the dialog node is painted/focusable"
    - "Tab/Shift+Tab cycling via document.activeElement boundary checks"
key-files:
  created: []
  modified:
    - "src/lib/components/MobileMenu.svelte"
decisions:
  - "Reused/extended the existing Escape $effect into one modal-lifecycle effect rather than adding a second listener, keeping a single source of truth for the overlay's keydown behaviour"
  - "Initial focus targets the Close button (button[aria-label=\"Close menu\"]) with a fallback to the first focusable element"
  - "Scroll-lock captures and restores the prior document.body.style.overflow value rather than hardcoding a reset, so a pre-existing inline overflow is preserved"
metrics:
  duration: 7m
  completed: 2026-06-15
  tasks: 1
  files: 1
---

# Phase 5 Plan 2: MobileMenu A11y (Focus Trap + Scroll-Lock) Summary

Hardened `MobileMenu.svelte` into a fully WCAG-compliant modal: opening the menu moves focus to the Close button, Tab/Shift+Tab cycle only within `#mobile-menu` (no escape to the chrome behind it), the page body is scroll-locked while the overlay is up, and closing (Escape, a link click, or Close) restores focus to the hamburger trigger. Closes DSN-04 / UI-REVIEW F6.1 (WCAG 2.4.3 focus order, 2.1.2 no keyboard trap).

## What Was Built

A single setup `$effect` (replacing the prior Escape-only effect) now runs the complete modal contract on open and reverses it on close:

1. **Capture + restore trigger** — `document.activeElement` is captured at setup (the hamburger that called `openMenu()`); the cleanup calls `trigger?.focus()`.
2. **Body scroll-lock** — captures `document.body.style.overflow`, sets it to `'hidden'`, and restores the captured value on cleanup.
3. **Initial focus** — via `requestAnimationFrame`, focus moves to `button[aria-label="Close menu"]` (fallback: first focusable element).
4. **Focus trap** — a `keydown` handler queries `a[href], button:not([disabled])` inside `#mobile-menu` and wraps focus: Shift+Tab on the first (or focus outside the dialog) jumps to the last; Tab on the last jumps to the first; both `preventDefault()`.
5. **Escape** — still calls `closeMenu()`, unchanged.

All listeners, the rAF, body overflow, and focus are cleaned up in the `$effect` return so re-opening the menu starts from a clean state. `role="dialog"`, `aria-modal="true"`, and the existing markup were left intact.

## Verification

- `pnpm check` — clean (0 errors, 0 warnings, 390 files). One iteration was needed: `noUncheckedIndexedAccess` flagged `first`/`last` as possibly undefined; resolved with an explicit `if (!first || !last) return;` guard.
- `pnpm build` — exit 0 (adapter-static wrote `build/` successfully, built in ~40s).
- grep structural checks all pass: `document.body.style.overflow`, `activeElement`, `'Tab'`, `mobile-menu`.

No runtime/interactive keyboard testing was possible in this environment (no dev server, no test harness). The behavioural checkpoint is recorded below as a deferred manual verification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript `noUncheckedIndexedAccess` on focus-trap boundaries**
- **Found during:** Task 1 verification (`pnpm check`)
- **Issue:** `const first = focusable[0]` / `focusable[length-1]` are typed `HTMLElement | undefined` under `noUncheckedIndexedAccess`, failing `pnpm check`.
- **Fix:** Replaced the `focusable.length === 0` early-return with an `if (!first || !last) return;` guard after destructuring, which both narrows the types and preserves the empty-list short-circuit.
- **Files modified:** `src/lib/components/MobileMenu.svelte`
- **Commit:** b1e2b72

## Checkpoint — Deferred Manual Keyboard Verification

The plan's Task 2 is a `checkpoint:human-verify` (keyboard walk-through) that cannot be performed without an interactive browser. Implementation is structurally verified (grep + `pnpm check` + `pnpm build`). The following manual steps are deferred to the orchestrator / human verifier:

1. Run `pnpm dev`; open the site at a narrow viewport (DevTools device mode ≤640px).
2. Tab to the hamburger button and press Enter to open the menu.
3. Confirm focus lands on the Close button inside the menu.
4. Press Tab repeatedly — focus must cycle only through the menu links + Close button and never reach the page behind the overlay.
5. From the first item, press Shift+Tab — focus must wrap to the last item.
6. Confirm the page behind the overlay does NOT scroll while the menu is open.
7. Press Escape (or click Close) — the menu closes and focus returns to the hamburger button.

Expected: all seven pass. Any failure is a focus/scroll regression to fix in `MobileMenu.svelte`.

## Known Stubs

None.

## Commits

- b1e2b72: feat(05-02): trap focus and lock scroll in mobile menu

## Self-Check: PASSED
