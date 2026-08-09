// Renders for Cath (2026-08-09): HER untangle — GOLD = hers, PINK = Catherine's.
//   goldmarks-wishlist.png  crown hearts gold outline · YOUR PICK gold heart in
//                           gold border · CATHERINE'S PICK pink tilted signature
//                           heart in pink border
//   goldmarks-rows.png      Complete-the-Look: gold save hearts (one Saved filled gold)
//   goldmarks-edit.png      Edit header: pink tilted hearts flanking CURATED BY
//                           CATHERINE (teal lettering kept as the Edit accent)
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

const HEART = 'M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z';

const GOLD_SYSTEM = `
  /* crown: gold outline hearts — the wishlist's save mark, hers */
  #s-wishlist .wl-hearts svg{fill:none;stroke:#E0B84C;stroke-width:1.6}
  /* YOUR PICK: all gold (gold heart in the gold border) */
  #s-wishlist .wl-own svg{fill:#E0B84C !important}
  /* CATHERINE'S PICK: her signature — pink tilted heart, pink border */
  #s-wishlist .wl-pick{border-color:#F49AC1 !important;color:#B4436F !important}
  #s-wishlist .wl-pick svg{fill:#F49AC1 !important;transform:rotate(11deg)}
  /* save controls everywhere: gold when saved, quiet gold outline before */
  .wl-save svg{stroke:#C8971E !important}
  .wl-save.on{color:#8a6d20 !important;border-color:rgba(200,151,30,.4) !important;background:rgba(224,184,76,.12) !important}
  .wl-save.on svg{fill:#E0B84C !important;stroke:#C8971E !important}
  /* Edit + Trending headers: pink tilted signature hearts flank the teal lettering */
  .dc-tagline::before,.dc-tagline::after,#s-wardrobe .wdr-trend-by::before,#s-wardrobe .wdr-trend-by::after{content:"\\2665";color:#F49AC1;display:inline-block}
  .dc-tagline::before,#s-wardrobe .wdr-trend-by::before{transform:rotate(-9deg)}
  .dc-tagline::after,#s-wardrobe .wdr-trend-by::after{transform:rotate(11deg)}
`;

// 1 — Your Wishlist
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: [
      { id: 'tan-sandals~zappos', name: 'Tan sandals', store: 'Zappos', search: '', ts: 3, own: true },
      { id: 'valentino-bag~bloomingdales', name: 'Valentino bag', store: 'Bloomingdales', search: '', ts: 2, own: true, url: 'https://www.bloomingdales.com/shop/product/valentino?ID=123' },
      { id: 'align-pant~lululemon', name: 'Align Pant — Full Length 28″', store: 'lululemon', search: '', ts: 1, pick: true, url: 'https://shop.lululemon.com/p/align/prod123', price: '$98' }
    ]}));
    localStorage.setItem('ss_hearttip', '1'); localStorage.setItem('ss_emailDone', 'true'); localStorage.setItem('ss_email', 'x@x.com');
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(300);
  await page.addStyleTag({ content: GOLD_SYSTEM });
  await page.evaluate(h => {
    const s = document.querySelector('#s-wishlist .wl-pick svg path');
    if (s) s.setAttribute('d', h);
  }, HEART);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'goldmarks-wishlist.png'), clip: { x: 0, y: 0, width: 390, height: 640 } });
  console.log('wrote goldmarks-wishlist.png');
  await page.close();
}

// 2 — Complete-the-Look rows, one saved
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: [] }));
    localStorage.setItem('ss_hearttip', '1');
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => {
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('act'));
    const scr = document.getElementById('s-photo-res');
    scr.classList.add('act'); scr.classList.add('rv-open');
    _renderShop([
      { name: 'Gold Oversized Hoop Earrings', store: 'Kendra Scott', search: 'gold hoop earrings', category: 'jewelry', why: 'Echoes gold buttons' },
      { name: 'Cream Leather Slim Belt', store: 'Nordstrom', search: 'cream leather belt', category: 'belt', why: 'Defines waist' }
    ]);
  });
  await page.waitForTimeout(2300);
  await page.addStyleTag({ content: GOLD_SYSTEM });
  await page.evaluate(() => { document.querySelector('#pShopList .shoprow .wl-save').click(); });
  await page.waitForTimeout(200);
  const el = await page.$('#pShopBoard');
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await el.screenshot({ path: path.join(OUT, 'goldmarks-rows.png') });
  console.log('wrote goldmarks-rows.png');
  await page.close();
}

// 3 — the Edit header with her signature hearts
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: [] }));
    localStorage.setItem('ss_hearttip', '1');
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); showDream(); window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  await page.addStyleTag({ content: GOLD_SYSTEM });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'goldmarks-edit.png'), clip: { x: 0, y: 0, width: 390, height: 780 } });
  console.log('wrote goldmarks-edit.png');
  await page.close();
}

await browser.close();
server.close();
