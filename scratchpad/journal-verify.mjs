// Verify the registry-driven Journal system behaves correctly: hub renders
// the article list from JOURNAL_ARTICLES, tapping a row opens the article,
// "More from the Style Journal" returns to the hub, Back from the hub goes
// home, and deep-linking straight to /journal and /journal/<slug> opens the
// right screen via the router. Also proves the netlify.toml rewrites work.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8946;
const T = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png', '.json':'application/json',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf', '.toml':'text/plain' };

// A tiny stand-in for Netlify's rewrite engine, reading the REAL netlify.toml
// so a typo there fails this test too.
const toml = fs.readFileSync('netlify.toml', 'utf8');
const redirects = [];
for (const m of toml.matchAll(/\[\[redirects\]\]\s*\n\s*from = "([^"]+)"\s*\n\s*to = "([^"]+)"\s*\n\s*status = 200/g)) {
  redirects.push({ from: m[1], to: m[2] });
}
function matchRedirect(p) {
  for (const r of redirects) {
    if (r.from === p) return r.to;
    if (r.from.endsWith('/*') && p.startsWith(r.from.slice(0, -1))) return r.to;
  }
  return null;
}

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  const rewrite = matchRedirect(p);
  if (rewrite) p = rewrite;
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport: { width: 390, height: 900 } });
pg.setDefaultTimeout(8000);
pg.setDefaultNavigationTimeout(8000);
// This sandbox's Chromium cannot reach fonts.googleapis.com -- it hangs
// rather than failing fast, which stalls goto's default waitUntil:'load'
// well past any sane timeout. Not testing pixels here, so just short-circuit
// the request instead of chasing renderfonts.mjs's real-font caching.
await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
function step(n) { console.log('STEP', n, new Date().toISOString().slice(11, 19)); }
const errors = [];
pg.on('pageerror', e => errors.push(String(e)));
pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.log('FAIL:', name); } }

// 1. Deep link straight to the hub.
step(1);
await pg.goto(`http://localhost:${PORT}/journal`, {waitUntil:'domcontentloaded'});
await pg.waitForTimeout(600);
ok('deep /journal opens the hub screen', await pg.evaluate(() => document.getElementById('s-journal-hub').classList.contains('act')));
ok('hub h1 says Style Journal', (await pg.textContent('#s-journal-hub h1')).trim() === 'Style Journal');
const rowCount = await pg.evaluate(() => document.querySelectorAll('#journalHubList .jhub-row').length);
ok('hub lists exactly the JOURNAL_ARTICLES entries', await pg.evaluate(() => document.querySelectorAll('#journalHubList .jhub-row').length === JOURNAL_ARTICLES.length));
ok('hub row shows the real article title', (await pg.textContent('.jhub-row-title')).trim() === 'How to Find Your Personal Style');

// 2. Tap the row -> opens the article, and Back returns to the hub (not past it).
step(2);
await pg.evaluate(() => document.querySelector('.jhub-row').click());
await pg.waitForTimeout(300);
ok('tapping the hub row opens the article screen', await pg.evaluate(() => document.getElementById('s-journal').classList.contains('act')));
await pg.evaluate(() => document.querySelector('#s-journal .top-back').click());
await pg.waitForTimeout(300);
ok('Back from an article opened via the hub returns to the hub', await pg.evaluate(() => document.getElementById('s-journal-hub').classList.contains('act')));

// 3. Back from the hub (nothing before it but a fresh visitor) goes home.
step(3);
await pg.evaluate(() => document.querySelector('#s-journal-hub .top-back').click());
await pg.waitForTimeout(300);
ok('Back from the hub (fresh visitor) lands on Welcome', await pg.evaluate(() => document.getElementById('s-wel').classList.contains('act')));

// 4. Deep link straight to the article (skipping the hub) -> "More from the
//    Style Journal" opens the hub, and Back from THAT hub visit goes home
//    (never straight back into the article, since she never chose to see it).
step(4);
await pg.goto(`http://localhost:${PORT}/journal/how-to-find-your-personal-style`, {waitUntil:'domcontentloaded'});
await pg.waitForTimeout(600);
ok('deep /journal/<slug> opens the article directly', await pg.evaluate(() => document.getElementById('s-journal').classList.contains('act')));
ok('article h1 is the real headline', (await pg.textContent('#s-journal h1')).trim() === 'How to Find Your Personal Style');
await pg.evaluate(() => { const l = [...document.querySelectorAll('.jrnl-lnk')].find(e => e.textContent.includes('More from')); l.click(); });
await pg.waitForTimeout(300);
ok('"More from the Style Journal" opens the hub', await pg.evaluate(() => document.getElementById('s-journal-hub').classList.contains('act')));

// 5. The Menu row opens the hub too. Drive it entirely through evaluate --
//    no Playwright actionability waits, since the entrance curtain and the
//    menu drawer's own CSS transitions are not the thing under test here.
step(5);
await pg.goto(`http://localhost:${PORT}/`, {waitUntil:'domcontentloaded'});
await pg.waitForTimeout(1500);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); menuOpen(); });
await pg.waitForTimeout(200);
const menuRow = await pg.evaluate(() => {
  const row = [...document.querySelectorAll('.menu-row')].find(e => e.textContent.trim().startsWith('Style Journal'));
  if (!row) return false;
  row.click();
  return true;
});
await pg.waitForTimeout(300);
ok('Menu row exists and opens the hub', menuRow && await pg.evaluate(() => document.getElementById('s-journal-hub').classList.contains('act')));

// 6. The old function names are gone, and the frame class covers both screens.
ok('old showJournal() is gone', await pg.evaluate(() => typeof window.showJournal === 'undefined'));
ok('journal-mirror frame applied to the hub too', await pg.evaluate(() => document.querySelector('.ss').classList.contains('journal-mirror')));

// 7. Unknown slug falls back gracefully rather than throwing.
step(7);
await pg.goto(`http://localhost:${PORT}/journal/not-a-real-article`, {waitUntil:'domcontentloaded'});
await pg.waitForTimeout(600);
ok('unknown slug does not crash the app (some screen is active)', await pg.evaluate(() => !!document.querySelector('.scr.act')));

console.log(`\n${pass} passed, ${fail} failed`);
console.log('JS errors seen:', errors.length ? errors : 'none');
await b.close();
srv.close();
const code = (fail || errors.length) ? 1 : 0;
console.log('exit code will be', code);
process.exitCode = code;
