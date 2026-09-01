// The Journal quiz button: her spec (home page CTA, no tile, words centred,
// arrow after, star top-right). Measured on the REAL page with REAL typefaces.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw; import http from 'http'; import fs from 'fs'; import path from 'path';
const T={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const p=q.url.split('?')[0];const f=path.join(process.cwd(),p==='/'?'/index.html':p);
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'text/html; charset=utf-8'});r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(8815,r));
const gf=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8815/scratchpad/fonts/$1)');
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
let pass=0,fail=0; const ok=(n,c,d='')=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+n+(c?'':'   <- '+d));};
for(const w of [430,390,375,360,320]){
 const pg=await br.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});
 const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:gf}));
 await pg.goto('http://localhost:8815/index.html',{waitUntil:'domcontentloaded'});
 await pg.waitForTimeout(1800);
 await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
 try{await pg.evaluate(async()=>{await document.fonts.ready;});}catch(e){}
 const fok=await pg.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');
   c.font="700 13.5px 'Jost'";const a=c.measureText('TAKE THE FREE STYLE QUIZ').width;
   c.font="700 13.5px sans-serif";return Math.abs(a-c.measureText('TAKE THE FREE STYLE QUIZ').width)>1;});
 if(!fok){console.log('ABORT: fallback fonts at '+w);process.exit(1);}
 console.log('\n== '+w+'px ==');
 const fills={};
 for(const sid of ['s-journal','s-journal-fall-florida']){
  // ⚠️ NAVIGATE the way a visitor does, then WAIT: the seal's ssSealPop starts at
  // scale(0), and a zero-scale transform reports a ZERO-SIZE rect. Measuring
  // straight after show() reported the star missing on a perfectly good button
  // (and on the home page's own, which is how it was caught).
  await pg.evaluate((sid)=>{ sid==='s-journal'?openJournalArticle('s-journal'):openJournalArticle(sid); },sid);
  await pg.waitForTimeout(1600);
  const r=await pg.evaluate((sid)=>{
   const scr=document.getElementById(sid);
   const btn=scr.querySelector('.jrnl-quiz');
   if(!btn) return {err:'no button on '+sid};
   const lbl=btn.querySelector('.lbl'), arr=btn.querySelector('.hm-cta-arr'), seal=btn.querySelector('.hm-cta-seal');
   const b=btn.getBoundingClientRect(), l=lbl.getBoundingClientRect(), a=arr.getBoundingClientRect(), s=seal.getBoundingClientRect();
   // ⚠️ THE STAR IS ROTATED, so its bounding RECT overstates the drawn shape by
   // ~11px here. Star-to-arrow clearance must be measured on the DRAWN PATH
   // (getPointAtLength through getScreenCTM), the same technique the Mall sign
   // used. A rect-based check reported a collision on a button that was fine.
   const inkBox=(svgEl)=>{
     let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
     for(const pth of svgEl.querySelectorAll('path')){
       const m=pth.getScreenCTM(); if(!m) continue;
       const L=pth.getTotalLength();
       for(let i=0;i<=240;i++){
         const q=pth.getPointAtLength(L*i/240);
         const sx=m.a*q.x+m.c*q.y+m.e, sy=m.b*q.x+m.d*q.y+m.f;
         if(sx<x0)x0=sx; if(sy<y0)y0=sy; if(sx>x1)x1=sx; if(sy>y1)y1=sy;
       }
     }
     return {x0,y0,x1,y1};
   };
   const SI=inkBox(seal), AI=inkBox(arr);
   const gapY = AI.y0>SI.y1 ? AI.y0-SI.y1 : (SI.y0>AI.y1 ? SI.y0-AI.y1 : 0);
   const gapX = AI.x0>SI.x1 ? AI.x0-SI.x1 : (SI.x0>AI.x1 ? SI.x0-AI.x1 : 0);
   const rg=document.createRange(); rg.selectNodeContents(lbl);
   const lines=new Set([...rg.getClientRects()].map(x=>Math.round(x.top))).size;
   const cs=getComputedStyle(lbl);
   return {
    text:lbl.textContent, transform:cs.textTransform, size:cs.fontSize,
    lines, overflow:+(lbl.scrollWidth-lbl.getBoundingClientRect().width).toFixed(1),
    wordsOffCentre:+(((l.left+l.right)/2)-((b.left+b.right)/2)).toFixed(1),
    arrowInside:+(b.right-a.right).toFixed(1),
    arrowAfterWords:a.left>=l.right-1,
    sealTopRight: s.top<b.top && s.right>b.right-30,
    sealW:+s.width.toFixed(1), sealH:+s.height.toFixed(1),
    sealTop:+(s.top-b.top).toFixed(1), sealRight:+(s.right-b.right).toFixed(1),
    sealFill:(seal.querySelector('path').getAttribute('fill')||''),
    tile:!!btn.querySelector('.hm-cta-tile'),
    starVisible:s.width>0&&s.height>0,
    starArrowClear:+Math.max(gapX,gapY).toFixed(1),
    starArrowOverlap:(gapX===0&&gapY===0)
   };
  },sid);
  if(r.err){ok(sid,false,r.err);continue;}
  const tag=sid==='s-journal'?'article #1':'article #2';
  ok(tag+': label not clipped', r.overflow<=0.5, 'overflow '+r.overflow+'px');
  ok(tag+': one line'+(w<=330?' (or 2 balanced at Display Zoom)':''), w<=330? r.lines<=2 : r.lines===1, r.lines+' lines');
  ok(tag+': font NOT shrunk (13.5px)', r.size==='13.5px', r.size);
  ok(tag+': uppercase via CSS', r.transform==='uppercase');
  ok(tag+': no slider tile', !r.tile);
  ok(tag+': star has real painted size', r.starVisible, 'seal rect '+r.sealW+'x'+r.sealH);
  ok(tag+': star hangs off the TOP-RIGHT corner', r.sealTopRight, 'top '+r.sealTop+' rightOut '+r.sealRight);
  ok(tag+': star uses its OWN gradient id', /jrnlSeal[12]/.test(r.sealFill), r.sealFill);
  fills[sid]=r.sealFill;
  // ⚠️⚠️ THIS CHECK ASSERTS *NO OVERLAP*, AND DELIBERATELY DOES NOT ENFORCE A
  // MINIMUM GAP. The position is HERS, set at top:-41px right:-21px from the LIVE
  // page on her own phone ("the star on the buttons needs to go down 3px and right
  // 3px"), and it measures ~2.6px of ink separation at 375-430.
  // ▶ THE HISTORY IS THE REASON: at the home page's own top:-24px the two inks
  // genuinely OVERLAPPED, so a real check is needed. But I then held this project's
  // ~10px SANDBOX FLOOR here, which pushed the star to -52 and she rejected it in
  // three words ("star is too high"). That floor exists because TEXT measures
  // differently in Chromium than in real Safari; these are two fixed-size SVG
  // shapes with NO text metrics in the measurement, so it never applied.
  // ▶ SO: this catches a genuine collision and leaves the aesthetic to her.
  // Do NOT reintroduce a minimum-gap number without her asking for one.
  ok(tag+': star ink does not OVERLAP the arrow ink', !r.starArrowOverlap,
     r.starArrowOverlap?'OVERLAPPING':(r.starArrowClear+'px clear'));
  ok(tag+': arrow after the words', r.arrowAfterWords);
  ok(tag+': arrow inside the button', r.arrowInside>=-1, r.arrowInside+'px');
  if(w>330) ok(tag+': WORDS centred in the button', Math.abs(r.wordsOffCentre)<=2, r.wordsOffCentre+'px off');
 }
 // ⚠️ THE ID MUST DIFFER between the two buttons. A pattern match alone passes
 // when BOTH say jrnlSeal1, which is exactly the Safari hidden-defs trap: two
 // defs sharing an id resolve to whichever copy sits in a hidden screen and the
 // star renders EMPTY. A negative control proved the pattern check does not bite.
 ok(w+'px: the two buttons use DIFFERENT gradient ids',
    !!fills['s-journal'] && !!fills['s-journal-fall-florida'] &&
    fills['s-journal']!==fills['s-journal-fall-florida'],
    fills['s-journal']+' vs '+fills['s-journal-fall-florida']);
 ok(w+'px: zero JS errors', errs.length===0, errs.slice(0,1).join(''));
 await pg.close();
}
await br.close(); srv.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
