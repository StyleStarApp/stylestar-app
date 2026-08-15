#!/usr/bin/env node
// products-from-csv.js — turns a CSV export of the curated-catalog
// spreadsheet's Products tab into products.json at the repo root.
//
//   node scripts/products-from-csv.js path/to/style-star-products.csv
//
// ▶ VALIDATION IS THE POINT. The spreadsheet's own dropdown validations have
// already been observed eroding (14 → 7 → 0 across ordinary saves), so the
// real enforcement lives HERE, not in Excel. Every bad row fails the whole
// convert, loudly, with its CSV line number. Do not make this forgiving.
//
// ▶ The valid slot ids and store keys are parsed out of index.html AT CONVERT
// TIME — one source of truth, so a store rename or a checklist change can
// never quietly drift apart from this script (the Bloomingdale's-apostrophe
// class of bug is exactly what this catches).

// package.json carries "type":"module", so this is ESM.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/products-from-csv.js <export.csv>');
  process.exit(1);
}

const FAMILIES = ['Classic', 'Minimal', 'Natural', 'Sporty', 'Professional', 'Romantic', 'Glam', 'Bold', 'Edgy'];
const BANDS = ['$', '$$', '$$$', '$$$$'];
// ▶ `width` was added to the spreadsheet 2026-08-15 (shoe widths). It sits LAST,
// after `active`, which is where her export puts it -- the header check is
// order-exact, so this list must match the export column for column.
// ⚠️ It is deliberately NOT validated against a fixed vocabulary. The handoff
// described values like N/S/M/W/WW/WWW; the real export writes words instead
// ("medium", "narrow, medium, wide"), so a letter-code whitelist would have
// failed every shoe row. Carried through verbatim, split on commas like
// `colors` because it is genuinely multi-valued. Nothing filters on it yet.
const HEADER = ['id', 'slot', 'name', 'brand', 'retailer', 'url', 'price', 'band',
  'family1', 'family2', 'family3', 'family4', 'sizes', 'petite', 'tall', 'plus',
  'colors', 'attr1', 'attr2', 'pattern', 'note', 'checked', 'active', 'width'];

// Tracking/affiliate params that must never appear in a catalog URL. This is
// the app's own conservative list (_wlCleanUrl) plus the affiliate-network
// click ids — deliberately NOT a "strip anything unknown" rule, because params
// like Bloomingdale's ?ID=, Gap's pid= and Madewell's ?ccode= are load-bearing.
const TRACKING_PARAMS = /^(utm_.*|fbclid|gclid|srsltid|mc_cid|mc_eid|cjevent|clickid|irclickid|irgwc|ranmid|raneaid|ransiteid|affid|afid|aff_id|tag|ascsubtag|linkcode|cm_kws|cm_kws_ac|cm_mmc|siteid|u1|subid)$/i;

// ---- pull the app's own truth out of index.html ---------------------------
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const wiMatch = html.match(/const wardrobeItems=\[([\s\S]*?)\n\];/);
if (!wiMatch) { console.error('FATAL: could not find wardrobeItems in index.html'); process.exit(1); }
const VALID_SLOTS = new Set([...wiMatch[1].matchAll(/id:'([a-z0-9]+)'/g)].map(m => m[1]));

const stMatch = html.match(/const STORES=\{([\s\S]*?)\n\};/);
if (!stMatch) { console.error('FATAL: could not find STORES in index.html'); process.exit(1); }
const VALID_STORES = new Set(
  [...stMatch[1].matchAll(/^\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*:/gm)]
    .map(m => (m[1] !== undefined ? m[1] : m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"'))
);
if (VALID_SLOTS.size < 50 || VALID_STORES.size < 50) {
  console.error(`FATAL: index.html parse looks wrong (slots=${VALID_SLOTS.size}, stores=${VALID_STORES.size})`);
  process.exit(1);
}

// ---- minimal RFC-4180 CSV parser ------------------------------------------
function parseCsv(text) {
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ---- validate --------------------------------------------------------------
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const errors = [];
const fail = (line, msg) => errors.push(`row ${line}: ${msg}`);

const header = rows[0].map(h => h.trim());
if (header.join(',') !== HEADER.join(',')) {
  console.error('FATAL: header mismatch.\n  expected: ' + HEADER.join(',') + '\n  got:      ' + header.join(','));
  process.exit(1);
}

const seenIds = new Set();
const products = [];
for (let r = 1; r < rows.length; r++) {
  const line = r + 1; // 1-based CSV line number, header is line 1
  const cells = rows[r];
  if (cells.length !== HEADER.length) { fail(line, `has ${cells.length} columns, expected ${HEADER.length}`); continue; }
  const o = {};
  HEADER.forEach((h, i) => o[h] = cells[i].trim());

  if (!o.id) fail(line, 'empty id');
  else if (seenIds.has(o.id)) fail(line, `duplicate id "${o.id}"`);
  seenIds.add(o.id);

  if (!VALID_SLOTS.has(o.slot)) fail(line, `slot "${o.slot}" is not a wardrobeItems id`);
  if (!o.name) fail(line, 'empty name');
  if (!o.brand) fail(line, 'empty brand');
  if (!VALID_STORES.has(o.retailer)) fail(line, `retailer "${o.retailer}" is not a key in STORES (check spelling exactly — e.g. "Bloomingdales", no apostrophe)`);

  // url: https, on a real host, no tracking/affiliate params
  let u = null;
  try { u = new URL(o.url); } catch (e) { fail(line, `url does not parse: "${o.url}"`); }
  if (u) {
    if (u.protocol !== 'https:') fail(line, `url is not https: "${o.url}"`);
    for (const [k] of u.searchParams) {
      if (TRACKING_PARAMS.test(k)) fail(line, `url carries tracking/affiliate param "${k}" — links must be bare`);
    }
  }

  const price = Number(o.price);
  if (!o.price || !isFinite(price) || price <= 0) fail(line, `price "${o.price}" is not a positive number`);
  if (!BANDS.includes(o.band)) fail(line, `band "${o.band}" is not one of ${BANDS.join(' ')}`);

  const families = [o.family1, o.family2, o.family3, o.family4].filter(Boolean);
  if (!families.length) fail(line, 'no family tags at all — every product carries at least one');
  families.forEach(f => { if (!FAMILIES.includes(f)) fail(line, `family "${f}" is not one of the nine (${FAMILIES.join(', ')})`); });
  if (new Set(families).size !== families.length) fail(line, 'duplicate family tag');

  ['petite', 'tall', 'plus'].forEach(k => {
    if (o[k] && !/^(yes|no)$/i.test(o[k])) fail(line, `${k} must be yes/no/empty, got "${o[k]}"`);
  });
  if (o.active && !/^(yes|no)$/i.test(o.active)) fail(line, `active must be yes/no, got "${o.active}"`);
  if (!o.note) fail(line, 'empty note — every product carries Catherine\'s note');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.checked)) fail(line, `checked "${o.checked}" is not a YYYY-MM-DD date`);

  products.push({
    id: o.id, slot: o.slot, name: o.name, brand: o.brand, retailer: o.retailer,
    url: o.url, price: price, band: o.band, families: families,
    sizes: o.sizes,
    petite: /^yes$/i.test(o.petite), tall: /^yes$/i.test(o.tall), plus: /^yes$/i.test(o.plus),
    colors: o.colors ? o.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
    widths: o.width ? o.width.split(',').map(s => s.trim()).filter(Boolean) : [],
    attrs: [o.attr1, o.attr2].filter(Boolean),
    pattern: o.pattern || '',
    note: o.note, checked: o.checked,
    active: !/^no$/i.test(o.active) // empty defaults to active
  });
}

if (errors.length) {
  console.error(`CONVERT FAILED — ${errors.length} problem${errors.length > 1 ? 's' : ''}:\n` + errors.map(e => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

const out = { products: products };
fs.writeFileSync(path.join(ROOT, 'products.json'), JSON.stringify(out, null, 1) + '\n');
const slots = {};
products.forEach(p => slots[p.slot] = (slots[p.slot] || 0) + 1);
console.log(`OK — ${products.length} products → products.json  (${Object.entries(slots).map(([s, n]) => s + ':' + n).join('  ')})`);
