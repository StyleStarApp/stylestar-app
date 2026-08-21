// What does a reviewer see if their browser/crawler does not run JavaScript?
// Style Star is a single-page app behind an animated entrance overlay, so this
// is a real question, not a theoretical one.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'); const PORT=8977;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]); if(u==='/')u='/index.html';
  const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for (const js of [true,false]) {
  const ctx = await b.newContext({viewport:{width:1280,height:900},javaScriptEnabled:js});
  const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${PORT}/`, {waitUntil:'load', timeout:60000});
  await pg.waitForTimeout(4000);
  const m = await pg.evaluate(()=>{
    const vis = e => { if(!e) return false; const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
      return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>0.05; };
    const ent = document.querySelector('.hm-entrance');
    const ec = ent?getComputedStyle(ent):null;
    return {
      title: document.title,
      entranceCovering: !!(ent && vis(ent) && parseFloat(ec.opacity)>0.5),
      entranceOpacity: ec?ec.opacity:null,
      h1: (document.querySelector('.hm-h1')||{}).textContent,
      h1visible: vis(document.querySelector('.hm-h1')),
      ctaVisible: vis(document.querySelector('.hm-cta')),
      founderVisible: vis(document.querySelector('.hm-founder')),
      welActive: (document.getElementById('s-wel')||{className:''}).className,
      visibleWords: (document.body.innerText||'').trim().split(/\s+/).length,
      firstText: (document.body.innerText||'').trim().slice(0,120).replace(/\n/g,' | '),
    };
  }).catch(e=>({err:e.message}));
  console.log(`\n===== JavaScript ${js?'ON':'OFF'} =====`);
  console.log(JSON.stringify(m,null,1));
  await pg.screenshot({path:`scratchpad/reviewer-js${js?'on':'off'}.png`});
  await ctx.close();
}
await b.close(); srv.close();
