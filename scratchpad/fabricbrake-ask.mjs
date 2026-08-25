/* fabricbrake-ask.mjs — the control that makes the brake a BRAKE and not a ban.
 * Her principle, 2026-08-25: Catherine's taste governs what the stylist OFFERS
 * unprompted, never what she FETCHES when a woman asks by name.
 * ⚠️ _ssAsk MUST be set AFTER _openShopStyleNow -- that function calls
 *    _syncShopAsk() which CLEARS it, and the prompt reads the GLOBAL. Typing
 *    into #ssAskIn looks healthy and reaches the prompt with nothing.
 */
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs';

const ANSWERS=[8,8,9,9,9,6,6,4,6,6,6,6];
const html=fs.readFileSync('/home/user/stylestar-app/index.html','utf8');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(html)});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function grab(ask){
  const pg=await b.newPage(); let prompt=null;
  await pg.route('**/*style-ai*',rt=>{
    try{prompt=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
    rt.fulfill({status:200,contentType:'application/json',body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
  });
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
    userName:'Catherine',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),ANSWERS);
  await pg.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(1000);
  await pg.evaluate(a=>{ _openShopStyleNow('quiz'); _ssAsk=a; _shopStyleGen(); },ask);
  await pg.waitForTimeout(1800);
  await pg.close();
  if(!prompt) throw new Error('NO PROMPT for ask="'+ask+'"');
  if(ask && prompt.indexOf(ask)<0) throw new Error('ASK NEVER REACHED THE PROMPT: '+ask);
  return prompt;
}

async function ai(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:prompt}]})});
  const t=((await r.json()).content?.[0]?.text)||''; const m=t.match(/\{[\s\S]*\}/);
  try{ return JSON.parse(m[0]).items||[] }catch(e){ return null }
}

for(const ask of (process.env.ASKS||'sequin dress,black satin blouse,velvet blazer').split(',')){
  const p=await grab(ask);
  const braked=/FABRICS TO USE SPARINGLY/.test(p);
  const listed=(p.match(/FABRICS TO USE SPARINGLY: ([^.]+)\./)||[])[1]||'none';
  const items=await ai(p);
  const kept=(items||[]).filter(i=>new RegExp(ask.split(' ').slice(-2,-1)[0]||ask,'i').test((i.name||'')+' '+(i.search||''))).length;
  console.log(`\nask "${ask}"  → brake still present: ${braked?('yes, on: '+listed):'no'}`);
  (items||[]).forEach(i=>console.log('   • '+i.name+'   [search: '+i.search+']'));
}
await b.close(); srv.close();
