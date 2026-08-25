/* honestword-live.mjs — 2026-08-25, HER catch: "Amazon actually does have
 * wetsuits." The honest line was explaining its limit as an INVENTORY FACT the
 * app cannot see and she can disprove in one tap. This runs her own four asks
 * against the live model, BEFORE and AFTER, and flags any inventory claim.
 * ⚠️ _ssAsk MUST be set AFTER _openShopStyleNow -- that function clears it.
 * ⚠️ Do NOT seed ss_prefs: a hand-made shape throws before the fetch.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs';
import { execFileSync } from 'child_process';

const ASKS = (process.env.ASKS || 'Wetsuit,Golf clubs,Baby gift,Girls shoes size 3').split(',');
const A=[8,8,9,9,9,6,6,4,6,6,6,6];
// The claim she can disprove by tapping through.
// ⚠️ THE FIRST VERSION OF THIS REGEX UNDER-COUNTED AND REPORTED A FALSE 0/4.
// It looked for "stores don't carry" and her real note read "wetsuit ISN'T
// something these stores carry" -- the negative sits on the subject, not the
// verb. Validated against the four real BEFORE notes (3 flagged) and the four
// AFTER ones (0) before being believed. ▶ A note may truthfully say what a
// store IS (curation). It may not claim what a store HOLDS.
const CLAIM=/not (?:stocked|carried|sold)|(?:stores?|retailers?|boutiques?) (?:carry|stock|sell|have)\b|(?:isn'?t|aren'?t|not) something (?:these|the) stores|every store here|no stores? (?:here|carry)/i;

async function run(label, html){
  const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(html)});
  await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  console.log('\n═══ '+label);
  let claims=0;
  for(const ask of ASKS){
    const pg=await b.newPage(); let p=null;
    await pg.route('**/*style-ai*',rt=>{
      try{p=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
      rt.fulfill({status:200,contentType:'application/json',
        body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
    });
    await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
      userName:'Catherine',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),A);
    await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
    await pg.waitForTimeout(900);
    await pg.evaluate(a=>{_openShopStyleNow('quiz');_ssAsk=a;_shopStyleGen()},ask);
    await pg.waitForTimeout(1500); await pg.close();
    if(!p) throw new Error('NO PROMPT for '+ask);
    if(p.indexOf(ask)<0) throw new Error('ASK NEVER REACHED THE PROMPT: '+ask);

    const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
      headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
      body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:p}]})});
    const t=((await r.json()).content?.[0]?.text)||''; const m=t.match(/\{[\s\S]*\}/);
    let note='', items=[];
    try{ const j=JSON.parse(m[0]); note=j.note||''; items=j.items||[] }catch(e){ note='(unparseable)' }
    const bad=CLAIM.test(note); if(bad) claims++;
    console.log('\n  ask "'+ask+'"  '+items.length+' cards'+(bad?'   ⚠ INVENTORY CLAIM':''));
    if(note) console.log('    note: '+note);
    if(items.length) console.log('    → '+items.map(i=>i.name).join(' · '));
  }
  await b.close(); srv.close();
  return claims;
}

const head=execFileSync('git',['show','HEAD:index.html'],{cwd:'/home/user/stylestar-app',maxBuffer:1<<28}).toString();
const now=fs.readFileSync('/home/user/stylestar-app/index.html','utf8');
const before=await run('BEFORE (HEAD)', head);
const after =await run('AFTER  (working tree)', now);
console.log('\n────────── RESULT ──────────');
console.log('inventory claims  BEFORE: '+before+'/'+ASKS.length+'   AFTER: '+after+'/'+ASKS.length);
