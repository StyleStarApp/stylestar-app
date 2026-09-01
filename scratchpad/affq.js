// Affiliate-readiness + quiz batch (2026-07-31, the fourth Cowork brief).
//
// Part A is static: every outbound product link carries rel="sponsored
// noopener" (including every hardcoded Edit link), the a.co shortlinks are
// canonical amazon.com/dp/ links now, @netlify/blobs is gone, and /results is
// a real route in BOTH _ROUTES and netlify.toml (the server applies the toml's
// own rewrite rules, so a typo there fails the test).
//
// Part B drives the real app in Chromium: the Edit and Mall disclosures render
// ABOVE the products, quiz autosave survives a refresh AND an exit-and-return,
// browser Back walks quiz questions one at a time, completion clears the
// autosave, and /results opens the portrait (or honestly falls back).
//
//   node scratchpad/affq.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const TOML = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

// ===========================================================================
console.log('\nA1. Every outbound product link carries rel="sponsored noopener"');
const allOutbound = [...HTML.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map(m => m[0]);
// ⚠️ Cath's own Instagram link (footer, 2026-08-08) is outbound but is NOT a
// product link. "sponsored" marks a paid or affiliate link, so tagging her own
// account with it would be a false signal to search engines and to any affiliate
// reviewer reading the page. It carries plain noopener and is asserted separately.
const social = allOutbound.filter(a => /instagram\.com/.test(a));
const anchors = allOutbound.filter(a => !/instagram\.com/.test(a));
// 26 as of 2026-08-13: This Week's Star's "Shop it" (.wks-shop, built by
// _renderWeekStar) is the 9th JS template — a deliberate count update, and the
// check caught the new anchor exactly as designed.
// 27 as of 2026-08-14: the Tommy Hilfiger kitten heel (the first Star of the
// Week) rolled into the Edit as the 18th hardcoded item, her call.
// 27 → 28 updated deliberately 2026-08-14: the curated-catalog card
// (_curatedCard, the 10th JS template) carries its own outbound "Shop it"
// anchor with rel="sponsored noopener" — the census caught it as designed.
// 10 → 11 updated deliberately 2026-08-21: the Discovery-page Star of the Week
// (_renderDiscoStar) carries its own outbound "Shop it" anchor — the census
// caught the 11th template exactly as designed, which is its whole job.
// ⚠️ It is a SECOND anchor for the same card, not a moved one: the Welcome Back
// Star (.wks-shop from _renderWeekStar) is untouched and still counted.
// ⚠️ DERIVED, not restated: the Edit grows every time she adds a piece, so a
// hardcoded total needs editing on every single addition. Only the JS card
// templates are genuinely fixed, which is why only that number is written here.
// 11 → 12 updated deliberately 2026-08-21: the shared wishlist page
// (_shGroup, at /list/<token>) carries its own outbound anchor. It is the
// commercial point of the whole feature — a piece bought from her shared list
// is exactly what should earn — so it is affiliate-wrapped and sponsored like
// every other product link. The census caught the 12th template as designed.
// 12 → 13 updated deliberately 2026-09-01: "More from the Edit" (.wet-card,
// built by _renderEditTeaser on Welcome Back, her idea 2026-08-26) carries its
// own outbound anchor, affiliate-wrapped and sponsored like every other product
// link. The census caught the 13th template exactly as designed — this suite
// had been red since that strip shipped, which is a fair trade for an assertion
// whose whole job is to notice a new way out of the app.
const TEMPLATES = 13;
const EDIT_N = (HTML.match(/<a class="dc-item-btn"/g) || []).length;
ok('found the full set of outbound PRODUCT anchors (every Edit link + ' + TEMPLATES + ' templates)',
   anchors.length === EDIT_N + TEMPLATES, 'got ' + anchors.length + ' with ' + EDIT_N + ' Edit links');
ok('every product link carries sponsored + noopener', anchors.every(a => /rel="sponsored noopener"/.test(a)),
  anchors.filter(a => !/rel="sponsored noopener"/.test(a)).slice(0, 2).join(' '));
ok('the Instagram link exists', social.length === 1, 'got ' + social.length);
ok('...points at her real handle', social.every(a => /href="https:\/\/instagram\.com\/style_star\.app"/.test(a)));
ok('...carries noopener but NOT sponsored', social.every(a => /rel="noopener"/.test(a) && !/sponsored/.test(a)));
ok('...has an aria-label, being an icon with no text', social.every(a => /aria-label="[^"]+"/.test(a)));
const editBtns = [...HTML.matchAll(/<a class="dc-item-btn"[^>]*>/g)].map(m => m[0]);
ok('every hardcoded Edit link is included and carries the rel',
   editBtns.length === EDIT_N && editBtns.length >= 19 && editBtns.every(a => /rel="sponsored noopener"/.test(a)),
   editBtns.length + ' links');

console.log('\nA2. Amazon shortlinks are canonical now');
ok('no a.co shortlinks remain', !/a\.co\//.test(HTML));
ok('both canonical /dp/ links present, tracking-free',
  HTML.includes('https://www.amazon.com/dp/B0CWD1RYK3"') && HTML.includes('https://www.amazon.com/dp/B0DWL5VV8Z"'));

console.log('\nA3. package.json no longer carries @netlify/blobs');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
ok('dependency gone', !JSON.stringify(pkg).includes('@netlify/blobs'));
ok('"type": "module" kept (the functions are ESM)', pkg.type === 'module');
ok('nothing in the functions ever imported it', !fs.readFileSync(path.join(ROOT, 'netlify/functions/style-ai.js'), 'utf8').includes('blobs') &&
  !fs.readFileSync(path.join(ROOT, 'netlify/functions/user-data.js'), 'utf8').includes('blobs'));

console.log('\nA4. /results is a real route');
ok('in _ROUTES', /'s-res':'\/results'/.test(HTML));
const rewrites = [...TOML.matchAll(/from = "([^"]+)"\s*\n\s*to = "\/index\.html"\s*\n\s*status = 200/g)].map(m => m[1]);
ok('netlify.toml rewrites /results (200)', rewrites.includes('/results'), JSON.stringify(rewrites));
ok('the four legal/story routes untouched', ['/privacy', '/terms', '/story', '/faq'].every(p => rewrites.includes(p)));

// ===========================================================================
// PART B — the real app
// ===========================================================================
const PORT = 8898, ORIGIN = 'http://localhost:' + PORT;
let jsonReply = { content: [{ type: 'text', text: 'A lovely idea.' }] };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname.startsWith('/.netlify/functions/style-ai')) {
    let raw = ''; for await (const c of req) raw += c;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(jsonReply)); return;
  }
  if (url.pathname.startsWith('/.netlify/functions/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); return;
  }
  // Apply the REAL netlify.toml rewrites, so the /results route only works in
  // the test if the toml really rewrites it.
  if (url.pathname === '/' || url.pathname === '/index.html' || rewrites.includes(url.pathname)) {
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(HTML); return;
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch();
const FULL_SEED = {
  userName: 'Test', answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  topArchNames: ['Timeless Classic', 'Modern Muse', 'Coastal Chic'],
  portrait: 'A test portrait.', motto: 'Shine on.'
};
async function newPage(opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  if (opts.seed) await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), opts.seed);
  await page.goto(ORIGIN + (opts.path || '/'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  return page;
}

// ---------------------------------------------------------------------------
console.log('\nB1. Edit + Mall disclosures render ABOVE the products');
let page = await newPage({});
const disc = await page.evaluate(() => {
  showDream();
  const d = document.querySelector('#s-dream .dc-disclosure');
  const first = document.querySelector('#s-dream .dc-item');
  const out = { edit: {} };
  out.edit.count = document.querySelectorAll('#s-dream .dc-disclosure').length;
  out.edit.visible = !!d && d.getBoundingClientRect().height > 0;
  out.edit.above = !!d && !!first && d.getBoundingClientRect().top < first.getBoundingClientRect().top;
  showShop();
  const m = document.querySelector('#s-shop .dc-disclosure');
  const card = document.querySelector('#s-shop .mall-card');
  out.mall = {
    count: document.querySelectorAll('#s-shop .dc-disclosure').length,
    visible: !!m && m.getBoundingClientRect().height > 0,
    above: !!m && !!card && m.getBoundingClientRect().top < card.getBoundingClientRect().top
  };
  return out;
});
ok('Edit: exactly one disclosure, visible, above the first item', disc.edit.count === 1 && disc.edit.visible && disc.edit.above, JSON.stringify(disc.edit));
ok('Mall: exactly one disclosure, visible, above the first store card', disc.mall.count === 1 && disc.mall.visible && disc.mall.above, JSON.stringify(disc.mall));
const editDom = await page.evaluate(() => {
  const links = [...document.querySelectorAll('#s-dream .dc-item-btn')];
  return { n: links.length, rel: links.every(a => a.rel === 'sponsored noopener'), amazon: links.filter(a => a.href.includes('amazon.com/dp/')).length };
});
// ⚠️ 2026-08-21: an Edit href may now be AFFILIATE-WRAPPED in the live DOM
// (click.linksynergy.com) even though the markup holds the bare product URL,
// because _wlDecorateEdit rewrites it on render. The rel and the Amazon
// canonicalisation are what this assertion is really about, so it counts
// against the derived total rather than a frozen number.
ok('every Edit link carries the rel in the live DOM, 2 canonical Amazon',
   editDom.n === EDIT_N && editDom.rel && editDom.amazon === 2, JSON.stringify(editDom));
await page.close();

console.log('\nB2. Quiz autosave: exit and return keeps her place');
page = await newPage({});
await page.evaluate(() => {
  startQ();
  for (let i = 0; i < 4; i++) { document.getElementById('sl').value = String(3 + i); onSl(3 + i); nextQ(); }
});
let q = await page.evaluate(() => ({ cur, pl: document.getElementById('pl').textContent, saved: JSON.parse(localStorage.getItem('ss_quiz')) }));
ok('mid-quiz on question 5, autosave current', q.cur === 4 && q.pl === '5 of 12' && q.saved && q.saved.c === 4 && q.saved.a[2] === 5);
// Leave via a footer link, come back through startQ: same question, same answers.
await page.evaluate(() => { showFAQ(); startQ(); });
q = await page.evaluate(() => ({ cur, pl: document.getElementById('pl').textContent, a: answers.slice(0, 4), slider: document.getElementById('sl').value }));
ok('return resumes question 5 with her answers intact', q.cur === 4 && q.pl === '5 of 12' && JSON.stringify(q.a) === '[3,4,5,6]');
ok('the display always matches cur (the old scramble stays impossible)', q.pl === (q.cur + 1) + ' of 12');
await page.close();

console.log('\nB3. Quiz autosave: a REFRESH lands her straight back on her question');
page = await newPage({});
await page.evaluate(() => {
  startQ();
  for (let i = 0; i < 5; i++) { document.getElementById('sl').value = '8'; onSl(8); nextQ(); }
});
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.show === 'function');
q = await page.evaluate(() => ({ scr: document.querySelector('.scr.act').id, pl: document.getElementById('pl').textContent, cur, a5: answers[4], pw: document.getElementById('pw').style.display }));
ok('refresh mid-quiz → back on the quiz screen, no curtain detour', q.scr === 's-quiz');
ok('same question, same answers, progress bar showing', q.pl === '6 of 12' && q.cur === 5 && q.a5 === 8 && q.pw === 'block');
// A STALE autosave (over 30 min) does not resurrect.
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('ss_quiz')); s.t = Date.now() - 31 * 60 * 1000; localStorage.setItem('ss_quiz', JSON.stringify(s)); show('s-wel'); startQ(); });
q = await page.evaluate(() => ({ pl: document.getElementById('pl').textContent, saved: localStorage.getItem('ss_quiz') }));
ok('a stale autosave starts fresh at question 1 and is dropped', q.pl === '1 of 12' && q.saved === null);
await page.close();

console.log('\nB4. Browser Back walks questions one at a time');
page = await newPage({});
await page.evaluate(() => {
  startQ();
  for (let i = 0; i < 3; i++) { document.getElementById('sl').value = '9'; onSl(9); nextQ(); }
});
ok('on question 4', await page.evaluate(() => document.getElementById('pl').textContent) === '4 of 12');
await page.goBack(); await page.waitForTimeout(120);
ok('Back → question 3, still on the quiz', await page.evaluate(() => document.querySelector('.scr.act').id + '|' + document.getElementById('pl').textContent) === 's-quiz|3 of 12');
await page.goBack(); await page.waitForTimeout(120);
await page.goBack(); await page.waitForTimeout(120);
ok('two more Backs → question 1', await page.evaluate(() => document.getElementById('pl').textContent) === '1 of 12');
await page.goBack(); await page.waitForTimeout(150);
ok('Back from question 1 leaves the quiz (to the origin screen)', await page.evaluate(() => document.querySelector('.scr.act').id) === 's-wel');
// The in-quiz back arrow rides the same stack.
await page.evaluate(() => { startQ(); document.getElementById('sl').value = '2'; onSl(2); nextQ(); });
await page.evaluate(() => prevQ());
await page.waitForTimeout(150);
ok('the on-screen back arrow steps back one question too', await page.evaluate(() => document.getElementById('pl').textContent + '|' + cur) === '1 of 12|0');
await page.close();

console.log('\nB5. Completing the quiz clears the autosave');
page = await newPage({});
jsonReply = { content: [{ type: 'text', text: '{"motto":"Shine.","portrait":"A lovely portrait, warm and specific, just for you. It celebrates your style. You shine."}' }] };
await page.evaluate(() => {
  localStorage.setItem('ss_email', 'x'); // quiet any email nudges
  startQ();
  for (let i = 0; i < 12; i++) { document.getElementById('sl').value = '7'; onSl(7); nextQ(); }
});
// 🚨 THE "results saved" FLAKE, DIAGNOSED AT LAST (2026-08-21). This file has
// called it a timing flake since 2026-07-31 without naming the mechanism, and
// the mechanism is HERE, not in the app: _resShowCompose() calls show('s-res')
// to paint the CLOSED DOORS while the /style-ai request is still in flight. So
// waiting for the screen id returns almost immediately, long before the reply
// lands and genResult() writes ss_data -- and the next line then races the
// round trip. Under load the request takes longer and the race is lost more
// often, which is exactly why it "comes and goes".
// ▶ Wait for the OBSERVABLE OUTCOME of the reply (the portrait text actually
// rendered), then assert the save. The claim under test is unchanged; only the
// thing we wait for is now the thing we meant.
await page.waitForFunction(() => {
  const act = document.querySelector('.scr.act');
  const rp = document.getElementById('rp');
  return act && act.id === 's-res' && rp && rp.textContent.trim().length > 20;
}, null, { timeout: 15000 });
q = await page.evaluate(() => ({ saved: localStorage.getItem('ss_quiz'), path: location.pathname, data: !!localStorage.getItem('ss_data') }));
ok('autosave cleared on completion', q.saved === null);
ok('the portrait now lives at /results in the address bar', q.path === '/results');
ok('results saved (so a refresh of /results can reopen them)', q.data);
ok('no page errors across the whole quiz drive', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB6. The /results route');
page = await newPage({ seed: FULL_SEED, path: '/results' });
await page.waitForTimeout(400);
q = await page.evaluate(() => ({ scr: document.querySelector('.scr.act').id, path: location.pathname }));
ok('with saved results: /results opens the Style Portrait', q.scr === 's-res' && q.path === '/results', JSON.stringify(q));
await page.goBack(); await page.waitForTimeout(200);
ok('Back from the deep-linked portrait lands on her home (Welcome Back)', await page.evaluate(() => document.querySelector('.scr.act').id) === 's-wb');
ok('no page errors (seeded /results)', page.errors.length === 0, page.errors.join(' | '));
await page.close();

page = await newPage({ path: '/results' });
await page.waitForTimeout(300);
q = await page.evaluate(() => ({ scr: document.querySelector('.scr.act').id, path: location.pathname }));
ok('without saved results: honest fallback to welcome, URL cleaned to /', q.scr === 's-wel' && q.path === '/', JSON.stringify(q));
ok('no page errors (fresh /results)', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB7. Navigating in-app still writes /results only on the portrait');
page = await newPage({ seed: FULL_SEED });
q = await page.evaluate(() => {
  const out = {};
  loadSaved(); out.res = location.pathname;
  show('s-faq'); out.faq = location.pathname;
  goHome(); out.home = location.pathname;
  return out;
});
ok('portrait → /results, FAQ → /faq, home → /', q.res === '/results' && q.faq === '/faq' && q.home === '/', JSON.stringify(q));
ok('no page errors', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
