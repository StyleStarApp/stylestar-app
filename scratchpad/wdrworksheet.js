// The worksheet as built, 2026-08-11: stronger rules, sticky category+column
// header, the Ideas chip, ADDED on starred rows. Verifies the things her eye
// asked for and the things only measurement can see.
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

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

for (const w of [390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(() => {
    openWardrobe('list');
    wardrobeItems[0].items.slice(1, 3).forEach(i => { wardrobeData.items[i.id] = 'want'; });
    renderWardrobeList();
    const row = document.querySelector('#s-wardrobe .wdr-item');
    const see = row.querySelector('.wdr-see').getBoundingClientRect();
    const star = row.querySelector('.wdr-star').getBoundingClientRect();
    const head = document.querySelector('#s-wardrobe .wdr-cathead');
    const shop = head.querySelector('.ch-shop').getBoundingClientRect();
    const add = head.querySelector('.ch-add').getBoundingClientRect();
    const cs = getComputedStyle(head);
    const lblCs = getComputedStyle(head.querySelector('.ch-shop'));
    // contrast of the labels against the paper they actually sit on
    const lum = c => { const [r, g, b] = c.match(/\d+/g).map(Number);
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    // 2026-08-12, her call: the "Shop them all together" sub was REPLACED by
    // the Catherine line (.wml-cath) when the clean-list summary landed.
    const sub = document.querySelector('#s-wardrobe .wml-cath');
    let subLines = null;
    if (sub) { const rg = document.createRange(); rg.selectNodeContents(sub);
      // The tilted heart SVG contributes its own rect a couple px off the
      // text's top, so exact top-matching invents a phantom second line.
      // A real wrap moves ~20px (line-height), so cluster within 6px.
      const tops = [...rg.getClientRects()].map(x => x.top).sort((a, b) => a - b);
      subLines = tops.reduce((n, t, i) => (i === 0 || t - tops[i - 1] > 6) ? n + 1 : n, 0); }
    const oldSubGone = !document.querySelector('#s-wardrobe .wse-sub');
    const starred = document.querySelector('#s-wardrobe .wdr-item.want');
    const names = [...document.querySelectorAll('#s-wardrobe .wdr-name')].map(e => {
      const rg = document.createRange(); rg.selectNodeContents(e);
      return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size;
    });
    return {
      seeW: +see.width.toFixed(1), seeH: +see.height.toFixed(1),
      gap: +(star.left - see.right).toFixed(1),
      shopOff: +(((shop.left + shop.right) / 2) - ((see.left + see.right) / 2)).toFixed(1),
      addOff: +(((add.left + add.right) / 2) - ((star.left + star.right) / 2)).toFixed(1),
      sticky: cs.position, stickyTop: cs.top, bg: cs.backgroundColor,
      addedTxt: starred ? (starred.querySelector('.wdr-added') || {}).textContent : null,
      plainHasAdded: !!document.querySelector('#s-wardrobe .wdr-item:not(.want) .wdr-added'),
      divider: getComputedStyle(row).borderBottomColor,
      wraps: names.filter(n => n > 1).length, rows: names.length,
      lblSize: parseFloat(lblCs.fontSize), lblContrast: +cr(lblCs.color, cs.backgroundColor).toFixed(2),
      subLines, subHasBr: !!(sub && sub.querySelector('br')), oldSubGone,
      docW: document.documentElement.scrollWidth, vw: innerWidth, cats: document.querySelectorAll('#s-wardrobe .wdr-cathead').length
    };
  });

  console.log(`\n--- worksheet @ ${w} ---`);
  ok(m.seeH >= 22, `the Ideas chip is a real tap target (${m.seeW}x${m.seeH}, was 46.5x11.5)`);
  // ⚠️ 19px at 390; 12px under 390, where the row's own gap AND the chip's margin
  // are deliberately trimmed to give the item names their width back. Both are
  // still far better than the 9px the bare link had.
  ok(m.gap >= 12, `and it sits clear of the star (${m.gap}px, was 9px)`);
  // ⚠️ her catch: the heading has to sit OVER the control it names
  ok(Math.abs(m.shopOff) < 1.5, `SHOP is centred over the Ideas chip (off by ${m.shopOff}px)`);
  ok(Math.abs(m.addOff) < 1.5, `ADD is centred over the star (off by ${m.addOff}px)`);
  ok(m.sticky === 'sticky' && m.stickyTop === '46px', `the category header is sticky below the MENU chip (${m.sticky} @ ${m.stickyTop})`);
  ok(m.bg !== 'rgba(0, 0, 0, 0)', `the sticky header is opaque so rows cannot scroll through it (${m.bg})`);
  ok(m.addedTxt === 'Added', `a starred row says ADDED (${m.addedTxt})`);
  ok(!m.plainHasAdded, 'an unstarred row says nothing');
  ok(m.divider === 'rgb(214, 201, 168)', `the divider is the visible #D6C9A8 (${m.divider})`);
  ok(m.cats >= 10, `every category carries the heading (${m.cats})`);
  // ⚠️ HONEST NUMBERS, not a silenced test. The chip costs the name column real
  // width, so wrapping goes 0->1 at 390, 1->3 at 360, and 11->14 at 320. 320 was
  // always a losing battle on this list (it was 15 before the 2026-07-26 trim);
  // the trade she accepted is a proper tap target over a perfectly even list,
  // and NO text was shrunk to buy it.
  const wrapCap = w >= 375 ? 3 : (w >= 360 ? 4 : 15);
  ok(m.wraps <= wrapCap, `name wrapping stays contained (${m.wraps} of ${m.rows}, cap ${wrapCap})`);
  // ⚠️ her catch: the labels were 8.5px at 3.79:1, BELOW the AA bar -- the same
  // failure as the Menu's group labels. They are the only thing telling her what
  // the two controls do, so they must stay readable. Don't re-quieten them.
  ok(m.lblSize >= 10, `the column labels are readable at ${m.lblSize}px (were 8.5)`);
  ok(m.lblContrast >= 4.5, `and clear AA on the real paper (${m.lblContrast}:1, was 3.79)`);
  // The closing line is the Catherine line now (her call, 2026-08-12). Her
  // wording needs ~331px in a 300px box, so it BALANCES to two even lines by
  // design — never one, never a ragged three. Don't "fix" this to one line by
  // shrinking the font (the readability rule).
  ok(m.subLines === 2, `"Building your well-rounded wardrobe with intention" balances to two lines (${m.subLines})`);
  ok(!m.subHasBr, 'no hardcoded <br>, so it can never re-split');
  ok(m.oldSubGone, 'the old "Shop them all together" sub stays retired (replaced, not doubled)');
  ok(m.docW <= m.vw, `no sideways scroll (${m.docW} vs ${m.vw})`);
  ok(!errs.length, 'zero JS errors');

  if (w === 390) {
    // prove the header REALLY sticks: scroll deep and check it is still on screen
    const st = await page.evaluate(() => {
      window.scrollTo(0, 1400);
      const heads = [...document.querySelectorAll('#s-wardrobe .wdr-cathead')];
      const onScreen = heads.filter(h => { const r = h.getBoundingClientRect(); return r.top >= 40 && r.top < 120; });
      return { stuckAt: onScreen.length ? +onScreen[0].getBoundingClientRect().top.toFixed(1) : null,
               label: onScreen.length ? onScreen[0].querySelector('.wdr-cat-t').textContent : null };
    });
    ok(st.stuckAt !== null, `scrolled 1400px deep, a category header is still pinned at y${st.stuckAt} ("${st.label}")`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'worksheet-stuck.png'), clip: { x: 0, y: 0, width: 390, height: 480 } });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'worksheet-top.png'), clip: { x: 0, y: 0, width: 390, height: 700 } });
  }
  await page.close();
}
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
