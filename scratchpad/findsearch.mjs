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
  return [...wrap.querySelectorAll('.dc-cat')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.textContent);
});
const search = async (v) => { await page.fill('#findsSearchInput', v); await page.waitForTimeout(120); };

console.log('1. THE PAGE STARTS UNFILTERED');
const allNames = await visibleItemNames();
ok(allNames.length === 73, 'all 73 pieces show with no search typed (' + allNames.length + ')');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchClear')).display)) === 'none', 'the clear (×) button is hidden with nothing typed');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchEmpty')).display)) === 'none', 'the empty-state line is hidden with nothing typed');

console.log('2. HER FRIEND\'S REAL SEARCH: "shoes" MUST FIND THE SHOES CATEGORY');
await search('shoes');
const shoeNames = await visibleItemNames();
const shoeCats = await visibleCatNames();
ok(shoeCats.includes('Shoes'), 'the Shoes category heading is shown');
ok(shoeNames.includes('Kitten Heel Mules') && shoeNames.includes('Arch Support Flip Flops') && shoeNames.includes('J. Renee Sandal'), 'real Shoes-category pieces are shown, none of which say the word "shoe" in their own name');
ok(shoeNames.includes('Reebok Training Shoes'), 'a piece from a DIFFERENT category whose own name says "Shoes" is also found');
ok(!shoeNames.includes('Cropped Cardigan'), 'an unrelated piece (a cardigan) is not shown');
ok(!shoeCats.includes('Wraps & Layers'), 'a category with nothing matching is hidden, not left as an empty heading');

console.log('3. A CATEGORY NAME IS ITSELF A VALID SEARCH TERM');
await search('jewelry');
ok((await visibleCatNames()).length === 1 && (await visibleCatNames())[0] === 'Jewelry & Other Accessories', 'searching a bare category word ("jewelry") shows exactly that one category');

console.log('4. AN ORDINARY WORD SEARCH STILL WORKS (name/note/store, not just category)');
await search('crz yoga');
const crzNames = await visibleItemNames();
ok(crzNames.length === 4 && crzNames.every(n => ['Butterluxe Adjustable Sports Bra', 'Butterluxe Twist Back Crop Tank Tops', 'Butterluxe Leggings', 'Fleece Thermal Leggings'].includes(n)), 'a store-name search finds exactly her four CRZ YOGA pieces (' + crzNames.join(', ') + ')');

console.log('5. A REAL MISS SAYS SO HONESTLY, AND OFFERS A WAY OUT');
await search('zzzznotarealthingoranywhere');
ok((await visibleItemNames()).length === 0, 'a nonsense search shows zero pieces');
ok((await page.evaluate(() => getComputedStyle(document.getElementById('findsSearchEmpty')).display)) !== 'none', 'the empty-state message appears');
ok((await page.evaluate(() => document.getElementById('findsSearchEmptyTerm').textContent)) === 'zzzznotarealthingoranywhere', 'the empty-state message names her actual search term, not a generic shrug');

console.log('6. THE CLEAR BUTTON UNDOES THE SEARCH AND REFOCUSES THE FIELD');
await page.click('#findsSearchClear');
await page.waitForTimeout(120);
ok((await visibleItemNames()).length === 73, 'clearing restores all 73 pieces');
ok((await page.inputValue('#findsSearchInput')) === '', 'the input itself is emptied');
ok(await page.evaluate(() => document.activeElement === document.getElementById('findsSearchInput')), 'focus returns to the search field after clearing');

console.log('7. LEAVING AND RETURNING TO THE PAGE NEVER LEAVES HER STUCK ON AN OLD FILTER');
await search('shoes');
await page.evaluate(() => { closeFinds(); });
await page.waitForTimeout(100);
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(150);
ok((await visibleItemNames()).length === 73, 'reopening Amazon Finds shows all 73 pieces again, not the last filter she left it on');
ok((await page.inputValue('#findsSearchInput')) === '', 'the search box itself is empty on return, not silently holding her old word');

console.log('8. NOTHING ELSE ON THE PAGE BROKE');
ok((await page.evaluate(() => document.querySelectorAll('#s-finds .dc-item').length)) === 73, 'the DOM still holds all 73 real .dc-item nodes -- the search hides with display, it never deletes');
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await search('a');
await search('');
ok(pageErrors.length === 0, 'no page errors while typing/clearing (' + pageErrors.join('; ') + ')');

await browser.close();
server.close();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
