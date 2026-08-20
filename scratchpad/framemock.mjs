/* Frame around the white Star card — her ask, 2026-08-20 night, parked by her.
   Renders the REAL Welcome Back screen at a REAL 390x844 iPhone viewport so the
   fold is honest, with the real typefaces and the real scarf photo served
   locally (this sandbox's Chromium cannot reach retail CDNs).
   Every option is drawn with box-shadow, never a second border, so the frame
   costs ZERO height — the fold stays exactly where it is. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app', PORT=8952;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');

/* The four looks. Each replaces .wks-card's box-shadow only; the 1px #D8A52E
   border and the white paper are untouched in all of them. */
const OPTS={
  current:'',
  a:`.wks-card{box-shadow:0 0 0 4px #fff,0 0 0 5px #C89A2C,0 6px 16px rgba(0,0,0,.34)!important}`,
  b:`.wks-card{box-shadow:0 0 0 8px #D8DDE2,0 0 0 9px #7c828a,0 14px 20px -8px rgba(0,0,0,.6)!important}`,
  c:`.wks-card{box-shadow:0 0 0 1px #F7E4A6,0 0 0 6px #CFA02E,0 0 0 7px #8a6a14,0 8px 18px rgba(0,0,0,.42)!important}`,
  d:`.wks-card{box-shadow:0 0 0 9px #1a1a1a,0 0 0 10px #C99A2C,0 10px 20px rgba(0,0,0,.5)!important}`
};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [k,extra] of Object.entries(OPTS)){
  const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());show('s-wb');});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(1100);
  if(extra)await pg.addStyleTag({content:extra});
  await pg.waitForTimeout(300);
  const m=await pg.evaluate(()=>{
    const c=document.querySelector('.wks-card'),s=document.querySelector('.wks-shop'),
          sv=document.querySelector('#wbStar .wl-save'),px=document.querySelector('.wks-px');
    const r=e=>e?e.getBoundingClientRect():null;
    return{card:r(c)&&Math.round(r(c).height),shopBottom:r(s)&&Math.round(r(s).bottom),
      saveBottom:r(sv)&&Math.round(r(sv).bottom),photoOk:px?px.naturalWidth>0:false,
      cardTop:r(c)&&Math.round(r(c).top),cardW:r(c)&&Math.round(r(c).width),
      docScroll:Math.round(document.documentElement.scrollWidth)};
  });
  console.log(k.padEnd(8),JSON.stringify(m));
  await pg.screenshot({path:`scratchpad/frame-${k}.png`});
  await pg.close();
}
await b.close(); srv.close();
