// Row 18 live diagnosis ("Couldn't load options right now" on Shop your Style).
// Both external leads (Anthropic outage, the Sep 10-11 SerpApi outage) are ruled
// out 2026-09-15, and promptcap.mjs proves the 32KB ladder still holds with margin.
// The one candidate nobody has actually live-tested: a model reply _aiJSON cannot
// extract anything from -- specifically a REFUSAL with no JSON object at all,
// the exact shape her 2026-08-25 captures showed before _aiJSON was built.
// Capture pattern lifted straight from promptcap.mjs (set _ssAsk, call
// _shopStyleGen(), intercept the route) so it survives the real app's markup
// changing under an input-fill script. Costs a few cents of the production key.
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs';
const ROOT='/home/user/stylestar-app';
const h=fs.readFileSync(ROOT+'/index.html','utf8');
const aiJSONsrc=h.match(/function _aiJSON\(raw\)\{[\s\S]*?\n\}/)[0];
const _aiJSON=new Function('raw',aiJSONsrc+'\nreturn _aiJSON(raw);');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(h)});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function promptFor(ask){
  const pg=await b.newPage(); let p=null;
  await pg.route('**/*style-ai*',rt=>{
    try{p=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
    rt.fulfill({status:200,contentType:'application/json',body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
  });
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',answers:a,
    topArchNames:['The Timeless Classic'],portrait:'x',motto:'m'})),[6,6,6,6,6,6,6,6,6,6,6,6]);
  await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);
  await pg.evaluate((a)=>{_openShopStyleNow('quiz');_ssAsk=a;_shopStyleGen();},ask);
  await pg.waitForTimeout(1500);
  await pg.close();
  if(!p) throw new Error('NO PROMPT CAPTURED for "'+ask+'"');
  return p;
}

async function liveRaw(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:700,messages:[{role:'user',content:prompt}]})});
  if(!r.ok) return {httpErr:r.status};
  const d=await r.json();
  if(!d.content) return {httpErr:'no content field: '+JSON.stringify(d).slice(0,200)};
  return {raw:d.content.map(c=>c.text||'').join('')};
}

// asks chosen to try to reproduce her 2026-08-25 captures: things Catherine
// might refuse outright rather than shop.
const ASKS=['skinny jeans','a baby gift','girls shoes size 3','ribbed tank top'];
let fails=0, total=0;
for (const ask of ASKS){
  const p = await promptFor(ask);
  for (let run=1; run<=2; run++){
    total++;
    const {raw,httpErr} = await liveRaw(p);
    if(httpErr){ console.log('FAIL  "'+ask+'" run'+run+'  HTTP/response error: '+httpErr); fails++; continue; }
    try{ _aiJSON(raw); console.log('PASS  "'+ask+'" run'+run+'  _aiJSON extracted cleanly'); }
    catch(e){ console.log('FAIL  "'+ask+'" run'+run+'  _aiJSON THREW: '+e.message+'\n      raw reply: '+raw.slice(0,500)); fails++; }
  }
}
console.log('\n'+total+' live calls, '+fails+' reproduced the "Couldn\'t load options" failure shape');
await b.close(); srv.close();
process.exit(fails?1:0);
