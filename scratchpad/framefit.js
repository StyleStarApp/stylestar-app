// Her question: should the wardrobe/wishlist frame go 8px -> 11px, matching
// My Story and Shop your Style?
//
// ⚠️ The rule is SHARED by .ss.wardrobe-mirror and .ss.wishlist-mirror, so any
// change hits Your Wishlist too -- and a thicker border eats content width.
// This morning the wishlist empty-state button was measured as needing 249px
// with 260px available (11px headroom). Every 1px of border costs 2px of width,
// so 11px would leave 5px -- inside the browser text-measurement variance that
// broke the tagline on her real phone. Measure it, do not assume.
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

for (const w of [390, 375, 360]) {
  console.log(`\n=== ${w}px ===`);
  for (const px of [8, 9, 10, 11]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const r = await page.evaluate(async (px) => {
      const st = document.createElement('style');
      st.textContent = `.ss.wardrobe-mirror,.ss.wishlist-mirror{border-width:${px}px!important}`;
      document.head.appendChild(st);
      // the wishlist empty state is the width-critical surface
      openWishlist();
      await new Promise(r => setTimeout(r, 600));
      const btn = document.querySelector('#s-wishlist .we-addlnk');
      const span = btn.querySelector('.wab-t');
      const wrap = btn.parentElement;
      const avail = Math.floor(wrap.getBoundingClientRect().width);
      const c = span.cloneNode(true);
      c.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
      c.style.font = getComputedStyle(span).font;
      c.style.letterSpacing = getComputedStyle(span).letterSpacing;
      document.body.appendChild(c);
      const need = Math.ceil(c.getBoundingClientRect().width) + 18; // + padding & borders
      c.remove();
      const rg = document.createRange(); rg.selectNodeContents(span);
      const lines = [...new Set([...rg.getClientRects()].map(x => Math.round(x.top)))].length;
      // and the wardrobe's own content width
      openWardrobe('list');
      await new Promise(r => setTimeout(r, 500));
      const row = document.querySelector('#s-wardrobe .wdr-item');
      return {
        avail, need, headroom: avail - need, lines,
        wdrRow: row ? Math.round(row.getBoundingClientRect().width) : null,
      };
    }, px);
    const verdict = r.lines === 1 ? (r.headroom >= 10 ? 'SAFE' : 'THIN — inside browser variance') : 'WRAPS';
    console.log(`  frame ${px}px -> wishlist button ${r.avail}px avail / ${r.need}px needed, headroom ${r.headroom}px, ${r.lines} line(s)  [${verdict}]   wardrobe row ${r.wdrRow}px`);
    await page.close();
  }
}
await browser.close(); server.close();
