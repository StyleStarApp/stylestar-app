// Shop your Style default open, with the REAL live amazon-search answering (via curl).
import fs from 'fs'; import path from 'path'; import http from 'http'; import {execFileSync} from 'child_process';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT = path.resolve(import.meta.dirname, '..'); const PORT = 8997;
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(r => srv.listen(PORT, r));
const SIX = { items: [
  { category: 'dress', name: 'Belted Shirt Dress', search: 'belted shirt dress', store: 'Nordstrom' },
  { category: 'top', name: 'Silk Cami', search: 'silk cami', store: 'Nordstrom' },
  { category: 'shoes', name: 'Block Heel Sandal', search: 'block heel sandal', store: 'Nordstrom' },
  { category: 'bag', name: 'Woven Tote', search: 'woven tote', store: 'Nordstrom' },
  { category: 'jacket', name: 'Cropped Blazer', search: 'cropped blazer', store: 'Nordstrom' },
  { category: 'bottom', name: 'Wide Leg Jeans', search: 'wide leg jeans', store: 'Nordstrom' }] };
const FIND = { exact: [1,2,3,4].map(i => ({ id: 'e'+i, title: 'Checked Piece '+i, name: 'Checked Piece '+i, search: 'Checked Piece '+i, store: 'Nordstrom', price: '$120', image: 'https://placehold.co/300x400', url: 'https://www.nordstrom.com/s/'+i, checks: {} })), doors: [], browse: [1,2,3,4,5,6].map(i => ({ id: 'p'+i, title: 'Shop Piece '+i, name: 'Shop Piece '+i, search: 'Shop Piece '+i, store: 'Nordstrom', price: '$90', image: 'https://placehold.co/300x400' })) };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
const errs = []; pg.on('pageerror', e => errs.push(e.message)); const log = [];
await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(SIX) }] }) }));
await pg.route(u => u.pathname.includes('product-find'), r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIND) }));
await pg.route(u => u.pathname.includes('amazon-search'), r => { const u = new URL(r.request().url());
  const out = execFileSync('curl', ['-s', '-H', 'Referer: https://stylestar.app/', 'https://stylestar.app/.netlify/functions/amazon-search' + u.search]).toString();
  log.push(u.search + ' -> ' + (JSON.parse(out).items || []).length); return r.fulfill({ status: 200, contentType: 'application/json', body: out }); });
await pg.route(u => /media-amazon|placehold/.test(u.hostname), r => r.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64') }));
await pg.addInitScript(() => { localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: [8,7,6,9,7,6,7,7,8,10,7,9], topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm' })); });
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1500);

const IDEAS = { items: [{ name: 'Silk Charmeuse Blouse', search: 'silk charmeuse blouse', store: 'Nordstrom' }, { name: 'Cotton Poplin Shirt', search: 'cotton poplin shirt', store: 'Everlane' }] };
await pg.unroute(u => u.pathname.includes('style-ai'));
await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(IDEAS) }] }) }));
const isA = "x => /amazon\\.com/.test(x.getAttribute('href') || (x.querySelector('a') || {}).href || '')";
for (const [label, open, box] of [['wardrobe to3', "openWardrobe();setTimeout(()=>wardrobeSeeIdeas('to3'),600)", '#wx_to3'], ['trending trend0', "openTrending();setTimeout(()=>wardrobeSeeIdeas('trend0'),600)", '#wx_trend0'], ['trending trend1', "wardrobeSeeIdeas('trend1')", '#wx_trend1']]) {
  log.length = 0;
  await pg.evaluate(o => { try { eval(o) } catch (e) { console.log(e) } }, open);
  await pg.waitForSelector(box + ' .find-card', { timeout: 30000 }).catch(() => {});
  await pg.waitForTimeout(1500);
  const st = await pg.evaluate(([box, isA]) => { const f = eval(isA); const g = document.querySelector(box + ' .shop-grid.hscroll'); if (!g) return 'no grid';
    const c = [...g.querySelectorAll('.find-card')]; return { found: c.length, amz: c.filter(f).length, names: c.filter(f).map(x => (x.querySelector('.fc-name') || x).textContent.trim()) }; }, [box, isA]);
  console.log(label, JSON.stringify(st), log);
}
console.log(errs);
await b.close(); srv.close();
