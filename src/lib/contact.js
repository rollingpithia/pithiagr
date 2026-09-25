export const SHOP_URL = 'https://shop.pithia.gr';

export const CONTACT_EMAIL = 'info@pithia.gr';

export const FORM_SUBMIT_ACTION = 'https://formspree.io/f/xppwlyvg';

/** @typedef {{ id: string, labelKey: string, line1: string, postal: string, city: string, phone?: string, image?: string, mapsUrl: string, lat: number, lng: number }} OfficialLocation */

/** @type {OfficialLocation} */
export const HOUSE_LOCATION = {
  id: 'house',
  labelKey: 'house',
  line1: 'Πατησίων 302',
  postal: '11141',
  city: 'Αθήνα',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Patision+302+Athens+Greece',
  lat: 38.0142,
  lng: 23.7305,
};

/** @type {OfficialLocation} */
export const STORE_LOCATION = {
  id: 'store',
  labelKey: 'store',
  line1: 'Πατησίων 306',
  postal: '111 41',
  city: 'Αθήνα',
  phone: '+30 210 211 0447',
  image: '/assets/store.webp',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Patision+306+Athens+Greece',
  lat: 38.0148,
  lng: 23.732,
};

/** @type {OfficialLocation[]} */
export const OFFICIAL_LOCATIONS = [HOUSE_LOCATION, STORE_LOCATION];

/** @deprecated Use HOUSE_LOCATION */
export const CONTACT_ADDRESS = {
  line1: HOUSE_LOCATION.line1,
  line2: HOUSE_LOCATION.city,
  mapsUrl: HOUSE_LOCATION.mapsUrl,
};
