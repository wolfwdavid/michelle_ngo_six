// adapter-static requires every route to be prerenderable. Set the default
// at the layout level so every child route inherits without per-page opt-in.
export const prerender = true;

// trailingSlash='always' to match the sibling sites — adapter-static emits
// build/<route>/index.html and the canonical URL form carries a trailing slash.
export const trailingSlash = 'always';
