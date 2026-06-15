/**
 * Hero carousel slide selection.
 *
 * Picks one representative NON-reel video per category for the homepage hero
 * carousel: the ambient producer reel already IS slide 0, so the 'Reel'
 * category is skipped entirely and the producer reel id is excluded
 * belt-and-suspenders. Within each category a `featured: true` video wins;
 * otherwise the first video in that category is used. Categories are walked
 * in display order (count desc, ties alpha) and the result is capped at
 * HERO_SLIDE_CAP.
 *
 * Computed once at module load from the static validated `videos` array
 * (same memo pattern as `_categoriesInDisplayOrder` in videos.ts), so
 * `getHeroSlides()` is deterministic and allocation-free per call.
 *
 * Why a separate peer module (not added to src/lib/data/index.ts):
 *   The public surface of $lib/data is intentionally narrow.
 *   Sidecar/derived helpers live in peer files; consumers import directly:
 *     `import { getHeroSlides } from '$lib/data/heroSlides'`
 *   — same pattern as posters.ts.
 */
import { producerReelId, getByCategory, getCategoriesInDisplayOrder } from './videos';
import type { Video } from './schema';

/** Maximum number of poster slides after the ambient reel slide 0. */
export const HERO_SLIDE_CAP = 6;

const _heroSlides: readonly Video[] = (() => {
  const picked: Video[] = [];
  for (const category of getCategoriesInDisplayOrder()) {
    if (picked.length >= HERO_SLIDE_CAP) break;
    // The ambient slide 0 already shows the reel — never duplicate it.
    if (category === 'Reel') continue;
    const inCategory = getByCategory(category).filter((v) => v.id !== producerReelId);
    const pick = inCategory.find((v) => v.featured) ?? inCategory[0];
    if (pick) picked.push(pick);
  }
  return picked;
})();

/**
 * One representative non-reel video per category, display order, capped at
 * HERO_SLIDE_CAP. Returns the same cached array on every call.
 */
export function getHeroSlides(): readonly Video[] {
  return _heroSlides;
}
