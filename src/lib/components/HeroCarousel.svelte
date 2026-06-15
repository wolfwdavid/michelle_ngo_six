<!--
  HeroCarousel — Phase 2 Plan 02-03. HOME-01 (cinematic featured hero) +
  hero half of HOME-05 (reduced-motion).

  Rotating-featured variant: poster + category eyebrow + title slides. Slide 0
  is the producer reel video; slides 1..N are one representative non-reel video
  per category (getHeroSlides()). EACH slide is a poster-only <a> to that
  video's /watch/{id} — NO autoplaying embed (LCP protection, CONTEXT lock).

  Auto-advance: createHeroCarousel drives a 7000ms timer; slides crossfade by
  opacity over 600ms. The active slide's poster is the ONLY eager + high-priority
  image (LCP); all others are lazy. Auto-advance pauses while the pointer/focus
  is inside the hero and resumes on leave (the `hovered` flag feeds isAutoAllowed).

  Reduced motion: the single-source `motion` rune gates BOTH paths —
    1. auto-advance: isAutoAllowed() returns false (never advances).
    2. crossfade: the `motion-ok` class (bound to !motion.prefersReducedMotion)
       is the ONLY selector that enables the opacity transition in <style>;
       reduced-motion users get instant, transition-free dot swaps.
  Dots remain fully functional for manual navigation under reduced motion.
  The motion branch reads the rune only (no media-query API call), uses a
  rune-bound class (no Tailwind motion-prefixed variants), and renders no
  video embed or 3D surface.
-->
<script lang="ts">
  // svelte/no-navigation-without-resolve is handled at the eslint config level
  // (same pattern as the rest of the homepage components).
  import { base } from '$app/paths';
  import { producerReelId, getById } from '$lib/data';
  import { getPosterFor } from '$lib/data/posters';
  import { getHeroSlides } from '$lib/data/heroSlides';
  import { motion } from '$lib/state/motion.svelte';
  import { createHeroCarousel } from '$lib/heroCarousel.svelte';
  import { categoryAccent } from './categoryAccent';

  // Slide 0 is always the producer reel; getHeroSlides() already excludes the
  // reel, so [reel, ...getHeroSlides()] needs no dedup. Guard on missing reel
  // (mirrors HeroAmbient) — a degenerate data set is a build-time error.
  const reel = getById(producerReelId);
  if (!reel) {
    throw new Error(
      `HeroCarousel: producer reel video (id=${producerReelId}) missing from $lib/data`
    );
  }

  const slides = [reel, ...getHeroSlides()];
  const slideCount = slides.length;

  // Pause flag: pointerenter/focusin set true, pointerleave/focusout clear it.
  // Fed into isAutoAllowed so auto-advance halts while the visitor is engaged
  // and resumes on leave (unless they manually navigated — that latches
  // userPaused inside the factory).
  let hovered = $state(false);

  const carousel = createHeroCarousel({
    slideCount,
    isAutoAllowed: () => !motion.prefersReducedMotion && !hovered,
  });

  $effect(() => {
    carousel.startAuto();
    return () => carousel.dispose();
  });
</script>

{#if slideCount > 0}
  <section
    aria-label="Featured work"
    class="hero"
    onpointerenter={() => (hovered = true)}
    onpointerleave={() => (hovered = false)}
    onfocusin={() => (hovered = true)}
    onfocusout={() => (hovered = false)}
  >
    <!-- Slide stack: one absolutely-positioned layer per slide, crossfaded by
         opacity. The `motion-ok` class is bound to the live motion rune and is
         the ONLY thing that enables the 600ms transition (see <style>). -->
    {#each slides as slide, i (slide.id)}
      <div
        class="slide {carousel.activeSlide === i ? 'is-active' : 'is-inactive'}"
        class:motion-ok={!motion.prefersReducedMotion}
      >
        <!-- Poster: exactly one eager + fetchpriority="high" (the active slide,
             the LCP element); every other poster is lazy with no priority.
             Split into two branches so the active <img> carries the LITERAL
             fetchpriority="high" / loading="eager" attributes (a conditional
             `fetchpriority={...}` would never emit the literal string and would
             not express the LCP hint as plainly). Exactly one branch renders
             per slide, so only one poster is ever eager/high at a time. -->
        {#if i === carousel.activeSlide}
          <img
            src={`${base}${getPosterFor(slide)}`}
            alt={slide.title}
            class="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        {:else}
          <img
            src={`${base}${getPosterFor(slide)}`}
            alt={slide.title}
            class="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        {/if}

        <!-- Bottom scrim: guarantees >=4.5:1 title contrast over any poster. -->
        <div
          class="pointer-events-none absolute inset-0"
          style="background: linear-gradient(to top, oklch(0.16 0 0 / 0.92) 0%, oklch(0.16 0 0 / 0.55) 28%, transparent 60%);"
          aria-hidden="true"
        ></div>

        <!-- Content: the whole slide is one /watch/{id} link. Inactive slides
             get pointer-events-none so only the visible slide captures clicks. -->
        <a
          href={`${base}/watch/${slide.id}`}
          aria-label={`Watch ${slide.title}`}
          data-sveltekit-preload-data="hover"
          class="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 md:p-8 {carousel.activeSlide ===
          i
            ? 'pointer-events-auto'
            : 'pointer-events-none'}"
        >
          <span class="hero-eyebrow {categoryAccent(slide.category)}">
            {slide.category.toUpperCase()}
          </span>
          <h2 class="hero-title font-display text-neutral-50">
            {slide.title}
          </h2>
        </a>
      </div>
    {/each}

    <!-- Dots: bottom-center, one neutral pill/circle per slide. 44px hit-area;
         visual glyph is smaller. NEVER accent-colored (neutral wayfinding). -->
    <div class="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1">
      {#each slides as slide, i (slide.id)}
        <button
          type="button"
          class="dot-btn"
          aria-label={`Go to slide ${i + 1}: ${slide.title}`}
          aria-current={carousel.activeSlide === i ? 'true' : undefined}
          onclick={() => carousel.goTo(i)}
        >
          <span
            class="dot-glyph {carousel.activeSlide === i ? 'is-active' : ''}"
            aria-hidden="true"
          ></span>
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  .hero {
    position: relative;
    overflow: hidden;
    width: 100%;
    /* Full-bleed, edge-to-edge — no page gutter (UI-SPEC Layout). */
    height: 56vh;
    min-height: 360px;
    background: var(--color-neutral-950);
  }

  @media (min-width: 640px) {
    .hero {
      height: 60vh;
    }
  }

  @media (min-width: 1024px) {
    .hero {
      height: clamp(440px, 64vh, 640px);
    }
  }

  .slide {
    position: absolute;
    inset: 0;
  }

  /* Reduced-motion (no .motion-ok): swaps are instant — no transition. */
  .slide.is-inactive {
    opacity: 0;
    pointer-events: none;
  }

  .slide.is-active {
    opacity: 1;
  }

  /* Crossfade enabled ONLY when the rune says motion is OK. This is the single
     gating mechanism — a rune-bound class, not a Tailwind motion-prefixed
     variant (which reads the media query directly and would bypass the locked
     single-source motion rune). */
  .slide.motion-ok {
    transition: opacity 600ms var(--ease-cinematic);
  }

  /* Ken-Burns: a slow scale on the ACTIVE poster while motion is allowed. This
     animates transform ONLY — the poster (the eager LCP element) is always
     opacity:1 and present at first paint; it never starts hidden. Under
     reduced motion (no .motion-ok) the poster is static at scale 1, and the
     global app.css reduced-motion backstop also near-zeros any duration. */
  @keyframes ken-burns {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.06);
    }
  }

  .slide.motion-ok.is-active img {
    animation: ken-burns 7000ms var(--ease-cinematic) forwards;
    transform-origin: center;
    will-change: transform;
  }

  .hero-eyebrow {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.08em;
    line-height: 1.5;
  }

  .hero-title {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 700;
    line-height: 1.1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 44px keyboard/touch hit-area; visual glyph is smaller. */
  .dot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 44px;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .dot-glyph {
    height: 8px;
    width: 8px;
    border-radius: 9999px;
    background: var(--color-neutral-500);
    transition: width 200ms var(--ease-cinematic), background-color 200ms var(--ease-cinematic);
  }

  .dot-glyph.is-active {
    width: 24px;
    background: var(--color-neutral-50);
  }

  /* Reduced-motion backstop: the global app.css rule already zeroes transition
     durations under prefers-reduced-motion; this component adds no animation
     that escapes that net. */
</style>
