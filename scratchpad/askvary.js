/* askvary.js — the ask-box variety rule (2026-08-25, from HER three refreshes
 * of "Black midi dress"). The behaviour itself is model-side and is measured by
 * scratchpad/askvariety-live.mjs; this pins the RULE so it cannot be quietly
 * deleted or drift out of the prompt.
 * ⚠️ NEGATIVE CONTROL: replace _mixRule's ask branch with the old one-liner
 *    ('- Vary the price points and the stores across the 6...') and Part 1 + 2 fail.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const pw=pwmod;
import fs from 'fs'; import http from 'http';
import path from 'path'; import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
let pass=0,fail=0;
const ok=(n,c,d)=>{c?(pass++,console.log('  ✓ '+n)):(fail++,console.log('  ✗ '+n+(d?'  → '+String(d).slice(0,140):'')))};
const HTML=fs.readFileSync(__dirname+'/../index.html','utf8');
const A=[8,8,9,9,9,6,6,4,6,6,6,6];

(async()=>{
  const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(HTML)});
  await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg=await b.newPage(); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
    userName:'C',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),A);
  await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);
  const r=await pg.evaluate(()=>{const g=a=>{_ssAsk=a;return _mixRule()};
    return {ask:g('Black midi dress'), none:(_ssAsk='',_mixRule())}});

  console.log('\nPART 1 — an ask asks for variety of the PIECE, not just the shop');
  ok('names the failure she saw', /VARY THE PIECES, not just the shops/.test(r.ask));
  ok('WRONG names six identical cards differing only by store',
     /WRONG: six cards all named "Black Midi Dress", differing only by store/.test(r.ask));
  ok('offers a RIGHT example', /RIGHT: "V-Neck Black Midi Dress"/.test(r.ask));
  // ⚠️ MY OWN FIRST DRAFT FELL INTO THE EXEMPLAR TRAP: it listed six words and
  // the live model copied all six, every run, for every woman. This pins the
  // sentence that stops it.
  ok('says the examples are NOT a list to copy', /THOSE ARE ILLUSTRATIONS, NOT A LIST TO COPY/.test(r.ask));
  ok('ties the words to HER style, not a fixed set',
     /glam, edgy dresser and a quiet classic one should not get the same six words/.test(r.ask));

  console.log('\nPART 2 — the word budget, which matters more than the variety');
  ok('one defining word, never two', /ADD ONE DEFINING WORD TO HER ASK, NEVER TWO/.test(r.ask));
  ok('a long ask is left exactly as she typed it', /four words or longer[\s\S]*EXACTLY as she typed them/.test(r.ask));
  ok('names the over-long search as WRONG by example', /searching "cutout black long sleeve v neck midi dress"/.test(r.ask));
  ok('the defining word must reach the SEARCH too (parity)', /must be in that pick's SEARCH as well as its name/.test(r.ask));

  console.log('\nPART 3 — no ask means the old mixed-category behaviour, untouched');
  ok('no ask → mix categories and price points', r.none==='- Mix categories and price points across the 6 items\n', r.none);
  ok('no ask → the variety rule does NOT appear', !/VARY THE PIECES/.test(r.none));

  console.log('\nPART 4 — it really reaches the prompt');
  let p=null;
  await pg.route('**/*style-ai*',rt=>{
    try{p=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
    rt.fulfill({status:200,contentType:'application/json',
      body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
  });
  await pg.evaluate(()=>{_openShopStyleNow('quiz');_ssAsk='Black midi dress';_shopStyleGen()});
  await pg.waitForTimeout(1500);
  ok('the ask prompt carries the variety rule', !!p && /VARY THE PIECES/.test(p), p?'absent':'NO PROMPT');
  ok('and still carries her ask verbatim', !!p && p.indexOf('Black midi dress')>0);
  ok('zero JS errors', errs.length===0, errs[0]);

  await b.close(); srv.close();
  console.log('\n'+(pass+fail)+' checks, '+fail+' failures');
  process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR:',e.message);process.exit(1)});
