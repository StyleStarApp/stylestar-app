const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8964;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const w of [390,360]){
  const pg=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.evaluate(()=>showShop()); await pg.waitForTimeout(500);
  // report row height spread per group
  const spread=await pg.evaluate(()=>{const o=[];
    document.querySelectorAll('.mall-grid').forEach((g,i)=>{
      const hs=[...g.querySelectorAll('.mall-card')].map(c=>Math.round(c.getBoundingClientRect().height));
      o.push({grid:i,heights:hs,spread:Math.max(...hs)-Math.min(...hs)});});
    return o;});
  console.log(w+'px card-height spread per group:'); spread.forEach(s=>console.log('   grid '+s.grid+': '+s.heights.join(', ')+'   spread '+s.spread+'px'));
  const el=await pg.$('#mallContent');
  await el.screenshot({path:`scratchpad/mallblurb-${w}.png`});
  await pg.close();
}
await b.close(); srv.close(); console.log('shot done');
