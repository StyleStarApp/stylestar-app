// wdrcolor.mjs — a colour-named checklist row actually gets colour VERIFIED, 2026-09-13.
//
// ▶▶ HER CATCH: "this search was for a white top and lots of colors and prints
//   showed up." Root cause: `_wardrobeFindName` handed the finder the ROW'S OWN
//   LABEL verbatim as `item` ("White tops") — the word "white" rode along inside
//   the search text, but nothing ever split it into `req.colour`, so the
//   honesty system (verifyColour, the exact/browse split) had no colour
//   requirement to check a single card against. Every result landed in the
//   same unverified pile a bare "tops" search would.
//
// This pins:
//   1. `_WDR_FIND_OVERRIDE` actually reaches the network call: "White tops"
//      sends {item:'tops', colour:'white'}, never the compound string.
//   2. Splitting colour out can now produce a `doors` (near-miss/widen) answer
//      from the server — a shape Wardrobe's bare "{item:name}" request never
//      used to trigger — and her own "no apology where she asked for nothing"
//      rule (quiet) now covers THAT branch too, not just the empty-browse one.
//   3. 2026-09-13, SAME SESSION, "the full look" audit item 3: the two rows
//      whose own label is an OCCASION, not a colour — "Work-appropriate
//      dresses" (dr3) and "Dressy or going-out tops" (to6) — send a real shop
//      search phrase ("work dress" / "dressy top") instead of the whole
//      sentence, matching her own standing rule that a search holds words a
//      shop prints, never an occasion or a sentence.
//
// Run: node scratchpad/wdrcolor.mjs
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8998;
let pass = 0, failn = 0;
const ok = (n, c, x) => c ? (pass++, console.log('  ok   ' + n))
                          : (failn++, console.log('  FAIL ' + n + (x ? ' — ' + x : '')));

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));

const IDEAS = { items: [
  { name: 'Cotton Poplin Shirt', search: 'cotton poplin shirt', store: 'Everlane' } ] };
// A near-miss shape: nothing exact, one door that KEPT style but not colour —
// exactly the response type Wardrobe's bare item-only request never used to reach.
const DOORS_FIND = { exact: [], doors: [{ keeps: ['cut'], products: [
  { id: 'p1', title: 'CeCe Short Sleeve Scallop Front Shirt', brand: 'Dillard\'s', store: 'Dillard\'s',
    price: '$69.00', image: 'https://placehold.co/300x400', checks: { colour: 'rejected' }, differs: { colour: 'rejected' } } ] }], browse: [] };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 1500 } });
const pg = await ctx.newPage();
let capturedReq = null;
await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(IDEAS) }] }) }));
await pg.route(u => u.pathname.includes('product-find'), (r, req) => {
  try { capturedReq = JSON.parse(req.postData() || '{}'); } catch (e) {}
  return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DOORS_FIND) });
});
await pg.route(u => u.pathname.includes('product-search'), r => r.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify({ products: [] }) }));
await pg.addInitScript(() => { localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
  answers: [8,7,6,9,7,6,7,7,8,10,7,9], topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm' })); });
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1800);
await pg.evaluate(() => { try { openWardrobe() } catch (e) {} });
await pg.waitForTimeout(800);
await pg.evaluate(() => { try { wardrobeSeeIdeas('to1') } catch (e) {} }); // "White tops"
await pg.waitForTimeout(3500);

console.log('\n1. "White tops" sends a real {item,colour} request, not a compound string');
ok('the request carries the bare item', capturedReq && capturedReq.item === 'tops', JSON.stringify(capturedReq));
ok('...and colour split out on its own', capturedReq && capturedReq.colour === 'white', JSON.stringify(capturedReq));

console.log('\n2. a near-miss (doors) answer STILL carries no apology on Wardrobe — she asked for nothing');
const state = await pg.evaluate(() => {
  const box = document.getElementById('wx_to1');
  return {
    hasApology: box ? /couldn.t find exactly what you asked for/i.test(box.innerHTML) : null,
    findWrapGone: !document.getElementById('wdrFind_to1'),
    hasCompareCard: !!document.querySelector('#wx_to1 .shop-grid.hscroll .shop-card'),
  };
});
ok('no "I couldn\'t find exactly..." line reached the screen', state.hasApology === false, JSON.stringify(state));
ok('the find-block wrap is gone either way (nothing stray left behind)', state.findWrapGone);
ok('her compare card (from the AI ideas) is still there', state.hasCompareCard);

console.log('\n3. "Work-appropriate dresses" (dr3) sends a real shop phrase, no colour');
await pg.unroute(u => u.pathname.includes('product-find'));
capturedReq = null;
await pg.route(u => u.pathname.includes('product-find'), (r, req) => {
  try { capturedReq = JSON.parse(req.postData() || '{}'); } catch (e) {}
  return r.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ exact: [], doors: [], browse: [] }) });
});
await pg.evaluate(() => { try { wardrobeSeeIdeas('dr3') } catch (e) {} });
await pg.waitForTimeout(2500);
ok('item is a real search phrase, not the whole checklist label',
   capturedReq && capturedReq.item === 'work dress', JSON.stringify(capturedReq));
ok('no stray colour field', capturedReq && !capturedReq.colour, JSON.stringify(capturedReq));

console.log('\n4. "Dressy or going-out tops" (to6) sends a real shop phrase too');
capturedReq = null;
await pg.evaluate(() => { try { wardrobeSeeIdeas('to6') } catch (e) {} });
await pg.waitForTimeout(2500);
ok('item is a real search phrase, not the whole checklist label',
   capturedReq && capturedReq.item === 'dressy top', JSON.stringify(capturedReq));
ok('no stray colour field', capturedReq && !capturedReq.colour, JSON.stringify(capturedReq));

console.log(`\n${pass} passed, ${failn} failed`);
await ctx.close();
await browser.close();
srv.close();
process.exit(failn ? 1 : 0);
