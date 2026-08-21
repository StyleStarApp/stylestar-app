/* As-built proof: the REAL page, no injected CSS. A render is a PROMISE —
   diff the built page against the option she picked before calling it done. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app';
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,r)); const PORT=srv.address().port;
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const w of [390,320]){
  const pg=await b.newPage({viewport:{width:w,height:1500},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2200);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();
    document.querySelectorAll('*').forEach(e=>{e.style.animation='none'})});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  const bot=await pg.evaluate(()=>Math.round(document.getElementById('dsStar').getBoundingClientRect().bottom+scrollY));
  await pg.screenshot({path:`scratchpad/discobuilt-${w}.png`,clip:{x:0,y:0,width:w,height:Math.min(1500,bot+80)}});
  await pg.close();
}
srv.close(); await b.close(); console.log('rendered');
