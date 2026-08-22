// Her 2026-08-22 catch: the page opens by asking her to HUNT, then shows the
// gift. Her own description puts them the other way round. These render the
// orderings so she can see the difference rather than argue it.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{
  const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;
    if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);
});
await new Promise(r=>srv.listen(8940,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[
 {name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Statement Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Trousers',store:'Veronica Beard',search:'wide leg trousers'}];

async function shot(label,tweak,h=980,arg){
  const ctx=await b.newContext({viewport:{width:390,height:1500},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam','Classic Sophisticate'],portrait:'p',motto:'m'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{tops:['M'],bottoms:['8'],shoes:['8'],dresses:['8']},
      colorsLove:[],neverWear:[],neverPatterns:[],neverOther:'',jewelry:'',dailyShoes:'',bagStyle:'',otherNotes:''}));
    localStorage.setItem('ss_hearttip','1');
    const of=window.fetch;
    window.fetch=function(u,o){
      if(String(u).indexOf('style-ai')>=0)return new Promise(r=>setTimeout(()=>r(new Response(
        JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),
        {status:200,headers:{'Content-Type':'application/json'}})),100));
      return of.apply(this,arguments);};
  },PICKS);
  await pg.goto('http://localhost:8940/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1700);
  if(tweak)await pg.evaluate(tweak,arg);
  await pg.waitForTimeout(250);
  await pg.screenshot({path:`scratchpad/order-${label}.png`,clip:{x:0,y:0,width:390,height:h}});
  await ctx.close();
  console.log('  rendered',label);
}

const ARR='<svg class="wdr-see-ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;vertical-align:-2px;margin-left:5px"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg>';
const CHV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;vertical-align:-2px;margin-left:5px"><path d="M6 9.5 12 15.5 18 9.5"/></svg>';
await shot('n1-plain',null,470);
await shot('n2-arrow',a=>{document.querySelector('#s-shopstyle .sa-vox').insertAdjacentHTML('beforeend',a)},470,ARR);
await shot('n3-chevron',c=>{document.querySelector('#s-shopstyle .sa-vox').insertAdjacentHTML('beforeend',c)},470,CHV);
// widths at the narrowest phone
await b.close();srv.close();
