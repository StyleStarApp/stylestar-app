#!/usr/bin/env node
// LIVE end-to-end runner for the finder. Not part of the app; a bench for Cath.
//
//   SERPAPI_KEY=... node scratchpad/findlive.js --item dress --colour blush --fabric silk --cut wrap
//   SERPAPI_KEY=... node scratchpad/findlive.js --item boot --colour red --fabric leather --size 6 --width wide
//
// ⚠️ IT SPENDS REAL SEARCHES. Each run is (queries) + (verified products) calls.
//    --dry prints the queries and the plan and spends nothing.
// ▶ It prints MEASUREMENTS and a short list, never raw JSON — the transcript
//   rule in CLAUDE.md applies to harnesses too.
import {
  buildQueries, matchStore, isResale, judge, widenOptions, VERDICT,
} from '../netlify/functions/lib/find-products.js';
import {buildDomains} from '../scripts/build-store-domains.js';

const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const KEY = process.env.SERPAPI_KEY;
const DRY = args.includes('--dry');
const VERIFY_MAX = Number(opt('verify', 6));   // how many products get a second call

const req = {
  item: opt('item'), colour: opt('colour'), fabric: opt('fabric'),
  cut: opt('cut'), size: opt('size'), width: opt('width'),
};
if (!req.item) { console.error('need --item'); process.exit(2); }
for (const k of Object.keys(req)) if (!req[k]) delete req[k];

const stores = buildDomains();
const queries = buildQueries(req);
console.log('\nREQUEST :', JSON.stringify(req));
console.log('QUERIES :'); queries.forEach(q => console.log('   • ' + q));
if (DRY) { console.log(`\n(dry) would spend ${queries.length} searches + up to ${VERIFY_MAX} product look-ups\n`); process.exit(0); }
if (!KEY) { console.error('set SERPAPI_KEY'); process.exit(2); }

const get = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
};
const search = (q) => get('https://serpapi.com/search.json?' + new URLSearchParams({
  engine: 'google_shopping', q, gl: 'us', hl: 'en', num: '60', api_key: KEY,
}));

// --- 1. pool several queries -------------------------------------------------
const pool = new Map();
let spent = 0;
for (const q of queries) {
  let d; try { d = await search(q); spent++; } catch (e) { console.log('   ! ' + q + ': ' + e.message); continue; }
  for (const x of d.shopping_results || []) {
    const id = x.product_id || x.title;
    if (!pool.has(id)) pool.set(id, x);
  }
}
console.log(`\npooled ${pool.size} distinct products from ${spent} searches`);

// --- 2. her shops only, no resale -------------------------------------------
const mine = [...pool.values()].map(x => ({raw: x, store: matchStore(x.source, stores)}))
  .filter(x => x.store && !isResale(x.raw.source));
console.log(`${mine.length} are from her shops (${pool.size - mine.length} dropped: not hers, or resale)`);

// --- 3. verify the most promising, on the OFFER not the title ----------------
// ▶ Ordered by how much the title already agrees, so the second calls are spent
//   where they are most likely to confirm rather than on the first N in Google's
//   order. Cheap heuristic, and it never DECIDES anything — judge() still does.
const promise = (t) => ['colour','fabric','cut'].reduce((n,k)=> n + (req[k] && new RegExp(req[k],'i').test(t) ? 1 : 0), 0);
mine.sort((a, b) => promise(b.raw.title) - promise(a.raw.title));
const verified = [];
for (const c of mine.slice(0, VERIFY_MAX)) {
  let d; try { d = await get(c.raw.serpapi_immersive_product_api + '&api_key=' + KEY); spent++; }
  catch { continue; }
  const p = d.product_results || {};
  const offers = (p.stores || []).filter(o => matchStore(o.name, stores) && !isResale(o.name));
  const best = offers.sort((a, b) => (a.extracted_price || 1e9) - (b.extracted_price || 1e9))[0];
  if (!best) continue;
  const sizes = ((p.variants || []).find(v => /size/i.test(v.title || '')) || {}).items || [];
  verified.push({
    title: p.title || c.raw.title,
    store: matchStore(best.name, stores),
    price: best.price,
    url: best.link,
    offerTitle: best.title,
    description: (p.about_the_product || {}).description || '',
    colourway: ((p.variants || []).find(v => /colou?r/i.test(v.title || '')) || {}).items?.map(i => i.name).join(' ') || '',
    sizes: sizes.map(i => i.name),
    details: best.details_and_offers || [],
  });
}
console.log(`verified ${verified.length} products on their real offers · ${spent} searches spent total\n`);

// --- 4. judge, then widen ----------------------------------------------------
const judged = verified.map(p => ({p, v: judge(req, p)}));
const exact = judged.filter(j => j.v.exact);
const mark = (v) => v === VERDICT.CONFIRMED ? '✓' : v === VERDICT.REJECTED ? '✗' : '?';

console.log(`EXACT MATCHES: ${exact.length}`);
for (const {p, v} of exact) {
  console.log(`  ★ ${p.store} · ${p.price} · ${p.title.slice(0, 58)}`);
  console.log(`     ${Object.entries(v.checks).map(([k, x]) => mark(x) + ' ' + k).join('  ')}`);
}
if (!exact.length) {
  console.log('  (none — the honest answer)\n');
  const opts = widenOptions(req, verified);
  if (!opts.length) console.log('  and no widening door leads anywhere either.');
  for (const o of opts) {
    const soft = o.softenedTo ? `soften ${o.release} → ${o.softenedTo}` : `open on ${o.release}`;
    console.log(`  ▸ keep ${o.keeps.join(' + ')}, ${soft}  → ${o.count} found`);
    for (const {product, verdict} of o.products.slice(0, 3)) {
      console.log(`      ${product.store} · ${product.price} · ${product.title.slice(0, 52)}`);
      if (verdict.unknown.length) console.log(`        (unconfirmed: ${verdict.unknown.join(', ')})`);
    }
  }
}
console.log('');
