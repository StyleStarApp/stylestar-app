// Her note 2026-08-11 on the now-calm Wardrobe List: "it might need a star
// somewhere on the top." Four directions rendered on the real page.
// ⚠️ Every star here lives OUTSIDE .wdr-title. The title is an inline-block
// whose gold rule is sized as a % of the block, so anything added INSIDE it
// stretches the rule past the words (the 2026-08-10 titlerule lesson).
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

const STAR = (size, rot) => `<svg class="__ws" style="width:${size}px;height:${size}px;transform:rotate(${rot}deg)" viewBox="0 0 24 24"><defs><radialGradient id="wdrStarG${size}${Math.abs(rot)}" cx="42%" cy="34%" r="72%"><stop offset="0" stop-color="#FDF0B8"/><stop offset=".38" stop-color="#F4D877"/><stop offset=".72" stop-color="#E8B944"/><stop offset="1" stop-color="#CE9A26"/></radialGradient></defs><path fill="url(#wdrStarG${size}${Math.abs(rot)})" stroke="#9AA0A6" stroke-width="1.1" stroke-linejoin="round" d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>`;

const OPTS = [
  { id: 'current', label: 'CURRENT  no star', build: null },
  { id: 'a', label: 'A  one star above the title, 34px', build: { where: 'above', html: STAR(34, 0), css: '#s-wardrobe .wdr-head{position:relative}#s-wardrobe .__wsw{display:block;margin:0 0 6px;line-height:0}' } },
  { id: 'b', label: 'B  bigger star above, 46px  (a crown)', build: { where: 'above', html: STAR(46, 0), css: '#s-wardrobe .wdr-head{position:relative}#s-wardrobe .__wsw{display:block;margin:0 0 7px;line-height:0}' } },
  { id: 'c', label: 'C  small star tucked left of the title, tilted', build: { where: 'tuck', html: STAR(32, -18), css: '#s-wardrobe .wdr-head{position:relative}#s-wardrobe .__wsw{position:absolute;left:50%;margin-left:-152px;top:-2px;line-height:0;filter:drop-shadow(0 2px 3px rgba(120,90,20,.26))}' } },
  { id: 'd', label: 'D  two stars flanking the title, 22px', build: { where: 'flank', html: STAR(22, 0), css: '#s-wardrobe .wdr-head{position:relative}#s-wardrobe .__wsw{position:absolute;top:6px;line-height:0}#s-wardrobe .__wsw.l{left:50%;margin-left:-150px}#s-wardrobe .__wsw.r{left:50%;margin-left:128px}' } },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const m = await page.evaluate(o => {
    openWardrobe('list');
    const head = document.querySelector('#s-wardrobe .wdr-head');
    const title = document.querySelector('#s-wardrobe .wdr-title');
    if (o.build) {
      const s = document.createElement('style'); s.textContent = o.build.css; document.head.appendChild(s);
      const mk = cls => { const d = document.createElement('span'); d.className = '__wsw ' + (cls || ''); d.innerHTML = o.build.html; return d; };
      if (o.build.where === 'above') head.insertBefore(mk(), title);
      else if (o.build.where === 'tuck') head.appendChild(mk());
      else { head.appendChild(mk('l')); head.appendChild(mk('r')); }
    }
    const s2 = document.createElement('style');
    s2.textContent = `#__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0;letter-spacing:.04em}`;
    document.head.appendChild(s2);
    const d = document.createElement('div'); d.id = '__lbl'; d.textContent = o.label; document.body.appendChild(d);
    // does any star collide with the fixed MENU chip?
    const chip = (document.querySelector('#menuChip') || document.querySelector('.menu-chip')).getBoundingClientRect();
    const stars = [...document.querySelectorAll('#s-wardrobe .__ws')].map(e => { const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) }; });
    const hits = stars.filter(r => !(r.l > chip.right || r.r < chip.left || r.t > chip.bottom || r.b < chip.top));
    const tr = title.getBoundingClientRect();
    const rule = getComputedStyle(title, '::after');
    return { stars, chipHits: hits.length, titleW: +tr.width.toFixed(1), ruleW: rule.width, docW: document.documentElement.scrollWidth };
  }, o);
  console.log(`${o.id.padEnd(8)} stars=${JSON.stringify(m.stars)} chipCollisions=${m.chipHits} titleW=${m.titleW} rule=${m.ruleW} sidewaysScroll=${m.docW > 390}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `wdrstar-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 470 } });
  await page.close();
}
await browser.close(); server.close();
