// Photos on the Edit + the pinned Star of the Week.
// The load-bearing check is PART 2: the licensing sweep. A rule applied by hand
// at N sites drifts the moment an N+1th appears, so the guarantee lives here.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import vm from 'vm';
const ROOT='/home/user/stylestar-app';
let pass=0,fail=0;
const ok=(m,c,x='')=>{c?pass++:fail++;console.log((c?'  ok  ':'FAIL  ')+m+(c?'':'   << '+x));};

const src=fs.readFileSync(ROOT+'/index.html','utf8');

/* ---------- PART 1 · static ---------- */
const blocks=[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
blocks.forEach((b,i)=>{let e=null;try{new vm.Script(b);}catch(err){e=err.message;}
  ok(`script block ${i+1} parses`, !e, e||'');});

const items=[...src.matchAll(/<div class="dc-item">([\s\S]*?)<\/div>\s*\n\s*<\/div>|<div class="dc-item">([\s\S]*?)(?=<div class="dc-item">|<div class="dc-sign")/g)];
// 21 -> 22 and 3 -> 4 photos DELIBERATELY: the Vilebrequin mesh cover-up joined
// on 2026-08-20, and Vilebrequin is an approved advertiser, so it earns AND its
// photo is licensed. Both counts move together or the sweep below is meaningless.
// ⚠️ UPDATED DELIBERATELY 2026-08-24 and made DERIVED rather than re-numbered.
// This restated the Edit's length (21, then 22, now 23) and went stale every
// single time she added a piece -- i.e. it failed on her doing the thing the
// Edit exists for. The real claim is that the Edit is non-empty and that the
// count in the SOURCE matches what actually RENDERS, which is what would catch
// a broken item; the number itself carries nothing.
const EDIT_N=(src.match(/<div class="dc-item">/g)||[]).length;
ok('the Edit is non-empty', EDIT_N>0, EDIT_N);
// ⚠️ ALSO DERIVED NOW. These three restated ===4 as well, so adding a fifth
// photo failed them all while the new <img> carried alt, onerror and lazy
// perfectly -- three assertions failing on correct code, for a reason that had
// nothing to do with what they were testing. EVERY photo must have these, so
// the honest comparison is against the number of photos, not against 4.
const PX_N=(src.match(/class="dc-item-px"/g)||[]).length;
const pxWith=re=>(src.match(re)||[]).length;
ok('the Edit carries photos at all', PX_N>0, PX_N);
ok('every photo is https', !/dc-item-px" src="http:\/\//.test(src));
ok('every photo has alt text',
   pxWith(/class="dc-item-px"[^>]*\balt="[^"]{10,}"/g)===PX_N, `${pxWith(/class="dc-item-px"[^>]*\balt="[^"]{10,}"/g)} of ${PX_N}`);
ok('every photo degrades on error',
   pxWith(/class="dc-item-px"[^>]*onerror="this\.remove\(\)"/g)===PX_N);
ok('every photo is lazy',
   pxWith(/class="dc-item-px"[^>]*loading="lazy"/g)===PX_N);
ok('rule is 3:4, inset (not full-bleed)', /\.dc-item-px\{[^}]*aspect-ratio:3\/4/.test(src)
   && !/\.dc-item-px\{[^}]*margin:-/.test(src));
ok('the licensing rule is written at the code', /GREP _AFF_MID BEFORE ADDING ONE/.test(src));

/* queue */
const q=src.match(/var WEEK_STARS=\[[\s\S]*?\n\];/)[0];
const names=[...q.matchAll(/\{n:'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1].replace(/\\'/g,"'"));
// ⚠️ Her no-intimates rule was REFINED on 2026-08-20 and the regex below
// encodes the new, narrower line exactly: the bar is bikini/lingerie, NOT the
// swim category, so a cover-up passes on purpose. Don't add 'cover-up' or
// 'mesh' to that list.
// ⚠️ UPDATED DELIBERATELY 2026-08-25, and this is a real move not a drift.
// Her ask: bring every photographed star forward. That deliberately moved
// Vilebrequin from index 6 to index 3 -- EARLIER, not later, so her deadline
// (before 20 September) is still honoured, now by more margin: index 3 is the
// week of 30 AUGUST 2026 (anchor Sun 2026-08-09 + 3*7 days), IF the queue is
// actually rotating that week. ⚠️ IT IS NOT RIGHT NOW: WEEK_STAR_PIN is set to
// the FARM Rio dress, which freezes the card on that item regardless of what
// sits at any index. This assertion checks the DATA is correct -- what index
// carries Vilebrequin -- not what is currently live, which is a separate,
// deliberate question for her about the pin.
// Kept as an index check, not a count: inserting any star AHEAD of index 3
// would still silently slide this date, so the same guard still applies here,
// just at its new position.
ok('the queue is non-empty', names.length>0, names.length);
ok('THE 30 AUG SLOT: the Vilebrequin cover-up is now at index 3',
   /Vilebrequin/.test(names[3]||''), (names[3]||'(nothing)')+' — queue is '+names.length);
ok('no duplicate in the queue', new Set(names).size===names.length);
ok('every queue url is https', [...q.matchAll(/url:'([^']+)'/g)].every(m=>m[1].startsWith('https://')));
ok('HER RULE: no intimates or swim in the queue',
   !/\b(bra|bras|bralette|bikini|swimsuit|swimwear|lingerie|underwear|thong|panties)\b/i.test(names.join(' ')),
   names.filter(n=>/\b(bra|bikini|swim|lingerie|underwear)\b/i.test(n)).join());
// ⚠️ EITHER a pinned name or a bare `null` — WEEK_STAR_PIN moved to the second
// shape 2026-08-25 when she unpinned ("yes, let's go ahead and unpin"), so the
// pin-specific checks below only run when a pin is actually set. The claim
// under test either way is that the variable is coherent with the queue, not
// which of the two states it happens to be in right now.
const PIN=(src.match(/var WEEK_STAR_PIN='([^']*)'/)||[])[1];
if(PIN){
  const PINNED_PRICE=(function(){
    const m=q.match(new RegExp("\\{n:'"+PIN.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')+"'[\\s\\S]*?price:'([^']+)'"));
    return m?m[1]:'';
  })();
  ok('the pin names a piece that IS in the queue', names.includes(PIN), PIN);
  ok('the pinned piece carries a price', /^[~$]/.test(PINNED_PRICE), PINNED_PRICE);
} else {
  ok('WEEK_STAR_PIN is explicitly null when unpinned', /var WEEK_STAR_PIN=null;/.test(src));
}
// ⚠️ Tolerant of the sentence around it — the wording changed 2026-08-25 (was
// "TO RESUME THE ROTATION: set WEEK_STAR_PIN back to null"). The claim under
// test is that an instruction for reversing the CURRENT state exists, not its
// exact prose — pinning prose is how an assertion starts failing on a correct
// file.
ok('the re-pin/resume instruction is written at the code',
   /TO RE-PIN: set WEEK_STAR_PIN to an exact item name/.test(src) ||
   /TO RESUME[^:\n]*: set WEEK_STAR_PIN back to null/.test(src));

/* ---------- PART 2 · live, in the real page ---------- */
const srv=http.createServer((rq,rs)=>{let p=decodeURIComponent(rq.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!fs.existsSync(f)){rs.writeHead(404);return rs.end();}
  rs.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':'application/octet-stream'});
  rs.end(fs.readFileSync(f));}).listen(0);
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:900}});
const pg=await ctx.newPage(); const errs=[];
pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(`http://127.0.0.1:${PORT}/`);
await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());showDream();});
await pg.waitForTimeout(1200);

// ⭐ THE SWEEP: no photo may sit on an item we are not approved to photograph.
const sweep=await pg.evaluate(()=>{
  const mids=Object.keys(window._AFF_MID||{});
  const host=u=>{try{return new URL(u,location.href).hostname.toLowerCase().replace(/^www\./,'');}catch(e){return '';}};
  const licensed=h=>mids.some(d=>h===d||h.endsWith('.'+d));
  const out={mids,bad:[],withPx:[],unlicensedWithPx:[]};
  document.querySelectorAll('#s-dream .dc-item').forEach(el=>{
    const a=el.querySelector('.dc-item-btn'), px=el.querySelector('.dc-item-px');
    const nm=(el.querySelector('.dc-item-name')||{}).textContent||'';
    // the href is affiliate-wrapped by now, so read the real destination out of murl
    let raw=a?a.getAttribute('href'):''; const m=/[?&]murl=([^&]+)/.exec(raw||'');
    if(m)raw=decodeURIComponent(m[1]);
    const h=host(raw);
    if(px){out.withPx.push(nm.trim().slice(0,34)); if(!licensed(h))out.unlicensedWithPx.push(nm+' @ '+h);}
  });
  return out;
});
// DERIVED, not restated (the curated.js lesson): the approved list is whatever
// _AFF_MID holds, and what matters is that it is non-empty and that every entry
// is a bare registrable host — a path or a URL here would silently match nothing.
ok('_AFF_MID is a non-empty list of bare hosts',
   sweep.mids.length>0 && sweep.mids.every(h=>/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)),
   sweep.mids.join());
ok('SWEEP: zero photos on an unapproved retailer', sweep.unlicensedWithPx.length===0, sweep.unlicensedWithPx.join(' | '));
// ⭐ THE SWEEP, and it is the guarantee this whole suite exists for. Stated as a
// RELATIONSHIP rather than a count, so approving a new advertiser and giving its
// item a photo needs no edit here, while an unlicensed photo still fails loudly.
ok('SWEEP: every photo sits on an approved retailer, and there is at least one',
   sweep.withPx.length>0 && sweep.unlicensedWithPx.length===0,
   'with photo: '+sweep.withPx.join(' | ')+'  ||  unlicensed: '+sweep.unlicensedWithPx.join(' | '));

// the photos really load (not 404 / not broken)
// ⚠️ This sandbox's Chromium cannot reach external CDNs (the documented Google
// Fonts wall), so a load here proves nothing either way — hence the timeout and
// the honest SKIP. Reachability is proven by curl instead, outside this suite.
const loaded=await pg.evaluate(()=>Promise.all([...document.querySelectorAll('.dc-item-px')].map(i=>
  Promise.race([
    i.complete&&i.naturalWidth>0?Promise.resolve({ok:true,src:i.src}):
    new Promise(r=>{i.onload=()=>r({ok:true,src:i.src});i.onerror=()=>r({ok:false,src:i.src});}),
    new Promise(r=>setTimeout(()=>r({ok:false,timeout:true,src:i.src}),4000))
  ]))));
const blocked=loaded.filter(l=>l.timeout).length;
if(blocked===loaded.length){
  console.log('  skip  photo pixels: sandbox Chromium cannot reach the CDNs (curl proves 200 separately)');
}else{
  loaded.forEach(l=>ok('photo loads: '+l.src.split('/').pop().slice(0,28), l.ok, JSON.stringify(l)));
}
// what we CAN prove here: the element is real, sized by the rule, and in the card
const shape=await pg.evaluate(()=>[...document.querySelectorAll('.dc-item-px')].map(i=>{
  const r=i.getBoundingClientRect(), c=i.closest('.dc-item').getBoundingClientRect();
  return {w:Math.round(r.width),h:Math.round(r.height),ratio:+(r.width/r.height).toFixed(3),
          insideCard:r.left>=c.left-0.5&&r.right<=c.right+0.5,
          aboveName:r.bottom<=i.closest('.dc-item').querySelector('.dc-item-name').getBoundingClientRect().top+0.5};
}));
ok('all 3 photo boxes are 3:4', shape.every(s=>Math.abs(s.ratio-0.75)<0.02), JSON.stringify(shape));
ok('all 3 sit INSIDE the card edge (inset, not bleeding)', shape.every(s=>s.insideCard), JSON.stringify(shape));
ok('all 3 sit ABOVE the name', shape.every(s=>s.aboveName), JSON.stringify(shape));

// the affiliate wrap still reaches every approved link (adding an <img> must not
// disturb it). editCount is read from the page, not typed.
const editCount=await pg.evaluate(()=>document.querySelectorAll('#s-dream .dc-item').length);
ok('the page renders as many items as the markup declares',
   editCount===(src.match(/<div class="dc-item">/g)||[]).length, editCount);
const aff=await pg.evaluate(()=>{
  const mids=Object.keys(window._AFF_MID||{});
  let wrapped=0,total=0,approved=0;
  document.querySelectorAll('#s-dream .dc-item .dc-item-btn').forEach(a=>{
    total++;
    const raw=a.getAttribute('href')||'';
    if(raw.includes('click.linksynergy'))wrapped++;
    // read the real destination back out of murl so "approved" is computed from
    // where the tap actually lands, not from the wrapper we are testing
    let dest=raw; const m=/[?&]murl=([^&]+)/.exec(raw); if(m)dest=decodeURIComponent(m[1]);
    try{const h=new URL(dest,location.href).hostname.toLowerCase().replace(/^www\./,'');
      if(mids.some(d=>h===d||h.endsWith('.'+d)))approved++;}catch(e){}
  });
  return {wrapped,total,approved};
});
// DERIVED both ways: every item keeps its Shop button, and the number of wrapped
// links equals the number of items whose host is approved — computed from the
// page, never typed in. So a new advertiser or a new item cannot make this stale.
ok('every Edit item still has its Shop button', aff.total===editCount, JSON.stringify(aff)+' vs '+editCount);
ok('the affiliate wrap reaches exactly the approved links, no more and no fewer',
   aff.wrapped===aff.approved, JSON.stringify(aff));

// Save controls still generated for every item
ok('Save control still generated for EVERY item',
   (await pg.evaluate(()=>document.querySelectorAll('#s-dream .dc-item .wl-save').length))===editCount);

// pin behaviour across a year of Sundays — exercised on a NEUTRAL test pin
// (an arbitrary queue member, not whatever she currently has the real pin
// set to) so this proves the MECHANISM works whether she is pinned, unpinned,
// or repins to a different piece next week. ⚠️ REWRITTEN 2026-08-25 when she
// unpinned: the old version read the page's OWN live WEEK_STAR_PIN, so it only
// ever tested whichever state she happened to be in, and broke outright the
// moment that state was null. Testing the mechanism directly means neither
// state can ever leave this block silently untested again.
const TEST_PIN=names[Math.min(5,names.length-1)];
const pinres=await pg.evaluate((testPin)=>{
  const out={pinned:new Set(),unpinned:new Set()};
  const keep=window.WEEK_STAR_PIN;
  window.WEEK_STAR_PIN=testPin;
  for(let d=0;d<364;d+=7){const t=new Date(2026,7,9+d);out.pinned.add(_weekStarIndex(t));}
  window.WEEK_STAR_PIN=null;
  for(let d=0;d<364;d+=7){const t=new Date(2026,7,9+d);out.unpinned.add(_weekStarIndex(t));}
  const servedWhilePinned=(function(){window.WEEK_STAR_PIN=testPin;return _weekStar().n;})();
  window.WEEK_STAR_PIN=keep;
  return {pinned:[...out.pinned],unpinned:[...out.unpinned].length,servedWhilePinned};
},TEST_PIN);
ok('PINNED: the same star on all 52 weeks', pinres.pinned.length===1, JSON.stringify(pinres.pinned));
// derived from the test pin, so this can never go stale whichever piece it is
ok('PINNED: and the served Star IS the pinned piece', pinres.servedWhilePinned===TEST_PIN, TEST_PIN);
// derived from the queue itself, so growing the queue never makes this stale
ok('UNPINNED: rotation resumes across the WHOLE queue',
   pinres.unpinned===names.length, pinres.unpinned+' of '+names.length);

// the Star card renders on Welcome Back IN HER ACTUAL CURRENT STATE (whatever
// WEEK_STAR_PIN really is right now, pinned or rotating) — proven correct by
// checking it against whatever _weekStar() itself says it is serving, never
// against a hardcoded piece name.
const star=await pg.evaluate(()=>{show('s-wb');_renderWeekStar();
  const el=document.getElementById('wbStar');
  return {on:el.classList.contains('on'),txt:el.textContent.trim().slice(0,120),
          href:(el.querySelector('a[href]')||{}).href||'',servedName:_weekStar().n,
          approved:!!_affMid(_weekStar().url)};});
ok('Star card renders', star.on, JSON.stringify(star).slice(0,120));
ok('Star card shows the currently-served piece', star.txt.includes(star.servedName), star.txt);
const servedPrice=(function(){
  const m=q.match(new RegExp("\\{n:'"+star.servedName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"'[\\s\\S]*?price:'([^']+)'"));
  return m?m[1]:'';
})();
ok('Star card shows that piece\'s own price', star.txt.includes(servedPrice), servedPrice+' — '+star.txt);
// ⚠️ DERIVED from whether the currently-served store is actually approved,
// not a hardcoded assumption — the unpinned rotation can land on a piece
// (e.g. Athleta) that genuinely doesn't earn yet, and the honest, correct
// behaviour is to serve a plain link rather than fake a wrap. The mechanism
// itself is already proven above (PINNED: the served Star IS the pinned
// piece, run against a known-approved test pin).
ok('Star card link is affiliate-wrapped exactly when the store is approved',
   star.href.includes('click.linksynergy')===star.approved, JSON.stringify(star));

// ---- everything below needs a KNOWN photo-and-affiliate item pinned, not
// whatever she currently has live (unpinned rotation may be sitting on a
// piece with neither) — so pin to one on purpose for this block only, and
// put the real state back before the layout sweep at the bottom. ⚠️ Rewritten
// 2026-08-25: the old version relied on window.WEEK_STAR_PIN already being
// set live, which broke the instant she unpinned.
const REAL_PIN=await pg.evaluate(()=>window.WEEK_STAR_PIN);
const PHOTO_TEST_PIN='FARM Rio Pink Garden Terrace 3D One-Shoulder Maxi Dress';
await pg.evaluate((p)=>{window.WEEK_STAR_PIN=p;_renderWeekStar();},PHOTO_TEST_PIN);

// ---- the Star card's own photo, and its licensing gate ----
const sp=await pg.evaluate(()=>{
  const im=document.querySelector('#wbStar .wks-px');
  if(!im)return {present:false};
  const r=im.getBoundingClientRect();
  const lbl=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
  const nm=document.querySelector('#wbStar .wks-n,#wbStar .wks-name');
  return {present:true,w:Math.round(r.width),ratio:+(r.width/r.height).toFixed(3),
          belowLabel:r.top>=lbl.bottom-0.5,
          aboveName:nm?r.bottom<=nm.getBoundingClientRect().top+0.5:true,
          alt:im.getAttribute('alt')||'',onerr:im.getAttribute('onerror')||'',
          https:(im.getAttribute('src')||'').startsWith('https://')};
});
ok('Star card carries a photo', sp.present);
ok('Star photo is 140px wide (her pick: keeps Shop it above the fold)', sp.w===140, sp.w);
ok('Star photo is 3:4', Math.abs(sp.ratio-0.75)<0.02, sp.ratio);
ok('Star photo sits under the label, above the name', sp.belowLabel&&sp.aboveName, JSON.stringify(sp));
ok('Star photo is https, has alt, degrades on error',
   sp.https&&sp.alt.length>10&&/this\.remove\(\)/.test(sp.onerr), JSON.stringify(sp));

// ⭐ THE GATE: a px: url on an UNAPPROVED store must render no photo at all.
const gate=await pg.evaluate(()=>{
  const keep=window.WEEK_STAR_PIN, star=WEEK_STARS.find(x=>x.n===keep);
  const url0=star.url, px0=star.px;
  star.url='https://www.nordstrom.com/s/8960533';   // not an approved advertiser
  _renderWeekStar();
  const unapproved=!!document.querySelector('#wbStar .wks-px');
  star.url=url0; star.px=px0; _renderWeekStar();
  const restored=!!document.querySelector('#wbStar .wks-px');
  return {unapproved,restored};
});
ok('GATE: an unapproved store shows NO photo even with a px: url', gate.unapproved===false, JSON.stringify(gate));
ok('GATE: the approved store shows it again', gate.restored===true, JSON.stringify(gate));

/* 📸 HER OWN PHOTOGRAPHS (2026-08-24). `ownPx` deliberately BYPASSES the
   affiliate gate above, because the licence is hers, not a retailer's — she
   took the picture of a piece she owns. That is a genuine hole in the gate if
   it is ever loosened, so the shape of an acceptable path is pinned hard here:
   a relative file under stars/, never a URL, never a traversal, never an SVG.
   ▶ The whole reason it exists: only 3 of the 19 stars sit on an approved
   advertiser, so the rotation would otherwise show a text-only card 16 weeks
   out of 19 — which is exactly why she froze it in the first place. */
const own=await pg.evaluate(()=>{
  const keep=window.WEEK_STAR_PIN, star=WEEK_STARS.find(x=>x.n===keep);
  const url0=star.url, px0=star.px;
  const shows=()=>{const im=document.querySelector('#wbStar .wks-px');return im?im.getAttribute('src'):null;};
  const out={};
  // her own photo, on a store that could never license one
  star.url='https://www.nordstrom.com/s/8960533'; delete star.px;
  star.ownPx='stars/bangles.jpg'; _renderWeekStar(); out.ownOnUnapproved=shows();
  // ownPx wins when both are present
  star.px=px0; star.url=url0; _renderWeekStar(); out.ownBeatsPx=shows();
  // every shape that must render nothing at all
  out.rejected={};
  ['https://evil.example/x.jpg','stars/../../etc/passwd','javascript:alert(1)',
   'stars/x.svg','bangles.jpg','stars/sub/dir.jpg'].forEach(v=>{
    star.ownPx=v; delete star.px; star.url='https://www.nordstrom.com/s/8960533';
    _renderWeekStar(); out.rejected[v]=shows();
  });
  delete star.ownPx; star.px=px0; star.url=url0; _renderWeekStar();
  out.restored=!!document.querySelector('#wbStar .wks-px');
  return out;
});
ok('OWN PHOTO: hers shows even where a retailer\'s never could',
   own.ownOnUnapproved==='stars/bangles.jpg', String(own.ownOnUnapproved));
ok('OWN PHOTO: hers WINS when both are present',
   own.ownBeatsPx==='stars/bangles.jpg', String(own.ownBeatsPx));
ok('OWN PHOTO: every unsafe or malformed path renders NOTHING',
   Object.values(own.rejected).every(v=>v===null), JSON.stringify(own.rejected));
ok('OWN PHOTO: the queue is left exactly as it was found', own.restored===true);

// the whole card still fits above a real iPhone fold
await pg.setViewportSize({width:390,height:844});
await pg.evaluate(()=>{show('s-wb');_renderWeekStar();window.scrollTo(0,0);});
await pg.waitForTimeout(400);
const fold=await pg.evaluate(()=>{
  const c=document.querySelector('#wbStar .wks-card').getBoundingClientRect();
  const btn=document.querySelector('#wbStar .wks-shop,#wbStar a[href]');
  const sv=document.querySelector('#wbStar .wl-save');
  return {cardBottom:Math.round(c.bottom+window.scrollY),
          shopBottom:btn?Math.round(btn.getBoundingClientRect().bottom+window.scrollY):0,
          saveBottom:sv?Math.round(sv.getBoundingClientRect().bottom+window.scrollY):0};
});
ok('Shop it stays above the iPhone fold (700px)', fold.shopBottom>0&&fold.shopBottom<=700, JSON.stringify(fold));
ok('Save stays above the iPhone fold', fold.saveBottom>0&&fold.saveBottom<=700, JSON.stringify(fold));
await pg.setViewportSize({width:390,height:900});
// put her real state back — the photo-block tests above pinned to a KNOWN
// item on purpose; leave the page exactly as it actually is live.
await pg.evaluate((p)=>{window.WEEK_STAR_PIN=p;},REAL_PIN);

// layout at every width
for(const w of [390,360,320]){
  await pg.setViewportSize({width:w,height:900});
  await pg.evaluate(()=>showDream()); await pg.waitForTimeout(350);
  const r=await pg.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
    over:[...document.querySelectorAll('#s-dream .dc-item, #s-dream .dc-item-px')]
      .filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1).length}));
  ok(`${w}px: no sideways scroll`, r.scroll<=r.client+1, JSON.stringify(r));
  ok(`${w}px: nothing overflows`, r.over===0, JSON.stringify(r));
}
ok('zero JS errors', errs.length===0, errs.join(' | '));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
