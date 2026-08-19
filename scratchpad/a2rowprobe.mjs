import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8959;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:360,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
try{await pg.evaluate(()=>document.fonts.ready)}catch{}
console.log(await pg.evaluate(()=>{
  show('s-wel'); menuOpen();
  return [...document.querySelectorAll('.menu-row')].map(r=>({t:r.textContent.trim().slice(0,26),h:Math.round(r.getBoundingClientRect().height)}))
    .filter(x=>x.h>=40);
}));
await b.close();srv.close();
