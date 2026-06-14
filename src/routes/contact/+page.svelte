<!--
  /contact — contact splash.

  The producer-reel poster fills the splash as a static background (no iframe).
  Composition: MICHELLE NGO wordmark top, the shared ContactBlock centered, and
  a ↓ scroll-cue at the bottom inviting a scroll to the site-wide Footer below.

  Renders a <section> inside the layout's <main> (not a nested main). The
  sr-only h1 carries the semantic landmark heading; the visible "MICHELLE NGO"
  is decorative.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import { producerReelId, getById } from '$lib/data';
  import { getPosterFor } from '$lib/data/posters';
  import ContactBlock from '$lib/components/ContactBlock.svelte';

  const producerReel = getById(producerReelId);
  if (!producerReel) throw new Error('/contact: producer reel video missing from $lib/data');
  const heroPosterUrl = `${base}${getPosterFor(producerReel)}`;
</script>

<svelte:head>
  <title>Contact — Michelle Ngo</title>
  <meta
    name="description"
    content="Get in touch with Michelle Ngo — email, phone, IMDb, LinkedIn, Vimeo."
  />
</svelte:head>

<section class="relative h-svh w-full overflow-hidden bg-neutral-950">
  <!-- Layer 1: poster background (static, no iframe) -->
  <img
    src={heroPosterUrl}
    alt=""
    loading="eager"
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover"
  />
  <!-- Layer 2: two-stop gradient overlay -->
  <div
    class="pointer-events-none absolute inset-0"
    style="background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.55) 100%);"
    aria-hidden="true"
  ></div>
  <!-- Layer 3: composition — wordmark upper-third + ContactBlock center + scroll-cue bottom -->
  <div
    class="relative z-10 flex h-full flex-col items-center justify-between px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8"
  >
    <!-- Upper-third: MICHELLE NGO display wordmark -->
    <p class="font-display text-6xl font-semibold leading-tight tracking-[0.2em] text-neutral-50">
      MICHELLE NGO
    </p>
    <!-- sr-only landmark heading -->
    <h1 class="sr-only">Contact Michelle Ngo</h1>
    <!-- Center: ContactBlock as a 5-row vertical list -->
    <div>
      <ContactBlock />
    </div>
    <!-- Bottom: scroll-cue inviting the Footer reveal -->
    <div class="text-neutral-50/60" aria-hidden="true">
      <span class="text-2xl">↓</span>
    </div>
  </div>
</section>
