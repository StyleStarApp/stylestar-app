import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8996;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const VAR={
  A_waiting:{html:'<span class="cw-pill">Waiting</span>',css:'.cw-pill{display:inline-flex;align-items:center;margin-left:9px;padding:2.5px 6px;border-radius:8px;background:radial-gradient(circle at 40% 35%,#FCE9AC,#E7BE52 62%,#C69214);box-shadow:0 0 0 1.5px #FBFAF7,0 0 6px 1px rgba(233,180,80,.7);color:#3a2c07;font:700 8px/1 Jost,sans-serif;letter-spacing:.1em;text-transform:uppercase}'},
  B_pickup:{html:'<span class="cw-pill">Pick up</span>',css:'.cw-pill{display:inline-flex;align-items:center;margin-left:9px;padding:2.5px 6px;border-radius:8px;background:radial-gradient(circle at 40% 35%,#FCE9AC,#E7BE52 62%,#C69214);box-shadow:0 0 0 1.5px #FBFAF7,0 0 6px 1px rgba(233,180,80,.7);color:#3a2c07;font:700 8px/1 Jost,sans-serif;letter-spacing:.1em;text-transform:uppercase}'},
  C_dot:{html:'<span class="cw-dot"></span>',css:'.cw-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-left:8px;vertical-align:middle;position:relative;top:-1px;background:radial-gradient(circle at 40% 35%,#FCE9AC,#E7BE52 62%,#C69214);box-shadow:0 0 5px 1px rgba(233,180,80,.65)}'}
};
for(const [name,v] of Object.entries(VAR)){
  const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3})).newPage();
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1100);
  const wrapped=await pg.evaluate(([h,c])=>{
    const st=document.createElement('style');st.textContent=c;document.head.appendChild(st);
    menuOpen();
    const rows=[...document.querySelectorAll('.menu-row')];
    const ask=rows.find(r=>r.textContent.trim().startsWith('Ask your Stylist'));
    ask.insertAdjacentHTML('beforeend',h);
    const base=Math.min(...rows.map(r=>r.getBoundingClientRect().height));
    return ask.getBoundingClientRect().height>base+8;
  },[v.html,v.css]);
  await pg.waitForTimeout(200);
  await pg.locator('.menu-panel').screenshot({path:'scratchpad/cw-'+name+'.png'});
  console.log(name.padEnd(12)+(wrapped?'WRAPS — too wide':'one line, fits'));
  await pg.context().close();
}
await b.close();srv.close();
