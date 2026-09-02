// Render the cold-visitor quiz invitation with the REAL typefaces, on the
// real /trending page, driven the way a woman actually reaches it.
// ⚠️ Real fonts matter here: the invitation is Lora, and an uncorrected render
// silently falls back to a generic serif (the documented 2026-08-17 trap).
// ⚠️ The AI call is stubbed so the four ideas land instantly and identically;
// the invitation sits UNDER them, so the box must be fully built first.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import http from 'http'; import fs from 'fs'; import path from 'path';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;
const ROOT = path.resolve('.'), PORT = 8946;
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');
const T = { '.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2','.xml':'application/xml' };
const edge = async p => { const c = { next: async () => new Response(RAW, { headers:{'content-type':'text/html'} }) };
  return await (await handler(new Request('https://stylestar.app' + p), c)).text(); };
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p);
  if (p !== '/trending' && f.startsWith(ROOT) && fs.existsSync(f) && !fs.statSync(f).isDirectory()) {
    r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(r);
  }
  edge('/trending').then(h => { r.writeHead(200,{'content-type':'text/html'}); r.end(h); })
                   .catch(() => { r.writeHead(404); r.end('x'); });
});
await new Promise(r => srv.listen(PORT, r));
const gf = fs.readFileSync('scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const AI_OK = JSON.stringify({content:[{type:'text',text:JSON.stringify({items:[
 {name:'Butter Yellow Linen Shirt',store:'Madewell',search:'butter yellow linen shirt',why:'x'},
 {name:'Butter Yellow Knit Tank',store:'J.Crew',search:'butter yellow knit tank',why:'x'},
 {name:'Butter Yellow Midi Dress',store:'Boden',search:'butter yellow midi dress',why:'x'},
 {name:'Butter Yellow Cardigan',store:'Talbots',search:'butter yellow cardigan',why:'x'}]})}]});
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const w of [390, 360, 320]) {
  const ctx = await b.newContext({ viewport:{width:w,height:1000}, deviceScaleFactor:2 });
  await ctx.route('**/*', r => { const u = r.request().url();
    if (u.includes('fonts.googleapis.com')) return r.fulfill({status:200,contentType:'text/css',body:gf});
    if (u.includes('/.netlify/functions/style-ai')) return r.fulfill({status:200,contentType:'application/json',body:AI_OK});
    return (new URL(u).host === 'localhost:' + PORT) ? r.continue() : r.abort(); });
  const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${PORT}/trending`);
  await pg.waitForTimeout(2400);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  try { await pg.evaluate(async () => { await document.fonts.ready; }); } catch {}
  await pg.evaluate(() => document.querySelector('#s-trending .wdr-tcard .tlf').click());
  await pg.waitForTimeout(1800);
  if (w === 390) console.log('real fonts loaded:', await pg.evaluate(() => {
    const mk = ff => { const s=document.createElement('span'); s.textContent='Catherine';
      s.style.cssText=`position:absolute;visibility:hidden;font:400 15.5px ${ff}`; document.body.appendChild(s);
      const x=s.getBoundingClientRect().width; s.remove(); return x; };
    return mk("'Lora',Georgia,serif") !== mk('Georgia,serif'); }));
  const el = await pg.$('#wx_trend0');
  await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(250);
  await el.screenshot({ path: `scratchpad/qi-${w}.png` });
  await ctx.close();
}
await b.close(); srv.close(); console.log('rendered');
