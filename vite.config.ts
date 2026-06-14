import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VideoArraySchema } from './src/lib/data/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * DATA-02: Fail `pnpm build` (and `pnpm dev` server start) on a schema violation
 * in src/lib/data/videos.json. Runs in `buildStart`, the canonical Rollup-compatible
 * lifecycle hook for fail-fast pre-bundle validation.
 */
function validateVideosPlugin(): Plugin {
  return {
    name: 'validate-videos',
    buildStart() {
      const path = resolve(__dirname, 'src/lib/data/videos.json');
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(path, 'utf-8'));
      } catch (e) {
        this.error(`videos.json is not valid JSON: ${(e as Error).message}`);
        return; // unreachable — this.error throws
      }

      const result = VideoArraySchema.safeParse(raw);
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        this.error(`videos.json failed schema validation:\n${pretty}`);
        return; // unreachable
      }

      // Cross-row constraint: (source, id) must be unique across all records.
      const seen = new Set<string>();
      for (const v of result.data) {
        const key = `${v.source}:${v.id}`;
        if (seen.has(key)) {
          this.error(`videos.json: duplicate (source, id) pair: ${key}`);
          return; // unreachable
        }
        seen.add(key);
      }
    },
  };
}

export default defineConfig({
  // Plugin order matters: tailwindcss BEFORE sveltekit (Phase 1 Pattern 1);
  // validateVideosPlugin sits before sveltekit() so a schema violation aborts
  // the build BEFORE Svelte starts compiling routes that import the data.
  plugins: [tailwindcss(), validateVideosPlugin(), sveltekit()],
});
