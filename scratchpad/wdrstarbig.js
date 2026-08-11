// Her question 2026-08-11: can the wardrobe header star be LARGER without
// moving anything? It is absolute, so size costs no layout -- the real limits
// are (a) the top of the screen, (b) the MENU chip on the left, (c) the Back
// button on the right, (d) the title's own painted letters underneath.
// This finds the true ceiling and renders the candidates.
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

// keep the star's BOTTOM roughly where it is today (51.6) and grow upward
const OPTS = [
  { id: 's34', size: 34, top: -30, label: 'CURRENT  34px' },
  { id: 's42', size: 42, top: -38, label: 'A  42px' },
  { id: 's48', size: 48, top: -43, label: 'B  48px' },
  { id: 's56', size: 56, top: -46, label: 'C  56px  (dips behind the words)' },
];

// find the title's real painted ink top by rasterising the header band
async function inkTop(page, w) {
  const buf = await page.screenshot({ clip: { x: 0, y: 40, width: w, height: 40 } });
  return buf; // returned for eyeballing; the numeric guard below uses geometry
}

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

for (const o of OPTS) {
  for (const w of [390, 320]) {
    const page = await browser.newPage({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2 });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const m = await page.evaluate(o => {
      openWardrobe('list');
      const s = document.createElement('style');
      s.textContent = `#s-wardrobe .wdr-star{width:${o.size}px;height:${o.size}px;top:${o.top}px}`;
      document.head.appendChild(s);
      const R = q => { const e = document.querySelector(q); const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) }; };
      const chip = (document.querySelector('#menuChip') || document.querySelector('.menu-chip')).getBoundingClientRect();
      const star = R('#s-wardrobe .wdr-star'), title = R('#s-wardrobe .wdr-title'), back = R('#s-wardrobe .top-back');
      return { star, title, back, chipR: +chip.right.toFixed(1), chipT: +chip.top.toFixed(1),
        chipHit: !(star.l > chip.right || star.r < chip.left || star.t > chip.bottom || star.b < chip.top),
        backHit: !(star.l > back.r || star.r < back.l || star.t > back.b || star.b < back.t),
        docW: document.documentElement.scrollWidth, vw: innerWidth };
    }, o);
    console.log(`\n--- ${o.label} @ ${w} ---`);
    console.log(`  star y ${m.star.t} -> ${m.star.b}   x ${m.star.l} -> ${m.star.r}`);
    ok(Math.abs(m.title.t - 47.6) < 0.5, `title did NOT move (${m.title.t})`);
    ok(Math.abs(m.back.b - 42) < 0.5, `Back did NOT move (${m.back.b})`);
    ok(m.star.t >= 4, `star clears the top of the screen (top ${m.star.t}, want >= 4)`);
    ok(!m.chipHit, `clear of the MENU chip (chip ends x${m.chipR}, star starts x${m.star.l})`);
    ok(!m.backHit, `clear of the Back button (Back starts x${m.back.l}, star ends x${m.star.r})`);
    ok(m.docW <= m.vw, 'no sideways page scroll');
    ok(!errs.length, 'zero JS errors');
    if (w === 390) {
      await page.evaluate(l => { const s = document.createElement('style'); s.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0}'; document.head.appendChild(s); const d = document.createElement('div'); d.id = '__lbl'; d.textContent = l; document.body.appendChild(d); }, o.label);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrbig-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 300 } });
    }
    await page.close();
  }
}
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
