// wordbudget.js — the store scoping must not blow the search word budget
// (2026-08-16, her Zappos screenshot: a search for "womens narrow width
// platform heels" answered with Birkenstock platform SANDALS).
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/wordbudget.js
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
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8957, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/.netlify/**', r => r.fulfill({status: 200, contentType: 'application/json', body: '{"content":[{"text":"{}"}]}'}));
  await pg.goto('http://localhost:8957/');
  await pg.waitForTimeout(2600);

  const u = (store, term) => pg.evaluate(([s, t]) => decodeURIComponent(getStoreUrl(s, t, t)), [store, term]);
  const words = url => decodeURIComponent(url).split(/[?&=]/).pop().trim().split(/\s+/).length;

  console.log('Her exact case');
  const zap = await u('Zappos', 'narrow width platform heels');
  ok('★ Zappos no longer gets "womens" stacked on a width search', !/womens/i.test(zap), zap);
  ok('★ the width word survives — she can still find a narrow shoe', /narrow width/i.test(zap), zap);
  ok('★ and the garment words survive too', /platform heels/i.test(zap), zap);
  ok('the search stays inside the 4-word budget', words(zap) <= 4, words(zap) + ' words: ' + zap);

  console.log('The scoping it must NOT break');
  const cases = [
    ['Zappos', 'platform heels', true, 'a plain shoe search keeps its scoping'],
    ['Zappos', 'ankle boots', true, 'another plain one keeps it'],
    ['DSW', 'red sandals', true, 'DSW keeps its scoping'],
    ['Zappos', 'wide width loafers', false, 'a WIDTH search stands the keyword down'],
    ['Zappos', 'petite rain boots', false, 'a PETITE search stands it down'],
    ['Zappos', 'plus size trousers', false, 'a PLUS SIZE search stands it down'],
    ['Zappos', 'tall boots', false, 'a TALL search stands it down'],
    // ⚠️ THE ONE THAT MUST NOT REGRESS: "wide-leg" is a SILHOUETTE, not a
    // width. It must keep the womens scoping, or the 2026-08-08 men's-trousers
    // bug comes straight back.
    ['Zappos', 'wide leg trousers', true, '⚠ "wide leg" is a silhouette and KEEPS its scoping'],
    ['Zappos', 'wide-leg trousers', true, '⚠ hyphenated too'],
    ['Zappos', 'medium wash jeans', true, '⚠ "medium wash" is a colour, not a width'],
    ['Zappos', 'tall boot socks', false, 'a leading "tall" stands it down (accepted cost)']
  ];
  for (const [store, term, wantWomens, label] of cases) {
    const url = await u(store, term);
    ok(label, /womens/i.test(url) === wantWomens, url);
  }

  console.log('Nothing else about the links moved');
  const amz = await u('Amazon', 'platform heels');
  ok('Amazon keeps its verified department PARAM', /i=fashion-womens/.test(amz), amz);
  const nord = await u('Nordstrom', 'pink midi dress');
  ok('the Nordstrom colour filter still fires', /filterByColor=pink/.test(nord), nord);
  const bloom = await u('Bloomingdales', 'black midi dress');
  ok('the Bloomingdales colour PATH still builds', /Color_normal\/Black/.test(bloom), bloom);
  const rev = await u('Revolve', 'satin midi skirt');
  // ⚠️ Check the SEARCH TERM, not the whole URL: Revolve is URL-scoped, so its
  // base already carries "d=Womens" and a whole-URL match reads as a keyword
  // prepend that never happened. Scoping mechanism ≠ search text.
  const revTerm = rev.split('search=').pop();
  ok('a women-only store is untouched (URL-scoped, no keyword prepend)',
    /revolve\.com/.test(rev) && /^satin midi skirt$/.test(revTerm), revTerm);
  // Her gym-bag screenshot: brightness words are not filter values anywhere.
  const rules = await pg.evaluate(() => _shopRules());
  ok('★ the colour rule now names brightness words as wrong', /BRIGHTNESS word like "neon"/.test(rules));
  ok('...alongside the shades it already ruled out', /raspberry/.test(rules) && /champagne/.test(rules));
  ok('the 2-4 word budget is still stated to the model', /2 to 4 plain words/.test(rules));

  ok('zero JS errors', errs.length === 0, errs.join(' | '));
  await b.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + failn + ' failed');
  process.exit(failn ? 1 : 0);
})();
