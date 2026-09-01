// Renders the "Can I Still Wear My Summer Dresses in Fall?" section three ways
// so Catherine can decide bullets vs paragraphs from a real render.
// ⚠️ Real typefaces served locally (Chromium here cannot reach Google Fonts, and
// a computed font-family reports the DECLARED stack, not the painted face).
// ⚠️ Variant CSS is ID-SCOPED (#vA/#vB/#vC) -- unscoped ".v" selectors made five
// "different" options render identically once before.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw; import http from 'http'; import fs from 'fs'; import path from 'path';
const T={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const p=q.url.split('?')[0];const f=path.join(process.cwd(),p==='/'?'/index.html':p);
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'text/html; charset=utf-8'});r.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(8806,r));
const gf=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8806/scratchpad/fonts/$1)');
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await br.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:gf}));
await pg.goto('http://localhost:8806/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2200);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance'); if(c)c.remove();});
try{ await pg.evaluate(async()=>{await document.fonts.ready;}); }catch(e){}
await pg.waitForTimeout(600);
// prove the real faces really loaded (a fallback render would mislead her)
const fontOK=await pg.evaluate(async()=>{await document.fonts.load("400 15.5px 'Lora'","Fall");
  const c=document.createElement('canvas').getContext('2d');
  c.font="400 15.5px 'Lora'"; const a=c.measureText('Fall in Florida').width;
  c.font="400 15.5px serif";  const b=c.measureText('Fall in Florida').width;
  return {lora:a, serif:b, differ:Math.abs(a-b)>1};});
if(!fontOK.differ){console.log('ABORT: real Lora did not load (would render in fallback)');process.exit(1);}
console.log('real fonts loaded (Lora '+fontOK.lora.toFixed(1)+'px vs serif '+fontOK.serif.toFixed(1)+'px)');

const shots=[];
for(const v of ['A','B','C']){
  await pg.evaluate((v)=>{
    show('s-journal-fall-florida');
    const scr=document.getElementById('s-journal-fall-florida');
    document.querySelectorAll('.mockstyle').forEach(n=>n.remove());
    // rebuild the section fresh each time from the three sentences
    const items=[
      'A chocolate brown sleeveless midi, tan leather loafers, and a suede crossbody. Nothing about that outfit is warm, and all of it reads as fall.',
      "The white jeans you've worn all summer, an olive linen button-down with the sleeves rolled, and flat leather slides in cognac.",
      "A burgundy or deep green sundress, a slim leather belt at the waist, and a closed-toe flat. The belt is doing more work than you'd think."];
    const h2=[...scr.querySelectorAll('h2.jrnl-h2')].find(h=>/Summer Dresses/.test(h.textContent));
    // clear everything between this h2 and the next
    let n=h2.nextElementSibling; const kill=[];
    while(n && n.tagName!=='H2'){kill.push(n);n=n.nextElementSibling;}
    kill.forEach(x=>x.remove());
    const after=(el)=>h2.parentNode.insertBefore(el, n);
    const p=(t)=>{const e=document.createElement('p');e.className='jrnl-p';e.textContent=t;after(e);};
    p('Yes. A great dress is a great dress. Before you pack anything away, look at each one for its color, its print, its overall feeling rather than its sleeve length. A surprising number will move straight into October with nothing more than a different shoe, a different bag, or a piece of jewelry with more presence.');
    p('Three that work, exactly as written:');
    const st=document.createElement('style'); st.className='mockstyle';
    if(v==='A'){ items.forEach(p); }
    else {
      const ul=document.createElement('ul'); ul.id='mockul';
      items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li);});
      after(ul);
      st.textContent = v==='B'
        ? '#mockul{list-style:none;margin:0 0 18px;padding:0}'
        + '#mockul li{font:400 15.5px/1.72 \'Lora\',Georgia,serif;color:#4a463e;margin:0 0 12px;padding-left:18px;position:relative}'
        + '#mockul li::before{content:"";position:absolute;left:2px;top:11px;width:5px;height:5px;border-radius:50%;background:#4a463e}'
        : '#mockul{list-style:none;margin:0 0 18px;padding:0}'
        + '#mockul li{font:400 15.5px/1.72 \'Lora\',Georgia,serif;color:#4a463e;margin:0 0 12px;padding-left:20px;position:relative}'
        + '#mockul li::before{content:"";position:absolute;left:0;top:9px;width:8px;height:8px;background:#D8A52E;transform:rotate(45deg)}';
      document.head.appendChild(st);
    }
    // label
    const lab=document.createElement('div'); lab.className='mockstyle';
    lab.style.cssText='font:700 12px/1 sans-serif;letter-spacing:.12em;color:#8a8172;padding:10px 0 4px';
    lab.textContent={'A':'OPTION A  ·  PARAGRAPHS (as built)','B':'OPTION B  ·  BULLETS, PLAIN DOT','C':'OPTION C  ·  BULLETS, GOLD DIAMOND'}[v];
    h2.parentNode.insertBefore(lab,h2);
    h2.scrollIntoView();
  },v);
  await pg.waitForTimeout(350);
  const box=await pg.evaluate(()=>{
    const scr=document.getElementById('s-journal-fall-florida');
    const lab=[...scr.querySelectorAll('.mockstyle')].find(e=>/OPTION/.test(e.textContent));
    const h2=[...scr.querySelectorAll('h2.jrnl-h2')].find(h=>/Summer Dresses/.test(h.textContent));
    let n=h2.nextElementSibling,last=h2;
    while(n&&n.tagName!=='H2'){last=n;n=n.nextElementSibling;}
    const a=lab.getBoundingClientRect(), b=last.getBoundingClientRect();
    return {x:Math.max(0,a.left-14),y:a.top+window.scrollY-6,w:Math.min(390,a.width+28),h:b.bottom-a.top+16};
  });
  const f='scratchpad/bullets-'+v+'.png';
  await pg.screenshot({path:f,clip:{x:box.x,y:box.y-await pg.evaluate(()=>window.scrollY),width:box.w,height:box.h}});
  shots.push(f); console.log('rendered '+f+'  ('+Math.round(box.h)+'px tall)');
}
await br.close(); srv.close();
