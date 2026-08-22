// Placeholder weight + box border, her three asks: lighter text, left-aligned,
// lighter grey box. Rendered on the real screen with contrast measured, because
// "very light" is exactly the value that was wrong once before.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=9001;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const gf=fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
 .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const AI={items:[{category:'top',name:'Satin Button-Front Blouse',search:'satin button front blouse',store:'Nordstrom'},
 {category:'bottom',name:'Wide Leg Trouser',search:'wide leg trousers',store:'Quince'}]};

const L='#s-shopstyle #ssAskIn{text-align:left}';
const V={
  now:  {lbl:'NOW — black box, centred', css:''},
  a:    {lbl:'A — silver box, mid-grey text', css:L+'#s-shopstyle #ssAskIn{border-color:#9AA0A6}#s-shopstyle #ssAskIn::placeholder{color:#8a8272}'},
  b:    {lbl:'B — warm grey box, lighter text', css:L+'#s-shopstyle #ssAskIn{border-color:#b3aea3}#s-shopstyle #ssAskIn::placeholder{color:#9d968a}'},
  c:    {lbl:'C — palest of both', css:L+'#s-shopstyle #ssAskIn{border-color:#cfcabf}#s-shopstyle #ssAskIn::placeholder{color:#aba496}'},
};
const M={};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const k of Object.keys(V)){
  const ctx=await b.newContext({viewport:{width:390,height:420},deviceScaleFactor:2});
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
  await pg.waitForTimeout(300);
  M[k]=await pg.evaluate(()=>{
    const el=document.getElementById('ssAskIn');
    const ph=getComputedStyle(el,'::placeholder').color||getComputedStyle(el).color;
    const L=c=>{const m=c.match(/\d+/g);if(!m)return 1;const [r,g,b]=m.slice(0,3).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*r+.7152*g+.0722*b;};
    const a=L(ph),bg=L('rgb(255,255,255)');
    return Math.round(((Math.max(a,bg)+.05)/(Math.min(a,bg)+.05))*100)/100;
  });
  await pg.locator('#ssAsk').screenshot({path:`scratchpad/_ab-${k}.png`});
  await ctx.close(); console.log(k,M[k]+':1');
}
const cells=Object.keys(V).map(k=>
 `<div class=c><div class=h>${V[k].lbl}</div><div class=m>example text ${M[k]}:1${M[k]<4.5?' — below AA':''}</div><img src="_ab-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_absheet.html'),`<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:2px}.m{font-size:10.5px;color:#8a8272;margin-bottom:7px}
img{width:100%;display:block;border:1px solid #f0ece3}</style>
<h1>The box — lighter example, left aligned, lighter grey</h1>
<p>All three are left-aligned. A placeholder is exempt from the AA rule when a real label sits above it, and yours does — so these are a readability judgement, not a compliance one.</p>
<div class=g>${cells}</div>`);
const pg=await b.newPage({viewport:{width:1400,height:340},deviceScaleFactor:2});
await pg.goto('file://'+path.join(ROOT,'scratchpad/_absheet.html')); await pg.waitForTimeout(400);
await pg.screenshot({path:'scratchpad/askbox.png',fullPage:true});
await b.close(); srv.close(); console.log('done');
