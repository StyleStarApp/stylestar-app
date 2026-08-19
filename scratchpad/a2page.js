// "Add as an App" page — her ask 2026-08-19, her pick B + "Add as an App".
// ⚠️ Drives the REAL app. Never asserts against a display:none element (the
// standing trap) — the menu is opened for real and the page navigated to.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'),PORT=8951;
const T={'.html':'text/html','.png':'image/png','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
let pass=0,fail=0; const ok=(c,m)=>{c?pass++:fail++;if(!c)console.log('  FAIL: '+m)};

async function page(w,ua){
  const ctx=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:2,userAgent:ua});
  const pg=await ctx.newPage(); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  return {pg,ctx,errs};
}

// ── 1. reachable from the real Menu, on a real iPhone UA ──────────────────
{
  const {pg,ctx,errs}=await page(390,IOS);
  const r=await pg.evaluate(()=>{
    menuOpen();
    const rows=[...document.querySelectorAll('.menu-row')].map(x=>x.textContent.trim());
    const row=[...document.querySelectorAll('.menu-row')].find(x=>x.textContent.trim()==='Add as an App');
    if(!row)return{found:false,rows};
    row.click();
    const scr=document.getElementById('s-a2hs');
    return {found:true,rows,active:scr.classList.contains('act'),
      drawerClosed:!document.body.classList.contains('menu-open'),
      title:document.querySelector('#s-a2hs .story-title').textContent.trim(),
      hasLetterhead:!!document.querySelector('#s-a2hs .pp-lh-logo'),
      framed:document.querySelector('.ss').classList.contains('a2hs-mirror'),
      globalFooterHidden:getComputedStyle(document.querySelector('.quiz-footer')).display==='none',
      iconSrc:(document.querySelector('#s-a2hs .ap-slot img')||{}).getAttribute?document.querySelector('#s-a2hs .ap-slot img').getAttribute('src'):null,
      steps:[...document.querySelectorAll('#s-a2hs .ap-step')].map(x=>x.textContent.replace(/\s+/g,' ').trim()),
      // ⚠️ ASSERT DIMENSIONS, NOT JUST POSITIONS. The heart's size lives under
      // #a2hs (the whisper's scope) and did NOT reach this page: it rendered at
      // the SVG default and was enormous, while every positional check passed.
      hearts:[...document.querySelectorAll('#s-a2hs .ap-body svg')].filter(x=>/a2-h|pinkheart/.test(x.getAttribute('class')||''))
        .map(h=>{const b=h.getBoundingClientRect();return{w:Math.round(b.width),h:Math.round(b.height)}}),
      // the title must clear the fixed Menu chip, which drops by the safe-area inset
      // the whisper's own heart must survive — only THIS page loses it
      whisperKeepsHeart:/(<svg|a2-h)/.test((function(){_a2hsPrompt=null;
        try{_syncA2hs()}catch(e){} var t=document.getElementById('a2hsTxt');
        return t?t.innerHTML:''})()),
      titleTop:Math.round(document.querySelector('#s-a2hs .story-title').getBoundingClientRect().top),
      chipBottom:Math.round(document.querySelector('.menu-chip').getBoundingClientRect().bottom),
      notes:[...document.querySelectorAll('#s-a2hs .ap-note')].map(x=>x.textContent.replace(/\s+/g,' ').trim()),
      // ⚠️ THE LOAD-BEARING ONE: Apple exposes no install API, so nothing on
      // the iOS path may look tappable.
      tappables:[...document.querySelectorAll('#s-a2hs .ap-body *')].filter(e=>
        e.tagName==='A'||e.tagName==='BUTTON'||e.hasAttribute('onclick')||getComputedStyle(e).cursor==='pointer').map(e=>e.className||e.tagName)
    };
  });
  console.log('\n── Menu → page (iPhone) ──');
  ok(r.found,'no "Add as an App" row in the menu');
  ok(r.active,'page did not activate');
  ok(r.drawerClosed,'drawer stayed open');
  ok(r.title==='Add as an App','title is "'+r.title+'"');
  ok(r.hasLetterhead===false,'letterhead logo still present (her call: remove it)');
  ok(r.framed,'display-case frame missing');
  ok(r.globalFooterHidden,'global footer not hidden');
  ok(r.iconSrc==='apple-touch-icon.png','home-screen preview icon missing');
  ok(r.steps.length===2,'expected 2 steps, got '+r.steps.length);
  ok(/browser's toolbar/.test(r.steps[0]),'step 1 must say browser\'s toolbar');
  ok(!/bottom of your screen/i.test(r.steps.join(' ')),'must never say "bottom of your screen"');
  ok(/Add to Home Screen/.test(r.steps[1]),'step 2 must name Add to Home Screen');
  ok(r.notes.some(n=>/wallpaper/i.test(n)),'HER ask: the wallpaper explanation is missing');
  ok(r.notes.some(n=>/View More/.test(n)),'the View More note is missing');
  ok(r.tappables.length===0,'iOS path has tappable-looking elements: '+r.tappables.join(', '));
  // DELIBERATELY REVERSED 2026-08-19, her call: "it's not really my voice here."
  // Correct by her own mark system — the tilted pink heart means CATHERINE
  // SPEAKING, and this page is instructions. Asserted ABSENT so it cannot creep
  // back, and asserted still PRESENT in the Welcome Back whisper, which is her
  // voice and which she blessed on 2026-08-05.
  ok(r.hearts.length===0,'a pink heart is back on this page: '+JSON.stringify(r.hearts));
  ok(r.whisperKeepsHeart,'the Welcome Back whisper lost its heart — that one IS her voice');
  ok(!/calls it/i.test(r.notes.join(' ')),'"calls it" is back (her ear: it reads like a phone call)');
  ok(/^Add to Home Screen just means/.test(r.notes[0]||''),'the meaning note should lead with the button name');
  ok(r.titleTop>=r.chipBottom+8,'title only '+(r.titleTop-r.chipBottom)+'px below the Menu chip');
  ok(r.rows.length===20,'menu should be 20 rows, is '+r.rows.length);
  ok(errs.length===0,'JS errors: '+errs.join(' | '));
  await ctx.close();
}

// ── 2. the other three states ─────────────────────────────────────────────
{
  const {pg,ctx,errs}=await page(390,IOS);
  const r=await pg.evaluate(()=>{
    const out={};
    // desktop: a page she navigated to deliberately must never be blank
    _a2hsIOS=()=>false; _a2hsPrompt=null; _syncA2hsPage();
    out.desktop=document.getElementById('a2hsPageSteps').textContent.replace(/\s+/g,' ').trim();
    // android: a REAL button off a real prompt event
    _a2hsPrompt={prompt(){out.prompted=true},userChoice:Promise.resolve({outcome:'dismissed'})};
    _syncA2hsPage();
    out.android=document.getElementById('a2hsPageSteps').textContent.replace(/\s+/g,' ').trim();
    out.androidBtn=!!document.querySelector('#s-a2hs .ap-btn');
    document.querySelector('#s-a2hs .ap-btn').click();
    // installed
    _a2hsPrompt=null; localStorage.setItem('ss_a2hs','1'); _syncA2hsPage();
    out.installed=document.getElementById('a2hsPageSteps').textContent.replace(/\s+/g,' ').trim();
    localStorage.removeItem('ss_a2hs');
    return out;
  });
  console.log('\n── the four states ──');
  ok(/stylestar\.app/.test(r.desktop)&&r.desktop.length>10,'desktop state blank or unhelpful: "'+r.desktop+'"');
  ok(r.androidBtn,'android has no real button');
  ok(/Add it now/.test(r.android),'android button wording');
  ok(r.prompted===true,'android button did not fire the install prompt');
  ok(/already/i.test(r.installed),'installed state should say it is already added');
  ok(errs.length===0,'JS errors: '+errs.join(' | '));
  await ctx.close();
}

// ── 3. fits, reads, and gets back out — at three widths ───────────────────
for(const w of [390,360,320]){
  const {pg,ctx,errs}=await page(w,IOS);
  const r=await pg.evaluate(()=>{
    showA2hsPage();
    const body=document.querySelector('#s-a2hs .ap-body');
    const lum=h=>{const c=h.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    const cr=(f,b)=>{const l=[lum(f),lum(b)].sort((a,b)=>b-a);return Math.round(((l[0]+.05)/(l[1]+.05))*100)/100};
    const bg=getComputedStyle(document.querySelector('#s-a2hs .story-wrap')).backgroundColor;
    const paper=bg==='rgba(0, 0, 0, 0)'?getComputedStyle(document.querySelector('.ss')).backgroundColor:bg;
    const sample=s=>{const e=document.querySelector(s);return e?cr(getComputedStyle(e).color,paper):null};
    return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      bodyRight:Math.round(body.getBoundingClientRect().right),vw:window.innerWidth,
      iconSize:(()=>{const i=document.querySelector('#s-a2hs .ap-slot img');const b=i.getBoundingClientRect();return Math.round(b.width)+'x'+Math.round(b.height)})(),
      crLead:sample('#s-a2hs .ap-lead'),crSub:sample('#s-a2hs .ap-sub'),
      crStep:sample('#s-a2hs .ap-step'),crNote:sample('#s-a2hs .ap-note'),
      backWorks:(()=>{closeA2hsPage();return !document.getElementById('s-a2hs').classList.contains('act')})()};
  });
  console.log(`\n── ${w}px ──`);
  ok(!r.overflow,'page scrolls sideways');
  ok(r.bodyRight<=r.vw,'content overflows viewport ('+r.bodyRight+' > '+r.vw+')');
  ok(r.iconSize==='52x52','icon should be 52x52, is '+r.iconSize);   // assert DIMENSIONS
  ok(r.crLead>=4.5,'lead contrast '+r.crLead);
  ok(r.crSub>=4.5,'sub contrast '+r.crSub);
  ok(r.crStep>=4.5,'step contrast '+r.crStep);
  ok(r.crNote>=4.5,'note contrast '+r.crNote);
  ok(r.backWorks,'Back did not leave the page');
  ok(errs.length===0,'JS errors: '+errs.join(' | '));
  await ctx.close();
}

// ── 4. every menu row still holds one line ────────────────────────────────
for(const w of [390,360,320]){
  const {pg,ctx}=await page(w,IOS);
  const r=await pg.evaluate(()=>{
    menuOpen();
    return [...document.querySelectorAll('.menu-row')].map(row=>{
      const rg=document.createRange(); rg.selectNodeContents(row);
      // ⚠️ Rect-top clustering is the WRONG instrument here: getClientRects
      // returns a rect per ELEMENT, and these rows carry inline marks (the
      // Start here pill, the pink hearts) that sit far enough off the text
      // line to read as a second line. menu.js and menux.js both measure
      // HEIGHT instead, which inline children cannot fake. Same method here.
      const cs=getComputedStyle(row);
      const pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
      const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.2;
      const lines=(row.getBoundingClientRect().height-pad)/lh;
      return {t:row.textContent.trim(),lines:Math.round(lines*100)/100};
    }).filter(x=>x.lines>1.5);
  });
  console.log(`\n── menu rows @ ${w}px ──`);
  ok(r.length===0,'rows wrap: '+r.map(x=>x.t+'('+x.lines+')').join(', '));
  await ctx.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail?1:0);
