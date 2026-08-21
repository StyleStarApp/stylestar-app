// She has published https://stylestar.app/?utm_source=instagram to her audience.
// Prove the app boots clean on that exact URL, that the campaign tag survives
// long enough for Plausible to read it, and that tracking is NOT switched off.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'); const PORT=8983;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]); if(u==='/')u='/index.html';
  const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
// iPhone-ish, and an Instagram in-app browser UA, which is how most of her taps will arrive
const ctx=await b.newContext({viewport:{width:390,height:844},
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0.0'});
const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
const reqs=[]; await pg.route('**/plausible.io/**', r=>{reqs.push(r.request().url()); r.abort();});
await pg.goto(`http://localhost:${PORT}/?utm_source=instagram`);
await pg.waitForTimeout(3500);
const m=await pg.evaluate(()=>({
  urlAtBoot: location.href.split('/').pop(),
  utmStillInUrl: /utm_source=instagram/.test(location.href),
  trackingOff: !!window.__ssNoTrack,
  ignoreFlag: (()=>{try{return localStorage.getItem('plausible_ignore')}catch(e){return 'ERR'}})(),
  welcomeShown: !!document.querySelector('#s-wel.act'),
  quizButton: !!document.querySelector('.hm-cta'),
  starShown: !!document.querySelector('#dsStar.on'),
  hiwline: (document.querySelector('.hm-hiwline')||{}).textContent,
}));
console.log('app boot on the posted URL:'); console.log(JSON.stringify(m,null,1));
console.log('plausible script requested:', reqs.length? reqs[0].slice(0,60)+'…' : 'NONE ⚠️');
console.log('JS errors:', errs.length? errs : 'none');
await b.close(); srv.close();
