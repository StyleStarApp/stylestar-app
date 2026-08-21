// Discovery page: her question — is How It Works needed, and where does the
// Star belong? Variants are made by manipulating the REAL page, so every
// render is the real thing, not a mockup.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { starPhoto } from './starphoto.mjs';
const ROOT = path.resolve('.'); const PORT = 8957;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{ let p=decodeURIComponent(q.url.split('?')[0]);
  if(p==='/')p='/index.html'; const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(PORT,r));
const css = fs.readFileSync('scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const photo = starPhoto();

const VARIANTS = [
  ['current',  'CURRENT — quiz, founder, How It Works, Star, explore'],
  ['nohiw',    'A — How It Works removed. Star rises onto the first screen.'],
  ['hiwline',  'B — How It Works becomes ONE quiet line under the quiz button.'],
  ['starup',   'C — Star moves ABOVE How It Works (proof before instructions).'],
  ['starbot',  'D — Star moves to the VERY BOTTOM, under the explore cards.'],
];

const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const report = [];
for (const [key,label] of VARIANTS) {
  const pg = await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{ await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(500);
  await pg.evaluate((k)=>{
    const hiw=document.querySelector('.hm-hiw');
    const star=document.getElementById('dsStar');
    const cta=document.querySelector('.hm-cta');
    const shelves=document.querySelector('.hm-shelves');
    if(k==='nohiw'){ hiw.remove(); }
    if(k==='hiwline'){
      hiw.remove();
      const p=document.createElement('p');
      p.style.cssText="font:400 13.5px/1.6 'Jost',sans-serif;color:#5f5647;text-align:center;margin:10px 18px 0;letter-spacing:.01em";
      p.innerHTML="12 quick questions &middot; your Style Portrait &middot; then shop your style";
      cta.parentNode.insertBefore(p, cta.nextSibling);
    }
    if(k==='starup'){ hiw.parentNode.insertBefore(star, hiw); }
    if(k==='starbot'){ shelves.parentNode.insertBefore(star, shelves.nextSibling); }
  }, key);
  await pg.waitForTimeout(400);
  const m = await pg.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s); if(!e)return null;
      const r=e.getBoundingClientRect(); return {top:Math.round(r.top+scrollY),h:Math.round(r.height)};};
    return {page:Math.round(document.documentElement.scrollHeight),
      cta:g('.hm-cta'), star:g('#dsStar'), shelves:g('.hm-shelves')};
  });
  report.push({key,label,...m});
  await pg.screenshot({path:`scratchpad/disco-${key}.png`, fullPage:true});
  await pg.close();
}
await b.close(); srv.close();
console.log('\nvariant     page   quizCTA   STAR top   star visible on 1st screen?   explore cards');
for(const r of report){
  const vis = r.star && r.star.top<700 ? `YES — ${Math.min(700-r.star.top,r.star.h)}px of it` : 'no';
  console.log(r.key.padEnd(11), String(r.page).padStart(5), String(r.cta.top).padStart(8),
    String(r.star.top).padStart(10), '  '+vis.padEnd(28), String(r.shelves.top).padStart(6));
}
