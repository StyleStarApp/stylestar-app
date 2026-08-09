// Renders for Cath: the Complete-the-Look save heart, bare vs labelled.
//   heartlabel-current.png  as live: bare ♡ (the "Save" text hidden on these rows)
//   heartlabel-inline.png   heart + SAVE side by side (the cards' own pill, un-hidden)
//   heartlabel-stacked.png  heart with a tiny "Save" caption underneath
// Also measures 360px overflow for each variant, printed to the console.
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

const ITEMS = [
  { name: 'Gold Oversized Hoop Earrings', store: 'Kendra Scott', search: 'gold hoop earrings', category: 'jewelry', why: "Echoes jacket's gold buttons" },
  { name: 'Cream Leather Slim Belt', store: 'Nordstrom', search: 'cream leather belt', category: 'belt', why: 'Defines waist, ties palette' },
  { name: 'Sheer Nude Hosiery', store: 'Nordstrom Rack', search: 'sheer nude hosiery', category: 'accessory', why: 'Elongates leg to heel' },
  { name: 'Gold Layered Chain Bracelet', store: 'Gorjana', search: 'gold chain bracelet', category: 'jewelry', why: 'Adds wrist detail affordably' }
];

async function boot(w) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: [] }));
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(items => {
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('act'));
    const scr = document.getElementById('s-photo-res');
    scr.classList.add('act');
    scr.classList.add('rv-open');   // the boards are opacity:0 until the reveal fires
    _renderShop(items);
    _syncHeartTip();
  }, ITEMS);
  await page.waitForTimeout(2300);  // let the staggered rvRise animations finish
  return page;
}
async function shoot(page, name) {
  const el = await page.$('#pShopBoard');
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await el.screenshot({ path: path.join(OUT, name) });
  console.log('wrote ' + name);
}
async function overflow(page, w) {
  return page.evaluate(vw => {
    const rows = Array.from(document.querySelectorAll('#pShopList .shoprow'));
    let worst = 0;
    rows.forEach(r => r.querySelectorAll('*').forEach(el => {
      const x = el.getBoundingClientRect().right - vw;
      if (x > worst) worst = x;
    }));
    return Math.round(worst * 10) / 10;
  }, w);
}

for (const w of [390, 360]) {
  const page = await boot(w);
  // current: bare heart
  if (w === 390) await shoot(page, 'heartlabel-current.png');
  console.log(w + 'px current: worst overflow ' + await overflow(page, w) + 'px');

  // inline: un-hide the pill's own SAVE text
  await page.addStyleTag({ content: '.res-screen .shoprow .wl-save .wl-save-t{display:inline !important}' });
  await page.waitForTimeout(120);
  if (w === 390) await shoot(page, 'heartlabel-inline.png');
  console.log(w + 'px inline: worst overflow ' + await overflow(page, w) + 'px');

  // stacked: heart over a tiny caption
  await page.addStyleTag({ content: `
    .res-screen .shoprow .wl-save .wl-save-t{display:block !important;font-size:8.5px;letter-spacing:.08em;margin-top:2px}
    .res-screen .shoprow .wl-save{flex-direction:column;gap:0;padding:2px 4px}
  ` });
  await page.waitForTimeout(120);
  if (w === 390) await shoot(page, 'heartlabel-stacked.png');
  console.log(w + 'px stacked: worst overflow ' + await overflow(page, w) + 'px');
  await page.close();
}

await browser.close();
server.close();
