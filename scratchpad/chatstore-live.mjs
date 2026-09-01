/* ⚠️⚠️ READ THIS BEFORE TRUSTING A RUN OF THIS FILE. It captures the chat's real
   system prompt correctly (the store-rule and never-wear assertions below are
   sound), but the ANSWERS it gets back are NOT the app's chat: posting the
   system prompt straight to the function does not reproduce the real call - the
   live chat also carries search:true and its tool config, and the replies come
   back in markdown headings, which is not the voice the real chat produces. So
   this file PROVES WHAT IS IN THE PROMPT and proves nothing about what the model
   does with it. Do not quote its store lists as evidence.
   ▶ To make it real, drive the actual chat UI end to end against the live
   function rather than re-posting the captured prompt.

   Kathy's real surface. Her conversation was open, so she was in the STYLIST
   CHAT, not Shop your style — and the chat is the one shopping surface that gets
   a BARE ALPHABETICAL LIST of all 102 store names, with no ranking and no
   dimension data. It knew she never wears bodycon dresses; it had no way to know
   Revolve IS one, and no ranking placing Revolve 102nd for her.
   ⚠️ Costs a few cents of the production key per run. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8994;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
const SLIDERS=[4,3,4,4,4,5,4,4,3,5,3,4];
async function captureChat(neverWear){
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  let sys='';
  await pg.route('**/.netlify/**',r=>{
    try{const d=JSON.parse(r.request().postData()||'{}');sys=d.system||(d.messages&&d.messages[0].content)||''}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:'{"content":[{"text":"ok"}]}'});
  });
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.route('https://plausible.io/**',r=>r.fulfill({status:200,body:''}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1200);
  await pg.evaluate(async([sl,nw])=>{
    userName='Kathy'; answers=sl; quizTaken=true;
    topArchNames=getTopArch().map(a=>a.n); prefs.neverWear=nw;
    openChat(); await new Promise(r=>setTimeout(r,400));
    const i=document.getElementById('chatInput');
    i.value='I need a long dress for an event. What do you suggest?';
    i.dispatchEvent(new Event('input',{bubbles:true}));
    sendChat(); await new Promise(r=>setTimeout(r,700));
  },[SLIDERS,neverWear]);
  await b.close(); return sys;
}
async function ask(sys){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({system:sys,messages:[{role:'user',content:'I need a long dress for an event. What do you suggest?'}],max_tokens:900})});
  const j=await r.json();
  return (j.content&&j.content[0]&&j.content[0].text)||'';
}
const FITTED9=['Revolve','Reformation','Good American','Alice + Olivia','Zara','Aritzia',
  'White House Black Market','Express','Veronica Beard','AllSaints','Bergdorf Goodman','Gucci'];
await new Promise(r=>srv.listen(PORT,r));
for(const [label,nw] of [['WITH her hard no',['Bodycon/tight dresses']],['CONTROL - no hard no',[]]]){
  const sys=await captureChat(nw);
  const hasRule=/NEVER-WEAR LIST ALSO GOVERNS/.test(sys);
  const knowsNever=/Never wear: Bodycon/.test(sys);
  console.log('\n'+label+'  (store rule: '+hasRule+' | knows her never-wear: '+knowsNever+')');
  if(!sys){console.log('  ABORT: no system prompt captured');continue}
  for(let run=1;run<=3;run++){
    const t=await ask(sys);
    const named=FITTED9.filter(x=>t.includes(x));
    const stores=[...new Set((t.match(/from ([A-Z][A-Za-z0-9&'.\- +]{2,24})/g)||[]).map(x=>x.slice(5).trim()))];
    console.log('  run '+run+': '+(stores.join(', ')||'(none parsed)  RAW: '+t.slice(0,160).replace(/\n/g,' ')));
    console.log('         body-conscious: '+(named.length?named.join(', '):'NONE'));
  }
}
srv.close();
