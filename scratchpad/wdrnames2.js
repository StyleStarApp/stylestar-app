const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const CASES=[
  {n:'10px, no trim change', css:'.ss.wardrobe-mirror{border-width:10px!important}'},
  {n:'11px, no trim change', css:'.ss.wardrobe-mirror{border-width:11px!important}'},
  {n:'11px + trim extended to 389', css:'.ss.wardrobe-mirror{border-width:11px!important}@media(max-width:389px){#s-wardrobe .wdr-item{gap:0 6px;padding-left:0;padding-right:0}}'},
];
for(const w of [390,375]){
  for(const c of CASES){
    const page=await browser.newPage({viewport:{width:w,height:900}});
    await page.goto(base+'/',{waitUntil:'load'});
    await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
    await page.reload({waitUntil:'load'});await page.waitForTimeout(2600);
    const r=await page.evaluate(async(css)=>{
      const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
      openWardrobe('list'); await new Promise(r=>setTimeout(r,700));
      let wrapped=0,checked=0;
      for(const n of document.querySelectorAll('#s-wardrobe .wdr-item')){
        const t=n.querySelector('.wdr-name')||n; const txt=t.childNodes[0];
        if(!txt||txt.nodeType!==3) continue;
        const rg=document.createRange(); rg.selectNodeContents(t);
        checked++; if([...new Set([...rg.getClientRects()].map(x=>Math.round(x.top)))].length>1) wrapped++;
      }
      return {wrapped,checked};
    },c.css);
    console.log(`${w}  ${c.n.padEnd(30)} -> ${r.wrapped}/${r.checked} wrap`);
    await page.close();
  }
}
await browser.close();server.close();
