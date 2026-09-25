import suppliersData from '$lib/data/suppliers.json';

/** @typedef {{ id: string, name: string, address: string, phone: string, description: string, locales: string[], lat: number | null, lng: number | null }} Supplier */

/** @type {Supplier[]} */
export const suppliers = suppliersData;

/** @param {string} locale @param {Supplier[]} [list] */
export function suppliersForLocale(locale, list = suppliers) {
  const code = locale.trim().toLowerCase();
  return list.filter((s) => s.locales?.includes(code));
}

/** @param {string} query @param {string} locale */
export function filterSuppliers(query, locale) {
  const scoped = suppliersForLocale(locale);
  const q = query.trim().toLowerCase();
  if (!q) return scoped;
  return scoped.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.description.toLowerCase().includes(q),
  );
}

/** @param {Supplier[]} list */
export function suppliersWithCoords(list) {
  return list.filter((s) => s.lat != null && s.lng != null);
}

/** @param {string} locale */
export function hasSuppliersForLocale(locale) {
  return suppliersForLocale(locale).length > 0;
}
