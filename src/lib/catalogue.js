import { CATALOGUE_CATEGORIES, categoryLines } from '$lib/catalogue-data.js';

export const CATEGORIES = CATALOGUE_CATEGORIES;

/** @type {string[]} */
export const CATEGORY_IDS = CATALOGUE_CATEGORIES.map((c) => c.slug);

/** @param {string} id */
export function isValidCategory(id) {
  return CATEGORY_IDS.includes(id);
}

/** @param {string} slug */
export function getCategory(slug) {
  return CATALOGUE_CATEGORIES.find((c) => c.slug === slug);
}

/** @param {{ products: Record<string, unknown>[] }} category */
export function linesFor(category) {
  return categoryLines(category);
}
