import el from './locales/el.js';
import en from './locales/en.js';
import es from './locales/es.js';
import nl from './locales/nl.js';

/** @typedef {'el' | 'en' | 'es' | 'nl'} LocaleCode */

/**
 * @typedef {Object} Messages
 * @property {{ title: string, description: string }} meta
 * @property {{ name: string }} brand
 * @property {{ home: string, story: string, philosophy: string, physis: string, timeline: string, catalogue: string, findUs: string, contact: string }} nav
 * @property {{ eyebrow: string, title: string, sub: string, enter: string, leave: string, legal: string }} age
 * @property {Object} hero
 * @property {Object} philosophy
 * @property {Object} physis
 * @property {Object} starry
 * @property {Object} story
 * @property {Object} timeline
 * @property {{ tagline: string, addr: string, postal: string, since: string, legal: string, rights: string, places: string, navigate: string, house: string, shopEyebrow: string, shopNote: string, shopCta: string, distributorLabel: string, distributor: string }} footer
 * @property {Object} catalogue
 * @property {Object} findUs
 * @property {Object} contact
 * @property {Object} products
 */

/** Supported locales — add a file under locales/ and register it here. */
export const LOCALES = [
  { code: 'el', label: 'ΕΛ', htmlLang: 'el' },
  { code: 'en', label: 'EN', htmlLang: 'en' },
  { code: 'es', label: 'ES', htmlLang: 'es' },
  { code: 'nl', label: 'NL', htmlLang: 'nl' },
];

export const DEFAULT_LOCALE = 'el';
export const LOCALE_STORAGE_KEY = 'pithia-lang';

/** @type {Record<LocaleCode, Messages>} */
const messages = { el, en, es, nl };

/** @param {string} code */
export function isLocale(code) {
  return code in messages;
}

/** @param {string} [locale] */
export function getMessages(locale) {
  return messages[isLocale(locale) ? /** @type {LocaleCode} */ (locale) : DEFAULT_LOCALE];
}

/** @param {string} [stored] */
export function resolveLocale(stored) {
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

/** All messages keyed by locale (legacy alias). */
export const I18N = messages;
