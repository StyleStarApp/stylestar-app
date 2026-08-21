// The BUILT control, no injection — diffed against the render she picked.
// A render is a promise: the 2026-08-13 lesson, when a chosen option shipped
// half-built because nobody compared the page to the picture.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8993;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const gf=fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
 .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const AI={items:[
 {category:'top',name:'Satin Button-Front Blouse',search:'satin button front blouse',store:'Nordstrom'},
 {category:'bottom',name:'Wide Leg Trouser',search:'wide leg trousers',store:'Quince'},
 {category:'shoes',name:'Pointed Toe Flats',search:'pointed toe flats',store:'Zappos'},
 {category:'bag',name:'Structured Top Handle Bag',search:'top handle bag',store:'Cuyana'}]};
const M={};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [key,open] of [['rest',false],['open',true]]){
  const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:gf}));
  await pg.route('**/.netlify/**',r=>r.fulfill({status:200,contentType:'application/json',
    body:JSON.stringify({content:[{text:JSON.stringify(AI)}]})}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  await pg.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',
    answers:new Array(12).fill(6),topArchNames:['The Timeless Classic'],portrait:'p',motto:'m'})));
  await pg.reload(); await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.evaluate(()=>_openShopStyleNow('quiz'));
  await pg.waitForSelector('#shopStyleContent .shop-card',{timeout:20000});
  // Pin the rotating subtitle and hide the self-retiring heart tip so this is
  // comparable with the approved render, which did the same.
  await pg.evaluate(()=>{const s=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(s)s.textContent='Chosen with you in mind.';
    const t=document.querySelector('#s-shopstyle .ht-tip');if(t)t.style.display='none';});
  if(open){await pg.focus('#ssAskIn');await pg.waitForTimeout(300);}
  await pg.waitForTimeout(400);
  M[key]=await pg.evaluate(()=>Math.round(document.querySelector('#shopStyleContent .shop-card').getBoundingClientRect().top));
  await pg.screenshot({path:`scratchpad/_bl-${key}.png`});
  await ctx.close(); console.log(key,M[key]+'px');
}
const cells=[['rest','BUILT — at rest'],['open','BUILT — after she taps in']].map(([k,l])=>
 `<div class=c><div class=h>${l}</div><div class=m>first card at ${M[k]}px &middot; approved render was ${k==='rest'?269:349}px</div><img src="_bl-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_blsheet.html'),`<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:820px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:2px}.m{font-size:10.5px;color:#8a8272;margin-bottom:7px}
img{width:100%;display:block;border:1px solid #f0ece3}</style>
<h1>The built page</h1><p>No injection — this is the real control, the real cards, squared with the window-frame hairline and the emoji gone.</p>
<div class=g>${cells}</div>`);
const pg=await b.newPage({viewport:{width:880,height:700},deviceScaleFactor:2});
await pg.goto('file://'+path.join(ROOT,'scratchpad/_blsheet.html')); await pg.waitForTimeout(400);
await pg.screenshot({path:'scratchpad/shopask-built.png',fullPage:true});
await b.close(); srv.close(); console.log('done');
