// She cannot picture it, which means the last render failed at its one job.
// Draw the FOLD as an actual line: everything above it is what she sees when
// she lands, everything below needs a scroll.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8961,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const SHOT=930, FOLD=700;
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'}];
for(const [name,move] of [['built',false]]){
  const ctx=await b.newContext({viewport:{width:375,height:SHOT},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    ['ss_seen_wardrobe','ss_seen_shopstyle','ss_seen_wishlist','ss_trending_seen'].forEach(k=>localStorage.setItem(k,'1'));
    localStorage.setItem('ss_chat',JSON.stringify([{role:'assistant',content:'Hi'},{role:'user',content:'formal wedding?'}]));
    localStorage.setItem('ss_chat_t',String(Date.now()));
    localStorage.setItem('ss_shoppicks',JSON.stringify({m:'quiz',i:picks,t:Date.now()}));
    localStorage.setItem('ss_hearttip','1');
  },PICKS);
  await pg.goto('http://localhost:8961/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2800);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  if(move)await pg.evaluate(()=>{const s=document.getElementById('wbStar'),n=document.getElementById('wbNext');
    s.parentNode.insertBefore(n,s);});
  // draw the fold right onto the page, so the picture cannot be misread
  await pg.evaluate(f=>{
    const d=document.createElement('div');
    d.style.cssText='position:absolute;left:0;right:0;top:'+f+'px;height:0;border-top:3px dashed #FF3B6B;z-index:99999';
    const l=document.createElement('div');
    l.style.cssText='position:absolute;left:0;right:0;top:'+(f+6)+'px;text-align:center;font:700 12px system-ui,sans-serif;color:#FF3B6B;letter-spacing:.06em;z-index:99999;text-shadow:0 0 6px #fff,0 0 6px #fff';
    l.textContent='▼ BELOW HERE SHE HAS TO SCROLL';
    document.body.appendChild(d);document.body.appendChild(l);
  },FOLD);
  await pg.waitForTimeout(300);
  await pg.screenshot({path:`scratchpad/fold-${name}.png`,clip:{x:0,y:0,width:375,height:SHOT}});
  await ctx.close();
}
const pg=await b.newPage({viewport:{width:1400,height:900}});
const imgs=[['fold-built.png','AS BUILT  —  the resume is the first thing under the greeting']]
  .map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const D=await pg.evaluate(async imgs=>{
  const PW=1125,LAB=98,GAP=30;
  const ims=[];for(const [src,l] of imgs){const im=new Image();im.src=src;await im.decode();ims.push([im,l]);}
  const c=document.createElement('canvas');
  c.width=PW*2+GAP*3; c.height=LAB+ims[0][0].height+GAP*2;
  const x=c.getContext('2d');x.fillStyle='#0d0d0d';x.fillRect(0,0,c.width,c.height);
  ims.forEach(([im,label],i)=>{
    const ox=GAP+i*(PW+GAP);
    x.fillStyle='#F2D889';x.font='600 30px system-ui,sans-serif';x.textBaseline='middle';
    x.fillText(label,ox,GAP+LAB/2);
    x.drawImage(im,ox,GAP+LAB,PW,im.height);
  });
  return c.toDataURL('image/png');},imgs);
fs.writeFileSync('scratchpad/wb-built.png',Buffer.from(D.split(',')[1],'base64'));
await b.close();srv.close();console.log('scratchpad/wb-built.png');
