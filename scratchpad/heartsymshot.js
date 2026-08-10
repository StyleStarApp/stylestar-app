const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{const f=path.join(ROOT, req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0].slice(1)));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200);fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [open,name,h] of [["openWardrobe('trend')",'heartsym-trending',420],['showDream()','heartsym-edit',430]]){
  const page=await browser.newPage({viewport:{width:390,height:900},deviceScaleFactor:3});
  await page.goto(base+'/',{waitUntil:'load'});await page.waitForTimeout(2600);
  await page.evaluate(f=>eval(f),open);await page.waitForTimeout(600);
  await page.screenshot({path:path.join(ROOT,'scratchpad',name+'.png'),clip:{x:0,y:0,width:390,height:h}});
  await page.close();
}
await browser.close();server.close();
