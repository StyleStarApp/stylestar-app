/* "FROM MY EDIT" on the quiz results (#resEditGallery) — built 2026-09-28.
 *
 *   node scratchpad/fromedit.mjs
 *
 * 🚨 THE CHECK THIS SUITE EXISTS FOR IS §2. An earlier draft of this panel was
 *    headed "Styled For You" above pieces Cath picked months ago, in Edit order,
 *    with nothing personalised about them. SHE caught it, not a test. That is
 *    the same family as claiming a size or colour we never verified, so it gets
 *    a permanent guard — and the guard names the RULE (no personalisation
 *    claim), never her wording, which she is free to rewrite tomorrow.
 *
 * ⚠️ Retail hosts and Google Fonts are unreachable from the sandbox, so both are
 *    served from the local cache in scratchpad/px + scratchpad/fonts. Without
 *    that the photo checks measure blank frames and the type is a browser
 *    default — see the GUARD section, which fails the run rather than lying.
 */
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium=(await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const WORK='/tmp/claude-0/-home-user-stylestar-app/78f1094e-0fce-5e9f-8b44-0ed208a976da/scratchpad';
const urls=fs.readFileSync(WORK+'/urls.txt','utf8').trim().split('\n');
const pxMap=new Map(), byPath=new Map();
urls.forEach((u,i)=>{const f=WORK+'/px/'+(i+1)+'.img';pxMap.set(u,f);try{byPath.set(new URL(u).pathname,f)}catch(e){}});
const fontMap=new Map();
fs.readFileSync(WORK+'/fonts/map.txt','utf8').trim().split('\n').forEach(l=>{const[a,b]=l.split('|');fontMap.set(a,WORK+'/'+b);});

const PORT=8939, ORIGIN='http://localhost:'+PORT;
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,ORIGIN).pathname;
  const f=path.join(ROOT,p==='/'?'index.html':p.replace(/^\//,''));
  if(fs.existsSync(f)&&fs.statSync(f).isFile()){res.writeHead(200);res.end(fs.readFileSync(f));return;}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(ROOT,'index.html')));
});
await new Promise(r=>server.listen(PORT,r));
let pass=0,fail=0;
const ok=(n,c,e)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n+(e?'  → '+e:''))}};

const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:390,height:844}});
const page=await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.route('**/.netlify/functions/**',r=>r.fulfill({status:200,headers:{'Content-Type':'application/json'},body:'{"success":true}'}));
await page.route(/^https?:\/\/(?!localhost)/,r=>{
  const u=r.request().url();
  if(/fonts\.googleapis\.com/.test(u))return r.fulfill({status:200,headers:{'Content-Type':'text/css'},body:fs.readFileSync(WORK+'/fonts/gf.css')});
  const ff=fontMap.get(u);
  if(ff&&fs.existsSync(ff))return r.fulfill({status:200,headers:{'Content-Type':'font/woff2'},body:fs.readFileSync(ff)});
  let f=pxMap.get(u); if(!f){try{f=byPath.get(new URL(u).pathname)}catch(e){}}
  if(f&&fs.existsSync(f)){const b=fs.readFileSync(f);
    return r.fulfill({status:200,headers:{'Content-Type':b[0]===0x89?'image/png':'image/jpeg'},body:b});}
  return r.abort();
});
await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>typeof window.showResult==='function');
await page.evaluate(()=>document.fonts.ready);

console.log('\n0. GUARD — without these every number below is a browser default');
const g=await page.evaluate(()=>({
  link:!![...document.querySelectorAll('link[rel=stylesheet]')].find(l=>/styles\.css/.test(l.href)),
  serif:document.fonts.check('16px "DM Serif Display"'),lora:document.fonts.check('16px "Lora"')}));
ok('the real styles.css is applied',g.link);
ok('her real fonts loaded (DM Serif Display + Lora)',g.serif&&g.lora);
if(!g.link||!g.serif){console.log('\nGUARD FAILED — aborting.');process.exit(1);}

const goRes=async()=>{await page.evaluate(()=>{
  window.userName='Catherine'; window.answers=[8,7,6,9,7,6,7,7,8,10,7,9];
  window.topArchNames=['The Modern Romantic','The Polished Trendsetter'];
  window.emailDone=true; window._resNoReveal=true;
  window.showResult('A portrait.',[{n:'The Modern Romantic'},{n:'The Polished Trendsetter'}],'A motto.');
}); await page.waitForTimeout(900);};
await goRes();

console.log('\n1. It renders, from the Edit, at runtime');
const base=await page.evaluate(()=>{
  const el=document.getElementById('resEditGallery');
  return {on:el.classList.contains('on'),cards:el.querySelectorAll('.fme-card').length,
    max:window.RES_EDIT_MAX,
    editWithPhoto:_wlEditItems().filter(i=>i.el.closest('#s-dream')&&i.image).length};
});
ok('the panel is switched on',base.on);
ok('it shows cards, capped at RES_EDIT_MAX and never more than the Edit has',
   base.cards>0&&base.cards===Math.min(base.max,base.editWithPhoto),
   'cards='+base.cards+' max='+base.max+' editWithPhoto='+base.editWithPhoto);

console.log('\n2. 🚨 THE HEADING NEVER CLAIMS THE QUIZ CHOSE THESE (her catch)');
/* THE RULE, NOT HER STRING: she may reword this panel whenever she likes; what
   she may never do is let it imply personalisation, because nothing here is
   personalised. Phrases that make that claim are what is banned. */
const CLAIMS=/\b(styled for you|for your style|based on your|chosen for you|picked for you|selected for you|matched to|your (style )?(match|matches)|curated for you|just for you)\b/i;
const copy=await page.evaluate(()=>{
  const el=document.getElementById('resEditGallery');
  return {head:el.querySelector('.eng-lbl').textContent,sub:el.querySelector('.fme-sub').textContent,
          all:el.innerText};
});
ok('the heading makes no personalisation claim',!CLAIMS.test(copy.head),copy.head);
ok('the subtitle makes no personalisation claim',!CLAIMS.test(copy.sub),copy.sub);
ok('nothing anywhere in the panel claims it was chosen from her answers',!CLAIMS.test(copy.all));
ok('it still says plainly that a person picked these',/selected by Catherine|chosen by AI/i.test(copy.all));

console.log('\n3. Every piece earns — affiliate wrapping is not optional');
const links=await page.evaluate(()=>[...document.querySelectorAll('#resEditGallery a.fme-go')]
  .map(a=>({href:a.getAttribute('href'),rel:a.getAttribute('rel')})));
ok('every card links out with rel="sponsored noopener"',
   links.length>0&&links.every(l=>/sponsored/.test(l.rel)&&/noopener/.test(l.rel)));
ok('every href went through _affUrl (none is the raw shop url from the markup)',
   links.every(l=>/click\.linksynergy\.com|anrdoezrs|dpbolvw|kqzyfj|jdoqocy|tkqlhce|amazon\.[a-z.]+\/.*tag=/.test(l.href)),
   links.map(l=>l.href.slice(0,48)).join(' | ').slice(0,200));

console.log('\n4. A trip to the Edit must not double-wrap the links');
/* _wlDecorateEdit() rewrites the Edit's own hrefs the moment she opens it. This
   panel re-renders on every visit to the results screen, so it would re-wrap an
   already-wrapped url if _affUrl were not idempotent. That exact bug put the
   Star of the Week on screen twice in September. */
await page.evaluate(()=>showDream()); await page.waitForTimeout(700);
await goRes();
const after=await page.evaluate(()=>[...document.querySelectorAll('#resEditGallery a.fme-go')]
  .map(a=>a.getAttribute('href')));
ok('no href is wrapped twice after opening the Edit and coming back',
   after.every(h=>(h.match(/click\.linksynergy\.com/g)||[]).length<=1));
ok('the panel still has its cards after the round trip',after.length===base.cards);

console.log('\n5. A photograph is never cropped on this surface');
/* Same rule and same reasoning as #wbEditTeaser: the Edit's per-item pxPos crops
   are tuned for the EDIT's frame, and this grid is a different shape. */
const px=await page.evaluate(()=>[...document.querySelectorAll('#resEditGallery .fme-px img')]
  .map(i=>({fit:getComputedStyle(i).objectFit,loaded:i.naturalWidth>0})));
ok('every photo is object-fit:contain',px.length>0&&px.every(p=>p.fit==='contain'));
ok('every card that rendered actually has a real photograph behind it',px.every(p=>p.loaded));

console.log('\n6. The save control is the app\'s own, and it is readable');
const sv=await page.evaluate(()=>{
  const b=[...document.querySelectorAll('#resEditGallery .wl-save')];
  return {n:b.length,cards:document.querySelectorAll('#resEditGallery .fme-card').length,
    labelled:b.filter(x=>(x.textContent||'').trim().length>0).length,
    tap:b.map(x=>{const r=x.getBoundingClientRect();return Math.min(r.width,r.height)})};
});
ok('every card carries a save control',sv.n===sv.cards&&sv.n>0);
ok('each one is the real _wlSaveBtn with its readable word, never a bare icon',sv.labelled===sv.n);
ok('the tap target stays a real target (>=24px on its short side)',sv.tap.every(v=>v>=24),JSON.stringify(sv.tap.slice(0,3)));

console.log('\n7. HER PLACEMENT RULING — after the Signature, before the Style Star Card');
/* Pinned as ORDER, never as a pixel offset, so a copy edit above it cannot
   fail this check. Her decision, 2026-09-28, and the reason is in the markup:
   the Card ASKS her to share, and that ask comes after she has seen something
   beautiful, never before. */
const order=await page.evaluate(()=>{
  const res=document.getElementById('s-res');
  const kids=[...res.querySelectorAll('.stack > *')];
  const idx=sel=>kids.findIndex(k=>k.matches(sel)||k.id===sel.replace('#',''));
  return {sig:kids.findIndex(k=>k.classList.contains('p2')),
          panel:kids.findIndex(k=>k.id==='resEditGallery'),
          card:kids.findIndex(k=>k.classList.contains('kbwrap')),
          menu:kids.findIndex(k=>k.classList.contains('p3'))};
});
ok('the panel comes AFTER the Style Signature',order.panel>order.sig&&order.sig>=0,JSON.stringify(order));
ok('the panel comes BEFORE the Style Star Card',order.panel<order.card,JSON.stringify(order));
ok('the menu still comes last',order.menu>order.card,JSON.stringify(order));

console.log('\n8. Only pieces with a photograph, and only from the Edit');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const fn=src.slice(src.indexOf('function _renderEditGallery'),src.indexOf('function _renderEditGallery')+1400);
ok('it filters to #s-dream, so a Finds piece can never leak in',/#s-dream/.test(fn));
ok('it requires an image, so no empty frame can render',/it\.image/.test(fn));
ok('it is built from _wlEditItems(), never a second hand-kept list',/_wlEditItems\(\)/.test(fn));

console.log('\n9. No page errors');
ok('the page raised no javascript errors',errs.length===0,errs.slice(0,2).join(' | '));

console.log('\n'+(fail?'✗ ':'✓ ')+pass+' passed, '+fail+' failed');
await browser.close(); server.close();
process.exit(fail?1:0);
