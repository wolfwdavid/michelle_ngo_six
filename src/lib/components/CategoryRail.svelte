<!--
  CategoryRail (HOME-02, HOME-03). The repeating unit of the
  homepage: one labeled, horizontally scroll-snapping rail of VideoCards for a
  single category. The homepage instantiates one per category via
  getCategoriesInDisplayOrder().

  WHAT THIS COMPONENT GUARANTEES (UI-SPEC § Rail Spec):
   - A category label preceded by a 3px-wide, full-height accent tick. The tick
     color comes from `categoryAccentBg(category)` — the literal SHORT-token class
     from the categoryAccent map (e.g. `bg-cat-pbs/15`). It is NEVER built from
     `categoryToSlug()` (that yields a LONGER slug like `pbs-american-portrait`
     for which no `bg-cat-*` utility exists — Tailwind would silently emit no
     background). `slug` here is used ONLY for the `id`/`aria-labelledby` string.
   - A horizontal scroll-snap track (`scroll-snap-type: x mandatory`,
     `scrollbar-hide`, `scroll-padding-inline: var(--page-gutter)`), one
     `<VideoCard>` per video from `getByCategory(category)`. `perspective: 800px`
     on the track gives child VideoCard tilt its depth.
   - Native touch/drag/wheel scroll (free from the browser) plus full keyboard
     nav: Arrow keys move card focus by one (scrolling it into view); Home/End
     jump to the first/last card. Enter/Space are the native <a> behavior inside
     VideoCard — not re-handled here.
   - Desktop-only (`≥1024px` and `hover:hover`) hover chevrons that scroll the
     track by ~one viewport (`clientWidth * 0.8`). The left chevron hides at the
     start, the right at the end, and BOTH vanish when the track does not
     overflow (few-card rails). Chevron glyphs are NEUTRAL-colored only — accent
     is reserved for the tick + the card ring.

  REDUCED MOTION: chevron scroll reads `motion.prefersReducedMotion` ONLY (the
  locked rune) to choose `smooth` vs `auto`. No component here reads the media
  query directly.
-->
<script lang="ts">
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccentBg } from '$lib/components/categoryAccent';
  import { motion } from '$lib/state/motion.svelte';
  import { getByCategory, categoryToSlug, type Category } from '$lib/data';

  let {
    category,
    eagerFirstCards = false,
  }: { category: Category; eagerFirstCards?: boolean } = $props();

  // `slug` is ONLY for the aria-labelledby / id string — NEVER a color class.
  // Derived from the `category` prop so a re-render with a new category stays
  // correct (Plan 04 renders one rail per category; the prop is effectively
  // static per instance, but $derived keeps the reactive contract honest).
  const slug = $derived(categoryToSlug(category));
  const cards = $derived(getByCategory(category));

  // The track element ref — needed for chevron scrollBy, edge computation, and
  // keyboard focus traversal across the rendered card anchors.
  let track = $state<HTMLUListElement | null>(null);

  // Extreme-hide / overflow state, recomputed on scroll + resize + first layout.
  let edges = $state({ atStart: true, atEnd: false, overflows: false });

  function updateEdges(): void {
    if (!track) return;
    const { scrollLeft, clientWidth, scrollWidth } = track;
    edges = {
      atStart: scrollLeft <= 0,
      atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
      overflows: scrollWidth > clientWidth + 1,
    };
  }

  // Recompute edges once after first layout, then keep them in sync on resize.
  // (onscroll is wired directly on the track element below.)
  $effect(() => {
    updateEdges();
    if (typeof window === 'undefined') return;
    const onResize = (): void => updateEdges();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  // Chevron action: scroll the track by ~one viewport of cards (clientWidth*0.8).
  // Smooth normally; instant under reduced motion (the locked motion rune).
  function scrollByViewport(direction: 1 | -1): void {
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: motion.prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  // Keyboard map (UI-SPEC § Rail keyboard table). When a card anchor is focused:
  //  ArrowRight/ArrowLeft -> move focus to next/prev card and scroll it into view
  //  Home/End             -> focus first/last card and scroll it into view
  // Enter/Space stay native (the <a> inside VideoCard) — not handled here.
  function onkeydown(event: KeyboardEvent): void {
    if (!track) return;
    const anchors = Array.from(
      track.querySelectorAll<HTMLAnchorElement>('a[href]'),
    );
    if (anchors.length === 0) return;
    const current = anchors.indexOf(document.activeElement as HTMLAnchorElement);

    let target: HTMLAnchorElement | undefined;
    switch (event.key) {
      case 'ArrowRight':
        if (current < 0) target = anchors[0];
        else target = anchors[Math.min(current + 1, anchors.length - 1)];
        break;
      case 'ArrowLeft':
        if (current < 0) target = anchors[0];
        else target = anchors[Math.max(current - 1, 0)];
        break;
      case 'Home':
        target = anchors[0];
        break;
      case 'End':
        target = anchors[anchors.length - 1];
        break;
      default:
        return;
    }
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
</script>

{#if cards.length > 0}
  <section
    aria-labelledby={`rail-${slug}`}
    class="category-rail mx-auto w-full max-w-[var(--content-max)] px-[var(--page-gutter)]"
  >
    <div class="mb-4 flex items-stretch gap-2">
      <span
        aria-hidden="true"
        class="block w-[3px] flex-none self-stretch rounded-full {categoryAccentBg(
          category,
        )}"
      ></span>
      <h2
        id={`rail-${slug}`}
        class="font-display text-xl font-semibold text-neutral-50"
      >
        {category}
      </h2>
    </div>

    <div class="rail-viewport relative">
      <!-- Left chevron (desktop hover-only). Hidden at the start and whenever the
           track does not overflow. -->
      <button
        type="button"
        class="rail-chevron rail-chevron-left"
        class:is-hidden={edges.atStart || !edges.overflows}
        aria-label={`Scroll ${category} left`}
        aria-hidden={edges.atStart || !edges.overflows}
        tabindex={edges.atStart || !edges.overflows ? -1 : 0}
        onclick={() => scrollByViewport(-1)}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <!-- The keydown handler is a DELEGATION: it only acts when one of the
           card anchors (natively focusable, real interactive elements) is the
           active element, moving focus between siblings. The <ul> itself is not
           a focus target, so the a11y "non-interactive element" lint is a known
           false-positive for this delegation pattern. -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <ul
        bind:this={track}
        class="rail-track scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto md:gap-4"
        style="perspective: 800px; scroll-snap-type: x mandatory; scroll-padding-inline: var(--page-gutter);"
        onscroll={updateEdges}
        {onkeydown}
      >
        {#each cards as video, i (video.id)}
          <li class="rail-card flex-none" style="scroll-snap-align: start;">
            <VideoCard {video} eager={eagerFirstCards && i < 4} />
          </li>
        {/each}
      </ul>

      <!-- Right chevron (desktop hover-only). Hidden at the end and whenever the
           track does not overflow. -->
      <button
        type="button"
        class="rail-chevron rail-chevron-right"
        class:is-hidden={edges.atEnd || !edges.overflows}
        aria-label={`Scroll ${category} right`}
        aria-hidden={edges.atEnd || !edges.overflows}
        tabindex={edges.atEnd || !edges.overflows ? -1 : 0}
        onclick={() => scrollByViewport(1)}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </section>
{/if}

<style>
  /* Fixed-per-card widths (UI-SPEC § Breakpoints): mobile clamp peeks the next
   * card, tablet 200px, desktop 220px. The rail is a horizontal track, not a
   * responsive grid. */
  .rail-card {
    width: clamp(150px, 60vw, 220px);
  }
  @media (min-width: 640px) {
    .rail-card {
      width: 200px;
    }
  }
  @media (min-width: 1024px) {
    .rail-card {
      width: 220px;
    }
  }

  /* Chevrons: 44x44 hit-area with a 40px visible neutral circle. Vertically
   * centered on the track; left/right inset 8px. Neutral-colored ONLY (accent is
   * reserved for the tick + card ring). Default hidden; revealed on rail
   * hover/focus-within, desktop-only (>=1024px AND a real hover pointer). */
  .rail-chevron {
    position: absolute;
    top: 50%;
    z-index: 2;
    display: none;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    border-radius: 9999px;
    color: var(--color-neutral-50);
    opacity: 0;
    transition: opacity 150ms var(--ease-cinematic);
  }
  .rail-chevron::before {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background-color: oklch(0.3 0 0 / 0.8); /* --color-neutral-800 @ 0.8 alpha */
    backdrop-filter: blur(4px);
    z-index: -1;
  }
  .rail-chevron-left {
    inset-inline-start: 8px;
  }
  .rail-chevron-right {
    inset-inline-end: 8px;
  }

  /* Desktop + real-hover devices only: render the chevrons and reveal them on
   * rail hover or keyboard focus within the rail. */
  @media (min-width: 1024px) and (hover: hover) {
    .rail-chevron {
      display: inline-flex;
    }
    .rail-viewport:hover .rail-chevron,
    .rail-viewport:focus-within .rail-chevron {
      opacity: 1;
    }
  }

  /* Extreme-hide / no-overflow: the chevron is non-interactive and invisible. */
  .rail-chevron.is-hidden {
    opacity: 0 !important;
    pointer-events: none;
  }
</style>
