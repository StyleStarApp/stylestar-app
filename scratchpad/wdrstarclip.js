// HER PHONE, 2026-08-11: the 48px header star is CUT OFF at the top. The 4.6px
// of headroom I flagged as the risk did not survive her device. This finds out
// WHAT clips it (an overflow ancestor vs simply running off the viewport),
// rasterises the title's REAL painted ink top so the star's lower bound stops
// being a guess, and then sweeps size/offset pairs for one with real margin.
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

const page = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2600);

// ---- 1. what, if anything, clips the star? ----
const census = await page.evaluate(() => {
  openWardrobe('list');
  const star = document.querySelector('#s-wardrobe .wdr-headstar');
  const out = [];
  let el = star.parentElement;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const r = el.getBoundingClientRect();
      out.push({ sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), overflow: `${cs.overflow}/${cs.overflowX}/${cs.overflowY}`, top: +r.top.toFixed(1) });
    }
    el = el.parentElement;
  }
  const r = star.getBoundingClientRect();
  return { clippers: out, starTop: +r.top.toFixed(1), starBottom: +r.bottom.toFixed(1) };
});
console.log('\n=== 1. clipping ancestors of the star ===');
console.log('  star y', census.starTop, '->', census.starBottom);
if (!census.clippers.length) console.log('  NONE -- nothing clips it here; on her phone it simply ran off the top of the viewport.');
census.clippers.forEach(c => console.log('  ' + c.sel + '  overflow ' + c.overflow + '  top ' + c.top));

// ---- 2. the title's REAL painted ink top (rasterised, not the line box) ----
await page.evaluate(() => { document.querySelector('#s-wardrobe .wdr-headstar').style.visibility = 'hidden'; });
await page.waitForTimeout(200);
const shot = await page.screenshot({ clip: { x: 0, y: 40, width: 390, height: 40 } });
// decode the screenshot back INSIDE the browser via canvas -- no PNG lib here
const inkY = await page.evaluate(async b64 => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height).data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120 && d[i + 3] > 60) return 40 + y / 2;  // dSF 2
    }
  }
  return null;
}, shot.toString('base64'));
await page.evaluate(() => { document.querySelector('#s-wardrobe .wdr-headstar').style.visibility = ''; });
console.log('\n=== 2. the title\'s real painted ink ===');
console.log(`  line box top 47.6, but the LETTERS actually start at y=${inkY}  (${(inkY - 47.6).toFixed(1)}px of empty space inside the box)`);

// ---- 3. sweep for a size/offset with real margin at BOTH ends ----
console.log('\n=== 3. candidates (want >= 10px headroom AND bottom above the letters) ===');
const HEADROOM_MIN = 10;
const rows = [];
for (const size of [48, 46, 44, 42]) {
  for (let top = -46; top <= -30; top++) {
    const m = await page.evaluate(([size, top]) => {
      const s = document.querySelector('#s-wardrobe .wdr-headstar');
      s.style.width = size + 'px'; s.style.height = size + 'px'; s.style.top = top + 'px';
      const r = s.getBoundingClientRect();
      return { t: +r.top.toFixed(1), b: +r.bottom.toFixed(1) };
    }, [size, top]);
    if (m.t >= HEADROOM_MIN && m.b <= inkY - 1) rows.push({ size, top, headroom: m.t, gapToLetters: +(inkY - m.b).toFixed(1) });
  }
}
if (!rows.length) console.log('  none -- the band cannot hold any of these sizes with 10px at both ends');
// best per size = the largest star that fits, most headroom
const bySize = {};
for (const r of rows) if (!bySize[r.size] || r.headroom > bySize[r.size].headroom) bySize[r.size] = r;
Object.values(bySize).sort((a, b) => b.size - a.size).forEach(r =>
  console.log(`  ${r.size}px at top:${r.top}px  -> headroom ${r.headroom}px, ${r.gapToLetters}px clear of the letters`));

await browser.close(); server.close();
