<!--
  FilterPillBar — sticky category-filter row for the /work surfaces (BRW-01, BRW-03).

  9 pills: leftmost "All" (slug `'all'`, neutral-active) + the 8 categories from
  getCategoriesInDisplayOrder() (count-desc, ties-alpha). The active pill is keyed
  off the `active` prop — NOT the URL — so the same component serves two surfaces:

    1. Filter mode (the /work index): `onselect` is provided. Each pill is a
       <button> that calls `onselect(slug)` to filter the grid client-side — no
       navigation, single prerendered page.

    2. Link mode (the /work/[category] route): `onselect` is omitted. Each pill is
       an <a> linking base-path-safely to `${base}/work/${slug}` (the "All" pill to
       `${base}/work`).

  The active category pill uses the compound accent (text + bg + ring); the active
  "All" pill uses the neutral inverted chip. On the narrow horizontal scroll row the
  active pill is scrolled into view on change, honoring the reduced-motion rune for
  smooth-vs-instant behavior.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import { tick } from 'svelte';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import { categoryAccent, categoryAccentBg, categoryAccentRing } from './categoryAccent';
  import { motion } from '$lib/state/motion.svelte';

  let {
    active = 'all',
    onselect,
  }: {
    active?: string;
    onselect?: (slug: string) => void;
  } = $props();

  const categories = getCategoriesInDisplayOrder();
  const pills = categories.map((category) => ({ category, slug: categoryToSlug(category) }));

  let containerEl = $state<HTMLElement | null>(null);

  // Shared chip geometry across both modes; only the active-state classes differ.
  const baseChip =
    'inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wider border border-white/15';
  const idleChip = 'text-neutral-300 hover:bg-white/5';
  const allActiveChip = 'bg-neutral-50 text-neutral-950 border-neutral-50';

  // When the active pill changes, scroll it horizontally into view so the current
  // filter context stays visible on narrow viewports. Reading `active` inside the
  // effect body re-runs it on every change.
  $effect(() => {
    if (!containerEl) return;
    void active;
    void tick().then(() => {
      const el = containerEl?.querySelector('[data-active="true"]') as HTMLElement | null;
      if (!el || typeof el.scrollIntoView !== 'function') return;
      el.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: motion.prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });
</script>

<nav
  aria-label="Filmography filters"
  class="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur border-b border-white/10"
>
  <ul
    bind:this={containerEl}
    class="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"
  >
    <li class="shrink-0">
      {#if onselect}
        <button
          type="button"
          data-active={active === 'all'}
          aria-pressed={active === 'all'}
          onclick={() => onselect('all')}
          class={`${baseChip} ${active === 'all' ? allActiveChip : idleChip}`}
        >
          All
        </button>
      {:else}
        <a
          href={`${base}/work`}
          data-sveltekit-preload-data="hover"
          data-active={active === 'all'}
          aria-current={active === 'all' ? 'page' : undefined}
          class={`${baseChip} ${active === 'all' ? allActiveChip : idleChip}`}
        >
          All
        </a>
      {/if}
    </li>

    {#each pills as { category, slug } (slug)}
      {@const isActive = slug === active}
      {@const activeChip = `${categoryAccent(category)} ${categoryAccentBg(category)} ring-1 ${categoryAccentRing(category)} border-transparent`}
      <li class="shrink-0">
        {#if onselect}
          <button
            type="button"
            data-active={isActive}
            data-category={category}
            aria-pressed={isActive}
            onclick={() => onselect(slug)}
            class={`${baseChip} ${isActive ? activeChip : idleChip}`}
          >
            {category}
          </button>
        {:else}
          <a
            href={`${base}/work/${slug}`}
            data-sveltekit-preload-data="hover"
            data-active={isActive}
            data-category={category}
            aria-current={isActive ? 'page' : undefined}
            class={`${baseChip} ${isActive ? activeChip : idleChip}`}
          >
            {category}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
