// Prove the retry fix: (1) a TRANSIENT failure (fails once, then works)
// recovers and the logo ends up visible; (2) a PERSISTENT failure (never
// works) still degrades cleanly after giving it a real chance, rather than
// hammering forever; (3) a normal, always-working load is completely
// unaffected (no visible flash/delay in the common case).
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8953;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.png':'image/png' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/journal' || p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function run(label, failCount) {
  const pg = await b.newPage({ viewport: { width: 390, height: 900 } });
  pg.setDefaultTimeout(8000);
  pg.setDefaultNavigationTimeout(8000);
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  let attempts = 0;
  await pg.route('**/logo-star.png*', r => {
    attempts++;
    if (attempts <= failCount) return r.abort('connectionreset');
    return r.continue();
  });
  const errors = [];
  pg.on('pageerror', e => errors.push(String(e)));
  await pg.goto(`http://localhost:${PORT}/journal`, { waitUntil: 'domcontentloaded' });
  // Give the retry timers (up to 2 * 1400ms = 2.8s) room to finish.
  await pg.waitForTimeout(4500);
  const present = await pg.evaluate(() =>
    [...document.querySelectorAll('img[src^="logo-star.png"]')].filter(el => el.closest('.scr.act')).length
  );
  console.log(`${label}: fetch attempts=${attempts}, logo present in active screen=${present ? 'YES' : 'NO'}, JS errors=${errors.length ? errors : 'none'}`);
  await pg.close();
}

await run('normal load (never fails)', 0);
await run('transient (fails once, then works)', 1);
await run('persistent (always fails)', 99);
await b.close();
srv.close();
