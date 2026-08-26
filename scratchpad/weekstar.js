// ⭐ STAR OF THE WEEK (2026-08-13, her design, her name): Cath's weekly
// hand-picked item on Welcome Back — the return loop. Drives the real app.
// 2026-08-14: the star ROTATES automatically every Sunday through the
// WEEK_STARS queue (her ask — her approved Edit picks, no intimates/swim).
// Render assertions compare against WEEK_STARS[_weekStarIndex()] rather than
// a hardcoded item, so the suite stays green whichever week it runs in.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.join(ROOT, req.url==='/'?'index.html':req.url.split('?')[0])))}catch(e){res.statusCode=404;res.end()}}).listen(8937);

let pass=0, fail=0;
const ok=(l,c,d)=>{console.log((c?'  ✓ ':'  ✗ ')+l+(!c&&d?('  → '+d):'')); c?pass++:fail++;};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
const px=s=>s.match(/\d+/g).slice(0,3).map(Number);

const browser = await chromium.launch();
const errors=[];
const page = await browser.newPage({viewport:{width:390,height:900}});
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:8937/'); await page.waitForTimeout(700);

console.log('1. The card renders on Welcome Back');
await page.evaluate(()=>{show('s-wb')}); await page.waitForTimeout(300);
const card = await page.evaluate(()=>{
  const el=document.getElementById('wbStar');
  const a=el.querySelector('.wks-shop');
  const cur=_weekStar();
  return {
    on: el.classList.contains('on') && el.querySelector('.wks-card')!==null,
    visible: el.getBoundingClientRect().height>40,
    label: el.querySelector('.wks-lbl').textContent.trim(),
    // ⚠️ UPDATED DELIBERATELY, NOT SILENCED (2026-08-25). This pinned the flat
    // fill "#E0B84C" by literal hex, and HER ASK was to swap that star for the
    // gradient one her Edit, Wardrobe and Style Signature card already use. So
    // the SUBJECT changed on her instruction, not the behaviour. The replacement
    // is STRICTER than what it replaces: it requires both stars to reference a
    // gradient AND that gradient to actually exist in the document, which the
    // old hex check could never have caught.
    twinStars: (()=>{
      const p=[...el.querySelectorAll('.wks-lbl svg path')];
      if(p.length!==2) return false;
      const ids=p.map(x=>(x.getAttribute('fill')||'').match(/^url\(#(.+)\)$/)).map(m=>m&&m[1]);
      if(ids.some(i=>!i)) return false;
      if(new Set(ids).size!==2) return false;              // ids must be unique
      if(ids.some(i=>!document.getElementById(i))) return false;  // and must resolve
      return !!el.querySelector('.wks-lbl svg.l') && !!el.querySelector('.wks-lbl svg.r');
    })(),
    name: el.querySelector('.wks-name').textContent,
    store: el.querySelector('.wks-store').textContent,
    href: a.getAttribute('href'), rel: a.getAttribute('rel'), tgt: a.getAttribute('target'),
    note: (el.querySelector('.wks-note')||{textContent:''}).textContent,
    pinkHeart: !!el.querySelector('.wks-note .wks-ch'),
    disc: (el.querySelector('.wks-disc')||{textContent:''}).textContent.trim(),
    curName: cur.n, curStore: cur.store, curUrl: cur.url
  };
});
ok('card is on and visible', card.on && card.visible);
// Renamed 2026-08-13, her call: "I like Star of the Week better" + her pick C
// (twin tilted flanking stars) from the three-way render.
ok('label reads STAR OF THE WEEK flanked by twin gold stars', /STAR OF THE WEEK/.test(card.label) && card.twinStars);
ok('the rendered item IS this week\'s queue entry', card.name===card.curName);
ok('store line matches the queue entry', card.store.toUpperCase().indexOf(card.curStore.toUpperCase())===0);
// ⚠️ UPDATED DELIBERATELY 2026-08-20, not silenced: since #879 the Star's link is
// affiliate-wrapped when its host is an approved advertiser, so href is no longer
// byte-identical to the queue entry. The real invariant is stronger and is what
// is asserted now: unwrapping murl must give back the exact product URL, so a
// wrap can never quietly change WHERE the tap lands.
ok('Shop it lands on the queue entry\'s exact product URL', (()=>{
  const m=/[?&]murl=([^&]+)/.exec(card.href);
  return m ? decodeURIComponent(m[1])===card.curUrl : card.href===card.curUrl;
})(), card.href+' vs '+card.curUrl);
ok('an approved-advertiser Star IS affiliate-wrapped',
   !/dvf\.com|farmrio\.com/.test(card.curUrl) || card.href.includes('click.linksynergy'), card.href);
ok('rel sponsored noopener + new tab (the standing link rules)', /sponsored/.test(card.rel) && /noopener/.test(card.rel) && card.tgt==='_blank');
ok('her note renders with her tilted pink heart (Catherine speaking)', card.note.length>10 && card.pinkHeart);
ok('the disclosure sits with the first product link on this screen', card.disc==='Some links may earn a commission.');

console.log('2. The Sunday rotation (her ask, 2026-08-14 — automatic, local-calendar Sundays)');
const rot = await page.evaluate(()=>{
  // ⚠️ REWRITTEN 2026-08-25, her unpin ("yes, let's go ahead and unpin"). The
  // old version measured the PIN mechanism against whatever WEEK_STAR_PIN
  // happened to be live -- which meant it only ever tested one of the two
  // states, and broke outright the moment the real state went from a pinned
  // name to null. The mechanism is proven here on a NEUTRAL test pin (an
  // arbitrary real queue member, not whatever she currently has set), so it
  // stays true whether she is pinned, unpinned, or repins to something else
  // next week. Her ACTUAL current pin state is asserted separately, below.
  const _realPin=window.WEEK_STAR_PIN;
  const _testPin=WEEK_STARS[Math.min(5,WEEK_STARS.length-1)].n;
  window.WEEK_STAR_PIN=null;
  const i=(y,m,d,h)=>_weekStarIndex(new Date(y,m,d,h||12));
  const L=WEEK_STARS.length;
  // wrap date DERIVED from L, never restated — the curated.js lesson: a test that
  // hardcodes a number must be edited every time the queue grows.
  const wrapDate=new Date(2026,7,9); wrapDate.setDate(wrapDate.getDate()+7*L);
  const __r = {
    len:L,
    // every entry is a real star: a name, a store, an https url and her note
    allNamed:WEEK_STARS.every(x=>x&&x.n&&x.store&&/^https:\/\//.test(x.url||'')&&x.note),
    headIsHers:/Tommy Hilfiger Claihre/.test(WEEK_STARS[0].n), // her first star leads the queue
    anchorSunday:i(2026,7,9),           // Sun Aug 9 = week 0
    buildDay:i(2026,7,14),              // Fri Aug 14 (built) → still week 0
    satNight:i(2026,7,15,23),           // Sat 11pm → still week 0
    swapSunday:i(2026,7,16,0),          // Sun Aug 16 midnight → week 1
    weekTwo:i(2026,7,23),               // next Sunday → week 2
    wraps:_weekStarIndex(wrapDate),     // anchor + L weeks → back to 0, whatever L is
    preAnchor:i(2026,7,1),              // a mis-set clock before the anchor → first star, no negative index
    // her content rule: NO intimates or swim as the Star ("a bra or bikini
    // could be too much muchness at opening glance") — the bar is her call,
    // pinned here so a future queue edit can't quietly cross it.
    noIntimates: WEEK_STARS.every(s=>!/\b(bra|bikini|underwire|bandeau|lingerie)\b/i.test(s.n)),
    // queue integrity: every entry complete, every URL https + safe
    complete: WEEK_STARS.every(s=>s.n&&s.store&&s.price&&s.note&&_wlSafeUrl(s.url)&&/^https:/.test(s.url)),
    uniqueUrls: new Set(WEEK_STARS.map(s=>s.url)).size===L,
    // the MECHANISM, proven on the neutral test pin — never mind what she has
    // set live right now
    pinned:(()=>{window.WEEK_STAR_PIN=_testPin;
      const seen=new Set(); for(let d=0;d<364;d+=7){seen.add(_weekStarIndex(new Date(2026,7,9+d)));}
      return {holds:seen.size===1, isPinned:((_weekStar()||{}).n||'')===_testPin};})(),
    // HER ACTUAL LIVE STATE — either a real pin naming a real queue member,
    // or explicitly null. Both are honest outcomes; note which one it is.
    realState:_realPin?{isPinned:true,names:WEEK_STARS.some(x=>x.n===_realPin)}:{isPinned:false}
  };
  // restore her real live state before the function returns to Node — the
  // mechanism test above deliberately overwrote WEEK_STAR_PIN twice.
  window.WEEK_STAR_PIN=_realPin;
  return __r;
});
// DERIVED, not restated (the curated.js lesson, paid for twice now): this used
// to name a number and had to be edited every time she added a star — 16 → 17
// for the scarf, 17 → 18 for the Vilebrequin cover-up. The claim worth testing
// was never the count, it is that the queue is non-empty and that the rotation
// arithmetic below covers exactly as many weeks as there are stars.
ok('the queue is non-empty and every entry is a real star',
   rot.len>0 && rot.allNamed, 'len='+rot.len);
ok('her first star leads the queue', rot.headIsHers);
ok('anchor Sunday Aug 9 = week 0', rot.anchorSunday===0);
ok('build day (Fri Aug 14) still shows week 0', rot.buildDay===0);
ok('Saturday 11pm still shows week 0', rot.satNight===0);
ok('midnight into Sunday Aug 16 swaps to week 1', rot.swapSunday===1);
ok('the Sunday after that = week 2', rot.weekTwo===2);
ok('after a full cycle the queue wraps to the start', rot.wraps===0);
ok('a clock set before the anchor clamps to the first star', rot.preAnchor===0);
ok('HER RULE: no intimates or swim in the queue', rot.noIntimates);
ok('every entry complete with a safe https product URL', rot.complete);
ok('no duplicate items in the queue', rot.uniqueUrls);
// THE PIN MECHANISM, proven on a neutral test pin — true whichever way she
// currently has the real WEEK_STAR_PIN set.
ok('PINNED: the same Star on every week of the year', rot.pinned.holds);
ok('PINNED: and the served Star IS whatever the pin names', rot.pinned.isPinned);
// ⚠️ REWRITTEN 2026-08-25, her unpin: either she is currently pinned (and
// that pin had better name a real queue member), or she is unpinned and the
// mechanism above is all that needs proving. Both are correct outcomes.
ok('HER LIVE STATE: unpinned, or pinned to a real queue member',
   !rot.realState.isPinned || rot.realState.names,
   JSON.stringify(rot.realState));

console.log('3. Saving the star');
const save = await page.evaluate(()=>{
  const btn=document.querySelector('#wbStar .wl-save');
  btn.click();
  const wl=(wardrobeData&&wardrobeData.wishlist)||[];
  const e=wl[wl.length-1]||{};
  return {n:wl.length, pick:!!e.pick, url:e.url, want:_weekStar().url, label:btn.textContent.trim(), pressed:btn.classList.contains('on')};
});
ok('heart tap saves it to Your Wishlist', save.n>=1);
ok('saved as a pick with the exact product URL', save.pick && save.url===save.want);
ok('the control flips to Saved', /Saved/.test(save.label) && save.pressed);
const row = await page.evaluate(()=>{
  openWishlist();
  const html=document.getElementById('s-wishlist').innerHTML;
  return {badge:/Catherine&rsquo;s pick|Catherine’s pick/.test(html), shopIt:/Shop it/.test(html)};
});
ok('the wishlist row wears the Catherine’s pick badge', row.badge);
ok('and its button says Shop it (exact link, not a search)', row.shopIt);
await page.evaluate(()=>{const btn=document.querySelector('#wbStar .wl-save'); show('s-wb'); document.querySelector('#wbStar .wl-save').click();});

console.log('4. Readability and layout');
const contrast = await page.evaluate(()=>{
  const el=document.getElementById('wbStar');
  const bg=getComputedStyle(el.querySelector('.wks-card')).backgroundColor;
  const c=s=>getComputedStyle(el.querySelector(s)).color;
  return {bg,lbl:c('.wks-lbl'),name:c('.wks-name'),note:c('.wks-note'),store:c('.wks-store')};
});
ok('label contrast ≥ 4.5', ratio(px(contrast.lbl),px(contrast.bg))>=4.5, contrast.lbl);
ok('name contrast ≥ 4.5', ratio(px(contrast.name),px(contrast.bg))>=4.5);
ok('note contrast ≥ 4.5', ratio(px(contrast.note),px(contrast.bg))>=4.5);
ok('store line contrast ≥ 4.5', ratio(px(contrast.store),px(contrast.bg))>=4.5);
// Every queue item must lay out cleanly — the longest names are the real risk,
// so render EACH entry at each width by faking the week, not just this week's.
for (const w of [390,360,320]) {
  await page.setViewportSize({width:w,height:900});
  const bad = await page.evaluate(()=>{
    const out=[];
    const real=_weekStarIndex;
    for(let k=0;k<WEEK_STARS.length;k++){
      window._weekStarIndex=()=>k;
      _renderWeekStar();
      const el=document.getElementById('wbStar');
      const wide=[...el.querySelectorAll('*')].some(n=>n.getBoundingClientRect().right>innerWidth+0.5||n.getBoundingClientRect().left<-0.5);
      if(wide||document.documentElement.scrollWidth>innerWidth+1)out.push(WEEK_STARS[k].n);
    }
    window._weekStarIndex=real;_renderWeekStar();
    return out;
  });
  ok(w+'px: no star in the queue overflows', bad.length===0, bad.join(', '));
}

console.log('5. Graceful absence');
const off = await page.evaluate(()=>{
  const old=WEEK_STARS; WEEK_STARS=[]; _renderWeekStar();
  const hidden=!document.getElementById('wbStar').classList.contains('on');
  WEEK_STARS=old; _renderWeekStar();
  return {hidden, back:document.getElementById('wbStar').classList.contains('on')};
});
ok('empty queue → no card, no error', off.hidden);
ok('and it comes back when the stars return', off.back);
// ── HER QUOTE-MARK CATCH, 2026-08-24 ───────────────────────────────────────
// "The end quote appears to be farther away than the start quote." It did, and
// only when the note ended in a full stop -- a period sits on the baseline and
// fills nothing at cap height, so the quote hangs over 7.00px of emptiness
// against the opening's 3.75. See .wks-q-lo in index.html and the ink
// measurement in scratchpad/quotegap.mjs.
// ⚠️ THE CONDITION IS THE WHOLE POINT: 13 of her 20 notes end in ".", 6 in "!"
// and 1 in a letter, and the other seven were already correct. A flat negative
// margin would have crushed them, so these assert BOTH directions.
const qm = await page.evaluate(() => {
  const cases = [
    ['ends in a period.',            true ],
    ['ends in a comma,',             true ],
    ['ends in a bang!',              false],
    ['ends in a question?',          false],
    ['ends in a letter like gold',   false],
    ['trailing space after a stop. ',true ]];
  const out = [];
  for (const [note, want] of cases) {
    const h = _wksNoteHTML(note);
    const d = document.createElement('div'); d.innerHTML = h;
    out.push({ note, want, got: /\bwks-q-lo\b/.test(d.querySelector('.wks-q').className) });
  }
  // the correction must be a real negative pull at PAINT time, not a stale rule
  const probe = document.createElement('div');
  probe.className = 'wks-note'; probe.style.cssText = 'position:absolute;left:-9999px';
  probe.innerHTML = _wksNoteHTML('a note that ends in a period.');
  document.body.appendChild(probe);
  const ml = getComputedStyle(probe.querySelector('.wks-q'), '::after').marginLeft;
  probe.remove();
  return { out, ml, empty: _wksNoteHTML('') };
});
// ⚠️ ARGUMENT ORDER IS (name, condition, detail) IN THIS SUITE. Written the
// other way round first, which made every check here pass VACUOUSLY: a
// non-empty label string is truthy, so the condition was never read. Caught by
// the negative control (delete the CSS rule -> still 49 passed), never by
// reading it. A harness that measures nothing reports a clean pass.
qm.out.forEach(c => ok(
  `"${c.note.trim()}" ${c.want ? 'gets' : 'does NOT get'} the low-terminal pull`,
  c.got === c.want, 'got ' + c.got));
ok('the pull is really negative at paint time', parseFloat(qm.ml) < 0, qm.ml);
ok('no note renders no quotes at all, not an empty pair of them', qm.empty === '');
// ⚠️ ONE BUILDER, TWO SURFACES. The note is rendered on Welcome Back AND on
// Discovery; a rule applied by hand at two sites drifts the moment a third
// appears (the _wkStarPxTag lesson). Neither renderer may hand-roll the markup.
const src = fs.readFileSync(ROOT + '/index.html', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');   // strip comments so a tombstone cannot match
ok('both renderers call the shared note builder',
   (src.match(/_wksNoteHTML\(/g) || []).length >= 3);
ok('neither renderer still hand-rolls the note markup',
   !/<span class="wks-q">'\+_esc/.test(src));

ok('zero JS errors', errors.length===0);
if(errors.length)console.log(errors.slice(0,3));

await browser.close(); server.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
