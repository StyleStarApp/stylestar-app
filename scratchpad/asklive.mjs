// Does the model actually honour her ask now? Only a LIVE call can answer that —
// the suite proves the prompt CONTENT, never the model's compliance.
// Her failing case: she typed "bags" and got a dress, trousers, heels, rings and a
// blazer. One bag out of six.
// Pattern from CLAUDE.md: capture the real prompt off the edited page, then POST it
// to the live function with the Origin header. Costs a few cents of the production
// key per run — the standing trade for proving a prompt change.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8999;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

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
  if(ask){ await pg.fill('#ssAskIn',ask); await pg.evaluate(()=>ssAskGo()); }
  else { await pg.evaluate(()=>_shopStyleGen()); }
  await pg.waitForTimeout(1500);
  await ctx.close(); return captured;
}

async function live(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:700,messages:[{role:'user',content:prompt}]})});
  const d=await r.json();
  if(!d.content) return {err:JSON.stringify(d).slice(0,200)};
  try{ return JSON.parse(d.content.map(c=>c.text||'').join('').replace(/```json|```/g,'').trim()); }
  catch(e){ return {err:'unparseable'}; }
}

for (const ask of ['bags','a floor length gown','white tops under $100']) {
  const p = await promptFor(ask);
  console.log('\n══ she asked for: "'+ask+'"');
  console.log('   prompt reframed:', /is looking for: "/.test(p) ? 'yes' : 'NO');
  console.log('   mix-categories bullet present:', /Mix categories and price points/.test(p) ? 'YES (bad)' : 'no');
  for (let run=1; run<=2; run++){          // one clean run proves nothing
    const out = await live(p);
    if(out.err){ console.log(`   run ${run}: ERROR ${out.err}`); continue; }
    const items=(out.items||[]);
    console.log(`   run ${run}:`, items.map(i=>`${i.category||'?'}/${i.name}`).join(' · ') || '(none)');
  }
}
const p0 = await promptFor('');
console.log('\n══ control, NO ask');
console.log('   mix-categories bullet present:', /Mix categories and price points/.test(p0) ? 'yes (correct)' : 'NO (bad)');
const out0 = await live(p0);
console.log('   run 1:', (out0.items||[]).map(i=>i.category).join(' · ') || out0.err);
await b.close(); srv.close();
