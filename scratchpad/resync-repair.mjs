// Proves the ?resync=<token> one-time recovery path (2026-09-12) does exactly
// what it must and nothing else: point this device at the CORRECT account and
// PUSH its already-correct local data up, never PULL the server's copy down
// over it. Mocks the network entirely -- this must never touch the real
// live account from an automated run.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT='/home/user/stylestar-app'; const PORT=8995;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.css')?'text/css':'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage();
pg.on('pageerror',e=>console.log('PAGEERROR:',e.message));

let pass=true;
function check(name,ok){console.log((ok?'✓ ':'✗ FAIL: ')+name);if(!ok)pass=false;}

let capturedBody=null;
await pg.route('**/.netlify/functions/user-data',rt=>{
  const req=rt.request();
  if(req.method()==='POST'){
    try{capturedBody=JSON.parse(req.postData())}catch(e){}
    return rt.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({success:true,saved:true,token:'fresh-real-token',email:'real@her.com'})});
  }
  rt.continue();
});

// Seed this "phone" with real-looking local data BEFORE the repair runs --
// this is the data the repair must push up untouched, never something it
// fetches back from the server.
await pg.addInitScript(()=>{
  localStorage.setItem('ss_token','old-drifted-token');
  localStorage.setItem('ss_email','wrong@test.com');
  localStorage.setItem('ss_sharelink','tok-wrong-account');
  localStorage.setItem('ss_sharelink_email','wrong@test.com');
  localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:[8,7,6,9,7,6,7,7,8,10,7,9],topArchNames:['A'],portrait:'her real portrait'}));
  localStorage.setItem('ss_wardrobe',JSON.stringify({wishlist:[{id:'dvf-flag-scarf~1',name:'DVF Flag Scarf'},{id:'saint-laurent-sunglasses~1',name:'Saint Laurent Sunglasses'}]}));
});

await pg.goto('http://localhost:'+PORT+'/?resync=fresh-restore-token',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(1500);

const after=await pg.evaluate(()=>({
  token:localStorage.getItem('ss_token'),
  email:localStorage.getItem('ss_email'),
  sharelink:localStorage.getItem('ss_sharelink'),
  sharelinkEmail:localStorage.getItem('ss_sharelink_email'),
  url:location.search
}));

check('the device token is now the fresh one', after.token==='fresh-real-token');
check('the email is now the one the SERVER derived, not a guess', after.email==='real@her.com');
check('the old wrong-account sharelink is gone', after.sharelink===null);
check('...and its owner tag with it', after.sharelinkEmail===null);
check('the resync param is scrubbed from the URL (never reusable by refresh)', after.url==='');
check('the POST carried her real local data, not something re-fetched', !!capturedBody && capturedBody.data && capturedBody.data.wardrobe && Array.isArray(capturedBody.data.wardrobe.wishlist) && capturedBody.data.wardrobe.wishlist.length===2);
check('...her real answers rode along too', !!capturedBody && capturedBody.data && Array.isArray(capturedBody.data.answers) && capturedBody.data.answers[9]===10);
check('...and no email was guessed client-side -- the server derived it from the token', capturedBody && capturedBody.email==='');
check('...the fresh token accompanied the save', capturedBody && capturedBody.token==='fresh-restore-token');

console.log(pass?'\nall checks passed':'\nSOME CHECKS FAILED');
await b.close(); srv.close();
process.exit(pass?0:1);
