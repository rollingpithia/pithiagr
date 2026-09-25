/**
 * @typedef {Object} ProductSpec
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} catalogueSlug
 * @property {string} line
 * @property {string} subcategorySlug
 * @property {string} nameEl
 * @property {string} nameEn
 * @property {string} descriptionEl
 * @property {string} descriptionEn
 * @property {string[]} images
 * @property {ProductSpec[]} specs
 * @property {number} sortOrder
 */

/** @param {string} slug @param {Product[]} all */
export function getProductsByCategory(slug, all) {
  return all
    .filter((p) => p.catalogueSlug === slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** @param {Product} product */
export function productDisplayName(product) {
  return product.nameEl || product.nameEn || product.id;
}

/** @param {Product} product */
export function productSpecs(product) {
  return product.specs ?? [];
}

/** @param {string} path */
export function isExternalImage(path) {
  return path.startsWith('http://') || path.startsWith('https://');
}

/**
 * @param {string} path
 * @param {string} [base='']
 */
export function resolveProductImage(path, base = '') {
  if (!path) return '';
  if (isExternalImage(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path.replace(/^assets\//, 'assets/')}`;
  return `${base}${normalized}`;
}

/** @param {Product} product @param {string} [base=''] */
export function primaryImage(product, base = '') {
  const first = product.images[0];
  return first ? resolveProductImage(first, base) : '';
}

/** @param {'classic' | 'physis'} line @param {Product} product */
export function matchesLine(line, product) {
  return product.line === line;
}

/** @param {Product} product */
export function productLineLabel(product) {
  if (product.line === 'physis') return 'Physis';
  if (product.line === 'classic') return 'Pithia';
  return '';
}
