import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8948;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
try{await pg.evaluate(()=>document.fonts.ready)}catch{}
console.log(await pg.evaluate(()=>{
  document.body.classList.add('menu-open');
  const panel=document.querySelector('.menu-panel');
  const cs=getComputedStyle(panel);
  const inner=panel.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const row=document.querySelector('.menu-row');
  const rcs=getComputedStyle(row);
  const avail=inner - parseFloat(rcs.paddingLeft) - parseFloat(rcs.paddingRight);
  const probe=document.createElement('span');
  probe.style.cssText=`position:absolute;visibility:hidden;white-space:nowrap;font:${rcs.font}`;
  document.body.appendChild(probe);
  const w=t=>{probe.textContent=t;return Math.round(probe.getBoundingClientRect().width*10)/10};
  const widest=[...document.querySelectorAll('.menu-row')].map(r=>({t:r.textContent.trim(),w:w(r.textContent.trim())})).sort((a,b)=>b.w-a.w)[0];
  const cands=['Add to Home Screen','Add Style Star to your phone','Add to your phone','Get the App','Add as an App','Add Style Star to my phone'];
  return {panelWidth:Math.round(panel.getBoundingClientRect().width),availableForText:Math.round(avail*10)/10,
    widestExistingRow:widest, candidates:cands.map(t=>({t,w:w(t),fits:w(t)<=avail}))};
}));
await b.close();srv.close();
