<!--
  /work/[category] — per-category browse page (BRW-02).

  Lists every video in one category as a responsive VideoCard grid, mirroring
  the /work index grid for visual consistency. The FilterPillBar mounts in LINK
  mode (the filter callback is omitted) so each pill is an <a> and the current
  category's pill is active — visitors switch categories via full navigation.

  A visible header shows the category title + count; an sr-only <h1> supplies the
  document's single top-level heading (VideoCard titles are leaf text). Content is
  wrapped in a <div> — the layout owns the single <main id="main"> landmark.
-->
<script lang="ts">
  import VideoCard from '$lib/components/VideoCard.svelte';
  import FilterPillBar from '$lib/components/FilterPillBar.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.category} — Michelle Ngo</title>
  <meta
    name="description"
    content={`${data.videos.length} videos by Michelle Ngo in ${data.category}.`}
  />
</svelte:head>

<div class="bg-neutral-950">
  <h1 class="sr-only">{data.category} — Filmography</h1>

  <FilterPillBar active={data.slug} />

  <header
    class="mx-auto max-w-[var(--content-max)] px-[var(--page-gutter)] pt-[var(--section-y-sm)]"
  >
    <h2 class="font-display text-[length:var(--text-h1)] tracking-tight text-neutral-50">
      {data.category}
    </h2>
    <p class="mt-1 text-sm text-neutral-400">
      {data.videos.length}
      {data.videos.length === 1 ? 'video' : 'videos'}
    </p>
  </header>

  <ul
    class="mx-auto grid max-w-[var(--content-max)] grid-cols-2 gap-4 px-[var(--page-gutter)] py-8 sm:grid-cols-3 lg:grid-cols-4"
  >
    {#each data.videos as video (video.id)}
      <li>
        <VideoCard {video} />
      </li>
    {/each}
  </ul>
</div>
