import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8953;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [name,ua,setup] of [['iphone',IOS,null],['android',IOS,'android']]){
  const ctx=await b.newContext({viewport:{width:390,height:1100},deviceScaleFactor:2,userAgent:ua});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  await pg.evaluate(s=>{ if(s==='android'){_a2hsPrompt={prompt(){},userChoice:Promise.resolve({outcome:'dismissed'})};}
    showA2hsPage(); },setup);
  await pg.waitForTimeout(400);
  const box=await pg.evaluate(()=>{const w=document.querySelector('#s-a2hs .story-wrap');const r=w.getBoundingClientRect();
    return{w:innerWidth,h:Math.ceil(r.bottom)+14}});
  await pg.screenshot({path:`scratchpad/a2page-built-${name}.png`,clip:{x:0,y:0,width:box.w,height:Math.min(box.h,1100)}});
  await ctx.close();
}
await b.close();srv.close();console.log('shot');
