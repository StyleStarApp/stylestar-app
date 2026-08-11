// Her question 2026-08-11: can the disclosure read less "cringe"? She proposed
// "Style Star" instead of "us", on the reasoning that there IS no us -- it is
// just her. Measures each candidate in the TIGHTEST real containers, since the
// short one-liner lives on 9 surfaces and one of them is a narrow carousel.
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

const CANDS = [
  'Some links may earn us a commission.',
  'Some links may earn me a commission.',
  'Some links may earn Style Star a commission.',
  'I may earn a commission from some links.',
];

for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const r = await page.evaluate(cands => {
    // ⚠️ Open EACH surface; a disclosure on a hidden screen measures 0 and would
    // silently become the "tightest container" -- the display:none trap again.
    const out = [];
    const opens = ["openWardrobe('list')", "_openShopStyleNow('style')", "openChat()",
                   "show('s-res');document.getElementById('s-res').classList.add('rv-open')",
                   "show('s-photo-res')"];
    const seen = new Set();
    opens.forEach(o => { try { eval(o); } catch (e) {} });
    const els = [...document.querySelectorAll('.shop-disclosure,.shopdisc,.wdr-disclosure,.chat-disclosure')]
      .filter(e => /may earn/.test(e.textContent) && e.getBoundingClientRect().width > 0);
    els.forEach(el => {
      const host = el.getBoundingClientRect().width;
      const cs = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden';
      probe.style.font = cs.font; probe.style.letterSpacing = cs.letterSpacing;
      document.body.appendChild(probe);
      const needs = cands.map(c => { probe.textContent = c; return +probe.getBoundingClientRect().width.toFixed(1); });
      probe.remove();
      out.push({ cls: el.className, host: +host.toFixed(1), needs });
    });
    return out;
  }, CANDS);
  console.log(`\n================ ${w}px ================`);
  const tight = r.reduce((a, b) => (a && a.host < b.host ? a : b), null);
  r.forEach(x => console.log(`  ${x.cls.padEnd(18)} container ${String(x.host).padStart(6)}px`));
  if (tight) {
    console.log(`  >> tightest container: ${tight.cls} at ${tight.host}px`);
    CANDS.forEach((c, i) => {
      const need = tight.needs[i], slack = +(tight.host - need).toFixed(1);
      console.log(`     ${slack >= 0 ? 'OK ' : '.. '} ${String(need).padStart(6)}px  slack ${String(slack).padStart(6)}px   "${c}"`);
    });
  }
  await page.close();
}
await browser.close(); server.close();
