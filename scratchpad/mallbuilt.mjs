import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium=(await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT=path.resolve(import.meta.dirname,'..');
const srv=http.createServer((q,s)=>{try{s.end(fs.readFileSync(path.join(ROOT,q.url==='/'?'index.html':q.url.split('?')[0])))}catch(e){s.statusCode=404;s.end()}}).listen(8969);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await (await b.newContext({viewport:{width:390,height:900},deviceScaleFactor:2})).newPage();
await pg.goto('http://localhost:8969/',{waitUntil:'networkidle'});
await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());showShop()});
await pg.waitForTimeout(600);
// crop from the Contemporary heading through the Elevated group
const box=await pg.evaluate(()=>{
  const cats=[...document.querySelectorAll('#s-shop .mall-cat')];
  const a=cats.find(c=>/Contemporary/.test(c.textContent));
  const c=cats.find(c=>/Value/.test(c.textContent));
  const ra=a.getBoundingClientRect(), rc=c.getBoundingClientRect();
  return {y:ra.top+scrollY-10, h:(rc.top+scrollY)-(ra.top+scrollY)+4};
});
await pg.setViewportSize({width:390,height:Math.min(2000,Math.ceil(box.h)+40)});
await pg.evaluate(y=>scrollTo(0,y),box.y);
await pg.waitForTimeout(300);
await pg.screenshot({path:path.join(ROOT,'scratchpad/mall-built.png')});
console.log('rendered',JSON.stringify(box));
await b.close();srv.close();
