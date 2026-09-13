// wdrmerge.mjs — the Wardrobe list's "2 different rows" fix, 2026-09-13.
//
// ▶▶ HER CATCH, VERBATIM: "I don't want the search to come up with 2 different
//   rows. I like how we set it up in chat where she gets one very long row to
//   scroll through. I don't know why we ended up making 2 rows on wardrobe
//   list." The 2026-09-10 build put the live finder BELOW the compare
//   carousel as its own boxed section, deliberately, at the time. This test
//   pins the reversal: `_wdrMergeFindRow` moves the finder's cards into the
//   SAME `.shop-grid.hscroll` the compare cards already sit in, the moment
//   the search resolves, and removes the now-empty wrap either way.
//
// ⚠️ IT ALSO PROVES THE SECOND HALF OF HER COMPLAINT: a dead search used to
//   print "My search didn't come back just then..." even in quiet mode,
//   because `quiet` was only ever read inside `_findBlockHtml`, never by the
//   `search-failed` branch that runs before it. `_wdrMergeFindRow` deletes the
//   wrap regardless of what it holds, so a dead search on the Wardrobe is
//   silent now — her real compare cards stay, nothing apologises over them.
//
// Run: node scratchpad/wdrmerge.mjs
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8994;
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
  { name: 'Silk Charmeuse Blouse', search: 'silk charmeuse blouse', store: 'Nordstrom' },
  { name: 'Cotton Poplin Shirt',   search: 'cotton poplin shirt',   store: 'Everlane' } ] };
const FIND = { exact: [], doors: [], browse: [
  { id: 'p1', title: 'Toteme Silk Crepe Blouse', brand: 'Mytheresa', store: 'Mytheresa', price: '$690', image: 'https://placehold.co/300x400', feed: true, url: 'https://example.com/p1' },
  { id: 'p2', title: 'Off-White Cotton Blouse',  brand: 'FARM Rio',  store: 'FARM Rio',  price: '$180', image: 'https://placehold.co/300x400', feed: true, url: 'https://example.com/p2' },
  { id: 'p3', title: 'Open Edit Poplin Shirt',   brand: 'Nordstrom', store: 'Nordstrom', price: '$59' } ] };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--disable-features=AutofillServerCommunication,Translate,OptimizationHints'] });
async function open(findResponse) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 1500 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(IDEAS) }] }) }));
  await pg.route(u => u.pathname.includes('product-find'), r =>
    findResponse === null ? r.abort()
      : r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(findResponse) }));
  await pg.route(u => u.pathname.includes('product-search'), r => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify({ products: [] }) }));
  await pg.addInitScript(() => { localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
    answers: [8,7,6,9,7,6,7,7,8,10,7,9], topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm' })); });
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1800);
  await pg.evaluate(() => { try { openWardrobe() } catch (e) {} });
  await pg.waitForTimeout(800);
  await pg.evaluate(() => { try { wardrobeSeeIdeas('to3') } catch (e) {} });
  await pg.waitForTimeout(4000);
  const state = await pg.evaluate(() => {
    const findWrap = document.getElementById('wdrFind_to3');
    const grid = document.querySelector('#wx_to3 .shop-grid.hscroll');
    return {
      findWrapGone: !findWrap,
      gridCards: grid ? grid.children.length : -1,
      gridHasFindCard: grid ? !!grid.querySelector('.find-card') : false,
      gridHasCompareCard: grid ? !!grid.querySelector('.shop-card') : false,
    };
  });
  await ctx.close();
  return { state, errs };
}

console.log('\n1. a real search folds into the SAME row as her compare cards');
const r1 = await open(FIND);
ok('no page errors', r1.errs.length === 0, r1.errs.join('; '));
ok('the find-block wrap is gone, not left as a second box', r1.state.findWrapGone);
ok('her compare cards are still in the row', r1.state.gridHasCompareCard);
ok('the finder\'s cards folded into the SAME grid', r1.state.gridHasFindCard);
ok('the row genuinely grew (compare + found together)', r1.state.gridCards > 2);

console.log('\n2. a dead search (the SerpApi-outage shape) never shows an apology over real cards');
const r2 = await open(null);
ok('no page errors', r2.errs.length === 0, r2.errs.join('; '));
ok('the find-block wrap is gone, no leftover apology box', r2.state.findWrapGone);
ok('her compare cards are untouched', r2.state.gridHasCompareCard);
ok('nothing from the dead search was merged', !r2.state.gridHasFindCard);

console.log(`\n${pass} passed, ${failn} failed`);
await browser.close();
srv.close();
process.exit(failn ? 1 : 0);
