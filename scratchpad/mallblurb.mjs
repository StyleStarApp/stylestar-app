// Measure how HER three Mall blurbs (2026-08-25) wrap, with the REAL typefaces.
// ⚠️ Line counting clusters rect tops within 6px -- getClientRects returns a rect
// per text box AND per element, so exact-top matching invents phantom lines
// (the documented 2026-08-11 trap).
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('.'), PORT = 8963;
const T = { '.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2' };
const srv = http.createServer((q,r)=>{ let p=decodeURIComponent(q.url.split('?')[0]);
  if(p==='/')p='/index.html'; const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(PORT,r));
const css = fs.readFileSync('scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const TARGETS = ['FARM Rio','Diane von Furstenberg','Olivela','Nordstrom','Saks Fifth Avenue'];
let fails=0, checks=0;
const ok=(n,c,x)=>{checks++;console.log((c?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''));if(!c)fails++;};
for (const w of [430,390,375,360,320]) {
  const pg = await b.newPage({ viewport:{width:w,height:900} });
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
  await pg.route('**/fonts.googleapis.com/**', r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{ await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.evaluate(()=>showShop()); await pg.waitForTimeout(500);
  const out = await pg.evaluate((TARGETS)=>{
    const lines = el => { const r=document.createRange(); const tops=[];
      el.childNodes.forEach(n=>{ if(n.nodeType!==3)return;
        for(let i=0;i<n.textContent.length;i++){ r.setStart(n,i); r.setEnd(n,i+1);
          const t=r.getBoundingClientRect().top; if(!tops.some(x=>Math.abs(x-t)<6))tops.push(t); } });
      return tops.length; };
    const rows=[]; let overflow=0;
    document.querySelectorAll('.mall-card').forEach(card=>{
      const name=card.querySelector('.mall-store').textContent;
      const d=card.querySelector('.mall-desc');
      const cr=card.getBoundingClientRect(), dr=d.getBoundingClientRect();
      if(dr.right>cr.right+0.5||dr.left<cr.left-0.5)overflow++;
      if(TARGETS.includes(name)) rows.push({name,text:d.textContent,lines:lines(d),
        w:Math.round(dr.width),h:Math.round(dr.height)});
    });
    const doc=document.documentElement;
    return {rows,overflow,sideScroll:doc.scrollWidth>doc.clientWidth+1,
            fontReal:getComputedStyle(document.querySelector('.mall-desc')).fontFamily};
  }, TARGETS);
  console.log('\n--- '+w+'px  (desc font: '+out.fontReal.split(',')[0]+') ---');
  out.rows.forEach(r=>console.log(`  ${r.lines} line(s)  ${String(r.w).padStart(3)}px box  ${r.name}: "${r.text}"`));
  ok(w+': no blurb overflows its own card', out.overflow===0, 'overflowing='+out.overflow);
  ok(w+': no sideways page scroll', !out.sideScroll);
  ok(w+': zero JS errors', errs.length===0, errs[0]||'');
  await pg.close();
}
await b.close(); srv.close();
console.log(`\n${checks} checks, ${fails} failures`);
process.exit(fails?1:0);
