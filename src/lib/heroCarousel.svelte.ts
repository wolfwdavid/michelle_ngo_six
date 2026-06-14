/**
 * Hero carousel rune factory — Phase 2 Plan 02-03.
 *
 * Drives the homepage rotating-featured hero carousel: slide 0 is the producer
 * reel video, slides 1..N are full-bleed poster slides from getHeroSlides().
 * The factory owns ONLY the active-slide index + auto-advance timer; all
 * rendering/gating policy stays in the component.
 *
 * Auto-advance design:
 *   - startAuto() registers ONE setInterval(intervalMs). Each tick re-checks
 *     `!userPaused && options.isAutoAllowed()` BEFORE advancing — the
 *     component injects its $derived gate (reduced-motion / hover/focus pause)
 *     as a plain getter. Checking per-tick (rather than reactively tearing the
 *     interval down) keeps this factory free of $effect and trivially testable.
 *   - userPaused is a ONE-WAY latch: any manual call (next/prev/goTo) sets it
 *     true for the lifetime of the instance. A visitor who took control of
 *     the carousel keeps control — auto-advance never fights manual nav.
 *   - HERO_CAROUSEL_INTERVAL_MS = 7000: the UI-SPEC auto-advance cadence.
 *
 * Why a factory (not a module-scope singleton): each hero surface gets its own
 * clean instance; SPA transitions can briefly host two instances without timer
 * tangle.
 *
 * SSR-safe:
 *   - startAuto() guards `typeof window === 'undefined'` and is a no-op
 *     during prerender — activeSlide stays 0 through SSR (slide 0 = LCP).
 *   - startAuto() and dispose() are idempotent.
 *
 * Usage from HeroCarousel.svelte:
 *
 *   const carousel = createHeroCarousel({ slideCount, isAutoAllowed: () => ... });
 *   $effect(() => {
 *     carousel.startAuto();
 *     return () => carousel.dispose();
 *   });
 */

export const HERO_CAROUSEL_INTERVAL_MS = 7000;

export type HeroCarousel = {
  readonly activeSlide: number;
  readonly userPaused: boolean;
  next: () => void; // manual — latches userPaused
  prev: () => void; // manual — latches userPaused
  goTo: (i: number) => void; // manual — latches userPaused
  startAuto: () => void; // idempotent; SSR no-op
  dispose: () => void; // idempotent
};

export function createHeroCarousel(options: {
  slideCount: number;
  intervalMs?: number; // default HERO_CAROUSEL_INTERVAL_MS
  isAutoAllowed: () => boolean; // component injects its $derived gate
}): HeroCarousel {
  const { slideCount, intervalMs = HERO_CAROUSEL_INTERVAL_MS, isAutoAllowed } = options;

  // NOTE: never name a $state variable `state` — the identifier collides with
  // the rune in lexical scope.
  let _activeSlide = $state(0);
  let _userPaused = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  function latchPause(): void {
    _userPaused = true;
  }

  return {
    get activeSlide(): number {
      return _activeSlide;
    },
    get userPaused(): boolean {
      return _userPaused;
    },
    next(): void {
      latchPause();
      if (slideCount <= 1) return;
      _activeSlide = (_activeSlide + 1) % slideCount;
    },
    prev(): void {
      latchPause();
      if (slideCount <= 1) return;
      _activeSlide = (_activeSlide - 1 + slideCount) % slideCount;
    },
    goTo(i: number): void {
      latchPause();
      // Ignore out-of-range / non-integer targets (defensive — dot buttons
      // only ever pass valid indices).
      if (!Number.isInteger(i) || i < 0 || i >= slideCount) return;
      _activeSlide = i;
    },
    startAuto(): void {
      if (disposed || intervalId !== null) return;
      // SSR guard — prerender has no window; activeSlide stays 0.
      if (typeof window === 'undefined') return;
      if (slideCount <= 1) return; // nothing to advance through
      intervalId = setInterval(() => {
        // Per-tick gate: manual latch + the component's injected $derived
        // (reduced-motion / hover or focus pause).
        if (_userPaused || !isAutoAllowed()) return;
        _activeSlide = (_activeSlide + 1) % slideCount;
      }, intervalMs);
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
