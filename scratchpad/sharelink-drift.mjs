// Verifies a cached share link can no longer silently drift to the wrong
// account. Her real bug: `ss_sharelink` was cached forever with no check
// that it still belongs to whichever email this device is CURRENTLY saving
// under (`ss_email`) -- so a token minted for an old/different email kept
// being shown and copied as "your current link" even after her real
// wishlist moved on. Fixed via `ss_sharelink_email`, checked in `_wlShareLink()`.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT='/home/user/stylestar-app'; const PORT=8994;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage();
pg.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await pg.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(800);

let pass=true;
function check(name,ok){console.log((ok?'✓ ':'✗ FAIL: ')+name);if(!ok)pass=false;}

// 1. A token minted for the CURRENT email is trusted.
let r1=await pg.evaluate(()=>{
  localStorage.setItem('ss_email','cath@real.com');
  localStorage.setItem('ss_sharelink','tok-real');
  localStorage.setItem('ss_sharelink_email','cath@real.com');
  return _wlShareLink();
});
check('a token minted for the current email is returned', r1==='tok-real');

// 2. Simulate her actual bug: ss_email moved on (a restore, a re-save under
//    a different address) but the OLD token+owner-tag are still cached.
let r2=await pg.evaluate(()=>{
  localStorage.setItem('ss_sharelink','tok-real');
  localStorage.setItem('ss_sharelink_email','old@test.com');
  localStorage.setItem('ss_email','cath@real.com');
  return {tok:_wlShareLink(), leftBehind:localStorage.getItem('ss_sharelink')};
});
check('a token minted for a DIFFERENT email is refused', r2.tok==='');
check('...and the stale token is cleared out, not left to be shown again', r2.leftBehind===null);

// 3. Her exact real-world case: a token cached before this fix shipped
//    carries NO owner tag at all. It must not be trusted either -- there is
//    no way to prove it still belongs to this device's current account.
let r3=await pg.evaluate(()=>{
  localStorage.setItem('ss_sharelink','tok-legacy-untagged');
  localStorage.removeItem('ss_sharelink_email');
  localStorage.setItem('ss_email','cath@real.com');
  return _wlShareLink();
});
check('a legacy token with no owner tag is refused, not assumed hers', r3==='');

// 4. Minting a fresh link tags it with the email it was made for.
await pg.route('**/.netlify/functions/user-data',rt=>rt.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({success:true,shareToken:'tok-fresh'})
}));
let r4=await pg.evaluate(async ()=>{
  localStorage.setItem('ss_email','cath@real.com');
  localStorage.setItem('ss_token','x');
  await wlShareGet();
  return {tok:localStorage.getItem('ss_sharelink'), owner:localStorage.getItem('ss_sharelink_email')};
});
check('a freshly minted link is tagged with the minting email', r4.tok==='tok-fresh' && r4.owner==='cath@real.com');

// 5. "Stop sharing" clears the owner tag along with the token.
global.confirmed=true;
await pg.evaluate(()=>{window.confirm=()=>true});
let r5=await pg.evaluate(async ()=>{
  await wlShareStop();
  return {tok:localStorage.getItem('ss_sharelink'), owner:localStorage.getItem('ss_sharelink_email')};
});
check('stopping sharing clears the owner tag too', r5.tok===null && r5.owner===null);

console.log(pass?'\nall checks passed':'\nSOME CHECKS FAILED');
await b.close(); srv.close();
process.exit(pass?0:1);
