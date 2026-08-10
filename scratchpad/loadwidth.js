// Is the 360 wrap of "shopping your style..." caused by the star, or was the
// HEART wrapping too? Measures the real title with both marks, same page.
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

const HEART = '<svg class="pinkheart hl" style="width:17px;height:17px;margin-right:5px;vertical-align:-3px" viewBox="0 0 24 24"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
const star = (px) => `<svg class="shop-load-star" viewBox="0 0 76 76" fill="none" style="width:${px}px;height:${px}px;margin-right:5px;vertical-align:-3px"><polygon points="38,4 46,25 68,25 50.5,38.5 57.5,60 38,47 18.5,60 25.5,38.5 8,25 30,25" fill="#EC4899" stroke="#EC4899" stroke-width="2" stroke-linejoin="round"/></svg>`;

for (const w of [390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const out = await page.evaluate(({ HEART, S18, S16, S15 }) => {
    _openShopStyleNow('style');                       // puts the screen in .thinking
    const lg = document.querySelector('#s-shopstyle .ss-shop-logo');
    const avail = Math.floor(lg.parentElement.getBoundingClientRect().width);
    const meas = (html) => {
      lg.innerHTML = html + 'shopping your style…';
      const r = lg.getBoundingClientRect();
      const c = document.createElement('span');
      c.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;left:-9999px;font:inherit;letter-spacing:inherit';
      c.style.font = getComputedStyle(lg).font;
      c.style.letterSpacing = getComputedStyle(lg).letterSpacing;
      c.innerHTML = html + 'shopping your style…';
      lg.parentElement.appendChild(c);
      const nat = Math.ceil(c.getBoundingClientRect().width);
      c.remove();
      return { h: Math.round(r.height), w: Math.round(r.width), natural: nat };
    };
    return { avail, heart: meas(HEART), star18: meas(S18), star16: meas(S16), star15: meas(S15) };
  }, { HEART, S18: star(18), S16: star(16), S15: star(15) });
  console.log(w, JSON.stringify(out));
  await page.close();
}
await browser.close(); server.close();
