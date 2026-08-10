const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0; const ok=(c,m)=>{c?(pass++,console.log('  ok  '+m)):(fail++,console.log('  FAIL '+m))};
for(const w of [390,375,360]){
  const page=await browser.newPage({viewport:{width:w,height:820},deviceScaleFactor:2});
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto(base+'/',{waitUntil:'load'});
  await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
  await page.reload({waitUntil:'load'});await page.waitForTimeout(2600);
  console.log(`\n--- Your Wishlist @ ${w} ---`);
  const r=await page.evaluate(async()=>{
    openWishlist(); await new Promise(r=>setTimeout(r,700));
    const card=document.querySelector('.ss'), cs=getComputedStyle(card);
    const before=getComputedStyle(card,'::before');
    const heart=document.querySelector('#s-wishlist .wl-crownheart path:nth-of-type(2)');
    const btn=document.querySelector('#s-wishlist .we-addlnk'), span=btn.querySelector('.wab-t');
    const avail=Math.floor(btn.parentElement.getBoundingClientRect().width);
    const c=span.cloneNode(true); c.style.cssText='position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
    c.style.font=getComputedStyle(span).font; c.style.letterSpacing=getComputedStyle(span).letterSpacing;
    document.body.appendChild(c); const need=Math.ceil(c.getBoundingClientRect().width)+18; c.remove();
    const rg=document.createRange(); rg.selectNodeContents(span);
    const lines=[...new Set([...rg.getClientRects()].map(x=>Math.round(x.top)))].length;
    const cr=card.getBoundingClientRect(), br=btn.getBoundingClientRect();
    const heartStroke=document.querySelector('#s-wishlist .wl-crownheart path:nth-of-type(1)');
    return {bw:cs.borderTopWidth,bc:cs.borderTopColor,beforeDisplay:before.display,
      shadow:cs.boxShadow,
      heartStroke:heartStroke?heartStroke.getAttribute('stroke'):null,
      heartFill:heart?heart.getAttribute('fill'):null,
      bleed:getComputedStyle(document.body).backgroundColor,
      avail,need,head:avail-need,lines,
      inside:br.left>=cr.left-0.5&&br.right<=cr.right+0.5,
      over:document.documentElement.scrollWidth>window.innerWidth};
  });
  ok(r.bw==='11px',`frame is 11px total (${r.bw})`);
  ok(r.bc==='rgb(254, 246, 214)',`frame is the crown heart's pale yellow (${r.bc})`);
  ok(r.heartFill==='#FEF6D6','...which is the exact fill of the big heart');
  ok(r.beforeDisplay==='none','the brown gilt band is gone');
  // Her pick (2026-08-10): a gold hairline on BOTH edges, because the pale band
  // alone dissolved into the paper. Both rings must survive, and the colour must
  // stay the crown heart's own outline -- that is the whole point of the choice.
  const rings=(r.shadow.match(/rgb\(200, 154, 44\)/g)||[]).length;
  ok(rings===2,`gold hairline on both edges (${rings} rings)`);
  ok(/inset/.test(r.shadow),'...one of them inset, so the inner edge reads against the paper');
  ok(r.heartStroke==='#C89A2C','...in the crown heart\'s own outline gold');
  ok(/44px/.test(r.shadow),'the card\'s drop shadow survived the box-shadow rewrite');
  ok(r.bleed==='rgb(26, 26, 26)','black velvet behind it is untouched');
  ok(r.inside&&!r.over,'nothing overflows');
  if(w>=390) ok(r.lines===1,`wishing button holds one line (${r.avail} avail / ${r.need} need, headroom ${r.head}px)`);
  else ok(r.lines<=2,`wraps to two balanced lines at ${w} as before (headroom ${r.head}px)`);
  ok(errs.length===0,'zero JS errors');
  if(w===390) await page.screenshot({path:path.join(ROOT,'scratchpad','wlframe.png'),clip:{x:0,y:0,width:w,height:760}});
  await page.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();server.close();process.exit(fail?1:0);
