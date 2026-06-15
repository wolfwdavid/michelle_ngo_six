<!--
  Homepage — Phase 2 Plan 02-04. Assembles the cinematic featured hero
  (HOME-01) above one labeled CategoryRail per category in display order
  (HOME-02/03), on the Phase-1 app shell (the layout supplies <main id="main">,
  nav, and footer around this content). HOME-04 links resolve to /watch/[id];
  HOME-05 reduced-motion is owned by the components' rune-bound motion-ok gating.

  Layout (UI-SPEC § Layout & Structure):
   - HeroCarousel is full-bleed (edge-to-edge — the component owns its width;
     it is NOT wrapped in the contained page gutter).
   - The rail stack is a single labeled <section>; rails inherit the contained
     max-width + page gutter from CategoryRail itself.
   - Spacing: hero -> first rail 48px (pt-12); 32px between rails (space-y-8);
     last rail -> footer 64px (pb-16).

  Single top-level heading: HeroCarousel slide titles and CategoryRail labels
  are all level-two headings, so the page would otherwise have none at level
  one. We add one visually-hidden (sr-only) top-level heading for the document
  outline / screen readers without competing with the cinematic hero.
-->
<script lang="ts">
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import CategoryRail from '$lib/components/CategoryRail.svelte';
  import { reveal } from '$lib/actions/reveal.svelte';
  import { getCategoriesInDisplayOrder } from '$lib/data';

  const categories = getCategoriesInDisplayOrder();
</script>

<div class="bg-neutral-950">
  <h1 class="sr-only">Michelle Ngo — Film &amp; Video Portfolio</h1>

  <!-- Full-bleed cinematic hero (HOME-01). -->
  <HeroCarousel />

  <!-- Category rails in display order (count desc, ties alpha). Only the first
       rail's leading cards are eager — every other poster stays lazy so the
       active hero poster remains the sole eager/high-priority LCP image. -->
  <section
    aria-label="Browse by category"
    class="space-y-8 pt-12 pb-16"
  >
    {#each categories as cat, i (cat)}
      <div use:reveal={{ delay: i * 60 }}>
        <CategoryRail category={cat} eagerFirstCards={i === 0} />
      </div>
    {/each}
  </section>
</div>
