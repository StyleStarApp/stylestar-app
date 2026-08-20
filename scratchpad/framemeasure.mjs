import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app', PORT=8953;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const w of [390,375,360,320]){
  const pg=await b.newPage({viewport:{width:w,height:900}});
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(900);
  await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());show('s-wb');});
  await pg.waitForTimeout(400);
  console.log(w, JSON.stringify(await pg.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
      return {l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,w:Math.round(b.width*10)/10};};
    return {greet:r('.wb-greet'),acts:r('.wb-acts'),card:r('.wks-card'),host:r('#wbStar'),
      whisper:r('#wbNext'), room:r('#s-wb .hm-room')};
  })));
  await pg.close();
}
await b.close(); srv.close();
