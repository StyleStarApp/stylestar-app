// Her pick 2026-08-11: option C (worksheet column headings, ADD + SHOP) PLUS a
// combo she proposed -- tapping the star turns it gold AND shows "ADDED" under it.
// ⚠️ THE TRAP TO MEASURE: a caption that appears ON TAP makes that row TALLER,
// so the whole list below shifts under her thumb. That is the exact problem she
// already solved once on this page (the how-to collapse was deliberately
// deferred to the NEXT visit so the list would not jump mid-scroll).
// Two ways to honour her idea; this measures the cost of each.
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
const HEAD = `.__hdr{display:flex;align-items:center;justify-content:flex-end;gap:0 9px;padding:0 2px 5px;
   border-bottom:1.5px solid #C9B893;margin-bottom:2px}
 .__hdr span{font:700 8.5px/1 'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8a7f66}
 .__hdr .h-ideas{width:52px;text-align:center}.__hdr .h-add{width:30px;text-align:center}
 #s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}`;

const OPTS = [
  // reserve the caption line on EVERY row: uniform heights, nothing jumps,
  // but the page grows by one caption line x every row
  { id: 'reserve', label: 'C1  space reserved on every row  (no jump)', reserve: true },
  // caption only on starred rows: page stays short, but the row grows on tap
  { id: 'ontap', label: 'C2  caption only when starred  (row grows on tap)', reserve: false },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(({ o, HEADCSS }) => {
    openWardrobe('list');
    const baseH = document.querySelector('#s-wardrobe .wdr-list, #s-wardrobe').scrollHeight;
    const s = document.createElement('style');
    s.textContent = HEADCSS + `
      #s-wardrobe .wdr-star{flex-direction:column;gap:1px}
      .__cap{font:700 8px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a7f66;display:block;min-height:8px}`;
    document.head.appendChild(s);
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
        if (!on && !o.reserve) return;                 // C2: nothing on unstarred rows
        const c = document.createElement('span'); c.className = '__cap';
        c.textContent = on ? 'Added' : '';             // C1: reserved but blank
        st.appendChild(c);
      });
    };
    paint();
    // measure the row heights and the page cost
    const rows = [...document.querySelectorAll('#s-wardrobe .wdr-item')];
    const plainH = +rows[0].getBoundingClientRect().height.toFixed(1);
    const pageWith = document.documentElement.scrollHeight;
    // now star an adjacent pair and see whether anything below MOVES
    const targets = rows.slice(1, 3);
    const belowBefore = +rows[4].getBoundingClientRect().top.toFixed(1);
    const ids = wardrobeItems[0].items.slice(1, 3).map(i => i.id);
    ids.forEach(id => { wardrobeData.items[id] = 'want'; });
    renderWardrobeList(); paint();
    const rows2 = [...document.querySelectorAll('#s-wardrobe .wdr-item')];
    const belowAfter = +rows2[4].getBoundingClientRect().top.toFixed(1);
    const starredH = +rows2[1].getBoundingClientRect().height.toFixed(1);
    const plainH2 = +rows2[0].getBoundingClientRect().height.toFixed(1);
    const s2 = document.createElement('style');
    s2.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 12.5px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 4px}';
    document.head.appendChild(s2);
    const d = document.createElement('div'); d.id = '__lbl'; d.textContent = o.label; document.body.appendChild(d);
    const el = document.querySelector('#s-wardrobe .wdr-item.want');
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 300));
    return { baseH, pageWith, pageAfter: document.documentElement.scrollHeight,
      plainH, plainH2, starredH, shift: +(belowAfter - belowBefore).toFixed(1), rowCount: rows.length };
  }, { o, HEADCSS: HEAD });

  console.log(`\n--- ${o.label} ---`);
  console.log(`  rows on the page: ${m.rowCount}`);
  console.log(`  plain row ${m.plainH2}px   starred row ${m.starredH}px   difference ${(m.starredH - m.plainH2).toFixed(1)}px`);
  console.log(`  >> rows below the tap MOVED BY: ${m.shift}px  ${Math.abs(m.shift) < 1 ? '(nothing jumps)' : '<-- THE LIST JUMPS UNDER HER THUMB'}`);
  console.log(`  page height with the change: ${m.pageWith}px (was ${m.baseH}px in-list)`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrcombo-${o.id}.png`) });
  await page.close();
}
await browser.close(); server.close();
