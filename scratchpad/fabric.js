/* fabric.js — the satin/sequins/velvet brake (2026-08-25, HER catch).
 *
 * Her words: "I don't want to ban satin and sequins but they need to be dialed
 * down... There is nothing wrong with sequins or satin, it is just that they
 * are not that in."
 *
 * ⚠️ NEGATIVE CONTROL, run it before believing this suite:
 *      sed -i 's/^    _fabricBrakeRule(slot)+$//' index.html   → Part 1 fails
 *      change `if(slot==='to6')return '';` to `return ''`      → Part 2 fails
 *   A sweep that has never been seen to fail proves nothing.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const pw=pwmod;                      // ⚠ CommonJS: a named import fails here
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
let pass=0, fail=0;
const ok=(n,c,d)=>{ c?(pass++,console.log('  ✓ '+n)):(fail++,console.log('  ✗ '+n+(d?'  → '+String(d).slice(0,150):''))); };

const HTML=fs.readFileSync(__dirname+'/../index.html','utf8');
const A=[8,8,9,9,9,6,6,4,6,6,6,6];
const BRAKE=/FABRICS TO USE SPARINGLY/;

(async()=>{
  const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(HTML)});
  await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

  // Captures the REAL prompt a surface builds, rather than asking the function
  // for a string -- a rule that exists and never reaches a prompt is the bug.
  async function prompt(drive){
    const pg=await b.newPage(); let p=null; const errs=[];
    pg.on('pageerror',e=>errs.push(e.message));
    await pg.route('**/*style-ai*',rt=>{
      try{p=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
      rt.fulfill({status:200,contentType:'application/json',
        body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
    });
    // ⚠️ ss_data ONLY. A hand-made ss_prefs is a shape the app never produces
    // and throws before the fetch, so the run looks like a hung network.
    await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
      userName:'Catherine',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),A);
    await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
    await pg.waitForTimeout(900);
    // ⚠️ quizTaken must be true or _rankedStores falls back to raw table order
    // and the whole run measures nothing while looking healthy.
    const seeded=await pg.evaluate(()=>typeof quizTaken!=='undefined'&&quizTaken&&answers.length===12);
    if(!seeded) throw new Error('SEED REJECTED — the run would measure nothing');
    await pg.evaluate(drive+'()');   // ⚠ a STRING evaluates to the function, it does not CALL it
    await pg.waitForTimeout(1500);
    await pg.close();
    return {p,errs};
  }

  console.log('\nPART 1 — the brake reaches every browsing surface');
  const surfaces={
    'Shop your style (quiz)':     "(()=>{_openShopStyleNow('quiz')})",
    'Shop your style (wantlist)': "(()=>{_openShopStyleNow('wantlist')})",
    'Shop your style (look)':     "(()=>{_openShopStyleNow('look')})",
    'wardrobe Ideas (dr1)':       "(()=>{const d=document.createElement('div');d.id='pb';d.innerHTML='<div class=\"wdr-ideas-grid\"></div>';document.body.appendChild(d);_wardrobeIdeaGen('dr1','pb')})",
    'wardrobe more ideas (dr1)':  "(()=>{const d=document.createElement('div');d.id='pb2';d.innerHTML='<div class=\"shop-grid hscroll\"><div class=\"shop-item-name\">A</div></div>';document.body.appendChild(d);_wdrMoreIdeas('dr1','pb2')})"
  };
  for(const [name,drive] of Object.entries(surfaces)){
    const {p,errs}=await prompt(drive);
    ok(name+' carries the brake', p&&BRAKE.test(p), p?'no brake in '+p.length+' chars':'NO PROMPT');
    ok(name+' — zero JS errors', errs.length===0, errs[0]);
  }

  console.log('\nPART 2 — HER exception: to6 Dressy tops stands down');
  const to6=await prompt("(()=>{const d=document.createElement('div');d.id='p6';d.innerHTML='<div class=\"wdr-ideas-grid\"></div>';document.body.appendChild(d);_wardrobeIdeaGen('to6','p6')})");
  ok('to6 does NOT carry the brake', to6.p&&!BRAKE.test(to6.p));
  ok('to6 still carries HER "Satin belongs here" line', to6.p&&/Satin belongs here/.test(to6.p));
  const to1=await prompt("(()=>{const d=document.createElement('div');d.id='p1';d.innerHTML='<div class=\"wdr-ideas-grid\"></div>';document.body.appendChild(d);_wardrobeIdeaGen('to1','p1')})");
  ok('to1 basic tops DOES carry the brake (only to6 is exempt)', to1.p&&BRAKE.test(to1.p));

  console.log('\nPART 3 — HER TWO KINDS OF NO: a named ask waives that fabric only');
  const pg=await b.newPage();
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
    userName:'C',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'y'})),A);
  await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);
  const r=await pg.evaluate(()=>{
    const g=a=>{_ssAsk=a;return _fabricBrakeRule()};
    return {none:g(''), seq:g('sequin dress'), sat:g('black satin blouse'),
            all:g('satin velvet sequin'), unrelated:g('wedding guest dress'),
            to6:(_ssAsk='', _fabricBrakeRule('to6'))};
  });
  ok('no ask → all three braked', /satin, sequins and velvet/.test(r.none));
  ok('"sequin dress" → sequins waived, satin+velvet still braked', /satin and velvet/.test(r.seq)&&!/sequins/.test(r.seq));
  ok('"black satin blouse" → satin waived only', /sequins and velvet/.test(r.sat)&&!/satin/.test(r.sat));
  ok('she names all three → the rule stands down entirely', r.all==='');
  ok('an unrelated ask does NOT waive anything', /satin, sequins and velvet/.test(r.unrelated));
  ok('to6 stands down regardless of ask', r.to6==='');

  console.log('\nPART 4 — the WRONG/RIGHT pair, which is what made it land');
  ok('names the violation by example', BRAKE.test(r.none)&&/WRONG: reaching for "Sequin Mini Dress"/.test(r.none));
  ok('offers the RIGHT alternative (cut, structure, texture)', /RIGHT: let CUT, STRUCTURE and TEXTURE/.test(r.none));
  ok('default is none, not "at most one"', /YOUR DEFAULT IS NONE OF THEM/.test(r.none));
  ok('says plainly it is not a ban', /none is banned/.test(r.none));

  console.log('\nPART 5 — THE EXEMPLAR TRAP: the prompt must not model the braked fabrics');
  const shop=(await prompt("(()=>{_openShopStyleNow('quiz')})")).p;
  ok('the naming WRONG/RIGHT pair no longer uses satin', /Linen Button-Front Blouse/.test(shop)&&!/Satin Button-Front Blouse/.test(shop));
  const src=HTML;
  ok('the occasion example no longer holds up "velvet midi dress"',
     src.indexOf('"velvet midi dress"')<0 && src.indexOf('"crepe midi dress"')>0);
  ok('wardrobe Ideas no longer exemplifies "satin blouse"',
     src.indexOf('a search of just "satin blouse"')<0);

  console.log('\nPART 6 — her own never-wear list is untouched by any of this');
  const nw=await pg.evaluate(()=>{
    prefs.neverWear=['Sequins'];
    const it=(n,s)=>({name:n,search:s,store:'Nordstrom'});
    return filterNeverWear([it('Sequin Mini Dress','sequin mini dress'),it('Wool Coat','wool coat')],'sequin dress')
             .map(x=>x.name).join('|');
  });
  ok('HER never-wear beats even a named ask (sequins dropped)', nw==='Wool Coat', nw);

  await pg.close(); await b.close(); srv.close();
  console.log('\n'+(pass+fail)+' checks, '+fail+' failures');
  process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR:',e.message);process.exit(1)});
