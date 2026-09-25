#!/usr/bin/env node
/**
 * Builds src/lib/data/{catalogue,products}.json from data/*.csv
 * Run: node scripts/products-to-json.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'data');
const outDir = join(root, 'src/lib/data');

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
  return lines.slice(1).map((line) => {
    if (!line.trim()) return null;
    const values = parseCsvLine(line);
    /** @type {Record<string, string>} */
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').trim();
    });
    return row;
  }).filter(Boolean);
}

/** @param {string} raw */
function parseSpecs(raw) {
  if (!raw?.trim()) return [];
  return raw
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf('=');
      if (eq <= 0) return { key: part, value: '' };
      return {
        key: part.slice(0, eq).trim(),
        value: part.slice(eq + 1).trim(),
      };
    })
    .filter((s) => s.key && s.value);
}

/** @param {string} raw */
function parseLines(raw) {
  if (!raw?.trim()) return [];
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}

/** @param {string} v */
function asBool(v) {
  return v.toLowerCase() === 'true' || v === '1' || v.toLowerCase() === 'yes';
}

const categories = readCsv(join(dataDir, 'categories.csv')).map((row) => ({
  slug: row.slug,
  featured: asBool(row.featured),
  lines: parseLines(row.lines),
  sortOrder: Number(row.sort_order) || 0,
}));

const subcategories = readCsv(join(dataDir, 'subcategories.csv')).map((row) => ({
  slug: row.slug,
  catalogueSlug: row.catalogue_slug,
  sortOrder: Number(row.sort_order) || 0,
}));

const products = readCsv(join(dataDir, 'products.csv'))
  .filter((row) => asBool(row.active ?? 'true'))
  .map((row) => ({
    id: row.id,
    catalogueSlug: row.catalogue_slug,
    line: row.line || '',
    subcategorySlug: row.subcategory_slug || '',
    nameEl: row.name_el,
    nameEn: row.name_en || '',
    descriptionEl: row.description_el || '',
    descriptionEn: row.description_en || '',
    images: row.images
      ? row.images.split('|').map((s) => s.trim()).filter(Boolean)
      : [],
    specs: parseSpecs(row.specs),
    sortOrder: Number(row.sort_order) || 0,
  }))
  .sort((a, b) => a.sortOrder - b.sortOrder);

const categorySlugs = new Set(categories.map((c) => c.slug));
const errors = [];
const allRows = readCsv(join(dataDir, 'products.csv'));

for (const row of allRows) {
  if (!asBool(row.active ?? 'true')) continue;
  if (!row.catalogue_slug) {
    errors.push(`Product ${row.id}: missing catalogue_slug`);
    continue;
  }
  if (!categorySlugs.has(row.catalogue_slug)) {
    errors.push(`Product ${row.id}: unknown catalogue_slug "${row.catalogue_slug}"`);
  }
}

if (errors.length) {
  console.error('CSV validation errors:\n' + errors.slice(0, 20).join('\n'));
  if (errors.length > 20) console.error(`... and ${errors.length - 20} more`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'catalogue.json'), JSON.stringify({ categories, subcategories }, null, 2) + '\n');
writeFileSync(join(outDir, 'products.json'), JSON.stringify(products, null, 2) + '\n');
console.log(`Wrote ${categories.length} categories, ${subcategories.length} subcategories, ${products.length} products`);
