/* ── scratchpad/thumbmock.mjs ────────────────────────────────────────────────
   Her ask 2026-08-23: "the Style Card should show bigger on the Style Portrait
   page." Renders the real row at candidate thumbnail sizes, and MEASURES what
   the row can actually take before anything is chosen.

   ⚠️ The card image inside the row is drawn by the app itself, so this renders
   with the real fonts (the card measures text to fit) and with the real card,
   not a placeholder rectangle. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8978;
const srv=http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]); if(u==='/')u='/index.html';
  const f=path.join(ROOT,u.replace(/^\//,''));
  fs.readFile(f,(e,b)=>{ if(e){res.writeHead(404);res.end();return}
    const m={'.html':'text/html','.png':'image/png','.json':'application/json','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'}[path.extname(f)];
    res.writeHead(200,{'Content-Type':m||'application/octet-stream'});res.end(b)});
});
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});
  const page=await ctx.newPage();
  await page.route('https://fonts.googleapis.com/**',async r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')}));
  await page.route('https://fonts.googleapis.com/*.woff2',async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)})});
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1400);

  // drive the REAL portrait screen the way rnfinal.js does: seed, show, open the doors
  await page.evaluate(async()=>{
    userName='Catherine';
    topArchNames=['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'];
    userMotto="Catherine, you don't follow the moment, you are the moment.";
    const rp=document.getElementById('rp');
    if(rp)rp.textContent='You are the woman other people watch to see what is next.';
    show('s-res'); document.getElementById('s-res').classList.add('rv-open');
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    document.getElementById('scThumb').src=URL.createObjectURL(blob);
  });
  await page.waitForTimeout(900);

  // ── what can the row actually take? ────────────────────────────────────────
  const room=await page.evaluate(()=>{
    const row=document.querySelector('.sc-row'), th=row.querySelector('.sc-thumb');
    const tx=row.querySelector('.tx'), ar=row.querySelector('.sc-ar');
    const cs=getComputedStyle(row);
    const c=document.createElement('canvas').getContext('2d');
    c.font=getComputedStyle(row.querySelector('.sc-tt')).font;
    const titleW=Math.max(c.measureText('See & share your').width,c.measureText('Style Star Card').width);
    c.font=getComputedStyle(row.querySelector('.sc-ss')).font;
    return {rowW:row.getBoundingClientRect().width, thumbW:th.getBoundingClientRect().width,
      thumbH:th.getBoundingClientRect().height, txW:tx.getBoundingClientRect().width,
      arW:ar.getBoundingClientRect().width, gap:parseFloat(cs.gap)||0,
      padX:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),
      titleNeeds:titleW, subLines:new Set(Array.from(
        (()=>{const r=document.createRange();r.selectNodeContents(row.querySelector('.sc-ss'));return r.getClientRects()})()
      ).map(r=>Math.round(r.top))).size};
  });
  console.log('ROW  width',room.rowW.toFixed(1),' thumb',room.thumbW+'x'+room.thumbH.toFixed(0),
    ' text col',room.txW.toFixed(1),' arrow',room.arW,' gap',room.gap,' pad',room.padX);
  console.log('TITLE "Style Star Card" needs',room.titleNeeds.toFixed(1),
    'px  -> the widest thumb that leaves the title unwrapped =',
    (room.rowW-room.padX-room.gap*2-room.arW-3-room.titleNeeds).toFixed(1)+'px');
  console.log('sub line count now:',room.subLines);

  for(const w of [88,112,132,152]){
    await page.evaluate(W=>{
      const th=document.querySelector('.sc-thumb'); th.style.width=W+'px';
    },w);
    await page.waitForTimeout(250);
    const m=await page.evaluate(()=>{
      const row=document.querySelector('.sc-row');
      const tt=row.querySelector('.sc-tt'),ss=row.querySelector('.sc-ss');
      const lines=el=>{const r=document.createRange();r.selectNodeContents(el);
        return new Set(Array.from(r.getClientRects()).map(x=>Math.round(x.top))).size};
      const card=document.querySelector('.pcard').getBoundingClientRect();
      const rr=row.getBoundingClientRect();
      return {h:rr.height.toFixed(0),tt:lines(tt),ss:lines(ss),
        over:(rr.right-card.right).toFixed(1)};
    });
    console.log(`  ${String(w).padStart(3)}px -> row ${m.h}px tall · title ${m.tt} lines · sub ${m.ss} lines · overflow ${m.over}px`);
    await page.locator('.pcard').screenshot({path:'scratchpad/thumb-'+w+'.png'});
  }
  await b.close();srv.close();
})();
/* ▶ THE CEILING THIS HARNESS FOUND, and it is the reason a fourth option
   exists at all: 134px is the widest thumbnail that leaves "Style Star Card"
   on one line. Past it the title breaks and the row goes to FOUR lines, so
   132 is as big as the side-by-side layout gets. If she wants bigger than
   that, the layout has to change - see scratchpad/thumbhero.mjs, which
   renders the card as the panel's hero with the words beneath it. */
