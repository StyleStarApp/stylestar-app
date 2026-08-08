// Verify the Mall header fixes: star clears chip, gaps tightened, star one color, screenshot.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const PORT = 8934, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') { res.writeHead(200, {'Content-Type':'text/html'}); res.end(HTML); return; }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end();
});
await new Promise(r => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fails = 0, checks = 0;
const ok = (name, cond, extra) => { checks++; console.log((cond?'PASS ':'FAIL ')+name+(extra?'  ['+extra+']':'')); if(!cond) fails++; };

for (const w of [390, 360]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(ORIGIN + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showShop());
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const chip = document.querySelector('.menu-chip').getBoundingClientRect();
    const p = document.querySelector('#s-shop .mf-star path');
    const len = p.getTotalLength(), ctm = p.getScreenCTM();
    let minTop = Infinity;
    for (let i = 0; i <= 400; i++) {
      const pt = p.getPointAtLength(len * i / 400);
      const x = ctm.a*pt.x + ctm.c*pt.y + ctm.e, y = ctm.b*pt.x + ctm.d*pt.y + ctm.f;
      if (x >= chip.left && x <= chip.right && y < minTop) minTop = y;
    }
    const r = s => document.querySelector(s).getBoundingClientRect();
    const sign = r('#s-shop .mall-sign'), disc = r('#s-shop .dc-disclosure'), cat = r('#mallContent .mall-cat');
    const cats = [...document.querySelectorAll('#mallContent .mall-cat')];
    const secondCatMT = cats[1] ? getComputedStyle(cats[1]).marginTop : 'n/a';
    return {
      clearance: Math.round(minTop - chip.bottom),
      gapSignToDisc: Math.round(disc.top - sign.bottom),
      gapDiscToCat: Math.round(cat.top - disc.bottom),
      stroke: p.getAttribute('stroke'), defs: !!document.querySelector('#s-shop .mf-star defs'),
      secondCatMT,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  ok(w+': star clears Menu chip', m.clearance >= 6, 'clearance='+m.clearance+'px');
  ok(w+': sign->disclosure tightened', m.gapSignToDisc <= 12, m.gapSignToDisc+'px (was 24)');
  ok(w+': disclosure->Contemporary tightened', m.gapDiscToCat <= 15, m.gapDiscToCat+'px (was 27)');
  ok(w+': star is one solid color', m.stroke === '#D8A52E' && !m.defs, 'stroke='+m.stroke);
  ok(w+': later categories keep spacing', m.secondCatMT === '27.2px', m.secondCatMT);
  ok(w+': no overflow', !m.overflow);
  ok(w+': zero JS errors', errors.length === 0, errors.join(' | '));
  if (w === 390) await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'mall-fixed.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });
  await ctx.close();
}
await browser.close(); server.close();
console.log(checks+' checks, '+fails+' failures');
process.exit(fails ? 1 : 0);
