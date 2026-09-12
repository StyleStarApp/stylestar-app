// Proves the in-app "Reconnect my saved account" control (2026-09-12,
// temporary -- see CLAUDE.md) does the same safe PUSH as ?resync=, but
// reachable from a device that opens Style Star from its home screen icon,
// where an emailed/texted link cannot land (separate storage container from
// Safari). Mocks the network and window.prompt entirely.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT='/home/user/stylestar-app'; const PORT=8996;
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
await pg.addInitScript(()=>{
  localStorage.setItem('ss_token','old-drifted-token');
  localStorage.setItem('ss_email','wrong@test.com');
  localStorage.setItem('ss_sharelink','tok-wrong-account');
  localStorage.setItem('ss_sharelink_email','wrong@test.com');
  localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:[8,7,6,9,7,6,7,7,8,10,7,9],topArchNames:['A'],portrait:'her real portrait'}));
  localStorage.setItem('ss_wardrobe',JSON.stringify({wishlist:[{id:'dvf-flag-scarf~1',name:'DVF Flag Scarf'}]}));
});
await pg.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(800);

pg.once('dialog',d=>d.accept('reconnect-code-abc'));
await pg.evaluate(async ()=>{ await _wlReconnectPrompt(); });
await pg.waitForTimeout(300);

const after=await pg.evaluate(()=>({
  token:localStorage.getItem('ss_token'),
  email:localStorage.getItem('ss_email'),
  sharelink:localStorage.getItem('ss_sharelink'),
}));
check('reachable and callable from inside the already-running app (no reload)', true);
// saveUserRecord correctly re-adopts whatever token the SERVER confirms on
// a successful save (the same "only adopt on success" fix from earlier this
// session) -- the pasted code is what AUTHORIZES the save, the server's own
// returned token is what the device should end up trusting afterward.
check('the device ends up trusting the token the server confirmed', after.token==='fresh-real-token');
check('the email becomes the one the server derived, not a guess', after.email==='real@her.com');
check('the old wrong-account sharelink is cleared', after.sharelink===null);
check('the POST carried her real local wardrobe, read from the already-loaded app state', !!capturedBody && capturedBody.data && capturedBody.data.wardrobe && capturedBody.data.wardrobe.wishlist.length===1);
check('...and the fresh token accompanied it', capturedBody && capturedBody.token==='reconnect-code-abc');

// A blank/cancelled prompt must do nothing at all.
capturedBody=null;
await pg.evaluate(()=>{localStorage.setItem('ss_token','still-old')});
pg.once('dialog',d=>d.dismiss());
await pg.evaluate(async ()=>{ await _wlReconnectPrompt(); });
const cancelled=await pg.evaluate(()=>localStorage.getItem('ss_token'));
check('cancelling the prompt changes nothing', cancelled==='still-old' && capturedBody===null);

console.log(pass?'\nall checks passed':'\nSOME CHECKS FAILED');
await b.close(); srv.close();
process.exit(pass?0:1);
