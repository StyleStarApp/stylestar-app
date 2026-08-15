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

console.log('1b. The Trending intro wears the same frame, and the copy alignments match (her catch)');
const fr = await page.evaluate(()=>{
  openWardrobe();
  const howto=document.getElementById('wdrHowto');
  const hcs=getComputedStyle(howto);
  const centered=hcs.textAlign==='center';
  openWardrobe('trend');
  const intro=document.querySelector('.wdr-pane.on .wdr-trend-intro');
  if(!intro)return{missing:true};
  const ics=getComputedStyle(intro);
  const same=['backgroundColor','borderTopWidth','borderTopColor','borderTopStyle','paddingLeft','paddingTop']
    .every(k=>ics[k]===hcs[k]);
  openWardrobe();
  return{same,centered,visible:intro.getBoundingClientRect?true:true,
    introVisible:true};
});
ok('the Trending intro is framed in the SAME card as the how-to', !fr.missing && fr.same);
ok('the how-to copy is centered like the trend side', fr.centered);

// ⚠️ DELIBERATE REVERSAL (2026-08-15, her call). This used to assert that the
// how-to collapsed to a one-liner once she had starred a few items, taking its
// MY CLIENT CHECKLIST header with it. She asked for the card to be permanent
// -- "It would be more consistent with the trending page" -- so the assertion
// is now that starring cannot make it stand down. Driven through the REAL star
// handler, not a class, so the retired behaviour cannot return by any route.
console.log('2. The how-to card is PERMANENT — starring never collapses it');
const perm = await page.evaluate(()=>{
  ['to1','to2','to3','to4','to5'].forEach(id=>wardrobeWant(id));
  _wdrSyncHowto();                      // the one place the collapse used to be decided
  const hw=document.getElementById('wdrHowto');
  const hdr=document.querySelector('#wdrHowto .wdr-trend-by');
  const full=document.querySelector('#wdrHowto .hw-full');
  return {
    stars:_wardrobeWants().length,
    brief:hw.classList.contains('brief'),
    hdrH:hdr?hdr.getBoundingClientRect().height:0,
    fullH:full?full.getBoundingClientRect().height:0,
    words:(full?full.textContent:'').includes('closet consultation')
  };
});
ok('five items really starred', perm.stars >= 5, String(perm.stars));
ok('the card never takes the retired brief class', !perm.brief);
ok('MY CLIENT CHECKLIST header still shown', perm.hdrH > 0, String(perm.hdrH));
ok('her full paragraph still shown', perm.fullH > 0 && perm.words, JSON.stringify(perm));
ok('the collapsed copy is gone from the page', await page.evaluate(()=>!document.querySelector('.hw-brief')));

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
// 5. The commission line's position (her call 2026-08-15, from renders): inside
//    EACH pane, under that tab's intro card, above that tab's first link, with
//    its own 9px margins owning the gap on both sides so the tabs match. It was
//    previously a single copy outside both panes, where it crowded her voice.
//    ⚠️ Nothing pinned this position before, which is how it drifted twice.
console.log('5. The commission line sits under each intro card, above the links');
for (const w of [390,360,320]) {
  await page.setViewportSize({width:w,height:1200});
  for (const tab of ['list','trend']) {
    const m = await page.evaluate(t=>{
      openWardrobe(t==='trend'?'trend':'list');
      const pane=document.querySelector('.wdr-pane[data-pane="'+t+'"]');
      const d=pane.querySelector('.wdr-disclosure');
      if(!d) return null;
      const intro=pane.querySelector('#wdrHowto, .wdr-trend-intro');
      const next=d.nextElementSibling;
      const dr=d.getBoundingClientRect(), ir=intro.getBoundingClientRect(), nr=next.getBoundingClientRect();
      const visible=[...document.querySelectorAll('.wdr-disclosure')].filter(e=>e.getBoundingClientRect().width>0);
      const links=[...document.querySelectorAll('#s-wardrobe a[href^="http"], #s-wardrobe .wdr-see, #s-wardrobe .tlf')]
        .filter(e=>e.getBoundingClientRect().width>0);
      const firstLink=links.length?Math.min(...links.map(e=>e.getBoundingClientRect().top)):Infinity;
      return {
        inPane:!!d.closest('.wdr-pane'),
        afterIntro:intro.compareDocumentPosition(d)===Node.DOCUMENT_POSITION_FOLLOWING,
        above:+(dr.top-ir.bottom).toFixed(1),
        below:+(nr.top-dr.bottom).toFixed(1),
        copies:visible.length,
        beforeLinks:dr.bottom<=firstLink,
        text:d.textContent.trim()
      };
    }, tab);
    ok(`${w}px ${tab}: disclosure lives inside the pane, under the intro card`, m && m.inPane && m.afterIntro);
    ok(`${w}px ${tab}: gaps tight and even (9px both sides)`, m && m.above===9 && m.below===9, m?`${m.above}/${m.below}`:'missing');
    ok(`${w}px ${tab}: exactly ONE visible copy on screen`, m && m.copies===1, m?String(m.copies):'-');
    ok(`${w}px ${tab}: sits above every link (the FTC placement)`, m && m.beforeLinks);
    ok(`${w}px ${tab}: the shared pronoun-free wording`, m && m.text==='Some links may earn a commission.', m?m.text:'-');
  }
}
await page.setViewportSize({width:390,height:900});

ok('zero JS errors', errors.length===0);
if(errors.length)console.log(errors.slice(0,3));
await browser.close(); server.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
