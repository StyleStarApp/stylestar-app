// THE DISCOVERY PAGE (s-wel) — its composition, measured.
//
// ▶ SUCCESSOR TO scratchpad/hiwcheck.js, which was DELETED 2026-08-21, not
//   silenced: every one of its 44 checks measured the How It Works 1-2-3 rows
//   (their leading, their widow behaviour, their 40px row height), and she
//   retired that block. Its real job — hold the quiz reassurance readable and
//   unwrapped at every width, and never shrink the font to get there — lives
//   on here against .hm-hiwline, the one sentence that survived.
//
// Asserts the promises made when she picked option "B" from the renders:
// the 1-2-3 is really gone, her sentence is verbatim, ONE gold divider label
// remains beside the Star's own header, and a real garment reaches the first
// screen without the quiz CTA ever losing the top of it.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { starPhoto } from './starphoto.mjs';
const ROOT=path.resolve('.'); const PORT=8968;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const photo=starPhoto();
let pass=0, fail=0; const ok=(c,m)=>{c?pass++:(fail++,console.log('  ✗ '+m));};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const w of [390,375,360,320]){
  const pg=await b.newPage({viewport:{width:w,height:844},deviceScaleFactor:2});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(500);
  const m=await pg.evaluate(()=>{
    const q=s=>document.querySelector(s);
    const box=e=>{const r=e.getBoundingClientRect();return {top:Math.round(r.top+scrollY),h:Math.round(r.height),w:Math.round(r.width)};};
    const line=q('.hm-hiwline');
    const rng=document.createRange(); rng.selectNodeContents(line);
    const tops=[...rng.getClientRects()].map(x=>Math.round(x.top));
    const uniq=[]; tops.forEach(t=>{if(!uniq.some(u=>Math.abs(u-t)<6))uniq.push(t)});
    const cs=getComputedStyle(line);
    const dividers=[...document.querySelectorAll('#s-wel .hm-divlbl')].map(e=>e.textContent.trim());
    const starHd=q('#dsStar .dss-hd');
    return {
      line:{...box(line), text:line.textContent, lines:uniq.length,
            size:parseFloat(cs.fontSize), style:cs.fontStyle, balance:cs.textWrap||cs.textWrapStyle},
      cta:box(q('.hm-cta')), founder:box(q('.hm-founder')),
      star:box(q('#dsStar')), starOn:q('#dsStar').classList.contains('on'),
      starPhotoShown: !!q('#dsStar img'),
      shelves:box(q('.hm-shelves')),
      dividers, starHdText: starHd?starHd.textContent.replace(/\s+/g,' ').trim():null,
      hiwGone: !q('.hm-hiw') && !q('.hiw-row') && !q('.hiw-n'),
      page:Math.round(document.documentElement.scrollHeight),
      sideways:Math.round(document.documentElement.scrollWidth-window.innerWidth),
      framedL: q('#dsStar .dss-wrap').getBoundingClientRect().left - 7,  // -7 = the frame's own spread
      founderL: q('.hm-founder').getBoundingClientRect().left,
    };
  });
  const FOLD=700;
  console.log(`\n--- ${w}px ---  page ${m.page}px`);
  console.log(`  quiz CTA y=${m.cta.top} | line y=${m.line.top} (${m.line.lines} line${m.line.lines>1?'s':''}) | founder y=${m.founder.top} | STAR y=${m.star.top}`);
  console.log(`  star visible above a ${FOLD}px fold: ${m.star.top<FOLD?Math.min(FOLD-m.star.top,m.star.h)+'px':'NONE'}`);
  console.log(`  dividers on the page: ${JSON.stringify(m.dividers)} + star header "${m.starHdText}"`);
  ok(m.hiwGone, `${w}: the 1-2-3 block is really gone`);
  ok(m.line.text==='12 quick questions. No wrong answers.', `${w}: her sentence, verbatim`);
  ok(m.line.size>=13, `${w}: line is >=13px (not shrunk to force one line) — got ${m.line.size}`);
  ok(m.line.style==='normal', `${w}: upright, not italic`);
  ok(m.line.lines === (w>=360?1:2), `${w}: expected ${w>=360?1:2} line(s), got ${m.line.lines}`);
  ok(m.line.top>m.cta.top && m.line.top<m.founder.top, `${w}: line sits between the quiz button and the founder line`);
  ok(m.cta.top<FOLD, `${w}: the quiz CTA is still the first thing, above the fold`);
  ok(m.starOn && m.starPhotoShown, `${w}: the Star still renders, with its photo`);
  ok(m.star.top<FOLD, `${w}: a real garment now reaches the first screen (top ${m.star.top})`);
  ok(m.star.top<m.shelves.top, `${w}: Star still sits above the explore cards`);
  ok(m.dividers.length===1 && m.dividers[0]==='Or Explore', `${w}: exactly ONE gold divider label left besides the Star's own — got ${JSON.stringify(m.dividers)}`);
  ok(m.sideways<=0, `${w}: no sideways overflow (got ${m.sideways})`);
  ok(Math.abs(m.framedL-m.founderL)<=1.5, `${w}: framed Star edge flush with .hm-founder (${m.framedL.toFixed(1)} vs ${m.founderL.toFixed(1)})`);
  ok(errs.length===0, `${w}: zero JS errors — ${errs.join('|')}`);
  if(w===390) await pg.screenshot({path:'scratchpad/disco-built.png',fullPage:true});
  await pg.close();
}
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
