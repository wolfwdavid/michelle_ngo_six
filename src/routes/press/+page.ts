/**
 * /press — broadcast credits route.
 *
 * Parameterless prerendered route. `prerender = true` and
 * `trailingSlash = 'always'` are inherited from src/routes/+layout.ts.
 *
 * Load returns the flat `PressCredit[]` array (one section per credit).
 */
import type { PageLoad } from './$types';
import { getPressCredits, type PressCredit } from './_pressCredits';

export const load: PageLoad<{ credits: PressCredit[] }> = () => {
  return { credits: getPressCredits() };
};
