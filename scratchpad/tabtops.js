// The two wardrobe tabs open (and close) as siblings (her pick "B", 2026-08-13):
// My List's how-to card carries the same header construction as Trending's
// CURATED BY CATHERINE, and Trending gains her closing line under the cards.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.join(ROOT, req.url==='/'?'index.html':req.url.split('?')[0])))}catch(e){res.statusCode=404;res.end()}}).listen(8951);
let pass=0,fail=0;const ok=(l,c,d)=>{console.log((c?'  ✓ ':'  ✗ ')+l+(!c&&d?' → '+d:''));c?pass++:fail++};
const browser = await chromium.launch();
const errors=[];
const page = await browser.newPage({viewport:{width:390,height:900}});
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:8951/'); await page.waitForTimeout(700);

console.log('1. My List header matches Trending exactly');
const m = await page.evaluate(()=>{
  openWardrobe();
  const h=document.querySelector('#wdrHowto .wdr-trend-by');
  if(!h)return{missing:true};
  const hearts=[...h.querySelectorAll('.pinkheart')];
  const cs=(el)=>{const c=getComputedStyle(el);return{color:c.color,ls:c.letterSpacing,size:c.fontSize,gap:c.gap}};
  const hs=(el)=>{const c=getComputedStyle(el);return{tf:c.transform,w:c.width,fill:c.fill}};
  // measure the how-to header while ITS pane is visible…
  const hMeas={cs:cs(h),hearts:hearts.map(hs)};
  // …and Trending's while THAT pane is visible (a display:none element lies)
  openWardrobe('trend');
  const t=document.querySelector('.wdr-pane.on .wdr-trend-by');
  const th=[...t.querySelectorAll('.pinkheart')];
  const tMeas={cs:cs(t),hearts:th.map(hs)};
  openWardrobe();
  return{ _h:hMeas, _t:tMeas,
    text:h.textContent.trim(), hearts:hearts.length,
    same:JSON.stringify(hMeas.cs)===JSON.stringify(tMeas.cs),
    heartsSame:JSON.stringify(hMeas.hearts)===JSON.stringify(tMeas.hearts),
    leftTilt:hearts[0].classList.contains('hl'), rightPlain:!hearts[1].classList.contains('hl'),
    visible:h.getBoundingClientRect().height>8
  };
});
ok('header present in the how-to card', !m.missing && m.visible);
ok('reads MY CLIENT CHECKLIST (short enough for one line at 320)', /MY CLIENT CHECKLIST/.test(m.text));
ok('two hearts, left tilted (.hl) + right, exactly like Trending', m.hearts===2 && m.leftTilt && m.rightPlain);
ok('header computed style identical to Trending (teal, tracking, gap)', m.same);
ok('heart transforms and sizes identical to Trending', m.heartsSame);

console.log('2. The brief (collapsed) how-to hides the header too');
const brief = await page.evaluate(()=>{
  document.getElementById('wdrHowto').classList.add('brief');
  const h=document.querySelector('#wdrHowto .wdr-trend-by');
  const hidden=h.getBoundingClientRect().height===0;
  document.getElementById('wdrHowto').classList.remove('brief');
  return hidden;
});
ok('header stands down with the full how-to', brief);

console.log('3. Trending closing line (her voice, bookending the tabs)');
const end = await page.evaluate(()=>{
  openWardrobe('trend');
  const e=document.querySelector('#s-wardrobe .wdr-trend-end');
  if(!e)return{missing:true};
  const c=getComputedStyle(e);
  return{text:e.textContent, lora:/Lora/.test(c.fontFamily), up:c.fontStyle==='normal',
    size:c.fontSize, ink:c.color, heart:!!e.querySelector('.pinkheart'),
    visible:e.getBoundingClientRect().height>8,
    below:e.getBoundingClientRect().top>document.getElementById('wdrTrendBody').getBoundingClientRect().top};
});
ok('closing line present under the trend cards', !end.missing && end.visible && end.below);
ok('her wording with the tilted pink heart', /Check back for trend updates/.test(end.text) && /changes with the seasons/.test(end.text) && end.heart);
ok('her voice spec: Lora upright 15.5 readable ink', end.lora && end.up && end.size==='15.5px' && end.ink==='rgb(74, 70, 62)');

console.log('4. Layout hygiene');
for (const w of [390,360,320]) {
  await page.setViewportSize({width:w,height:900});
  const r = await page.evaluate(()=>{
    openWardrobe();
    const h=document.querySelector('#wdrHowto .wdr-trend-by');
    const oneLine=(()=>{const rg=document.createRange();rg.selectNodeContents(h);
      const tops=[...rg.getClientRects()].map(x=>Math.round(x.top));
      const u=[];tops.forEach(t=>{if(!u.some(v=>Math.abs(v-t)<6))u.push(t)});return u.length===1})();
    openWardrobe('trend');
    const wide=document.documentElement.scrollWidth>innerWidth+1;
    openWardrobe();
    return {oneLine,wide};
  });
  ok(w+'px: header holds one line, no sideways scroll', r.oneLine && !r.wide);
}
ok('zero JS errors', errors.length===0);
if(errors.length)console.log(errors.slice(0,3));
await browser.close(); server.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
