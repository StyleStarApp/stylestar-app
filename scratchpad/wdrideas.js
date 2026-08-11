// Her two new questions 2026-08-11: (a) slide "Ideas ->" left for breathing and
// TAP room away from the star; (b) should it look like a button/chip?
// Plus a demo of the sticky category header she likes but can't picture.
// ⚠️ Tap targets matter more than looks here: two controls 9px apart on a
// 100-row list is a mis-tap machine, and this audience runs to 80.
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

const OPTS = [
  { id: 'now', label: 'AS BUILT  Ideas as a plain link', css: '' },
  { id: 'gap', label: 'A  same link, pushed 10px further from the star', css:
    `#s-wardrobe .wdr-see{margin-right:10px}` },
  { id: 'chip', label: 'B  a chip: gold outline, its own tap area', css:
    `#s-wardrobe .wdr-see{margin-right:10px;padding:5px 10px;border:1px solid #D8A52E;border-radius:999px;color:#8a6a1e;background:#fff}` },
  { id: 'chipsq', label: 'C  a squared chip (matches her squared cards)', css:
    `#s-wardrobe .wdr-see{margin-right:10px;padding:5px 10px;border:1px solid #D8A52E;border-radius:2px;color:#8a6a1e;background:#fff}` },
  { id: 'solid', label: 'D  a filled chip (the loudest)', css:
    `#s-wardrobe .wdr-see{margin-right:10px;padding:5px 11px;border:1px solid #D8A52E;border-radius:2px;color:#4a3c14;background:#FBEFCB}` },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const m = await page.evaluate(o => {
    openWardrobe('list');
    wardrobeItems[0].items.slice(1, 3).forEach(i => { wardrobeData.items[i.id] = 'want'; });
    renderWardrobeList();
    if (o.css) { const s = document.createElement('style'); s.textContent = o.css; document.head.appendChild(s); }
    const row = document.querySelector('#s-wardrobe .wdr-item');
    const see = row.querySelector('.wdr-see'), star = row.querySelector('.wdr-star');
    const sr = see.getBoundingClientRect(), st = star.getBoundingClientRect();
    const nm = row.querySelector('.wdr-name').getBoundingClientRect();
    const lbl = document.createElement('div'); lbl.id = '__lbl'; lbl.textContent = o.label;
    const s2 = document.createElement('style');
    s2.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 12.5px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 4px}';
    document.head.appendChild(s2); document.body.appendChild(lbl);
    const names = [...document.querySelectorAll('#s-wardrobe .wdr-name')].map(e => {
      const rg = document.createRange(); rg.selectNodeContents(e);
      return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size;
    });
    return { gap: +(st.left - sr.right).toFixed(1), seeW: +sr.width.toFixed(1), seeH: +sr.height.toFixed(1),
      nameW: +nm.width.toFixed(1), wraps: names.filter(n => n > 1).length, rows: names.length,
      docW: document.documentElement.scrollWidth, vw: innerWidth };
  }, o);
  console.log(`${o.id.padEnd(7)} gap Ideas->star ${String(m.gap).padStart(5)}px | chip ${m.seeW}x${m.seeH} | name col ${m.nameW}px | names wrapping ${m.wraps}/${m.rows} | overflow ${m.docW > m.vw}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrideas-${o.id}.png`), clip: { x: 0, y: 260, width: 390, height: 420 } });
  await page.close();
}
await browser.close(); server.close();
