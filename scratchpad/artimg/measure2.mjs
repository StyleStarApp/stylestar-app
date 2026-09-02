import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8962;
const T = { '.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));
const gf = fs.readFileSync(ROOT + '/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport:{width:390,height:1400}, deviceScaleFactor:2 });
await ctx.route('**/*', r => { const u = r.request().url();
  if (u.includes('fonts.googleapis.com')) return r.fulfill({status:200,contentType:'text/css',body:gf});
  return (new URL(u).host === 'localhost:' + PORT) ? r.continue() : r.abort(); });
const pg = await ctx.newPage();
await pg.goto(`http://localhost:${PORT}/`);
await pg.waitForTimeout(2600);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
await pg.evaluate(() => openJournalArticle('s-journal'));
await pg.waitForTimeout(700);
const info = await pg.evaluate(() => {
  const rectOf = sel => { const el = document.querySelector(sel); if (!el) return null;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height,
      marginTop: cs.marginTop, marginBottom: cs.marginBottom,
      naturalW: el.naturalWidth, naturalH: el.naturalHeight, complete: el.complete }; };
  return { img: rectOf('#s-journal .jrnl-img') };
});
console.log(JSON.stringify(info, null, 2));
await pg.screenshot({ path: 'scratchpad/artimg/after-390.png', fullPage: false, clip: {x:0,y:0,width:390,height:900} });
await ctx.close(); await b.close(); srv.close();
