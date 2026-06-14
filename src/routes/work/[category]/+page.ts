/**
 * /work/[category] — prerendered per-category browse route (BRW-02).
 *
 * entries(): mandatory under adapter-static strict: true. Returns one entry
 *   per CATEGORIES value, derived from the single source of truth, so exactly
 *   8 HTML files prerender (build/work/<slug>/index.html).
 *
 * load(): narrows params.category via slugToCategory(). On an unknown slug it
 *   throws error(404). The `error()` helper returns `never`, so TypeScript
 *   narrows `category` from `Category | undefined` → `Category`. Videos are
 *   sorted featured-first, then published date descending.
 *
 * `prerender = true` and `trailingSlash = 'always'` are INHERITED from
 * src/routes/+layout.ts and are NOT redeclared here.
 */
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data';

export const entries: EntryGenerator = () =>
  CATEGORIES.map((c) => ({ category: categoryToSlug(c) }));

export const load: PageLoad = ({ params }) => {
  const category = slugToCategory(params.category);
  if (!category) error(404, 'Category not found');

  const videos = [...getByCategory(category)].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  });

  return { category, slug: params.category, videos };
};
