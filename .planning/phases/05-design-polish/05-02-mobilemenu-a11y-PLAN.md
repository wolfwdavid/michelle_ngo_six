---
phase: 05-design-polish
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/MobileMenu.svelte
autonomous: false
requirements: [DSN-04]
must_haves:
  truths:
    - "Opening the mobile menu moves focus into the dialog and Tab cannot escape to the chrome behind it."
    - "While the menu is open the page body does not scroll behind the fixed overlay."
    - "Closing the menu (Escape or a link/close click) restores focus to the hamburger trigger."
    - "Escape still closes the menu."
  artifacts:
    - path: "src/lib/components/MobileMenu.svelte"
      provides: "Focus trap + body scroll-lock + focus-restore in an aria-modal dialog"
      contains: "overflow"
  key_links:
    - from: "src/lib/components/MobileMenu.svelte"
      to: "#mobile-menu focusable elements"
      via: "Tab keydown handler cycling focus within the dialog"
      pattern: "Tab"
---

<objective>
Close the one true a11y defect in the mobile navigation (DSN-04, UI-REVIEW F6.1 / Backlog P0 item 1). MobileMenu is `role="dialog" aria-modal="true"` and closes on Escape, but focus is never moved into it, Tab escapes to the chrome behind it, the body still scrolls, and focus is not restored on close. Add a focus trap, body scroll-lock, initial focus to the close button, and focus-restore to the trigger.

Purpose: WCAG 2.4.3 (focus order) and 2.1.2 (no keyboard trap) compliance for the modal overlay.
Output: Hardened MobileMenu.svelte — self-contained, no other files touched.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-design-polish/05-UI-REVIEW.md
@.planning/phases/05-design-polish/05-CONTEXT.md

<constraints>
- NO test harness. Verify ONLY with `pnpm check` (clean), `pnpm build` (exit 0), and grep. There is no vitest. Behaviour is verified by a human checkpoint (keyboard walk-through) at the end.
- This is the ONLY file this plan touches — no overlap with any other Plan 05 plan, so it runs in parallel.
- The menu is mounted ONLY while open (TopNav conditionally renders it after openMenu()); so onMount = "menu just opened" and onDestroy = "menu closing". Use `$effect` with a cleanup return (the existing Escape effect already follows this shape, L27-35).
- No `motion-safe:`/`matchMedia`. (No motion involved here.)
- No AI-assistant / planning-phase phrases in any code or comment.
</constraints>

<interfaces>
Current MobileMenu.svelte (src/lib/components/MobileMenu.svelte):
- Root: `<div id="mobile-menu" role="dialog" aria-modal="true" …>` (L38-44).
- Close button: `<button type="button" aria-label="Close menu" onclick={closeMenu}>` (L53).
- Escape handling already present via document keydown $effect (L27-35) calling `closeMenu()` from `$lib/state/menu.svelte`.
- The hamburger trigger lives in TopNav.svelte and calls `openMenu()`. The trigger is `document.activeElement` at the moment this component mounts — capture it then.

Reference pattern for $effect cleanup lifetime: src/lib/state/visibility.svelte.ts and the existing Escape $effect in this same file.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add focus trap, scroll-lock, and focus-restore to MobileMenu</name>
  <read_first>
    - src/lib/components/MobileMenu.svelte (entire file — the dialog markup + existing Escape $effect)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F6.1 — the exact defect list)
  </read_first>
  <action>
    In the `<script>` block of MobileMenu.svelte, add a single setup `$effect` (alongside or merged with the existing Escape effect) that runs on mount and cleans up on destroy:

    1. **Capture + restore trigger:** Before moving focus, capture `const trigger = document.activeElement as HTMLElement | null;`. In the cleanup, call `trigger?.focus();` so focus returns to the hamburger when the menu closes.

    2. **Body scroll-lock:** On setup, `const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';`. In cleanup, restore `document.body.style.overflow = prevOverflow;`.

    3. **Initial focus:** Query the dialog (`document.getElementById('mobile-menu')`), move focus to the close button (the `aria-label="Close menu"` button) on mount. Use a microtask/`requestAnimationFrame` if the node is not yet focusable synchronously.

    4. **Focus trap:** Add a `keydown` handler (can extend the existing Escape handler) that, on `Tab`, queries all focusable elements within `#mobile-menu` (`a[href], button:not([disabled])` is sufficient here — all interactive children are anchors + the close button), and cycles: if `Shift+Tab` on the first element, move to the last and `preventDefault()`; if `Tab` on the last element, move to the first and `preventDefault()`. Keep `Escape` → `closeMenu()`.

    Ensure all listeners are removed and body overflow + focus are restored in the `$effect` cleanup so re-opening the menu starts clean. Write neutral comments only (no D-xx, no "Phase N", no sibling-repo names).

    Self-check: do NOT remove the existing `aria-modal="true"` / `role="dialog"` / Escape behaviour — you are adding to it.
  </action>
  <verify>
    <automated>grep -q "document.body.style.overflow" src/lib/components/MobileMenu.svelte && grep -qE "activeElement" src/lib/components/MobileMenu.svelte && grep -qE "'Tab'|\"Tab\"" src/lib/components/MobileMenu.svelte && grep -q "mobile-menu" src/lib/components/MobileMenu.svelte && pnpm check && pnpm build</automated>
  </verify>
  <done>MobileMenu sets body overflow hidden on open and restores on close; captures and restores the trigger's focus; moves initial focus to the close button; traps Tab/Shift+Tab within #mobile-menu; Escape still closes. `pnpm check` clean, `pnpm build` exits 0.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: Verify mobile menu focus trap, scroll-lock, and restore</name>
  <what-built>Focus trap, body scroll-lock, initial-focus, and focus-restore added to the mobile menu overlay (MobileMenu.svelte). Escape-close preserved.</what-built>
  <action>Human verifies the mobile-menu modal behaviour using the steps below; no code is changed in this checkpoint task.</action>
  <how-to-verify>
    1. Run `pnpm dev` and open the site at a narrow viewport (or DevTools device mode ≤640px).
    2. Tab to the hamburger button and activate it (Enter) to open the menu.
    3. Confirm focus lands inside the menu (close button) — press Tab repeatedly and confirm focus cycles only through the menu links + close button and never reaches the page behind it. Try Shift+Tab from the first item — focus should wrap to the last.
    4. Confirm the page behind the overlay does NOT scroll while the menu is open.
    5. Press Escape (or click Close) — the menu closes and focus returns to the hamburger button.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any focus/scroll issue to fix.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm check` clean, `pnpm build` exits 0.
- `grep -q "document.body.style.overflow" src/lib/components/MobileMenu.svelte` → match.
- Human checkpoint confirms trap + scroll-lock + restore + Escape.
</verification>

<success_criteria>
- DSN-04 (focus management): mobile menu is a compliant modal — focus enters, is trapped, body locked, restored on close.
- No other files changed; build green.
</success_criteria>

<output>
After completion, create `.planning/phases/05-design-polish/05-02-SUMMARY.md`
</output>
