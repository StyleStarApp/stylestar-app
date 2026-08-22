// Her effective viewport measures ~375px (decoded from her own screenshots).
// Closed needs 265.9 in 273 -> 7.1px, which Chromium holds and Safari breaks.
// The words are 228 of that, so the 38px of marks are the whole argument.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8946,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];

const OPTS={
 A_current:      {css:'',                                                             word:null},
 B_nochevron:    {css:'#s-shopstyle #ssAsk:not(.open) .sa-chev{display:none}',         word:null},
 C_font165:      {css:'#s-shopstyle .sa-vox{font-size:16.5px}',                        word:null},
 D_trimAll:      {css:'#s-shopstyle .sa-vox{font-size:17px}#s-shopstyle .sa-star{width:12px;height:12px;margin-right:4px}#s-shopstyle .sa-chev{width:12px;height:12px;margin-left:3px}', word:null},
 E_shortword:    {css:'',                                                              word:'Something specific?'},
};
const MEAS=()=>{
  const v=document.querySelector('#s-shopstyle .sa-vox');
  const scr=document.getElementById('s-shopstyle');
  const tn=[...v.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  const r=document.createRange();const tops=new Set();let i=0;
  for(const w of tn.textContent.trim().split(/\s+/)){const s=tn.textContent.indexOf(w,i);if(s<0)continue;i=s+w.length;
    r.setStart(tn,s);r.setEnd(tn,i);
    for(const rc of r.getClientRects()){let hit=false;for(const t of tops)if(Math.abs(t-rc.top)<6)hit=true;if(!hit)tops.add(rc.top);}}
  const c=v.cloneNode(true);
  c.style.cssText+=';white-space:nowrap;width:auto;position:absolute;visibility:hidden;left:-9999px;margin:0;padding-left:0;padding-right:0';
  v.parentNode.appendChild(c);const need=Math.round(c.getBoundingClientRect().width*10)/10;c.remove();
  const sr=scr.getBoundingClientRect();
  const ch=v.querySelector('.sa-chev');const chr=ch&&getComputedStyle(ch).display!=='none'?ch.getBoundingClientRect():null;
  return {lines:tops.size,need,avail:Math.round(v.getBoundingClientRect().width*10)/10,
    spill:chr?Math.round((chr.right-sr.right)*10)/10:null};
};
for(const [name,o] of Object.entries(OPTS)){
 const out=[];
 for(const w of [430,393,375,360,320]){
  const ctx=await b.newContext({viewport:{width:w,height:1200},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      return of.apply(this,arguments);};},PICKS);
  await pg.goto('http://localhost:8946/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1400);
  if(o.css)await pg.evaluate(c=>{const s=document.createElement('style');s.textContent=c;document.head.appendChild(s);},o.css);
  if(o.word)await pg.evaluate(t=>{const v=document.querySelector('#s-shopstyle .sa-vox');
    [...v.childNodes].find(n=>n.nodeType===3&&n.textContent.trim()).textContent=t;},o.word);
  await pg.waitForTimeout(200);
  const m=await pg.evaluate(MEAS);
  const slack=Math.round((m.avail-m.need)*10)/10;
  out.push(`${w}:L${m.lines} slack ${String(slack).padStart(6)}${m.spill!==null&&m.spill>0?' SPILL'+m.spill:''}`);
  if(w===375)await pg.screenshot({path:`scratchpad/askopt-${name}.png`,clip:{x:0,y:0,width:w,height:330}});
  await ctx.close();
 }
 console.log(name.padEnd(14)+out.join('  '));
}
await b.close();srv.close();
