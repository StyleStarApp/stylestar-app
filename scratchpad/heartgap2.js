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
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto(base + '/', { waitUntil: 'load' });
await page.waitForTimeout(2600);
await page.evaluate(() => showDream());
await page.waitForTimeout(500);

console.log(await page.evaluate(() => {
  const by = document.querySelector('.dc-tagline');
  const span = by.querySelector('span');
  const svgs = [...by.querySelectorAll('svg.pinkheart')];
  const sr = span.getBoundingClientRect();                 // LAYOUT box (flex gap measures from this)
  const t = span.firstChild;
  const r1 = document.createRange(); r1.setStart(t, 0); r1.setEnd(t, 1);
  const rN = document.createRange(); rN.setStart(t, t.textContent.length - 1); rN.setEnd(t, t.textContent.length);
  const first = r1.getBoundingClientRect(), last = rN.getBoundingClientRect();
  const li = svgs[0].querySelector('path').getBoundingClientRect();
  const ri = svgs[1].querySelector('path').getBoundingClientRect();
  return {
    spanBox: [+sr.left.toFixed(2), +sr.right.toFixed(2)],
    firstGlyphLeft: +first.left.toFixed(2),
    lastGlyphRight: +last.right.toFixed(2),
    leadIn: +(first.left - sr.left).toFixed(2),            // space before the first glyph
    trailOut: +(sr.right - last.right).toFixed(2),         // space after the last glyph  <-- the suspect
    leftHeartInkRight: +li.right.toFixed(2),
    rightHeartInkLeft: +ri.left.toFixed(2),
    VISIBLE_LEFT: +(first.left - li.right).toFixed(2),
    VISIBLE_RIGHT: +(ri.left - last.right).toFixed(2),
    letterSpacing: getComputedStyle(span).letterSpacing,
    fontSize: getComputedStyle(span).fontSize,
  };
}));
await browser.close(); server.close();
