// Measure the header tagline on the My Story screen: how wide does
// "Align your style. Shine your light." actually need, how much room does the
// story card give it, and how big is the gap down to the "My Story" title.
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

for (const w of [430, 390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const tag = document.querySelector('.hdr .tag');
    const hdr = document.querySelector('.hdr');
    const title = document.querySelector('#s-story .story-title');
    const cs = getComputedStyle(tag);
    // natural one-line width of the text
    const rg = document.createRange(); rg.selectNodeContents(tag);
    const clone = tag.cloneNode(true);
    clone.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
    document.body.appendChild(clone);
    const natural = clone.getBoundingClientRect().width;
    clone.remove();
    const tr = tag.getBoundingClientRect(), ti = title.getBoundingClientRect();
    const hs = getComputedStyle(hdr);
    return {
      fontSize: cs.fontSize, ls: cs.letterSpacing, family: cs.fontFamily.split(',')[0],
      natural: Math.ceil(natural),
      available: Math.floor(tr.width),
      lines: Math.round(tr.height / parseFloat(cs.lineHeight || cs.fontSize)),
      tagBottom: Math.round(tr.bottom), titleTop: Math.round(ti.top),
      gap: Math.round(ti.top - tr.bottom),
      hdrPadBottom: hs.paddingBottom, hdrPadSide: hs.paddingLeft,
      innerPadTop: getComputedStyle(document.querySelector('.inner')).paddingTop,
      wrapPadTop: getComputedStyle(document.querySelector('#s-story .story-wrap')).paddingTop,
    };
  });
  console.log(`w=${w}`, JSON.stringify(m));
  await page.close();
}
await browser.close(); server.close();
