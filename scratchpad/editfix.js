// Her 2026-08-11 asks on the Style Star Edit, rendered before/after:
//   - Back stays exactly where it is
//   - the star + header come DOWN (they overlap the MENU chip today)
//   - the gap between CURATED BY CATHERINE and "Everything here..." tightens
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

// logoTop = .dc-logo margin-top (was 8px), subTop = .dc-subtitle margin-top (was 16px)
const OPTS = [
  { id: 'current', label: 'CURRENT', logoTop: 8, subTop: 16 },
  { id: 'fixed', label: 'PROPOSED  star+header down 16px, tagline gap 16 -> 8px', logoTop: 24, subTop: 8 },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 720 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(o => {
    showDream();
    const s = document.createElement('style');
    s.textContent = `#s-dream .dc-logo{margin-top:${o.logoTop}px}#s-dream .dc-subtitle{margin-top:${o.subTop}px}`;
    document.head.appendChild(s);
  }, o);
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const svg = document.querySelector('#s-dream .dc-corner-star');
    const p = svg.querySelector('path'), len = p.getTotalLength(), ctm = p.getScreenCTM();
    let minY = 1e9, minX = 1e9, maxX = -1e9;
    for (let i = 0; i <= 400; i++) { const pt = p.getPointAtLength(len * i / 400); const sp = new DOMPoint(pt.x, pt.y).matrixTransform(ctm); if (sp.y < minY) minY = sp.y; if (sp.x < minX) minX = sp.x; if (sp.x > maxX) maxX = sp.x; }
    const chip = (document.querySelector('#menuChip') || document.querySelector('.menu-chip')).getBoundingClientRect();
    const tag = document.querySelector('#s-dream .dc-tagline').getBoundingClientRect();
    const sub = document.querySelector('#s-dream .dc-subtitle').getBoundingClientRect();
    const back = document.querySelector('#s-dream .top-back-wrap').getBoundingClientRect();
    const first = document.querySelector('#s-dream .dc-item').getBoundingClientRect();
    return { starTop: +minY.toFixed(1), starL: +minX.toFixed(1), starR: +maxX.toFixed(1), chipB: +chip.bottom.toFixed(1), chipR: +chip.right.toFixed(1), backTop: +back.top.toFixed(1), gap: +(sub.top - tag.bottom).toFixed(1), firstItem: +first.top.toFixed(1) };
  });
  const clear = +(m.starTop - m.chipB).toFixed(1);
  console.log(`${o.id.padEnd(9)} starTop=${m.starTop} chipBottom=${m.chipB} clearance=${clear > 0 ? '+' + clear : clear}px  Back.top=${m.backTop}  tagline->sub gap=${m.gap}px  firstItem.top=${m.firstItem}`);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `editfix-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 430 } });
  await page.close();
}
await browser.close(); server.close();
console.log('\nwrote scratchpad/editfix-current.png + editfix-fixed.png');
