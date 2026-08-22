// Her question: should the resume whisper sit ABOVE Star of the Week?
// The Star's position on this screen was hard-won, so measure the cost against
// a real ~700px iPhone fold before answering.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  if(u.indexOf('/cdn/')>=0||u.indexOf('.jpg')>=0){res.writeHead(200,{'Content-Type':'image/svg+xml'});
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#e6e2d8"/><text x="150" y="200" font-size="20" text-anchor="middle" fill="#8a7f66">scarf</text></svg>');}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8959,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'}];
const FOLDS=[700,780];   // ~700 is this file's standing iPhone fold; ~780 is an iPhone 15 with the URL bar hidden
for(const FOLD of FOLDS){
console.log('--- fold '+FOLD+'px ---');
for(const [name,move] of [['now',false],['above',true]]){
  const ctx=await b.newContext({viewport:{width:375,height:FOLD},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.route('**/*.{png,jpg,jpeg,webp}',r=>r.fulfill({status:200,contentType:'image/svg+xml',
    body:'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#e8e3d6"/></svg>'}));
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
  await pg.goto('http://localhost:8959/',{waitUntil:'domcontentloaded'});

  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  if(move)await pg.evaluate(()=>{const s=document.getElementById('wbStar'),n=document.getElementById('wbNext');
    s.parentNode.insertBefore(n,s);});
  await pg.waitForTimeout(500);
  const m=await pg.evaluate(f=>{
    const r=e=>{const x=e.getBoundingClientRect();return {t:Math.round(x.top+window.scrollY),b:Math.round(x.bottom+window.scrollY)}};
    const star=document.getElementById('wbStar'), nx=document.getElementById('wbNext');
    const shopIt=star.querySelector('.wks-buy,a,button'), save=star.querySelector('.wl-save');
    const awning=document.querySelector('#s-wb .wb-acts');
    const sr=r(star);
    return {whisper:r(nx), starTop:sr.t, starBot:sr.b,
      starVisibleAboveFold:Math.max(0,Math.min(f,sr.b)-sr.t),
      shopItBot:shopIt?r(shopIt).b:null, saveBot:save?r(save).b:null,
      awningTop:r(awning).t, page:document.documentElement.scrollHeight};
  },FOLD);
  console.log(name.padEnd(6),
    'whisper',String(m.whisper.t).padStart(4)+'-'+m.whisper.b,
    '| star',String(m.starTop).padStart(4)+'-'+m.starBot,
    '| star px above a '+FOLD+'px fold:',String(m.starVisibleAboveFold).padStart(4),
    '| Shop it bottom',m.shopItBot,'| awning',m.awningTop);
  if(FOLD===780)await pg.screenshot({path:`scratchpad/wbord-${name}.png`,clip:{x:0,y:0,width:375,height:FOLD}});
  await ctx.close();
}
}
await b.close();srv.close();
