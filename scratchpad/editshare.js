// The Style Star Edit as a shareable link (2026-09-10, her ask: "I want the
// Edit to be a shareable link").
//
//   node scratchpad/editshare.js
//
// ▶▶ THE CHECK THIS SUITE EXISTS FOR IS SECTION 2, AND IT GUARDS MONEY.
// The Edit's markup holds RAW product urls on purpose -- _wlDecorateEdit()
// affiliate-wraps them in the browser, so a piece she adds by hand needs no
// plumbing. That wrap is called by showDream() and by nothing else. So a
// direct landing on /edit that used a bare show('s-dream') would render her
// whole curated Edit with links that earn NOTHING, on the one page she
// actually sends to people -- and every card would look perfectly normal.
// ⚠️ Proven to bite: putting show('s-dream') back fails section 2 and only
// section 2.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8931, ORIGIN = 'http://localhost:' + PORT;
// Falls through to index.html exactly as the netlify.toml rewrite does, so
// "land on /edit cold" here is the same journey a stranger makes.
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
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, body: '{"success":true}' }));

console.log('\n1. A COLD LANDING ON /edit OPENS THE EDIT');
await page.goto(ORIGIN + '/edit', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.showDream === 'function');
await page.waitForTimeout(500);
const act = await page.evaluate(() => (document.querySelector('.scr.act') || {}).id || '');
ok('the active screen is s-dream', act === 's-dream', 'got ' + act);
ok('her own heading is on screen', (await page.evaluate(() => document.querySelector('.scr.act').innerText)).includes('Style Star Edit'));
// ⚠️ CASE-INSENSITIVE ON PURPOSE: the tagline is uppercased by CSS, so
// innerText returns "CURATED BY CATHERINE" while the markup says "Curated by
// Catherine". A case-sensitive check here failed on a perfectly good page.
ok('"Curated by Catherine" is on screen', /curated by catherine/i.test(await page.evaluate(() => document.querySelector('.scr.act').innerText)));
ok('the address bar still says /edit (not rewritten to /)',
   (await page.evaluate(() => location.pathname)) === '/edit',
   await page.evaluate(() => location.pathname));

console.log('\n2. 🚨 THE MONEY CHECK — A SHARED EDIT STILL EARNS');
const links = await page.evaluate(() => {
  const mid = Object.keys(window._AFF_MID || {});
  return [...document.querySelectorAll('#s-dream .dc-item-btn')].map(a => {
    const h = a.getAttribute('href') || '';
    let host = '';
    try { host = new URL(h.indexOf('murl=') >= 0 ? decodeURIComponent(h.split('murl=')[1]) : h).hostname.replace(/^www\./, ''); } catch (e) {}
    return { h, host, earns: mid.some(d => host === d || host.endsWith('.' + d)) };
  });
});
const shouldEarn = links.filter(l => l.earns);
// ⚠️ NOT a hardcoded floor -- the Edit's item count is hers to change (30 -> 28
// when she pulled two pieces on 2026-09-11/12, and it will move again). The
// rule this guards is "the page actually rendered its items", not any
// particular count -- see the Rule Ledger's "pin the rule, never the string".
ok('the Edit rendered its links', links.length > 0, links.length + ' links');
ok('some links are on merchants she is approved for', shouldEarn.length > 0, shouldEarn.length + ' of ' + links.length);
const unwrapped = shouldEarn.filter(l => l.h.indexOf('click.linksynergy.com') < 0);
ok('EVERY approved-merchant link is affiliate-wrapped on a COLD /edit landing',
   unwrapped.length === 0,
   unwrapped.length ? unwrapped.length + ' unwrapped, e.g. ' + unwrapped[0].host : '');
ok('a wrapped link carries her publisher id', shouldEarn.length === 0 || /id=[A-Za-z0-9]/.test(shouldEarn[0].h));
ok('no link is double-wrapped',
   !links.some(l => (l.h.match(/click\.linksynergy\.com/g) || []).length > 1));

console.log('\n3. THE SHARE PREVIEW A FRIEND SEES');
const meta = await page.evaluate(() => ({
  title: document.title,
  ogTitle: (document.querySelector('meta[property="og:title"]') || {}).content || '',
  ogDesc: (document.querySelector('meta[property="og:description"]') || {}).content || '',
  ogUrl: (document.querySelector('meta[property="og:url"]') || {}).content || '',
  canon: (document.querySelector('link[rel="canonical"]') || {}).href || '',
}));
ok('the tab title is the Edit, not the homepage', /Style Star Edit/.test(meta.title), meta.title);
ok('og:title is the Edit', /Style Star Edit/.test(meta.ogTitle), meta.ogTitle);
ok('og:description says the pieces are personally selected', /personally selected/i.test(meta.ogDesc), meta.ogDesc.slice(0, 60));
ok('og:description says nothing is chosen by AI', /chosen by AI/i.test(meta.ogDesc));
ok('og:url points at /edit', /\/edit$/.test(meta.ogUrl), meta.ogUrl);
ok('canonical points at /edit', /\/edit$/.test(meta.canon), meta.canon);

console.log('\n4. THE TWO COPIES DO NOT DRIFT (edge function vs the app)');
// An edge function is its own bundle and cannot import from index.html, so
// the title/description live in BOTH files. A drift means the card a friend
// sees differs from what she sees -- the exact journal-article mismatch.
const edge = fs.readFileSync(path.join(ROOT, 'netlify/edge-functions/page-titles.js'), 'utf8');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const eT = (edge.match(/PAGES\['\/edit'\][\s\S]{0,400}?title:\s*'([^']+)'/) || [])[1] || '';
const eD = (edge.match(/PAGES\['\/edit'\][\s\S]{0,400}?desc:\s*'([^']+)'/) || [])[1] || '';
const iT = (idx.match(/'s-dream':\{title:'([^']+)'/) || [])[1] || '';
const iD = (idx.match(/'s-dream':\{title:'[^']+',desc:'([^']+)'/) || [])[1] || '';
ok('the edge function has a /edit entry', !!eT, eT);
ok('title matches word for word in both files', !!eT && eT === iT, eT + '  vs  ' + iT);
ok('description matches word for word in both files', !!eD && eD === iD);
ok('/edit is registered as an edge function in netlify.toml',
   /path = "\/edit"\s*\n\s*function = "page-titles"/.test(fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8')));
ok('/edit is rewritten (status 200, not a 301) in netlify.toml',
   /from = "\/edit"\s*\n\s*to = "\/index\.html"\s*\n\s*status = 200/.test(fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8')));

console.log('\n5. IT DID NOT BREAK THE ORDINARY WAY IN');
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.showDream === 'function');
await page.evaluate(() => window.showDream());
await page.waitForTimeout(400);
ok('opening the Edit from inside the app still works',
   (await page.evaluate(() => (document.querySelector('.scr.act') || {}).id)) === 's-dream');
ok('and it puts /edit in the address bar',
   (await page.evaluate(() => location.pathname)) === '/edit');
ok('links are wrapped on that route too',
   (await page.evaluate(() => {
     const mid = Object.keys(window._AFF_MID || {});
     return [...document.querySelectorAll('#s-dream .dc-item-btn')].every(a => {
       const h = a.getAttribute('href') || '';
       let host = ''; try { host = new URL(h.indexOf('murl=') >= 0 ? decodeURIComponent(h.split('murl=')[1]) : h).hostname.replace(/^www\./, ''); } catch (e) {}
       return !mid.some(d => host === d || host.endsWith('.' + d)) || h.indexOf('click.linksynergy.com') >= 0;
     });
   })));
// Her rule: one disclosure per page, and the Edit keeps its own longer wording.
ok('the Edit still carries exactly one disclosure',
   (await page.evaluate(() => document.querySelectorAll('#s-dream .dc-disclosure').length)) === 1);
ok('every outbound Edit link is rel="sponsored"',
   (await page.evaluate(() => [...document.querySelectorAll('#s-dream .dc-item-btn')].every(a => (a.getAttribute('rel') || '').includes('sponsored')))));

console.log('\n6. THE SEARCH ENGINES ARE TOLD WHEN HER PAGES CHANGE');
/* 🚨 HER QUESTION, 2026-09-11: "as we add more items to Edit and Finds... do we
   need to resubmit to Google and bing for indexing? Or is that a one time
   thing?" ▶ Requesting indexing IS one-time; keeping <lastmod> honest is the
   forever half, and it is CLAUDE'S half, not hers.
   ⚠️ It has gone stale before (2026-08-31: the home page and /faq still claimed
   2026-08-24 after a week of edits). A date someone must remember to bump is a
   date that goes stale — so it is derived from a content hash and checked here.
   ▶ Proven to bite: planting one new .dc-item failed this with "/edit". */
const lm = (await import('child_process'))
  .spawnSync(process.execPath, [path.join(ROOT, 'scripts/sitemap-lastmod.js'), '--check'],
             { encoding: 'utf8' });
ok('every curated page\'s sitemap date matches what is actually on it',
   lm.status === 0, (lm.stderr || lm.stdout || '').trim().split('\n')[0]);
/* ⚠️ AND THE PAGES MUST BE IN THE SITEMAP AT ALL to have a date to keep honest. */
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const p of ['/edit', '/finds', '/trending'])
  ok(`${p} is listed in the sitemap, so crawlers find it unprompted`,
     sm.includes(`<loc>https://stylestar.app${p}</loc>`));

console.log('\n7. NOTHING THREW');
ok('no page errors', errors.length === 0, errors[0]);

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
