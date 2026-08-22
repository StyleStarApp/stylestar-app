// Candidate fixes for the CLOSED ask line wrapping.  The chevron costs 20px of
// line width; the OPEN state (no chevron) is the one she says looks right.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8945,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];

const VARIANTS={
  A_current:'',
  B_chevOverhang:'#s-shopstyle .sa-chev{margin-right:-20px}',
  C_smallerMarks:'#s-shopstyle .sa-chev{width:12px;height:12px;margin-left:3px}#s-shopstyle .sa-star{width:11px;height:11px;margin-right:4px}',
  D_bothOverhang:'#s-shopstyle .sa-chev{margin-right:-20px}#s-shopstyle .sa-star{margin-left:-18px}',
};

const MEAS=()=>{
  const v=document.querySelector('#s-shopstyle .sa-vox');
  const scr=document.getElementById('s-shopstyle');
  const tn=[...v.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  const r=document.createRange();const tops=new Set();let i=0;
  for(const w of tn.textContent.split(/\s+/)){const s=tn.textContent.indexOf(w,i);if(s<0)continue;i=s+w.length;
    r.setStart(tn,s);r.setEnd(tn,i);
    for(const rc of r.getClientRects()){let hit=false;for(const t of tops)if(Math.abs(t-rc.top)<6)hit=true;if(!hit)tops.add(rc.top);}}
  const c=v.cloneNode(true);
  c.style.cssText+=';white-space:nowrap;width:auto;position:absolute;visibility:hidden;left:-9999px;margin:0;padding-left:0;padding-right:0';
  v.parentNode.appendChild(c);const need=Math.round(c.getBoundingClientRect().width*10)/10;c.remove();
  const sr=scr.getBoundingClientRect();
  const ch=v.querySelector('.sa-chev').getBoundingClientRect();
  const st=v.querySelector('.sa-star').getBoundingClientRect();
  return {lines:tops.size,need,avail:Math.round(v.getBoundingClientRect().width*10)/10,
    chevSpill:Math.round((ch.right-sr.right)*10)/10,   // >0 = chevron off the screen edge
    starSpill:Math.round((sr.left-st.left)*10)/10,
    h:Math.round(v.getBoundingClientRect().height)};
};

for(const [name,css] of Object.entries(VARIANTS)){
 const line=[];
 for(const w of [430,390,375,360,320]){
  const ctx=await b.newContext({viewport:{width:w,height:1200},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    localStorage.setItem('ss_hearttip','1');
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      return of.apply(this,arguments);};},PICKS);
  await pg.goto('http://localhost:8945/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1400);
  if(css)await pg.evaluate(c=>{const s=document.createElement('style');s.textContent=c;document.head.appendChild(s);},css);
  await pg.waitForTimeout(150);
  const m=await pg.evaluate(MEAS);
  line.push(`${String(w).padStart(3)}: L${m.lines} need ${String(m.need).padStart(5)} avail ${String(m.avail).padStart(5)} slack ${String(Math.round((m.avail-m.need)*10)/10).padStart(6)} spill ${String(m.chevSpill).padStart(5)}/${String(m.starSpill).padStart(5)}`);
  if(w===360)await pg.screenshot({path:`scratchpad/askfix-${name}.png`,clip:{x:0,y:0,width:w,height:430}});
  await ctx.close();
 }
 console.log(name.padEnd(16)+line.join('  |  '));
}
await b.close();srv.close();
