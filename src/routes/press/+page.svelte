<!--
  /press — broadcast credits page.

  Each section's background is the poster of that credit's video (no iframes).
  Network identity is a text wordmark. Vertical composition: network wordmark
  top, title caption center, ▷ Watch CTA bottom. One scroll-snap section per
  credit.
-->
<script lang="ts">
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import { getPosterFor } from '$lib/data/posters';
  import { reveal } from '$lib/actions/reveal.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Press — Michelle Ngo</title>
  <meta
    name="description"
    content="Broadcast credits across HBO Max, HBO, PBS, ABC News, Amazon News, and more."
  />
</svelte:head>

<h1 class="sr-only">Press</h1>

<div
  role="region"
  aria-label="Press credits reel"
  class="h-svh w-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain touch-pan-y bg-neutral-950"
>
  {#each data.credits as credit, i (credit.video.id)}
    {@const posterUrl = `${base}${getPosterFor(credit.video)}`}
    <article
      aria-label={`Press credit: ${credit.video.title} on ${credit.network}`}
      class="snap-start relative h-svh w-full overflow-hidden"
    >
      <!-- Layer 1: poster background (static, no iframe) -->
      <img
        src={posterUrl}
        alt=""
        loading={i < 2 ? 'eager' : 'lazy'}
        fetchpriority={i === 0 ? 'high' : 'auto'}
        class="absolute inset-0 h-full w-full object-cover"
      />
      <!-- Layer 2: vertical scrim overlay (shared OKLCH token; also the parallax/reveal target for a later motion pass) -->
      <div
        class="pointer-events-none absolute inset-0"
        style="background: var(--scrim-vertical);"
        aria-hidden="true"
      ></div>
      <!-- Layer 3: vertical composition — wordmark top / title center / CTA bottom -->
      <div
        use:reveal
        class="relative z-10 flex h-full flex-col items-center justify-between px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center"
      >
        <!-- Top: network wordmark -->
        <p
          class="font-display text-[length:var(--text-hero)] font-semibold leading-[1.1] tracking-[var(--tracking-wordmark)] text-neutral-50"
          style="text-shadow: var(--text-shadow-cinema);"
        >
          {credit.network}
        </p>
        <!-- Center: video title caption (raised to neutral-50 + cinema shadow for legibility over the transparent gradient middle) -->
        <p
          class="max-w-xl font-sans text-base font-normal leading-snug text-neutral-50"
          style="text-shadow: var(--text-shadow-cinema);"
        >
          {credit.video.title}
        </p>
        <!-- Bottom: ▷ Watch pill CTA -->
        <a
          href={`${base}/watch/${credit.video.id}`}
          data-sveltekit-preload-data="hover"
          class="inline-flex items-center gap-2 rounded-full border border-neutral-50 px-6 py-3 font-sans text-sm font-semibold tracking-widest uppercase text-neutral-50 hover:bg-neutral-50 hover:text-neutral-950"
        >
          ▷ Watch
        </a>
      </div>
      <!-- Bottom-right index / total caption -->
      <p
        class="pointer-events-none absolute bottom-6 right-6 z-10 font-mono text-sm tracking-wider text-neutral-50/80"
      >
        {String(i + 1).padStart(2, '0')} / {String(data.credits.length).padStart(2, '0')}
      </p>
    </article>
  {/each}
</div>
