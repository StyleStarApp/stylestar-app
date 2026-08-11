// Careful re-measure of her combo idea (star turns gold AND says ADDED under it).
// ⚠️ The first attempt measured nothing: .wdr-star is height:30px FIXED, so the
// caption overflowed invisibly. And the 122px shift it reported was the "Shop my
// whole list" button appearing when wantCount goes 0->1, which is pre-existing
// behaviour, not the caption. Both corrected here: the star box is allowed to
// grow, and the shift is measured while the Shop button is ALREADY present.
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

const RULE = '#D6C9A8';
const CSS = `
 .__hdr{display:flex;align-items:center;justify-content:flex-end;gap:0 9px;padding:0 2px 5px;
   border-bottom:1.5px solid #C9B893;margin-bottom:2px}
 .__hdr span{font:700 8.5px/1 'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8a7f66}
 .__hdr .h-ideas{width:52px;text-align:center}.__hdr .h-add{width:30px;text-align:center}
 #s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}
 #s-wardrobe .wdr-star{flex-direction:column;height:auto;gap:1px}
 .__cap{font:700 8px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a7f66;display:block}`;

// MODE reserve: every row keeps a caption line (blank when unstarred) -> uniform
// MODE ontap:   only starred rows get one -> that row grows the moment she taps
for (const mode of ['reserve', 'ontap']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(({ mode, CSS }) => {
    openWardrobe('list');
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    const paint = () => {
      document.querySelectorAll('#s-wardrobe .__cap,#s-wardrobe .__hdr').forEach(e => e.remove());
      document.querySelectorAll('#s-wardrobe .wdr-cat').forEach(cat => {
        const first = cat.querySelector('.wdr-item'); if (!first) return;
        const h = document.createElement('div'); h.className = '__hdr';
        h.innerHTML = '<span class="h-ideas">Shop</span><span class="h-add">Add</span>';
        cat.insertBefore(h, first);
      });
      document.querySelectorAll('#s-wardrobe .wdr-star').forEach(st => {
        const on = st.getAttribute('aria-pressed') === 'true';
        if (!on && mode === 'ontap') return;
        const c = document.createElement('span'); c.className = '__cap';
        c.textContent = on ? 'Added' : ' ';
        st.appendChild(c);
      });
    };
    // ⚠️ pre-star ONE item so the "Shop my whole list" button already exists --
    // otherwise its appearance swamps the measurement we actually care about.
    wardrobeData.items[wardrobeItems[0].items[0].id] = 'want';
    renderWardrobeList(); paint();

    const rowsA = [...document.querySelectorAll('#s-wardrobe .wdr-item')];
    const plainH = +rowsA[3].getBoundingClientRect().height.toFixed(1);
    const starredH = +rowsA[0].getBoundingClientRect().height.toFixed(1);
    const pageBefore = document.documentElement.scrollHeight;
    const anchorBefore = +rowsA[8].getBoundingClientRect().top.toFixed(1);

    // now tap ONE more row (index 2) -- the Shop button is already there
    wardrobeData.items[wardrobeItems[0].items[2].id] = 'want';
    renderWardrobeList(); paint();
    const rowsB = [...document.querySelectorAll('#s-wardrobe .wdr-item')];
    const anchorAfter = +rowsB[8].getBoundingClientRect().top.toFixed(1);
    return { plainH, starredH, pageBefore, pageAfter: document.documentElement.scrollHeight,
      shift: +(anchorAfter - anchorBefore).toFixed(1), rows: rowsA.length };
  }, { mode, CSS });

  console.log(`\n--- ${mode === 'reserve' ? 'C1  caption line reserved on EVERY row' : 'C2  caption only on STARRED rows'} ---`);
  console.log(`  plain row ${m.plainH}px   starred row ${m.starredH}px   difference ${(m.starredH - m.plainH).toFixed(1)}px`);
  console.log(`  >> tapping one more star moved the rows below by: ${m.shift}px  ${Math.abs(m.shift) < 1 ? '(nothing jumps ✅)' : '<-- JUMPS UNDER HER THUMB'}`);
  console.log(`  page height ${m.pageBefore} -> ${m.pageAfter}px over ${m.rows} rows`);
  await page.close();
}
await browser.close(); server.close();
