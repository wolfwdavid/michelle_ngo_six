/**
 * /work route — the prerendered browse index.
 *
 * A single static page listing every video; the FilterPillBar narrows the grid
 * client-side, so there is exactly one prerendered HTML document for /work.
 *
 * prerender + trailingSlash='always' are inherited from +layout.ts — do NOT
 * redeclare them here.
 */
import { videos } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = () => ({ videos });
