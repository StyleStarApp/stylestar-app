// A CLOSE-UP she can actually read. The 4-panel board was too small to see the
// line, which was the whole point of the render.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8958,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];
const CASES=[['now',{seenAll:false}],['chat',{chat:true,seenAll:true}],['pieces',{shop:true,seenAll:true}],['both',{chat:true,shop:true,seenAll:true}]];
for(const [name,seed] of CASES){
  const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(([picks,seed])=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Kathy',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    if(seed.chat)localStorage.setItem('ss_chat',JSON.stringify([{role:'user',text:'formal wedding?'},{role:'assistant',text:'Reformation.'}]));
    if(seed.seenAll)['ss_seen_wardrobe','ss_seen_shopstyle','ss_seen_wishlist','ss_trending_seen'].forEach(k=>localStorage.setItem(k,'1'));
    if(seed.shop)localStorage.setItem('ss_shoppicks',JSON.stringify({m:'quiz',i:picks,t:Date.now()}));
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      if(String(u).indexOf('user-data')>=0)return Promise.resolve(new Response('{}',{status:200}));
      return of.apply(this,arguments);};},[PICKS,seed]);
  await pg.goto('http://localhost:8958/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.waitForTimeout(400);
  const box=await pg.evaluate(()=>{const n=document.getElementById('wbNext');const r=n.getBoundingClientRect();
    return {y:Math.max(0,Math.round(r.top)-22),h:Math.round(r.height)+44,
      says:n.querySelector('.wbn-t').textContent.replace(/\s+/g,' ').trim()};});
  console.log(name.padEnd(8),JSON.stringify(box.says));
  await pg.screenshot({path:`scratchpad/rz-${name}.png`,clip:{x:0,y:box.y,width:375,height:box.h}});
  await ctx.close();
}
const pg=await b.newPage({viewport:{width:1200,height:800}});
const P=[['rz-now.png','NOW — what a returning woman is told today'],
 ['rz-chat.png','KATHY — a conversation waiting, and nothing else'],
 ['rz-pieces.png','JEN — her six pieces waiting'],
 ['rz-both.png','BOTH — one line, two separate taps']];
const imgs=P.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const D=await pg.evaluate(async imgs=>{
  const W=1125,LAB=86,PAD=10;const c=document.createElement('canvas');
  const ims=[];for(const [src,l] of imgs){const im=new Image();im.src=src;await im.decode();ims.push([im,l]);}
  c.width=W;c.height=ims.reduce((a,[im])=>a+LAB+im.height+PAD,0);
  const x=c.getContext('2d');x.fillStyle='#0d0d0d';x.fillRect(0,0,c.width,c.height);let y=0;
  for(const [im,label] of ims){
    x.fillStyle='#0d0d0d';x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889';x.font='600 32px system-ui,sans-serif';x.textBaseline='middle';
    x.fillText(label,26,y+LAB/2);
    x.drawImage(im,0,y+LAB,W,im.height);y+=LAB+im.height+PAD;}
  return c.toDataURL('image/png');},imgs);
fs.writeFileSync('scratchpad/resume-closeup.png',Buffer.from(D.split(',')[1],'base64'));
await b.close();srv.close();console.log('scratchpad/resume-closeup.png');
