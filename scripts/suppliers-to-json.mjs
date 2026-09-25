#!/usr/bin/env node
/**
 * Builds src/lib/data/suppliers.json from data/suppliers.csv
 * Optional geocode cache: data/suppliers-geocode.json
 * Run: node scripts/suppliers-to-json.mjs
 * Geocode missing coords: node scripts/suppliers-to-json.mjs --geocode
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'data');
const outDir = join(root, 'src/lib/data');
const cachePath = join(dataDir, 'suppliers-geocode.json');

const geocode = process.argv.includes('--geocode');
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  fields.push(cur);
  return fields;
}

/** @param {string} path */
function readCsv(path) {
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim();
  if (!text) return [];
  const lines = text.split('\n');
  const headers = parseCsvLine(lines[0]);
  return lines
    .slice(1)
    .map((line) => {
      if (!line.trim()) return null;
      const values = parseCsvLine(line);
      /** @type {Record<string, string>} */
      const row = {};
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? '').trim();
      });
      return row;
    })
    .filter(Boolean);
}

/** @param {string} path */
function readJson(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** @param {string} query */
async function nominatim(query) {
  const url = new URL(NOMINATIM);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('countrycodes', 'gr');
  url.searchParams.set('limit', '1');

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PithiaSite/1.0 (contact@pithia.gr)',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  if (!data?.length) return null;
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** @type {Record<string, [number, number]>} */
const PLACE_COORDS = {
  ΑΘΗΝΑ: [37.9838, 23.7275],
  ΠΑΤΡΑ: [38.2466, 21.7346],
  ΘΕΣΣΑΛΟΝΙΚΗ: [40.6401, 22.9444],
  ΠΕΙΡΑΙΑΣ: [37.942, 23.646],
  ΗΡΑΚΛΕΙΟ: [35.3387, 25.1442],
  ΛΑΡΙΣΑ: [39.639, 22.4191],
  ΒΟΛΟΣ: [39.361, 22.942],
  ΙΩΑΝΝΙΝΑ: [39.665, 20.8537],
  ΧΑΝΙΑ: [35.5138, 24.018],
  ΡΟΔΟΣ: [36.4341, 28.2176],
  ΚΕΡΚΥΡΑ: [39.6243, 19.9217],
  ΚΑΛΑΜΑΤΑ: [37.0388, 22.1142],
  ΚΟΖΑΝΗ: [40.3006, 21.7889],
  ΔΡΑΜΑ: [41.1514, 24.1479],
  ΒΕΡΟΙΑ: [40.5206, 22.2035],
  ΝΑΥΠΛΙΟ: [37.5673, 22.8016],
  ΧΡΥΣΟΥΠΟΛΗ: [40.9911, 24.6956],
  ΣΑΝΤΟΡΙΝΗ: [36.3932, 25.4615],
  ΠΑΤΗΣΙΑ: [38.015, 23.732],
  ΣΕΠΟΛΙΑ: [37.989, 23.719],
  ΑΙΓΑΛΕΩ: [37.992, 23.678],
  ΝΙΚΑΙΑ: [37.966, 23.647],
  ΓΛΥΦΑΔΑ: [37.861, 23.753],
  ΒΥΡΩΝΑΣ: [37.961, 23.753],
  ΠΕΤΡΟΥΠΟΛΗ: [38.042, 23.685],
  ΚΩΣ: [36.8932, 27.2887],
  ΧΙΟΣ: [38.368, 26.136],
  ΜΗΛΟΣ: [36.748, 24.425],
  ΚΑΡΔΑΜΥΛΑ: [38.395, 26.123],
  ΑΣΤΥΠΑΛΑΙΑ: [36.545, 26.357],
  ΚΕΦΑΛΛΗΝΙΑ: [38.175, 20.489],
  ΚΑΡΠΑΘΟΣ: [35.507, 27.213],
  ΜΑΥΡΟΒΟΥΝΙΟ: [39.635, 22.42],
  ΠΟΛΙΧΝΗ: [40.666, 22.948],
  ΕΥΟΣΜΟΣ: [40.665, 22.908],
  ΝΕΑΠΟΛΗ: [40.645, 22.94],
  ΠΕΡΑΙΑ: [40.498, 22.926],
  ΚΑΛΑΜΑΡΙΑ: [40.582, 22.95],
  'ΑΓ. ΑΘΑΝΑΣΙΟΣ': [40.716, 23.033],
  'ΝΕΑ ΜΗΧΑΝΙΩΝΑ': [40.463, 22.866],
  'ΝΕΑ ΜΟΥΔΑΝΙΑ': [40.243, 23.284],
  ΜΑΡΟΥΣΙ: [38.051, 23.808],
  ΚΗΦΙΣΙΑ: [38.074, 23.811],
  ΧΑΛΑΝΔΡΙ: [38.022, 23.798],
  ΠΕΡΙΣΤΕΡΙ: [38.016, 23.692],
  ΖΩΓΡΑΦΟΥ: [37.975, 23.769],
  ΚΑΛΛΙΘΕΑ: [37.953, 23.702],
  'ΝΕΑ ΣΜΥΡΝΗ': [37.945, 23.714],
  ΜΑΡΠΗΣΣΗΣ: [38.041, 23.756],
  ΡΑΦΗΝΑ: [38.022, 24.006],
  ΛΑΥΡΙΟ: [37.714, 24.056],
  ΜΕΣΟΛΟΓΓΙ: [38.371, 21.428],
  ΤΡΙΚΑΛΑ: [39.555, 21.768],
  ΣΕΡΡΕΣ: [41.085, 23.548],
  ΚΑΒΑΛΑ: [40.939, 24.406],
  ΞΑΝΘΗ: [41.135, 24.888],
  ΚΟΜΟΤΗΝΗ: [41.122, 25.406],
  ΑΛΕΞΑΝΔΡΟΥΠΟΛΗ: [40.847, 25.874],
  ΛΑΜΙΑ: [38.899, 22.434],
  ΑΓΡΙΝΙΟ: [38.621, 21.408],
  ΡΕΘΥΜΝΟ: [35.366, 24.482],
  ΣΥΡΟΣ: [37.45, 24.917],
  ΜΥΚΟΝΟΣ: [37.446, 25.329],
  ΠΑΡΟΣ: [37.085, 25.148],
  ΝΑΞΟΣ: [37.103, 25.377],
  ΛΕΣΒΟΣ: [39.104, 26.555],
  ΜΥΤΙΛΗΝΗ: [39.104, 26.555],
  ΣΑΜΟΣ: [37.754, 26.978],
  ΖΑΚΥΝΘΟΣ: [37.787, 20.898],
  ΠΡΕΒΕΖΑ: [38.956, 20.751],
  ΑΡΤΑ: [39.16, 21.005],
  ΦΛΩΡΙΝΑ: [40.782, 21.41],
  ΚΑΣΤΟΡΙΑ: [40.521, 21.269],
  ΓΡΕΒΕΝΑ: [40.084, 21.427],
  ΚΑΡΠΕΝΗΣΙ: [38.912, 22.124],
  ΣΠΑΡΤΗ: [37.074, 22.43],
  ΤΡΙΠΟΛΗ: [37.509, 22.379],
  ΚΟΡΙΝΘΟΣ: [37.938, 22.932],
  ΑΡΓΟΣ: [37.633, 22.733],
  ΑΡΓΟΛΙΔΑ: [37.508, 22.858],
  ΛΕΥΚΑΔΑ: [38.833, 20.71],
  ΠΡΕΜΕΤΗ: [40.048, 21.559],
  ΟΡΕΣΤΙΑΔΑ: [41.503, 26.533],
  ΕΔΕΣΣΑ: [40.802, 22.047],
  ΓΙΑΝΝΙΤΣΑ: [40.791, 22.408],
  ΠΥΛΑΙΑ: [40.599, 23.001],
  ΠΑΝΟΡΑΜΑ: [40.587, 23.031],
  ΤΟΥΜΠΑ: [40.611, 22.97],
  ΑΜΠΕΛΟΚΗΠΟΙ: [40.655, 22.933],
  ΘΕΡΜΗ: [40.547, 23.019],
  ΧΑΛΚΙΔΙΚΗ: [40.316, 23.459],
  ΚΙΛΚΙΣ: [40.993, 22.874],
  ΠΤΟΛΕΜΑΪΔΑ: [40.514, 21.678],
  ΦΛΩΡΙΝΑΣ: [40.782, 21.41],
  ΑΧΑΪΑΣ: [38.246, 21.735],
  ΑΤΤΙΚΗΣ: [37.984, 23.728],
  ΚΥΚΛΑΔΩΝ: [37.1, 25.15],
  ΔΩΔΕΚΑΝΗΣΩΝ: [36.44, 28.22],
  ΜΑΚΕΔΟΝΙΑΣ: [40.64, 22.94],
  ΗΛΕΙΑΣ: [37.638, 21.44],
  ΜΑΓΝΗΣΙΑΣ: [39.361, 22.942],
  ΚΡΗΤΗΣ: [35.24, 24.81],
  ΣΥΚΙΕΣ: [40.649, 22.951],
  ΕΥΚΑΡΠΙΑ: [40.654, 22.908],
  ΚΑΤΕΡΙΝΗ: [40.272, 22.502],
  ΛΑΓΚΑΔΑΣ: [40.75, 23.067],
  ΠΑΛΛΗΝΗ: [40.28, 23.89],
  ΑΜΦΙΘΕΑ: [37.961, 23.734],
  ΑΧΑΡΝΩΝ: [38.02, 23.72],
  ΑΙΓΑΛΕΩ: [37.992, 23.678],
  ΗΛΙΟΥΠΟΛΗ: [37.968, 23.753],
  ΧΑΛΑΝΔΡΙ: [38.022, 23.798],
  'ΑΓΙΑ ΠΑΡΑΣΚΕΥΗ': [38.013, 23.82],
  ΖΕΦΥΡΙ: [38.058, 23.718],
  ΜΕΤΑΜΟΡΦΩΣΗ: [38.061, 23.756],
  ΡΑΦΗΝΑ: [38.022, 24.006],
  ΚΟΡΩΠΙ: [37.898, 23.875],
  ΜΑΡΑΘΩΝΑΣ: [38.154, 23.963],
  ΛΟΥΤΡΑΚΙ: [37.978, 22.977],
  ΝΑΥΠΛΙΟ: [37.567, 22.802],
  ΤΡΙΠΟΛΗ: [37.509, 22.379],
  ΚΟΡΙΝΘΟΣ: [37.938, 22.932],
  ΛΑΜΙΑ: [38.899, 22.434],
  ΒΟΛΟΣ: [39.361, 22.942],
  ΤΡΙΚΑΛΑ: [39.555, 21.768],
  ΚΑΡΔΙΤΣΑ: [39.364, 21.922],
  ΛΑΡΙΣΑ: [39.639, 22.419],
  ΣΕΡΡΕΣ: [41.085, 23.548],
  ΚΑΒΑΛΑ: [40.939, 24.406],
  ΞΑΝΘΗ: [41.135, 24.888],
  ΚΟΜΟΤΗΝΗ: [41.122, 25.406],
  ΑΛΕΞΑΝΔΡΟΥΠΟΛΗ: [40.847, 25.874],
  ΟΡΕΣΤΙΑΔΑ: [41.503, 26.533],
  ΕΔΕΣΣΑ: [40.802, 22.047],
  ΓΙΑΝΝΙΤΣΑ: [40.791, 22.408],
  ΚΙΛΚΙΣ: [40.993, 22.874],
  ΠΤΟΛΕΜΑΪΔΑ: [40.514, 21.678],
  ΦΛΩΡΙΝΑ: [40.782, 21.41],
  ΚΑΣΤΟΡΙΑ: [40.521, 21.269],
  ΙΩΑΝΝΙΝΑ: [39.665, 20.854],
  ΠΡΕΒΕΖΑ: [38.956, 20.751],
  ΑΡΤΑ: [39.16, 21.005],
  ΜΕΣΟΛΟΓΓΙ: [38.371, 21.428],
  ΑΓΡΙΝΙΟ: [38.621, 21.408],
  ΠΥΡΓΟΣ: [37.675, 21.441],
  ΣΠΑΡΤΗ: [37.074, 22.43],
  ΚΑΛΑΜΑΤΑ: [37.039, 22.114],
  ΧΑΝΙΑ: [35.514, 24.018],
  ΡΕΘΥΜΝΟ: [35.366, 24.482],
  ΗΡΑΚΛΕΙΟ: [35.339, 25.144],
  'ΑΓΙΟΣ ΝΙΚΟΛΑΟΣ': [35.191, 25.715],
  ΡΟΔΟΣ: [36.434, 28.218],
  ΚΩΣ: [36.893, 27.289],
  ΜΥΚΟΝΟΣ: [37.446, 25.329],
  ΣΑΝΤΟΡΙΝΗ: [36.393, 25.462],
  ΛΕΣΒΟΣ: [39.104, 26.555],
  ΧΙΟΣ: [38.368, 26.136],
  ΣΑΜΟΣ: [37.754, 26.978],
  ΚΕΡΚΥΡΑ: [39.624, 19.922],
  ΖΑΚΥΝΘΟΣ: [37.787, 20.898],
  ΛΕΥΚΑΔΑ: [38.833, 20.71],
  ΠΑΤΡΑ: [38.247, 21.735],
  ΑΧΑΪΑ: [38.247, 21.735],
  ΔΡΑΜΑ: [41.151, 24.148],
  ΒΕΡΟΙΑ: [40.521, 22.204],
  ΝΑΟΥΣΑ: [40.629, 22.068],
  ΚΟΖΑΝΗ: [40.301, 21.789],
  ΓΡΕΒΕΝΑ: [40.084, 21.427],
  ΚΑΡΠΕΝΗΣΙ: [38.912, 22.124],
  ΑΡΓΟΣ: [37.633, 22.733],
  ΝΑΥΠΛΙΟ: [37.567, 22.802],
  ΑΜΦΙΣΣΑ: [38.528, 22.372],
  ΛΙΒΑΔΕΙΑ: [38.433, 22.873],
  ΧΑΛΚΙΔΑ: [38.464, 23.6],
  ΘΗΒΑ: [38.32, 23.319],
  ΓΕΩΡΓΙΟΥΠΟΛΗ: [35.36, 24.26],
  ΛΕΥΚΟΓΕΙΑ: [35.35, 24.68],
  'ΓΕΩΡΓ. ΣΧΟΛΗ': [40.64, 22.94],
};

/** @type {Record<string, [number, number]>} */
const POSTAL_PREFIX = {
  '10': [37.984, 23.728],
  '11': [38.02, 23.75],
  '12': [37.99, 23.67],
  '13': [38.0, 23.73],
  '14': [37.94, 23.72],
  '15': [37.98, 23.73],
  '16': [38.0, 23.85],
  '17': [37.97, 23.63],
  '18': [37.94, 23.62],
  '19': [38.05, 23.55],
  '20': [37.94, 22.93],
  '21': [37.51, 22.38],
  '22': [37.07, 22.43],
  '23': [36.44, 28.22],
  '24': [37.04, 22.11],
  '25': [38.37, 21.43],
  '26': [38.25, 21.73],
  '27': [38.62, 21.41],
  '28': [38.17, 20.49],
  '29': [37.79, 20.9],
  '30': [38.9, 22.43],
  '31': [38.43, 22.87],
  '32': [38.53, 22.37],
  '33': [38.9, 22.43],
  '34': [38.91, 22.12],
  '35': [39.36, 21.92],
  '36': [39.55, 21.77],
  '37': [39.36, 22.94],
  '38': [39.64, 22.42],
  '39': [39.64, 22.42],
  '40': [39.67, 20.85],
  '41': [40.64, 22.94],
  '42': [40.52, 22.2],
  '43': [40.3, 21.79],
  '44': [40.78, 21.41],
  '45': [39.67, 20.85],
  '46': [39.36, 21.92],
  '47': [40.99, 22.87],
  '48': [39.1, 26.56],
  '49': [39.62, 19.92],
  '50': [40.52, 21.27],
  '51': [40.8, 22.05],
  '52': [40.52, 21.27],
  '53': [41.09, 23.55],
  '54': [40.64, 22.94],
  '55': [40.58, 22.95],
  '56': [40.66, 22.95],
  '57': [40.52, 22.98],
  '58': [40.27, 22.5],
  '59': [40.52, 22.2],
  '60': [40.27, 22.5],
  '61': [40.27, 22.5],
  '62': [40.24, 23.28],
  '63': [40.28, 23.89],
  '64': [41.12, 25.41],
  '65': [41.09, 24.41],
  '66': [41.15, 24.15],
  '67': [40.85, 25.87],
  '68': [41.5, 26.53],
  '69': [40.94, 24.41],
  '70': [35.34, 25.14],
  '71': [35.19, 25.72],
  '72': [35.51, 24.02],
  '73': [35.37, 24.48],
  '74': [35.37, 24.48],
  '80': [37.94, 23.62],
  '81': [37.1, 25.38],
  '82': [37.09, 25.15],
  '83': [36.89, 27.29],
  '84': [37.1, 25.38],
  '85': [36.44, 28.22],
  '90': [37.45, 24.92],
};

/** @param {string} id */
function hashOffset(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const lat = ((h & 0xff) / 255 - 0.5) * 0.012;
  const lng = (((h >> 8) & 0xff) / 255 - 0.5) * 0.012;
  return { lat, lng };
}

/** @param {string} address */
function inferFromPostal(address) {
  const compact = address.replace(/\s+/g, '');
  const match = compact.match(/(\d{5})/);
  if (!match) return null;
  const base = POSTAL_PREFIX[match[1].slice(0, 2)];
  if (!base) return null;
  return { lat: base[0], lng: base[1] };
}

/** @param {string} address @param {string} id */
function inferCoords(address, id) {
  const upper = address.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '');
  let best = '';
  let coords = null;
  for (const [place, [lat, lng]] of Object.entries(PLACE_COORDS)) {
    const norm = place.normalize('NFD').replace(/\p{M}/gu, '');
    if (upper.includes(norm) && place.length > best.length) {
      best = place;
      coords = { lat, lng };
    }
  }
  if (!coords) coords = inferFromPostal(address);
  if (!coords) return null;
  const off = hashOffset(id);
  return { lat: coords.lat + off.lat, lng: coords.lng + off.lng };
}

/** @param {Record<string, string>} row */
function geocodeQuery(row) {
  const parts = [row.address, row.name].filter(Boolean);
  return `${parts.join(', ')}, Greece`;
}

const rows = readCsv(join(dataDir, 'suppliers.csv'));
/** @type {Record<string, { lat: number, lng: number }>} */
let cache = readJson(cachePath);

if (geocode) {
  let added = 0;
  for (const row of rows) {
    const id = row.id;
    if (!id) continue;
    if (row.lat?.trim() && row.lng?.trim()) {
      cache[id] = { lat: Number(row.lat), lng: Number(row.lng) };
      continue;
    }
    if (cache[id]) continue;

    const query = geocodeQuery(row);
    process.stdout.write(`Geocoding ${id}… `);
    try {
      const hit = await nominatim(query);
      if (hit) {
        cache[id] = hit;
        added++;
        console.log(`${hit.lat}, ${hit.lng}`);
      } else {
        console.log('not found');
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
    }
    await sleep(1100);
  }
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  console.log(`Geocode cache updated (${added} new, ${Object.keys(cache).length} total)`);
}

/** @param {string} raw */
function parseLocales(raw) {
  if (!raw?.trim()) return ['el', 'en'];
  return raw
    .split('|')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const suppliers = rows.map((row) => {
  const hasCsvCoords = Boolean(row.lat?.trim() && row.lng?.trim());
  const lat = Number(row.lat);
  const lng = Number(row.lng);
  const fromCsv =
    hasCsvCoords && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  const fromCache = cache[row.id] ?? null;
  const inferred = inferCoords(row.address || '', row.id || '');
  const coords = fromCsv ?? fromCache ?? inferred;

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone || '',
    description: row.description || '',
    locales: parseLocales(row.locales),
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'suppliers.json'), JSON.stringify(suppliers, null, 2) + '\n');

const mapped = suppliers.filter((s) => s.lat != null && s.lng != null).length;
console.log(`Wrote ${suppliers.length} suppliers (${mapped} with map coordinates)`);

if (!geocode && mapped < suppliers.length) {
  console.log('Run with --geocode to fill missing coordinates via OpenStreetMap Nominatim.');
}
