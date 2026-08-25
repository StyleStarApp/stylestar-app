/* As-built render of the Star of the Week card (2026-08-25, her pick "B2":
 * 19px/.10em label + the gradient star from her Edit / Signature card). */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8957, W=Number(process.env.W||375);
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:W,height:860},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
// ⚠️ the retail CDN is unreachable here and the <img> removes itself on error,
//    so the card measures ~145px short without a stub.
const stub=fs.readFileSync('/tmp/stub.png');
await pg.route(/cdn\.shop|shopify|farmrio|images\./i,r=>r.fulfill({status:200,contentType:'image/png',body:stub}));
await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
  topArchNames:['Modern Glam'],portrait:'x',motto:'Softness is not quiet, it is the whole conversation'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
await pg.evaluate(async()=>{await document.fonts.ready});
await pg.waitForTimeout(500);
const box=await pg.evaluate(()=>{const e=document.querySelector('#wbStar');const r=e.getBoundingClientRect();
  return {x:Math.max(0,r.x-8),y:Math.max(0,r.y-8),width:r.width+16,height:r.height+16}});
await pg.screenshot({path:`scratchpad/wksbuilt-${W}.png`,clip:box});
await b.close();srv.close();
console.log('rendered scratchpad/wksbuilt-'+W+'.png');
