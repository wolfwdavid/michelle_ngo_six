/**
 * Build-time-generated sitemap.xml (DEP-04).
 *
 * Emits ONLY the routes that currently exist — the homepage `/`.
 * Routes are added here as new surfaces ship:
 *   - /work, /work/[category], /watch/[id], /about, /press,
 *     /contact, /pbs-american-portrait — at which point each gets a <url> block.
 * For now only `/` exists, so the sitemap advertises exactly one URL.
 *
 * Host note: this file emits the ABSOLUTE production canonical host
 * (https://michellengo.net/), NOT the staging base path. This matches the
 * sibling posture: the sitemap advertises the production URL, search engines
 * won't crawl the noindex staging Pages deploy, and the production build emits
 * the same sitemap content unchanged. Do NOT make this env-aware.
 */
export const prerender = true;

const SITE = 'https://michellengo.net';
const TODAY = new Date().toISOString().slice(0, 10); // build-time lastmod

export function GET() {
  const urls: string[] = [`  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod></url>`];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
