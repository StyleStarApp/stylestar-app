// Render the app with its REAL typefaces.
//
// ⚠️ Chromium in this sandbox cannot reach fonts.googleapis.com — it fails with
// ERR_CONNECTION_RESET, and with the proxy configured it makes no request at
// all. So every screenshot silently falls back to generic serif/sans, and a
// handwriting face like Dancing Script renders as a bold serif. curl CAN reach
// Google Fonts, so `scratchpad/fonts/` holds the real files and this harness
// serves them locally, intercepting the page's own stylesheet link.
//
// Refresh the font cache with the curl loop recorded in CLAUDE.md if the
// font URL in index.html ever changes.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8941;
const ROUTE = process.argv[2] || '/contact';
const NAME = process.argv[3] || 'real';
const WIDTHS = (process.argv[4] || '390,320').split(',').map(Number);

const T = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png', '.json':'application/json',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf' };

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === ROUTE || p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

await new Promise(r => srv.listen(PORT, r));
const css = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const w of WIDTHS) {
  const pg = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 2 });
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await pg.goto(`http://localhost:${PORT}${ROUTE}`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  try { await pg.evaluate(() => document.fonts.ready); } catch {}
  await pg.waitForTimeout(700);
  if (w === WIDTHS[0]) {
    console.log(await pg.evaluate(() => {
      const mk = ff => { const s = document.createElement('span'); s.textContent = 'Catherine';
        s.style.cssText = `position:absolute;visibility:hidden;font:600 26px ${ff}`; document.body.appendChild(s);
        const x = s.getBoundingClientRect().width; s.remove(); return Math.round(x * 10) / 10; };
      return { dancing: mk("'Dancing Script',cursive"), serif: mk('serif'),
        realFontsLoaded: mk("'Dancing Script',cursive") !== mk('serif'),
        faces: [...new Set([...document.fonts].map(f => f.family))].sort() };
    }));
  }
  await pg.screenshot({ path: `scratchpad/${NAME}-${w}.png` });
  await pg.close();
}
await b.close();
srv.close();
console.log('rendered with real fonts');
