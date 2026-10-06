#!/usr/bin/env node
/* What's Trending photos, built ONCE A WEEK so every woman sees them instantly.
   Cath's ask, 2026-10-06: open the page and see full visuals, no 5-8s wait.

   For each trend card in index.html (#wdrTrendBody .ttf) this asks the LIVE
   finder for the same request a tap sends ({item:<trend name>}), in LEAN mode:
   one search, no look-ups (~23 searches a week). Her nightly feed is searched
   beside Google for free, so her paying shops appear when they genuinely have
   the piece, and only then — her "case by case".

   ⚠️ AMAZON IS NOT STORED HERE, ON PURPOSE. Amazon's terms limit how long its
     product data may be kept, so the page fetches Amazon live (free) and seats
     it into the row at runtime, exactly as every other finder row does.
   ⚠️ PRICES ARE DROPPED. A week-old price can be wrong in the dearer direction,
     and her rule is that a woman never arrives to find a piece dearer than the
     card said. The card shows the piece and the shop; the shop shows the price.
   ⚠️ PHOTOS ARE LINKS to the shops' own images, never copies on our server.

   Usage: node scripts/trend-photos.js            (writes data/trend-photos.json)
          node scripts/trend-photos.js --dry      (prints counts only) */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'trend-photos.json');
const BASE = process.env.SITE || 'https://stylestar.app';
const DRY = process.argv.includes('--dry');
const PAUSE_MS = 9000;          // product-find allows 8 requests a minute per IP
const KEEP = 24;                // plenty for a swipe row; keeps the file small

function trendNames() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const a = html.indexOf('id="wdrTrendBody"');
  if (a < 0) throw new Error('wdrTrendBody not found in index.html');
  const b = html.indexOf('</div>\n</div>', a);
  const slice = html.slice(a, b > a ? b : a + 20000);
  const out = [];
  const re = /<div class="ttf">([^<]+)<\/div>/g;
  let m;
  while ((m = re.exec(slice))) {
    out.push(m[1].replace(/&amp;/g, '&').replace(/&rsquo;/g, '’').trim());
  }
  return out;
}

/* `name`/`search` stay because filterNeverWear() on the page reads them, so her
   never-wear list governs this row too. `url` is kept ONLY for a feed piece:
   a Google result's url points at google.com, and the page knows that. */
const slim = (p) => ({
  id: p.id, title: p.title, name: p.name || p.title, search: p.search || p.title,
  brand: p.brand || '', store: p.store, image: p.image,
  ...(p.feed ? {feed: true, url: p.url} : {}),
});

async function findOne(item) {
  const r = await fetch(BASE + '/.netlify/functions/product-find', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Origin: BASE, Referer: BASE + '/trending'},
    body: JSON.stringify({item, lean: true}),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

await (async () => {
  const names = trendNames();
  console.log('trends found:', names.length);
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {trends: {}};
  const trends = {};
  let fresh = 0, kept = 0;
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    let row = null;
    try {
      const d = await findOne(n);
      if (d && !d.why) {
        const pool = [].concat(d.exact || [], ...(d.doors || []).map(x => x.products || []), d.browse || []);
        const items = pool.filter(p => p && p.image && p.store && p.title).slice(0, KEEP).map(slim);
        if (items.length) row = {items, at: new Date().toISOString()};
      } else console.log('  ', n, '->', d && d.why);
    } catch (e) { console.log('  ', n, '-> failed', e.message); }
    /* a failed week keeps LAST week's photos rather than emptying the card */
    if (row) { trends[n] = row; fresh++; }
    else if (prev.trends && prev.trends[n]) { trends[n] = prev.trends[n]; kept++; }
    console.log(String(i + 1).padStart(2), n, row ? row.items.length + ' photos' : '(kept last week)');
    if (i < names.length - 1) await new Promise(r => setTimeout(r, PAUSE_MS));
  }
  const out = {generated: new Date().toISOString(), trends};
  console.log(`fresh ${fresh}, kept ${kept}, empty ${names.length - fresh - kept}`);
  if (!DRY) fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
})();
