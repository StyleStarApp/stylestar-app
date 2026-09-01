// Option B (home page button, NO tile) with three label treatments, so she can
// decide by eye. ⚠️ Real typefaces. ⚠️ Unique gradient id per variant.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw; import http from 'http'; import fs from 'fs'; import path from 'path';
const T={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const p=q.url.split('?')[0];const f=path.join(process.cwd(),p==='/'?'/index.html':p);
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'text/html; charset=utf-8'});r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(8813,r));
const gf=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8813/scratchpad/fonts/$1)');
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await br.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:gf}));
await pg.goto('http://localhost:8813/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2200);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
try{await pg.evaluate(async()=>{await document.fonts.ready;});}catch(e){}
await pg.waitForTimeout(500);
const V=[['1','Take the Free Quiz',false,'OPTION 1  ·  "Take the Free Quiz"  (keeps FREE)'],
         ['2','Take my style quiz',false,'OPTION 2  ·  "Take my style quiz"  (your voice)'],
         ['3','Take the Free Style Star Quiz',true,'OPTION 3  ·  your full words, on two lines']];
for(const [id,label,wrap,cap] of V){
 await pg.evaluate(({id,label,wrap,cap})=>{
  show('s-journal-fall-florida');
  const scr=document.getElementById('s-journal-fall-florida');
  document.querySelectorAll('.ctamock').forEach(n=>n.remove());
  const cur=scr.querySelector('.hm-cta, .jrnl-cta');
  const el=document.createElement('a'); el.className='hm-cta ctabtn'; el.id='v'+id;
  el.innerHTML='<svg class="hm-cta-seal" viewBox="0 0 24 24"><defs><radialGradient id="jSeal'+id+'" cx="47%" cy="34%" r="70%"><stop offset="0" stop-color="#FFFCEF"/><stop offset=".4" stop-color="#F9E5A0"/><stop offset=".75" stop-color="#F0CB5E"/><stop offset="1" stop-color="#E6B845"/></radialGradient></defs><path fill="url(#jSeal'+id+')" stroke="#B7BCC2" stroke-width="1.1" stroke-linejoin="round" d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>'
   +'<span class="hm-cta-body"><span class="lbl">'+label+'</span><svg class="hm-cta-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg></span>';
  cur.replaceWith(el);
  if(wrap){const st=document.createElement('style');st.className='ctamock';
    st.textContent='#v3 .lbl{white-space:normal;text-wrap:balance;line-height:1.25;text-align:center}#v3{padding-top:16px;padding-bottom:16px}';
    document.head.appendChild(st);}
  const lab=document.createElement('div'); lab.className='ctamock';
  lab.style.cssText='font:700 12px/1 sans-serif;letter-spacing:.1em;color:#8a8172;padding:22px 0 30px;text-align:center';
  lab.textContent=cap; el.parentNode.insertBefore(lab,el);
  lab.scrollIntoView(); window.scrollBy(0,-8);
 },{id,label,wrap,cap});
 await pg.waitForTimeout(400);
 const box=await pg.evaluate(()=>{const lab=[...document.querySelectorAll('.ctamock')].find(e=>/OPTION/.test(e.textContent));
   const b=document.querySelector('.ctabtn').getBoundingClientRect(), a=lab.getBoundingClientRect();
   return {y:Math.max(0,a.top-4), h:(b.bottom-a.top)+24};});
 await pg.screenshot({path:'scratchpad/ctalbl-'+id+'.png',clip:{x:0,y:box.y,width:390,height:box.h}});
 console.log('rendered ctalbl-'+id+'.png');
}
await br.close(); srv.close();
