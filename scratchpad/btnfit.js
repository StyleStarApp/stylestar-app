// What is the BIGGEST font that keeps "+ Add anything you're wishing for" on
// one line inside the boxed button, at 390 (her phone) and 360 (Display Zoom)?
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

for (const w of [390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(400);
  const out = await page.evaluate(() => {
    const btn = document.querySelector('#s-wishlist .we-addlnk');
    const span = btn.querySelector('.wab-t');
    const wrap = btn.parentElement;
    const avail = Math.floor(wrap.getBoundingClientRect().width);
    const rows = [];
    for (const fs of [12, 12.5, 13, 13.5, 14]) {
      for (const pad of [6, 8, 10, 12]) {
        span.style.fontSize = fs + 'px';
        btn.style.padding = '9px ' + pad + 'px';
        // natural one-line need
        const c = span.cloneNode(true);
        c.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
        c.style.font = getComputedStyle(span).font;
        c.style.letterSpacing = getComputedStyle(span).letterSpacing;
        document.body.appendChild(c);
        const need = Math.ceil(c.getBoundingClientRect().width);
        c.remove();
        const total = need + pad * 2 + 2;
        rows.push({ fs, pad, need, total, fits: total <= avail });
      }
    }
    span.style.fontSize = ''; btn.style.padding = '';
    return { avail, rows };
  });
  const fits = out.rows.filter(r => r.fits);
  const best = fits.sort((a, b) => b.fs - a.fs || a.pad - b.pad)[0];
  console.log(`w=${w}  available=${out.avail}px  ->  biggest that fits one line: ` +
    (best ? `${best.fs}px @ ${best.pad}px padding (needs ${best.total})` : 'NONE'));
  await page.close();
}
await browser.close(); server.close();
