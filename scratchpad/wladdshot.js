// Renders for Cath: the "Add your own piece" build, per-option 2x images.
//   wladd-a.png    entry option A (as built): quiet gold pill under the list
//   wladd-b.png    entry option B (mock): ghost row at the bottom of the card
//   wladd-c.png    entry option C (mock): quiet text link up top, under the lead
//   wladd-form.png the open form, filled with her Valentino example
//   wladd-empty.png the empty state with its "Or add a piece of your own" link
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = import.meta.dirname;
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const SEED = [
  { id: 'valentino-black-studded-shoulder-bag~saks-fifth-avenue', name: 'Valentino black studded shoulder bag', store: 'Saks Fifth Avenue', search: '', ts: 3, own: true, url: 'https://www.saksfifthavenue.com/product/valentino-garavani-rockstud.html' },
  { id: 'tan-kitten-heel-mules~sam-edelman', name: 'Tan kitten-heel mules', store: 'Sam Edelman', search: '', ts: 2, own: true },
  { id: 'pink-structured-crossbody-bag~kate-spade', name: 'Pink structured crossbody bag', store: 'Kate Spade', search: 'pink crossbody bag', ts: 1 }
];

async function boot(seed) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.addInitScript(list => {
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: list }));
    localStorage.setItem('ss_hearttip', '1');
  }, seed);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(300);
  return page;
}
async function snap(page, name, h) {
  await page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: 390, height: h || 700 } });
  console.log('wrote ' + name);
}

// A — as built
let page = await boot(SEED);
await snap(page, 'wladd-a.png', 640);

// B — ghost row inside the card (render-only mock)
await page.evaluate(() => {
  document.querySelector('#wlAdd .wl-addwrap').remove();
  const card = document.querySelector('#wlBody .wl-card');
  const row = document.createElement('div');
  row.className = 'wl-row';
  row.style.cssText = 'justify-content:center;cursor:pointer';
  row.innerHTML = '<span style="font:600 11.5px/1 Jost,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#8a6d20">+ Add your own piece</span>';
  card.appendChild(row);
});
await snap(page, 'wladd-b.png', 640);

// C — quiet link up top, under the lead (render-only mock)
await page.evaluate(() => {
  document.querySelector('#wlBody .wl-card .wl-row:last-child').remove();
  const lead = document.querySelector('#wlBody .wl-lead');
  const ln = document.createElement('div');
  ln.style.cssText = 'text-align:center;margin-top:9px';
  ln.innerHTML = '<span style="font:600 12px/1.4 Jost,sans-serif;color:#8a6d20;border-bottom:1px solid #E0B84C;padding-bottom:1px;cursor:pointer">+ Add a piece of your own</span>';
  lead.parentNode.insertBefore(ln, lead.nextSibling);
});
await snap(page, 'wladd-c.png', 640);
await page.close();

// The open form, her Valentino example typed in
page = await boot(SEED);
await page.evaluate(() => {
  wlAddOpen();
  document.getElementById('waName').value = 'Valentino black studded shoulder bag';
  document.getElementById('waUrl').value = 'https://www.saksfifthavenue.com/product/valentino-garavani-rockstud.html';
});
await page.evaluate(() => { document.querySelector('#wlAdd .wl-add').scrollIntoView({ block: 'center' }); });
await page.waitForTimeout(250);
await snap(page, 'wladd-form.png', 844);
await page.close();

// The empty state with its own door in
page = await boot([]);
await snap(page, 'wladd-empty.png', 620);
await page.close();

await browser.close();
server.close();
