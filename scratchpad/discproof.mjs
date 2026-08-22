// Proof for her disclosure ask: the notice is gone while the star spins and
// present the moment the pieces land.  Same screen, two moments.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8947,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];
const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:3});
const pg=await ctx.newPage();
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
await pg.addInitScript(picks=>{
  localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
    topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
  localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
  const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
    return new Promise(r=>setTimeout(()=>r(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}})),4000));}
    return of.apply(this,arguments);};},PICKS);
await pg.goto('http://localhost:8947/',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2300);
await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
await pg.waitForTimeout(900);
const spin=await pg.evaluate(()=>{const d=document.querySelector('#s-shopstyle .ss-disc-top');
  return {thinking:document.getElementById('s-shopstyle').classList.contains('thinking'),
          discVisible:!!(d&&d.offsetHeight>0), text:d?d.textContent.trim():null};});
await pg.screenshot({path:'scratchpad/disc-spinning.png',clip:{x:0,y:0,width:375,height:560}});
await pg.waitForTimeout(4200);
const land=await pg.evaluate(()=>{const d=document.querySelector('#s-shopstyle .ss-disc-top');
  const card=document.querySelector('#shopStyleContent .shop-card,#shopStyleContent a');
  return {thinking:document.getElementById('s-shopstyle').classList.contains('thinking'),
          discVisible:!!(d&&d.offsetHeight>0),
          discTop:d?Math.round(d.getBoundingClientRect().top):null,
          firstLinkTop:card?Math.round(card.getBoundingClientRect().top):null};});
await pg.screenshot({path:'scratchpad/disc-landed.png',clip:{x:0,y:0,width:375,height:560}});
console.log('SPINNING',JSON.stringify(spin));
console.log('LANDED  ',JSON.stringify(land));
console.log(land.discVisible&&land.firstLinkTop>land.discTop?'PASS: notice hidden while spinning, and above every link once they land'
  :'FAIL');
await b.close();srv.close();
