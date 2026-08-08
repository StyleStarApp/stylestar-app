// Verify the narrower drawer: no row wraps at 390/360/320, screenshot at 390.
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
let fails = 0, checks = 0;
const ok = (n, c, x) => { checks++; console.log((c?'PASS ':'FAIL ')+n+(x?'  ['+x+']':'')); if(!c) fails++; };
for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => menuOpen());
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => {
    const panel = document.getElementById('menuPanel');
    const rows = [...panel.querySelectorAll('.menu-row')];
    const wraps = rows.filter(r => {
      const lh = parseFloat(getComputedStyle(r).lineHeight);
      const pad = parseFloat(getComputedStyle(r).paddingTop) + parseFloat(getComputedStyle(r).paddingBottom);
      return (r.getBoundingClientRect().height - pad) / lh > 1.5;
    }).map(r => r.textContent.trim());
    return { panelW: Math.round(panel.getBoundingClientRect().width), rowCount: rows.length, wraps };
  });
  ok(w + ': panel narrower', m.panelW <= 250, m.panelW + 'px');
  ok(w + ': all ' + m.rowCount + ' rows on one line', m.wraps.length === 0, m.wraps.join(', '));
  ok(w + ': zero JS errors', errs.length === 0, errs.join(' | '));
  if (w === 390) await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'menu-narrow.png') });
  await page.close();
}
await browser.close(); server.close();
console.log(checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
