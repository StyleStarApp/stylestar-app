// feedshelf.js — the nightly feed catalog reaching a real wardrobe shelf.
// Part A runs the REAL netlify/functions/product-search.js handler in Node with
// Supabase stubbed; Part B drives the REAL app in Chromium with that endpoint
// stubbed, and checks that a feed garment goes through the SAME picker as her
// own hand-picks -- above all her never-wear list.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/feedshelf.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ─────────────────────── Part A: the real function ───────────────────────
console.log('Part A — product-search.js, the real handler');
const handler = (await import(path.join(ROOT, 'netlify/functions/product-search.js'))).default;

function row(over) {
  return Object.assign({
    piece_key: '43172:abc:black', store: 'Mytheresa', brand: 'Toteme',
    name: 'Silk Blouse', url: 'https://click.linksynergy.com/deeplink?id=jZNkkinrr1k&mid=43172&murl=x',
    image_url: 'https://img/x.jpg', price: 420, list_price: null, on_sale: false,
    color: 'Black', material: '100% Silk', pattern: '', sizes: ['S', 'M', 'L'],
  }, over || {});
}
function req(body, over) {
  const h = new Map(Object.entries(Object.assign({
    host: 'stylestar.app', origin: 'https://stylestar.app',
  }, (over || {}).headers || {})));
  return {
    method: (over || {}).method || 'POST',
    headers: { get: k => h.get(k.toLowerCase()) || null },
    json: async () => body,
  };
}
let lastUrl = '', lastHeaders = {};
function stubSupabase(rows, status) {
  global.fetch = async (u, opts) => {
    lastUrl = String(u);
    lastHeaders = (opts && opts.headers) || {};
    return { ok: (status || 200) < 400, status: status || 200,
             json: async () => rows, text: async () => JSON.stringify(rows) };
  };
}
process.env.SUPABASE_URL = 'https://x.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-key';

stubSupabase([row()]);
let res = await handler(req({ slot: 'to5' }));
let out = JSON.parse(await res.text());
ok('a valid slot returns products', res.status === 200 && out.products.length === 1);
ok('it queries the slots array, not a text match', /slots=cs\.%7Bto5%7D|slots=cs\.\{to5\}/.test(lastUrl), lastUrl);
ok('it asks the product_cards view', /product_cards/.test(lastUrl));
ok('it drops rows with no image', /image_url=not\.is\.null/.test(lastUrl));
const p = out.products[0];
ok('shaped like a products.json row', p.slot === 'to5' && p.brand === 'Toteme' && p.retailer === 'Mytheresa');
ok('the affiliate url is verbatim', p.url.includes('jZNkkinrr1k'));
ok('flagged as feed', p.feed === true);
ok('families is empty (nobody judged 78,000 garments)', Array.isArray(p.families) && !p.families.length);
ok('material lands in attrs, where never-wear fabrics are matched', p.attrs.join(' ').includes('Silk'));
ok('price band computed', p.band === '$$$', p.band);

stubSupabase([row({ price: 40 }), row({ price: 120 }), row({ price: 900 })]);
out = JSON.parse(await (await handler(req({ slot: 'to5' }))).text());
ok('bands span the app’s own four', out.products.map(x => x.band).join(',') === '$,$$,$$$$');

// Size ranges are read from what the merchant stocks, never assumed: claiming
// Plus falsely sends a woman to a page with nothing for her.
stubSupabase([row({ sizes: ['S', 'M', 'L'] }), row({ sizes: ['1X', '2X', '3X'] }),
              row({ sizes: ['S Petite', 'M Petite'] }), row({ sizes: ['M Tall'] })]);
out = JSON.parse(await (await handler(req({ slot: 'to5' }))).text());
ok('plus only when the sizes say so', out.products.map(x => x.plus ? 1 : 0).join('') === '0100');
ok('petite only when the sizes say so', out.products.map(x => x.petite ? 1 : 0).join('') === '0010');
ok('tall only when the sizes say so', out.products.map(x => x.tall ? 1 : 0).join('') === '0001');

// A made-up slot must not become a filter of the caller's choosing.
for (const bad of ['', 'to', 'TO1; drop', '../x', 'slots=cs.{}', 'to999999']) {
  const rr = await handler(req({ slot: bad }));
  ok(`slot ${JSON.stringify(bad)} refused`, rr.status === 400);
}
ok('a good slot is lowercased', JSON.parse(await (await handler(req({ slot: 'TO5' }))).text()).slot === 'to5');

// Every failure is an EMPTY POOL, never an error: the shelf must fall back to
// the AI exactly as it behaved before this feature existed.
stubSupabase({ message: 'permission denied' }, 401);
res = await handler(req({ slot: 'to5' }));
ok('a Supabase 401 is an empty pool, not an error', res.status === 200 && !JSON.parse(await res.text()).products.length);
global.fetch = async () => { throw new Error('network down'); };
res = await handler(req({ slot: 'to5' }));
ok('a network failure is an empty pool', res.status === 200 && !JSON.parse(await res.text()).products.length);
const savedKey = process.env.SUPABASE_SERVICE_KEY, savedKey2 = process.env.SUPABASE_KEY;
delete process.env.SUPABASE_SERVICE_KEY; delete process.env.SUPABASE_KEY;
res = await handler(req({ slot: 'to5' }));
ok('no credentials is an empty pool', res.status === 200 && !JSON.parse(await res.text()).products.length);
process.env.SUPABASE_SERVICE_KEY = savedKey; if (savedKey2) process.env.SUPABASE_KEY = savedKey2;

// ⭐ LEAST PRIVILEGE, AND THE ORDER IS THE POINT (2026-09-05). The catalog
// tables carry a read-only rule for the ORDINARY key, so this function must
// read with that and never reach for the service role key -- which bypasses
// every rule in the database including on `users`. If the service key is ever
// added to Netlify for some other reason, this function must not quietly start
// using it. That is a one-word change to break, so it is pinned here.
process.env.SUPABASE_KEY = 'ordinary-key';
stubSupabase([row()]);
await handler(req({ slot: 'to5' }));
ok('reads with the ORDINARY key when both are set',
   lastHeaders.apikey === 'ordinary-key', String(lastHeaders.apikey));
ok('…and never reaches for the service role key',
   String(lastHeaders.Authorization || '').indexOf('service-key') < 0, String(lastHeaders.Authorization));
delete process.env.SUPABASE_KEY;
stubSupabase([row()]);
await handler(req({ slot: 'to5' }));
ok('falls back to the service key only when nothing else is set',
   lastHeaders.apikey === 'service-key', String(lastHeaders.apikey));

stubSupabase([row()]);
ok('cross-origin refused', (await handler(req({ slot: 'to5' }, { headers: { origin: 'https://evil.example' } }))).status === 403);
ok('no origin or referer at all refused',
   (await handler({ method: 'POST', headers: { get: k => (k.toLowerCase() === 'host' ? 'stylestar.app' : null) }, json: async () => ({ slot: 'to5' }) })).status === 403);
ok('a forged netlify host still needs a matching origin',
   (await handler(req({ slot: 'to5' }, { headers: { host: 'evil.example', origin: 'https://evil.example' } }))).status === 403);
ok('GET refused', (await handler(req({ slot: 'to5' }, { method: 'GET' }))).status === 405);
ok('OPTIONS preflight answered', (await handler(req({}, { method: 'OPTIONS' }))).status === 204);

// ───────────────────────── Part B: the real shelf ─────────────────────────
console.log('Part B — the shelf in a real browser');
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const srv = http.createServer((rq, rs) => {
  let u = rq.url.split('?')[0]; if (u === '/') u = '/index.html';
  const f = path.join(ROOT, decodeURIComponent(u));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    rs.setHeader('content-type', u.endsWith('.html') ? 'text/html' : u.endsWith('.json') ? 'application/json' : u.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    rs.end(fs.readFileSync(f));
  } else { rs.statusCode = 404; rs.end('nf'); }
});
await new Promise(r => srv.listen(8947, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = [];

// Real-looking feed pieces for "Professional blouses", one of which is exactly
// the kind of thing a never-wear list rules out.
function feedItem(i, over) {
  return Object.assign({
    id: 'mid:' + i + ':c', slot: 'to5', feed: true, active: true,
    brand: 'Brand ' + i, name: 'Silk Blouse ' + i, retailer: ['Mytheresa', 'Olivela', 'Fleur du Mal', 'FARM Rio'][i % 4],
    url: 'https://click.linksynergy.com/deeplink?id=jZNkkinrr1k&n=' + i,
    image: 'https://img/' + i + '.jpg', price: 200 + i, listPrice: null, onSale: false,
    band: '$$$', colors: ['Black'], pattern: '', attrs: ['100% Silk'],
    families: [], petite: false, tall: false, plus: false, sizes: ['S', 'M'], note: '',
  }, over || {});
}
const AI_ITEMS = { items: [
  { name: 'AI Blouse A', search: 'silk professional blouse', store: 'Nordstrom' },
  { name: 'AI Blouse B', search: 'cotton professional blouse', store: 'Talbots' },
  { name: 'AI Blouse C', search: 'crepe professional blouse', store: 'Ann Taylor' },
  { name: 'AI Blouse D', search: 'poplin professional blouse', store: 'Boden' }] };

async function shelf(opts) {
  opts = opts || {};
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  let feedCalls = 0;
  await pg.route('**/.netlify/functions/product-search', r => {
    feedCalls++;
    if (opts.feedFails) return r.fulfill({ status: 500, body: '{}' });
    r.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ products: opts.feed || [], slot: 'to5' }) });
  });
  await pg.route('**/.netlify/functions/style-ai', r =>
    r.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ content: [{ text: JSON.stringify(AI_ITEMS) }] }) }));
  await pg.goto('http://localhost:8947/');
  await pg.waitForTimeout(2600);
  await pg.evaluate(patch => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'T', answers: new Array(12).fill(6), topArchNames: ['The Statement Maker', 'The Modern Classic', 'The Serene Grace'], portrait: 'p', motto: 'm' }));
    topArchNames = ['The Statement Maker', 'The Modern Classic', 'The Serene Grace'];
    quizTaken = true;
    Object.assign(prefs, patch || {});
    openWardrobe();
  }, opts.prefs || {});
  await pg.waitForTimeout(200);
  await pg.evaluate(() => wardrobeSeeIdeas('to5'));
  await pg.waitForTimeout(1200);
  const cards = await pg.evaluate(() => {
    const box = document.getElementById('wx_to5');
    return [...(box ? box.querySelectorAll('.shop-card') : [])].map(c => ({
      curated: c.classList.contains('wdr-curated'),
      brand: (c.querySelector('.shop-item-brand') || {}).textContent || '',
      name: (c.querySelector('.shop-item-name') || {}).textContent || '',
      store: (c.querySelector('.shop-item-store') || {}).textContent || '',
      href: c.querySelector('.shop-link') ? c.querySelector('.shop-link').getAttribute('href') : '',
      rel: c.querySelector('.shop-link') ? c.querySelector('.shop-link').getAttribute('rel') : '',
      label: c.querySelector('.shop-link') ? c.querySelector('.shop-link').textContent.trim() : '',
      badges: [...c.querySelectorAll('.wdr-pick,.wdr-ailbl')].map(x => x.textContent).join('|'),
    }));
  });
  await ctx.close();
  return { cards, feedCalls };
}

let s = await shelf({ feed: [feedItem(1), feedItem(2), feedItem(3), feedItem(4), feedItem(5)] });
ok('the shelf asked for this row’s feed', s.feedCalls === 1);
let fed = s.cards.filter(c => /Silk Blouse [1-5]/.test(c.name));
ok('feed garments reach the shelf', fed.length >= 3, JSON.stringify(s.cards.map(c => c.name)));
ok('the AI still fills the set to 6', s.cards.length === 6, String(s.cards.length));
ok('a feed card links straight to the product, verbatim', fed[0] && fed[0].href.includes('jZNkkinrr1k'));
ok('a feed card says Shop it, not Find it', fed[0] && /shop it/i.test(fed[0].label), fed[0] && fed[0].label);
ok('a feed card is affiliate-tagged in its rel', fed[0] && /sponsored/.test(fed[0].rel || ''));
ok('no badge divides feed from AI (her 2026-08-14 call)', s.cards.every(c => !c.badges));
ok('brand leads, retailer secondary', fed[0] && fed[0].brand.startsWith('Brand') && /at (Mytheresa|Olivela|Fleur du Mal|FARM Rio)/.test(fed[0].store));

// ⭐⭐ THE ONE THAT MATTERS MOST. Her words, 2026-09-05: "when someone says no
// shift dresses, that means absolutely no shift dresses." A feed garment goes
// through filterNeverWear's own term builder because it goes through the SAME
// picker -- not through a second filter somewhere that could drift.
s = await shelf({
  feed: [feedItem(1, { name: 'Shift Dress Blouse 1' }), feedItem(2, { name: 'Shift Dress Blouse 2' }),
         feedItem(3), feedItem(4), feedItem(5)],
  prefs: { neverWear: ['shift dresses'] },
});
ok('a never-wear feed garment is removed', !s.cards.some(c => /Shift Dress/i.test(c.name)),
   JSON.stringify(s.cards.map(c => c.name)));
ok('the rest of the feed still shows', s.cards.some(c => /Silk Blouse [3-5]/.test(c.name)));

s = await shelf({ feed: [feedItem(1, { attrs: ['100% Polyester'] }), feedItem(2), feedItem(3), feedItem(4)],
                  prefs: { neverOther: 'no polyester' } });
ok('a never-wear FABRIC is removed, matched on the material column',
   !s.cards.some(c => c.name === 'Silk Blouse 1'), JSON.stringify(s.cards.map(c => c.name)));

s = await shelf({ feed: [feedItem(1, { colors: ['Orange'] }), feedItem(2), feedItem(3), feedItem(4)],
                  prefs: { neverOther: 'no orange' } });
ok('a colour hard-no is removed', !s.cards.some(c => c.name === 'Silk Blouse 1'));

s = await shelf({ feed: [1, 2, 3, 4, 5, 6, 7, 8].map(i => feedItem(i, { retailer: 'Mytheresa' })) });
const my = s.cards.filter(c => /at Mytheresa/.test(c.store));
ok('never more than two from one retailer, feed included', my.length <= 2, String(my.length));

s = await shelf({ feed: [feedItem(1, { plus: false }), feedItem(2, { plus: false })],
                  prefs: { sizes: { fit: ['Plus'] } } });
ok('a woman who shops Plus is not shown pieces that do not come in it',
   !s.cards.some(c => /Silk Blouse [12]/.test(c.name)), JSON.stringify(s.cards.map(c => c.name)));

// The fallbacks, which is what keeps Ideas unbreakable.
s = await shelf({ feedFails: true });
ok('a failed feed still fills the shelf from the AI', s.cards.length === 4 || s.cards.length === 6, String(s.cards.length));
s = await shelf({ feed: [] });
ok('an empty feed behaves exactly as before this feature existed', s.cards.length >= 4);

ok('zero JS errors throughout', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
