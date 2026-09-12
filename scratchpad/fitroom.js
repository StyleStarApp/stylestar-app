// The fitting room: a second way to look at the wishlist, her ask 2026-09-12.
// ONE list, TWO views -- the row list she has always had, and a photo grid
// for comparing pieces side by side. Never a second list to save into.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const CSS=fs.readFileSync(ROOT+'/styles.css','utf8');
const srv=http.createServer((q,res)=>{
  const u=q.url.split('?')[0];
  if(u==='/styles.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(CSS);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);
});
await new Promise(r=>srv.listen(8991,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let checks=0,fails=0;
const ok=(n,c,d)=>{checks++;if(!c)fails++;console.log((c?'  ✓ ':'  ✗ ')+n+(d!==undefined?'  ['+d+']':''))};

async function open(){
  const ctx=await b.newContext({viewport:{width:390,height:900}});
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(()=>{
    const of=window.fetch;window.fetch=function(u){
      if(String(u).indexOf('style-ai')>=0||String(u).indexOf('user-data')>=0)
        return Promise.resolve(new Response('{}',{status:200}));
      return of.apply(this,arguments);
    };
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',
      answers:[8,7,6,9,7,6,7,7,8,10,7,9],topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
  });
  await pg.goto('http://localhost:8991/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(1000);
  return {pg,errs};
}
function seed(pg){
  return pg.evaluate(()=>{
    // A checked find (real photo), an Edit pick (no photo passed here on
    // purpose -- this test seeds via _wlRegister directly, not through the
    // Edit/Star/curated card builders those separate fixes live in), and a
    // plain browse pick with nothing found at all -- the three real shapes.
    const REAL='https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400';
    const id1=_wlRegister({name:'Blush Silk Wrap Dress',store:'Nordstrom',search:'blush silk wrap dress',
      image:REAL,kind:'found',exact:true,url:'https://www.nordstrom.com/s/123',price:'$228'});
    wishToggle(id1);
    const id2=_wlRegister({name:'Strappy Block Heel Sandal',store:'Bloomingdales',search:'strappy block heel sandal'});
    wishToggle(id2);
    const id3=_wlRegister({name:'Dead Link Blouse',store:'Amazon',search:'dead link blouse',
      image:'https://images.example.invalid/nope.jpg',kind:'found'});
    wishToggle(id3);
    return [id1,id2,id3];
  });
}

{
  const {pg,errs}=await open();
  const ids=await seed(pg);
  await pg.evaluate(()=>openWishlist());
  await pg.waitForTimeout(300);
  console.log('1. Two views, one list');
  ok('list view is the default', await pg.evaluate(()=>document.querySelector('#s-wishlist .wl-viewtabs .wl-vtab.on').textContent.trim())==='List');
  ok('the row list renders', (await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-row').length))===3);
  ok('no grid yet', (await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-gcard').length))===0);

  await pg.click('.wl-vtab:has-text("Fitting Room")');
  await pg.waitForTimeout(600);
  ok('switching tabs swaps the render', (await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-gcard').length))===3);
  ok('the row list is gone while on the grid', (await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-row').length))===0);
  ok('the tab itself now reads on', await pg.evaluate(()=>document.querySelector('#s-wishlist .wl-viewtabs .wl-vtab.on').textContent.trim())==='Fitting Room');
  const persisted=await pg.evaluate(()=>{try{return localStorage.getItem('ss_wl_view')}catch(e){return null}});
  ok('the choice is remembered', persisted==='grid');

  console.log('2. The three real card shapes');
  const cards=await pg.evaluate(()=>[...document.querySelectorAll('#s-wishlist .wl-gcard')].map(c=>({
    name:c.querySelector('.wl-gnm').textContent, noimg:c.classList.contains('noimg'), hasImg:!!c.querySelector('img')
  })));
  const byName=n=>cards.find(c=>c.name===n);
  ok('a piece with no real product found gets the placeholder immediately, no network needed',
    byName('Strappy Block Heel Sandal').noimg && !byName('Strappy Block Heel Sandal').hasImg);
  ok('a piece with a real photo gets a real <img>, not the placeholder', byName('Blush Silk Wrap Dress').hasImg);

  console.log('3. A dead photo link falls back honestly, never a broken-image icon');
  // This sandbox's own egress proxy rejects the dead domain outright, so the
  // REAL onerror event may already have fired by the time this check runs --
  // that is the mechanism working, not a race to paper over. Only if it is
  // still a live <img> (a slower failure mode) do we call the exact function
  // that event calls, to prove the fallback itself independent of timing.
  const stillLive=await pg.evaluate(()=>{
    const c=[...document.querySelectorAll('#s-wishlist .wl-gcard')].find(x=>x.querySelector('.wl-gnm').textContent==='Dead Link Blouse');
    return !!c.querySelector('img');
  });
  if(stillLive){
    ok('starts as a real <img> tag (an honest attempt, not pre-judged)', true);
    await pg.evaluate(()=>{
      const c=[...document.querySelectorAll('#s-wishlist .wl-gcard')].find(x=>x.querySelector('.wl-gnm').textContent==='Dead Link Blouse');
      _wlGridImgFail(c.querySelector('img'));
    });
  }else{
    ok('the real onerror already fired on its own (proxy rejected it outright)', true);
  }
  const afterFail=await pg.evaluate(()=>{
    const c=[...document.querySelectorAll('#s-wishlist .wl-gcard')].find(x=>x.querySelector('.wl-gnm').textContent==='Dead Link Blouse');
    return {noimg:c.classList.contains('noimg'), hasImg:!!c.querySelector('img'), hasPlaceholder:!!c.querySelector('.wl-gplaceholder')};
  });
  ok('the card marks itself noimg', afterFail.noimg);
  ok('the broken <img> is gone', !afterFail.hasImg);
  ok('the SAME placeholder takes its place, not a blank gap', afterFail.hasPlaceholder);

  console.log('4. A PRODUCT PHOTO IS NEVER CROPPED -- the same rule as the finder cards, one screen further out');
  const fit=await pg.evaluate(()=>getComputedStyle(document.querySelector('#s-wishlist .wl-gcard img')).objectFit);
  ok('grid photos use contain, never cover', fit==='contain');

  console.log('5. Acting from the grid');
  const before=await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-gcard').length);
  await pg.click('#s-wishlist .wl-gcard .wl-del >> nth=0');
  await pg.waitForTimeout(200);
  const after=await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-gcard').length);
  ok('the x removes a card from the grid, same as the row list', after===before-1);
  ok('removing from the grid removes it from the real list, not a grid-only copy',
    (await pg.evaluate(()=>_wlList().length))===2);
  const goHref=await pg.evaluate(()=>{
    const c=document.querySelector('#s-wishlist .wl-gcard');
    const a=c.querySelector('a.wl-ggo');
    return a?a.getAttribute('href'):null;
  });
  ok('a card with a real link is a real <a>, tappable as a whole card', !!goHref && goHref.indexOf('http')===0);

  console.log('6. Nothing escapes its frame');
  for(const w of [390,375,360,320]){
    await pg.setViewportSize({width:w,height:900});
    await pg.waitForTimeout(150);
    const overflow=await pg.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    ok(w+'px: no sideways scroll', !overflow);
  }

  console.log('7. The reload-survival bug this build fixed');
  // The whole point: a save's photo must still be there after normalize()
  // re-runs, which happens on every fresh load, not just the one that saved it.
  const survives=await pg.evaluate(()=>{
    const raw=JSON.parse(localStorage.getItem('ss_wardrobe'));
    const before=raw.wishlist.find(x=>x.name==='Blush Silk Wrap Dress');
    if(!before||!before.image)return {seeded:false};
    const normalized=_normalizeWardrobe(JSON.parse(JSON.stringify(raw)));
    const after=normalized.wishlist.find(x=>x.name==='Blush Silk Wrap Dress');
    return {seeded:true, keptImage: !!(after&&after.image===before.image)};
  });
  ok('a saved photo is present before reload', survives.seeded);
  ok('...and SURVIVES _normalizeWardrobe, which runs on every fresh load', survives.keptImage);

  ok('zero JS errors', errs.length===0, errs.join('|'));
}

console.log('\n'+checks+' checks run, '+fails+' failures');
await b.close();
process.exit(fails?1:0);
