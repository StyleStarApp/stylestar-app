/* promptcap.mjs — the shopping prompts against style-ai's 32KB hard cap.
 *
 * 🚨 style-ai.js REFUSES a message over MAX_TEXT_CHARS OUTRIGHT. It returns an
 *    error; it does NOT truncate. So a prompt over the cap does not degrade,
 *    it puts "Couldn't load options right now" on her screen.
 * ▶ MEASURED 2026-08-25: the ASK path's worst case was 29,197 before that day's
 *   prompt work and 32,664 after -- 104 chars of headroom.
 * ⚠️ RUN THIS AFTER ANY ADDITION TO _shopRules, _honestyRule, _askedForRule,
 *    _mixRule, _fabricBrakeRule or _colorPrefRule.
 * ⚠️ NEGATIVE CONTROL: set _PROMPT_SAFE to 99999 → Part 2 fails.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs';
const CAP=32*1024, ROOT='/home/user/stylestar-app';
let pass=0,fail=0;
const ok=(n,c,d)=>{c?(pass++,console.log('  ✓ '+n)):(fail++,console.log('  ✗ '+n+(d!==undefined?'  → '+String(d).slice(0,120):'')))};
const h=fs.readFileSync(ROOT+'/index.html','utf8');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(h)});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function grab(setup){
  const pg=await b.newPage(); let p=null;
  await pg.route('**/*style-ai*',rt=>{
    try{p=JSON.parse(rt.request().postData()).messages[0].content}catch(e){}
    rt.fulfill({status:200,contentType:'application/json',body:'{"content":[{"type":"text","text":"{\\"items\\":[]}"}]}'});
  });
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
    topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
  await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);
  const seeded=await pg.evaluate(()=>typeof quizTaken!=='undefined'&&quizTaken&&answers.length===12);
  if(!seeded) throw new Error('SEED REJECTED — every size below would be wrong');
  const stores=await pg.evaluate(()=>_rankedStores().length);
  await pg.evaluate(setup); await pg.waitForTimeout(1500);
  await pg.close();
  if(!p) throw new Error('NO PROMPT CAPTURED');
  return {p,stores};
}

console.log('\nPART 1 — an ordinary woman gets FULL detail, untouched');
const norm=await grab("_openShopStyleNow('quiz');_ssAsk='black midi dress';_shopStyleGen()");
ok('ordinary ask prompt is under the safe threshold', norm.p.length<=30000, norm.p.length);
ok('and therefore keeps full store detail (the ladder never fired)',
   /great for color|DEEP catalog|\$\$/.test(norm.p) && norm.p.length>26000, norm.p.length);

console.log('\nPART 2 — the worst case she could actually produce');
const worst=await grab(`
  prefs.neverWear=['Puff sleeves','Ruffles','Sequins','Turtlenecks','Oversized/boxy fits','Jumpsuits/rompers','Crop tops','Low-rise anything','Bodycon/tight dresses','Strapless tops/dresses','Short shorts','Mini skirts'];
  prefs.neverPatterns=['Leopard','Animal print','Camouflage','Tie dye','Neon brights'];
  prefs.neverText='no scratchy wool, nothing sheer at all, no high necklines, nothing that needs dry cleaning';
  prefs.sizes={tops:['plus'],bottoms:['plus'],shoes:['wide']};
  prefs.colorsLove=['Hot Pink','Royal Blue','Emerald','Champagne'];
  _openShopStyleNow('quiz');
  _ssAsk='grandmother of the bride dress';
  _seenPicks['ss-quiz']=Array.from({length:24},(_,i)=>'Long Sleeve Embellished Evening Gown Number '+(i+1));
  _shopStyleGen();`);
ok('worst case is under the HARD cap', worst.p.length<CAP, worst.p.length+' / '+CAP);
ok('with a real margin, not a coin toss (>=2000)', CAP-worst.p.length>=2000, CAP-worst.p.length);
ok('the shrink ladder actually fired here', worst.p.length<=30000, worst.p.length);

console.log('\nPART 3 — HER RULE: SORT, NEVER TRIM. Every store survives the shrink.');
// 2026-07-27, her priority: "the last thing I want is for her to not get shown
// something she would actually want." The ladder drops the TAIL'S DETAIL only.
const names=await (async()=>{
  const pg=await b.newPage();
  await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'C',answers:a,
    topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
  await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(900);
  const n=await pg.evaluate(()=>_rankedStores());
  await pg.close(); return n;
})();
const missing=names.filter(n=>worst.p.indexOf(n)<0);
ok('all '+names.length+' stores are still named in the shrunk prompt', missing.length===0, missing.slice(0,4).join(', '));
ok('the store count is what the table holds', names.length>=100, names.length);

console.log('\nPART 4 — the other shopping surfaces have room too');
for(const [name,drive] of Object.entries({
  'no ask':"_openShopStyleNow('quiz')",
  'wantlist':"_openShopStyleNow('wantlist')",
  'wardrobe Ideas':"const d=document.createElement('div');d.id='pb';d.innerHTML='<div class=\"wdr-ideas-grid\"></div>';document.body.appendChild(d);_wardrobeIdeaGen('dr1','pb')"
})){
  const r=await grab(drive);
  ok(name+' has >=3000 chars of headroom', CAP-r.p.length>=3000, r.p.length);
}

await b.close(); srv.close();
console.log('\n'+(pass+fail)+' checks, '+fail+' failures');
process.exit(fail?1:0);
