/* THE DISCOVERY-PAGE STAR OF THE WEEK — her idea, built 2026-08-21.
   Drives the REAL welcome screen in real Chromium. The assertions that matter
   most are the SWEEP ones: the licensing gate is now shared by two surfaces, so
   this suite proves the rule holds on BOTH from one implementation, and that a
   photo on an unapproved retailer appears on NEITHER. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app';
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');

let pass=0,fail=0; const bad=[];
const ok=(c,m)=>{if(c){pass++}else{fail++;bad.push(m)}};

const lum=c=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return .2126*r+.7152*g+.0722*b;};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
const newPage=async w=>{
  const pg=await b.newPage({viewport:{width:w,height:844}});
  pg.on('pageerror',e=>errs.push(w+': '+e.message));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(900);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
  return pg;
};

// ───────── PART 1 — it renders on a COLD LANDING (the boot path, no show()) ─────────
{
  const pg=await newPage(390);
  const r=await pg.evaluate(()=>{
    const el=document.getElementById('dsStar');
    const S=_weekStar();
    return {onWel:document.getElementById('s-wel').classList.contains('act'),
      on:el.classList.contains('on'), html:el.innerHTML.length,
      name:(el.querySelector('.wks-name')||{}).textContent,
      store:(el.querySelector('.wks-store')||{}).textContent,
      href:(el.querySelector('.wks-shop')||{}).href,
      rel:(el.querySelector('.wks-shop')||{}).getAttribute('rel'),
      target:(el.querySelector('.wks-shop')||{}).getAttribute('target'),
      label:(el.querySelector('.dss-hd b')||{}).textContent,
      note:(el.querySelector('.wks-note')||{}).textContent,
      disc:(el.querySelector('.wks-disc')||{}).textContent,
      save:!!el.querySelector('.wl-save'),
      expect:S.n, expUrl:S.url, expNote:S.note};
  });
  ok(r.onWel,'cold landing shows s-wel');
  ok(r.on,'dsStar carries .on after a COLD landing (boot path, no show())');
  ok(r.name===r.expect,'name is this week\'s Star: '+r.name);
  ok(r.label==='Star of the Week','header label reads "Star of the Week", got '+r.label);
  ok((r.note||'').indexOf(r.expNote)===0,'her own note is on the card');
  ok(/Some links may earn a commission\./.test(r.disc||''),'the disclosure is present — s-wel now carries a product link');
  ok(r.target==='_blank','Shop it opens a NEW TAB, so Style Star is never closed behind her');
  ok(/sponsored/.test(r.rel||'')&&/noopener/.test(r.rel||''),'rel="sponsored noopener" per the standing outbound rule');
  ok(!r.save,'NO save heart on the Discovery card, deliberately (a stranger has no wishlist)');
  // the wrap must not quietly change where the tap lands
  const un=decodeURIComponent(((r.href||'').match(/murl=([^&]+)/)||[])[1]||'');
  ok(un===r.expUrl||r.href===r.expUrl,'unwrapped Shop it target is EXACTLY the product url');
  ok(/linksynergy|dvf\.com/.test(r.href||''),'link is affiliate-wrapped where the advertiser is approved');
  await pg.close();
}

// ───────── PART 2 — the SHARED licensing gate, swept across BOTH Star surfaces ─────────
{
  const pg=await newPage(390);
  const r=await pg.evaluate(()=>{
    const S=_weekStar(); const realPx=S.px, realUrl=S.url;
    const out={};
    // approved advertiser → photo on BOTH surfaces
    _renderDiscoStar(); _renderWeekStar();
    out.discoPhoto=!!document.querySelector('#dsStar .wks-px');
    out.wbPhoto=!!document.querySelector('#wbStar .wks-px');
    // swap the SAME item onto an UNAPPROVED retailer → photo on NEITHER
    S.url='https://www.nordstrom.com/s/8960533';
    _renderDiscoStar(); _renderWeekStar();
    out.discoBlocked=!document.querySelector('#dsStar .wks-px');
    out.wbBlocked=!document.querySelector('#wbStar .wks-px');
    out.stillRenders=document.getElementById('dsStar').classList.contains('on');
    // put it back
    S.url=realUrl; _renderDiscoStar(); _renderWeekStar();
    out.restored=!!document.querySelector('#dsStar .wks-px');
    // and a poisoned px url is refused
    S.px='javascript:alert(1)'; _renderDiscoStar();
    out.poisonBlocked=!document.querySelector('#dsStar .wks-px');
    S.px=realPx; _renderDiscoStar();
    // the gate has ONE implementation
    out.oneGate=(''+_wkStarPxTag).indexOf('_affMid')>-1;
    out.discoInlines=(''+_renderDiscoStar).indexOf('_affMid')===-1;
    out.wbInlines=(''+_renderWeekStar).indexOf('_affMid')===-1;
    return out;
  });
  ok(r.discoPhoto,'approved advertiser → photo shows on the Discovery Star');
  ok(r.wbPhoto,'approved advertiser → photo shows on the Welcome Back Star');
  ok(r.discoBlocked,'UNAPPROVED retailer → NO photo on the Discovery Star');
  ok(r.wbBlocked,'UNAPPROVED retailer → NO photo on the Welcome Back Star');
  ok(r.stillRenders,'a blocked photo degrades to a text card, never a blank hole');
  ok(r.restored,'the gate opens again when the advertiser is approved');
  ok(r.poisonBlocked,'a javascript: px url is refused by _wlSafeUrl');
  ok(r.oneGate,'_wkStarPxTag is the gate');
  ok(r.discoInlines,'_renderDiscoStar does NOT re-derive the gate');
  ok(r.wbInlines,'_renderWeekStar does NOT re-derive the gate');
}

// ───────── PART 3 — placement, the fold, and the frame ─────────
for(const w of [390,375,360,320]){
  const pg=await newPage(w);
  const r=await pg.evaluate(()=>{
    const R=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
      return {top:Math.round(b.top+scrollY),bot:Math.round(b.bottom+scrollY),l:+b.left.toFixed(1),r:+b.right.toFixed(1),h:Math.round(b.height)};};
    const wrap=document.querySelector('#dsStar .dss-wrap');
    const cs=getComputedStyle(document.querySelector('#dsStar .wks-card'),'::before');
    const cardCs=getComputedStyle(document.querySelector('#dsStar .wks-card'));
    const wrapCs=getComputedStyle(wrap);
    const wr=wrap.getBoundingClientRect();
    return {star:R('#dsStar'), hiwline:R('#s-wel .hm-hiwline'), cta:R('#s-wel .hm-cta'), founder:R('#s-wel .hm-founder'),
      restore:R('#restoreSection'), card:R('#dsStar .wks-card'),
      frameBg:cs.backgroundImage, frameInset:[cs.top,cs.left,cs.right,cs.bottom].join(' '),
      cardBg:cardCs.backgroundColor, paper:getComputedStyle(document.querySelector('#s-wel .hm-mirror')).backgroundColor,
      zwrap:wrapCs.zIndex, zcard:cardCs.zIndex,
      framedL:+(wr.left-7).toFixed(1), framedR:+(wr.right+7).toFixed(1),
      discCol:getComputedStyle(document.querySelector('#dsStar .wks-disc')).color,
      shopBg:getComputedStyle(document.querySelector('#dsStar .wks-shop')).backgroundColor,
      shopCol:getComputedStyle(document.querySelector('#dsStar .wks-shop')).color,
      pxW:Math.round((document.querySelector('#dsStar .wks-px')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width),
      pxH:Math.round((document.querySelector('#dsStar .wks-px')||{getBoundingClientRect:()=>({height:0})}).getBoundingClientRect().height),
      overflow:document.documentElement.scrollWidth>window.innerWidth};
  });
  // ⚠️ UPDATED DELIBERATELY 2026-08-21, not silenced. She retired the How It
  // Works 1-2-3 (her pick "B") after looking at the page critically, so the
  // block this used to measure against no longer exists. The Star now follows
  // the FOUNDER LINE. See .hm-hiwline in index.html for her reasoning.
  ok(r.star.top>=r.founder.bot,`${w}: the Star sits AFTER the founder line`);
  ok(r.hiwline&&r.hiwline.bot<=r.founder.top,`${w}: the one-line quiz reassurance sits above the founder line`);
  ok(r.star.bot<=r.restore.top,`${w}: the Star sits ABOVE the restore links`);
  ok(r.cta.bot<700,`${w}: the quiz CTA is still above the ~700px fold (${r.cta.bot})`);
  // 🚨🚨 THIS ASSERTION IS DELIBERATELY INVERTED, 2026-08-21 — read before
  // "fixing" it. It used to demand top>=690, i.e. that the Star cost NOTHING
  // above a ~700px fold, because it sat below How It Works. Retiring that
  // block raised the Star 702 -> 560, and THAT IS THE POINT OF HER CHANGE:
  // a stranger now meets a real garment on her FIRST screen instead of
  // scrolling to find one. The quiz CTA still leads, which is the thing that
  // actually had to be protected, and the next assertion holds that line.
  ok(r.star.top<700,`${w}: a REAL GARMENT reaches the first screen (top ${r.star.top})`);
  ok(r.star.top>r.cta.bot,`${w}: ...but never above the quiz CTA — the screen's first job is untouched`);
  ok(!r.overflow,`${w}: no sideways scroll`);
  // the frame: gradient, real at paint time, never flattened, never antique
  ok(/linear-gradient/.test(r.frameBg),`${w}: the frame is a real GRADIENT at paint time (a flat mid-gold reads brown)`);
  ok(/FEEF98|254, 239, 152/i.test(r.frameBg),`${w}: it is the wb-chip's own bright gold ramp`);
  ok(!/207, 160, 46|138, 106, 20|#CFA02E|#8a6a14/i.test(r.frameBg),`${w}: NO antique gold anywhere in the frame`);
  ok(r.frameInset==='-7px -7px -7px -7px',`${w}: drawn at inset:-7px, so it costs ZERO height, got ${r.frameInset}`);
  // ⚠️ MEASURE AGAINST .hm-founder, never a sibling carrying margin:auto or its
  // own side margin. The retired .hm-hiw rendered 236px against its stated 298
  // because auto cross-axis margins make a flex item size to fit-content, and
  // .hm-hiwline carries a 14px side margin of its own. .hm-founder fills the
  // mirror's content box, which is the edge the framed card should track.
  ok(Math.abs(r.framedL-r.founder.l)<=1&&Math.abs(r.framedR-r.founder.r)<=1,
     `${w}: the FRAMED outer edge fills the paper, flush with the founder line (${r.framedL}-${r.framedR} vs ${r.founder.l}-${r.founder.r})`);
  ok(r.framedL>=r.founder.l-1&&r.framedR<=r.founder.r+1,
     `${w}: nothing spills past the mirror's content box`);
  ok(r.card.r<=r.framedR&&r.card.l>=r.framedL,`${w}: the card sits inside its own frame`);
  ok(r.zwrap==='0'&&r.zcard!=='0',`${w}: the stacking context is on the WRAP, not the card (a -z child paints above its own context's background)`);
  ok(r.cardBg==='rgb(255, 255, 255)',`${w}: the card is WHITE, matching Welcome Back (her call)`);
  ok(ratio(r.discCol,r.paper)>=4.5,`${w}: the disclosure clears AA on the linen (${ratio(r.discCol,r.paper).toFixed(2)}:1)`);
  ok(ratio(r.shopCol,r.shopBg)>=4.5,`${w}: Shop it clears AA (${ratio(r.shopCol,r.shopBg).toFixed(2)}:1)`);
  if(w===390){
    ok(r.pxW===96,'photo is her 96px pick, got '+r.pxW);
    ok(Math.abs(r.pxH/r.pxW-4/3)<0.05,'photo holds 3:4, so a long piece is not cut at the knee');
  }
  await pg.close();
}

// ───────── PART 4 — it degrades honestly, and never appears on Welcome Back's screen ─────────
{
  const pg=await newPage(390);
  const r=await pg.evaluate(()=>{
    const out={};
    const saved=WEEK_STARS.slice();
    WEEK_STARS.length=0; _renderDiscoStar();
    out.emptyQueue=!document.getElementById('dsStar').classList.contains('on')
      && document.getElementById('dsStar').innerHTML==='';
    WEEK_STARS.push.apply(WEEK_STARS,saved);
    // a Star with an unusable url leaves no hole either
    const realUrl=WEEK_STARS[_weekStarIndex()].url;
    WEEK_STARS[_weekStarIndex()].url='javascript:alert(1)'; _renderDiscoStar();
    out.badUrl=!document.getElementById('dsStar').classList.contains('on');
    WEEK_STARS[_weekStarIndex()].url=realUrl; _renderDiscoStar();
    out.back=document.getElementById('dsStar').classList.contains('on');
    // the pin governs both surfaces identically -- proven on a NEUTRAL test
    // pin, never by reading whatever WEEK_STAR_PIN happens to be live right
    // now. ⚠️ REWRITTEN 2026-08-26: the old version compared _weekStar().n
    // against the LIVE WEEK_STAR_PIN, which only ever proved the mechanism
    // while she happened to have a real pin set, and broke outright the
    // moment she unpinned ("yes, let's go ahead and unpin") -- exactly the
    // staleness weekstar.js and editpx.js were already rewritten for.
    const _keepPin=window.WEEK_STAR_PIN;
    window.WEEK_STAR_PIN=WEEK_STARS[0].n;
    out.pinned=_weekStar().n===WEEK_STARS[0].n;
    window.WEEK_STAR_PIN=_keepPin;
    // s-wel owns exactly ONE Star block, s-wb owns its own
    out.oneEach=document.querySelectorAll('#s-wel #dsStar').length===1
      && document.querySelectorAll('#s-wb #wbStar').length===1;
    return out;
  });
  ok(r.emptyQueue,'an empty queue leaves NO hole on the front page');
  ok(r.badUrl,'an unusable url leaves no hole either');
  ok(r.back,'and it comes back when the data is good');
  ok(r.pinned,'the Discovery Star obeys WEEK_STAR_PIN, same as the front door');
  ok(r.oneEach,'exactly one Star block per screen');
  await pg.close();
}

// ───────── PART 5 — a woman WITH results never sees it (she gets the front door's card) ─────────
{
  const pg=await b.newPage({viewport:{width:390,height:844}});
  pg.on('pageerror',e=>errs.push('wb: '+e.message));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.addInitScript(()=>{localStorage.setItem('ss_data',JSON.stringify({
    userName:'Cath',answers:new Array(12).fill(6),portrait:'A test portrait.',motto:'x'}));});
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1100);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
  const r=await pg.evaluate(()=>({
    onWb:document.getElementById('s-wb').classList.contains('act'),
    welActive:document.getElementById('s-wel').classList.contains('act'),
    wbStarOn:document.getElementById('wbStar').classList.contains('on'),
    discoVisible:!!document.getElementById('dsStar').offsetParent}));
  ok(r.onWb&&!r.welActive,'a returning quiz-taker lands on Welcome Back');
  ok(r.wbStarOn,'and the front door Star still renders there');
  ok(!r.discoVisible,'the Discovery Star is not visible to her');
  await pg.close();
}

ok(errs.length===0,'zero JS errors: '+JSON.stringify(errs));
console.log(`\n${pass} passed, ${fail} failed`);
if(fail)console.log(bad.map(x=>'  ✗ '+x).join('\n'));
srv.close(); await b.close();
process.exit(fail?1:0);
