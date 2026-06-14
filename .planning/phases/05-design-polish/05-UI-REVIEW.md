---
phase: 5
slug: design-polish
type: ui-review
created: 2026-06-14
baseline: 02-UI-SPEC.md (homepage) + abstract 6-pillar / cinematic standards (other surfaces)
screenshots: not captured (code-only audit — no dev server probed; static-prerender target)
---

# Phase 5 — UI Review: Design Polish Audit

Retroactive 6-pillar visual + interaction audit of the implemented Michelle Ngo
filmmaker portfolio (SvelteKit 5 + Tailwind v4, static-prerendered to GitHub
Pages). Baseline: the approved homepage `02-UI-SPEC.md` where it applies; abstract
cinematic/UI-UX-Pro-Max + Anthropic-frontend standards (visual hierarchy,
restraint, intentional motion, accessibility) for surfaces with no contract
(/work, /watch, /about, /contact, /press, chrome).

**Method:** code review only. No dev server was available to capture screenshots,
so all findings are sourced to file:line. Every finding carries a concrete,
token-scoped fix a Phase-5 executor can apply directly.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Visual Hierarchy | 3/4 | Strong on homepage/watch; /press + /contact rely on one oversized `text-6xl` wordmark with weak mid-tier rhythm |
| 2. Typography | 2/4 | Heading scale drifts across pages (`text-2xl`/`3xl`/`4xl`/`6xl` + reintroduced `text-xs`) — UI-SPEC promised a 4-size ramp; cross-page contract is not enforced |
| 3. Color / Contrast | 3/4 | Token discipline excellent on homepage, but raw `rgba(0,0,0,…)` gradients shipped on /contact + /press (off-token), and press caption `neutral-300` over imagery is contrast-fragile |
| 4. Spacing / Layout | 3/4 | Page rhythm is solid; section vertical gaps diverge per route (`py-8` vs `py-16` vs `py-24`) with no shared section token; 360px grid is 2-col but card meta is sparse |
| 5. Motion / Interaction | 3/4 | Rune-gating is exemplary and disciplined; but there is zero scroll-reveal entrance motion and no hero/section parallax — the page is static until hover. Cinematic ceiling unused |
| 6. Accessibility & Responsive | 3/4 | Focus system + reduced-motion are best-in-class; gaps: MobileMenu lacks focus-trap/scroll-lock, press/contact `text-neutral-50` over uncontrolled posters can fail 4.5:1, decorative wordmarks duplicate visible text |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Off-token raw colors + contrast-fragile text over uncontrolled posters**
   (`/contact` L43, `/press` L49 raw `rgba()`; `/press` title + CTA over arbitrary
   poster frames) — **HIGH** — breaks the "no raw color" contract and risks WCAG
   1.4.3 failures on bright frames. Fix: replace both gradients with the
   homepage-proven OKLCH scrim token expression and add a guaranteed-contrast
   bottom band. (See Pillar 3 / 6.)

2. **Cross-page typographic + spacing drift** (heading sizes `text-2xl`→`text-6xl`
   and `text-xs` reappearing across Footer/TopNav/FilterPillBar; section padding
   `py-8`/`py-16`/`py-24` ad hoc) — **MED** — the UI-SPEC's "4 sizes / 3 weights"
   restraint holds on the homepage but is not honored sitewide, reading as several
   designers. Fix: introduce a small set of `@theme` heading + section-rhythm
   tokens and map every page to them. (See Pillar 2 / 4.)

3. **No scroll-reveal entrance motion or parallax — the cinematic ceiling is
   unused** — **MED** — rails, watch metadata, and press sections appear fully
   formed; references (isotopefilms / samhendi) earn their feel from staggered
   reveals and slow parallax. Fix: add a single rune-gated `IntersectionObserver`
   reveal action + a CSS-only hero/poster parallax, both no-ops under reduced
   motion and LCP-safe. (See Pillar 5.)

---

## Detailed Findings

### Pillar 1 — Visual Hierarchy (3/4)

**Strengths.** The homepage hero (`HeroCarousel.svelte`) nails focal point:
full-bleed poster, bottom scrim, accent eyebrow → serif title → neutral dots.
`/watch/[id]` has a clean reading column (`max-w-3xl`) with a logical
back-link → title → category pill → meta → description → related cascade.

**F1.1 — MED — `/press/+page.svelte` L57-65, `/contact/+page.svelte` L51-53.**
Both surfaces lean on a single `text-6xl` wordmark with `justify-between` pushing
three items to the screen edges. The mid-tier (title caption `text-base
neutral-300`) is visually orphaned in dead-center space with no connective
hierarchy to the wordmark. Result: a giant word, a tiny caption, a button — three
disconnected zones, not a composition.
*Fix:* tighten the vertical composition to a lower-third stack (like the hero):
move wordmark + title + CTA into a single bottom-anchored group with an eyebrow →
title → CTA rhythm, `gap-4`, left-or-center aligned, inside `p-8`. Drop
`justify-between`; use `justify-end` so the content reads as one cinematic caption
block over the poster instead of three scattered anchors.

**F1.2 — LOW — `/work/[category]/+page.svelte` L37-43 vs `/work/+page.svelte`.**
The category route shows a visible `text-2xl/3xl` header + count; the `/work`
index shows none (only an sr-only h1 + pill bar). Inconsistent entry hierarchy
between two sibling browse surfaces.
*Fix:* give `/work` a matching visible header ("All Work" + total count) using the
same heading token chosen in Pillar 2, so both browse surfaces open identically.

**F1.3 — LOW — `VideoCard.svelte` L100.** Card hierarchy is poster → title only;
no uploader/meta line is rendered though the UI-SPEC reserves a 14px meta row.
Cards read slightly flat in the dense `/work` grid where there is no rail label
context.
*Fix:* optionally render `video.uploader` or category as a `text-sm
text-neutral-500` meta line under the title on grid surfaces (gate behind a
`dense` prop so rails stay minimal).

---

### Pillar 2 — Typography (2/4)

The UI-SPEC committed to **exactly 4 sizes / 2 families / 3 weights** and the
homepage honors it. Sitewide, that contract is not enforced — this is the
lowest-scoring pillar and the biggest "many cooks" tell.

**F2.1 — HIGH — heading-scale drift across routes.** Distinct display/heading
sizes in use: `text-xl` (rail label, related, CategoryRail L139, watch L175),
`text-2xl`/`text-3xl` (work/[category] L37), `text-3xl`/`text-4xl` (watch title
L143), `text-6xl` (press L58, contact L51), plus hero `clamp(28px,5vw,48px)`.
That is at least **five** display sizes where the contract allowed two.
*Fix:* define a heading ramp in `app.css` `@theme` and map every page to it:
```css
@theme {
  --text-hero: clamp(28px, 5vw, 48px); /* hero + press/contact wordmark */
  --text-h1:   clamp(26px, 3.5vw, 36px); /* watch title, page H2 headers */
  --text-h2:   20px;                     /* rail labels, related, section heads */
  --text-meta: 14px;                     /* counts, meta, eyebrows */
}
```
Replace `text-6xl` on press/contact wordmarks with `--text-hero` (they are NOT
bigger than the home hero — restraint), `text-3xl md:text-4xl` on the watch title
with `--text-h1`, and the `/work/[category]` header with `--text-h1`. This
collapses five sizes to four and makes the wordmark read as part of one system.

**F2.2 — MED — `text-xs` reintroduced after the UI-SPEC removed it.** Footer's
header comment (L18-20) explicitly says "4 sizes total, no `text-xs`", yet
`text-xs` ships in `TopNav.svelte` L171 (desktop nav links) and
`FilterPillBar.svelte` L43 (pill labels). The smallest tier is now 12px in chrome
that the UI-SPEC reserved for the mono duration badge only.
*Fix:* lift nav links and pills to `text-sm` (14px) with `tracking-wider` to keep
them compact; reserve 12px exclusively for `font-mono` badges. This restores the
4-size ramp sitewide.

**F2.3 — LOW — letter-spacing inconsistency on wordmarks.** Contact wordmark uses
`tracking-[0.2em]` (L51, an arbitrary value), press wordmark uses `tracking-tight`
(L58), TopNav wordmark uses `tracking-widest`. Three different treatments of the
same brand name.
*Fix:* pick one wordmark spacing token (recommend `tracking-[0.18em]` promoted to
`--tracking-wordmark` in `@theme`) and apply it to all three so the identity is
consistent.

**F2.4 — LOW — `leading-snug` vs `leading-tight` vs `leading-relaxed` scattered.**
Line-heights are chosen ad hoc per page. The UI-SPEC fixed display 1.1 / body
1.4-1.5. Press wordmark `leading-tight`, watch title `leading-snug`, about body
`leading-relaxed`.
*Fix:* standardize display headings to `leading-[1.1]` and body copy to
`leading-relaxed` (1.625) or a `--leading-body: 1.5` token; remove `leading-snug`
from headings.

---

### Pillar 3 — Color / Contrast (3/4)

Token discipline on the homepage is genuinely strong (OKLCH scrims, accent
reserved to exactly three roles). The issues are off-homepage.

**F3.1 — HIGH — raw `rgba()` gradients off-token.** `/contact/+page.svelte` L43
and `/press/+page.svelte` L49 both ship:
`linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%,
rgba(0,0,0,0.55) 100%)`. This violates the project's "no raw hex/`rgb`" contract
(02-UI-SPEC Acceptance #1) and uses pure black (`#000`) rather than the canvas
token `oklch(0.16 0 0)`, so the scrim is a different black than every other dark
surface — subtly muddy where it meets `bg-neutral-950`.
*Fix:* replace both with the homepage scrim idiom in canvas-OKLCH:
```css
background: linear-gradient(
  180deg,
  oklch(0.16 0 0 / 0.6) 0%,
  transparent 28%,
  transparent 64%,
  oklch(0.16 0 0 / 0.78) 100%
);
```
Bump the bottom stop to ~0.78 (from 0.55) to guarantee the title/CTA band has
real contrast (see F6.2). Extract to a `--scrim-vertical` custom property in
`app.css` so /contact and /press share one source of truth.

**F3.2 — MED — `/press` title caption `text-neutral-300` over arbitrary poster.**
`/press/+page.svelte` L63 places the body-tier title in `neutral-300`
(`oklch(0.82 0 0)`) centered over the *transparent* middle of the gradient, i.e.
directly over uncontrolled poster pixels. Over a light frame this can drop well
below 4.5:1.
*Fix:* either move the caption into the guaranteed-dark bottom band (per F1.1
recomposition) or raise it to `text-neutral-50` and add a localized text-shadow
token (`text-shadow: 0 1px 12px oklch(0.16 0 0 / 0.8)`) for poster-independent
legibility.

**F3.3 — LOW — black letterbox vs canvas black mismatch on `/watch`.**
`watch/[id]` L80 uses `bg-black` for the player letterbox while the rest of the
app is `bg-neutral-950` (`oklch(0.16 0 0)`). A pure-black bar against the
near-black canvas is a visible seam.
*Fix:* this one is arguably intentional (true black for video), but for cohesion
consider `bg-neutral-950` for the letterbox so the player floats in the same
canvas; keep true black only inside the 16:9 box if desired.

**F3.4 — LOW — duration badge raw OKLCH literal.** `VideoCard.svelte` L141 uses
`oklch(0.16 0 0 / 0.78)` inline. It is on-token-value but a literal rather than a
`var()`. Same for the hero scrim inline style (L112).
*Fix:* promote `--scrim-strong: oklch(0.16 0 0 / 0.78)` to `@theme` and reference
it; eliminates literal drift if the canvas value ever changes.

---

### Pillar 4 — Spacing / Layout (3/4)

The homepage rail rhythm (48px hero→rail, 32px between, 64px→footer) is clean and
spec-accurate. The contained `--content-max` + `--page-gutter` system is used
consistently on rails and grids.

**F4.1 — MED — no shared section-rhythm token; vertical padding is ad hoc.**
`/about` uses `py-16 md:py-24` (L22), `/contact` `py-16 md:py-24` (L48), `/work`
grid `py-8` (L45), `/watch` below-player `py-8` (L133), `/press` `py-16 md:py-24`
(L54). Five surfaces, three different vertical scales chosen by hand.
*Fix:* add `--section-y: clamp(3rem, 6vw, 6rem)` (and a tighter `--section-y-sm`)
to `@theme` and apply `py-[var(--section-y)]` to editorial sections (/about,
/contact, /press, /watch metadata) so page-to-page vertical rhythm matches.

**F4.2 — MED — 360px mobile: `/work` grid is `grid-cols-2` with `gap-4`.**
`work/+page.svelte` L45 and `work/[category]` L47 use `grid-cols-2 gap-4
px-[var(--page-gutter)]`. At 360px with 16px gutters + 16px gap, each card is
~146px wide — title `text-base` (16px) 2-line clamp is tight and the cards feel
cramped with no breathing room.
*Fix:* keep 2-col but reduce grid `gap` to `gap-3` at base and bump to `gap-4` at
`sm`; verify the `clamp(150px,…)` card-min from rails is not fighting the grid
(grid cards should be fluid `w-full`, which they are — confirm no min-width
overflow at 360px causing horizontal scroll).

**F4.3 — LOW — related rail on `/watch` is not horizontally inset to gutter.**
`watch/[id]` L179 related track lives inside `max-w-3xl px-6` but the rail cards
(`clamp(150px,60vw,220px)`) can scroll edge-to-edge; there is no
`scroll-padding-inline` like CategoryRail has (CategoryRail L181). First/last card
snap sits flush to the column padding inconsistently with the homepage rails.
*Fix:* add `scroll-padding-inline: 1.5rem` (matching `px-6`) to the related track
inline style for snap parity with homepage rails.

**F4.4 — LOW — TopNav uses `max-w-7xl` while content uses `--content-max`
(1440px).** TopNav L162 and Footer L41 are `max-w-7xl` (80rem = 1280px) but page
content rails/grids are `max-w-[var(--content-max)]` (1440px). On wide screens the
nav/footer edges do not align with the content edges.
*Fix:* switch chrome to `max-w-[var(--content-max)]` (or move content to
`max-w-7xl`) so the left/right content boundary is a single vertical line top to
bottom.

---

### Pillar 5 — Motion / Interaction (3/4)

The rune-gating architecture is the strongest part of the codebase: a single
`motion.prefersReducedMotion` source, a global CSS backstop, `class:motion-ok`
binding, and pointer handlers that early-return under reduced motion. Hero
crossfade, card tilt, chevron fades, and play-glyph scale are all correctly
gated. This is exemplary and should not be touched.

The gap is **opportunity, not correctness**: the site has no entrance motion and
no parallax, so it appears fully static until the user hovers. The cited
references earn their cinematic feel from slow, staggered reveals on scroll and
gentle parallax — both achievable CSS-only without hurting LCP.

**F5.1 — MED — no scroll-reveal entrance motion.** Rails, the `/watch` metadata
column, the related rail, and each `/press` section all pop in fully formed.
*Fix:* add a single reusable Svelte action `reveal` backed by one shared
`IntersectionObserver`, gated on the rune:
```ts
// reveal.svelte.ts — no-op when motion.prefersReducedMotion
export function reveal(node: HTMLElement, { delay = 0 } = {}) {
  if (motion.prefersReducedMotion) { node.style.opacity = '1'; return; }
  node.style.cssText = 'opacity:0; transform:translateY(12px);' +
    `transition:opacity 500ms ${delay}ms var(--ease-cinematic), transform 500ms ${delay}ms var(--ease-cinematic);`;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { node.style.opacity='1'; node.style.transform='none'; io.disconnect(); }
  }, { rootMargin: '0px 0px -10% 0px' });
  io.observe(node);
  return { destroy: () => io.disconnect() };
}
```
Apply `use:reveal` to each `<CategoryRail>` wrapper (stagger via `delay={i*60}`),
the watch title/meta block, and press sections. Initial-viewport content reveals
immediately; this never touches the LCP hero poster (which stays eager/opaque).

**F5.2 — MED — no hero or poster parallax.** The hero and the full-bleed
poster surfaces (/press, /contact) are static. A slow CSS-only parallax adds depth
without WebGL.
*Fix:* on the hero `.slide img` and press/contact background `<img>`, add a
rune-gated `scale(1.06)` Ken-Burns over the 7s slide interval (the UI-SPEC already
sanctions this — HeroCarousel L148 spec, currently unimplemented), or a
`translateY` parallax driven by `scroll-timeline` / a throttled scroll handler
clamped to ±20px. Gate behind `.motion-ok`; under reduced motion the poster is
static. Keep transform on the poster only (not the title) so text stays crisp.

**F5.3 — LOW — `/contact` and `/press` scroll-cue / index are static and
undiscoverable.** Contact L61-63 shows a `↓` that never animates; on a full
`h-svh` splash users may not realize there is a footer below.
*Fix:* add a rune-gated 2s ease-in-out `translateY(0→6px)` bounce to the `↓`
cue (motion-gated, `@media (prefers-reduced-motion)` already zeroes it via the
global backstop).

**F5.4 — LOW — FilterPillBar active-pill change has no transition.** Pills swap
accent classes instantly on select (`FilterPillBar.svelte` L99-119). A 150ms
`background-color`/`color` transition would make filtering feel intentional.
*Fix:* add `transition: background-color 150ms, color 150ms, border-color 150ms`
to `baseChip` (covered by the reduced-motion backstop automatically).

---

### Pillar 6 — Accessibility & Responsive (3/4)

The focus system (`app.css` global double-ring `:focus-visible`, skip link,
`<main tabindex="-1">`, sr-only h1 per page, real `<a>`/`<button>` semantics,
44px dot/chevron hit-areas, reduced-motion rune + CSS backstop) is genuinely
strong and above typical bar. Remaining gaps:

**F6.1 — HIGH — MobileMenu lacks focus trap + body scroll lock.**
`MobileMenu.svelte` is `role="dialog" aria-modal="true"` (L40-43) and closes on
Escape (good), but: (a) focus is not moved into the dialog on open and not trapped
— Tab can leave the overlay and land on chrome behind it; (b) the underlying page
still scrolls behind the `fixed inset-0` overlay; (c) on close, focus is not
restored to the hamburger button.
*Fix:* on mount, move focus to the close button (or first link); add a `keydown`
Tab handler that cycles focus within `#mobile-menu`; set
`document.body.style.overflow='hidden'` on open and restore on destroy; store and
restore the trigger element's focus. This is the one true a11y defect (WCAG 2.4.3
/ 2.1.2).

**F6.2 — MED — `text-neutral-50` / CTA over uncontrolled posters can fail 4.5:1.**
`/press` network wordmark (L58) and `/contact` wordmark (L51) sit over the
*transparent* top region of the vertical gradient (F3.1) — i.e. over raw poster
pixels. `neutral-50` on a near-white frame fails contrast. The press `▷ Watch`
outline CTA (L70, `border-neutral-50 text-neutral-50`) has the same exposure.
*Fix:* tie this to the F3.1 scrim fix — strengthen top + bottom gradient stops so
wordmark and CTA always sit on a ≥0.55-alpha dark band; or add the localized
`text-shadow` token from F3.2. Verify with the darkest and lightest poster in the
set.

**F6.3 — MED — decorative wordmarks duplicate visible text the SR will read
twice-ish.** `/contact` renders a visible `<p>MICHELLE NGO` (L51) plus an sr-only
`<h1>Contact Michelle Ngo` (L55); `/press` renders visible network `<p>` wordmarks
that are real content but styled as decoration. The contact visible wordmark is
purely decorative yet is a readable `<p>` (announced), competing with the sr-only
h1.
*Fix:* on `/contact`, add `aria-hidden="true"` to the decorative visible wordmark
`<p>` (L51) since the sr-only h1 carries the accessible name — avoids the SR
announcing "MICHELLE NGO" then "Contact Michelle Ngo".

**F6.4 — MED — chrome-fade on reel routes can hide nav from sighted users
mid-scroll.** `TopNav.svelte` fades the header to `opacity-0 pointer-events-none`
while scrolling reel routes (/work, /work/[category], /press, /pbs). The comment
(L34-39) correctly avoids `display:none` for SR users, but a *sighted keyboard
user* scrolling via keyboard could lose the visible nav. Focus-within re-surfaces
it (good), but the 600ms idle + tap/hover model may feel like the nav "vanished".
*Fix:* confirm focus-within reliably wins (it reads `focusWithinChrome`, L93-104 —
looks correct). Lower-risk: ensure the fade only engages after a scroll *distance*
threshold (e.g. >120px), not immediately, so a short scroll never hides chrome.
Mostly a polish/verification item.

**F6.5 — LOW — `/press` reel is `h-svh` scroll-snap with no "scroll for more"
affordance or reduced-motion escape.** Each credit is a full `h-svh snap-start`
panel (L36). Snap-mandatory full-screen panels can trap users who can't perceive
there are more panels; the index caption (L77 `01 / NN`) helps but is
bottom-right and quiet.
*Fix:* add a first-panel `↓` cue (reusing the F5.3 component) and ensure
`snap-mandatory` degrades gracefully — consider `snap-proximity` so partial
scrolls aren't fought, improving low-vision/motor usability.

**F6.6 — LOW — related rail on `/watch` has no keyboard arrow-nav.** CategoryRail
implements full Arrow/Home/End keyboard traversal (L91-122); the `/watch` related
rail (L179-188) is a bare scroll track with no `onkeydown` handler — keyboard
users Tab card-by-card (works) but lose the arrow/Home/End parity.
*Fix:* extract CategoryRail's track + keyboard handler into a shared `<Rail>`
primitive and reuse it for the related rail (also resolves F4.3 snap-padding).
Lower priority since Tab still works.

**Responsive summary (360 / 768 / 1440):**
- **360px:** rails peek next card correctly (`clamp(150px,60vw,220px)`); `/work`
  grid 2-col is tight (F4.2); MobileMenu scroll-lock missing (F6.1). Hero
  `min-height:360px` is sound.
- **768px (tablet):** grids go 3-col, rails 200px cards, gutter 24px — clean. No
  issues found.
- **1440px (desktop):** chrome `max-w-7xl` vs content `--content-max` edge
  misalignment (F4.4); chevrons appear on hover (correct). Hero clamps to 640px —
  good.

---

## Polish Backlog (Phase 5 — prioritized)

Ordered for an executor. Items marked **[token]** are pure `app.css @theme`
additions; **[a11y]** are correctness; **[cinema]** are feel.

**P0 — correctness & contract (do first)**
1. **[a11y]** MobileMenu: add focus-trap, body scroll-lock on open, focus
   restore-to-trigger on close, initial focus to close button. *(F6.1)*
2. **[token]** Replace raw `rgba(0,0,0,…)` gradients on `/contact` L43 and
   `/press` L49 with a shared `--scrim-vertical` OKLCH token; strengthen bottom
   stop to 0.78. *(F3.1, F6.2)*
3. **[a11y]** Guarantee wordmark/CTA contrast over posters: dark gradient band +
   optional `--text-shadow-cinema` token; `aria-hidden` the decorative `/contact`
   wordmark. *(F3.2, F6.2, F6.3)*

**P1 — cross-page consistency**
4. **[token]** Add heading ramp (`--text-hero/h1/h2/meta`) to `@theme`; remap
   watch title, work/[category] header, press/contact wordmarks; collapse 5 display
   sizes → 4. *(F2.1)*
5. **[token]** Remove `text-xs` from TopNav + FilterPillBar → `text-sm`; reserve
   12px for mono badges only. *(F2.2)*
6. **[token]** Add `--section-y` rhythm token; apply to /about, /contact, /press,
   /watch metadata, and a new `/work` visible header. *(F4.1, F1.2)*
7. **[token]** Unify chrome to `--content-max` (TopNav + Footer) so content edges
   align top-to-bottom. *(F4.4)*
8. **[token]** Standardize wordmark `tracking` + heading `leading` tokens.
   *(F2.3, F2.4)*

**P2 — cinematic feel (rune-gated, LCP-safe)**
9. **[cinema]** Add shared `reveal` IntersectionObserver action (rune-gated);
   apply staggered to rails, watch metadata, press sections. *(F5.1)*
10. **[cinema]** Implement the already-spec'd hero Ken-Burns `scale(1.06→1)` over
    7s + a clamped poster parallax on /press + /contact; gated on `.motion-ok`.
    *(F5.2)*
11. **[cinema]** Animate the `↓` scroll cue (/contact, /press) + add first-panel
    cue to the press reel; consider `snap-proximity`. *(F5.3, F6.5)*
12. **[cinema]** Add 150ms color/bg transition to FilterPillBar chips. *(F5.4)*

**P3 — refinement (optional)**
13. Extract a shared `<Rail>` primitive (track + keyboard map + snap-padding);
    reuse for the `/watch` related rail. *(F4.3, F6.6)*
14. Optional VideoCard `dense` meta line for grid surfaces. *(F1.3)*
15. Recompose /press + /contact to a single bottom-anchored caption group instead
    of `justify-between` three-zone layout. *(F1.1)*
16. Verify TopNav chrome-fade engages only past a scroll-distance threshold.
    *(F6.4)*
17. Consider `bg-neutral-950` (not `bg-black`) for the /watch letterbox. *(F3.3)*

---

## Files Audited

- `src/app.css` (tokens, focus system, reduced-motion backstop)
- `src/routes/+layout.svelte` (shell, skip link, head)
- `src/routes/+page.svelte` (homepage assembly)
- `src/routes/work/+page.svelte`, `src/routes/work/[category]/+page.svelte`
- `src/routes/watch/[id]/+page.svelte`
- `src/routes/about/+page.svelte`, `src/routes/contact/+page.svelte`,
  `src/routes/press/+page.svelte`
- `src/lib/components/HeroCarousel.svelte`, `CategoryRail.svelte`,
  `VideoCard.svelte`, `TopNav.svelte`, `MobileMenu.svelte`, `Footer.svelte`,
  `ContactBlock.svelte`, `FilterPillBar.svelte`
- Baseline: `.planning/phases/02-homepage-rails/02-UI-SPEC.md`

**Screenshots:** not captured — code-only audit (no dev server probed; the target
is static-prerendered to GitHub Pages). Findings are sourced to file:line for
direct executor action.

**Registry audit:** not applicable — no `components.json` / shadcn (hand-built
Svelte components, no third-party registry).
