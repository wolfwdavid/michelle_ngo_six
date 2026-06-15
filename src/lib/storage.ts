/**
 * $lib/storage — typed localStorage helper with `mnp_six_` namespace prefix.
 *
 * Conventions: auto-prefix (no raw localStorage outside this module);
 * typed API; SSR-safe; JSON parse try/catch; null fallback on corrupt;
 * localStorage only — sessionStorage/cookies/URL out of scope.
 *
 * The CI grep gate in .github/workflows/deploy.yml blocks
 * any other file from importing window.localStorage / localStorage directly.
 */

export const STORAGE_PREFIX = 'mnp_six_' as const;

/**
 * Exported testing-helper predicate. Returns true when running in a browser
 * (or browser-like jsdom) environment with localStorage available; false
 * during SvelteKit prerender / SSR or when window has been stubbed away in
 * tests via `vi.stubGlobal('window', undefined)`.
 *
 * Exported (not private) so storage.test.ts can assert SSR-guard behavior
 * without relying on Vite module-cache tricks. The double-underscore prefix
 * signals "internal / testing surface" — production code should not import
 * this; it has no legitimate caller outside storage.test.ts.
 */
export function __isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function prefixed(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export const storage = {
  /**
   * Read a value. Returns null when:
   *   - the key is not set
   *   - we are running on the server (SSR / prerender)
   *   - the stored value is not valid JSON (corrupt — graceful tolerance)
   */
  get<T>(key: string): T | null {
    if (!__isBrowser()) return null;
    const raw = window.localStorage.getItem(prefixed(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Write a value. JSON-stringified. No-op during SSR.
   */
  set<T>(key: string, value: T): void {
    if (!__isBrowser()) return;
    try {
      window.localStorage.setItem(prefixed(key), JSON.stringify(value));
    } catch {
      // Quota exceeded, private-mode, etc. — swallow; storage is best-effort.
    }
  },

  /**
   * Remove a single key. No-op during SSR.
   */
  remove(key: string): void {
    if (!__isBrowser()) return;
    window.localStorage.removeItem(prefixed(key));
  },

  /**
   * Remove ALL mnp_six_-prefixed keys. Leaves foreign keys (e.g., other
   * apps' keys sharing the same github.io origin).
   */
  clear(): void {
    if (!__isBrowser()) return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key !== null && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    for (const k of keys) window.localStorage.removeItem(k);
  },
};
