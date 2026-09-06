// feedname.js — A MERCHANT'S NAME IS DATA, AND A WISHLIST ID IS A PROMISE (2026-09-08).
//
// 🚨 WHY THIS SUITE EXISTS. Cath's Tops shelf, 2026-09-06, card 5:
//   "Vilebrequin - Men Wool Shirt Micro Rayures Tailoring - Shirt - Cool - Blue - Size M"
// _curatedCard rendered _esc(x.name) straight from the merchant, while _shopCard —
// the AI card sitting directly beside it — has always run _sizeWordsOut(_nameParity())
// first. Two card renderers, two halves, and only one of them tidied a name.
//
// ⚠️⚠️ AND THE FIX BIT BACK IMMEDIATELY, which is the more valuable half of this file.
// A wishlist id is a SLUG OF THE NAME, so tidying the displayed name silently re-keyed
// every saved piece: a woman's already-hearted items become unreachable, her heart reads
// unsaved, and she can save a duplicate. curated.js caught one face of it ("a saved item
// is exempt from staleness"); the orphaning was the bigger, quieter half.
// ▶ SO THE INVARIANT PINNED HERE: the DISPLAY name may change freely; the ID is derived
//   from the untouched merchant name via `idName` and must never move.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/feedname.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8961, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  await pg.goto('http://127.0.0.1:8961/index.html', {waitUntil: 'domcontentloaded'});
  await pg.waitForFunction(() => typeof window._feedName === 'function');

  console.log('Part A — _feedName removes only what is provably redundant');
  const cases = [
    ['Vilebrequin - Men Wool Shirt Tailoring - Blue - Size M', 'Vilebrequin', /^Men Wool Shirt/, 'brand + trailing size go'],
    ["Theory Women's Slub Cotton Tiny Crewneck T-Shirt in Red", 'Theory', /^Slub Cotton Tiny Crewneck T-Shirt in Red$/, "brand + leading Women's go"],
    ['MYTHERESA - Silk Blouse - Size 38', 'Mytheresa', /^Silk Blouse$/, 'brand case-insensitive, numeric size'],
    ['Olivela Cashmere Sweater, Size M', 'Olivela', /^Cashmere Sweater$/, 'comma-separated size'],
    ['Womens Ribbed Tank Size XL', 'FARM Rio', /^Ribbed Tank$/, 'no-apostrophe gender word'],
  ];
  for (const [name, brand, want, why] of cases) {
    const got = await pg.evaluate(([n, br]) => window._feedName(n, br), [name, brand]);
    ok('tidied (' + why + ')', want.test(got), JSON.stringify(got));
  }

  console.log('Part B — HER 107 MUST COME THROUGH AS THEMSELVES');
  // ⚠️ The catalog and the feed share _curatedCard, so an over-eager tidy would
  // quietly rewrite names Cath chose herself. These are real products.json rows.
  const herNames = [
    ['The Perfect Vintage Jean', 'Madewell', 'The Perfect Vintage Jean'],
    ["L'AGENCE Dani Silk Charmeuse Blouse", "L'AGENCE", 'Dani Silk Charmeuse Blouse'],
  ];
  for (const [n, br, want] of herNames) {
    const got = await pg.evaluate(([a, b2]) => window._feedName(a, b2), [n, br]);
    ok('hers untouched but for the brand line above it: ' + want, got === want, JSON.stringify(got));
  }
  // Never hand back less than a name.
  ok('a name that IS its brand survives', await pg.evaluate(() => window._feedName('Gucci', 'Gucci')) === 'Gucci');
  ok('an empty name stays empty', await pg.evaluate(() => window._feedName('', 'Gucci')) === '');

  console.log('Part C — 🚨 THE DRIFT GUARD: a tidied DISPLAY name must never move the ID');
  const ids = await pg.evaluate(() => {
    const raw = "Theory Women's Slub Cotton Tiny Crewneck T-Shirt in Red";
    const tidy = window._feedName(raw, 'Theory');
    return {
      raw, tidy,
      // what the shelf's stale() lookup builds, from the UNTOUCHED merchant name
      expected: window._wlMakeId(raw, 'Theory'),
      // what the card's save button actually registers
      viaCard: window._wlRegister({name: tidy, idName: raw, store: 'Theory', exact: true, url: 'https://x.test/p', price: '$75'}),
      // and what it would have been WITHOUT idName — the orphaning bug, pinned
      viaTidyOnly: window._wlRegister({name: tidy, store: 'Theory', exact: true, url: 'https://x.test/p', price: '$75'}),
    };
  });
  ok('the tidy name really is different from the raw one', ids.tidy !== ids.raw, ids.tidy);
  ok('the card registers under the RAW-name id (no orphaning)', ids.viaCard === ids.expected, JSON.stringify(ids));
  ok('...and that id is what curatedPicks stale() would look up', ids.viaCard === ids.expected);
  ok('WITHOUT idName the id WOULD have moved (this is the bug, pinned)', ids.viaTidyOnly !== ids.expected, ids.viaTidyOnly);
  // Back-compat: every other surface passes no idName and must be unaffected.
  const back = await pg.evaluate(() => ({
    a: window._wlRegister({name: 'Silk Camisole', store: 'Nordstrom'}),
    b: window._wlMakeId('Silk Camisole', 'Nordstrom'),
  }));
  ok('a caller with no idName still keys off name (AI cards, the Edit)', back.a === back.b, JSON.stringify(back));

  await b.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + failn + ' failed');
  process.exit(failn ? 1 : 0);
})();
