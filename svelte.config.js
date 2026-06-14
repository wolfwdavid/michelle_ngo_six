import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const BASE_PATH = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true,
    }),
    paths: {
      base: BASE_PATH,
    },
    prerender: {
      // The app-shell chrome (TopNav/MobileMenu/Footer) links to routes that
      // do not exist yet this phase (/work, /work/[category], /about, /press,
      // /contact, /pbs-american-portrait/). The prerender crawler follows
      // those <a href>s from the prerendered homepage and would 404 the build.
      // These hrefs are correct for when Phases 2-4 ship the routes, so we keep
      // them intact and scope-allow ONLY the known forward-phase 404s here.
      // Any UNEXPECTED 404 (typo, broken asset, etc.) still fails the build.
      //
      // /watch/[id] is NOT pending — Plan 02-04 ships a real (Phase-2 stub)
      // /watch/[id] route whose entries() prerenders all 56 ids, so every
      // card/hero link resolves to a real page. Phase 3 swaps the stub
      // +page.svelte for the full player (keeping the +page.ts entries()).
      // It must therefore NEVER appear in PENDING_ROUTES — a /watch 404 here
      // is a genuine bug (a link/id mismatch), not a forward-phase route.
      //
      // NOTE: when building with BASE_PATH set (the GitHub Pages deploy uses
      // BASE_PATH=/michelle_ngo_six), the prerenderer reports paths PREFIXED
      // with the base (e.g. /michelle_ngo_six/work). Strip that prefix before
      // matching so the allow-list works in both the empty-base local build
      // and the base-path CI/Pages build.
      handleHttpError: ({ status, path, message }) => {
        const PENDING_ROUTES = new Set([
          '/work',
          '/about',
          '/press',
          '/contact',
          '/pbs-american-portrait/',
        ]);
        const debased =
          BASE_PATH && path.startsWith(BASE_PATH)
            ? path.slice(BASE_PATH.length) || '/'
            : path;
        const normalized = debased.replace(/\/$/, '') || '/';
        const isPendingWorkCategory = normalized.startsWith('/work/');
        if (
          status === 404 &&
          (PENDING_ROUTES.has(debased) ||
            PENDING_ROUTES.has(normalized) ||
            isPendingWorkCategory)
        ) {
          // Forward-phase route — expected to 404 until Phases 2-4 build it.
          return;
        }
        throw new Error(message);
      },
    },
  },
};

export default config;
