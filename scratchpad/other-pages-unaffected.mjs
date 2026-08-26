// Confirm the #s-journal-hub-scoped flex/min-height rule doesn't leak onto
// the article page or the other letterhead pages that share .story-wrap.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8952;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (['/journal/how-to-find-your-personal-style','/faq','/contact','/'].includes(p)) p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function check(route, screenId) {
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(6000);
  pg.setDefaultNavigationTimeout(6000);
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(600);
  const d = await pg.evaluate((id) => {
    const scope = document.getElementById(id);
    const wrap = scope.querySelector('.story-wrap');
    const cs = getComputedStyle(wrap);
    return { display: cs.display, minHeight: cs.minHeight };
  }, screenId);
  console.log(route, '->', d);
  await pg.close();
}

await check('/journal/how-to-find-your-personal-style', 's-journal');
await check('/faq', 's-faq');
await check('/contact', 's-contact');
await b.close();
srv.close();
