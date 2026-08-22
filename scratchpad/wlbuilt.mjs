// The door AS BUILT, both states, at her real 375px with the real typefaces.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8952,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];
const shots=[];
for(const [name,saves] of [['tip',0],['door',2]]){
  const ctx=await b.newContext({viewport:{width:375,height:1000},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      if(String(u).indexOf('user-data')>=0)return Promise.resolve(new Response('{}',{status:200}));
      return of.apply(this,arguments);};},PICKS);
  await pg.goto('http://localhost:8952/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  if(saves)await pg.evaluate(n=>{[...document.querySelectorAll('#shopStyleContent .wl-save')].slice(0,n).forEach(b=>b.click())},saves);
  await pg.waitForTimeout(500);
  await pg.evaluate(()=>{const t=document.getElementById('wlToast');if(t)t.classList.remove('on')});
  await pg.waitForTimeout(200);
  await pg.screenshot({path:`scratchpad/wlbuilt-${name}.png`,clip:{x:0,y:0,width:375,height:620}});
  shots.push([`wlbuilt-${name}.png`, saves?'AFTER  — two pieces saved: the count, and a door to go and look'
    :'BEFORE — nothing saved yet: the Tip, teaching her the heart']);
  await ctx.close();
}
const pg=await b.newPage({viewport:{width:1200,height:800}});
const imgs=shots.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const H=await pg.evaluate(async imgs=>{
  const CROP=1860,LAB=100,W=1125;
  const c=document.createElement('canvas');c.width=W;c.height=imgs.length*(CROP+LAB);
  const x=c.getContext('2d');x.fillStyle='#141414';x.fillRect(0,0,c.width,c.height);let y=0;
  for(const [src,label] of imgs){const im=new Image();im.src=src;await im.decode();
    x.fillStyle='#141414';x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889';x.font='600 34px system-ui,sans-serif';x.textBaseline='middle';
    x.fillText(label,26,y+LAB/2);
    x.drawImage(im,0,0,im.width,Math.min(CROP,im.height),0,y+LAB,W,Math.min(CROP,im.height));
    y+=CROP+LAB;}
  return c.toDataURL('image/png');},imgs);
fs.writeFileSync('scratchpad/wl-door-built.png',Buffer.from(H.split(',')[1],'base64'));
await b.close();srv.close();console.log('scratchpad/wl-door-built.png');
