/* fabricbrake-live.mjs — 2026-08-25, Cath's satin/sequins catch.
 *
 * Her evidence was four live refreshes of Shop your style (23 cards, 6 of them
 * satin/sequins/velvet, two each). This re-runs that experiment against the
 * REAL live model, BEFORE and AFTER the brake, on HER OWN profile read off her
 * Style Signature screenshot, and counts.
 *
 * ⚠️ Costs a few cents of the production key per run (the standing trade).
 * ⚠️ The sandbox has no ANTHROPIC_API_KEY, so the prompt is captured off the
 *    edited page and POSTed to the LIVE function with the Origin header --
 *    the documented 2026-07-30 pattern. Serving HEAD gives the BEFORE control.
 * ⚠️ Playwright by ABSOLUTE PATH (the bare-name import bit twice).
 */
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;   // ⚠ CommonJS: named import fails, default does not
import http from 'http';
import fs from 'fs';
import { execFileSync } from 'child_process';

const RUNS = Number(process.env.RUNS || 4);
const FAB = [/satin/i, /sequin/i, /velvet/i];

// Her sliders, read off the Style Signature screenshot she sent (1-11 scale).
// ⚠️ AN APPROXIMATION read by pixel, not her real saved record.
const ANSWERS = [8,8,9,9,9,6,6,4,6,6,6,6];

function serve(html){
  return new Promise(res=>{
    const srv = http.createServer((req,r)=>{ r.writeHead(200,{'Content-Type':'text/html'}); r.end(html); });
    srv.listen(0, ()=>res({srv, port: srv.address().port}));  // resolve is the CALLBACK
  });
}

async function capture(html){
  const {srv, port} = await serve(html);
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg = await b.newPage();
  let prompt = null;
  await pg.route('**/*style-ai*', route => {
    try { prompt = JSON.parse(route.request().postData()).messages[0].content; } catch(e){}
    route.fulfill({status:200, contentType:'application/json',
      body: JSON.stringify({content:[{type:'text',text:'{"items":[]}'}]})});
  });
  await pg.addInitScript(a=>{
    localStorage.setItem('ss_data', JSON.stringify({
      userName:'Catherine', answers:a,
      topArchNames:['Modern Glam','Edgy Chic','Statement Maker'],
      portrait:'A glam, edgy, detailed dresser.', motto:'Shine your light'
    }));
  }, ANSWERS);
  await pg.goto(`http://127.0.0.1:${port}/`, {waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);

  // ⚠️ ASSERT the seed took. _hasQuizData needs answers.length===12, and a
  // rejected seed leaves quizTaken false, no store ranking, and a run that
  // looks perfectly healthy while measuring nothing (the 2026-08-23 lesson).
  const ok = await pg.evaluate(()=>({ q: typeof quizTaken!=='undefined' && quizTaken,
                                      n: (typeof answers!=='undefined'&&answers)?answers.length:0 }));
  if(!ok.q || ok.n!==12) throw new Error('SEED REJECTED: quizTaken='+ok.q+' answers='+ok.n);

  await pg.evaluate(()=>{ _ssAsk=''; _openShopStyleNow('quiz'); });
  await pg.waitForTimeout(1200);
  await b.close(); srv.close();
  if(!prompt) throw new Error('NO PROMPT CAPTURED — harness measured nothing');
  return prompt;
}

async function ask(prompt){
  const r = await fetch('https://stylestar.app/.netlify/functions/style-ai', {
    method:'POST',
    headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body: JSON.stringify({max_tokens:900, messages:[{role:'user',content:prompt}]})
  });
  const j = await r.json();
  const txt = (j.content && j.content[0] && j.content[0].text) || '';
  const m = txt.match(/\{[\s\S]*\}/);
  if(!m) return null;
  try { return JSON.parse(m[0]).items || []; } catch(e){ return null; }
}

function count(items){
  let hits = [];
  items.forEach(it=>{
    const blob = (it.name||'')+' '+(it.search||'');
    if(FAB.some(f=>f.test(blob))) hits.push(it.name);
  });
  return hits;
}

async function trial(label, html){
  const prompt = await capture(html);
  const brake = /FABRICS TO USE SPARINGLY/.test(prompt);
  console.log(`\n═══ ${label} — brake in prompt: ${brake ? 'YES' : 'no'} (${prompt.length} chars)`);
  let cards=0, hits=[], sets=0, setsWithHit=0;
  for(let i=0;i<RUNS;i++){
    const items = await ask(prompt);
    if(!items){ console.log(`  run ${i+1}: no parseable reply, skipped`); continue; }
    sets++; cards += items.length;
    const h = count(items);
    if(h.length) setsWithHit++;
    hits = hits.concat(h);
    console.log(`  run ${i+1}: ${items.length} cards, ${h.length} braked` + (h.length?`  → ${h.join(' · ')}`:''));
  }
  return {label, brake, cards, hits, sets, setsWithHit};
}

const head = execFileSync('git',['show','HEAD:index.html'],{cwd:'/home/user/stylestar-app',maxBuffer:1<<28}).toString();
const now  = fs.readFileSync('/home/user/stylestar-app/index.html','utf8');

const before = await trial('BEFORE (HEAD, no brake)', head);
const after  = await trial('AFTER  (working tree)',   now);

console.log('\n────────── RESULT ──────────');
for (const r of [before, after]){
  const pct = r.cards ? (100*r.hits.length/r.cards).toFixed(0) : '–';
  console.log(`${r.label.padEnd(26)} ${r.hits.length}/${r.cards} cards (${pct}%), ${r.setsWithHit}/${r.sets} sets affected`);
}
// The control that makes the number mean anything: if the brake is not in the
// AFTER prompt, this whole run proved nothing.
if(!after.brake) console.log('\n⚠️  CONTROL FAILED: the brake never reached the AFTER prompt.');
if(before.brake) console.log('\n⚠️  CONTROL FAILED: the brake is in the BEFORE prompt.');
