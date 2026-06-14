// /watch/[id] — Phase 2 Plan 02-04 (HOME-04 stub).
//
// A MINIMAL placeholder route so every VideoCard / hero slide link resolves
// to a real prerendered page between phases. Phase 3 (WCH-01) REPLACES the
// sibling +page.svelte with the full Vimeo/YouTube player + metadata + related
// rail, but KEEPS this entries() generator.
//
// prerender is inherited from +layout.ts (prerender = true; trailingSlash =
// 'always'), declared explicitly here for clarity. entries() enumerates every
// public video id so adapter-static prerenders build/watch/{id}/index.html for
// all 56 ids WITHOUT relying on a crawl from the homepage.
import { error } from '@sveltejs/kit';
import { videos, getById } from '$lib/data';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return videos.map((v) => ({ id: v.id }));
};

export const load: PageLoad = ({ params }) => {
  const video = getById(params.id);
  if (!video) {
    throw error(404, 'Video not found');
  }
  return { video };
};
