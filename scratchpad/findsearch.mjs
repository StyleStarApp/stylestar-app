// The Amazon Finds search bar (her ask, 2026-09-22, after her friend Carrie
// gave up scrolling before she reached Shoes). Real browser, real page, real
// 73-piece CSV -- not a fixture, because the whole point being tested is
// whether a woman's actual word finds her actual shelf.
//
// THE LOAD-BEARING CASE THIS SUITE EXISTS TO PIN: a plain word search for
// "shoes" against ONLY the item name/note/store would find NOTHING -- no
// Shoes-category item literally contains the word "shoe" (mules, sandals,
// boots, sneakers, espadrilles). The category heading has to be part of the
// search, or the exact search this was built for returns empty-handed.
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
const page = await browser.newPage();
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(200);

const visibleItemNames = () => page.evaluate(() => {
  const wrap = document.querySelector('#s-finds .dc-wrap');
  return [...wrap.querySelectorAll('.dc-item')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.querySelector('.dc-item-name').textContent);
});
const visibleCatNames = () => page.evaluate(() => {
  const wrap = document.querySelector('#s-finds .dc-wrap');
  // a search hides a whole SECTION now (heading and all), so read the section's display
  return [...wrap.querySelectorAll('.dc-cat')].filter(n => getComputedStyle(n.closest('.dc-sec') || n).display !== 'none' && getComputedStyle(n).display !== 'none').map(n => n.textContent);
});
const search = async (v) => { await page.fill('#findsSearchInput', v); await page.waitForTimeout(120); };

// ▶ 2026-10-13, HER REBUILD: 165 pieces in 15 sections, each section showing 8
//   (notes first) behind a "Show all N". So "unfiltered" is no longer every card
//   on screen -- it is every section showing up to its cap, and every count here
//   is DERIVED from her CSV, never typed, so her next batch does not turn it red.
const { load, SECTION_CAP } = await import(path.join(ROOT, 'scripts/finds-from-csv.js'));
const ROWS = load(path.join(ROOT, 'data/amazon-finds.csv'));
const TOTAL = ROWS.length;
const bySec = ROWS.reduce((m, r) => (m[r.category] = (m[r.category] || 0) + 1, m), {});
// 2026-10-13, her final layout: every card is on the page (two up top, the rest in a
// swipe row), so "unfiltered" is every piece -- nothing is hidden behind a button
const UNFILTERED = TOTAL;
console.log('1. THE PAGE STARTS UNFILTERED');
const allNames = await visibleItemNames();
ok(allNames.length === UNFILTERED, 'every piece is on the page with no search typed (' + allNames.length + ' of ' + TOTAL + ')');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchClear')).display)) === 'none', 'the clear (×) button is hidden with nothing typed');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchEmpty')).display)) === 'none', 'the empty-state line is hidden with nothing typed');

console.log('2. HER FRIEND\'S REAL SEARCH: "shoes" MUST FIND THE SHOES CATEGORY');
await search('shoes');
const shoeNames = await visibleItemNames();
const shoeCats = await visibleCatNames();
ok(shoeCats.includes('Comfy Shoes'), 'the Comfy Shoes heading is shown');
ok(shoeNames.includes('Kitten Heel Mules') && shoeNames.includes('Arch Support Flip Flops'), 'real Comfy Shoes pieces are shown, though neither says "shoe" in its own name');
// read off the page, never typed: a name is hers to edit (this check went red the
// day she renamed "Soncino Sandal, Nude" to "Nude Nappa")
const capped1 = await page.evaluate(() => { const e = document.querySelector('#s-finds .dc-sec[data-cat="comfy-shoes"] .dc-extra .dc-item-name'); return e && e.textContent; });
ok(!!capped1 && shoeNames.includes(capped1), 'a piece hidden past the section cap of ' + SECTION_CAP + ' is reached by the search, her rule (' + capped1 + ')');
ok(!shoeNames.includes('Striped Cropped Cardigan'), 'an unrelated piece (a cardigan) is not shown');
ok(!shoeCats.includes('Lips'), 'a section with nothing matching is hidden, not left as an empty heading');
ok(await page.evaluate(() => [...document.querySelectorAll('#s-finds .dc-showall')].every(b => getComputedStyle(b).display === 'none')), 'no "Show all" button shows while she searches -- the search already shows them all');
await search('shoe');
ok((await visibleItemNames()).includes('Non-Slip Shoe Sole Grips'), 'a piece from a DIFFERENT section whose own name says "shoe" is also found');

console.log('3. A BARE SECTION WORD SHOWS THAT SECTION');
await search('lips');
ok(JSON.stringify(await visibleCatNames()) === '["Lips"]', 'searching a bare section word ("lips") shows exactly that one section (' + (await visibleCatNames()).join(', ') + ')');

console.log('4. AN ORDINARY WORD SEARCH STILL WORKS (name/note/store, not just category)');
await search('crz yoga');
const crzNames = await visibleItemNames();
const CRZ = ROWS.filter(r => /crz yoga/i.test(r.store)).map(r => r.name);
ok(crzNames.length === CRZ.length && CRZ.length > 0 && crzNames.every(n => CRZ.includes(n)), 'a store-name search finds exactly her ' + CRZ.length + ' CRZ YOGA pieces (' + crzNames.join(', ') + ')');

console.log('5. A REAL MISS SAYS SO HONESTLY, AND OFFERS A WAY OUT');
await search('zzzznotarealthingoranywhere');
ok((await visibleItemNames()).length === 0, 'a nonsense search shows zero pieces');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchEmpty')).display)) !== 'none', 'the empty-state message appears');
ok((await page.evaluate(() => document.getElementById('findsSearchEmptyTerm').textContent)) === 'zzzznotarealthingoranywhere', 'the empty-state message names her actual search term, not a generic shrug');

console.log('6. THE CLEAR BUTTON UNDOES THE SEARCH AND REFOCUSES THE FIELD');
await page.click('#findsSearchClear');
await page.waitForTimeout(120);
ok((await visibleItemNames()).length === UNFILTERED, 'clearing restores the page as it was (' + UNFILTERED + ' showing)');
ok((await page.inputValue('#findsSearchInput')) === '', 'the input itself is emptied');
ok(await page.evaluate(() => document.activeElement === document.getElementById('findsSearchInput')), 'focus returns to the search field after clearing');

console.log('7. LEAVING AND RETURNING TO THE PAGE NEVER LEAVES HER STUCK ON AN OLD FILTER');
await search('shoes');
await page.evaluate(() => { closeFinds(); });
await page.waitForTimeout(100);
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(150);
ok((await visibleItemNames()).length === UNFILTERED, 'reopening Amazon Finds shows the whole page again, not the last filter she left it on');
ok((await page.inputValue('#findsSearchInput')) === '', 'the search box itself is empty on return, not silently holding her old word');

console.log('8. NOTHING ELSE ON THE PAGE BROKE');
ok((await page.evaluate(() => document.querySelectorAll('#s-finds .dc-item').length)) === TOTAL, 'the DOM still holds all ' + TOTAL + ' real .dc-item nodes -- the search hides with display, it never deletes');
console.log('9. TWO UP TOP, A SWIPE ROW, AND "SHOW N MORE" TURNS THE ROW INTO A GRID (her layout, 2026-10-13)');
const big = Object.entries(bySec).find(([, n]) => n > SECTION_CAP);
const st = await page.evaluate(([cat, cap]) => {
  const sec = [...document.querySelectorAll('#s-finds .dc-sec')].find(s => s.querySelector('.dc-cat').textContent === cat);
  const row = sec.querySelector('.dc-morerow'), btn = sec.querySelector('.dc-showall');
  const look = () => ({ rowDisplay: getComputedStyle(row).display, label: btn.textContent, exp: btn.getAttribute('aria-expanded'),
    hint: getComputedStyle(sec.querySelector('.dc-swipehint')).display,
    boxless: [...row.querySelectorAll('.dc-item')].filter(c => !c.querySelector('.dc-item-name').getClientRects().length).length,
    sameWidth: Math.abs(row.querySelector('.dc-item').getBoundingClientRect().width - sec.querySelector('.dc-grid .dc-item').getBoundingClientRect().width) < 1.5 });
  const top = sec.querySelectorAll('.dc-grid .dc-item').length, rowN = row.querySelectorAll('.dc-item').length;
  const a = look(); btn.click(); const b = look(); btn.click(); const c = look();
  return { top, rowN, a, b, c };
}, [big[0], SECTION_CAP]);
ok(st.top === SECTION_CAP && st.top + st.rowN === big[1], big[0] + ': ' + SECTION_CAP + ' up top, the other ' + (big[1] - SECTION_CAP) + ' in the swipe row (' + JSON.stringify([st.top, st.rowN]) + ')');
ok(st.a.rowDisplay === 'flex' && st.a.hint !== 'none' && st.a.label === 'Show ' + (big[1] - SECTION_CAP) + ' more' && st.a.exp === 'false', 'closed: a swipe row, "Swipe for" showing, and "Show ' + (big[1] - SECTION_CAP) + ' more"');
ok(st.a.sameWidth, 'the swipe row\'s cards are exactly the width of the cards above (her catch: no skinnier photos)');
ok(st.b.rowDisplay === 'grid' && st.b.hint === 'none' && st.b.label === 'Show less' && st.b.exp === 'true', 'one tap turns the same row into a grid, and the button offers "Show less"');
ok(st.b.boxless === 0, 'every card in the grid keeps its photo square, name and price (the Chromium redraw fault, caught 2026-10-13)');
ok(st.c.rowDisplay === 'flex' && st.c.label === st.a.label, '"Show less" folds it back into the swipe row');
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await search('a');
await search('');
ok(pageErrors.length === 0, 'no page errors while typing/clearing (' + pageErrors.join('; ') + ')');

await browser.close();
server.close();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
