// HOW FAR DOWN HER FIT LIST DOES THE MODEL REACH FOR AN OCCASION? (2026-08-23)
// The one residual from the occasion work: on "wedding guest dress" the model
// picked Revolve, which sits 99th of 101 for a quiet woman, because Revolve is
// famous for that occasion. This quantifies whether that is one occasion or the
// whole class, so Cath decides on numbers rather than on my speculation.
// Reports, for every store the model picks: its rank in HER fit list and its
// ALLURING score, which is the dimension she actually objected on.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8996;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.css') ? 'text/css' : 'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
// ⚠️ TWELVE answers, not eleven. _hasQuizData requires exactly 12, and an
// 11-long seed is REJECTED: quizTaken stays false, _rankedStores falls back to
// raw table order and the occasion ranking never runs. It fails silently and
// looks exactly like a working test. Cost one wrong measurement on 2026-08-23.
const MUM=[3,2,6,6,3,6,3,6,3,6,3,6];   // relaxed / classic / natural / casual / neutral

const ctx=await b.newContext({viewport:{width:390,height:844}});
const pg=await ctx.newPage(); let captured='';
await pg.route('**/.netlify/**',r=>{try{captured=JSON.parse(r.request().postData()||'{}').messages[0].content}catch(e){}
  r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:'{"items":[]}'}]})});});
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
await pg.evaluate(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Ellen',
  answers:a,topArchNames:['The Easygoing Natural'],portrait:'p',motto:'m'})),MUM);
await pg.reload(); await pg.waitForTimeout(2300);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  // Prove the seed took. A rejected seed is invisible otherwise.
  if(!await pg.evaluate(()=>quizTaken))throw new Error('SEED REJECTED: quizTaken is false, the ranking is not running');
await pg.evaluate(()=>_openShopStyleNow('quiz')); await pg.waitForTimeout(1200);

async function promptFor(ask){
  await pg.evaluate(()=>{_ssAsk='';});
  await pg.evaluate(()=>_ssAskReveal()); await pg.waitForTimeout(250);
  await pg.fill('#ssAskIn',ask); await pg.evaluate(()=>ssAskGo());
  await pg.waitForTimeout(1400); return captured;
}
async function live(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:prompt}]})});
  const d=await r.json(); if(!d.content)return {err:'api'};
  try{return JSON.parse(d.content.map(c=>c.text||'').join('').replace(/```json|```/g,'').trim())}catch(e){return {err:'parse'}}
}
const ASKS=['mother of the bride dresses','wedding guest dress','cocktail dress',
            'black tie gala','prom dress','something for a funeral','job interview outfit'];
console.log('Her alluring reads 2.4/10. Watching how far down the fit list the model reaches.\n');
for(const ask of ASKS){
  const p=await promptFor(ask);
  const out=await live(p);
  if(out.err){console.log(`══ "${ask}"  ERROR`);continue}
  const rows=await pg.evaluate(a=>{
    const f=_askOccF(), list=_rankedStores(f);
    return a.map(n=>({n,rank:list.indexOf(n)+1,allur:(STORES[n]?STORES[n].d[1]:null)}));
  },(out.items||[]).map(i=>i.store));
  const ranks=rows.filter(r=>r.rank>0).map(r=>r.rank);
  const worst=Math.max(...ranks), deep=rows.filter(r=>r.rank>60).length;
  const loud=rows.filter(r=>r.allur!=null&&r.allur>=7);
  console.log(`══ "${ask}"`);
  console.log('   '+rows.map(r=>`${r.n}(#${r.rank||'?'},a${r.allur??'?'})`).join(' '));
  console.log(`   deepest reach #${worst} · picks below #60: ${deep} · picks with alluring>=7: ${loud.length}`+
              (loud.length?' -> '+loud.map(r=>r.n).join(', '):''));
}
await b.close(); srv.close();
