// Move the star clear of the S -- but the Edit star has TWO constraints already
// documented: the fixed MENU chip above it, and the card's own left edge. Try
// candidate offsets and report the gap to the letter AND every new collision.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8964,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PROBE=([starSel,textSel])=>{
  const star=document.querySelector(starSel), txt=document.querySelector(textSel);
  const pth=star.querySelector('path'); const len=pth.getTotalLength(); const m=pth.getScreenCTM();
  const pts=[];for(let i=0;i<=400;i++){const p=pth.getPointAtLength(len*i/400);
    pts.push([m.a*p.x+m.c*p.y+m.e, m.b*p.x+m.d*p.y+m.f]);}
  const tn=[...txt.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  const r=document.createRange(); const s=tn.textContent.search(/\S/);
  r.setStart(tn,s);r.setEnd(tn,s+1); const g=r.getBoundingClientRect();
  let into=-1e9, inside=0, minL=1e9, minT=1e9;
  for(const [x,y] of pts){ if(x<minL)minL=x; if(y<minT)minT=y;
    if(y>g.top-2&&y<g.bottom+2&&x-g.left>into)into=x-g.left;
    if(x>g.left&&x<g.right&&y>g.top&&y<g.bottom)inside++; }
  const chip=document.querySelector('.menu-chip,#menuChip,[onclick*="menuOpen"]');
  const cr=chip?chip.getBoundingClientRect():null;
  let hitsChip=false;
  if(cr)for(const [x,y] of pts)if(x>cr.left&&x<cr.right&&y>cr.top&&y<cr.bottom){hitsChip=true;break;}
  const rd=n=>Math.round(n*10)/10;
  return {into:rd(into), inside, starLeftEdge:rd(minL), starTopEdge:rd(minT),
    hitsChip, offLeft:minL<0, pageScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth};
};
for(const [name,open_,starSel,textSel,cssSel,base] of [
  ['EDIT','showDream()','#s-dream .dc-corner-star','#s-dream .dc-logo','.dc-corner-star',{left:-55,top:-34}],
  ['MALL','showShop()','#s-shop .mf-star','#s-shop .mall-sign-logo','.mall-fixture',{left:-16,top:-30}],
]){
  const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(()=>{localStorage.setItem('ss_data',JSON.stringify({userName:'C',answers:[8,7,6,5,9,4,7,6,8,5,7,6],topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));});
  await pg.goto('http://localhost:8964/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.evaluate(fn=>{eval(fn)},open_);
  await pg.waitForTimeout(900);
  console.log('--- '+name+' (now: left '+base.left+', top '+base.top+') ---');
  const GRID = name==='MALL'
    ? [[-10,0,88],[-12,0,88],[-10,0,90],[-8,0,86]]
    : [[-12,-6,70],[-12,-8,70],[-14,-6,70]];
  for(const [dx,dy,sz] of GRID){
    await pg.evaluate(([sel,l,t,z])=>{let st=document.getElementById('probeCss');
      if(!st){st=document.createElement('style');st.id='probeCss';document.head.appendChild(st);}
      st.textContent=sel+'{left:'+l+'px !important;top:'+t+'px !important}'+(z?' '+(sel==='.mall-fixture'?'.mall-fixture .mf-star':sel)+'{width:'+z+'px !important;height:'+z+'px !important}':'');},[cssSel,base.left+dx,base.top+dy,sz]);
    await pg.waitForTimeout(150);
    const m=await pg.evaluate(PROBE,[starSel,textSel]);
    console.log('  dx '+String(dx).padStart(4)+' dy '+String(dy).padStart(4)+' size '+String(sz).padStart(3)+' : into letter '+String(m.into).padStart(6)
      +' | pts inside '+String(m.inside).padStart(3)
      +' | star left edge '+String(m.starLeftEdge).padStart(6)
      +(m.hitsChip?'  ⚠ HITS MENU CHIP':'')+(m.offLeft?'  ⚠ OFF SCREEN':'')+(m.pageScroll?'  ⚠ PAGE SCROLLS':'')+(m.starLeftEdge<8?'  ⚠ NEAR SCREEN EDGE':'')+(m.starTopEdge<0?'  ⚠ ABOVE VIEWPORT':''));
  }
  await ctx.close();
}
await b.close();srv.close();
