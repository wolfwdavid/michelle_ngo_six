import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
      base: process.env.BASE_PATH ?? '',
    },
    prerender: {
      // The app-shell chrome (TopNav/MobileMenu/Footer) links to routes that
      // do not exist yet this phase (/work, /work/[category], /about, /press,
      // /contact, /pbs-american-portrait/). The prerender crawler follows
      // those <a href>s from the prerendered homepage and would 404 the build.
      // These hrefs are correct for when Phases 2-4 ship the routes, so we keep
      // them intact and scope-allow ONLY the known forward-phase 404s here.
      // Any UNEXPECTED 404 (typo, broken asset, etc.) still fails the build.
      handleHttpError: ({ status, path, message }) => {
        const PENDING_ROUTES = new Set([
          '/work',
          '/about',
          '/press',
          '/contact',
          '/pbs-american-portrait/',
        ]);
        const normalized = path.replace(/\/$/, '') || '/';
        const isPendingWorkCategory = normalized.startsWith('/work/');
        if (
          status === 404 &&
          (PENDING_ROUTES.has(path) ||
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
