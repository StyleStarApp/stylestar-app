// Her 2026-08-11 conversation about the Wardrobe List as a WORKSHEET -- the
// format she actually uses in a client's closet. Two problems she named:
//   1. the star's meaning is explained at the top but not at the POINT OF USE
//   2. two starred rows in a row merge into one colour block, because the
//      divider (#f0ebe0) on the starred fill (#FAF1DA) measures 1.06:1
// Renders four directions, minimal -> full worksheet.
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

const RULE = '#D6C9A8';   // measured: 1.57:1 on paper, 1.46:1 on a starred row

const OPTS = [
  { id: 'current', label: 'CURRENT', css: '', head: false, cap: false },
  {
    id: 'a', label: 'A  stronger rules only (the minimal fix)', head: false, cap: false,
    css: `#s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}`
  },
  {
    id: 'b', label: 'B  stronger rules + a caption under every star', head: false, cap: true,
    css: `#s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}
          #s-wardrobe .wdr-star{flex-direction:column;gap:1px}
          .__cap{font:700 8px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a7f66;display:block}`
  },
  {
    id: 'c', label: 'C  THE WORKSHEET  column heading + stronger rules', head: true, cap: false,
    css: `#s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}
          .__hdr{display:flex;align-items:center;justify-content:flex-end;gap:0 9px;padding:0 2px 5px;
                 border-bottom:1.5px solid #C9B893;margin-bottom:2px}
          .__hdr span{font:700 8.5px/1 'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8a7f66}
          .__hdr .h-ideas{width:52px;text-align:center}
          .__hdr .h-add{width:30px;text-align:center}`
  },
  {
    id: 'd', label: 'D  worksheet heading + rules + starred rows keep their own edge', head: true, cap: false,
    css: `#s-wardrobe .wdr-item{border-bottom:1px solid ${RULE}}
          #s-wardrobe .wdr-item.want{background:#FAF1DA;box-shadow:inset 3px 0 0 #D8A52E}
          .__hdr{display:flex;align-items:center;justify-content:flex-end;gap:0 9px;padding:0 2px 5px;
                 border-bottom:1.5px solid #C9B893;margin-bottom:2px}
          .__hdr span{font:700 8.5px/1 'Jost',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8a7f66}
          .__hdr .h-ideas{width:52px;text-align:center}
          .__hdr .h-add{width:30px;text-align:center}`
  },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(o => {
    openWardrobe('list');
    // star two ADJACENT rows -- that is the case she screenshotted
    const ids = wardrobeItems[0].items.slice(1, 3).map(i => i.id);
    ids.forEach(id => { wardrobeData.items[id] = 'want'; });
    renderWardrobeList();
    if (o.css) { const s = document.createElement('style'); s.textContent = o.css; document.head.appendChild(s); }
    if (o.head) {
      document.querySelectorAll('#s-wardrobe .wdr-cat').forEach(cat => {
        const first = cat.querySelector('.wdr-item');
        if (!first) return;
        const h = document.createElement('div');
        h.className = '__hdr';
        h.innerHTML = '<span class="h-ideas">Shop</span><span class="h-add">Add</span>';
        cat.insertBefore(h, first);
      });
    }
    if (o.cap) {
      document.querySelectorAll('#s-wardrobe .wdr-star').forEach(st => {
        const c = document.createElement('span'); c.className = '__cap';
        c.textContent = st.getAttribute('aria-pressed') === 'true' ? 'Added' : 'Add';
        st.appendChild(c);
      });
    }
    const s2 = document.createElement('style');
    s2.textContent = '#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 12.5px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 4px}';
    document.head.appendChild(s2);
    const d = document.createElement('div'); d.id = '__lbl'; d.textContent = o.label; document.body.appendChild(d);
    // scroll so the starred pair is in frame
    const el = document.querySelector('#s-wardrobe .wdr-item.want');
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 300));
  }, o);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrsheet-${o.id}.png`) });
  console.log('rendered ' + o.id);
  await page.close();
}
await browser.close(); server.close();
