// Measure the two opening lines across real phone widths. Count UNIQUE rect
// tops from a Range walk (a block element returns ONE rect, and a per-element
// rect count invents phantom lines).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8954;
const css = fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv = http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':p.endsWith('.woff2')?'font/woff2':'text/html'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let fail = 0;
for (const w of [390,375,360,320]) {
  const pg = await b.newPage({ viewport:{width:w,height:900} });
  await pg.route('**/fonts.googleapis.com/**', r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/born.html`);
  await pg.waitForTimeout(900); try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  const out = await pg.evaluate(() => {
    const lines = el => { const r=document.createRange(); const tops=[];
      el.childNodes.forEach(n=>{ if(n.nodeType!==3) return;
        for(let i=0;i<n.textContent.length;i++){ r.setStart(n,i); r.setEnd(n,i+1);
          const t=r.getBoundingClientRect().top;
          if(!tops.some(x=>Math.abs(x-t)<6)) tops.push(t); } });
      return tops.length; };
    const n = document.querySelector('.note'), s = document.querySelector('.sig');
    const p = document.querySelector('.paper').getBoundingClientRect();
    const over = [...document.querySelectorAll('.paper *')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width && (r.left < p.left-0.5 || r.right > p.right+0.5); }).length;
    return { note: lines(n), sig: s?lines(s):0, over,
             pageScroll: document.documentElement.scrollWidth > window.innerWidth };
  });
  const bad = out.over || out.pageScroll;
  if (bad) fail++;
  console.log(`${String(w).padStart(3)}px  note ${out.note} line(s)  sig ${out.sig}  overflow ${out.over}  h-scroll ${out.pageScroll}`);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/bnoname.html`);
  await pg.waitForTimeout(700); try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  const n2 = await pg.evaluate(() => { const r=document.createRange(); const tops=[];
    document.querySelector('.note').childNodes.forEach(n=>{ if(n.nodeType!==3) return;
      for(let i=0;i<n.textContent.length;i++){ r.setStart(n,i); r.setEnd(n,i+1);
        const t=r.getBoundingClientRect().top; if(!tops.some(x=>Math.abs(x-t)<6)) tops.push(t); } });
    return tops.length; });
  console.log(`       no-name line: ${n2} line(s)`);
  await pg.close();
}
console.log(fail ? `\n${fail} width(s) overflow` : '\nno overflow at any width');
await b.close(); srv.close();
