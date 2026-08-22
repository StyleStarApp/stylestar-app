// THE WAY BACK. Two testers independently could not get back to Style Star
// after tapping a product link. Today every product link is target="_blank".
// The alternative is a SAME-TAB link, where her own Back button returns her --
// but that is only better if the app COMES BACK AS SHE LEFT IT rather than
// reloading to the front door. Nobody has measured which happens. So: measure.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
// a stand-in "store" on its own origin-ish path, so the navigation is real
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  if(u==='/store'){res.writeHead(200,{'Content-Type':'text/html'});return res.end('<h1>A store</h1>');}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8955,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];
const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:2});
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
await pg.goto('http://localhost:8955/',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2300);
await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
await pg.waitForTimeout(1500);
// save one + scroll down, so there is real state to lose
await pg.evaluate(()=>{document.querySelectorAll('#shopStyleContent .wl-save')[0].click();window.scrollTo(0,600);});
await pg.waitForTimeout(400);
const before=await pg.evaluate(()=>({screen:document.querySelector('.scr.act').id,
  scroll:Math.round(window.scrollY), saves:(wardrobeData.wishlist||[]).length,
  cards:document.querySelectorAll('#shopStyleContent .wl-save').length,
  firstCard:(document.querySelector('#shopStyleContent .sb strong')||{}).textContent}));
console.log('BEFORE she taps out :',JSON.stringify(before));

// --- what a SAME-TAB product link would do: navigate away, then her Back button
await pg.evaluate(()=>{location.href='/store'});
await pg.waitForTimeout(600);
console.log('at the store       :',await pg.evaluate(()=>document.body.textContent.trim().slice(0,20)));
await pg.goBack();
await pg.waitForTimeout(2600);
const after=await pg.evaluate(()=>({screen:document.querySelector('.scr.act').id,
  scroll:Math.round(window.scrollY), saves:(wardrobeData.wishlist||[]).length,
  cards:document.querySelectorAll('#shopStyleContent .wl-save').length,
  firstCard:(document.querySelector('#shopStyleContent .sb strong')||{}).textContent,
  curtain:!!document.querySelector('.hm-entrance')}));
console.log('AFTER her Back     :',JSON.stringify(after));
console.log('');
console.log('same screen? ', after.screen===before.screen);
console.log('same six?    ', after.cards===before.cards && after.firstCard===before.firstCard);
console.log('scroll kept? ', Math.abs(after.scroll-before.scroll)<50, `(${before.scroll} -> ${after.scroll})`);
console.log('save kept?   ', after.saves===before.saves);
console.log('entrance curtain replayed? ', after.curtain);
await b.close();srv.close();
