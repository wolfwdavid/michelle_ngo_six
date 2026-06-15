/**
 * Typed loader for the video data layer — the public $lib/data surface.
 *
 * Why parse here even though the Vite plugin already validated:
 *   1. Zod's .default() values (featured, hidden, tags) only apply during
 *      a parse() call. A raw JSON import has them undefined. We need them
 *      materialized so consumers can read v.featured / v.hidden / v.tags safely.
 *   2. Belt-and-suspenders: if someone bypasses the Vite plugin (e.g., direct
 *      vitest import), the loader still validates.
 *
 * Why this is build-time-only on a prerendered site:
 *   adapter-static prerenders every route. Routes import from $lib/data.
 *   Zod runs once at build time per route, never ships to client.
 *   (Zero runtime fetch / minimal client bundle.)
 *
 * noUncheckedIndexedAccess:
 *   getById returns `Video | undefined`. Every caller MUST narrow
 *   (e.g., `if (!video) return error(404, 'not found')`).
 *
 * Cross-cutting conventions implemented here:
 *   getCategoriesInDisplayOrder() returns count-desc, ties-alpha.
 *   producerReelId is the literal '264677021' (Vimeo).
 *   the reel video stays in the public `videos` array (not stripped).
 *   hidden videos filtered from `videos`; full set available via `allVideos`
 *          (NOT re-exported from $lib/data in v1; reserved for future tooling).
 */
import rawVideos from './videos.json';
import { VideoArraySchema, type Video } from './schema';
import { CATEGORIES, type Category, categoryToSlug } from './categories';

// Parse once at module load. The Vite plugin validates separately at buildStart
// (vite.config.ts) — this parse here applies the Zod defaults.
const _parsed: readonly Video[] = VideoArraySchema.parse(rawVideos);

/** Full public dataset (hidden videos filtered out). */
export const videos: readonly Video[] = _parsed.filter((v) => !v.hidden);

/**
 * All videos, INCLUDING hidden. Reserved for future internal tooling
 * (sitemap, admin views). NOT re-exported from src/lib/data/index.ts in v1.
 * Defer adding a `getAllVideosIncludingHidden()` helper until a caller exists.
 */
export const allVideos: readonly Video[] = _parsed;

/**
 * Producer's reel video ID (Vimeo). The PLAY REEL CTA reads this
 * directly. This video also stays in the public `videos` array
 * (and in the 'Reel' category filter).
 */
export const producerReelId = '264677021' as const;

/**
 * Returns the matching video by id (across both sources), or undefined.
 * Note: return type is `Video | undefined` because of noUncheckedIndexedAccess
 * — callers must narrow with `if (!video)` before accessing fields.
 */
export function getById(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

/**
 * Returns all public videos in the given category. Hidden videos are already
 * excluded because they're filtered out of `videos` upstream.
 */
export function getByCategory(category: Category): readonly Video[] {
  return videos.filter((v) => v.category === category);
}

/**
 * Categories in display order (count descending, ties broken alphabetically).
 * Computed once at module load from the validated public dataset (so hidden videos
 * don't inflate counts).
 */
const _categoriesInDisplayOrder: readonly Category[] = (() => {
  const counts = new Map<Category, number>();
  for (const c of CATEGORIES) counts.set(c, 0);
  for (const v of videos) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
  return [...CATEGORIES].sort((a, b) => {
    const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
})();

export function getCategoriesInDisplayOrder(): readonly Category[] {
  return _categoriesInDisplayOrder;
}

/**
 * Returns each category in display order with its slug and live video count.
 * The category nav consumes this to render the category chips with counts.
 */
export function getCategoriesWithCounts(): ReadonlyArray<{
  category: Category;
  slug: string;
  count: number;
}> {
  return _categoriesInDisplayOrder.map((category) => ({
    category,
    slug: categoryToSlug(category),
    count: videos.filter((v) => v.category === category).length,
  }));
}
