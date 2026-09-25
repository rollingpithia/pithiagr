import { base } from '$app/paths';

/** Resolve a static asset path with the SvelteKit base prefix. */
export function asset(path) {
  return `${base}${path}`;
}
