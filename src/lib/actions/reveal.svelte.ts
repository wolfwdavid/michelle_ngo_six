/**
 * `reveal` — a reusable scroll-into-view entrance action.
 *
 * On first intersection the node fades + slides up (opacity 0 → 1, a 12px
 * translateY → none) over 500ms using the shared --ease-cinematic easing. An
 * optional `delay` (ms) staggers sibling reveals (e.g. a rail cascade).
 *
 * Single motion source: gated ONLY via the `motion` rune
 * (motion.prefersReducedMotion). Under reduced motion — and during SSR /
 * prerender, where neither `window` nor `IntersectionObserver` exists — the
 * action is a pure no-op: it sets the node fully opaque and returns. The node
 * is therefore NEVER left stuck at opacity 0; static markup ships visible.
 *
 * Mirrors the SSR-guard idiom used by the state runes (typeof checks before any
 * browser API). Never apply this to an eager LCP poster: the action only ever
 * raises opacity to 1, but the brief opacity:0 start would regress LCP.
 */
import { motion } from '$lib/state/motion.svelte';

export interface RevealOptions {
  /** Stagger in milliseconds before the transition starts. */
  delay?: number;
}

export function reveal(node: HTMLElement, { delay = 0 }: RevealOptions = {}) {
  // No-op under reduced motion or non-browser (SSR/prerender): the node ends
  // up fully visible with no animation. IntersectionObserver is feature-checked
  // alongside `window` so prerender never touches a browser-only API.
  if (
    motion.prefersReducedMotion ||
    typeof window === 'undefined' ||
    typeof IntersectionObserver === 'undefined'
  ) {
    node.style.opacity = '1';
    return;
  }

  node.style.cssText =
    'opacity:0; transform:translateY(12px);' +
    `transition:opacity 500ms ${delay}ms var(--ease-cinematic), transform 500ms ${delay}ms var(--ease-cinematic);`;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        node.style.opacity = '1';
        node.style.transform = 'none';
        io.disconnect();
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  io.observe(node);

  return {
    destroy() {
      io.disconnect();
    },
  };
}
