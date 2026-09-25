import { CATEGORY_IDS, getCategory, isValidCategory } from '$lib/catalogue.js';
import { LEGACY_CATEGORY_SLUGS } from '$lib/catalogue-data.js';
import { error, redirect } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return CATEGORY_IDS.map((category) => ({ category }));
}

/** @param {{ params: { category: string } }} event */
export function load({ params }) {
  const legacy = LEGACY_CATEGORY_SLUGS[params.category];
  if (legacy) {
    redirect(301, `/catalogue/${legacy}`);
  }
  if (!isValidCategory(params.category)) {
    error(404, 'Category not found');
  }
  const category = getCategory(params.category);
  return { category };
}
