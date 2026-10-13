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
const UNFILTERED = Object.values(bySec).reduce((t, n) => t + Math.min(n, SECTION_CAP), 0);
console.log('1. THE PAGE STARTS UNFILTERED');
const allNames = await visibleItemNames();
ok(allNames.length === UNFILTERED, 'every section shows up to ' + SECTION_CAP + ' with no search typed (' + allNames.length + ' of ' + TOTAL + ')');
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
console.log('9. "SHOW ALL" OPENS A SECTION IN PLACE');
const capped = Object.entries(bySec).find(([, n]) => n > SECTION_CAP);
const opened = await page.evaluate(cat => {
  const sec = [...document.querySelectorAll('#s-finds .dc-sec')].find(s => s.querySelector('.dc-cat').textContent === cat);
  const vis = () => [...sec.querySelectorAll('.dc-item')].filter(n => getComputedStyle(n).display !== 'none').length;
  const before = vis(), btn = sec.querySelector('.dc-showall'), label = btn && btn.textContent;
  btn.click();
  return { before, after: vis(), label, gone: !sec.querySelector('.dc-showall') };
}, capped[0]);
ok(opened.before === SECTION_CAP && opened.label === 'Show all ' + capped[1], capped[0] + ' shows ' + SECTION_CAP + ' and offers "Show all ' + capped[1] + '" (' + JSON.stringify(opened) + ')');
ok(opened.after === capped[1] && opened.gone, '...and one tap shows every piece, and the button steps away');
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await search('a');
await search('');
ok(pageErrors.length === 0, 'no page errors while typing/clearing (' + pageErrors.join('; ') + ')');

await browser.close();
server.close();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
