// Her catch 2026-08-11: "Pieces I wear myself and recommend" wraps to two lines
// on the Discover page. She does NOT want the font smaller (the standing
// readability rule for an 18-80 audience), so the only lever is the WORDS.
// ⚠️ The string lives on FOUR hub surfaces whose containers differ, so a
// candidate has to be measured on all of them, not just the one she screenshotted.
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

const CANDIDATES = [
  'Pieces I wear myself and recommend',   // current
  'Pieces I wear myself & recommend',     // her "&" idea, keeps "myself"
  'Pieces I wear and recommend',          // her shorter idea, loses "myself"
  'Pieces I wear & recommend',            // both
  'Pieces I wear myself, and recommend',  // (control, longer)
];

const SURFACES = [
  { id: 's-wel', label: 'Discover', open: "show('s-wel')", sel: '.hm-csub' },
  { id: 's-wb', label: 'Welcome Back', open: "show('s-wb');updateWbScreen()", sel: '.wb-sub' },
  { id: 's-res', label: 'Style Portrait', open: "show('s-res');document.getElementById('s-res').classList.add('rv-open')", sel: '.actsub' },
  { id: 's-photo-res', label: 'Analyze results', open: "show('s-photo-res')", sel: '.actsub' },
];

for (const w of [390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  console.log(`\n================ ${w}px ================`);
  for (const s of SURFACES) {
    const res = await page.evaluate(({ o, cands }) => {
      eval(o.open);
      const scr = document.getElementById(o.id);
      // the Edit row's sub on this surface
      const el = [...scr.querySelectorAll(o.sel)].find(e => /wear/.test(e.textContent));
      if (!el) return null;
      const orig = el.textContent;
      const avail = el.getBoundingClientRect().width;
      const out = cands.map(c => {
        el.textContent = c;
        const rg = document.createRange(); rg.selectNodeContents(el);
        // count UNIQUE line tops -- a Range yields a rect per box AND per element
        const lines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size;
        // width the text actually needs on one line
        const probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden';
        probe.style.font = getComputedStyle(el).font;
        probe.style.letterSpacing = getComputedStyle(el).letterSpacing;
        probe.textContent = c;
        document.body.appendChild(probe);
        const need = probe.getBoundingClientRect().width;
        probe.remove();
        return { c, lines, need: +need.toFixed(1) };
      });
      el.textContent = orig;
      return { avail: +avail.toFixed(1), out };
    }, { o: s, cands: CANDIDATES });
    if (!res) { console.log(`  ${s.label}: (row not present)`); continue; }
    console.log(`  ${s.label.padEnd(16)} container ${res.avail}px`);
    res.out.forEach(r => console.log(`     ${r.lines === 1 ? 'OK ' : '.. '} ${String(r.need).padStart(6)}px  ${r.lines} line${r.lines > 1 ? 's' : ''}   "${r.c}"`));
  }
  await page.close();
}
await browser.close(); server.close();
