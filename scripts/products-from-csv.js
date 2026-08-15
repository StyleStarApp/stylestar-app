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
import crypto from 'crypto';

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

// ---- join the split export -------------------------------------------------
// ▶ THE CATALOG ARRIVES IN PIECES NOW, PERMANENTLY (2026-08-15, from Cowork):
// it can upload small files to Drive reliably but not large ones, so the export
// is split into numbered parts plus a MANIFEST. Point this script at the
// manifest (or at the folder holding it) and it rebuilds the whole file first.
// A single CSV path still works exactly as before.
//
// ▶ VALIDATION IS THE POINT HERE TOO, and more so: a PARTIAL catalog is far
// more dangerous than a malformed one, because it converts perfectly and simply
// loses products. Nothing downstream would notice. So the manifest's own row
// count and md5 are checked before a single row is parsed, and any failure
// stops the run without touching products.json.
// ⚠️ Read the expected values FROM THE MANIFEST, never hardcode them — the
// counts change with every export, which is the whole reason the manifest ships.
function readManifest(mPath) {
  const raw = fs.readFileSync(mPath, 'utf8');
  const val = key => {
    // ⚠️ Tolerate backslash-escaped underscores: some tools hand this file back
    // markdown-escaped ("total\_data\_rows"). Forgiving on the KEY format only;
    // the VALUES are still matched strictly.
    const re = new RegExp('^\\s*' + key.replace(/_/g, '\\\\?_') + '\\s*:\\s*(.+?)\\s*$', 'im');
    const m = raw.match(re);
    return m ? m[1].replace(/\s+$/, '') : null;
  };
  return {
    parts: val('parts'), order: val('order'),
    rows: val('total_data_rows'), md5: val('md5_of_joined_file'),
    columns: val('columns'), endings: val('line_endings')
  };
}
function joinParts(mPath) {
  const dir = path.dirname(mPath);
  const man = readManifest(mPath);
  const die = msg => { console.error('FATAL (catalog join): ' + msg + '\n  manifest: ' + mPath + '\n  NOTHING was written; products.json is untouched.'); process.exit(1); };

  if (!man.order) die('the manifest has no "order:" line, so the part order is unknown.');
  if (!man.md5) die('the manifest has no "md5_of_joined_file:" line. Refusing to join without a checksum.');
  if (!man.rows) die('the manifest has no "total_data_rows:" line. Refusing to join without a row count.');
  const names = man.order.split(',').map(s => s.trim()).filter(Boolean);
  if (man.parts && Number(man.parts) !== names.length) {
    die(`the manifest says ${man.parts} parts but "order:" lists ${names.length}.`);
  }
  const missing = names.filter(n => !fs.existsSync(path.join(dir, n)));
  if (missing.length) die('these parts are named in the manifest but not on disk:\n    ' + missing.join('\n    '));

  // Concatenate as BUFFERS, byte for byte, nothing between — the md5 in the
  // manifest is of the exact bytes, so any re-encoding here would break it.
  const bufs = names.map(n => fs.readFileSync(path.join(dir, n)));
  // ⚠️ THE FAILURE MODE WORTH NAMING: if a part does not end in a newline, a
  // byte-for-byte join silently GLUES its last row onto the next part's first
  // row. The md5 would catch it, but only as a number mismatch — this says what
  // actually went wrong, which is what makes it fixable.
  bufs.forEach((b, i) => {
    if (i < bufs.length - 1 && b.length && b[b.length - 1] !== 0x0a) {
      die(`part "${names[i]}" does not end with a newline, so joining it would glue its last row onto the first row of "${names[i + 1]}".`);
    }
  });
  const joined = Buffer.concat(bufs);

  const md5 = crypto.createHash('md5').update(joined).digest('hex');
  const text = joined.toString('utf8');
  // Count DATA rows the same way the manifest does: lines minus the header,
  // ignoring a trailing newline. Counted on the raw text, before parsing, so a
  // parse bug cannot mask a short file.
  const lines = text.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const dataRows = lines.length - 1;

  if (String(dataRows) !== String(man.rows)) {
    die(`row count mismatch — the manifest expects ${man.rows} data rows, the joined file has ${dataRows}. This is a PARTIAL catalog; it would convert cleanly and quietly lose products.`);
  }
  if (md5.toLowerCase() !== String(man.md5).toLowerCase()) {
    die(`md5 mismatch — the manifest expects ${man.md5}, the joined file is ${md5}. The parts are the wrong versions, out of order, or one is stale.`);
  }
  // Cheap sanity checks the manifest also states, worth failing on.
  if (man.endings && /LF/i.test(man.endings) && /\r/.test(text)) {
    die('the manifest says LF line endings but the joined file contains CR bytes.');
  }
  if (/^\s*id\s*,/i.test(lines[1] || '')) {
    die('the second line looks like another header row — part 2 appears to carry its own header. The manifest says the header is in part 1 ONLY.');
  }
  console.log(`joined ${names.length} parts → ${dataRows} data rows, md5 ${md5} ✓`);
  return joined;
}

// The argument may be a single CSV (as before), a manifest, or a folder holding
// one. Resolving it here keeps every caller and every test on one code path.
let csvText;
let joinedFrom = null;
{
  const st = fs.existsSync(csvPath) ? fs.statSync(csvPath) : null;
  if (!st) { console.error('FATAL: no such file or folder: ' + csvPath); process.exit(1); }
  let manifestPath = null;
  if (st.isDirectory()) {
    const hit = fs.readdirSync(csvPath).find(f => /MANIFEST.*\.txt$/i.test(f));
    if (!hit) { console.error('FATAL: no MANIFEST .txt found in ' + csvPath); process.exit(1); }
    manifestPath = path.join(csvPath, hit);
  } else if (/MANIFEST.*\.txt$/i.test(path.basename(csvPath))) {
    manifestPath = csvPath;
  }
  if (manifestPath) {
    const joined = joinParts(manifestPath);
    csvText = joined.toString('utf8');
    joinedFrom = manifestPath;
    // Write the rebuilt catalog to the canonical path so the repo keeps ONE
    // readable, diffable CSV — which is what makes a silent reword visible.
    const canon = path.join(ROOT, 'data', 'style-star-products.csv');
    fs.writeFileSync(canon, joined);
    console.log('wrote ' + path.relative(ROOT, canon));
  } else {
    csvText = fs.readFileSync(csvPath, 'utf8');
  }
}

// ---- validate --------------------------------------------------------------
const rows = parseCsv(csvText);
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

// ▶ HER STANDING BRAND RULE, CHECKED ON THE WAY IN (2026-08-15): the app never
// names a woman's body. "Everyone always wants outfits that make them look
// slimmer" is the most common thing her clients ask, and her explicit boundary
// is that Style Star serves flattering fits silently and never says so.
// ▶ WHY A WARNING AND NOT A FAILURE: these are HER notes, written by her, and a
// false positive must never block a whole catalog. But the spreadsheet lives in
// another tool, so a phrase deleted here comes BACK on the next export — which
// happened within the hour on 2026-08-15, to this exact row. Naming it on every
// run is what makes that visible instead of silent.
// ⚠️ The fix for anything listed here is in the COWORK SHEET, not in this repo.
const BODY_TALK = /\b(waist-small|hip-full|slimming|slims you|flatter(s|ing)? (your|the) (figure|body|shape|tummy|hips|thighs)|hides? (your )?(tummy|belly)|minimi[sz]es? (your )?(hips|bust|tummy)|problem area)/i;
const bodyTalk = products.filter(p => BODY_TALK.test(p.note || ''));
if (bodyTalk.length) {
  console.warn(`\n⚠️  ${bodyTalk.length} note${bodyTalk.length > 1 ? 's' : ''} name a body, against her standing rule. Fix these in the Cowork sheet or they return on the next export:`);
  bodyTalk.forEach(p => console.warn(`     ${p.id} ${p.brand} — ${p.name}\n       "${p.note}"`));
}

const out = { products: products };
fs.writeFileSync(path.join(ROOT, 'products.json'), JSON.stringify(out, null, 1) + '\n');
const slots = {};
products.forEach(p => slots[p.slot] = (slots[p.slot] || 0) + 1);
console.log(`OK — ${products.length} products → products.json  (${Object.entries(slots).map(([s, n]) => s + ':' + n).join('  ')})`);
