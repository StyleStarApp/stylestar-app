// Renders Shop your style with the REAL typefaces, for her 2026-08-22 pass:
// the tagline gone once the pieces land, the disclosure leading, the reworded
// escalation, and four options for the ask label.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{
  const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){
    const f=ROOT+'/scratchpad'+u;
    if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}
  }
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);
});
await new Promise(r=>srv.listen(8941,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

const PICKS=[
 {name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Statement Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Fitted Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Tailored Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];

async function shot(label,tweak,w=390){
  const ctx=await b.newContext({viewport:{width:w,height:1400},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',
      answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam','Classic Sophisticate'],
      portrait:'Polished with a modern edge.',motto:'Polished, always.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{tops:['M'],bottoms:['8'],shoes:['8'],dresses:['8']},
      colorsLove:[],neverWear:[],neverPatterns:[],neverOther:'',jewelry:'',dailyShoes:'',bagStyle:'',otherNotes:''}));
    localStorage.setItem('ss_hearttip','1');       // keep the tip out of the shot
    const of=window.fetch;
    window.fetch=function(u,o){
      if(String(u).indexOf('style-ai')>=0){
        return new Promise(res=>setTimeout(()=>res(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),
          {status:200,headers:{'Content-Type':'application/json'}})),120));
      }
      return of.apply(this,arguments);
    };
  },PICKS);
  await pg.goto('http://localhost:8941/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1800);
  if(tweak)await pg.evaluate(tweak);
  await pg.waitForTimeout(300);
  await pg.screenshot({path:`scratchpad/ask2-${label}.png`,clip:{x:0,y:0,width:w,height:760}});
  const m=await pg.evaluate(()=>{
    const q=s=>document.querySelector(s);
    const r=e=>e?Math.round(e.getBoundingClientRect().top):null;
    return {sub:!!(q('#s-shopstyle .ss-shop-sub')&&q('#s-shopstyle .ss-shop-sub').offsetHeight),
            discTop:r(q('#s-shopstyle .ss-disc-top')),
            cardsTop:r(q('#shopStyleContent')),
            talk:(q('#s-shopstyle .ss-shop-talk')||{}).textContent};
  });
  console.log(label.padEnd(12),JSON.stringify(m));
  await ctx.close();
}

await shot('built',null);
await shot('A-specific',()=>{document.querySelector('#s-shopstyle .sa-vox').lastChild.textContent='Looking for something specific?';});
await shot('B-whatare',()=>{document.querySelector('#s-shopstyle .sa-vox').lastChild.textContent='What are you looking for?';});
await shot('C-search',()=>{const v=document.querySelector('#s-shopstyle .sa-vox');v.lastChild.textContent='Search:';});
await b.close();srv.close();
console.log('renders written to scratchpad/ask2-*.png');
