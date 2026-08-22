// Why does "Looking for something specific?" wrap on HER phone in the CLOSED
// state but hold one line OPEN?  Measures the line's REQUIRED width against its
// AVAILABLE width, closed and open, across phone widths and under iOS-style
// text zoom (the 2026-08-09 Menu lesson: her rows wrap because of Page Zoom).
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{
  const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;
    if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);
});
await new Promise(r=>srv.listen(8943,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];

const MEAS = () => {
  const v=document.querySelector('#s-shopstyle .sa-vox');
  const box=document.querySelector('#s-shopstyle #ssAsk');
  // line count: walk the words, cluster rect tops within 6px (documented lesson)
  const lines=()=>{
    const tn=[...v.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    if(!tn)return 0;
    const r=document.createRange();const tops=new Set();
    const words=tn.textContent.split(/\s+/);let i=0;
    for(const w of words){const s=tn.textContent.indexOf(w,i);if(s<0)continue;i=s+w.length;
      r.setStart(tn,s);r.setEnd(tn,i);
      for(const rc of r.getClientRects()){let hit=false;
        for(const t of tops)if(Math.abs(t-rc.top)<6)hit=true;
        if(!hit)tops.add(rc.top);}}
    return tops.size;
  };
  // required width: clone with nowrap, measure
  const c=v.cloneNode(true);
  c.style.cssText+=';white-space:nowrap;width:auto;position:absolute;visibility:hidden;left:-9999px;margin:0;padding-left:0;padding-right:0';
  v.parentNode.appendChild(c);   // MUST live inside #s-shopstyle or none of the scoped rules apply
  const need=Math.round(c.getBoundingClientRect().width*10)/10;
  c.remove();
  const avail=Math.round(v.getBoundingClientRect().width*10)/10;
  const chev=v.querySelector('.sa-chev');
  const cw=chev?Math.round((chev.getBoundingClientRect().width+parseFloat(getComputedStyle(chev).marginLeft))*10)/10:0;
  return {need,avail,slack:Math.round((avail-need)*10)/10,lines:lines(),chevCost:cw,
          maxw:getComputedStyle(box).maxWidth,fs:getComputedStyle(v).fontSize};
};

for(const w of [430,414,393,390,375,360,320]){
 for(const zoom of [1,1.15]){
  const ctx=await b.newContext({viewport:{width:Math.round(w/zoom),height:1200},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam','Classic Sophisticate'],portrait:'Polished.',motto:'Polished.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    localStorage.setItem('ss_hearttip','1');
    const of=window.fetch;
    window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),
        {status:200,headers:{'Content-Type':'application/json'}}));}
      return of.apply(this,arguments);};
  },PICKS);
  await pg.goto('http://localhost:8943/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  const closed=await pg.evaluate(MEAS);
  await pg.evaluate(()=>_ssAskReveal());
  await pg.waitForTimeout(200);
  const open=await pg.evaluate(MEAS);
  console.log(`${String(w).padStart(3)}px zoom${zoom}  CLOSED need ${String(closed.need).padStart(6)} avail ${String(closed.avail).padStart(6)} slack ${String(closed.slack).padStart(6)} lines ${closed.lines}  |  OPEN need ${String(open.need).padStart(6)} avail ${String(open.avail).padStart(6)} slack ${String(open.slack).padStart(6)} lines ${open.lines}  | chev ${closed.chevCost} maxw ${closed.maxw} fs ${closed.fs}`);
  await ctx.close();
 }
}
await b.close();srv.close();
