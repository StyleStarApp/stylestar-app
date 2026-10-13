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
// ▶ 2026-10-13: named from HER CSV, never typed here, so a section she renames
//   or retires (she retired Shoes and Jewelry that day) never turns this red
const { load } = await import(path.join(ROOT, 'scripts/finds-from-csv.js'));
const CATS = [...new Set(load(path.join(ROOT, 'data/amazon-finds.csv')).map(r => r.category).filter(Boolean))];
ok(JSON.stringify(pillLabels) === JSON.stringify(CATS), 'her section names appear verbatim as pills, in her CSV order');
const CAT_A = CATS[Math.min(3, CATS.length - 1)], CAT_B = CATS[Math.floor(CATS.length / 2)];
const startVisible = await page.evaluate(() => [...document.querySelectorAll('#s-finds .dc-item')].filter(n => getComputedStyle(n).display !== 'none').length);
const opts = await page.evaluate(() => [...document.getElementById('findsSecSel').options].slice(1).map(o => o.textContent));
ok(JSON.stringify(opts) === JSON.stringify(pillLabels), 'the "Jump to" dropdown lists exactly the same sections as the pills');

console.log('2. TAPPING A PILL SCROLLS TO THAT CATEGORY, CLEAR OF THE FIXED MENU CHIP');
const shoesIndex = pillLabels.indexOf(CAT_A);
await page.evaluate(i => findsCatNavJump(i), shoesIndex);
await page.waitForTimeout(1100);
const shoesTop = await page.evaluate(n => [...document.querySelectorAll('#s-finds .dc-cat')].find(c => c.textContent === n).getBoundingClientRect().top, CAT_A);
ok(shoesTop >= 55 && shoesTop <= 120, `the "${CAT_A}" heading lands between the chip and comfortably on screen (measured top: ${shoesTop}px)`);

console.log('3. JUMPING WHILE A SEARCH IS ACTIVE CLEARS THE SEARCH FIRST');
await page.fill('#findsSearchInput', 'lips');
await page.waitForTimeout(150);
const jewelryIndex = pillLabels.indexOf(CAT_B);
// through the DROPDOWN this time, the other door to the same jump
await page.selectOption('#findsSecSel', String(jewelryIndex));
await page.waitForTimeout(1100);
ok((await page.inputValue('#findsSearchInput')) === '', 'the search box is emptied by the jump');
const visibleAfterJump = await page.evaluate(() => [...document.querySelectorAll('#s-finds .dc-item')].filter(n => getComputedStyle(n).display !== 'none').length);
ok(visibleAfterJump === startVisible, `the page is back as it was after the jump clears the filter (${visibleAfterJump} of ${startVisible})`);
ok((await page.inputValue('#findsSecSel')) === '', 'the dropdown resets to "Jump to…" after a jump');
const jewelryTop = await page.evaluate(n => [...document.querySelectorAll('#s-finds .dc-cat')].find(c => c.textContent === n).getBoundingClientRect().top, CAT_B);
ok(jewelryTop >= 55 && jewelryTop <= 120, `the "${CAT_B}" heading actually lands on screen after the clear-then-jump (measured top: ${jewelryTop}px)`);

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
