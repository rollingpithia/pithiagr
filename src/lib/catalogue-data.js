import xartakia from '../../data/xartakia.json';
import filtrakia from '../../data/filtrakia.json';
import kapnothikes from '../../data/kapnothikes.json';
import portofolia from '../../data/portofolia.json';

/** @typedef {'el' | 'en' | 'es' | 'nl'} Lang */

const SKIP_FIELDS = new Set([
  'SKU',
  'Name',
  'Category',
  'Attributes',
  'Active',
  'Image',
  'Short Description',
  'Description',
  'Alt Text',
]);

const NAMES = {
  xartakia: { el: 'Χαρτάκια', en: 'Rolling papers', es: 'Papel de liar', nl: 'Vloeitjes' },
  filtrakia: { el: 'Φιλτράκια', en: 'Filter tips', es: 'Filtros', nl: 'Filtertips' },
  kapnothikes: { el: 'Καπνοθήκες', en: 'Tobacco cases', es: 'Tabaqueras', nl: 'Tabaksdozen' },
  portofolia: { el: 'Πορτοφόλια', en: 'Wallets', es: 'Carteras', nl: 'Portemonnees' },
};

/** @type {Record<string, string>} */
export const LEGACY_CATEGORY_SLUGS = {
  'rolling-papers': 'xartakia',
  filters: 'filtrakia',
  'tobacco-pouches': 'kapnothikes',
  wallets: 'portofolia',
};

const files = [
  ['xartakia', xartakia],
  ['filtrakia', filtrakia],
  ['kapnothikes', kapnothikes],
  ['portofolia', portofolia],
];

export const CATALOGUE_CATEGORIES = files.map(([slug, file]) => ({
  slug,
  type: file.type,
  image: file.image,
  icons: file.icons ?? {},
  description: file.description,
  name: NAMES[slug],
  products: file.products ?? [],
}));

/** @param {string} slug */
export function getCatalogueCategory(slug) {
  return CATALOGUE_CATEGORIES.find((c) => c.slug === slug);
}

/** @param {unknown} value @param {string} lang */
export function localized(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join('\n\n');
  if (typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    const picked = record[lang] ?? record.el;
    if (picked == null) return '';
    if (Array.isArray(picked)) return picked.filter(Boolean).join('\n\n');
    return String(picked);
  }
  return '';
}

/** @param {Record<string, unknown>} product */
export function isListed(product) {
  return product.Active !== false;
}

/** @param {string} value */
function splitAttributes(value) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * @param {Record<string, unknown>} product
 * @param {string} lang
 * @returns {{ id: string, label: string }[]}
 */
export function productAttributes(product, lang) {
  const ids = splitAttributes(localized(product.Attributes, 'en'));
  const labels = splitAttributes(localized(product.Attributes, lang));
  return ids.map((id, index) => ({ id, label: labels[index] || id }));
}

/** @param {{ products: Record<string, unknown>[] }} category @param {string} lang */
export function categoryAttributes(category, lang) {
  /** @type {Map<string, string>} */
  const seen = new Map();
  for (const product of category.products) {
    if (!isListed(product)) continue;
    for (const attr of productAttributes(product, lang)) {
      if (!seen.has(attr.id)) seen.set(attr.id, attr.label);
    }
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}

/** @param {Record<string, unknown>} product */
export function productLine(product) {
  const attrs = localized(product.Attributes, 'en').toLowerCase();
  if (attrs.includes('fysis') || attrs.includes('φυσις')) return 'physis';
  if (attrs.includes('classic')) return 'classic';
  return '';
}

/** @param {{ products: Record<string, unknown>[] }} category */
export function categoryLines(category) {
  const lines = new Set();
  for (const product of category.products) {
    if (!isListed(product)) continue;
    const line = productLine(product);
    if (line) lines.add(line);
  }
  return ['classic', 'physis'].filter((line) => lines.has(line));
}

/**
 * @param {{ icons?: Record<string, string> }} category
 * @param {Record<string, unknown>} product
 * @param {string} lang
 */
export function productSpecs(category, product, lang) {
  const icons = category.icons ?? {};
  /** @type {{ key: string, icon: string, value: string }[]} */
  const specs = [];
  for (const [key, icon] of Object.entries(icons)) {
    if (SKIP_FIELDS.has(key)) continue;
    const value = localized(product[key], lang).trim();
    if (!value) continue;
    specs.push({ key, icon, value });
  }
  return specs;
}

/** @param {Record<string, unknown>} product */
export function hasAltText(product) {
  const alt = product['Alt Text'];
  if (!alt || typeof alt !== 'object') return false;
  return ['el', 'en', 'es', 'nl'].some((lang) => {
    const text = /** @type {Record<string, unknown>} */ (alt)[lang];
    return typeof text === 'string' && text.trim().length > 0;
  });
}
