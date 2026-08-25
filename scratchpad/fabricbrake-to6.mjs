/* to6 "Dressy or going-out tops" is HER deliberate exception (2026-08-15):
 * "that is more of a dressy or going out top so let's put it there instead."
 * The brake must stand down there, or the fix quietly deletes her own call. */
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs';
const html=fs.readFileSync('/home/user/stylestar-app/index.html','utf8');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(html)});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function ideaPrompt(slot){
  const pg=await b.newPage(); let prompt=null;
  await pg.route('**/*style-ai*',rt=>{
    try{prompt=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
    rt.fulfill({status:200,contentType:'application/json',body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
  });
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
    userName:'Catherine',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),
    [8,8,9,9,9,6,6,4,6,6,6,6]);
  await pg.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(1000);
  await pg.evaluate(s=>{
    const d=document.createElement('div'); d.id='probeBox';
    d.innerHTML='<div class="wdr-ideas-grid"></div>'; document.body.appendChild(d);
    _wardrobeIdeaGen(s,'probeBox');
  },slot);
  await pg.waitForTimeout(1600);
  await pg.close();
  if(!prompt) throw new Error('NO PROMPT for slot '+slot);
  return prompt;
}
async function ai(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:700,messages:[{role:'user',content:prompt}]})});
  const t=((await r.json()).content?.[0]?.text)||''; const m=t.match(/\{[\s\S]*\}/);
  try{ return JSON.parse(m[0]).items||[] }catch(e){ return null }
}
for(const slot of ['to6','to1','dr1']){
  const p=await ideaPrompt(slot);
  const brake=/FABRICS TO USE SPARINGLY/.test(p);
  const hersat=/Satin belongs here/.test(p);
  console.log(`\n${slot}: brake ${brake?'ON':'stands down'} | her "Satin belongs here" line ${hersat?'present':'absent'}`);
  const items=await ai(p);
  (items||[]).forEach(i=>console.log('   • '+i.name));
}
await b.close(); srv.close();
