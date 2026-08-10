const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.goto(base+'/',{waitUntil:'load'});
await page.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:Array(12).fill(6),topArchNames:['Timeless Classic'],portrait:'x',motto:'y'})));
await page.reload({waitUntil:'load'});
await page.waitForTimeout(2600);
await page.evaluate(()=>{try{openChat()}catch(e){}});
await page.waitForTimeout(900);
console.log(await page.evaluate(()=>{
  const c=document.getElementById('menuChip');
  return {bodyClasses:document.body.className, display:getComputedStyle(c).display,
    w:Math.round(c.getBoundingClientRect().width),
    activeEl:(document.activeElement&&document.activeElement.id)||document.activeElement.tagName,
    typing:document.body.classList.contains('chat-typing')};
}));
await browser.close();server.close();
