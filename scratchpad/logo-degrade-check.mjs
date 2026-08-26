// Prove the onerror="this.remove()" fix actually works: force every
// logo/wordmark image to fail (as if on a bad connection) and confirm the
// page degrades to a clean gap instead of a broken-image box, on both the
// hub and the article -- the two pages she screenshotted.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8950;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/journal' || p === '/journal/how-to-find-your-personal-style' || p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function check(route, label) {
  const pg = await b.newPage({ viewport: { width: 390, height: 900 } });
  pg.setDefaultTimeout(6000);
  pg.setDefaultNavigationTimeout(6000);
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  // Simulate a bad connection: every logo-*.png request fails outright.
  await pg.route('**/logo-star*.png', r => r.abort('connectionreset'));
  const errors = [];
  pg.on('pageerror', e => errors.push(String(e)));
  await pg.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(1200);
  const remaining = await pg.evaluate(() =>
    [...document.querySelectorAll('img[src*="logo-star"]')].filter(el => el.closest('.scr.act')).length
  );
  console.log(`${label}: logo <img> elements still in the active screen after a forced failure = ${remaining} (want 0)`);
  console.log(`${label}: JS errors = ${errors.length ? errors : 'none'}`);
  await pg.close();
}

await check('/journal', 'hub');
await check('/journal/how-to-find-your-personal-style', 'article');
await b.close();
srv.close();
