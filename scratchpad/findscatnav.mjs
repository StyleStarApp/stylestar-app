// The Amazon Finds category quick-jump nav (a second real tester's ask,
// 2026-09-22, relayed by Cath's friend after her coworker also had to scroll
// forever to find Shoes). Rendered from the LIVE .dc-cat headings, so this
// suite proves it tracks the real page rather than a hardcoded list.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(f);
  res.writeHead(200, { 'Content-Type': { '.css': 'text/css', '.html': 'text/html' }[ext] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ FAIL: ' + name); } };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(200);

console.log('1. THE NAV RENDERS ONE REAL PILL PER LIVE CATEGORY, NOT A HARDCODED LIST');
const pillLabels = await page.evaluate(() => Array.from(document.querySelectorAll('#findsCatNav .dc-catnav-btn')).map(b => b.textContent));
const realCatCount = await page.evaluate(() => document.querySelectorAll('#s-finds .dc-cat').length);
ok(pillLabels.length === realCatCount && realCatCount > 0, `pill count (${pillLabels.length}) matches real .dc-cat count (${realCatCount})`);
ok(pillLabels.includes('Shoes') && pillLabels.includes('Jewelry & Other Accessories'), 'real category names appear verbatim as pills');

console.log('2. TAPPING A PILL SCROLLS TO THAT CATEGORY, CLEAR OF THE FIXED MENU CHIP');
const shoesIndex = pillLabels.indexOf('Shoes');
await page.evaluate(i => findsCatNavJump(i), shoesIndex);
await page.waitForTimeout(1100);
const shoesTop = await page.evaluate(() => document.querySelector('#s-finds .dc-cat').parentElement && [...document.querySelectorAll('#s-finds .dc-cat')].find(c => c.textContent === 'Shoes').getBoundingClientRect().top);
ok(shoesTop >= 55 && shoesTop <= 120, `Shoes heading lands between the chip and comfortably on screen (measured top: ${shoesTop}px)`);

console.log('3. JUMPING WHILE A SEARCH IS ACTIVE CLEARS THE SEARCH FIRST');
await page.fill('#findsSearchInput', 'jewelry');
await page.waitForTimeout(150);
const jewelryIndex = pillLabels.indexOf('Jewelry & Other Accessories');
await page.evaluate(i => findsCatNavJump(i), jewelryIndex);
await page.waitForTimeout(1100);
ok((await page.inputValue('#findsSearchInput')) === '', 'the search box is emptied by the jump');
const visibleAfterJump = await page.evaluate(() => [...document.querySelectorAll('#s-finds .dc-item')].filter(n => getComputedStyle(n).display !== 'none').length);
ok(visibleAfterJump === 73, `all 73 pieces are visible again after the jump clears the filter (saw ${visibleAfterJump})`);
const jewelryTop = await page.evaluate(() => [...document.querySelectorAll('#s-finds .dc-cat')].find(c => c.textContent === 'Jewelry & Other Accessories').getBoundingClientRect().top);
ok(jewelryTop >= 55 && jewelryTop <= 120, `Jewelry heading actually lands on screen after the clear-then-jump (measured top: ${jewelryTop}px)`);

console.log('4. THE NAV SURVIVES A RETURN VISIT (RE-RENDERED FRESH, NOT STALE)');
await page.evaluate(() => { closeFinds(); });
await page.waitForTimeout(100);
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(200);
const pillLabels2 = await page.evaluate(() => Array.from(document.querySelectorAll('#findsCatNav .dc-catnav-btn')).map(b => b.textContent));
ok(JSON.stringify(pillLabels2) === JSON.stringify(pillLabels), 'the same real categories render again on reopen');

console.log('5. NOTHING ELSE ON THE PAGE BROKE');
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await page.evaluate(i => findsCatNavJump(i), 0);
await page.waitForTimeout(300);
ok(pageErrors.length === 0, 'no page errors while using the nav (' + pageErrors.join('; ') + ')');

await browser.close();
server.close();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
