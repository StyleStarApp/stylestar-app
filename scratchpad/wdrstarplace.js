// The star is built (absolute, zero layout). This proves NOTHING MOVED against
// the pre-star baseline, and renders three heights for her eye.
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

// ⚠️ DELIBERATE BASELINE UPDATE, not a silenced test. titleT was 47.6 before
// the star existed; her pick "B" (2026-08-11) accepts a 10px padding-top on
// .wdr-head so a 48px star has air above AND clears the letters below, so the
// title legitimately sits 10px lower now. Back and the chip must STILL not move
// -- those two are the untouchable part of her "move nothing" instruction.
const BASE = { backB: 42, titleT: 57.6, chipB: 42 };
// Her final pick "B": 48px at top:-39px, with .wdr-head given a 10px PADDING-top
// (not margin -- a margin here collapses with the Back row's and only 2.4px of
// an intended 8px landed; the test caught it) so the star has real air above AND
// stays clear of the title's painted letters below.
const BUILT = { size: 48, top: -39 };
const TOPS = [
  { id: 'built', top: BUILT.top, label: 'AS BUILT  48px on the header line' },
];

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

for (const o of TOPS) {
  for (const w of (o.id === 'built' ? [390, 375, 360, 320] : [390])) {
    for (const named of (o.id === 'built' ? [false, true] : [false])) {
      const page = await browser.newPage({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2 });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(base + '/', { waitUntil: 'load' });
      await page.evaluate(n => localStorage.setItem('ss_data', JSON.stringify({ userName: n ? 'Catherine' : 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })), named);
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2600);
      const m = await page.evaluate(o => {
        openWardrobe('list');
        // ⚠️ Star two real items so "Shop my whole list" actually renders -- its
        // arrow is what the tab arrows are asserted against, and the button only
        // exists when wantCount > 0. (A seeded ss_wardrobe needs pretap0:true or
        // _normalizeWardrobe wipes items; driving the real state is simpler.)
        const firstTwo = wardrobeItems[0].items.slice(0, 2).map(i => i.id);
        firstTwo.forEach(id => { wardrobeData.items[id] = 'want'; });
        renderWardrobeList();
        const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
        const chip = (document.querySelector('#menuChip') || document.querySelector('.menu-chip')).getBoundingClientRect();
        const star = R('#s-wardrobe .wdr-headstar'), title = R('#s-wardrobe .wdr-title'), backBtn = R('#s-wardrobe .top-back');
        const cs = getComputedStyle(document.querySelector('#s-wardrobe .wdr-headstar'));
        const hit = r => !(r.l > chip.right || r.r < chip.left || r.t > chip.bottom || r.b < chip.top);
        const hitB = r => backBtn && !(r.l > backBtn.r || r.r < backBtn.l || r.t > backBtn.b || r.b < backBtn.t);
        // the row star control -- a DIFFERENT class, and it must stay its own size
        const rowStar = R('#s-wardrobe .wdr-star');
        const mir = document.querySelector('.ss.wardrobe-mirror');
        return { star, title, backBtn, rowStar, headIsRowClass: !!document.querySelector('#s-wardrobe .wdr-headstar.wdr-star'),
          mirOverflow: getComputedStyle(mir).overflow, mirTop: +mir.getBoundingClientRect().top.toFixed(1),
          tabArrows: [...document.querySelectorAll('#s-wardrobe .wdr-tab-ar')].map(e => +e.getBoundingClientRect().width.toFixed(1)),
          shopArrow: (() => { const a = document.querySelector('#s-wardrobe .wsw-ar'); return a ? +a.getBoundingClientRect().width.toFixed(1) : null; })(),
          tabs: R('#s-wardrobe .wdr-tabs'), pos: cs.position, pe: cs.pointerEvents,
          chipHit: hit(star), backHit: hitB(star), ruleW: getComputedStyle(document.querySelector('#s-wardrobe .wdr-title'), '::after').width,
          docW: document.documentElement.scrollWidth, vw: innerWidth, centreOff: +((star.l + star.r) / 2 - o.w / 2).toFixed(2) };
      }, { ...o, w });
      // 🚨 RASTERISE the title's real painted ink under the star. Her cut-off
      // star and the wrong-size star both slipped past rect-only checks; the
      // star's lower bound is where the LETTERS actually begin, not where the
      // line box starts (4.4px of empty space inside it).
      await page.evaluate(() => { document.querySelector('#s-wardrobe .wdr-headstar').style.visibility = 'hidden'; });
      await page.waitForTimeout(150);
      const band = await page.screenshot({ clip: { x: 0, y: 40, width: w, height: 60 } });
      m.inkTop = await page.evaluate(async ({ b64, l, r }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, c.width, c.height).data;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          if (d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120 && d[i + 3] > 60 && x / 2 >= l && x / 2 <= r) return 40 + y / 2;
        }
        return 999;
      }, { b64: band.toString('base64'), l: m.star.l, r: m.star.r });
      await page.evaluate(() => { document.querySelector('#s-wardrobe .wdr-headstar').style.visibility = ''; });
      const tag = `${o.id}@${w}${named ? '+name' : ''}`;
      if (o.id === 'built') {
        console.log(`\n--- ${tag} ---`);
        ok(m.pos === 'absolute', 'star is absolutely positioned (zero layout cost)');
        ok(m.pe === 'none', 'star cannot eat a tap (pointer-events:none)');
        // 🚨 THE ASSERTION THAT WAS MISSING, and its absence hid a real bug. The
        // header star was first written as `.wdr-star`, which is ALREADY the
        // per-item row star button; that rule sits later in the file and won the
        // cascade, so the header star silently rendered at the row star's 30px.
        // Every clearance check still passed because they measured POSITION.
        // Assert the SIZE, and assert the two controls never share a class.
        ok(m.star.w === BUILT.size && m.star.h === BUILT.size, `star really renders at ${BUILT.size}px (${m.star.w}x${m.star.h})`);
        ok(!m.headIsRowClass, 'header star does NOT carry the row star class .wdr-star');
        ok(m.rowStar && m.rowStar.w === 30, `the row star control is untouched at 30px (${m.rowStar && m.rowStar.w})`);
        ok(Math.abs(m.title.t - BASE.titleT) < 0.5, `title did NOT move (${m.title.t} vs baseline ${BASE.titleT})`);
        ok(Math.abs(m.backBtn.b - BASE.backB) < 0.5, `Back did NOT move (${m.backBtn.b} vs baseline ${BASE.backB})`);
        ok(!m.chipHit, `star clear of the MENU chip (star ${m.star.l}-${m.star.r}, chip ends 97.4)`);
        ok(!m.backHit, `star clear of the Back button (Back starts ${m.backBtn.l})`);
        ok(Math.abs(m.centreOff) < 0.6, `star centred on the screen (off by ${m.centreOff}px)`);
        // 🚨 THE CLIP CHECK, added after her phone found the star sliced at the
        // top. .ss.wardrobe-mirror inherited overflow:hidden from the base .ss
        // (whose job is clipping to 28px rounded corners) and cut 11.4px off the
        // star's point. Every earlier check passed because they measured
        // RECTANGLES; a clipped element's rect is unchanged. Assert BOTH that
        // nothing clips it and that it sits inside the visible area.
        ok(m.mirOverflow === 'visible', `the wardrobe mirror does not clip (overflow:${m.mirOverflow})`);
        ok(m.star.t >= m.mirTop || m.mirOverflow === 'visible', `star is not cut by the mirror's top edge (star ${m.star.t}, mirror ${m.mirTop})`);
        ok(m.star.t >= 6, `star has real headroom from the top of the screen (${m.star.t}px, want >= 6)`);
        ok(m.star.b < m.inkTop, `star sits clear of the title's painted letters (bottom ${m.star.b}, letters start ${m.inkTop})`);
        ok(Math.abs(parseFloat(m.ruleW) - m.title.w) < 1, `gold rule still equals the words (${m.ruleW} vs ${m.title.w})`);
        // her ask: the tab arrows must be the SAME size as the shop button's
        ok(m.tabArrows.length === 2 && m.tabArrows.every(x => x === m.shopArrow),
          `both tab arrows match the "Shop my whole list" arrow (${m.tabArrows} vs ${m.shopArrow})`);
        // ⚠️ overflow:hidden used to contain horizontal overflow here and nothing
        // else does now, so this assertion carries more weight than it did.
        ok(m.docW <= m.vw, `no sideways page scroll (${m.docW} vs ${m.vw})`);
        ok(!errs.length, 'zero JS errors');
      } else {
        console.log(`${tag}: star y ${m.star.t}-${m.star.b}, title top ${m.title.t}`);
      }
      if (w === 390 && !named) {
        await page.evaluate(l => { const s = document.createElement('style'); s.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0}'; document.head.appendChild(s); const d = document.createElement('div'); d.id = '__lbl'; d.textContent = l; document.body.appendChild(d); }, o.label);
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrplace-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 330 } });
      }
      await page.close();
    }
  }
}
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
