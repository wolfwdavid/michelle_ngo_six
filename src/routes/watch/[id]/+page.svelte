<!--
  /watch/[id] placeholder — Phase 2 Plan 02-04 (HOME-04).

  A MINIMAL stub on the dark app shell so card/hero links resolve for live
  visitors between phases. Phase 3 (WCH-01) REPLACES this file with the full
  player (embedded video + metadata + related rail) while keeping the sibling
  +page.ts entries(). Deliberately no embedded player / WebGL surface here.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div
  class="flex min-h-svh flex-col items-center justify-center bg-neutral-950 px-6 text-center"
>
  <p class="font-sans text-sm tracking-wide text-neutral-300">
    {data.video.category}
  </p>
  <h1 class="mt-2 font-display text-3xl font-semibold text-neutral-50 sm:text-5xl">
    {data.video.title}
  </h1>
  <p class="mt-4 font-sans text-base text-neutral-500">Full player coming soon.</p>
  <a
    href={`${base}/`}
    class="mt-8 font-sans text-sm text-neutral-300 underline-offset-4 hover:text-neutral-50 hover:underline"
  >
    ← Back to home
  </a>
</div>
