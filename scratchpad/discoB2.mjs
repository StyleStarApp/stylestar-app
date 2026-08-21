import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { starPhoto } from './starphoto.mjs';
const ROOT=path.resolve('.'); const PORT=8961;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const photo=starPhoto();
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const w of [390,375,360,320]){
  const pg=await b.newPage({viewport:{width:w,height:844},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(500);
  const m=await pg.evaluate(()=>{
    document.querySelector('.hm-hiw').remove();
    const cta=document.querySelector('.hm-cta');
    const p=document.createElement('p'); p.id='hiwLine';
    p.style.cssText="font:400 13.5px/1.6 'Jost',sans-serif;color:#5f5647;text-align:center;margin:11px 14px 0;letter-spacing:.01em";
    p.textContent='12 quick questions. No wrong answers.';
    cta.parentNode.insertBefore(p,cta.nextSibling);
    // count real lines by clustering range-rect tops within 6px
    const r=document.createRange(); r.selectNodeContents(p);
    const tops=[...r.getClientRects()].map(x=>Math.round(x.top));
    const uniq=[]; tops.forEach(t=>{if(!uniq.some(u=>Math.abs(u-t)<6))uniq.push(t)});
    const star=document.getElementById('dsStar').getBoundingClientRect();
    const body=document.body.getBoundingClientRect();
    return {lines:uniq.length, textW:Math.round(p.getBoundingClientRect().width),
      starTop:Math.round(star.top+scrollY), page:Math.round(document.documentElement.scrollHeight),
      overflow: Math.round(document.documentElement.scrollWidth-window.innerWidth)};
  });
  console.log(`${w}px  line-count=${m.lines}  starTop=${m.starTop}  page=${m.page}  sideways-overflow=${m.overflow}`);
  if(w===390) await pg.screenshot({path:'scratchpad/disco-B2.png',fullPage:true});
  await pg.close();
}
await b.close(); srv.close();
