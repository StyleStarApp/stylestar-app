// Extract article #2's H2/answer pairs and FAQ block from the RENDERED page.
// ⚠️ innerText, never textContent: textContent welds block elements together
// with no separator (the 2026-09-01 lesson). ⚠️ The screen must be SHOWN
// first -- innerText returns EMPTY for a display:none element.
// ⚠️ Serves .css as text/css: a WRONG content type makes Chromium refuse the
// stylesheet and silently render an unstyled page (the 2026-09-01 rule).
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw;
import http from 'http';import fs from 'fs';import path from 'path';
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
const srv=http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html';
  const f=path.join(process.cwd(),p);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf');}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});
  res.end(fs.readFileSync(f));
});
await new Promise(r=>srv.listen(8801,r));
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await br.newPage({viewport:{width:390,height:844}});
const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto('http://localhost:8801/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(600);
const out=await pg.evaluate(()=>{
  show('s-journal-fall-florida');
  const scr=document.getElementById('s-journal-fall-florida');
  if(!scr) return {err:'screen missing'};
  if(!(scr.offsetHeight>0)) return {err:'screen not visible after show()'};
  const pairs=[];
  // (a) H2 sections whose heading is a real question
  scr.querySelectorAll('h2.jrnl-h2').forEach(h=>{
    const q=h.innerText.trim();
    if(!q.endsWith('?')) return;                    // skip "Frequently Asked Questions" / "One Last Thing"
    const parts=[];
    let n=h.nextElementSibling;
    while(n && !/^H2$/.test(n.tagName)){ if(n.classList.contains('jrnl-p')) parts.push(n.innerText.trim()); n=n.nextElementSibling; }
    pairs.push({q,a:parts.join(' '),src:'h2'});
  });
  // (b) the explicit FAQ block
  scr.querySelectorAll('.faq-item').forEach(it=>{
    pairs.push({q:it.querySelector('.faq-q').innerText.trim(),
                a:it.querySelector('.faq-a').innerText.trim(), src:'faq'});
  });
  const h1=scr.querySelectorAll('h1');
  return {pairs, h1:h1.length, h1text:h1[0]?h1[0].innerText.trim():'',
          date:scr.querySelector('.jrnl-by-date').innerText.trim(),
          words:scr.innerText.trim().split(/\s+/).length};
});
await br.close(); srv.close();
if(out.err){console.log('ERROR:',out.err);process.exit(1);}
console.log('h1:',out.h1,'|',out.h1text);
console.log('byline date:',out.date);
console.log('rendered words:',out.words);
console.log('JS errors:',errs.length,errs.slice(0,3));
console.log('pairs:',out.pairs.length,'(h2:'+out.pairs.filter(p=>p.src==='h2').length+', faq:'+out.pairs.filter(p=>p.src==='faq').length+')');
out.pairs.forEach((p,i)=>console.log('  '+(i+1)+'. ['+p.src+'] '+p.q+'  ('+p.a.length+' chars)'));
fs.writeFileSync('scratchpad/faq2.json',JSON.stringify(out.pairs,null,1));
console.log('-> scratchpad/faq2.json');
