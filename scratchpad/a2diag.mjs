import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8955;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:1000},deviceScaleFactor:2,userAgent:IOS});
const pg=await ctx.newPage();
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
try{await pg.evaluate(()=>document.fonts.ready)}catch{}
console.log(await pg.evaluate(()=>{
  showA2hsPage();
  const R=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
    return{w:Math.round(b.width),h:Math.round(b.height),top:Math.round(b.top),right:Math.round(b.right),left:Math.round(b.left)}};
  return {vw:innerWidth,
    heart:R('#s-a2hs .ap-step svg'), noteHeart:R('#s-a2hs .ap-note svg'),
    back:R('#s-a2hs .top-back'), ppHead:R('#s-a2hs .pp-head'),
    title:R('#s-a2hs .story-title'), chip:R('.menu-chip'),
    wrap:R('#s-a2hs .story-wrap'), body:R('#s-a2hs .ap-body'),
    docScrollW:document.documentElement.scrollWidth, docClientW:document.documentElement.clientWidth};
}));
await b.close();srv.close();
