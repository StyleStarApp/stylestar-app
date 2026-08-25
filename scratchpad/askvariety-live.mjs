/* askvariety-live.mjs — 2026-08-25, from HER three refreshes of "Black midi
 * dress": the first set was six identical names at six stores; only the
 * refreshes gave her Mesh / Bandage / Sleeveless / V-Neck / Draped.
 * This measures the FIRST set, which is the one every woman sees.
 * ⚠️ Each run is a FRESH page, so _seenPicks is empty and no memory can help.
 * ⚠️ _ssAsk MUST be set AFTER _openShopStyleNow, which clears it.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs';
import { execFileSync } from 'child_process';

const ASK  = process.env.ASK  || 'Black midi dress';
const RUNS = Number(process.env.RUNS || 3);
const A=[8,8,9,9,9,6,6,4,6,6,6,6];
const norm=t=>t.toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(Boolean);
const askWords=new Set(norm(ASK));

async function run(label, html){
  const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(html)});
  await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  console.log('\n═══ '+label+'   ask: "'+ASK+'"');
  let bare=0, cards=0, uniq=0, longest=0;
  for(let i=0;i<RUNS;i++){
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
    await pg.evaluate(a=>{_openShopStyleNow('quiz');_ssAsk=a;_shopStyleGen()},ASK);
    await pg.waitForTimeout(1500); await pg.close();
    if(!p) throw new Error('NO PROMPT');
    // The control: a fresh page must carry NO memory line, or the thing that
    // produced her good refreshes would be doing the work instead of the fix.
    if(/already been shown these/.test(p)) throw new Error('MEMORY LINE PRESENT — not a first set');

    const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
      headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
      body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:p}]})});
    // ⚠️ The live function can answer with a plain-text gateway error, so read
    // the body as TEXT first. r.json() throws on "upstream connect error" and
    // kills the whole run three calls in.
    const raw=await r.text();
    let t=''; try{ t=(JSON.parse(raw).content?.[0]?.text)||'' }catch(e){
      console.log('  run '+(i+1)+': upstream error, skipped ('+raw.slice(0,40)+')'); await pg.close?.(); continue; }
    const m=t.match(/\{[\s\S]*\}/);
    let items=[]; try{ items=JSON.parse(m[0]).items||[] }catch(e){}
    const names=items.map(x=>x.name||'');
    const extra=names.map(n=>norm(n).filter(w=>!askWords.has(w)));
    const nb=extra.filter(e=>e.length===0).length;
    bare+=nb; cards+=items.length; uniq+=new Set(names.map(n=>n.toLowerCase())).size;
    items.forEach(x=>{ longest=Math.max(longest, norm(x.search||'').length) });
    console.log('  run '+(i+1)+': '+names.join(' · '));
    console.log('           '+nb+'/'+items.length+' bare, '+new Set(names.map(n=>n.toLowerCase())).size+' distinct names');
  }
  await b.close(); srv.close();
  return {bare,cards,uniq,longest};
}

const head=execFileSync('git',['show','HEAD:index.html'],{cwd:'/home/user/stylestar-app',maxBuffer:1<<28}).toString();
const now=fs.readFileSync('/home/user/stylestar-app/index.html','utf8');
const bf=await run('BEFORE (HEAD)',head);
const af=await run('AFTER  (working tree)',now);
console.log('\n────────── RESULT ──────────');
for(const [l,r] of [['BEFORE',bf],['AFTER ',af]])
  console.log(l+'  bare names '+r.bare+'/'+r.cards+'   distinct '+r.uniq+'/'+r.cards+'   longest search '+r.longest+' words');
