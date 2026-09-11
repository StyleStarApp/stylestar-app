// Amazon Finds — her new curated page (2026-09-10).
//
//   node scratchpad/findspage.js
//
// ▶▶ SECTIONS 2 AND 3 ARE WHY THIS SUITE EXISTS.
// §2 is the same money check that caught the Edit's trap: the page's links are
// tagged at RUNTIME by _wlDecorateEdit(), which only openFinds() calls. A bare
// show('s-finds') would serve her hand-picked page with untagged links and
// every card would look perfectly normal.
// §3 guards the decision she actually made: the HEADING may say Amazon and the
// PATH may not, because a path can never move once shared and she has already
// said she might broaden this page beyond Amazon.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8934, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const p = new URL(req.url, ORIGIN).pathname;
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (n, c, e) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (e ? '  → ' + e : '')); } };

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, body: '{"success":true}' }));

const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const edge = fs.readFileSync(path.join(ROOT, 'netlify/edge-functions/page-titles.js'), 'utf8');

console.log('\n1. A COLD LANDING ON /finds OPENS HER PAGE');
await page.goto(ORIGIN + '/finds', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openFinds === 'function');
await page.waitForTimeout(450);
ok('the active screen is s-finds', (await page.evaluate(() => (document.querySelector('.scr.act') || {}).id)) === 's-finds');
const txt = await page.evaluate(() => document.querySelector('.scr.act').innerText);
ok('the heading says Amazon Finds', /amazon finds/i.test(txt));
ok('it says the pieces are hand selected by her', /hand selected by catherine/i.test(txt));
ok('the address bar stays /finds', (await page.evaluate(() => location.pathname)) === '/finds');
ok('exactly one affiliate disclosure', (await page.evaluate(() => document.querySelectorAll('#s-finds .dc-disclosure').length)) === 1);

console.log('\n2. 🚨 THE MONEY CHECK — HER LINKS TAG THEMSELVES');
// With no tag set yet, an Amazon url must come back UNTOUCHED: the app never
// pretends to earn before she is an Associate. With a tag set, every Amazon
// link must carry it, and never twice.
const wrap = await page.evaluate(() => {
  const before = window._affUrl('https://www.amazon.com/dp/B01234567');
  const wasEmpty = window._AMZ_TAG === '';
  window._AMZ_TAG = 'stylestar-20';
  const after = window._affUrl('https://www.amazon.com/dp/B01234567');
  const q = window._affUrl('https://www.amazon.com/s?k=white+dress');
  const twice = window._affUrl(after);
  const rak = window._affUrl('https://www.olivela.com/products/x');
  window._AMZ_TAG = wasEmpty ? '' : window._AMZ_TAG;
  return { before, after, q, twice, rak, wasEmpty };
});
ok('the tag is EMPTY today, so nothing claims a commission she has not got', wrap.wasEmpty);
ok('with no tag an Amazon link is returned untouched', wrap.before === 'https://www.amazon.com/dp/B01234567', wrap.before);
ok('with a tag set an Amazon link carries it', /[?&]tag=stylestar-20/.test(wrap.after), wrap.after);
ok('a url that already has a query gets & not ?', /\?k=white\+dress&tag=/.test(wrap.q), wrap.q);
ok('it never double-tags', (wrap.twice.match(/tag=/g) || []).length === 1, wrap.twice);
ok('Rakuten shops still wrap the old way, untouched by the Amazon branch',
   wrap.rak.indexOf('click.linksynergy.com') >= 0);

// ⚠️ THE PAGE IS EMPTY UNTIL SHE ADDS HER PIECES, so nothing above proves the
// decorator REACHES this new screen. Inject a real .dc-item, reopen the page the
// way a woman does, and check it came out tagged. This is the check that bites
// if _wlEditItems' selector ever narrows back to #s-dream alone, or if anything
// opens this page with a bare show().
const injected = await page.evaluate(() => {
  const wrap = document.querySelector('#s-finds .dc-wrap');
  const d = document.createElement('div');
  d.className = 'dc-item';
  d.innerHTML = '<div class="dc-item-name">Test Piece</div>'
    + '<a class="dc-item-btn" href="https://www.amazon.com/dp/TEST123" rel="sponsored noopener">Shop this item</a>';
  wrap.appendChild(d);
  window._AMZ_TAG = 'stylestar-20';
  window.openFinds();
  const a = document.querySelector('#s-finds .dc-item-btn[href*="TEST123"]');
  const href = a ? a.getAttribute('href') : '';
  const saved = !!d.querySelector('.wl-save');
  d.remove(); window._AMZ_TAG = '';
  return { href, saved };
});
ok('a piece added to THIS page gets affiliate-tagged when the page opens',
   /[?&]tag=stylestar-20/.test(injected.href), injected.href || '(no link found)');
ok('and it gets the save control too, with nothing for her to add by hand',
   injected.saved);

console.log('\n3. HER NAMING DECISION IS GUARDED');
ok('the PATH carries no Amazon mark (it can never move once shared)',
   !/from = "\/[^"]*amazon/i.test(toml) && !/'s-finds':'\/[^']*amazon/i.test(idx));
ok('the path is /finds', /'s-finds':'\/finds'/.test(idx));
ok('/finds is a 200 rewrite, not a 301', /from = "\/finds"\s*\n\s*to = "\/index\.html"\s*\n\s*status = 200/.test(toml));
ok('/finds is registered as an edge function', /path = "\/finds"\s*\n\s*function = "page-titles"/.test(toml));
ok('the HEADING is free to say Amazon, and does', /Amazon Finds<\/div>/.test(idx));
ok('Amazon\'s own LOGO is never used (keeps their trademark notice untriggered)',
   !/amazon[-_]?logo|logo.*amazon\.(png|svg|jpg)/i.test(idx));

console.log('\n4. THE SHARE PREVIEW, AND THE TWO COPIES DO NOT DRIFT');
const meta = await page.evaluate(() => ({
  t: document.title,
  d: (document.querySelector('meta[name="description"]') || {}).content || '',
  u: (document.querySelector('meta[property="og:url"]') || {}).content || '',
}));
ok('the tab title is her page, not the homepage', /Amazon Finds/.test(meta.t), meta.t);
ok('the description carries her high/low sentence', /high and low/i.test(meta.d), meta.d.slice(0, 70));
ok('og:url points at /finds', /\/finds$/.test(meta.u), meta.u);
const eT = (edge.match(/PAGES\['\/finds'\][\s\S]{0,400}?title: '([^']+)'/) || [])[1] || '';
const eD = (edge.match(/PAGES\['\/finds'\][\s\S]{0,400}?desc: '([^']+)'/) || [])[1] || '';
const iT = (idx.match(/'s-finds':\{title:'([^']+)'/) || [])[1] || '';
const iD = (idx.match(/'s-finds':\{title:'[^']+',desc:'([^']+)'/) || [])[1] || '';
ok('title matches word for word in both files', !!eT && eT === iT, eT + '  vs  ' + iT);
ok('description matches word for word in both files', !!eD && eD === iD);

console.log('\n5. THE TWO PAGES POINT AT EACH OTHER — HER OWN LINE');
ok('the Finds page carries her sentence', /mixing high and low is how i dress my clients/i.test(txt));
ok('and it links to the Edit', (await page.evaluate(() => !!document.querySelector('#s-finds .dc-trend-link[onclick*="showDream"]'))));
await page.evaluate(() => window.showDream());
await page.waitForTimeout(350);
const etxt = await page.evaluate(() => document.querySelector('.scr.act').innerText);
ok('the Edit carries the same sentence', /mixing high and low is how i dress my clients/i.test(etxt));
ok('and it links back to Finds', (await page.evaluate(() => !!document.querySelector('#s-dream .dc-trend-link[onclick*="openFinds"]'))));
ok('the Edit still works and still wraps its own links',
   (await page.evaluate(() => {
     const mid = Object.keys(window._AFF_MID || {});
     return [...document.querySelectorAll('#s-dream .dc-item-btn')].every(a => {
       const h = a.getAttribute('href') || '';
       let host = ''; try { host = new URL(h.indexOf('murl=') >= 0 ? decodeURIComponent(h.split('murl=')[1]) : h).hostname.replace(/^www\./, ''); } catch (e) {}
       return !mid.some(d => host === d || host.endsWith('.' + d)) || h.indexOf('click.linksynergy.com') >= 0;
     });
   })));

console.log('\n6. NOTHING THREW');
ok('no page errors', errors.length === 0, errors[0]);

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
