import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('.'), PORT = 8951;
const T = { '.html':'text/html','.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p);
  if (f.startsWith(ROOT) && fs.existsSync(f) && !fs.statSync(f).isDirectory()) {
    r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(r);
  }
  r.writeHead(404); r.end('x');
});
await new Promise(r => srv.listen(PORT, r));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [route, out] of [['/card1-spectrum.html','card1.png'], ['/card2-palette.html','card2.png']]) {
  const ctx = await b.newContext({ viewport:{width:1200,height:630}, deviceScaleFactor:1 });
  const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${PORT}${route}`);
  await pg.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: out });
  await ctx.close();
}
await b.close(); srv.close(); console.log('done');
