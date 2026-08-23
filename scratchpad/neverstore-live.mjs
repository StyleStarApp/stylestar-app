/* ── scratchpad/neverstore-live.mjs ──────────────────────────────────────────
   KATHY'S CASE, AGAINST THE REAL MODEL. She ticked "Bodycon/tight dresses" as a
   hard no and asked for long dresses; the app sent her to Revolve, whose whole
   dress range is body-conscious.

   ⚠️ WHY THIS RUNS LIVE AND A STATIC CHECK WOULD NOT DO. The fix is a PROMPT
   rule, and this project's own history says a prompt rule is only real if the
   model follows it: the work-appropriate-dresses definition read correctly and
   was ignored until it was rewritten as an imperative NEVER inside the RULES
   list, and the name/search parity rule needed a WRONG/RIGHT example pair before
   it landed. Checking that the words are present proves nothing.
   ⚠️ Costs a few cents of the production key per run — the standing trade.

   Pattern from CLAUDE.md: capture the REAL prompt off the edited page, then POST
   it to the live function with the Origin header. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8993;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});

/* Kathy as best we can model her: relaxed, modest, and the bodycon chip ticked.
   ⚠️ These sliders are an APPROXIMATION - her real answers would turn this from
   predicted to measured, exactly as with Cath's mother's profile. */
const SLIDERS=[4,3,4,4,4,5,4,4,3,5,3,4];

async function capture(neverWear){
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const pg=await ctx.newPage(); let captured='';
  await pg.route('**/.netlify/**',r=>{
    try{captured=JSON.parse(r.request().postData()||'{}').messages[0].content}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:'{"content":[{"text":"{\\"items\\":[]}"}]}'});
  });
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.route('https://plausible.io/**',r=>r.fulfill({status:200,body:''}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1200);
  await pg.evaluate(async([sl,nw])=>{
    userName='Kathy'; answers=sl; quizTaken=true;
    topArchNames=getTopArch().map(a=>a.n);
    prefs.neverWear=nw;
    /* ⚠️ SET THE GLOBAL, NOT THE INPUT — and the first version of this harness
       did the latter and silently proved nothing. _openShopStyleNow CLEARS the
       box on entry and generates immediately, and the prompt reads a global
       `_ssAsk` rather than the field, so typing into the input after opening
       produced a perfectly healthy run of the ORDINARY six-piece mix. It came
       back with Sam Edelman and Gorjana for "long dresses", which is the tell:
       accessories mean no ask was in force. ▶ A live harness that does not
       assert its own SETUP landed will happily report a clean result for a
       scenario it never ran - the same shape as the 11-answer seed that cost a
       withdrawn finding on 2026-08-23. The caller checks the ask is really in
       the prompt before spending anything on the model. */
    _openShopStyleNow('quiz');
    await new Promise(r=>setTimeout(r,200));
    _ssAsk='long dresses';
    _shopStyleGen();
    await new Promise(r=>setTimeout(r,700));
  },[SLIDERS,neverWear]);
  await b.close();
  return captured;
}

async function ask(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:1400})});
  const j=await r.json();
  const t=(j.content&&j.content[0]&&j.content[0].text)||'';
  try{return JSON.parse(t.slice(t.indexOf('{'),t.lastIndexOf('}')+1)).items||[]}catch(e){return []}
}

await new Promise(r=>srv.listen(PORT,r));
const FITTED9=['Revolve','Reformation','Good American','Alice + Olivia','Zara','Aritzia',
  'White House Black Market','Express','Bergdorf Goodman','Veronica Beard','AllSaints','Gucci'];

for(const [label,nw] of [['WITH her hard no',['Bodycon/tight dresses']],['CONTROL - no hard no',[]]]){
  const prompt=await capture(nw);
  if(!prompt){console.log(label+': FAILED to capture a prompt');continue}
  const hasRule=/NEVER-WEAR LIST ALSO GOVERNS/.test(prompt);
  const hasAsk=/long dresses/.test(prompt);
  console.log('\n'+label+'  (store rule: '+hasRule+' | ask reached the prompt: '+hasAsk+')');
  if(!hasAsk){console.log('  ABORT: the ask never landed, so this run cannot reproduce her case');continue}
  for(let run=1;run<=2;run++){
    const items=await ask(prompt);
    const stores=items.map(i=>i.store);
    const bad=stores.filter(s=>FITTED9.includes(s));
    console.log('  run '+run+': '+(stores.join(', ')||'(nothing)'));
    console.log('         body-conscious stores: '+(bad.length?bad.join(', '):'NONE'));
  }
}
srv.close();
