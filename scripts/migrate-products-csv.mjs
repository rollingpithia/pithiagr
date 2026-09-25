#!/usr/bin/env node
/**
 * One-time migration: products.csv (legacy) → data/*.csv
 * Run: node scripts/migrate-products-csv.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const legacyPath = join(root, 'products.csv');
const dataDir = join(root, 'data');

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

function readCsv(path) {
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim();
  const lines = text.split('\n');
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    /** @type {Record<string, string>} */
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').trim();
    });
    return row;
  });
}

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function writeCsv(path, headers, rows) {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h] ?? '')).join(',')),
  ];
  writeFileSync(path, lines.join('\n') + '\n', 'utf8');
}

/** @param {Record<string, string>} row */
function mapCatalogue(row) {
  const cat = row.category;
  const sub = row.subcategory;

  if (cat === 'Rolling Papers') return { catalogue_slug: 'rolling-papers', subcategory_slug: '' };
  if (cat === 'Rolling Filters') return { catalogue_slug: 'filters', subcategory_slug: '' };
  if (cat === 'Tobacco Cases & Wallets') {
    if (sub === 'Πορτοφόλια') return { catalogue_slug: 'wallets', subcategory_slug: 'wallets' };
    if (sub === 'Καπνοθήκες με Σχέδιο') return { catalogue_slug: 'tobacco-pouches', subcategory_slug: 'patterned' };
    if (sub === 'Χρωματιστές Καπνοθήκες') return { catalogue_slug: 'tobacco-pouches', subcategory_slug: 'coloured' };
  }
  if (cat === 'Headshop') {
    if (sub === 'Grinders') return { catalogue_slug: 'grinders', subcategory_slug: 'grinders' };
    if (sub === 'Bongs') return { catalogue_slug: 'pipes', subcategory_slug: 'bongs' };
    if (sub === 'Δίσκοι Στριψίματος') return { catalogue_slug: 'rolling-trays', subcategory_slug: 'rolling-trays' };
  }
  return { catalogue_slug: '', subcategory_slug: '' };
}

/** @param {string} brand */
function mapLine(brand, catalogueSlug) {
  if (catalogueSlug !== 'rolling-papers' && catalogueSlug !== 'filters') return '';
  const b = brand.toLowerCase();
  if (b === 'fysis' || b === 'physis') return 'physis';
  if (b === 'pithia') return 'classic';
  return '';
}

/** @param {Record<string, string>} row */
function buildSpecs(row) {
  /** @type {string[]} */
  const parts = [];
  const fixed = [
    ['package', row.package],
    ['count_per_unit', row.count_per_unit],
    ['size', row.size],
    ['thickness', row.thickness],
    ['weight_gsm', row.weight_gsm],
    ['material', row.material],
    ['color', row.color],
  ];
  for (const [key, val] of fixed) {
    if (val?.trim()) parts.push(`${key}=${val.trim()}`);
  }
  if (row.other_specs?.trim()) {
    const chunks = row.other_specs.split(';').map((s) => s.trim()).filter(Boolean);
    for (const chunk of chunks) {
      const colon = chunk.indexOf(':');
      if (colon > 0) {
        const label = chunk.slice(0, colon).trim();
        const value = chunk.slice(colon + 1).trim();
        const keyMap = {
          'Καύση': 'burn',
          'Υδατογράφημα': 'watermark',
          'Πρώτη Ύλη': 'material',
          'Ενεργού Άνθρακα': 'activated_carbon',
        };
        const key = keyMap[label] ?? label.toLowerCase().replace(/\s+/g, '_');
        if (value && !value.includes('Social Media') && !value.includes('Copyright')) {
          parts.push(`${key}=${value}`);
        }
      } else if (!chunk.includes('Copyright') && !chunk.includes('Social Media')) {
        parts.push(`note=${chunk}`);
      }
    }
  }
  return parts.join('|');
}

/** @param {string} images */
function normalizeImages(images) {
  return images
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('|');
}

const legacy = readCsv(legacyPath);
mkdirSync(dataDir, { recursive: true });

writeCsv(join(dataDir, 'categories.csv'), ['slug', 'featured', 'lines', 'sort_order'], [
  { slug: 'rolling-papers', featured: 'true', lines: 'classic|physis', sort_order: '1' },
  { slug: 'filters', featured: 'true', lines: 'classic|physis', sort_order: '2' },
  { slug: 'tobacco-pouches', featured: 'false', lines: '', sort_order: '3' },
  { slug: 'wallets', featured: 'false', lines: '', sort_order: '4' },
  { slug: 'grinders', featured: 'false', lines: '', sort_order: '5' },
  { slug: 'pipes', featured: 'false', lines: '', sort_order: '6' },
]);

writeCsv(join(dataDir, 'subcategories.csv'), ['slug', 'catalogue_slug', 'sort_order'], [
  { slug: 'patterned', catalogue_slug: 'tobacco-pouches', sort_order: '1' },
  { slug: 'coloured', catalogue_slug: 'tobacco-pouches', sort_order: '2' },
  { slug: 'wallets', catalogue_slug: 'wallets', sort_order: '1' },
  { slug: 'grinders', catalogue_slug: 'grinders', sort_order: '1' },
  { slug: 'bongs', catalogue_slug: 'pipes', sort_order: '1' },
]);

const productHeaders = [
  'id',
  'catalogue_slug',
  'line',
  'subcategory_slug',
  'name_el',
  'name_en',
  'description_el',
  'description_en',
  'images',
  'specs',
  'active',
  'sort_order',
];

/** @type {Record<string, string>[]} */
const products = legacy.map((row, index) => {
  const { catalogue_slug, subcategory_slug } = mapCatalogue(row);
  const inactive = catalogue_slug === 'rolling-trays';
  return {
    id: row.id,
    catalogue_slug: catalogue_slug || 'rolling-trays',
    line: mapLine(row.brand, catalogue_slug),
    subcategory_slug: subcategory_slug || (inactive ? 'rolling-trays' : ''),
    name_el: row.name_el,
    name_en: '',
    description_el: '',
    description_en: '',
    images: normalizeImages(row.images),
    specs: buildSpecs(row),
    active: inactive ? 'false' : 'true',
    sort_order: String((index + 1) * 10),
  };
});

writeCsv(join(dataDir, 'products.csv'), productHeaders, products);

const missing = products.filter((p) => !p.catalogue_slug);
console.log(`Migrated ${products.length} products → data/`);
if (missing.length) {
  console.warn(`Warning: ${missing.length} rows could not be mapped to a catalogue_slug`);
}
