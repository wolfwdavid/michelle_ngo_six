---
phase: 05-design-polish
plan: 05
type: execute
wave: 4
depends_on: ["05-01", "05-02", "05-03", "05-04"]
files_modified:
  - src/app.css
  - src/routes/+page.svelte
  - src/routes/+layout.svelte
  - src/routes/watch/[id]/+page.ts
  - src/routes/sitemap.xml/+server.ts
  - src/lib/components/HeroCarousel.svelte
  - src/lib/components/CategoryRail.svelte
  - src/lib/components/VideoCard.svelte
  - src/lib/components/MobileMenu.svelte
  - src/lib/components/TopNav.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/ContactBlock.svelte
  - src/lib/heroCarousel.svelte.ts
  - src/lib/data/index.ts
  - src/lib/data/heroSlides.ts
  - src/lib/data/posters.ts
  - src/lib/data/videos.ts
  - src/lib/data/categories.ts
  - src/lib/data/schema.ts
  - src/lib/storage.ts
  - src/lib/components/categoryAccent.ts
  - src/lib/state/visibility.svelte.ts
  - src/lib/state/network.svelte.ts
  - src/lib/state/motion.svelte.ts
  - src/lib/state/menu.svelte.ts
  - src/lib/state/scrollIdle.svelte.ts
autonomous: true
requirements: [DSN-01, DSN-02, DSN-03, DSN-04]
must_haves:
  truths:
    - "No file under src/ contains a leaked planning/sibling annotation matching _three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\\.md."
    - "Code behaviour is unchanged — only comments were edited or removed."
    - "No AI-assistant phrases were introduced."
    - "pnpm check is clean and pnpm build exits 0 with strict prerender intact."
  artifacts:
    - path: "src/app.css"
      provides: "Neutral, annotation-free comments"
      contains: "@theme"
  key_links:
    - from: "src/"
      to: "leaked-annotation pattern"
      via: "grep returns zero matches"
      pattern: "_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\\.md"
---

<objective>
Codebase hygiene (cross-cutting, supports all of DSN-01..04). Scrub leaked planning/sibling-repo annotations from ported source comments across `src/`. 26 files currently reference sibling repos (`_three`/`_four`), locked-decision ids (`D-xx`), phase numbers (`Phase N`), or plan filenames (`PLAN.md`) in comments. Replace each with a neutral comment that preserves the useful intent, or remove it. Final state: zero matches for the leaked-annotation pattern in `src/`.

Purpose: Ship a clean codebase with no internal planning scaffolding visible in shipped source (CLAUDE.md mandate). Sequenced LAST so it does not conflict with the churn from Plans 05-01..05-04.
Output: All `src/` comments neutralized; behaviour byte-equivalent.
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
- This plan runs LAST (wave 4, after 05-01..05-04) so it scrubs the final state of every file — including comments those plans add. The executor MUST first re-run the grep to get the CURRENT match list, since earlier plans may have changed line numbers and added/removed comments.
- COMMENTS ONLY. Do not change any executable code, class names, token values, control flow, or exports. The only edits are to comment text (and removing now-pointless comments). Behaviour must be byte-equivalent.
- Preserve genuinely useful intent in neutral language. Examples:
  - "D-02 bg canvas: --color-neutral-950 = oklch(0.16 0 0)" → "Canvas background: --color-neutral-950 = oklch(0.16 0 0)".
  - "Mirrors ../michelle_ngo_four/src/lib/components/MobileMenu.svelte" → remove the sibling path, keep any behavioural note ("Full-screen mobile overlay menu.").
  - "Phase 2 — Homepage rails motion tokens" → "Homepage rails motion tokens".
  - "(Plan 04-01 pre-registered)" / "PLAN.md" references → remove.
- Also keep the codebase free of AI-assistant / "discretion" / claude|gemini phrasing (already clean — do not introduce any).
- NO test harness — verify with grep, `pnpm check`, `pnpm build` (exit 0).
- No new routes; `/pbs-american-portrait/` stays in PENDING_ROUTES; strict prerender stays green.
</constraints>

<interfaces>
Detection command (run before AND after):
```
grep -rnE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/
```
Known files at planning time (26): src/app.css, src/routes/+page.svelte, src/routes/+layout.svelte, src/routes/watch/[id]/+page.ts, src/routes/sitemap.xml/+server.ts, src/lib/components/{HeroCarousel,CategoryRail,VideoCard,MobileMenu,TopNav,Footer,ContactBlock}.svelte, src/lib/heroCarousel.svelte.ts, src/lib/data/{index,heroSlides,posters,videos,categories,schema}.ts, src/lib/storage.ts, src/lib/components/categoryAccent.ts, src/lib/state/{visibility,network,motion,menu,scrollIdle}.svelte.ts. (Earlier plans may have shifted these — re-grep for the authoritative list.)

NOTE the pattern caveats: `D-[0-9]{2}` matches two-digit-suffixed ids like `D-02`; check it does not appear in legitimate code identifiers — in this repo all such matches are in comments. `Phase [0-9]` and `PLAN.md` likewise appear only in comments. The match for `_three`/`_four` is sibling-repo paths/names in comments. Confirm each match is a comment before editing; if any match is in executable code (unexpected), STOP and report rather than alter code.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scrub leaked annotations from src/ comments (component + route files)</name>
  <read_first>
    - Re-run `grep -rnE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/` to get the CURRENT authoritative match list and line numbers.
    - Each flagged file's matching comment region before editing.
    - .planning/phases/05-design-polish/05-CONTEXT.md (Codebase hygiene section — the scrub contract)
  </read_first>
  <action>
    For every match in the Svelte component + route files (src/routes/**, src/lib/components/**, src/app.css), edit the COMMENT TEXT ONLY:
    - Remove sibling-repo references (`_three`, `_four`, and any `../michelle_ngo_*` path) entirely; keep any behavioural sentence in neutral form.
    - Replace `D-NN` references with the plain-English meaning (e.g. "D-05 Keyboard focus: double-ring" → "Keyboard focus: double-ring").
    - Remove `Phase N` and `PLAN.md` / `(Plan NN-NN …)` references; keep the surrounding explanation if useful.
    Confirm each edit touches only a comment (no code token changes). After editing this batch, verify the pattern count for these files only.
  </action>
  <verify>
    <automated>! grep -rqE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/app.css src/routes src/lib/components && pnpm check</automated>
  </verify>
  <done>No leaked-annotation matches remain in src/app.css, src/routes/**, src/lib/components/**; `pnpm check` clean; only comments changed.</done>
</task>

<task type="auto">
  <name>Task 2: Scrub leaked annotations from src/lib data/state/util files + final sweep</name>
  <read_first>
    - The remaining matches under src/lib/data/**, src/lib/state/**, src/lib/storage.ts, src/lib/heroCarousel.svelte.ts, src/lib/components/categoryAccent.ts (re-grep for current lines).
    - .planning/phases/05-design-polish/05-CONTEXT.md
  </read_first>
  <action>
    Apply the same comments-only scrub to the data/state/util files (src/lib/data/**, src/lib/state/**, src/lib/storage.ts, src/lib/heroCarousel.svelte.ts, src/lib/components/categoryAccent.ts):
    - Drop sibling-repo names, D-NN ids, Phase-N labels, PLAN.md references from comments; keep neutral behavioural notes.
    - In the state files (motion/visibility/menu/network/scrollIdle .svelte.ts) be careful: keep the `__resetForTests`/`__set*ForTests` helpers and all code intact — only neutralize their comment prose (e.g. remove "Plan 03-03 Task 2" / "Phase 4 D-08" phrasing).
    Then run the FULL-tree detection to prove zero matches across all of src/.
  </action>
  <verify>
    <automated>! grep -rqE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/ && ! grep -rqiE 'claude|gemini|ai assistant|discretion' src/ && pnpm check && pnpm build</automated>
  </verify>
  <done>`grep -rnE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/` returns ZERO matches; no AI-assistant phrasing present; `pnpm check` clean and `pnpm build` exits 0 with strict prerender intact; only comments changed.</done>
</task>

</tasks>

<verification>
- `! grep -rqE '_three|_four|D-[0-9]{2}|Phase [0-9]|PLAN\.md' src/` → zero matches (exit 0 on the negation).
- `! grep -rqiE 'claude|gemini|ai assistant|discretion' src/` → zero matches.
- `pnpm check` clean, `pnpm build` exits 0 (strict prerender; no route changes).
- `git diff --stat` shows only comment-line changes (no logic deltas) — executor sanity-checks the diff.
</verification>

<success_criteria>
- Zero leaked planning/sibling annotations in src/; codebase clean for ship.
- Behaviour byte-equivalent; build green; no route changes.
</success_criteria>

<output>
After completion, create `.planning/phases/05-design-polish/05-05-SUMMARY.md`
</output>
