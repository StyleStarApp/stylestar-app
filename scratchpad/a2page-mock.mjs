// Renders three directions for the "Add Style Star to your phone" PAGE.
// Injected into the REAL index.html so it inherits the real CSS + fonts.
// ⚠️ Variant CSS is id-scoped (#vA .x, never .v .x) — the 2026-07-26 lesson
// where five variants rendered identically because the selectors matched
// every block on the page.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8947;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="#3a352c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M12 15V4M8.5 7 12 3.5 15.5 7"/><path d="M7 10H5.8C5 10 4.4 10.6 4.4 11.4v8.2c0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4v-8.2c0-.8-.6-1.4-1.4-1.4H17"/></svg>';
const HEART='<svg viewBox="0 0 24 24" fill="#F49AC1" style="width:14px;height:14px;vertical-align:-2px;transform:rotate(12deg)"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';

const LEAD='Add Style Star as a free app to your phone';
const STEPS=`
  <div class="ap-step"><span class="ap-n">1</span><span>Tap <span class="ap-chip">${SHARE}</span> in your browser&rsquo;s toolbar</span></div>
  <div class="ap-step"><span class="ap-n">2</span><span>Scroll down to <b>Add to Home Screen</b> ${HEART}</span></div>
  <div class="ap-note">It sits a little way down the list, under <b>View More</b> on some phones.</div>`;

const BASE=`
  .ap-lead{font:600 16px/1.45 'Jost',sans-serif;color:#3a352c;text-wrap:balance;margin:0 0 16px}
  .ap-step{display:flex;align-items:flex-start;gap:10px;text-align:left;max-width:290px;margin:0 auto 11px;font:400 15px/1.5 'Jost',sans-serif;color:#4a463e}
  .ap-n{flex:0 0 auto;width:22px;height:22px;margin-top:1px;border-radius:50%;border:1.5px solid #D8A52E;color:#3a352c;font:600 12px/1 'Jost',sans-serif;display:flex;align-items:center;justify-content:center}
  .ap-step b{font-weight:600;color:#2a2620}
  .ap-chip{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:#F1ECE0;border:1px solid #D6C9A8;vertical-align:middle;position:relative;top:-1px;margin:0 1px}
  .ap-note{font:400 13.5px/1.5 'Jost',sans-serif;color:#6b6355;text-wrap:balance;max-width:290px;margin:14px auto 0}
  .ap-note b{color:#4a463e;font-weight:600}
  .ap-ico{display:block;width:64px;height:64px;border-radius:14px;margin:0 auto 12px;box-shadow:0 3px 12px rgba(42,38,32,.22)}
`;

const V={
 A:{t:'A — Focused',css:BASE+`#vA .ap-body{text-align:center}`,
    html:`<img class="ap-ico" src="apple-touch-icon.png" alt=""><div class="ap-lead">${LEAD}</div>${STEPS}`},
 B:{t:'B — Shows what you get',css:BASE+`
    #vB .ap-body{text-align:center}
    #vB .ap-home{display:flex;justify-content:center;gap:14px;align-items:flex-start;background:linear-gradient(160deg,#2b2740,#4a4364);border-radius:16px;padding:16px 12px 13px;margin:0 auto 18px;max-width:290px}
    #vB .ap-slot{width:52px;text-align:center}
    #vB .ap-slot img,#vB .ap-blank{width:52px;height:52px;border-radius:12px;display:block;margin:0 auto 5px}
    #vB .ap-blank{background:rgba(255,255,255,.13)}
    #vB .ap-cap{font:400 9.5px/1.2 'Jost',sans-serif;color:#fff;display:block}
    #vB .ap-cap.dim{color:rgba(255,255,255,.35)}`,
    html:`<div class="ap-home">
        <div class="ap-slot"><span class="ap-blank"></span><span class="ap-cap dim">&nbsp;</span></div>
        <div class="ap-slot"><img src="apple-touch-icon.png" alt=""><span class="ap-cap">Style Star</span></div>
        <div class="ap-slot"><span class="ap-blank"></span><span class="ap-cap dim">&nbsp;</span></div>
      </div><div class="ap-lead">${LEAD}</div>${STEPS}`},
 C:{t:'C — Both phones',css:BASE+`
    #vC .ap-body{text-align:center}
    #vC .ap-sec{font:600 11px/1 'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6b6355;margin:0 0 12px;display:flex;align-items:center;gap:9px;justify-content:center}
    #vC .ap-sec::before,#vC .ap-sec::after{content:'';height:1px;width:30px;background:#D6C9A8}
    #vC .ap-and{margin-top:26px;padding-top:20px;border-top:1px solid #EBE6DA}
    #vC .ap-btn{display:inline-block;margin-top:4px;padding:11px 22px;border-radius:999px;background:#1a1a1a;border:1px solid #C99A2C;color:#F2D889;font:600 14px/1 'Jost',sans-serif}`,
    html:`<img class="ap-ico" src="apple-touch-icon.png" alt=""><div class="ap-lead">${LEAD}</div>
      <div class="ap-sec">On iPhone</div>${STEPS}
      <div class="ap-and"><div class="ap-sec">On Android</div>
      <div style="font:400 15px/1.5 'Jost',sans-serif;color:#4a463e;max-width:290px;margin:0 auto 12px">Your browser can do it for you.</div>
      <span class="ap-btn">Add it now ${HEART}</span></div>`}
};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:390,height:1100},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.goto(`http://localhost:${PORT}/`);
await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
try{await pg.evaluate(()=>document.fonts.ready);}catch{}

for(const [k,v] of Object.entries(V)){
  await pg.evaluate(({k,v})=>{
    document.querySelectorAll('.scr').forEach(s=>s.classList.remove('act'));
    document.getElementById('mockScr')?.remove(); document.getElementById('mockCss')?.remove();
    const st=document.createElement('style'); st.id='mockCss'; st.textContent=v.css; document.head.appendChild(st);
    const d=document.createElement('div'); d.className='scr act'; d.id='mockScr';
    d.innerHTML=`<div class="story-wrap"><div class="pp-head">
        <img src="logo-star.png" class="pp-lh-logo" alt=""><button class="top-back">&larr; Back</button></div>
      <div class="story-title">Add to Home Screen</div>
      <div id="v${k}"><div class="ap-body">${v.html}</div></div></div>`;
    document.querySelector('.ss')?.appendChild(d);
  },{k,v});
  await pg.waitForTimeout(500);
  // clip to the real content, not the whole viewport — an option she cannot
  // read on her phone is an option she cannot choose (the 2026-07-26 lesson).
  const box=await pg.evaluate(()=>{const w=document.querySelector('#mockScr .story-wrap');
    const r=w.getBoundingClientRect();return {x:0,y:0,w:Math.ceil(r.right)+8,h:Math.ceil(r.bottom)+14};});
  await pg.screenshot({path:`scratchpad/a2page-${k}.png`,clip:{x:box.x,y:box.y,width:box.w,height:box.h}});
}
// prove the variants really differ (the id-scoping lesson)
console.log(await pg.evaluate(()=>({leadFont:getComputedStyle(document.querySelector('.ap-lead')).fontFamily})));
await b.close(); srv.close(); console.log('rendered A B C');
