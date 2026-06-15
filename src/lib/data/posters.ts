/**
 * Poster lookup helper — reads src/lib/data/posters.json sidecar.
 *
 * Sidecar is populated by scripts/check-embeds.ts
 * (committed artifacts, not network-fetched at build). When entries
 * are missing, we
 * fall back to a deterministic path so the type stays non-null and components
 * render a `<img src="/posters/<source>-<id>.jpg">` that resolves once the
 * actual assets are committed.
 *
 * The build-time validatePostersPlugin (vite.config.ts) fails
 * `pnpm build` if posters.json is missing entries; this helper is the runtime
 * read for components that survive the build gate.
 *
 * Why a separate module (not added to $lib/data/index.ts):
 *   The public surface of $lib/data is intentionally narrow. Sidecar
 *   helpers live in a peer file; consumers import directly:
 *     `import { getPosterFor } from '$lib/data/posters'`.
 */
import type { Video } from './schema';
import sidecar from './posters.json';

const POSTERS = sidecar as Record<string, string>;

export function getPosterFor(video: Pick<Video, 'source' | 'id'>): string {
  const key = `${video.source}-${video.id}`;
  const entry = POSTERS[key];
  if (entry) return entry;
  // Plan 03-01 fallback: deterministic path. Plan 03-03 populates real entries.
  return `/posters/${video.source}-${video.id}.jpg`;
}
