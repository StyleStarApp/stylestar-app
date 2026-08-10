const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const w of [390,375,360]){
  const page=await browser.newPage({viewport:{width:w,height:820},deviceScaleFactor:2});
  await page.goto(base+'/',{waitUntil:'load'});
  await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
  await page.reload({waitUntil:'load'});await page.waitForTimeout(2600);
  const r=await page.evaluate(async()=>{
    openWardrobe('list'); await new Promise(r=>setTimeout(r,700));
    let wrapped=0,checked=0;
    for(const n of document.querySelectorAll('#s-wardrobe .wdr-item')){
      const t=n.querySelector('.wdr-name')||n; const txt=t.childNodes[0];
      if(!txt||txt.nodeType!==3) continue;
      const rg=document.createRange(); rg.selectNodeContents(t); checked++;
      if([...new Set([...rg.getClientRects()].map(x=>Math.round(x.top)))].length>1) wrapped++;
    }
    const b=getComputedStyle(document.querySelector('.ss')).borderTopWidth;
    const wl=await (async()=>{openWishlist();await new Promise(r=>setTimeout(r,500));
      return getComputedStyle(document.querySelector('.ss')).borderTopWidth;})();
    return {wrapped,checked,wardrobeFrame:b,wishlistFrame:wl,over:document.documentElement.scrollWidth>window.innerWidth};
  });
  console.log(`${w}: wardrobe frame ${r.wardrobeFrame}, wishlist frame ${r.wishlistFrame}, ${r.wrapped}/${r.checked} names wrap, overflow ${r.over}`);
  if(w===390){
    await page.evaluate(()=>openWardrobe('list')); await page.waitForTimeout(600);
    await page.screenshot({path:path.join(ROOT,'scratchpad','frame11-list.png'),clip:{x:0,y:0,width:w,height:520}});
    await page.evaluate(()=>wardrobeTab('trend')); await page.waitForTimeout(500);
    await page.screenshot({path:path.join(ROOT,'scratchpad','frame11-trend.png'),clip:{x:0,y:0,width:w,height:520}});
  }
  await page.close();
}
await browser.close();server.close();
