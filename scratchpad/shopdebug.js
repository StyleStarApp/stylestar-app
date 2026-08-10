const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2600);

console.log(await page.evaluate(() => {
  const out = { typeofFn: typeof window._openShopStyleNow, err: null };
  const lg0 = document.querySelector('#s-shopstyle .ss-shop-logo');
  out.before = lg0 ? lg0.textContent.trim() : 'NO ELEMENT';
  try { window._openShopStyleNow('style'); } catch (e) { out.err = e.message; }
  const lg = document.querySelector('#s-shopstyle .ss-shop-logo');
  out.afterSync = lg ? lg.innerHTML.slice(0, 90) : 'NO ELEMENT';
  out.nLogos = document.querySelectorAll('#s-shopstyle .ss-shop-logo').length;
  return out;
}));
await page.waitForTimeout(1200);
console.log('after wait:', await page.evaluate(() => {
  const lg = document.querySelector('#s-shopstyle .ss-shop-logo');
  return { html: lg ? lg.innerHTML.slice(0, 110) : 'none', text: lg ? lg.textContent.trim() : '', active: (document.querySelector('.scr.act') || {}).id };
}));
await browser.close(); server.close();
