// Verify the 220px drawer + the corner ✕: nothing wraps at 390/360/320, the ✕
// really is in the top-right corner, its tap area is still comfortable, and the
// panel never scrolls sideways. Screenshot at 390 for Cath's eye.
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
const ok = (n, c, x) => { checks++; console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : '')); if (!c) fails++; };

for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => menuOpen());
  await page.waitForTimeout(300);

  const m = await page.evaluate(() => {
    const panel = document.getElementById('menuPanel');
    const p = panel.getBoundingClientRect();
    const rows = [...panel.querySelectorAll('.menu-row')];
    const wraps = rows.filter(r => {
      const cs = getComputedStyle(r);
      const lh = parseFloat(cs.lineHeight);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      return (r.getBoundingClientRect().height - pad) / lh > 1.5;
    }).map(r => r.textContent.trim());
    const x = document.querySelector('.menu-x');
    const xr = x.getBoundingClientRect();
    const logo = document.querySelector('.menu-logo').getBoundingClientRect();
    // where the glyph itself paints, ignoring the button's padding
    const cs = getComputedStyle(x);
    const glyphRight = xr.right - parseFloat(cs.paddingRight);
    const glyphTop = xr.top + parseFloat(cs.paddingTop);
    const overflowRight = Math.max(0, ...[...panel.querySelectorAll('*')].map(e => e.getBoundingClientRect().right - p.right));
    return {
      panelW: Math.round(p.width), rowCount: rows.length, wraps,
      fromRight: Math.round(p.right - glyphRight), fromTop: Math.round(glyphTop - p.top),
      tapW: Math.round(xr.width), tapH: Math.round(xr.height),
      aboveLogoMid: glyphTop < logo.top + logo.height / 2,
      hSideScroll: panel.scrollWidth - panel.clientWidth,
      overflowRight: Math.round(overflowRight),
      pillOn: document.getElementById('menuStartPill').classList.contains('on')
    };
  });

  ok(w + ': panel is 220 (or 70vw)', m.panelW === Math.min(220, Math.round(w * 0.7)), m.panelW + 'px');
  ok(w + ': all ' + m.rowCount + ' rows stay on one line', m.wraps.length === 0, m.wraps.join(', '));
  ok(w + ': "Start here" pill shown (widest state tested)', m.pillOn === true);
  ok(w + ': ✕ hugs the right edge (<26px in)', m.fromRight > 0 && m.fromRight < 26, m.fromRight + 'px from panel edge');
  ok(w + ': ✕ sits high (<26px from panel top)', m.fromTop >= 0 && m.fromTop < 26, m.fromTop + 'px from top');
  ok(w + ': ✕ is above the logo\'s midline', m.aboveLogoMid);
  ok(w + ': ✕ tap area still comfortable (>=32px)', m.tapW >= 32 && m.tapH >= 32, m.tapW + 'x' + m.tapH);
  ok(w + ': nothing overflows the panel sideways', m.overflowRight <= 0 && m.hSideScroll <= 0, 'over ' + m.overflowRight + ', scroll ' + m.hSideScroll);
  ok(w + ': zero JS errors', errs.length === 0, errs.join(' | '));

  // the ✕ still closes the drawer
  if (w === 390) {
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'menu-220.png') });
    await page.click('.menu-x');
    await page.waitForTimeout(250);
    const closed = await page.evaluate(() => !document.body.classList.contains('menu-open'));
    ok('390: ✕ still closes the drawer', closed);
  }
  await page.close();
}
await browser.close(); server.close();
console.log('\n' + checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
