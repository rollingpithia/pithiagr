import { base } from '$app/paths';

/** Public site. Pages are served at the root of this origin. */
export const SITE_ORIGIN = 'https://pithia.gr';

/**
 * @param {string} path
 */
export function absoluteUrl(path) {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const joined = `${base}${suffix === '/' ? '' : suffix}` || '/';
  return `${SITE_ORIGIN}${joined === '/' ? '/' : joined}`;
}

/**
 * Only the pages of this new site. Nothing discovered elsewhere
 * (the old shop, old WordPress uploads, or other hosts).
 */
const PAGES = [
  {
    path: '/',
    title: 'Home',
    description:
      'Pithia (Πυθία), a Greek premium rolling house since 2013. The homepage introduces the brand, its philosophy, the Physis line, and the Starry papers.',
  },
  {
    path: '/catalogue',
    title: 'Catalogue',
    description:
      'The full collection: rolling papers, filter tips, tobacco cases, and wallets. Classic lines and the plant-based Physis range.',
  },
  {
    path: '/catalogue/xartakia',
    title: 'Rolling papers',
    description: 'Rolling papers, from classic and unbleached sheets to the plant-based Physis range and King Size.',
  },
  {
    path: '/catalogue/filtrakia',
    title: 'Filter tips',
    description: 'Filter tips made in Greece, including Ultra Slim, longer SE editions, and the plastic-free Physis line.',
  },
  {
    path: '/catalogue/kapnothikes',
    title: 'Tobacco cases',
    description: 'Tobacco cases for everyday carrying, in plain and patterned editions.',
  },
  {
    path: '/catalogue/portofolia',
    title: 'Wallets',
    description: 'Wallets for everyday use, durable and understated.',
  },
  {
    path: '/story',
    title: 'Story',
    description:
      'From a kiosk at Patision 302 in 1991 to the name Pithia in 2013, and the three pillars the house works by.',
  },
  {
    path: '/find-us',
    title: 'Find us',
    description: 'Stockists and partner shops across Greece, plus the house and the shop on Patision Street in Athens.',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Write to the house: info@pithia.gr, Patision 302, 11141 Athens. The retail shop is at Patision 306.',
  },
];

/** Indexable pages of this site, in the order a visitor meets them. */
export function sitePages() {
  return PAGES;
}
