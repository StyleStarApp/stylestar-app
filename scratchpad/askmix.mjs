// Her three asks: star on the left, square box, and a way back to a variety once
// she has asked for something specific. The last one is a real dead end today —
// emptying the box does nothing, so "bags" is a one-way door until she leaves.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=9009;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const gf=fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
 .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const AI={items:[
 {category:'bag',name:'Structured Top Handle Bag',search:'top handle bag',store:'Cuyana'},
 {category:'bag',name:'Leather Crossbody Bag',search:'leather crossbody bag',store:'Madewell'},
 {category:'bag',name:'Canvas Tote Bag',search:'canvas tote bag',store:'Quince'},
 {category:'bag',name:'Woven Shoulder Bag',search:'woven shoulder bag',store:'Nordstrom'}]};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
async function shot(key){
  const ctx=await b.newContext({viewport:{width:390,height:900},deviceScaleFactor:2});
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
  await pg.evaluate(()=>{const s=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(s)s.textContent='Chosen with you in mind.';
    const t=document.querySelector('#s-shopstyle .ht-tip');if(t)t.style.display='none';});
  if(key!=='noask'){
    await pg.fill('#ssAskIn','bags');
    await pg.evaluate(()=>ssAskGo());
    await pg.waitForTimeout(1400);
  }
  if(key==='b'){  // the alternative placement: under the box, naming the filter
    await pg.evaluate(()=>{
      const m=document.querySelector('.sr-mix'); if(m) m.remove();
      const d=document.createElement('div');
      d.style.cssText="font-size:13px;color:#8a8272;margin-top:7px;text-align:left";
      d.innerHTML='Showing bags &middot; <span style="text-decoration:underline;cursor:pointer">show me a mix instead</span>';
      const inp=document.getElementById('ssAskIn'); inp.parentNode.insertBefore(d, inp.nextSibling);
    });
  }
  await pg.waitForTimeout(400);
  await pg.screenshot({path:`scratchpad/_mx-${key}.png`,fullPage:true});
  await ctx.close(); console.log(key);
}
for(const k of ['noask','a','b']) await shot(k);

const LB={noask:'No ask — nothing extra shows', a:'A — beside the refresh, below the pieces', b:'B — under the box, naming the filter'};
const cells=Object.keys(LB).map(k=>`<div class=c><div class=h>${LB[k]}</div><img src="_mx-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_mxsheet.html'),`<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:1100px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:7px}
img{width:100%;display:block;border:1px solid #f0ece3}</style>
<h1>Getting back to a variety</h1>
<p>All three also show the star moved left and the box squared. She has asked for "bags" in the second and third.</p>
<div class=g>${cells}</div>`);
const pg=await b.newPage({viewport:{width:1160,height:700},deviceScaleFactor:2});
await pg.goto('file://'+path.join(ROOT,'scratchpad/_mxsheet.html')); await pg.waitForTimeout(400);
await pg.screenshot({path:'scratchpad/askmix.png',fullPage:true});
await b.close(); srv.close(); console.log('done');
