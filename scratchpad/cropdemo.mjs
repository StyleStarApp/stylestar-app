// Draw the two Instagram shapes over the real card so the ratio question is a
// picture rather than a paragraph.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(), PORT=8973;
const MIME={'.css':'text/css','.woff2':'font/woff2','.png':'image/png','.html':'text/html'};
const srv=http.createServer((req,res)=>{
  const f=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,''));
  fs.readFile(f,(e,b)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(b);});
});
await new Promise(r=>srv.listen(PORT,r));
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page=await browser.newPage({viewport:{width:1200,height:2000},deviceScaleFactor:1});
await page.goto(`http://localhost:${PORT}/scratchpad/cropdemo.html`);
await page.waitForFunction(()=>window.__ready===true,null,{timeout:20000});
await (await page.$('#out')).screenshot({path:'scratchpad/share-SIZES.png'});
console.log('wrote scratchpad/share-SIZES.png');
await browser.close(); srv.close();
