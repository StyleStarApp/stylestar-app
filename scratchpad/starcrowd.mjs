// She sees the capital S crowded by the star on the Edit and (especially) the
// Mall. Measure the real overlap on the DRAWN star path, not its rotated
// bounding box -- the box overstates badly on a -57deg rotation (the 2026-08-07
// lesson). Compare against the painted "S" glyph, found by rasterising.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8963,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

const PROBE=([starSel,textSel])=>{
  const star=document.querySelector(starSel), txt=document.querySelector(textSel);
  const path=star.tagName.toLowerCase()==='svg'?star.querySelector('path'):star;
  // walk the DRAWN path, map each point through the element's screen CTM
  const len=path.getTotalLength(); const m=path.getScreenCTM();
  let right=-1e9, bottom=-1e9, pts=[];
  for(let i=0;i<=400;i++){
    const p=path.getPointAtLength(len*i/400);
    const x=m.a*p.x+m.c*p.y+m.e, y=m.b*p.x+m.d*p.y+m.f;
    pts.push([x,y]); if(x>right)right=x; if(y>bottom)bottom=y;
  }
  // the FIRST character's painted box, via a range over the leading glyph
  const tn=[...txt.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  const r=document.createRange(); const s=tn.textContent.search(/\S/);
  r.setStart(tn,s); r.setEnd(tn,s+1);
  const g=r.getBoundingClientRect();
  // how far does the star's drawn outline reach INTO the first letter's box?
  let intoX=-1e9, intoY=-1e9, inside=0;
  for(const [x,y] of pts){
    if(y>g.top&&y<g.bottom){ if(x-g.left>intoX)intoX=x-g.left; }
    if(x>g.left&&x<g.right){ if(y-g.top>intoY)intoY=y-g.top; }
    if(x>g.left&&x<g.right&&y>g.top&&y<g.bottom)inside++;
  }
  const rd=n=>Math.round(n*10)/10;
  return {letter:tn.textContent[s], glyph:{l:rd(g.left),t:rd(g.top),w:rd(g.width),h:rd(g.height)},
    starRight:rd(right), starBottom:rd(bottom),
    overlapsGlyphBox:inside>0, pointsInsideGlyphBox:inside,
    reachesIntoLetterX:rd(intoX), reachesIntoLetterY:rd(intoY),
    gapStarRightToLetterLeft:rd(g.left-right)};
};

for(const [name,open_,starSel,textSel] of [
  ['EDIT','showDream()','#s-dream .dc-corner-star','#s-dream .dc-logo'],
  ['MALL','showShop()','#s-shop .mf-star','#s-shop .mall-sign-logo'],
]){
  const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(()=>{localStorage.setItem('ss_data',JSON.stringify({userName:'C',answers:[8,7,6,5,9,4,7,6,8,5,7,6],topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));});
  await pg.goto('http://localhost:8963/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.evaluate(fn=>{eval(fn)},open_);
  await pg.waitForTimeout(900);
  // capital (as shipped) vs lowercase (as it was) -- the same measurement twice
  for(const lower of [false,true]){
    if(lower)await pg.evaluate(sel=>{const e=document.querySelector(sel);
      e.childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent=n.textContent.replace(/^(\s*)Style/,'$1style')});},textSel);
    await pg.waitForTimeout(200);
    const m=await pg.evaluate(PROBE,[starSel,textSel]);
    console.log(name,(lower?'lowercase s':'CAPITAL S ').padEnd(12),JSON.stringify(m));
  }
  await ctx.close();
}
await b.close();srv.close();
