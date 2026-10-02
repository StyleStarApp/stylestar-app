// Amazon cards in the finder rows (her call, 2026-10-02): three per row, never
// first, her never-wear list applies, never kept in the 24h browser cache.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT = path.resolve(import.meta.dirname, '..'); const PORT = 8995;
let pass = 0, fail = 0; const ok = (n, c, x) => c ? (pass++, console.log('  ok   ' + n)) : (fail++, console.log('  FAIL ' + n + (x ? ' — ' + x : '')));
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(r => srv.listen(PORT, r));
const IDEAS = { items: [{ name: 'Silk Charmeuse Blouse', search: 'silk charmeuse blouse', store: 'Nordstrom' }, { name: 'Cotton Poplin Shirt', search: 'cotton poplin shirt', store: 'Everlane' }] };
const FIND = { exact: [], doors: [], browse: [1,2,3,4,5,6].map(i => ({ id: 'p' + i, title: 'Shop Blouse ' + i, name: 'Shop Blouse ' + i, search: 'Shop Blouse ' + i, store: i === 6 ? 'Amazon.com' : 'Nordstrom', price: '$90', image: 'https://placehold.co/300x400' })) };
const AMZ = { items: ['Ruffled Peasant Blouse', 'Satin Button Blouse', 'Chiffon Wrap Blouse', 'Puff Sleeve Blouse', 'Pleated Blouse'].map((t, i) => ({ asin: 'B00000000' + i, title: 'Brand' + i + ' Womens ' + t + ' Trendy Size 8', brand: 'Brand' + i, price: 20 + i, priceText: '$2' + i + '.99', image: 'https://m.media-amazon.com/images/I/x' + i + '.jpg', url: 'https://www.amazon.com/dp/B00000000' + i + '?tag=stylestar01-20&linkCode=osi' })) };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 1500 } }); const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(e.message)); let amzCalls = 0;
await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(IDEAS) }] }) }));
await pg.route(u => u.pathname.includes('product-find'), r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIND) }));
await pg.route(u => u.pathname.includes('amazon-search'), r => { amzCalls++; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AMZ) }); });
await pg.route(u => u.pathname.includes('product-search'), r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' }));
await pg.route(u => /media-amazon|placehold/.test(u.hostname), r => r.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64') }));
await pg.addInitScript(() => { localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: [8,7,6,9,7,6,7,7,8,10,7,9], topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm' }));});
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1800);
await pg.evaluate(() => { try { prefs.neverWear = ['Ruffles']; } catch (e) {} try { openWardrobe() } catch (e) {} });
await pg.waitForTimeout(800);
await pg.evaluate(() => { try { wardrobeSeeIdeas('to3') } catch (e) {} });
await pg.waitForSelector('#wx_to3 .find-card', { timeout: 15000 }).catch(e => { console.log('ERRS', errs); throw e; }); await pg.waitForTimeout(500);
const st = await pg.evaluate(() => { const g = document.querySelector('#wx_to3 .shop-grid.hscroll');
  const cards = [...g.querySelectorAll('.find-card')]; const amz = cards.filter(c => /amazon\.com\/dp\//.test(c.getAttribute('href') || (c.querySelector('a') || {}).href || ''));
  return { n: cards.length, amz: amz.length, firstAmz: cards.length && amz.includes(cards[0]),
    names: amz.map(c => (c.querySelector('.fc-name') || c).textContent.trim()), stores: amz.map(c => (c.querySelector('.fc-store,.fc-meta') || c).textContent),
    googleAmazon: cards.some(c => /Amazon\.com/.test(c.textContent)),
    tagged: amz.every(c => /tag=stylestar01-20/.test(c.getAttribute('href') || (c.querySelector('a') || {}).href || '')),
    lsHasAmz: /media-amazon|amazon\.com\/dp/.test(localStorage.getItem('ss_findcache') || JSON.stringify(localStorage)) && /"amazon":/.test(JSON.stringify(localStorage)) }; });
console.log('   ', JSON.stringify(st.names), JSON.stringify(st.stores));ok('three Amazon cards in the row, no more (her "3")', st.amz === 3, JSON.stringify(st));
ok('...and an Amazon card never leads the row', !st.firstAmz);
ok('her never-wear list applies to them (the ruffled one is gone)', !st.names.some(n => /ruffl/i.test(n)), JSON.stringify(st.names));
ok('names are tidied (no "Womens", "Trendy" or "Size 8")', st.names.every(n => !/women|trendy|size/i.test(n)), JSON.stringify(st.names));
ok("Google's copy of an Amazon listing gives way to Amazon's own", !st.googleAmazon);
ok('every Amazon card carries her tag', st.tagged);
ok("Amazon's data is NOT kept in the 24h browser cache", !st.lsHasAmz);
ok('no page errors', errs.length === 0, errs.join('; '));
// access lapsed: rows are exactly as before
const st2 = await pg.evaluate(async () => { _AMZ_MEM.clear(); const fr = await _findFetch({ item: 'blouse' }, false); return !!(fr.data && fr.data.amazon); });
ok('the Amazon search is attached to the answer when it works', st2);
await pg.unroute(u => u.pathname.includes('amazon-search'));
await pg.route(u => u.pathname.includes('amazon-search'), r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[],"why":"unconfigured"}' }));
const st3 = await pg.evaluate(async () => { _AMZ_MEM.clear(); const fr = await _findFetch({ item: 'skirt' }, false); return { amz: !!(fr.data && fr.data.amazon), browse: ((fr.data || {}).browse || []).length }; });
ok('if her Amazon access lapses, rows carry no Amazon cards and nothing else changes', !st3.amz && st3.browse === 6, JSON.stringify(st3));
// her catch 2026-10-02: the same piece twice is noise (same store twice is fine)
const dup = await pg.evaluate(() => {
  const P = (id, t, st, im) => ({ id, title: t, name: t, search: t, store: st, price: '$98', image: im });
  const data = { exact: [P('e1', 'Maeve Midi Dress', 'Anthropologie', 'https://x/1.jpg')], doors: [], browse: [
    P('b1', 'Maeve Midi Dress', 'Anthropologie', 'https://x/1b.jpg'),          // same piece, same store
    P('b2', 'The Maeve Midi Dress', 'Anthropologie', 'https://x/1.jpg'),       // same photo
    P('b3', 'Somerset Maxi Dress', 'Anthropologie', 'https://x/2.jpg'),        // same store, different piece: KEEP
    P('b4', 'Somerset Maxi Dress', 'Anthropologie', 'https://x/2c.jpg'),       // repeat
    P('b5', 'Atrium High-Rise Shorts by Varley in Yellow, Size: XL at Anthropologie', 'Anthropologie', 'https://x/3a.jpg'),
    P('b6', 'Atrium High-Rise Shorts by Varley in Yellow, Size: XXS at Anthropologie', 'Anthropologie', 'https://x/3b.jpg'),  // her screenshot: same piece, other size
    P('b7', "Vans Old Skool Sneaker Women's Yellow M9/W10.5", 'American Eagle', 'https://x/4a.jpg'),
    P('b8', "Vans Old Skool Sneaker Women's Yellow M5.5/W7", 'American Eagle', 'https://x/4b.jpg')] };
  const h = _findBlockHtml(data, { item: 'dress' }, true);
  const d = document.createElement('div'); d.innerHTML = h;
  return [...d.querySelectorAll('.find-card')].map(c => (c.querySelector('.fc-name') || c).textContent.trim()); });
ok('the same piece never shows twice in a row, even in two sizes, and no size is printed', dup.length === 4 && dup.filter(n => /Maeve/.test(n)).length === 1 && dup.filter(n => /Somerset/.test(n)).length === 1 && dup.filter(n => /Atrium/.test(n)).length === 1 && dup.filter(n => /Vans/.test(n)).length === 1 && !dup.some(n => /size|\bxl\b|xxs|w10|w7/i.test(n)), JSON.stringify(dup));
await browser.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
