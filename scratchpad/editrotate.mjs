// Daily rotation of the "More from the Edit" home strip (her ask 2026-10-31).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { routePhotos } from './photocache.mjs';
const ROOT='/home/user/stylestar-app';let pass=0,fail=0;
const ok=(l,c,x)=>{console.log((c?'  ok  ':'FAIL  ')+l+(!c&&x?'   << '+x:''));c?pass++:fail++;};
const srv=http.createServer((rq,rs)=>{let p=decodeURIComponent(rq.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)){rs.writeHead(404);return rs.end();}
 rs.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':'application/octet-stream'});rs.end(fs.readFileSync(f));}).listen(0);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await (await b.newContext({viewport:{width:390,height:900}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await routePhotos(pg,{allow:()=>false});
await pg.addInitScript(()=>{localStorage.setItem('ss_data',JSON.stringify({userName:'Jen',answers:new Array(12).fill(6),topArchNames:['Timeless Classic'],motto:'x',portrait:'x'}));});
await pg.goto(`http://127.0.0.1:${srv.address().port}/`);await pg.waitForTimeout(1500);
const r=await pg.evaluate(()=>{
  const base=_wlEditItems().map(i=>i.name), rot=d=>_editTeaserRotate(base.map(n=>({name:n})),d).map(i=>i.name);
  const s=d=>{const w=_weekStar(d);return w?w.n:null;};
  return {base,oct30:rot(new Date(2026,9,30,12)),oct31:rot(new Date(2026,9,31,9)),oct31late:rot(new Date(2026,9,31,23,30)),nov1:rot(new Date(2026,10,1,12)),
    star:s(new Date(2026,10,1,12)),starNow:s(new Date(2026,9,31,12)),
    strip:[...document.querySelectorAll('#wbEditTeaser .wet-n')].map(e=>e.textContent)};
});
const n=r.base.length;
ok('oct 30 (day 0) is the Edit\'s own order',JSON.stringify(r.oct30)===JSON.stringify(r.base));
ok('today the old front three are now at the END',JSON.stringify(r.oct31.slice(-3))===JSON.stringify(r.base.slice(0,3)),r.oct31.slice(-3));
ok('same order all day long (a calendar, not a shuffle)',JSON.stringify(r.oct31)===JSON.stringify(r.oct31late));
ok('tomorrow leads with three different pieces',r.nov1.slice(0,3).every(x=>!r.oct31.slice(0,3).includes(x)));
ok('no piece lost or duplicated',new Set(r.nov1).size===n&&r.nov1.every(x=>r.base.includes(x)));
ok('the live strip really is rotated',r.strip.length>0&&r.strip[0]!==r.base.filter(x=>r.strip.includes(x))[0]);
ok('zero JS errors',!errs.length,errs[0]);
console.log('\nEdit order front:',r.base.slice(0,3));console.log('Today front:',r.oct31.slice(0,3));console.log('Tomorrow front:',r.nov1.slice(0,3));
console.log('Star today:',r.starNow,'| Star tomorrow (Nov 1):',r.star);
console.log(`\n${pass} passed, ${fail} failed`);await b.close();srv.close();process.exit(fail?1:0);
