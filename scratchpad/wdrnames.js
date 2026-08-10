const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
// how many wardrobe item names wrap, at 8px vs 11px frame?
for(const w of [390,375,360]){
  const out=[];
  for(const px of [8,11]){
    const page=await browser.newPage({viewport:{width:w,height:900}});
    await page.goto(base+'/',{waitUntil:'load'});
    await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
    await page.reload({waitUntil:'load'});await page.waitForTimeout(2600);
    const r=await page.evaluate(async(px)=>{
      const st=document.createElement('style');
      st.textContent=`.ss.wardrobe-mirror{border-width:${px}px!important}`;
      document.head.appendChild(st);
      openWardrobe('list'); await new Promise(r=>setTimeout(r,700));
      const names=[...document.querySelectorAll('#s-wardrobe .wdr-item .wdr-name, #s-wardrobe .wdr-item')];
      let wrapped=0, checked=0;
      for(const n of names){
        const t=n.querySelector('.wdr-name')||n;
        const txt=t.childNodes[0]; if(!txt||txt.nodeType!==3) continue;
        const rg=document.createRange(); rg.selectNodeContents(t);
        const tops=[...new Set([...rg.getClientRects()].map(x=>Math.round(x.top)))].length;
        checked++; if(tops>1) wrapped++;
      }
      return {wrapped,checked,overflow:document.documentElement.scrollWidth>window.innerWidth};
    },px);
    out.push(`${px}px: ${r.wrapped}/${r.checked} names wrap, sideways overflow: ${r.overflow}`);
    await page.close();
  }
  console.log(`${w} -> ${out.join('   |   ')}`);
}
await browser.close();server.close();
