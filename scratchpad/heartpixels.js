// GROUND TRUTH: rasterise the curated-by line and measure the real painted gap
// between the pink heart ink and the teal letter ink, column by column.
// Range/box rects are computed from ADVANCE widths, so they cannot see the
// trailing letter-space that letter-spacing:.2em adds after the final letter.
// Her eye can. Pixels are the only honest instrument here.
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

const SCALE = 6;
async function measure(open, sel, label) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: SCALE });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(f => eval(f), open);
  await page.waitForTimeout(500);
  const el = await page.$(sel);
  const shot = await el.screenshot();
  const b64 = shot.toString('base64');
  const res = await page.evaluate(async ({ b64, SCALE }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, c.width, c.height).data;
    const isPink = (r, g, b) => r > 190 && g > 90 && g < 200 && b > 140 && b < 225 && r - g > 45;
    const isTeal = (r, g, b) => b > 120 && g > 110 && r < 140 && b - r > 50;
    let pinkCols = [], tealCols = [];
    for (let x = 0; x < c.width; x++) {
      let p = false, t = false;
      for (let y = 0; y < c.height; y++) {
        const i = (y * c.width + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        if (a < 40) continue;
        if (isPink(r, g, b)) p = true;
        if (isTeal(r, g, b)) t = true;
      }
      if (p) pinkCols.push(x);
      if (t) tealCols.push(x);
    }
    if (!pinkCols.length || !tealCols.length) return { err: 'no ink found', pink: pinkCols.length, teal: tealCols.length };
    // split pink into the two hearts by the big gap
    const leftHeartRight = Math.max(...pinkCols.filter(x => x < tealCols[0]));
    const rightHeartLeft = Math.min(...pinkCols.filter(x => x > tealCols[tealCols.length - 1]));
    const textLeft = tealCols[0], textRight = tealCols[tealCols.length - 1];
    return {
      widthCss: +(c.width / SCALE).toFixed(2),
      VISIBLE_LEFT: +((textLeft - leftHeartRight) / SCALE).toFixed(2),
      VISIBLE_RIGHT: +((rightHeartLeft - textRight) / SCALE).toFixed(2),
    };
  }, { b64, SCALE });
  console.log(label, JSON.stringify(res));
  await page.close();
  return res;
}

await measure('showDream()', '.dc-tagline', 'The Edit  ');
await measure("openWardrobe('trend')", '#s-wardrobe .wdr-trend-by', 'Trending  ');
await browser.close(); server.close();
