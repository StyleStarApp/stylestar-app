// Chip colour options. Her call: the gold "bronzey" chips fight the screen —
// which is the same reasoning that put a near-black hairline on the cards rather
// than a gold one. This screen is a black-and-white shop window.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8997;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const gf=fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
 .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const AI={items:[
 {category:'top',name:'Satin Button-Front Blouse',search:'satin button front blouse',store:'Nordstrom'},
 {category:'bottom',name:'Wide Leg Trouser',search:'wide leg trousers',store:'Quince'}]};

const V={
  gold:  {lbl:'TODAY — gold', css:''},
  black: {lbl:'1. Near-black outline', css:'#s-shopstyle .sa-chip{color:#17171c;border-color:#17171c}'},
  grey:  {lbl:'2. Grey outline, charcoal ink', css:'#s-shopstyle .sa-chip{color:#3d3a34;border-color:#b3aea3}'},
  silver:{lbl:'3. The display-case silver', css:'#s-shopstyle .sa-chip{color:#3d3a34;border-color:#9AA0A6}'},
  fill:  {lbl:'4. Solid black, like Find it', css:'#s-shopstyle .sa-chip{color:#fff;border-color:#17171c;background:#17171c}'},
};
const C={};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const k of Object.keys(V)){
  const ctx=await b.newContext({viewport:{width:390,height:560},deviceScaleFactor:2});
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
  await pg.evaluate(css=>{const s=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(s)s.textContent='Chosen with you in mind.';
    const t=document.querySelector('#s-shopstyle .ht-tip');if(t)t.style.display='none';
    if(css){const e=document.createElement('style');e.textContent=css;document.head.appendChild(e);}},V[k].css);
  await pg.focus('#ssAskIn'); await pg.waitForTimeout(350);
  // contrast of the chip label against what is really painted behind it
  C[k]=await pg.evaluate(()=>{
    const el=document.querySelector('#s-shopstyle .sa-chip');
    const bgOf=n=>{while(n){const c=getComputedStyle(n).backgroundColor;
      if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;n=n.parentElement;}return 'rgb(255,255,255)';};
    const L=c=>{const [r,g,b]=c.match(/\d+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*r+.7152*g+.0722*b;};
    const a=L(getComputedStyle(el).color),bg=L(bgOf(el));
    return Math.round(((Math.max(a,bg)+.05)/(Math.min(a,bg)+.05))*100)/100;
  });
  await pg.locator('#ssAsk').screenshot({path:`scratchpad/_cc-${k}.png`});
  await ctx.close(); console.log(k,C[k]+':1');
}
const cells=Object.keys(V).map(k=>
 `<div class=c><div class=h>${V[k].lbl}</div><div class=m>text contrast ${C[k]}:1${C[k]<4.5?' — BELOW AA':''}</div><img src="_cc-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_ccsheet.html'),`<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:2px}.m{font-size:10.5px;color:#8a8272;margin-bottom:7px}
img{width:100%;display:block;border:1px solid #f0ece3}</style>
<h1>The chips — gold, grey or black</h1>
<p>The real control on the real screen at 390px. The card hairline and the window frame are both #17171c, so option 1 is the one that matches what is already there.</p>
<div class=g>${cells}</div>`);
const pg=await b.newPage({viewport:{width:1500,height:420},deviceScaleFactor:2});
await pg.goto('file://'+path.join(ROOT,'scratchpad/_ccsheet.html')); await pg.waitForTimeout(400);
await pg.screenshot({path:'scratchpad/chipcolor.png',fullPage:true});
await b.close(); srv.close(); console.log('done');
