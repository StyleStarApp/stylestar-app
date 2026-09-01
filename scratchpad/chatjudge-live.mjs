/* ── scratchpad/chatjudge-live.mjs ───────────────────────────────────────────
   DOES THE MODEL ACTUALLY BEHAVE DIFFERENTLY? chatjudge.mjs proves what is IN
   the prompt; this proves what comes back out. Her question, and the honest
   answer needed a real test.

   ⚠️ IT POSTS THE REAL REQUEST, VERBATIM. An earlier attempt sent {system, ...}
   and got replies in markdown headings — because sendChat builds its prompt as
   messages[0].content with a primed assistant reply after it, so posting a
   `system` field meant the model received the bare question with NO system
   prompt at all. The whole messages array and search flag are captured off the
   page and forwarded untouched.
   ⚠️ Costs a few cents of the production key per run. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=9002;
let serveFile='index.html';
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/'+serveFile;
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function capture(sliders,question){
  const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  let body=null;
  await pg.route('**/.netlify/**',r=>{
    try{body=JSON.parse(r.request().postData()||'{}')}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:'{"content":[{"text":"ok"}]}'})});
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.route('https://plausible.io/**',r=>r.fulfill({status:200,body:''}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1200);
  await pg.evaluate(async([sl,q])=>{
    userName='Test'; answers=sl; quizTaken=true;
    topArchNames=getTopArch().map(a=>a.n);
    openChat(); await new Promise(r=>setTimeout(r,300));
    const i=document.getElementById('chatInput');
    i.value=q; i.dispatchEvent(new Event('input',{bubbles:true}));
    sendChat(); await new Promise(r=>setTimeout(r,700));
  },[sliders,question]);
  await pg.context().close();
  return body;
}
/* ⚠️ SEARCH IS TURNED OFF FOR THIS TEST, deliberately, and it is a real caveat to
   state with any result: a searching answer streams for 10-20s and this sandbox
   drops the socket partway. What is under test here is the STORE CHOICE, which
   is prompt-driven, so the non-searching path exercises exactly the thing that
   changed. It does NOT test how search results interact with the new ordering. */
async function ask(body){
  const b2=Object.assign({},body,{search:false});
  let r;
  try{
    r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
      headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
      body:JSON.stringify(b2),signal:AbortSignal.timeout(60000)});
  }catch(e){return '__ERR__ '+e.message}
  const ct=r.headers.get('content-type')||'';
  if(ct.includes('event-stream')){          // a searching answer streams
    const t=await r.text(); let out='';
    t.split('\n').forEach(l=>{ if(l.startsWith('data:')){
      try{const j=JSON.parse(l.slice(5)); if(j.delta&&j.delta.text)out+=j.delta.text}catch(e){} }});
    return out;
  }
  const j=await r.json();
  return (j.content&&j.content[0]&&j.content[0].text)||'';
}
const stores=t=>[...new Set((t.match(/from ([A-Z][A-Za-z0-9&'.\- +]{2,22})/g)||[]).map(x=>x.slice(5).trim()))];

/* ⚠️ THE QUESTIONS ARE FULLY SPECIFIED ON PURPOSE. A first pass asked "I need a
   cocktail dress for an event" and the model came back asking about the venue
   and the colour — which is GOOD styling and a real stylist's instinct, but it
   answers nothing about store choice. Leave a question worth asking and a good
   stylist will ask it. */
const CASES=[
  ['modest relaxed woman, cocktail dress',[3,2,3,3,4,5,3,3,2,4,1,3],
   'Name me three specific navy cocktail dresses, knee length with sleeves, for an indoor autumn wedding. Just the picks please, no questions.',
   ['Revolve','Alice + Olivia','Reformation']],
  ['glam trendy woman, linen dress',[10,10,8,9,8,6,8,8,10,9,10,10],
   'Name me three specific black linen dresses for a summer rooftop party. Just the picks please, no questions.',
   ['J.Jill',"Chico's",'Soft Surroundings']]
];

for(const [label,sl,q,wrong] of CASES){
  console.log('\n=== '+label+' ===');
  console.log('    stores that would be WRONG for her: '+wrong.join(', '));
  for(const [tag,file] of [['BEFORE (live yesterday)','scratchpad/_old.html'],['AFTER  (her judgment)','index.html']]){
    serveFile=file;
    const body=await capture(sl,q);
    if(!body||!body.messages){console.log('  '+tag+': FAILED to capture the request');continue}
    for(let run=1;run<=2;run++){
      const t=await ask(body);
      if(t.startsWith('__ERR__')){console.log('  '+tag+' run '+run+': '+t);continue}
      const named=stores(t), bad=wrong.filter(w=>t.includes(w));
      console.log('  '+tag+' run '+run+': '+(named.slice(0,6).join(', ')||'(no stores named)'));
      if(!named.length)console.log('        RAW: '+t.slice(0,300).replace(/\n/g,' '));
      console.log('        wrong-fit stores: '+(bad.length?'⚠️ '+bad.join(', '):'none'));
    }
  }
}
await b.close();srv.close();
