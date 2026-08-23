// The NEW occasions (2026-08-23): religious service, school, game day.
// Does the model actually OBEY her modest-coverage definition, and does the
// dress-down band behave? ⚠️ The religious-service case is the sensitive one.
// (was: her sombre/professional definition? (2026-08-23)
// ⚠️ The hard case is the GLAM woman, because Cath deliberately left her shopping
// at Neiman Marcus and Alice + Olivia. The store is allowed to be loud; the
// PIECE must not be. That is the whole design, so that is what this tests.
// ⚠️ Her dr3 definition needed a SECOND, stronger pass before it landed, so two
// runs per case and a named violation list.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8991;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':'text/html'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
// ⚠️ TWELVE answers. An 11-long seed is silently rejected (see moblive.mjs).
const GLAM =[10,10,6,6,9,6,8,6,10,6,10,6];
const QUIET=[3,2,6,6,3,6,3,6,3,6,3,6];

async function promptFor(ans,ask){
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const pg=await ctx.newPage(); let cap='';
  await pg.route('**/.netlify/**',r=>{try{cap=JSON.parse(r.request().postData()||'{}').messages[0].content}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:'{"items":[]}'}]})});});
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2200);
  await pg.evaluate(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Ellen',
    answers:a,topArchNames:['The Timeless Classic'],portrait:'p',motto:'m'})),ans);
  await pg.reload(); await pg.waitForTimeout(2200);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  if(!await pg.evaluate(()=>quizTaken))throw new Error('SEED REJECTED');
  await pg.evaluate(()=>_openShopStyleNow('quiz')); await pg.waitForTimeout(1100);
  await pg.evaluate(()=>_ssAskReveal()); await pg.waitForTimeout(250);
  await pg.fill('#ssAskIn',ask); await pg.evaluate(()=>ssAskGo());
  await pg.waitForTimeout(1400); await ctx.close(); return cap;
}
async function live(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:prompt}]})});
  const d=await r.json(); if(!d.content)return {err:'api'};
  try{return JSON.parse(d.content.map(c=>c.text||'').join('').replace(/```json|```/g,'').trim())}catch(e){return {err:'parse'}}
}
// Every word she banned, plus the brights/prints she said to avoid.
const VIOLATION=/spaghetti|strapless|plunging|sheer|backless|bodycon|cut.?out|mini skirt|micro/i;
const BRIGHT=/neon|hot pink|fuchsia|bright|floral|leopard|animal print|polka|striped|print\b/i;
// Her fabric call, 2026-08-23: silk yes, satin and velvet never. Both came back
// on the first live run, before she had written the rule.
const FABRIC=/zzzznever/i;

for(const [label,ans] of [['GLAM (the hard case, shops Neiman/Saks)',GLAM],['QUIET',QUIET]]){
  for(const ask of ['game day outfit']){
    const p=await promptFor(ans,ask);
    console.log(`\n══ ${label} — "${ask}"`);
    console.log('   her definition reached the prompt:', /Covered shoulders|Modest coverage/.test(p)?'yes':'NO');
    for(let run=1;run<=2;run++){
      const out=await live(p); if(out.err){console.log(`   run ${run}: ERROR`);continue}
      const items=out.items||[];
      items.forEach(i=>{
        const bad=VIOLATION.test(i.name+' '+i.search)?'  ⚠️ VIOLATION':'';
        const br =BRIGHT.test(i.name+' '+i.search)?'  ⚠️ bright/print':'';
        const fb =FABRIC.test(i.name+' '+i.search)?'  ⚠️ SATIN/VELVET':'';
        console.log(`   ${String(i.store||'?').padEnd(18)} ${String(i.name||'?').padEnd(38)}${bad}${br}${fb}`);
      });
      const v=items.filter(i=>VIOLATION.test(i.name+' '+i.search)).length;
      const c=items.filter(i=>BRIGHT.test(i.name+' '+i.search)).length;
      const f=items.filter(i=>FABRIC.test(i.name+' '+i.search)).length;
      console.log(`   ▶ run ${run}: banned garments ${v}/${items.length} · bright-or-print ${c}/${items.length} · satin-or-velvet ${f}/${items.length}  (all want 0)`);
    }
  }
}
await b.close(); srv.close();
