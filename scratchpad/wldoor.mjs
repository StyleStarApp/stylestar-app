// Three weights for the wishlist line that replaces the Tip once she has saved
// something.  The WORDING is identical in all three on purpose -- the question
// she is being asked is how LOUD it should be, not what it should say.
// The two saves are made by clicking the REAL SAVE controls, so the count is real.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8949,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];

const HEART='<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-1px;margin-right:5px;display:inline-block"><path d="M12 21s-8-5.1-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 15.9 12 21 12 21z" fill="none" stroke="#C8971E" stroke-width="2"/></svg>';
const TXT='2 saved &middot; <b>See Your Wishlist &rarr;</b>';

const VARIANTS={
 CURRENT:null,
 A_caption:`<div id="wlDoorMock" style="font:400 12.5px/1.5 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;max-width:300px;margin:2px auto 12px">${HEART}${TXT.replace('<b>','<b style="font-weight:400;color:#4a463e;text-decoration:underline">')}</div>`,
 B_papervoice:`<div id="wlDoorMock" style="font:400 15.5px/1.5 'Lora',Georgia,serif;color:#4a463e;text-align:center;max-width:300px;margin:2px auto 12px">${HEART}${TXT.replace('<b>','<b style="font-style:italic;color:#A0761B;font-weight:600">')}</div>`,
 C_chip:`<div style="text-align:center;margin:2px auto 12px"><span id="wlDoorMock" style="display:inline-flex;align-items:center;font:600 12.5px/1 'Jost',sans-serif;letter-spacing:.05em;color:#4a463e;border:1px solid #D8A52E;padding:8px 14px;background:#fff">${HEART}${TXT.replace('<b>','<b style="font-weight:600">').replace(/&middot;/,'&middot;')}</span></div>`,
};

for(const [name,html] of Object.entries(VARIANTS)){
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
  await pg.goto('http://localhost:8949/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  // REAL saves through the REAL control, so the count is not a fiction
  const saved=await pg.evaluate(()=>{
    const btns=[...document.querySelectorAll('#shopStyleContent .wl-save')].slice(0,2);
    btns.forEach(b=>b.click());
    return (wardrobeData.wishlist||[]).length;
  });
  await pg.waitForTimeout(400);
  if(html)await pg.evaluate(h=>{
    const tip=document.querySelector('#s-shopstyle [data-hearttip]');
    tip.insertAdjacentHTML('afterend',h); tip.style.display='none';
    const t=document.getElementById('wlToast'); if(t)t.classList.remove('on');
  },html);
  else await pg.evaluate(()=>{const t=document.getElementById('wlToast');if(t)t.classList.remove('on');});
  await pg.waitForTimeout(300);
  await pg.screenshot({path:`scratchpad/wldoor-${name}.png`,clip:{x:0,y:0,width:375,height:640}});
  const m=await pg.evaluate(()=>{const d=document.getElementById('wlDoorMock');
    const tip=document.querySelector('#s-shopstyle [data-hearttip]');
    return {line:d?Math.round(d.getBoundingClientRect().height):null,
            tipShown:tip?tip.offsetHeight>0:null};});
  console.log(name.padEnd(14),'saves',saved,JSON.stringify(m));
  await ctx.close();
}
await b.close();srv.close();
