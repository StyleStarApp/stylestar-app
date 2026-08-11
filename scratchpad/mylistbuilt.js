// As-built render of the clean-list summary (Cath's pick A) on the real page.
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
const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(base + '/', { waitUntil: 'load' });
await p.evaluate(() => {
  localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' }));
  localStorage.setItem('ss_wardrobe', JSON.stringify({
    items: { to1: 'want', bo1: 'want', dr5: 'want', ja5: 'want', sh1: 'want', bg8: 'want' },
    custom: [{ id: 'silk~scarf', n: 'Hermes silk scarf', state: 'want' }],
    hidden: [], wishlist: [], pretap0: true,
  }));
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(2600);
await p.evaluate(() => openWardrobe('list'));
await p.waitForTimeout(600);
await p.evaluate(() => document.getElementById('wdrShopEnd').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const b = document.querySelector('#wdrShopEnd').getBoundingClientRect();
  return { y: Math.max(0, b.top - 70), h: Math.min(844, b.height + 130) };
});
await p.screenshot({ path: path.join(ROOT, 'scratchpad', 'mylist-built.png'), clip: { x: 0, y: r.y, width: 390, height: r.h } });
await browser.close();
server.close();
console.log('mylist-built.png written');
