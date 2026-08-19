import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8957;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const w of [390,360,320]){
  const ctx=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:2,userAgent:IOS});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  console.log(w, await pg.evaluate(()=>{
    showA2hsPage();
    const span=document.querySelectorAll('#s-a2hs .ap-step')[1].lastElementChild;
    const H='<svg class="a2-h" viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
    const cands={
      current:'Scroll down to <b>Add to Home Screen</b> '+H,
      balance:'Scroll down to <b>Add to Home Screen</b> '+H,
      nowrapTail:'Scroll down to <b>Add to Home<span style="white-space:nowrap"> Screen</span></b><span style="white-space:nowrap">&nbsp;'+H+'</span>',
      shorter:'Scroll to <b>Add to Home Screen</b> '+H,
      choose:'Choose <b>Add to Home Screen</b> '+H
    };
    const out={};
    for(const [k,html] of Object.entries(cands)){
      span.innerHTML=html;
      span.style.textWrap = (k==='balance')?'balance':'';
      const r=span.getBoundingClientRect();
      const cs=getComputedStyle(span); const lh=parseFloat(cs.lineHeight)||22;
      const lines=Math.round(r.height/lh*10)/10;
      // is the heart alone on the last line?
      const h=span.querySelector('svg').getBoundingClientRect();
      const texts=[...span.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
      out[k]={lines,heartTop:Math.round(h.top),spanBottom:Math.round(r.bottom),
              heartOnOwnLine: h.top > r.top + lh*(lines-1) - 4 && lines>1 &&
                 Math.round(h.left)<span.getBoundingClientRect().left+40};
    }
    span.style.textWrap='';
    return out;
  }));
  await ctx.close();
}
await b.close();srv.close();
