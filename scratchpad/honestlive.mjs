// 🚨 HER FOUR FAILURES (2026-08-25). "Pants for men" returned the honest line
// perfectly; "Baby gift", "Girls shoes size 3", "Skinny jeans plus size" and
// "Skinny jeans" all showed "Couldn't load options right now" -- the CATCH block,
// which means something THREW. Capture the RAW model reply, never guess.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8997;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

async function promptFor(ask){
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const pg=await ctx.newPage(); let captured='';
  await pg.route('**/.netlify/**',r=>{try{captured=JSON.parse(r.request().postData()||'{}').messages[0].content}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:'{"items":[]}'}]})});});
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
  await pg.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Cath',
    answers:new Array(12).fill(6),topArchNames:['The Timeless Classic'],portrait:'p',motto:'m'})));
  await pg.reload(); await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  await pg.evaluate(()=>_openShopStyleNow('quiz'));
  await pg.waitForTimeout(1200);
  await pg.evaluate(()=>_ssAskReveal&&_ssAskReveal());
  await pg.fill('#ssAskIn',ask); await pg.evaluate(()=>ssAskGo());
  await pg.waitForTimeout(1500);
  // ⚠️ ABORT rather than report a clean run if the ask never reached the prompt.
  if(!captured||captured.indexOf(ask)===-1) throw new Error('ask "'+ask+'" not in captured prompt');
  await ctx.close(); return captured;
}
async function raw(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:700,messages:[{role:'user',content:prompt}]})});
  if(!r.ok) return {http:r.status, body:(await r.text()).slice(0,300)};
  const d=await r.json();
  if(!d.content) return {noContent:JSON.stringify(d).slice(0,300)};
  const txt=d.content.map(c=>c.text||'').join('');
  const stop=d.stop_reason||'(none reported)';
  let parses=true, perr='';
  try{ JSON.parse(txt.replace(/```json|```/g,'').trim()); }catch(e){ parses=false; perr=String(e.message).slice(0,90); }
  return {stop, parses, perr, len:txt.length, txt};
}
for (const ask of ['Pants for men','Baby gift','Girls shoes size 3','Skinny jeans plus size','Skinny jeans']) {
  const p=await promptFor(ask);
  const res=await raw(p);
  console.log('\n════ "'+ask+'"  (prompt '+p.length+' chars)');
  console.log('   stop_reason: '+res.stop+'   JSON parses: '+(res.parses?'YES':'*** NO *** '+res.perr)+'   reply '+res.len+' chars');
  console.log('   RAW: '+String(res.txt||res.body||res.noContent).replace(/\n/g,'\n        ').slice(0,900));
}
await b.close(); srv.close();
