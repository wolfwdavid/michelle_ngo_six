<!--
  App shell layout.

  Mounts (in DOM order):
    1. Skip-to-content link (sr-only, visible on focus) — WCAG 2.4.1
    2. <TopNav /> — sticky chrome layer (chrome-fade on reel routes)
    3. <main id="main" tabindex="-1"> wrapping {@render children()} — the
       skip-target; every route renders INSIDE this <main>.
    4. <Footer /> — site-wide contact + directory chrome (CONT-03)

  The module-scope state runes are hydrated once here in onMount. All three
  init helpers are SSR-safe (typeof window / typeof document guarded) and
  idempotent so HMR re-mounts can't double-bind the matchMedia /
  navigator.connection / visibilitychange listeners.
-->
<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { initMotionState } from '$lib/state/motion.svelte';
  import { initNetworkState } from '$lib/state/network.svelte';
  import { initVisibilityListener } from '$lib/state/visibility.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();

  onMount(() => {
    initMotionState();
    initNetworkState();
    initVisibilityListener();
  });
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>

  <!-- Favicon set (multi-size: browser tabs + iOS + Android home-screen) -->
  <link rel="icon" type="image/x-icon" href="{base}/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="{base}/favicon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="{base}/favicon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />

  <!-- Sitewide OG + Twitter card (summary_large_image, 1200x630). Per-route
       <title>/<meta description> overrides stay in each +page.svelte. -->
  <meta property="og:site_name" content="Michelle Ngo" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://michellengo.net{base}/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Michelle Ngo — Filmmaker & Producer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://michellengo.net{base}/og-image.jpg" />
</svelte:head>

<!-- WCAG 2.4.1 — skip-to-content link. sr-only by default; the
     focus:not-sr-only utility surfaces it as a positioned banner when
     keyboard-focused. Lands focus on <main id="main"> via its href fragment;
     <main tabindex="-1"> makes <main> programmatically focusable so the
     navigation actually moves focus (NOT just scrolls) per WCAG. -->
<a
  href="#main"
  class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-neutral-50 focus:text-neutral-950 focus:px-4 focus:py-2 focus:rounded focus:font-sans focus:text-sm"
>
  Skip to content
</a>

<TopNav />

<main id="main" tabindex="-1" class="block">
  {@render children()}
</main>

<Footer />
