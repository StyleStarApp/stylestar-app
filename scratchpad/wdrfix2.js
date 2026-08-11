// Her 2026-08-11 phone round: the clipped star, the tab arrows, and the two
// honest star options. Renders + the sideways-scroll guard that matters now
// that overflow:hidden is gone from .ss.wardrobe-mirror.
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

// A: nothing moves, star shrinks to fit the band.  B: star stays 48, header
// gets 6px so both ends have real margin.
const OPTS = [
  { id: 'a', css: '#s-wardrobe .wdr-headstar{width:44px;height:44px;top:-38px}', label: 'A  44px, nothing moves' },
  { id: 'b', css: '#s-wardrobe .wdr-headstar{width:48px;height:48px;top:-42px}#s-wardrobe .wdr-head{margin-top:8px}', label: 'B  48px, header nudged down 8px' },
];

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

for (const o of OPTS) {
  for (const w of [390, 360, 320]) {
    for (const named of [true, false]) {
      const page = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2 });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(base + '/', { waitUntil: 'load' });
      await page.evaluate(n => localStorage.setItem('ss_data', JSON.stringify({ userName: n ? 'Catherine' : 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })), named);
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2600);
      const m = await page.evaluate(o => {
        openWardrobe('list');
        const s = document.createElement('style'); s.textContent = o.css; document.head.appendChild(s);
        const R = q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
        const mir = document.querySelector('.ss.wardrobe-mirror');
        const ars = [...document.querySelectorAll('#s-wardrobe .wdr-tab-ar')].map(e => { const r = e.getBoundingClientRect(); return +r.width.toFixed(1); });
        return { star: R('#s-wardrobe .wdr-headstar'), title: R('#s-wardrobe .wdr-title'),
          mirTop: +mir.getBoundingClientRect().top.toFixed(1), mirOverflow: getComputedStyle(mir).overflow,
          tabAr: ars, tabs: [...document.querySelectorAll('#s-wardrobe .wdr-tab')].map(e => +e.getBoundingClientRect().height.toFixed(1)),
          docW: document.documentElement.scrollWidth, vw: innerWidth, glyphAfter: getComputedStyle(document.querySelector('#s-wardrobe .wdr-tab'), '::after').content };
      }, o);
      const tag = `${o.id}@${w}${named ? '+name' : ''}`;
      console.log(`\n--- ${tag} ---  star y ${m.star.t}-${m.star.b} (${m.star.w}px)`);
      ok(m.mirOverflow === 'visible', 'the mirror no longer clips (overflow:visible)');
      ok(m.star.t >= 6, `star has real headroom from the viewport top (${m.star.t}px, want >= 6)`);
      ok(m.star.t > 0 && m.star.t >= 0, 'star is not cut by the top of the screen');
      ok(m.tabAr.length === 2 && m.tabAr.every(x => x === 19), `both tab arrows are 19px SVGs, matching the shop button (${m.tabAr})`);
      ok(m.glyphAfter === 'none' || !/2190|2192|←|→/.test(m.glyphAfter), 'the old text-glyph arrows are gone');
      ok(Math.abs(m.tabs[0] - m.tabs[1]) < 0.6, `both tabs still the same height (${m.tabs})`);
      ok(m.docW <= m.vw, `no sideways scroll now that overflow:hidden is gone (${m.docW} vs ${m.vw})`);
      ok(!errs.length, 'zero JS errors');
      if (w === 390 && named) {
        await page.evaluate(l => { const s = document.createElement('style'); s.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0}'; document.head.appendChild(s); const d = document.createElement('div'); d.id = '__lbl'; d.textContent = l; document.body.appendChild(d); }, o.label);
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrfix2-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 340 } });
      }
      await page.close();
    }
  }
}
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
