/**
 * Derives the press-credit list from videos.json.
 *
 * Returns a FLAT array of `{ network, video }` records — one entry per credit —
 * in a fixed prestige order. Today's data is roughly 1:1 uploader-to-video, so
 * each credit becomes its own scroll-snap section; networks with multiple
 * credits sub-sort featured-first, then newest-first.
 *
 * The underscore prefix excludes this file from SvelteKit route detection.
 */
import { videos, type Video } from '$lib/data';

/** Networks listed in display (prestige) order. */
const PRESTIGE_ORDER = [
  'HBO Max',
  'HBO',
  'PBS',
  'ABC News',
  'U2',
  'Amazon News',
  'Music Box Films',
  'Monument Releasing',
  'Cargo Film & Releasing',
  'AZPM',
  'HBODocs',
  'GrasshalmClips',
  'Lenny Cooke (Movie)',
] as const;

export interface PressCredit {
  network: string;
  video: Video;
}

export function getPressCredits(): PressCredit[] {
  // Exclude Michelle's own uploads — press credits are third-party networks.
  const pressVideos = videos.filter((v) => v.uploader !== 'Michelle Ngo');

  // Group by uploader (intermediate — collapsed to a flat array below).
  const byNetwork = new Map<string, Video[]>();
  for (const v of pressVideos) {
    const list = byNetwork.get(v.uploader);
    if (list) {
      list.push(v);
    } else {
      byNetwork.set(v.uploader, [v]);
    }
  }

  // Emit prestige-ordered networks first, one section per credit. Within a
  // network with multiple credits, sub-sort featured-first then newest-first.
  const ordered: PressCredit[] = [];
  const consumed = new Set<string>();
  for (const network of PRESTIGE_ORDER) {
    const list = byNetwork.get(network);
    if (list && list.length > 0) {
      const sorted = [...list].toSorted((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.published.localeCompare(a.published);
      });
      for (const video of sorted) {
        ordered.push({ network, video });
      }
      consumed.add(network);
    }
  }
  // Any unknown uploader is appended last so new data never disappears.
  for (const [network, list] of byNetwork) {
    if (!consumed.has(network)) {
      for (const video of list) {
        ordered.push({ network, video });
      }
    }
  }
  return ordered;
}
