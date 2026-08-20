import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app', PORT=8956;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');
const vb=fs.readFileSync(ROOT+'/scratchpad/px/vb.jpg');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

// 1. the front door, with the built frame
let pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
await pg.route('**/demandware.static/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:vb}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());
  window.WB_MSGS=[WB_MSGS[0]];show('s-wb');});
try{await pg.evaluate(()=>document.fonts.ready);}catch{}
await pg.waitForTimeout(1200);
await pg.screenshot({path:'scratchpad/built-frame.png'});
await pg.close();

// 2. the Edit, scrolled to the new Vilebrequin item
pg=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
await pg.route('**/demandware.static/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:vb}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());showDream();});
try{await pg.evaluate(()=>document.fonts.ready);}catch{}
await pg.waitForTimeout(1500);
const all=await pg.$$('#s-dream .dc-item'); const el=all[all.length-1];
await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(600);
await el.screenshot({path:'scratchpad/built-vbitem.png'});
console.log(await pg.evaluate(()=>{
  const it=[...document.querySelectorAll('#s-dream .dc-item')].pop();
  const a=it.querySelector('.dc-item-btn'), px=it.querySelector('.dc-item-px');
  return {name:it.querySelector('.dc-item-name').textContent,
    wrapped:(a.getAttribute('href')||'').includes('click.linksynergy'),
    mid:(/mid=(\d+)/.exec(a.getAttribute('href')||'')||[])[1],
    photoLoaded:px?px.naturalWidth>0:false,
    photoRatio:px?Math.round(px.getBoundingClientRect().width/px.getBoundingClientRect().height*100)/100:null};
}));
await pg.close();
await b.close(); srv.close();
