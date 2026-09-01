import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8908;
const T={'.css':'text/css','.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/contact'||p==='/')p='/index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [name,route] of [['contact','/contact'],['privacy','/privacy']]){
  const pg=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
  await pg.goto(`http://localhost:${PORT}${route}`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(400);
  await pg.screenshot({path:`scratchpad/frame-${name}.png`});
  const m=await pg.evaluate(()=>{const ss=document.querySelector('.ss');const st=getComputedStyle(ss);const bb=document.querySelector('.top-back').getBoundingClientRect();
    return{border:st.borderTopWidth+' '+st.borderTopColor,cls:[...ss.classList].filter(c=>/mirror/.test(c)).join(','),
      backRight:Math.round(bb.right),backTop:Math.round(bb.top),vw:document.documentElement.clientWidth,
      sideScroll:document.documentElement.scrollWidth-document.documentElement.clientWidth};});
  console.log(name, JSON.stringify(m));
  await pg.close();
}
await b.close(); srv.close();
