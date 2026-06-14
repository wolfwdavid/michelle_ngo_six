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
      // The app.html LCP preload references the producer-reel poster
      // (/posters/vimeo-264677021.jpg), which does not ship until Plan 02-02
      // (the data + posters layer). Until then, ignore ONLY that known-pending
      // asset so the foundation build stays green; every other broken link
      // still fails the build hard (strict posture preserved). Plan 02-02
      // ships the poster and removes this allowance.
      handleHttpError: ({ path, message }) => {
        if (path === '/posters/vimeo-264677021.jpg') return;
        throw new Error(message);
      },
    },
  },
};

export default config;
