// nameparity.js — the name-is-the-search GUARANTEE (2026-08-15, her catch).
// Her live shelf offered "Satin Draped Top" over a search for "white satin
// top" and Revolve answered with boxy cotton tees. The prompt rule was right
// and the model drifted, so _nameParity() now trims the name to what the
// search can actually deliver, before anything renders.
//
// Drives the REAL page in Chromium: the helper itself, then both renderers
// (_shopCard, the 4 card surfaces + wardrobe Ideas; _renderShop, Complete the
// Look), then the wishlist save, then her exact reported case end to end.
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((req, res) => { try { res.end(fs.readFileSync(path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]))) } catch (e) { res.statusCode = 404; res.end() } }).listen(8952);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
let pass = 0, fail = 0;
const ok = (l, c, extra) => { console.log((c ? '  ✓ ' : '  ✗ ') + l + (!c && extra ? '  → ' + extra : '')); c ? pass++ : fail++; };

const ctx = await b.newContext({viewport: {width: 390, height: 900}});
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));
await pg.route('**/.netlify/**', r => r.fulfill({status: 500, body: '{}'}));
await pg.goto('http://localhost:8952/');
await pg.waitForTimeout(2600);

// 1. The helper, on her real case and the shapes around it
const cases = await pg.evaluate(() => [
  // HER CASE: the name promised a silhouette the search never carried
  {in: {name: 'Satin Draped Top', search: 'white satin top', store: 'Revolve'}, want: 'Satin Top'},
  // the card one to its left on the same shelf
  {in: {name: 'Linen Relaxed Top', search: 'white linen top', store: 'Nordstrom Rack'}, want: 'Linen Top'},
  // puffery a search cannot deliver
  {in: {name: 'Classic White Crewneck Tee', search: 'white crewneck tee', store: 'Nordstrom'}, want: 'White Crewneck Tee'},
  // perfect parity is left completely alone
  {in: {name: 'White Linen Top', search: 'white linen top', store: 'J.Crew'}, want: 'White Linen Top'},
  // the search may carry a word the name does not (the row's own colour)
  {in: {name: 'Silk Blouse', search: 'white silk blouse', store: 'Talbots'}, want: 'Silk Blouse'},
  // hyphens survive against a spaced search
  {in: {name: 'Button-Front Blouse', search: 'button front blouse', store: 'Boden'}, want: 'Button-Front Blouse'},
  // plurals survive
  {in: {name: 'Kitten-Heel Mules', search: 'kitten heel mule', store: 'Sam Edelman'}, want: 'Kitten-Heel Mules'},
  // trimming below two words rebuilds the name from the search itself
  {in: {name: 'Refined Blouse', search: 'professional blouse', store: 'M.M.LaFleur'}, want: 'Professional Blouse'},
  // losing the HEAD NOUN rebuilds too — "White Scoop Neck" names nothing.
  // (A real live run produced exactly this pair, 2026-08-15.)
  {in: {name: 'White Scoop Neck Tee', search: 'white scoop neck top', store: 'Nordstrom'}, want: 'White Scoop Neck Top'},
  // a middle word going is fine, the noun still anchors it
  {in: {name: 'Cotton Boxy Tee', search: 'white cotton tee', store: 'Madewell'}, want: 'Cotton Tee'},
  // jewellery mood words survive (the prompt's own small-catalogue rule)
  {in: {name: 'Statement Hoop Earrings', search: 'hoop earrings', store: 'Kendra Scott'}, want: 'Statement Hoop Earrings'},
  // nothing to compare against → untouched
  {in: {name: 'Silk Blouse', search: '', store: 'Talbots'}, want: 'Silk Blouse'}
].map(c => ({label: c.in.name + ' ←→ "' + c.in.search + '"', got: _nameParity(c.in).name, want: c.want})));
cases.forEach(c => ok(c.label + ' → "' + c.want + '"', c.got === c.want, 'got "' + c.got + '"'));
ok('_nameParity never mutates the item it is given', await pg.evaluate(() => {
  const src = {name: 'Satin Draped Top', search: 'white satin top', store: 'Revolve'};
  _nameParity(src); return src.name === 'Satin Draped Top';
}));

// 2. Through the real card renderer (_shopCard → 4 surfaces + wardrobe Ideas)
const card = await pg.evaluate(() => {
  const html = _shopCard({name: 'Satin Draped Top', search: 'white satin top', store: 'Revolve'});
  const d = document.createElement('div'); d.innerHTML = html;
  return {
    name: d.querySelector('.shop-item-name').textContent,
    href: d.querySelector('.shop-link').getAttribute('href')
  };
});
ok('_shopCard renders the trimmed name', card.name === 'Satin Top', card.name);
ok('the link still searches the FULL search term', /white(%20|\+)satin(%20|\+)top/i.test(card.href), card.href);

// 3. Through Complete the Look's own renderer
const rows = await pg.evaluate(() => {
  _renderShop([{name: 'Classic Draped Satin Blouse', search: 'satin blouse', store: 'Nordstrom', category: 'top'}]);
  return [...document.querySelectorAll('#pShopList .sb strong')].map(n => n.textContent);
});
ok('Complete the Look trims too', rows[0] === 'Satin Blouse', rows.join('|'));

// 4. The wishlist save carries the trimmed name, not the broken promise
const saved = await pg.evaluate(() => {
  wardrobeData.wishlist = [];
  const d = document.createElement('div');
  d.innerHTML = _shopCard({name: 'Satin Draped Top', search: 'white satin top', store: 'Revolve'});
  document.body.appendChild(d);
  d.querySelector('.wl-save').click();
  const w = (wardrobeData.wishlist || [])[0] || {};
  d.remove();
  return {name: w.name || '', search: w.search || ''};
});
ok('a saved piece stores the trimmed name', saved.name === 'Satin Top', JSON.stringify(saved));
ok('a saved piece keeps its full search term', saved.search === 'white satin top', JSON.stringify(saved));

// 5. Her exact shelf, end to end: a fabricated AI response with both bad cards
await ctx.close();
const ctx2 = await b.newContext({viewport: {width: 390, height: 1100}});
const pg2 = await ctx2.newPage();
pg2.on('pageerror', e => errs.push(String(e)));
await pg2.route('**/.netlify/**', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({content: [{text: JSON.stringify({items: [
  {name: 'Linen Relaxed Top', search: 'white linen top', store: 'Nordstrom Rack'},
  {name: 'Satin Draped Top', search: 'white satin top', store: 'Revolve'},
  {name: 'Cotton Boxy Tee', search: 'white cotton tee', store: 'Madewell'},
  {name: 'Poplin Top', search: 'white poplin top', store: 'J.Crew'}
]})}]})}));
await pg2.goto('http://localhost:8952/');
await pg2.waitForTimeout(2600);
await pg2.evaluate(() => {
  localStorage.setItem('ss_data', JSON.stringify({userName: 'Cath', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
  topArchNames = ['The Timeless Classic']; quizTaken = true;
  openWardrobe();
});
await pg2.evaluate(() => wardrobeSeeIdeas('to1'));   // White tops, her row
await pg2.waitForTimeout(1400);
const shelf = await pg2.evaluate(() => [...document.querySelectorAll('#wx_to1 .shop-item-name')].map(n => n.textContent));
console.log('    White tops shelf: ' + shelf.join(' · '));
ok('her reported card no longer promises "draped"', !shelf.some(n => /draped/i.test(n)), shelf.join('|'));
ok('the sibling card no longer promises "relaxed"', !shelf.some(n => /relaxed/i.test(n)), shelf.join('|'));
ok('"boxy" goes too (the search says only cotton tee)', !shelf.some(n => /boxy/i.test(n)), shelf.join('|'));
ok('an honest card is untouched', shelf.some(n => /Poplin Top/.test(n)), shelf.join('|'));
ok('the shelf still renders a full set', shelf.length >= 4, String(shelf.length));
ok('zero JS errors', errs.length === 0, errs.join(' | '));
await ctx2.close();

await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
