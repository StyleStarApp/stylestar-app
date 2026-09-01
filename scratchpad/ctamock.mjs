// Three treatments for the Journal article CTA, rendered on the REAL page.
// ⚠️ Real typefaces served locally. ⚠️ Each variant's gradient gets a UNIQUE id
// (the Safari hidden-defs trap: two <defs> sharing an id resolve to whichever
// lives in a hidden screen). ⚠️ Variant CSS is ID-SCOPED.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw; import http from 'http'; import fs from 'fs'; import path from 'path';
const T={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const p=q.url.split('?')[0];const f=path.join(process.cwd(),p==='/'?'/index.html':p);
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'text/html; charset=utf-8'});r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(8809,r));
const gf=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8809/scratchpad/fonts/$1)');
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await br.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:gf}));
await pg.goto('http://localhost:8809/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2200);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
try{await pg.evaluate(async()=>{await document.fonts.ready;});}catch(e){}
await pg.waitForTimeout(600);
const fok=await pg.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');
 c.font="700 13.5px 'Jost'";const a=c.measureText('START MY STYLE QUIZ').width;
 c.font="700 13.5px sans-serif";return Math.abs(a-c.measureText('START MY STYLE QUIZ').width)>1;});
if(!fok){console.log('ABORT: fallback fonts');process.exit(1);}

for(const v of ['A','B','C']){
 await pg.evaluate((v)=>{
  show('s-journal-fall-florida');
  const scr=document.getElementById('s-journal-fall-florida');
  document.querySelectorAll('.ctamock').forEach(n=>n.remove());
  const old=scr.querySelector('.jrnl-cta, .ctabtn'); 
  const SEAL=(id)=>'<svg class="hm-cta-seal" viewBox="0 0 24 24"><defs><radialGradient id="'+id+'" cx="47%" cy="34%" r="70%"><stop offset="0" stop-color="#FFFCEF"/><stop offset=".4" stop-color="#F9E5A0"/><stop offset=".75" stop-color="#F0CB5E"/><stop offset="1" stop-color="#E6B845"/></radialGradient></defs><path fill="url(#'+id+')" stroke="#B7BCC2" stroke-width="1.1" stroke-linejoin="round" d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>';
  const TILE='<span class="hm-cta-tile"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"><path d="M1 7h14M19 7h4M1 17h7M12 17h11"/><circle cx="17" cy="7" r="2.1" fill="#fff"/><circle cx="10" cy="17" r="2.1" fill="#fff"/></svg></span>';
  const ARR='<svg class="hm-cta-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg>';
  let el;
  if(v==='A'){ el=old.cloneNode(true); }
  else if(v==='B'){
    el=document.createElement('a'); el.className='hm-cta ctabtn'; el.id='vB';
    el.innerHTML=SEAL('jrnlSealB')+TILE+'<span class="hm-cta-body"><span class="lbl">Take the Free Style Star Quiz</span>'+ARR+'</span>';
  } else {
    el=document.createElement('a'); el.className='hm-cta ctabtn'; el.id='vC';
    el.innerHTML=SEAL('jrnlSealC')+'<span class="hm-cta-body"><span class="lbl">Take the Free Style Star Quiz</span>'+ARR+'</span>';
    const st=document.createElement('style'); st.className='ctamock';
    st.textContent='#vC{background:#1a1a1a;border:1px solid #C99A2C;padding:15px 14px}'
      +'#vC .lbl{color:#F2D889}#vC .hm-cta-arr{color:#D2AF48}';
    document.head.appendChild(st);
  }
  el.classList.add('ctamock2');
  old.replaceWith(el);
  const lab=document.createElement('div'); lab.className='ctamock';
  lab.style.cssText='font:700 12px/1 sans-serif;letter-spacing:.12em;color:#8a8172;padding:22px 0 30px;text-align:center';
  lab.textContent={'A':'OPTION A  ·  NOW (black pill, no star, no arrow)','B':'OPTION B  ·  EXACTLY THE HOME PAGE BUTTON','C':'OPTION C  ·  SQUARED + STAR + ARROW, KEPT BLACK'}[v];
  el.parentNode.insertBefore(lab, el);
  lab.scrollIntoView(); window.scrollBy(0,-10);
 },v);
 await pg.waitForTimeout(450);
 const box=await pg.evaluate(()=>{
   const lab=[...document.querySelectorAll('.ctamock')].find(e=>/OPTION/.test(e.textContent));
   const btn=document.querySelector('.ctabtn2, .ctamock2');
   const a=lab.getBoundingClientRect(), b=btn.getBoundingClientRect();
   return {x:0,y:a.top-4,w:390,h:(b.bottom-a.top)+26};
 });
 await pg.screenshot({path:'scratchpad/cta-'+v+'.png',clip:{x:box.x,y:Math.max(0,box.y),width:box.w,height:box.h}});
 console.log('rendered scratchpad/cta-'+v+'.png ('+Math.round(box.h)+'px)');
}
await br.close(); srv.close();
