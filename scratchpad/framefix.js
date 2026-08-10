const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const w of [390,375,360]){
  const page=await browser.newPage({viewport:{width:w,height:800}});
  await page.goto(base+'/',{waitUntil:'load'});
  await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
  await page.reload({waitUntil:'load'});await page.waitForTimeout(2600);
  const r=await page.evaluate(async ()=>{
    const st=document.createElement('style');
    st.textContent='.ss.wardrobe-mirror,.ss.wishlist-mirror{border-width:11px!important}#s-wishlist .wl-empty{padding-left:0!important;padding-right:0!important}';
    document.head.appendChild(st);
    openWishlist(); await new Promise(r=>setTimeout(r,600));
    const btn=document.querySelector('#s-wishlist .we-addlnk'), span=btn.querySelector('.wab-t');
    const avail=Math.floor(btn.parentElement.getBoundingClientRect().width);
    const c=span.cloneNode(true); c.style.cssText='position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
    c.style.font=getComputedStyle(span).font; c.style.letterSpacing=getComputedStyle(span).letterSpacing;
    document.body.appendChild(c); const need=Math.ceil(c.getBoundingClientRect().width)+18; c.remove();
    const rg=document.createRange(); rg.selectNodeContents(span);
    const lines=[...new Set([...rg.getClientRects()].map(x=>Math.round(x.top)))].length;
    const card=document.querySelector('#s-wishlist .wl-card').getBoundingClientRect();
    const br=btn.getBoundingClientRect();
    return {avail,need,head:avail-need,lines,inside:br.left>=card.left-0.5&&br.right<=card.right+0.5};
  });
  console.log(`${w}: avail ${r.avail} / need ${r.need} -> headroom ${r.head}px, ${r.lines} line(s), inside card: ${r.inside}`);
  await page.close();
}
await browser.close();server.close();
