<!--
  /watch/[id] — the watch experience (WCH-01..04).

  A cinematic, poster-first player on the dark app shell. The embed iframe is
  click-to-load: on first paint only the poster + a play overlay render, so no
  third-party iframe ships in the prerendered HTML (protects LCP / privacy).
  Clicking play mounts a responsive 16:9 iframe pointed at the right host for the
  video's source (vimeo → player.vimeo.com, youtube → youtube-nocookie.com).

  Below the player, in normal flow: a back-to-work link, the title, a category
  pill linking to that category's /work/[category] page, uploader · year, an
  optional description, and a "Related work" rail of same-category videos with
  the current video excluded.

  REDUCED MOTION: the play overlay's hover scale is gated by the single
  `motion.prefersReducedMotion` rune via `class:motion-ok` — never a Tailwind
  media-query motion variant nor a direct media-query read.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import {
    categoryAccent,
    categoryAccentBg,
    categoryAccentRing,
  } from '$lib/components/categoryAccent';
  import { motion } from '$lib/state/motion.svelte';
  import { getPosterFor } from '$lib/data/posters';
  import { categoryToSlug, getByCategory, videos, type Video } from '$lib/data';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const video = $derived(data.video);
  const year = $derived(video.published.slice(0, 4));
  const categorySlug = $derived(categoryToSlug(video.category));
  const posterUrl = $derived(`${base}${getPosterFor(video)}`);

  // Click-to-load state. Starts false so the prerendered HTML carries only the
  // poster button — the embed iframe is mounted only after a real user click.
  let playing = $state(false);

  // Embed URL chosen by source. Built inline (no shared adapter in this repo):
  //   vimeo   → player.vimeo.com privacy-DNT player
  //   youtube → youtube-nocookie.com (cookieless) embed
  // autoplay=1 is safe here because the iframe only exists post-click.
  const embedUrl = $derived(
    video.source === 'vimeo'
      ? `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1&playsinline=1`
      : `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&modestbranding=1&playsinline=1&rel=0`,
  );

  // Related work: same-category siblings minus the current video. When the
  // category is sparse (< 4 siblings) top up with videos from other categories
  // so the rail never looks broken, de-duplicated and capped at 12.
  const related = $derived.by((): readonly Video[] => {
    const sameCategory = getByCategory(video.category).filter(
      (v) => v.id !== video.id,
    );
    if (sameCategory.length >= 4) return sameCategory.slice(0, 12);
    const seen = new Set(sameCategory.map((v) => v.id));
    const topUp = videos.filter(
      (v) =>
        v.id !== video.id && v.category !== video.category && !seen.has(v.id),
    );
    return [...sameCategory, ...topUp].slice(0, 12);
  });
</script>

<svelte:head>
  <title>{video.title} — Michelle Ngo</title>
  <meta
    name="description"
    content={video.description?.slice(0, 150) ?? `${video.title} — by Michelle Ngo`}
  />
</svelte:head>

<article aria-label={video.title} class="bg-neutral-950">
  <!-- Player canvas: black letterbox centering a responsive 16:9 box. -->
  <div class="flex w-full justify-center bg-black">
    <div class="aspect-video w-full max-w-[var(--content-max)]">
      {#if playing}
        <iframe
          src={embedUrl}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          loading="lazy"
          class="h-full w-full border-0"
        ></iframe>
      {:else}
        <button
          type="button"
          onclick={() => (playing = true)}
          aria-label={`Play ${video.title}`}
          class="play-cover group relative block h-full w-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-50 focus-visible:ring-inset"
          class:motion-ok={!motion.prefersReducedMotion}
        >
          <img
            src={posterUrl}
            alt={video.title}
            loading="eager"
            decoding="async"
            class="h-full w-full object-cover"
          />
          <!-- Dim scrim so the play glyph reads on bright posters. -->
          <span
            aria-hidden="true"
            class="absolute inset-0 bg-black/25 transition-colors duration-200 group-hover:bg-black/15"
          ></span>
          <!-- Centered circular play glyph (SVG triangle). -->
          <span
            aria-hidden="true"
            class="play-glyph absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/70 ring-1 ring-white/30 backdrop-blur sm:h-20 sm:w-20"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="currentColor"
              class="ml-1 text-neutral-50"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      {/if}
    </div>
  </div>

  <!-- Below-player chrome — normal flow, contained column. -->
  <div class="mx-auto max-w-3xl px-6 py-8">
    <a
      href={`${base}/work`}
      data-sveltekit-preload-data="hover"
      class="inline-flex items-center gap-1 rounded font-sans text-sm text-neutral-300 underline-offset-4 hover:text-neutral-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-50"
    >
      ← Back to work
    </a>

    <h1
      class="mt-4 font-display text-3xl leading-snug font-semibold text-neutral-50 md:text-4xl"
    >
      {video.title}
    </h1>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <a
        href={`${base}/work/${categorySlug}`}
        data-sveltekit-preload-data="hover"
        class="inline-flex items-center rounded-full px-3 py-1 font-sans text-sm font-medium ring-1 {categoryAccent(
          video.category,
        )} {categoryAccentBg(video.category)} {categoryAccentRing(
          video.category,
        )} focus-visible:outline-none focus-visible:ring-2"
      >
        {video.category}
      </a>
      <p class="font-sans text-base text-neutral-300">{video.uploader} · {year}</p>
    </div>

    {#if video.description}
      <p
        class="mt-6 font-sans text-base leading-relaxed whitespace-pre-line text-neutral-300"
      >
        {video.description}
      </p>
    {/if}

    {#if related.length > 0}
      <section aria-labelledby="related-heading" class="mt-12">
        <h2
          id="related-heading"
          class="mb-4 font-display text-xl font-semibold text-neutral-50"
        >
          Related work
        </h2>
        <ul
          class="related-track scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto md:gap-4"
          style="perspective: 800px; scroll-snap-type: x mandatory;"
        >
          {#each related as relatedVideo (relatedVideo.id)}
            <li class="related-card flex-none" style="scroll-snap-align: start;">
              <VideoCard video={relatedVideo} />
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
</article>

<style>
  /* Reduced motion keeps the play glyph static; full motion gives it a small
   * cue on hover. Gated by the `motion-ok` class bound to the motion rune. */
  .play-cover .play-glyph {
    transition: transform 200ms var(--ease-cinematic);
  }
  .play-cover.motion-ok:hover .play-glyph,
  .play-cover.motion-ok:focus-visible .play-glyph {
    transform: translate(-50%, -50%) scale(1.08);
  }

  /* Mirror the homepage rail card widths so related cards peek the next item. */
  .related-card {
    width: clamp(150px, 60vw, 220px);
  }
  @media (min-width: 640px) {
    .related-card {
      width: 200px;
    }
  }
  @media (min-width: 1024px) {
    .related-card {
      width: 220px;
    }
  }
</style>
