// Her call 2026-08-11: put the star on the Wardrobe List header but MOVE
// NOTHING -- header, Back and the MENU chip all stay exactly where they are.
// So it has to be absolutely positioned (zero layout cost). This measures the
// band it has to live in before anything is built.
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

for (const named of [false, true]) {
  for (const w of [390, 375, 360, 320]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.evaluate(n => localStorage.setItem('ss_data', JSON.stringify({ userName: n ? 'Catherine' : 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })), named);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const m = await page.evaluate(() => {
      openWardrobe('list');
      const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
      const chip = (document.querySelector('#menuChip') || document.querySelector('.menu-chip')).getBoundingClientRect();
      const head = R('#s-wardrobe .wdr-head'), title = R('#s-wardrobe .wdr-title'), back = R('#s-wardrobe .top-back-wrap');
      const scr = R('#s-wardrobe');
      return { chip: { t: +chip.top.toFixed(1), l: +chip.left.toFixed(1), r: +chip.right.toFixed(1), b: +chip.bottom.toFixed(1) }, head, title, back, scr, tabs: R('#s-wardrobe .wdr-tabs'), lines: document.querySelectorAll('#s-wardrobe .wdr-title br').length + 1 };
    });
    console.log(`\n--- ${w}px  ${named ? 'WITH name (2 lines)' : 'no name (1 line)'} ---`);
    console.log('  chip ', JSON.stringify(m.chip));
    console.log('  Back ', JSON.stringify(m.back));
    console.log('  head ', JSON.stringify(m.head));
    console.log('  title', JSON.stringify(m.title), 'lines=' + m.lines);
    console.log('  tabs ', JSON.stringify(m.tabs));
    console.log(`  >> band above title: Back.bottom=${m.back.b} -> title.top=${m.title.t}  = ${(m.title.t - m.back.b).toFixed(1)}px`);
    console.log(`  >> title top vs chip bottom: ${(m.title.t - m.chip.b).toFixed(1)}px`);
    await page.close();
  }
}
await browser.close(); server.close();
