// Audit the Discovery page (s-wel): what a stranger actually reads, in order,
// with real heights measured against a real iPhone fold.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { starPhoto } from './starphoto.mjs';
const ROOT = path.resolve('.'); const PORT = 8952;
const srv = http.createServer((q,r)=>{ let p=decodeURIComponent(q.url.split('?')[0]);
  if(p==='/')p='/index.html'; const f=path.join(ROOT,p);
  const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(PORT,r));
const css = fs.readFileSync('scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for (const w of [390,320]) {
  const pg = await b.newPage({viewport:{width:w,height:844},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:starPhoto()}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{ await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(600);
  const out = await pg.evaluate(()=>{
    const sel = [
      ['hero star','.hm-star-wrap'],
      ['H1','.hm-h1'],
      ['sub','.hm-sub'],
      ['body line','.hm-body'],
      ['QUIZ CTA','.hm-cta'],
      ['founder line','.hm-founder'],
      ['How It Works','.hm-hiw'],
      ['STAR of the week','#dsStar'],
      ['restore links','#restoreSection'],
      ['"Or Explore" divider','#s-wel .hm-divwrap:last-of-type'],
      ['3 explore cards','.hm-shelves'],
      ['footer','#s-wel .hm-foot'],
    ];
    const doc=document.documentElement;
    const rows = sel.map(([n,s])=>{
      const e=document.querySelector(s); if(!e) return {n,missing:true};
      const r=e.getBoundingClientRect();
      const top=Math.round(r.top+window.scrollY);
      return {n, top, h:Math.round(r.height), bottom:Math.round(r.top+window.scrollY+r.height)};
    });
    return {rows, pageH: Math.round(doc.scrollHeight), vw:window.innerWidth};
  });
  console.log(`\n===== ${w}px  (page is ${out.pageH}px tall = ${(out.pageH/700).toFixed(1)} iPhone screens) =====`);
  console.log('section'.padEnd(24),'top'.padStart(6),'height'.padStart(7),'  fold');
  for(const r of out.rows){
    if(r.missing){console.log(r.n.padEnd(24),'   MISSING');continue;}
    const fold = r.top<700 ? (r.bottom<=700?'above fold':'STRADDLES fold') : `screen ${Math.floor(r.top/700)+1}`;
    console.log(r.n.padEnd(24),String(r.top).padStart(6),String(r.h).padStart(7),'  '+fold);
  }
  if(w===390){
    await pg.screenshot({path:'scratchpad/disco-current-full.png', fullPage:true});
    await pg.screenshot({path:'scratchpad/disco-current-fold.png'});
  }
  await pg.close();
}
await b.close(); srv.close();
