// Follow-up to wdrstarclip.js. Two separate facts were conflated:
//   (a) .ss.wardrobe-mirror clips at y=16 (base .ss overflow:hidden, there to
//       clip the 28px rounded corners -- but this page is transparent with
//       SQUARE corners since her calm rethink, so it clips nothing but the star)
//   (b) the star's lower bound is the title's painted letters
// (b) was measured across the WHOLE width, which finds the tallest letter
// anywhere. What actually matters is the ink directly UNDER the star.
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

for (const named of [true, false]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(n => localStorage.setItem('ss_data', JSON.stringify({ userName: n ? 'Catherine' : 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })), named);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  // unclip + hide the star, then find the ink under the star's own x-range
  const xr = await page.evaluate(() => {
    openWardrobe('list');
    const s = document.createElement('style');
    s.textContent = '.ss.wardrobe-mirror{overflow:visible}';
    document.head.appendChild(s);
    const st = document.querySelector('#s-wardrobe .wdr-headstar');
    const r = st.getBoundingClientRect();
    st.style.visibility = 'hidden';
    return { l: Math.floor(r.left), r: Math.ceil(r.right) };
  });
  await page.waitForTimeout(250);
  const shot = await page.screenshot({ clip: { x: 0, y: 40, width: 390, height: 60 } });
  const ink = await page.evaluate(async ({ b64, xr }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, c.width, c.height).data;
    const dark = (x, y) => { const i = (y * c.width + x) * 4; return d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120 && d[i + 3] > 60; };
    let all = null, under = null;
    for (let y = 0; y < c.height && (all === null || under === null); y++) {
      for (let x = 0; x < c.width; x++) {
        if (!dark(x, y)) continue;
        if (all === null) all = 40 + y / 2;
        if (under === null && x / 2 >= xr.l && x / 2 <= xr.r) { under = 40 + y / 2; break; }
      }
    }
    return { all, under };
  }, { b64: shot.toString('base64'), xr });
  await page.evaluate(() => { document.querySelector('#s-wardrobe .wdr-headstar').style.visibility = ''; });

  console.log(`\n=== ${named ? "Catherine's style Star / Wardrobe List (2 lines)" : 'style Star Wardrobe List (1 line)'} ===`);
  console.log(`  star x-range ${xr.l}-${xr.r}`);
  console.log(`  first ink anywhere across the title: y=${ink.all}`);
  console.log(`  first ink UNDER the star:            y=${ink.under}`);
  const CLIP_WAS = 16;
  console.log(`  usable band with the clip REMOVED: y=0 (viewport) -> y=${ink.under}`);
  console.log(`  usable band with the clip in place: y=${CLIP_WAS} -> y=${ink.under}  = ${(ink.under - CLIP_WAS).toFixed(1)}px`);
  for (const size of [48, 46, 44]) {
    const top = +(ink.under - 2 - size).toFixed(1);   // 2px clear of the letters
    console.log(`   ${size}px -> star y ${top} - ${(top + size).toFixed(1)}   headroom from viewport top: ${top}px`);
  }
  await page.close();
}
await browser.close(); server.close();
