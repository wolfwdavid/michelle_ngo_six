---
phase: 05-design-polish
plan: 03
type: execute
wave: 2
depends_on: ["05-01"]
files_modified:
  - src/routes/contact/+page.svelte
  - src/routes/press/+page.svelte
autonomous: false
requirements: [DSN-04, DSN-01, DSN-03]
must_haves:
  truths:
    - "Neither /contact nor /press uses raw rgba()/hex colors; both use the shared --scrim-vertical OKLCH token."
    - "Wordmarks and CTAs on /contact and /press always sit on a sufficiently dark band (bottom stop ≥0.78) so text never sits on raw bright poster pixels."
    - "The /contact and /press wordmarks use --text-hero (not text-6xl) and the shared --tracking-wordmark."
    - "The decorative /contact visible wordmark is aria-hidden so the SR is not given a duplicate of the sr-only h1."
    - "Neither page has horizontal overflow at 360px; both remain in strict prerender (no new routes)."
  artifacts:
    - path: "src/routes/contact/+page.svelte"
      provides: "Token-scrim contact splash, hero-token wordmark, aria-hidden decorative wordmark"
      contains: "--scrim-vertical"
    - path: "src/routes/press/+page.svelte"
      provides: "Token-scrim press credits, hero-token wordmark, contrast-safe caption"
      contains: "--scrim-vertical"
  key_links:
    - from: "src/routes/contact/+page.svelte"
      to: "src/app.css --scrim-vertical"
      via: "background: var(--scrim-vertical)"
      pattern: "var\\(--scrim-vertical\\)"
---

<objective>
Fix the highest-priority correctness defects on the two poster-splash surfaces (UI-REVIEW Backlog P0 items 2-3, plus the press/contact slice of P1 item 4). Replace the off-token raw `rgba(0,0,0,…)` gradients with the shared `--scrim-vertical` OKLCH token from Plan 05-01, guarantee wordmark/CTA contrast over uncontrolled posters, remap the `text-6xl` wordmarks to `--text-hero` + `--tracking-wordmark`, and `aria-hidden` the decorative contact wordmark. Verify no 360px overflow.

Purpose: Honors the "no raw color" contract and WCAG 1.4.3 over arbitrary poster frames (DSN-04, DSN-01, DSN-03).
Output: Token-clean, contrast-safe /contact and /press.
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
- DEPENDS ON Plan 05-01: the `--scrim-vertical`, `--scrim-strong`, `--text-shadow-cinema`, `--text-hero`, `--tracking-wordmark` tokens must already exist in src/app.css. Read app.css first to confirm; if absent, the dependency wave ran out of order — stop.
- This plan OWNS /contact and /press fully (Plan 05-01 deliberately skipped them). All heading/wordmark + contrast edits to these two files happen here, so no later plan needs to re-touch them for tokens. (Plan 05-04 will add a rune-gated parallax/reveal to these same files — coordinate by leaving the poster `<img>` and gradient `<div>` structurally intact and clearly commented.)
- NO test harness. Verify with `pnpm check`, `pnpm build` (exit 0), grep, and a human contrast/responsive checkpoint.
- No new routes; keep `/pbs-american-portrait/` in PENDING_ROUTES; strict prerender stays green.
- No AI-assistant / planning-phase phrases in code or comments.
</constraints>

<interfaces>
- /contact L43 gradient: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.55) 100%)` → replace with `var(--scrim-vertical)`.
- /contact L51 wordmark: `font-display text-6xl font-semibold leading-tight tracking-[0.2em] text-neutral-50`.
- /contact L55 sr-only h1: `Contact Michelle Ngo` (carries the accessible name).
- /press L49 gradient: identical raw rgba → `var(--scrim-vertical)`.
- /press L58 wordmark: `font-display text-6xl font-semibold leading-tight tracking-tight text-neutral-50`.
- /press L63 caption: `text-base … text-neutral-300` over the transparent gradient middle (contrast-fragile, F3.2).
- Tokens available from app.css (Plan 05-01): --scrim-vertical, --scrim-strong, --text-shadow-cinema, --text-hero, --tracking-wordmark.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Token-scrim + hero-wordmark + aria-hidden on /contact</name>
  <read_first>
    - src/app.css (confirm --scrim-vertical, --text-hero, --tracking-wordmark, --text-shadow-cinema exist — written by Plan 05-01)
    - src/routes/contact/+page.svelte (entire file)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F3.1, F6.2, F6.3, F2.1)
  </read_first>
  <action>
    In src/routes/contact/+page.svelte:
    1. **Scrim token (F3.1):** Replace the L43 gradient inline style with `style="background: var(--scrim-vertical);"`. No raw `rgba(`/`rgb(`/hex must remain in the file.
    2. **Hero wordmark (F2.1):** Change the L51 wordmark classes from `text-6xl … tracking-[0.2em]` to `text-[length:var(--text-hero)] … tracking-[var(--tracking-wordmark)]`. Keep `font-display font-semibold text-neutral-50`; set leading to `leading-[1.1]`.
    3. **Contrast band (F6.2):** Add `style="text-shadow: var(--text-shadow-cinema);"` to the wordmark `<p>` so it stays legible if it ever overlaps a bright frame. (The token scrim's strengthened bottom stop already protects the ContactBlock/CTA band.)
    4. **aria-hidden decorative wordmark (F6.3):** Add `aria-hidden="true"` to the visible `<p>MICHELLE NGO</p>` since the sr-only `<h1>Contact Michelle Ngo</h1>` (L55) carries the accessible name — avoids the SR announcing the wordmark twice.
    Leave the eager poster `<img>` (loading="eager" fetchpriority="high") exactly as-is — it is the LCP image. Add a neutral comment noting the gradient div is a parallax/reveal target for a later motion pass (no phase/plan references).
  </action>
  <verify>
    <automated>! grep -nE "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" src/routes/contact/+page.svelte && grep -q "var(--scrim-vertical)" src/routes/contact/+page.svelte && grep -q -- "--text-hero" src/routes/contact/+page.svelte && grep -q 'aria-hidden="true"' src/routes/contact/+page.svelte && pnpm check</automated>
  </verify>
  <done>/contact has no raw rgba/rgb/hex; uses var(--scrim-vertical); wordmark uses --text-hero + --tracking-wordmark + text-shadow; decorative wordmark is aria-hidden; eager LCP poster untouched; `pnpm check` clean.</done>
</task>

<task type="auto">
  <name>Task 2: Token-scrim + hero-wordmark + contrast-safe caption on /press</name>
  <read_first>
    - src/routes/press/+page.svelte (entire file)
    - .planning/phases/05-design-polish/05-UI-REVIEW.md (F3.1, F3.2, F6.2, F2.1)
  </read_first>
  <action>
    In src/routes/press/+page.svelte:
    1. **Scrim token (F3.1):** Replace the per-article L49 gradient inline style with `style="background: var(--scrim-vertical);"`. No raw `rgba(`/`rgb(`/hex must remain.
    2. **Hero wordmark (F2.1):** Change the L58 network wordmark from `text-6xl … tracking-tight` to `text-[length:var(--text-hero)] … tracking-[var(--tracking-wordmark)]`; keep `font-display font-semibold text-neutral-50`; set `leading-[1.1]`. Add `style="text-shadow: var(--text-shadow-cinema);"`.
    3. **Caption contrast (F3.2):** Raise the L63 title caption from `text-neutral-300` to `text-neutral-50` and add `style="text-shadow: var(--text-shadow-cinema);"` so it is legible over the transparent gradient middle regardless of poster brightness. Keep its size at the meta/body tier (`text-base`).
    4. **CTA (F6.2):** The `▷ Watch` CTA (L70) already sits in the bottom band — the strengthened 0.78 bottom scrim stop now guarantees its contrast; no class change required beyond confirming it reads over the dark band.
    Leave the poster `<img>` eager/lazy logic (i<2 eager) untouched. Neutral comments only.
  </action>
  <verify>
    <automated>! grep -nE "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" src/routes/press/+page.svelte && grep -q "var(--scrim-vertical)" src/routes/press/+page.svelte && grep -q -- "--text-hero" src/routes/press/+page.svelte && ! grep -q "text-neutral-300" src/routes/press/+page.svelte && pnpm check && pnpm build</automated>
  </verify>
  <done>/press has no raw rgba/rgb/hex; uses var(--scrim-vertical); wordmark uses --text-hero + --tracking-wordmark; caption is text-neutral-50 + cinema text-shadow (no neutral-300 caption); `pnpm check` clean and `pnpm build` exits 0 with strict prerender intact.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: Verify contact/press contrast, 360px overflow, and SR announce</name>
  <what-built>/contact and /press now use the OKLCH --scrim-vertical token (no raw rgba), hero-token wordmarks, and contrast-strengthened text bands. Decorative contact wordmark is aria-hidden.</what-built>
  <action>Human verifies contact/press contrast, 360px overflow, and SR announce using the steps below; no code is changed in this checkpoint task.</action>
  <how-to-verify>
    1. `pnpm dev`; open /contact and /press.
    2. Confirm the wordmark, contact block, press caption, and ▷ Watch CTA are clearly legible over both the darkest and the brightest poster in the set (no text washing out).
    3. At a 360px viewport, scroll each page — confirm NO horizontal overflow (no sideways scrollbar) and the wordmark wraps gracefully.
    4. With a screen reader (or the accessibility tree), confirm /contact announces "Contact Michelle Ngo" once (the visible MICHELLE NGO wordmark is not announced).
  </how-to-verify>
  <resume-signal>Type "approved" or describe any contrast/overflow/SR issue.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm check` clean, `pnpm build` exits 0 (strict prerender; no new PENDING_ROUTES change).
- `! grep -rnE "rgba\(|rgb\(" src/routes/contact src/routes/press` → no matches.
- `grep -q "var(--scrim-vertical)" src/routes/contact/+page.svelte src/routes/press/+page.svelte` → matches.
- Human checkpoint confirms contrast + 360px no-overflow + SR single-announce.
</verification>

<success_criteria>
- DSN-04 contrast: wordmarks/CTAs/captions meet legibility over uncontrolled posters; decorative wordmark de-duplicated for SR.
- DSN-01: contact/press wordmarks on the --text-hero ramp + shared tracking; no raw color.
- DSN-03: no 360px horizontal overflow on either page.
- Build green; no route changes.
</success_criteria>

<output>
After completion, create `.planning/phases/05-design-polish/05-03-SUMMARY.md`
</output>
