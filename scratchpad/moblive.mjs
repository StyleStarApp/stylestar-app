// Does the model actually honour a NAMED OCCASION now? (2026-08-23)
// Her mother typed "mother of the bride dresses" and got J.Crew Midi Occasion,
// Eileen Fisher Linen Midi, Nordstrom Midi Dress Navy, Talbots Shift Midi,
// Dillard's Chiffon Midi, LOFT Occasion Maxi. All dresses. No MOB dress.
//
// ⚠️ scratchpad/occasion.js proves the prompt CONTENT; only a live call can
// prove the model's COMPLIANCE, and this project's history says a prompt rule
// often needs a second, stronger pass before it lands.
// TWO runs per case deliberately — one clean run proves nothing (her own note
// on the work-appropriate dresses definition).
// Costs a few cents of the production key per run. The standing trade.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT=path.resolve(import.meta.dirname,'..'); const PORT=8997;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':p.endsWith('.css') ? 'text/css' : 'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

// Her mother-ish: relaxed, classic, natural, casual, neutral. The profile the
// whole design was measured against.
// ⚠️ TWELVE answers, not eleven. _hasQuizData requires exactly 12, and an
// 11-long seed is REJECTED: quizTaken stays false, _rankedStores falls back to
// raw table order and the occasion ranking never runs. It fails silently and
// looks exactly like a working test. Cost one wrong measurement on 2026-08-23.
const MUM=[3,2,6,6,3,6,3,6,3,6,3,6];

async function promptFor(ask){
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
  await pg.evaluate(()=>_openShopStyleNow('quiz'));
  await pg.waitForTimeout(1200);
  // ⚠️ The ask box COLLAPSED behind "Looking for something specific?" on
  // 2026-08-22, so it must be revealed before it can be filled. asklive.mjs
  // predates that change and would time out here.
  if(ask){ await pg.evaluate(()=>_ssAskReveal()); await pg.waitForTimeout(300);
           await pg.fill('#ssAskIn',ask); await pg.evaluate(()=>ssAskGo()); }
  else { await pg.evaluate(()=>_shopStyleGen()); }
  await pg.waitForTimeout(1500);
  await ctx.close(); return captured;
}
async function live(prompt){
  const r=await fetch('https://stylestar.app/.netlify/functions/style-ai',{method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body:JSON.stringify({max_tokens:900,messages:[{role:'user',content:prompt}]})});
  const d=await r.json();
  if(!d.content) return {err:JSON.stringify(d).slice(0,200)};
  try{ return JSON.parse(d.content.map(c=>c.text||'').join('').replace(/```json|```/g,'').trim()); }
  catch(e){ return {err:'unparseable'}; }
}

const ONLY=process.env.ONLY;
const CASES=[
  {ask:'mother of the bride dresses', want:/mother of the bride/i, label:'HER MOTHER — the phrase must be in EVERY search'},
  {ask:'wedding guest dress',         want:/wedding guest/i,       label:'wedding guest — also a real category'},
  {ask:'black tie gala',              want:null,                   label:'black tie — the phrase must NOT be in the search'},
  {ask:'tote bag',                    want:null,                   label:'CONTROL: an ordinary ask, must be unchanged'}
];

for(const c of CASES.filter(c=>!ONLY||c.ask.includes(ONLY))){
  const p=await promptFor(c.ask);
  console.log('\n══ "'+c.ask+'"  ('+c.label+')');
  for(let run=1;run<=2;run++){
    const out=await live(p);
    if(out.err){ console.log(`   run ${run}: ERROR ${out.err}`); continue; }
    const items=out.items||[];
    console.log(`   run ${run}:`);
    items.forEach(i=>console.log(`      ${String(i.store||'?').padEnd(20)} ${String(i.name||'?').padEnd(42)} search: "${i.search||'?'}"`));
    if(c.want){
      const hit=items.filter(i=>c.want.test(i.search||'')).length;
      console.log(`      ▶ searches carrying the occasion phrase: ${hit}/${items.length}`);
    }else if(c.ask==='black tie gala'){
      const bad=items.filter(i=>/black tie|gala/i.test(i.search||'')).length;
      console.log(`      ▶ searches wrongly carrying an abstract formality word: ${bad}/${items.length} (want 0)`);
    }
  }
}
const p0=await promptFor('');
console.log('\n══ CONTROL, no ask at all (ordinary six must not become monotonous)');
const o0=await live(p0);
console.log('   ',(o0.items||[]).map(i=>i.category).join(' · ')||o0.err);
await b.close(); srv.close();
