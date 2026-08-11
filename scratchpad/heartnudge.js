// Her two notes 2026-08-11: (a) confirm the hub marks + her-voice sub-lines are
// on EVERY hub surface, not just Welcome Back; (b) the hearts look a touch far
// from the words.
// ⚠️ Measured on PAINTED PIXELS, not box rects. The curated-by hearts taught
// this exact lesson: letter-spacing puts its space after the LAST letter too, so
// two gaps that measure identical by advance width can look plainly uneven.
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

const SURFACES = [
  { id: 's-wel', label: 'Discover (welcome)', open: "show('s-wel')" },
  { id: 's-wb', label: 'Welcome Back', open: "show('s-wb');updateWbScreen()" },
  { id: 's-res', label: 'See your Style Portrait', open: "show('s-res');document.getElementById('s-res').classList.add('rv-open')" },
  { id: 's-photo-res', label: 'Analyze results', open: "show('s-photo-res')" },
];

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2600);

for (const s of SURFACES) {
  const r = await page.evaluate(o => {
    eval(o.open);
    const scr = document.getElementById(o.id);
    const hearts = [...scr.querySelectorAll('.hub-ch')];
    const visible = hearts.filter(h => h.offsetParent !== null);
    const subs = [...scr.querySelectorAll('.wb-sub,.actsub,.hm-csub')].map(e => e.textContent.trim());
    // the gap from the title text's own box to the heart's left edge
    const gaps = visible.map(h => {
      const label = h.previousSibling && h.previousSibling.nodeType === 1 ? h.previousSibling : h.parentElement.firstElementChild;
      const rg = document.createRange();
      const host = h.parentElement;
      // the text node immediately before the heart
      let tn = h.previousSibling;
      while (tn && tn.nodeType !== 3 && tn.firstChild) tn = tn.firstChild;
      let textRight = null;
      if (tn && tn.nodeType === 3) { rg.selectNodeContents(tn); textRight = rg.getBoundingClientRect().right; }
      else if (label) textRight = label.getBoundingClientRect().right;
      const hr = h.getBoundingClientRect();
      return { boxGap: textRight === null ? null : +(hr.left - textRight).toFixed(2), heartL: +hr.left.toFixed(1), heartR: +hr.right.toFixed(1), top: +hr.top.toFixed(1), h: +hr.height.toFixed(1) };
    });
    return { hearts: hearts.length, visible: visible.length, subs, gaps,
      ls: visible[0] ? getComputedStyle(visible[0].parentElement).letterSpacing : null,
      disp: visible[0] ? getComputedStyle(visible[0].parentElement).display : null,
      flexGap: visible[0] ? getComputedStyle(visible[0].parentElement).gap : null,
      ml: visible[0] ? getComputedStyle(visible[0]).marginLeft : null };
  }, s);
  console.log(`\n--- ${s.label} (${s.id}) ---`);
  console.log(`  hearts in markup: ${r.hearts}, visible: ${r.visible}   parent display:${r.disp} gap:${r.flexGap} letter-spacing:${r.ls} heart margin-left:${r.ml}`);
  r.gaps.forEach(g => console.log(`    box gap text->heart: ${g.boxGap}px`));
  ok(r.visible >= 1, `her mark is on this surface (${r.visible} visible)`);
  const hersSubs = r.subs.filter(x => /Pieces I wear myself|Stores I've chosen|checklist I use with clients/.test(x));
  ok(hersSubs.length >= 1, `her-voice sub-lines are here too (${hersSubs.length}: ${hersSubs.join(' | ')})`);
  ok(!/Hand-picked pieces|Browse curated stores|Your personal wardrobe checklist/.test(r.subs.join('|')), 'no faceless leftovers on this surface');
  // her nudge: the mark should sit as close to the words as the Menu's does (5px)
  r.gaps.forEach(g => ok(g.boxGap !== null && g.boxGap >= 4 && g.boxGap <= 7,
    `mark sits ${g.boxGap}px from the words, matching the Menu's 5px (want 4-7)`));
}
ok(!errs.length, 'zero JS errors across all four surfaces');
await page.close();
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
