// Shop your Style default open, with the REAL live amazon-search answering (via curl).
import fs from 'fs'; import path from 'path'; import http from 'http'; import {execFileSync} from 'child_process';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT = path.resolve(import.meta.dirname, '..'); const PORT = 8996;
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
await pg.evaluate(() => { try { _openShopStyleNow('quiz') } catch (e) { console.log(e) } });
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 30000 }).catch(() => {});
await pg.waitForTimeout(1000);
const st = await pg.evaluate(() => { const w = document.getElementById('ssFindWrap'); if (!w) return 'no wrap';
  const c = [...w.querySelectorAll('.find-card')]; const isA = x => /amazon\.com/.test(x.getAttribute('href') || (x.querySelector('a') || {}).href || '');
  return { cards: c.length, amz: c.filter(isA).length, at: c.map((x,i)=>isA(x)?i+1:0).filter(Boolean) }; });
console.log(JSON.stringify(st), log, errs);
const ok = st.amz === 3 && st.at[0] > 1 && st.at[0] <= 3 && st.at[2] <= 9;
console.log(ok ? 'PASS: three Amazon cards, the first by card 3, all within the first 9' : 'FAIL');
process.exitCode = ok ? 0 : 1;
await b.close(); srv.close();
