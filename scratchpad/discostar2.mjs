/* Round 2, her calls on the option-C render (2026-08-21):
     "let's go with C, but make the photo a little smaller, not as small as the
      thumbnail, but smaller... keep the gold frame but for consistency make the
      background card white, same as we changed it on the welcome back page."
   So: white paper (#fff, matching .wks-card since 2026-08-20), gold leaf frame
   kept, and three photo step-downs from the front door's own 140px for her pick.
   ⚠️ The welcome mirror's paper is #FBFAF7 — near-white — so a WHITE card has
   almost no value contrast against it. The gold leaf frame is what has to carry
   the definition here; this render is what proves whether it does. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app';
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');

const CSS=w=>`
.ds{margin:18px auto 0;max-width:306px}
.ds-hd{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 0 9px}
.ds-hd .hair{height:1px;width:26px}
.ds-hd .hair.l{background:linear-gradient(90deg,transparent,#C9A24E)}
.ds-hd .hair.r{background:linear-gradient(270deg,transparent,#C9A24E)}
.ds-hd b{font:600 11px/1 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#BC9022;white-space:nowrap}
.ds-hd svg{width:13px;height:13px;flex:0 0 auto}
.ds .wrap{position:relative;z-index:0;margin:0 7px}
/* WHITE, her call — same as .wks-card on Welcome Back since 2026-08-20 */
.ds .card{background:#fff;border:1px solid #D8A52E;padding:13px 15px 12px;text-align:center;position:relative;
  box-shadow:0 3px 10px rgba(0,0,0,.16)}
.ds .card::before{content:'';position:absolute;inset:-7px;z-index:-1;
  background:linear-gradient(150deg,#FEEF98 0%,#F6CE3E 46%,#E4B02E 78%,#F3DC8B 100%);
  box-shadow:0 6px 14px rgba(0,0,0,.24)}
.ds .px{display:block;width:${w}px;max-width:100%;aspect-ratio:3/4;object-fit:cover;object-position:top center;
  margin:9px auto 2px;border:1px solid #E4D3A8;border-radius:2px;background:#F5EFE2}
.ds .nm{font-family:'DM Serif Display',serif;font-size:16.5px;line-height:1.25;color:#1a1a1a;margin:7px 0 3px;text-wrap:balance}
.ds .mt{font:600 10px/1.5 'Jost',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#5f5647}
.ds .note{font:400 14px/1.5 'Lora',Georgia,serif;color:#4a463e;margin-top:7px;text-wrap:balance}
.ds .note svg{width:11px;height:11px;fill:#F49AC1;transform:rotate(12deg);display:inline-block;vertical-align:-1px}
.ds .shop{display:inline-flex;align-items:center;gap:6px;background:#1a1a1a;color:#F2D889;border:1px solid #C99A2C;
  border-radius:999px;padding:8px 18px;margin-top:10px;font:600 12px/1 'Jost',sans-serif;letter-spacing:.07em;text-decoration:none}
.ds-disc{font:400 10px/1.4 'Jost',sans-serif;color:#8a8474;text-align:center;margin-top:12px}
`;

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const out={}; const errs=[];
for(const w of [390,360]){
 for(const px of [110,96,84]){
  if(w===360&&px!==96) continue;                       // her pick gets the narrow check after
  const pg=await b.newPage({viewport:{width:w,height:1500},deviceScaleFactor:2});
  pg.on('pageerror',e=>errs.push(w+'/'+px+': '+e.message));
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2200);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();
    document.querySelectorAll('*').forEach(e=>{e.style.animation='none'});});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  const m=await pg.evaluate(({CSS})=>{
    const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    const S=_weekStar(); const pxu=(S.px&&_affMid(S.url))?S.px:'';
    const STAR='<svg viewBox="0 0 24 24"><path d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z" fill="#E0B84C" stroke="#C89A2C" stroke-width="0.6"/></svg>';
    const HEART='<svg viewBox="0 0 24 24"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
    const d=document.createElement('div');
    d.innerHTML='<div class="ds" id="dsC">'
      +'<div class="ds-hd"><span class="hair l"></span>'+STAR+'<b>Star of the Week</b>'+STAR+'<span class="hair r"></span></div>'
      +'<div class="wrap"><div class="card">'+(pxu?'<img class="px" src="'+pxu+'">':'')
      +'<div class="nm">'+S.n+'</div><div class="mt">'+S.store+' &middot; '+S.price+'</div>'
      +'<div class="note">'+S.note+' '+HEART+'</div>'
      +'<a class="shop">Shop it &rarr;</a></div></div>'
      +'<div class="ds-disc">Some links may earn a commission.</div></div>';
    document.querySelector('#s-wel .hm-hiw').after(d.firstChild);
    const R=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();
      return {top:Math.round(r.top+scrollY),bot:Math.round(r.bottom+scrollY),h:Math.round(r.height),
        l:Math.round(r.left),r:Math.round(r.right)};};
    // contrast of the white card against the mirror paper behind it
    const paper=getComputedStyle(document.querySelector('#s-wel .hm-mirror')).backgroundColor;
    return {star:R('#dsC'), card:R('#dsC .card'), mirror:R('#s-wel .hm-mirror'),
      restore:R('#restoreSection'), paper,
      overflow:document.documentElement.scrollWidth>window.innerWidth};
  },{CSS:CSS(px)});
  out[w+'/px'+px]=m;
  await pg.screenshot({path:`scratchpad/discoC-${px}-${w}.png`,clip:{x:0,y:0,width:w,height:Math.min(1500,m.star.bot+80)}});
  await pg.close();
 }
}
console.log(JSON.stringify(out,null,1)); console.log('JS errors:',errs);
srv.close(); await b.close();
