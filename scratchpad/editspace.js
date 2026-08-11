// Her 2026-08-11 screenshot of the Style Star Edit: the MENU chip is too close
// to the corner star; Back stays put; the star + header come down; the gap
// between CURATED BY CATHERINE and "Everything here..." tightens.
// This measures the real geometry before anything is tuned.
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
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(() => {
    showDream();
    const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
    // the star is a rotated SVG: its bounding box overstates the DRAWN shape,
    // so sample the real painted path the way mallverify.js did.
    const svg = document.querySelector('#s-dream .dc-corner-star');
    let drawn = null;
    if (svg) {
      const p = svg.querySelector('path');
      const len = p.getTotalLength();
      const box = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      const ctm = p.getScreenCTM();
      for (let i = 0; i <= 400; i++) {
        const pt = p.getPointAtLength(len * i / 400);
        const sp = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
        if (sp.x < minX) minX = sp.x; if (sp.x > maxX) maxX = sp.x;
        if (sp.y < minY) minY = sp.y; if (sp.y > maxY) maxY = sp.y;
      }
      drawn = { t: +minY.toFixed(1), l: +minX.toFixed(1), r: +maxX.toFixed(1), b: +maxY.toFixed(1), boxT: +box.top.toFixed(1), boxL: +box.left.toFixed(1) };
    }
    const chip = R('#menuChip') || R('.menu-chip');
    // gap between the tagline and the subtitle paragraph
    const tag = document.querySelector('#s-dream .dc-tagline');
    const sub = document.querySelector('#s-dream .dc-subtitle');
    const gap = (tag && sub) ? +(sub.getBoundingClientRect().top - tag.getBoundingClientRect().bottom).toFixed(1) : null;
    return { chip, drawn, star: R('#s-dream .dc-corner-star'), logo: R('#s-dream .dc-logo'), back: R('#s-dream .top-back-wrap'), tag: R('#s-dream .dc-tagline'), sub: R('#s-dream .dc-subtitle'), gap };
  });

  console.log(`\n=== ${w}px ===`);
  console.log('  MENU chip   ', JSON.stringify(m.chip));
  console.log('  star (box)  ', JSON.stringify(m.star));
  console.log('  star (drawn)', JSON.stringify(m.drawn));
  console.log('  logo        ', JSON.stringify(m.logo));
  console.log('  Back        ', JSON.stringify(m.back));
  console.log('  tagline     ', JSON.stringify(m.tag));
  console.log('  subtitle    ', JSON.stringify(m.sub));
  if (m.chip && m.drawn) {
    const dx = m.drawn.l - m.chip.r;          // horizontal gap chip-right to star-left
    const dy = m.drawn.t - m.chip.b;          // vertical gap chip-bottom to star-top
    const overlapX = !(m.drawn.l > m.chip.r || m.drawn.r < m.chip.l);
    const overlapY = !(m.drawn.t > m.chip.b || m.drawn.b < m.chip.t);
    console.log(`  >> drawn star vs chip: dx=${dx.toFixed(1)} dy=${dy.toFixed(1)} overlapping=${overlapX && overlapY}`);
    // nearest painted-point distance
    console.log(`  >> chip box: ${m.chip.l},${m.chip.t} -> ${m.chip.r},${m.chip.b}`);
  }
  console.log(`  >> tagline -> subtitle gap: ${m.gap}px`);
  if (errs.length) console.log('  JS ERRORS', errs);
  await page.close();
}
await browser.close(); server.close();
