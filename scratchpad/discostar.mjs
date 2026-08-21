/* Her idea, 2026-08-21: let a FIRST-TIME visitor peek at the Star of the Week
   on the Discovery page. Renders three options for her pick + measures the fold.
   ⚠️ The welcome mirror's paper is #FBFAF7 (near-white linen), so the Welcome
   Back card's WHITE paper would nearly vanish here — every option below is
   re-skinned for light paper rather than copied across. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app';
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,r));               // ⚠️ resolve must be the CALLBACK
const PORT=srv.address().port;
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');

const CSS=`
/* shared */
.ds{margin:18px auto 0;max-width:298px}
.ds-hd{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 0 9px}
.ds-hd .hair{height:1px;width:26px}
.ds-hd .hair.l{background:linear-gradient(90deg,transparent,#C9A24E)}
.ds-hd .hair.r{background:linear-gradient(270deg,transparent,#C9A24E)}
.ds-hd b{font:600 11px/1 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#BC9022;white-space:nowrap}
.ds-hd svg{width:13px;height:13px;flex:0 0 auto}

/* A — THUMBNAIL ROW: her own word. The shelf-card language already on this
   screen, so it reads as one more door rather than a new device. */
#dsA .row{display:flex;align-items:center;gap:11px;background:#F5EFE2;border:1px solid #D8C285;
  padding:9px 11px 9px 9px;text-align:left}
#dsA .px{width:54px;height:68px;object-fit:cover;flex:0 0 auto;border:1px solid #D8C285;background:#fff}
#dsA .tx{flex:1;min-width:0}
#dsA .nm{font-family:'DM Serif Display',serif;font-size:14.5px;line-height:1.2;color:#1a1a1a}
#dsA .mt{font:600 9.5px/1.5 'Jost',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#5f5647;margin-top:3px}
#dsA .arr{flex:0 0 auto;color:#26221c}

/* B — TEASER CARD: photo leads, name + price under it, one quiet action.
   No note, so it stays a PEEK rather than the whole card. */
#dsB .card{background:#F5EFE2;border:1px solid #D8C285;padding:12px 14px 13px;text-align:center}
#dsB .px{display:block;width:112px;height:140px;object-fit:cover;margin:0 auto 9px;border:1px solid #D8C285;background:#fff}
#dsB .nm{font-family:'DM Serif Display',serif;font-size:16px;line-height:1.25;color:#1a1a1a;text-wrap:balance}
#dsB .mt{font:600 10px/1.5 'Jost',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#5f5647;margin-top:4px}
#dsB .shop{display:inline-flex;align-items:center;gap:6px;background:#1a1a1a;color:#F2D889;border:1px solid #C99A2C;
  border-radius:999px;padding:8px 17px;margin-top:10px;font:600 12px/1 'Jost',sans-serif;letter-spacing:.07em;text-decoration:none}

/* C — THE FULL CARD: the front door's own Star, re-skinned for light paper
   (cream, not white) and keeping her note + the gold leaf frame. */
#dsC{max-width:306px}
#dsC .wrap{position:relative;z-index:0;margin:0 7px}
#dsC .card{background:#FBF6E9;border:1px solid #D8A52E;padding:13px 15px 12px;text-align:center;position:relative;
  box-shadow:0 3px 10px rgba(0,0,0,.14)}
#dsC .card::before{content:'';position:absolute;inset:-7px;z-index:-1;
  background:linear-gradient(150deg,#FEEF98 0%,#F6CE3E 46%,#E4B02E 78%,#F3DC8B 100%);
  box-shadow:0 6px 14px rgba(0,0,0,.22)}
#dsC .px{display:block;width:100%;max-width:118px;height:148px;object-fit:cover;margin:8px auto 0;border:1px solid #E4CE8E;background:#fff}
#dsC .nm{font-family:'DM Serif Display',serif;font-size:16.5px;line-height:1.25;color:#1a1a1a;margin:7px 0 3px;text-wrap:balance}
#dsC .mt{font:600 10px/1.5 'Jost',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#5f5647}
#dsC .note{font:400 14px/1.5 'Lora',Georgia,serif;color:#4a463e;margin-top:7px;text-wrap:balance}
#dsC .note svg{width:11px;height:11px;fill:#F49AC1;transform:rotate(12deg);display:inline-block;vertical-align:-1px}
#dsC .shop{display:inline-flex;align-items:center;gap:6px;background:#1a1a1a;color:#F2D889;border:1px solid #C99A2C;
  border-radius:999px;padding:8px 18px;margin-top:10px;font:600 12px/1 'Jost',sans-serif;letter-spacing:.07em;text-decoration:none}
.ds-disc{font:400 10px/1.4 'Jost',sans-serif;color:#8a8474;text-align:center;margin-top:9px}
`;

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const OPTS=['none','A','B','C'];
const out={};
for(const w of [390,360]){
 for(const opt of OPTS){
  const pg=await b.newPage({viewport:{width:w,height:1400},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();
    document.querySelectorAll('*').forEach(e=>{e.style.animation='none'});});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  const m=await pg.evaluate(({CSS,opt})=>{
    const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    const S=_weekStar(); const px=(S.px&&_affMid(S.url))?S.px:'';
    const STAR='<svg viewBox="0 0 24 24"><path d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z" fill="#E0B84C" stroke="#C89A2C" stroke-width="0.6"/></svg>';
    const HD='<div class="ds-hd"><span class="hair l"></span>'+STAR+'<b>Star of the Week</b>'+STAR+'<span class="hair r"></span></div>';
    const HEART='<svg viewBox="0 0 24 24"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
    const ARR='<svg class="arr" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg>';
    const meta=S.store+(S.price?' &middot; '+S.price:'');
    const H={
      A:'<div class="ds" id="dsA">'+HD+'<div class="row">'+(px?'<img class="px" src="'+px+'">':'')
        +'<div class="tx"><div class="nm">'+S.n+'</div><div class="mt">'+meta+'</div></div>'+ARR+'</div>'
        +'<div class="ds-disc">Some links may earn a commission.</div></div>',
      B:'<div class="ds" id="dsB">'+HD+'<div class="card">'+(px?'<img class="px" src="'+px+'">':'')
        +'<div class="nm">'+S.n+'</div><div class="mt">'+meta+'</div>'
        +'<a class="shop">Shop it &rarr;</a></div>'
        +'<div class="ds-disc">Some links may earn a commission.</div></div>',
      C:'<div class="ds" id="dsC">'+HD+'<div class="wrap"><div class="card">'+(px?'<img class="px" src="'+px+'">':'')
        +'<div class="nm">'+S.n+'</div><div class="mt">'+meta+'</div>'
        +'<div class="note">'+S.note+' '+HEART+'</div>'
        +'<a class="shop">Shop it &rarr;</a></div></div>'
        +'<div class="ds-disc">Some links may earn a commission.</div></div>'
    };
    const hiw=document.querySelector('#s-wel .hm-hiw');
    if(opt!=='none'){const d=document.createElement('div');d.innerHTML=H[opt];hiw.after(d.firstChild);}
    const R=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();
      return {top:Math.round(r.top+scrollY),bot:Math.round(r.bottom+scrollY),h:Math.round(r.height)};};
    return {hiw:R('#s-wel .hm-hiw'), star:opt==='none'?null:R('#ds'+opt),
      restore:R('#restoreSection'), explore:R('#s-wel .hm-shelves'),
      page:Math.round(document.querySelector('#s-wel').getBoundingClientRect().height),
      overflow:document.documentElement.scrollWidth>window.innerWidth};
  },{CSS,opt});
  out[w+'/'+opt]=m;
  if(opt!=='none'){
    await pg.screenshot({path:`scratchpad/disco-${opt}-${w}.png`,clip:{x:0,y:0,width:w,height:Math.min(1400,m.star.bot+90)}});
  }
  await pg.close();
 }
}
console.log(JSON.stringify(out,null,1));
srv.close(); await b.close();
