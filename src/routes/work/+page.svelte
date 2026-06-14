<!--
  /work — the browse index (BRW-01, BRW-03).

  A single prerendered page: the FilterPillBar (All + 8 categories in display
  order) above a responsive grid of every video as a VideoCard. Selecting a pill
  sets `selected` and the grid re-derives client-side — no navigation, no page
  load. The All pill restores the full grid. The active pill is accent-colored by
  the FilterPillBar itself.

  Single top-level heading: VideoCard titles are leaf text and the pill bar is a
  <nav>, so the page would otherwise have no level-one heading. We add one
  visually-hidden (sr-only) <h1> for the document outline / screen readers,
  mirroring the homepage convention. The page content is wrapped in a <div> — the
  layout already supplies the single <main id="main"> landmark.
-->
<script lang="ts">
  import VideoCard from '$lib/components/VideoCard.svelte';
  import FilterPillBar from '$lib/components/FilterPillBar.svelte';
  import { categoryToSlug } from '$lib/data';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // 'all' or a category slug. Drives the client-side grid filter.
  let selected = $state('all');

  const filtered = $derived(
    selected === 'all'
      ? data.videos
      : data.videos.filter((video) => categoryToSlug(video.category) === selected),
  );
</script>

<svelte:head>
  <title>Work — Michelle Ngo</title>
  <meta name="description" content="Browse Michelle Ngo's filmography by category." />
</svelte:head>

<div class="bg-neutral-950">
  <h1 class="sr-only">Work — Filmography</h1>

  <FilterPillBar active={selected} onselect={(slug) => (selected = slug)} />

  <ul
    class="mx-auto grid max-w-[var(--content-max)] grid-cols-2 gap-4 px-[var(--page-gutter)] py-8 sm:grid-cols-3 lg:grid-cols-4"
  >
    {#each filtered as video (video.id)}
      <li>
        <VideoCard {video} />
      </li>
    {/each}
  </ul>
</div>
