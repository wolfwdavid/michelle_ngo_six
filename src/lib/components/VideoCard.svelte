<!--
  VideoCard — Phase 2 Plan 02-01 (HOME-03). The leaf primitive every homepage
  rail renders. A real <a> link to /watch/{id} with CSS-only cinematic depth:
  cursor-tilt (clamped ±6deg), 1.03 scale, lift shadow, category-accent ring,
  poster brighten, and a title fade-up — all gated on the single
  `motion.prefersReducedMotion` rune (UI-SPEC § VideoCard Spec exact values).

  REDUCED-MOTION MECHANISM (single source of truth):
    The component reads `motion.prefersReducedMotion` ONLY — it never queries the
    media query directly and never uses a Tailwind media-query motion variant,
    both of which would bypass the locked motion rune. Instead we bind a
    `class:motion-ok={!motion.prefersReducedMotion}` onto the root and scope the
    tilt/scale transform rule under `.video-card.motion-ok:hover/:focus-visible`.
    When the rune reports reduced motion the class is absent, so the scale/tilt
    rule never applies and the pointermove handler early-returns (tilt vars stay
    0deg) — leaving only brighten + accent ring + lift shadow + instant title
    color, exactly as the UI-SPEC reduced-motion branch requires.

  ACCENT RING: applied via the literal class from `categoryAccentRing(category)`
  (e.g. `ring-cat-pbs/40`) so Tailwind's scanner sees a literal and generates
  the utility. Ring/offset utilities sit on the root; CSS reveals them on
  hover/focus-visible together with the shadow + brighten.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import { getPosterFor } from '$lib/data/posters';
  import { categoryAccentRing } from '$lib/components/categoryAccent';
  import { motion } from '$lib/state/motion.svelte';
  import type { Video } from '$lib/data';

  let { video, eager = false }: { video: Video; eager?: boolean } = $props();

  // Cursor-tilt state — written to the root as --tilt-x / --tilt-y CSS custom
  // props. Default 0deg; updated by onpointermove (full motion only).
  let tiltX = $state('0deg');
  let tiltY = $state('0deg');

  const TILT_MAX = 6; // degrees — UI-SPEC clamp ±6deg

  function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  // Map pointer offset from card center to a rotation, clamped to ±6deg.
  // Vertical offset drives rotateX (negated so the top tilts toward the cursor);
  // horizontal offset drives rotateY.
  function onpointermove(event: PointerEvent): void {
    if (motion.prefersReducedMotion) return; // reduced motion: never tilt
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height; // 0..1
    const rotY = clamp((px - 0.5) * 2 * TILT_MAX, -TILT_MAX, TILT_MAX);
    const rotX = clamp((0.5 - py) * 2 * TILT_MAX, -TILT_MAX, TILT_MAX);
    tiltX = `${rotX}deg`;
    tiltY = `${rotY}deg`;
  }

  function resetTilt(): void {
    tiltX = '0deg';
    tiltY = '0deg';
  }

  // Duration badge: seconds -> "m:ss" (e.g. 95 -> "1:35").
  function formatDuration(total: number): string {
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

<a
  href={`${base}/watch/${video.id}`}
  aria-label={`Watch ${video.title}`}
  data-sveltekit-preload-data="hover"
  class="video-card group block focus-visible:outline-none {categoryAccentRing(
    video.category,
  )} ring-offset-2 ring-offset-neutral-950 hover:ring-2 focus-visible:ring-2"
  class:motion-ok={!motion.prefersReducedMotion}
  style:--tilt-x={tiltX}
  style:--tilt-y={tiltY}
  {onpointermove}
  onpointerleave={resetTilt}
  onblur={resetTilt}
>
  <div class="poster relative aspect-[16/9] overflow-hidden rounded-xl bg-neutral-900">
    <img
      src={`${base}${getPosterFor(video)}`}
      alt={video.title}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      class="poster-img h-full w-full object-cover"
    />

    {#if video.duration_seconds}
      <span class="duration-badge font-mono">{formatDuration(video.duration_seconds)}</span>
    {/if}
  </div>

  <span class="card-title mt-2 line-clamp-2 block text-base font-medium">{video.title}</span>
</a>

<style>
  /* Rest state — UI-SPEC § VideoCard Spec. Subtle drop shadow, no ring,
   * title sits at neutral-300 and 4px down (fades up on hover/focus). */
  .video-card {
    transform: none;
    box-shadow: 0 1px 2px oklch(0.16 0 0 / 0.4);
    transition:
      transform 180ms var(--ease-cinematic),
      box-shadow 180ms,
      filter 180ms;
  }

  .poster {
    transform-style: preserve-3d;
  }

  .poster-img {
    transition: filter 180ms var(--ease-cinematic);
  }

  .card-title {
    color: var(--color-neutral-300);
    transform: translateY(4px);
    opacity: 0.85;
    transition:
      color 180ms var(--ease-cinematic),
      transform 180ms var(--ease-cinematic),
      opacity 180ms var(--ease-cinematic);
  }

  /* Duration badge — bottom-right, 4px inset, mono 12px, neutral-50 on a dark
   * translucent pill. */
  .duration-badge {
    position: absolute;
    right: 4px;
    bottom: 4px;
    padding: 0.0625rem 0.25rem;
    border-radius: 4px;
    background-color: oklch(0.16 0 0 / 0.78);
    color: var(--color-neutral-50);
    font-size: 12px;
    line-height: 1;
  }

  /* Hover / focus-visible — shared visuals that apply under BOTH full motion and
   * reduced motion: lift shadow + brighten + title fade-up. The tilt/scale
   * transform is NOT here — it lives in the .motion-ok rule below so reduced
   * motion never scales or tilts. */
  .video-card:hover,
  .video-card:focus-visible {
    box-shadow:
      0 12px 28px -8px oklch(0.16 0 0 / 0.7),
      0 2px 6px oklch(0.16 0 0 / 0.5);
  }

  .video-card:hover .poster-img,
  .video-card:focus-visible .poster-img {
    /* reduced-motion variant brightens slightly more (1.08 vs 1.06) */
    filter: brightness(1.08);
  }

  .video-card:hover .card-title,
  .video-card:focus-visible .card-title {
    color: var(--color-neutral-50);
    transform: translateY(0);
    opacity: 1;
  }

  /* Full-motion ONLY: cursor-tilt + scale. Gated by the `motion-ok` class which
   * is bound to `!motion.prefersReducedMotion`. Under reduced motion the class
   * is absent → this rule never matches → transform stays `none` (rest), so the
   * card neither tilts nor scales. The tilt vars also stay 0deg because the
   * pointermove handler early-returns under reduced motion. */
  .video-card.motion-ok:hover,
  .video-card.motion-ok:focus-visible {
    transform: perspective(800px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(1.03);
  }

  /* Full motion brightens to 1.06 per UI-SPEC (reduced motion keeps the 1.08
   * above). */
  .video-card.motion-ok:hover .poster-img,
  .video-card.motion-ok:focus-visible .poster-img {
    filter: brightness(1.06);
  }
</style>
