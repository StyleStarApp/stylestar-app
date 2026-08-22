// The three flattened letterheads with the capital, at her width, real typefaces.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8965,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const shots=[];
for(const [name,open_,sel,label] of [
  ['refine','openPrefs()','#s-pref .pref-mast','REFINE YOUR PREFERENCES'],
  ['analyze','showPhoto()','#s-photo .ph-mast','ANALYZE AN OUTFIT'],
  ['wishlist','openWishlist()','#s-wishlist .wl-mast','YOUR WISHLIST'],
]){
  const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(()=>{localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));});
  await pg.goto('http://localhost:8965/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.evaluate(fn=>{eval(fn)},open_);
  await pg.waitForTimeout(900);
  const box=await pg.evaluate(s=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();
    return {y:Math.max(0,Math.round(r.top+window.scrollY)-30),h:Math.round(r.height)+64,
      says:e.textContent.replace(/\s+/g,' ').trim().slice(0,40)};},sel);
  console.log(name.padEnd(9),JSON.stringify(box.says));
  await pg.screenshot({path:`scratchpad/mast-${name}.png`,clip:{x:0,y:box.y,width:375,height:Math.min(box.h,200)}});
  shots.push([`mast-${name}.png`,label]);
  await ctx.close();
}
const pg=await b.newPage({viewport:{width:1300,height:900}});
const imgs=shots.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const D=await pg.evaluate(async imgs=>{
  const W=1125,LAB=86,GAP=14;const ims=[];
  for(const [src,l] of imgs){const im=new Image();im.src=src;await im.decode();ims.push([im,l]);}
  const c=document.createElement('canvas');c.width=W;c.height=ims.reduce((a,[im])=>a+LAB+im.height+GAP,0);
  const x=c.getContext('2d');x.fillStyle='#0d0d0d';x.fillRect(0,0,c.width,c.height);let y=0;
  for(const [im,label] of ims){x.fillStyle='#0d0d0d';x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889';x.font='600 30px system-ui,sans-serif';x.textBaseline='middle';
    x.fillText(label,24,y+LAB/2);x.drawImage(im,0,y+LAB,W,im.height);y+=LAB+im.height+GAP;}
  return c.toDataURL('image/png');},imgs);
fs.writeFileSync('scratchpad/mast-caps.png',Buffer.from(D.split(',')[1],'base64'));
await b.close();srv.close();console.log('scratchpad/mast-caps.png');
