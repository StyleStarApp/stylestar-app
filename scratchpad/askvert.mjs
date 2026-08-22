// Two things about the ask line, measured against the REAL edited file (no
// injected CSS): does it hold ONE line, and are the shrunk marks still sitting
// on the text's optical centre?  The A2HS share chip taught this: resize an
// inline glyph and it silently drops off the line while every positional
// assertion still passes, so measure the CENTRES, not the positions.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8948,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'},
 {name:'Strappy Heeled Sandals',store:'Shopbop',search:'strappy heeled sandals'},
 {name:'Gold Hoop Earrings',store:'Kendra Scott',search:'gold hoop earrings'},
 {name:'Satin Blouse',store:'Zara',search:'satin blouse'},
 {name:'Top Handle Bag',store:'Saks',search:'top handle bag'},
 {name:'Wide Leg Pants',store:'Veronica Beard',search:'wide leg trousers'}];
let fails=0,checks=0;
const ok=(n,c,d)=>{checks++;if(!c)fails++;console.log((c?'  ✓ ':'  ✗ ')+n+(d!==undefined?'  ['+d+']':''))};

const MEAS=()=>{
  const v=document.querySelector('#s-shopstyle .sa-vox');
  const tn=[...v.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  // line count by range walk, tops clustered within 6px
  const r=document.createRange();const tops=new Set();let i=0;
  for(const w of tn.textContent.trim().split(/\s+/)){const s=tn.textContent.indexOf(w,i);if(s<0)continue;i=s+w.length;
    r.setStart(tn,s);r.setEnd(tn,i);
    for(const rc of r.getClientRects()){let hit=false;for(const t of tops)if(Math.abs(t-rc.top)<6)hit=true;if(!hit)tops.add(rc.top);}}
  // the WORDS' painted box, for the optical centre and for the star-leads check
  r.setStart(tn,0);r.setEnd(tn,tn.textContent.length);
  // ⚠️ The star leads the FIRST line and the chevron trails the LAST one. At 320
  // the text wraps, so measuring both against rect[0] fails the chevron on a
  // perfectly correct value -- the broken-harness shape this file keeps hitting.
  const wrects=[...r.getClientRects()].filter(x=>x.width>1);
  const wr=wrects[0], wrLast=wrects[wrects.length-1];
  const st=v.querySelector('.sa-star').getBoundingClientRect();
  const ch=v.querySelector('.sa-chev');
  const chr=ch&&getComputedStyle(ch).display!=='none'?ch.getBoundingClientRect():null;
  const c=v.cloneNode(true);
  c.style.cssText+=';white-space:nowrap;width:auto;position:absolute;visibility:hidden;left:-9999px;margin:0;padding-left:0;padding-right:0';
  v.parentNode.appendChild(c);const need=Math.round(c.getBoundingClientRect().width*10)/10;c.remove();
  const scr=document.getElementById('s-shopstyle').getBoundingClientRect();
  const rd=n=>Math.round(n*10)/10;
  return {lines:tops.size, need, avail:rd(v.getBoundingClientRect().width),
    fs:getComputedStyle(v).fontSize,
    starOff:rd((st.top+st.bottom)/2-(wr.top+wr.bottom)/2),
    chevOff:chr?rd((chr.top+chr.bottom)/2-(wrLast.top+wrLast.bottom)/2):null,
    starLeads:rd(wr.left-st.left),
    starSize:rd(st.width), chevSize:chr?rd(chr.width):null,
    spillR:chr?rd(chr.right-scr.right):null, spillL:rd(scr.left-st.left)};
};
for(const w of [430,393,375,360,320]){
  const ctx=await b.newContext({viewport:{width:w,height:1200},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      return of.apply(this,arguments);};},PICKS);
  await pg.goto('http://localhost:8948/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1400);
  const m=await pg.evaluate(MEAS);
  const slack=Math.round((m.avail-m.need)*10)/10;
  console.log(`--- ${w}px ---`);
  if(w>=360){
    ok('CLOSED holds one line',m.lines===1,'lines '+m.lines);
    ok('with a real margin, not a Chromium-only pass (>=15px)',slack>=15,'slack '+slack+'px');
  } else {
    ok('320 falls to two BALANCED lines, deliberately',m.lines===2,'lines '+m.lines);
  }
  ok('the star still leads the painted WORDS',m.starLeads>0,'gap '+m.starLeads+'px');
  ok('star sits on the text centre (within 2px)',Math.abs(m.starOff)<=2,'off '+m.starOff+'px');
  ok('chevron sits on the text centre (within 2px)',m.chevOff===null||Math.abs(m.chevOff)<=2,'off '+m.chevOff+'px');
  ok('nothing spills past the framed screen',m.spillR<=0&&m.spillL<=0,'R '+m.spillR+' L '+m.spillL);
  ok('type is 17px',m.fs==='17px',m.fs);
  ok('no JS errors',errs.length===0,errs.join('|'));
  await pg.close();await ctx.close();
}
console.log(`\nTOTAL ${checks} checks, ${fails} failures`);
await b.close();srv.close();
process.exit(fails?1:0);
