/* ⭐ THE STAR CARD'S GOLD LEAF FRAME (her pick "E", 2026-08-20).
   Two guarantees, both of which she caught by eye in round one and neither of
   which any existing suite covered:
   1. the framed OUTER edge is FLUSH with the two mirrors at every width, and
   2. the gold is a GRADIENT, never a flat antique gold (the brown trap).
   Plus the one that made the frame affordable at all: it costs ZERO height, so
   Shop it and Save still clear a real 390x844 fold. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import vm from 'vm';
const ROOT='/home/user/stylestar-app';
let pass=0,fail=0;
const ok=(m,c,x='')=>{c?pass++:fail++;console.log((c?'  ok  ':'FAIL  ')+m+(c?'':'   << '+x));};
const src=fs.readFileSync(ROOT+'/index.html','utf8');

/* ---------- PART 1 · static ---------- */
[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1])
  .forEach((b,i)=>{let e=null;try{new vm.Script(b);}catch(err){e=err.message;}
    ok(`script block ${i+1} parses`,!e,e||'');});

const rule=(src.match(/\.wks-card::before\{[\s\S]*?\}/)||[''])[0];
ok('the frame rule exists', !!rule);
ok('drawn at inset:-7px (zero height cost)', /inset:-7px/.test(rule));
ok('it is a GRADIENT, not a flat fill', /linear-gradient/.test(rule), rule.slice(0,90));
ok('NO antique gold anywhere in the frame (the brown trap)',
   !/#CFA02E|#8a6a14|#C89A2C|#A0761B/i.test(rule), rule);
ok('every gold in the frame is from the bright family',
   ['#FEEF98','#F6CE3E','#E4B02E','#F3DC8B'].every(c=>rule.includes(c)));
ok('sits BEHIND the paper (negative z)', /z-index:-1/.test(rule));
ok('the stacking context is on the PARENT, not the card',
   /#wbStar\{[^}]*z-index:0/.test(src) && !/\.wks-card\{[^}]*z-index:0/.test(src));
ok('the margin matches the frame thickness (7px), so the edges line up',
   /#wbStar\{[^}]*margin:12px 7px 2px/.test(src),
   (src.match(/#wbStar\{[^}]*\}/)||[''])[0]);
ok('the alignment rule is written at the code', /THIS MARGIN CHANGES WITH/.test(src));
ok('the never-flatten rule is written at the code', /NEVER flatten it/.test(src));

/* ---------- PART 2 · live ---------- */
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];

for(const w of [390,375,360,320]){
  const pg=await b.newPage({viewport:{width:w,height:844}});
  pg.on('pageerror',e=>errs.push(w+': '+e.message));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(900);
  await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());
    window.WB_MSGS=[WB_MSGS[0]];show('s-wb');});
  await pg.waitForTimeout(500);
  const m=await pg.evaluate(()=>{
    const c=document.querySelector('.wks-card'), g=document.querySelector('.wb-greet'),
          a=document.querySelector('.wb-acts'), d=document.querySelector('.wks-disc'),
          bf=getComputedStyle(document.querySelector('.wks-card'),'::before');
    const spread=Math.abs(parseFloat(bf.left)||0);
    const cb=c.getBoundingClientRect();
    return {outerL:Math.round((cb.left-spread)*10)/10, outerR:Math.round((cb.right+spread)*10)/10,
      greetL:Math.round(g.getBoundingClientRect().left*10)/10,
      greetR:Math.round(g.getBoundingClientRect().right*10)/10,
      actsL:Math.round(a.getBoundingClientRect().left*10)/10,
      actsR:Math.round(a.getBoundingClientRect().right*10)/10,
      frameGrad:bf.backgroundImage, framePainted:bf.content!=='none',
      discGap:Math.round(d.getBoundingClientRect().top-(cb.bottom+spread)),
      scroll:Math.round(document.documentElement.scrollWidth), vw:innerWidth};
  });
  ok(`${w}: frame is actually painted`, m.framePainted);
  ok(`${w}: left edge flush with BOTH mirrors`,
     m.outerL===m.greetL && m.outerL===m.actsL, JSON.stringify(m));
  ok(`${w}: right edge flush with BOTH mirrors`,
     m.outerR===m.greetR && m.outerR===m.actsR, JSON.stringify(m));
  ok(`${w}: the gradient really is a gradient at paint time`,
     /gradient/.test(m.frameGrad), m.frameGrad);
  ok(`${w}: the disclosure clears the frame`, m.discGap>=3, 'gap '+m.discGap);
  ok(`${w}: no sideways scroll`, m.scroll<=m.vw, m.scroll+' vs '+m.vw);
  await pg.close();
}

/* the fold: the reason the frame had to cost zero height */
const pg=await b.newPage({viewport:{width:390,height:844}});
pg.on('pageerror',e=>errs.push('fold: '+e.message));
await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(900);
await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());
  window.WB_MSGS=[WB_MSGS[0]];show('s-wb');});
await pg.waitForTimeout(500);
const fold=await pg.evaluate(()=>{
  const r=s=>Math.round(document.querySelector(s).getBoundingClientRect().bottom);
  return {shop:r('.wks-shop'), save:r('#wbStar .wl-save'), note:r('.wks-note'), px:r('.wks-px')};
});
ok('Shop it clears a real 700px fold', fold.shop<=700, JSON.stringify(fold));
ok('Save clears a real 700px fold', fold.save<=700, JSON.stringify(fold));
ok('the frame did not cost height (better than the 697 it replaced)',
   fold.save<=697, JSON.stringify(fold));
await pg.close();
ok('zero JS errors', errs.length===0, errs.join(' | '));

await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
