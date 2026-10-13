// finds-photo-check.js — asks Amazon (through the app's own live amazon-images
// function, the sanctioned Creators API route) which Finds pieces it will give a
// photo for, and writes the ones it will NOT to data/amazon-finds-nophoto.json.
//
//   node scripts/finds-photo-check.js            # report only
//   node scripts/finds-photo-check.js --write    # update the file, then re-run the importer
//
// ▶ WHY (her rule, 2026-10-13): "the ones that don't have pics I don't want them in
//   one of the first 8." The importer reads this file and seats those pieces after
//   the first 8 of their section. A piece that loses its photo later still shows
//   the tan square in place until this is re-run -- nothing breaks, it just sits
//   higher than she wants.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from './finds-from-csv.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data/amazon-finds-nophoto.json');
const rows = load(path.join(ROOT, 'data/amazon-finds.csv'));
const got = new Set();
for (let i = 0; i < rows.length; i += 10) {
  const chunk = rows.slice(i, i + 10).map(r => r.asin);
  const r = await fetch('https://stylestar.app/.netlify/functions/amazon-images?asins=' + chunk.join(','),
    { headers: { Referer: 'https://stylestar.app/finds' } });
  const j = await r.json().catch(() => ({}));
  if (j.why === 'unconfigured' || !r.ok) { console.error('✗ the photo service did not answer properly — nothing written'); process.exit(1); }
  Object.keys(j.images || {}).forEach(a => got.add(a));
  await new Promise(res => setTimeout(res, 1200));
}
const none = rows.filter(r => !got.has(r.asin)).map(r => ({ asin: r.asin, name: r.name }));
console.log(`photos for ${got.size} of ${rows.length}; none for:`);
none.forEach(n => console.log('  - ' + n.name + '  (' + n.asin + ')'));
if (process.argv.includes('--write')) {
  fs.writeFileSync(OUT, JSON.stringify({ checked: new Date().toISOString().slice(0, 10), none }, null, 2) + '\n');
  console.log('✓ written ' + path.relative(ROOT, OUT) + ' — now run: node scripts/finds-from-csv.js data/amazon-finds.csv --write');
}
