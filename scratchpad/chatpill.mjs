/* Kathy, twice: "I couldn't find it." The resume whisper lives ONLY on Welcome
   Back, so a woman who lands anywhere else has nothing telling her the
   conversation is still there. This measures what a mark on the Ask your Stylist
   row COSTS before one is chosen — the drawer is tight and "Refine your
   Preferences" is already the widest row in it. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8995;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const W of [390,360,320]){
  const pg=await (await b.newContext({viewport:{width:W,height:844},deviceScaleFactor:W===390?3:1})).newPage();
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1100);
  const m=await pg.evaluate(()=>{
    menuOpen();
    const rows=[...document.querySelectorAll('.menu-row')];
    const ask=rows.find(r=>r.textContent.trim().startsWith('Ask your Stylist'));
    const panel=document.getElementById('menuPanel').getBoundingClientRect();
    const cs=getComputedStyle(document.getElementById('menuPanel'));
    const inner=panel.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const c=document.createElement('canvas').getContext('2d');
    c.font=getComputedStyle(ask).font;
    const widest=rows.map(r=>({t:r.textContent.trim().replace(/Start here$/,'').trim()}))
      .map(o=>({t:o.t,w:c.measureText(o.t).width})).sort((a,b)=>b.w-a.w);
    return {inner:inner.toFixed(1), ask:c.measureText('Ask your Stylist').width.toFixed(1),
      widest:widest.slice(0,3).map(o=>o.t+' '+o.w.toFixed(0)).join(' | ')};
  });
  console.log(`${W}px  drawer inner ${m.inner}px · "Ask your Stylist" ${m.ask}px · widest rows: ${m.widest}`);
  const spare=parseFloat(m.inner)-parseFloat(m.ask);
  console.log(`      room beside it: ${spare.toFixed(1)}px  ->  a text pill needs ~46, a dot ~14`);
}
await b.close();srv.close();
