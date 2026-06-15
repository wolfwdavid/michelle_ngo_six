<!--
  Site-wide cinematic Footer (CONT-03).

  Layout:
    - 3-column desktop / 1-column mobile grid;
            column 1 ContactBlock, column 2 8 categories with PBS retarget,
            column 3 secondary nav (About / Press / Contact / View All Work →),
            bottom strip "© 2026 Michelle Ngo · Built with SvelteKit"
    - mono category links (NO per-category OKLCH accent);
            footer is quiet directory chrome
    - hairline border-t border-white/10, bg-neutral-950
            continuous, py-12 md:py-16
    - ContactBlock reused VERBATIM (no orientation prop)

  Typography (UI-SPEC §"Surface 6 — Footer", consolidated 4-size ramp):
    Column headers + bottom strip use text-sm per the UI-SPEC Typography
    contract (4 sizes total, no text-xs).

  ESLint: svelte/no-navigation-without-resolve disabled for this file via
  the per-file override in eslint.config.js (mirror of TopNav/FilterPillBar
  pattern — internal hrefs built from `${base}/...`).

  Mirror semantics: category link hrefs match TopNav exactly. TopNav
  uses `${base}/work/${slug}` (no trailing slash) for non-PBS categories —
  this footer uses the same form to keep "mirror" exact. SvelteKit normalizes
  URLs on click under trailingSlash='always'; both forms reach the same
  prerendered HTML.
-->
<script lang="ts">
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import ContactBlock from './ContactBlock.svelte';

  const categories = getCategoriesInDisplayOrder();
</script>

<footer class="border-t border-white/10 bg-neutral-950 py-12 md:py-16">
  <div class="mx-auto max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      <!-- Column 1: ContactBlock — same shared component as /about + /contact -->
      <div data-footer-col="contact">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-500">Contact</h2>
        <div class="mt-4">
          <ContactBlock />
        </div>
      </div>

      <!-- Column 2: 8 categories — every link targets the prerendered /work/<slug> -->
      <div data-footer-col="work">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-500">Work</h2>
        <ul class="mt-4 space-y-2 text-base">
          {#each categories as category (category)}
            {@const slug = categoryToSlug(category)}
            {@const href = `${base}/work/${slug}`}
            <li>
              <a
                {href}
                data-sveltekit-preload-data="hover"
                class="text-white hover:underline underline-offset-2"
              >
                {category}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Column 3: secondary nav — About, Press, Contact, View All Work → -->
      <div data-footer-col="site">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-500">Site</h2>
        <ul class="mt-4 space-y-2 text-base">
          <li>
            <a
              href={`${base}/about`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              About
            </a>
          </li>
          <li>
            <a
              href={`${base}/press`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              Press
            </a>
          </li>
          <li>
            <a
              href={`${base}/contact`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href={`${base}/work`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              View All Work →
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom strip: hairline border + copyright + Built with SvelteKit -->
    <div
      class="mt-12 md:mt-16 pt-6 border-t border-white/10 text-center text-sm text-neutral-500 tracking-wider"
    >
      © 2026 Michelle Ngo · Built with SvelteKit
    </div>
  </div>
</footer>
