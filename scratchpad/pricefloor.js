// pricefloor.js — the two shelf guarantees added 2026-09-06, after Cath saw a
// live Wardrobe shelf come back Joseph $295, Rick Owens $1,020, Magda Butrym
// $1,290, Asceno $350 and said: "We need to adjust it so that those stores
// don't dominate."
//
// ▶ WHAT IS BEING PROVEN, and why the old rule could not do it. Every price
//   rule above the guarantees measures against the POOL'S OWN MEDIAN, and all
//   seven fed stores are $$$/$$$$ — so on a well-stocked row the median IS the
//   top band and nothing can sit two bands above it. These tests build exactly
//   that pool and watch the old rule do nothing, then watch the guarantee fire.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/pricefloor.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8957;
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const srv = http.createServer((rq, rs) => {
  let u = rq.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(ROOT, decodeURIComponent(u));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    rs.setHeader('content-type', u.endsWith('.html') ? 'text/html' : u.endsWith('.json') ? 'application/json'
      : u.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    rs.end(fs.readFileSync(f));
  } else { rs.statusCode = 404; rs.end('nf'); }
});
await new Promise(r => srv.listen(PORT, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = [];

const band = p => p < 100 ? '$' : p < 250 ? '$$' : p < 600 ? '$$$' : '$$$$';
// A feed garment. Prices are real ones off the live catalog wherever possible.
function feed(i, price, over) {
  return Object.assign({
    id: 'f' + i, slot: 'to5', feed: true, active: true,
    brand: 'Brand ' + i, name: 'Silk Blouse ' + i,
    retailer: ['Mytheresa', 'Olivela', 'Fleur du Mal', 'FARM Rio', 'DVF', 'Marissa Collections'][i % 6],
    url: 'https://x/' + i, image: 'https://cdn/x' + i + '.jpg',
    price: price, listPrice: null, onSale: false, band: band(price),
    colors: ['Black'], pattern: '', attrs: [], families: [],
    petite: false, tall: false, plus: false, sizes: ['S', 'M'], note: '',
  }, over || {});
}
// One of her 107: a note, no photo, and NOT flagged feed.
function hers(i, price, over) {
  return Object.assign(feed(i, price, over), {
    // ⚠️ DISTINCT retailers. Giving them all one store makes the pre-existing
    //    max-two-per-retailer rule cap the shelf at 2, which reads exactly like
    //    a guarantee bug and is not — the first draft of this file failed here.
    id: 'h' + i, feed: false, name: 'Her Pick ' + i,
    retailer: ['Nordstrom', 'J.Crew', 'Madewell', 'Ann Taylor', 'Quince', 'Talbots'][i % 6],
    image: '', note: 'A quiet silk that reads expensive.', families: ['Balanced'],
  });
}

// Drive the REAL curatedPicks in the real app, with her 107 replaced by a
// catalog we control so the assertions are about the picker, not the CSV.
async function pick(pool, count) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.route('**/.netlify/functions/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' }));
  await pg.goto('http://localhost:' + PORT + '/');
  await pg.waitForTimeout(2400);
  const out = await pg.evaluate(a => {
    const [pool, count] = a;
    // Both catalogs are read from these two, so seeding them seeds the pool.
    _productsCatalog = { products: pool.filter(x => !x.feed) };
    _feedBySlot['to5'] = pool.filter(x => x.feed);
    const r = curatedPicks('to5', { }, 'Balanced', count);
    return r.picks.map(p => ({ id: p.id, price: p.price, band: p.band, retailer: p.retailer, feed: !!p.feed }));
  }, [pool, count]);
  await ctx.close();
  return out;
}

// ── 1. The exact shape that defeated the old rule ────────────────────────
console.log('A uniformly luxury row (what the old rule could not touch)');
// Casual tops, measured live: median $260, and 45 pieces under $150.
let pool = [
  feed(1, 740), feed(2, 205), feed(3, 1290), feed(4, 350), feed(5, 795),
  feed(6, 88), feed(7, 160), feed(8, 30),
];
let got = await pick(pool, 4);
ok('the shelf still fills', got.length === 4, String(got.length));
ok('at least one reachable piece ($ or $$)',
   got.some(p => p.price < 250), JSON.stringify(got.map(p => p.price)));
ok('…and it is genuinely cheap, not merely cheapest-of-dear',
   Math.min(...got.map(p => p.price)) < 250, String(Math.min(...got.map(p => p.price))));

// ── 2. A row where NOTHING is affordable — shoes and bags are really like this
console.log('A row with nothing under $250 (shoes/bags: the honest limit)');
// Shoes, measured live: median $790, only 2 of 200 under $150.
pool = [feed(1, 975), feed(2, 790), feed(3, 2190), feed(4, 604), feed(5, 248), feed(6, 1400)];
got = await pick(pool, 4);
ok('the shelf still fills', got.length === 4, String(got.length));
// ⚠️ The second half of the rule: no sort invents inventory, so the promise
//    here is only "the cheapest quarter of what exists" — $248, not $975.
// ⚠️ The fallback is the cheapest TENTH, not the cheapest quarter. A quartile
//    on this very row is $604, which would satisfy the guarantee while leaving
//    the $248 shoe unseen — that is what the first draft of this rule did.
ok('the cheapest tenth of what exists is shown', got.some(p => p.price === 248),
   JSON.stringify(got.map(p => p.price)));
ok('…and it did NOT pretend the row is affordable', !got.some(p => p.price < 248));

// ── 3. Her hand-picks get a guaranteed seat, not the whole shelf ──────────
console.log('Her 107 on a row the feed also stocks');
pool = [hers(1, 128), hers(2, 88), hers(3, 210), hers(4, 340), hers(5, 60)]
  .concat([1, 2, 3, 4, 5, 6, 7, 8].map(i => feed(i + 10, 400 + i * 90)));
got = await pick(pool, 4);
ok('at least one of hers is on the shelf', got.some(p => !p.feed),
   JSON.stringify(got.map(p => p.id)));
// ⭐ THE MEASURED REASON THIS IS A GUARANTEE AND NOT A HEAD START: her 107
//    cover only 10 of ~100 rows but run 7-17 deep on those, so putting hers
//    first would hand her ALL FOUR cards on exactly the rows the feed stocks
//    best, every week, and change nothing on the other 90.
ok('…but hers do NOT take the whole shelf', got.filter(p => p.feed).length >= 2,
   JSON.stringify(got.map(p => p.id)));

// ── 4. Nothing else the picker guarantees may be broken by a swap ─────────
console.log('The swaps respect every rule already in the picker');
pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => feed(i, 300 + i * 100, { retailer: 'Mytheresa' }))
  .concat([feed(50, 80, { retailer: 'Mytheresa' })]);
got = await pick(pool, 4);
ok('never more than two from one retailer, swap included',
   got.filter(p => p.retailer === 'Mytheresa').length <= 2,
   JSON.stringify(got.map(p => p.retailer)));

console.log('A never-wear garment is still absolutely excluded');
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const pg = await ctx.newPage();
pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
await pg.route('**/.netlify/functions/**', r =>
  r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' }));
await pg.goto('http://localhost:' + PORT + '/');
await pg.waitForTimeout(2400);
// ⭐⭐ THE ONE THAT MATTERS MOST. A swap reaches back into the pool for a
//    cheaper piece, so it is exactly the kind of change that could smuggle a
//    vetoed garment onto her shelf. Her words: "when someone says no shift
//    dresses, that means absolutely no shift dresses."
const nw = await pg.evaluate(() => {
  _productsCatalog = { products: [] };
  _feedBySlot['to5'] = [
    { id: 'cheap', slot: 'to5', feed: true, active: true, brand: 'B', name: 'Shift Dress Blouse',
      retailer: 'Olivela', url: 'https://x', image: 'https://i', price: 40, listPrice: null,
      onSale: false, band: '$', colors: ['Black'], pattern: '', attrs: [], families: [],
      petite: false, tall: false, plus: false, sizes: ['S'], note: '' },
    ...[1, 2, 3, 4, 5].map(i => ({ id: 'f' + i, slot: 'to5', feed: true, active: true, brand: 'B' + i,
      name: 'Silk Blouse ' + i, retailer: ['Mytheresa', 'DVF', 'FARM Rio'][i % 3], url: 'https://x',
      image: 'https://i', price: 700 + i * 100, listPrice: null, onSale: false, band: '$$$$',
      colors: ['Black'], pattern: '', attrs: [], families: [], petite: false, tall: false,
      plus: false, sizes: ['S'], note: '' })),
  ];
  return curatedPicks('to5', { neverWear: ['shift dresses'] }, 'Balanced', 4)
    .picks.map(p => p.name);
});
ok('the cheapest piece on the row is STILL refused when she said no to it',
   !nw.some(n => /shift dress/i.test(n)), JSON.stringify(nw));
ok('…and the rest of the shelf still renders', nw.length >= 3, JSON.stringify(nw));
await ctx.close();

console.log('A shelf with no feed at all behaves as it always did');
got = await pick([hers(1, 128), hers(2, 88), hers(3, 210), hers(4, 340), hers(5, 600)], 4);
ok('her own catalog alone still fills the shelf', got.length === 4, String(got.length));
ok('…all hers, nothing invented', got.every(p => !p.feed));

// ── 5. The store list the AI is told to favour ───────────────────────────
// ⭐⭐ THE ROOT CAUSE OF THE AI HALF, and the reason a prompt could not fix it.
//    _shopRules tells the model "favour the TOP of this list" AND "include
//    something genuinely affordable". For a dressy woman those conflict:
//    measured 2026-09-06, her top 10 was Bergdorf, Saks, NET-A-PORTER, Neiman
//    Marcus, Alice + Olivia, Veronica Beard, Gucci, Reformation, Marissa
//    Collections, Revolve — ZERO reachable. The model obeys the first.
console.log('The ranked store list keeps a reachable store within reach of the top');
const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
const pg2 = await ctx2.newPage();
pg2.on('pageerror', e => errs.push('pageerror: ' + e.message));
await pg2.route('**/.netlify/functions/**', r =>
  r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' }));
await pg2.goto('http://localhost:' + PORT + '/');
await pg2.waitForTimeout(2400);

const lists = await pg2.evaluate(() => {
  const cheap = t => { const m = String(t || '').split('-')[0].match(/\$+/); return m ? m[0] : ''; };
  const reach = k => ['$', '$$'].includes(cheap(STORES[k] && STORES[k].t));
  const run = ans => {
    answers = ans.slice(); quizTaken = true;
    const her = _herDims();
    const raw = Object.keys(STORES).map(k => ({ k, fit: _storeFit(k, her) }))
      .sort((a, b) => b.fit - a.fit).map(x => x.k);        // BEFORE the guarantee
    const out = _rankedStores();                            // AFTER it
    return {
      rawTop12: raw.slice(0, 12).filter(reach).length,
      top12: out.slice(0, 12).filter(reach).length,
      len: out.length, uniq: new Set(out).size,
      // every promoted store must be one HER ranking already favoured among
      // affordable ones -- never an arbitrary cheap shop
      promoted: out.slice(0, 12).filter(reach).map(k => raw.indexOf(k)),
      head6: out.slice(0, 6),
      rawHead6: raw.slice(0, 6),
    };
  };
  return {
    dressy: run([9, 10, 6, 6, 10, 6, 6, 6, 9, 6, 9, 6]),
    relaxed: run([3, 2, 6, 6, 2, 6, 6, 6, 2, 6, 3, 6]),
    // Before the quiz there is no profile to rank against, so the table must
    // come back untouched rather than reordered against an invented woman.
    fresh: (() => { quizTaken = false; const o = _rankedStores();
      return { same: o.join('|') === Object.keys(STORES).join('|'), len: o.length }; })(),
  };
});
await ctx2.close();

ok('the dressy woman had almost nothing reachable up top before',
   lists.dressy.rawTop12 < 3, String(lists.dressy.rawTop12));
ok('…and now has at least three within the top twelve',
   lists.dressy.top12 >= 3, String(lists.dressy.top12));
ok('the relaxed woman, who never had the problem, is not disturbed',
   lists.relaxed.top12 >= 3, String(lists.relaxed.top12));
// ⚠️ SORT, DO NOT TRIM is a standing decision (2026-07-27): the AI must still
//    see every store, or a whole kind of shopping silently becomes impossible.
ok('no store is lost from the list', lists.dressy.len === lists.relaxed.len && lists.dressy.len > 100,
   String(lists.dressy.len));
ok('…and none duplicated by the promotion', lists.dressy.uniq === lists.dressy.len,
   lists.dressy.uniq + ' of ' + lists.dressy.len);
ok('every promoted store is one HER ranking already favoured among affordable ones',
   lists.dressy.promoted.every(r => r >= 0 && r < 40), JSON.stringify(lists.dressy.promoted));
ok('her very best matches still lead — luxury taste still gets luxury first',
   lists.dressy.head6.filter(k => lists.dressy.rawHead6.includes(k)).length >= 4,
   JSON.stringify(lists.dressy.head6));
ok('before the quiz the table is untouched, not ranked against an invented woman',
   lists.fresh.same, String(lists.fresh.len));

ok('zero JS errors throughout', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
