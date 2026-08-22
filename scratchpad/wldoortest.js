// The wishlist door: the line that replaces the Tip once she has saved something.
// Drives the REAL SAVE controls, never seeded storage, so every count is real.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8951,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let checks=0,fails=0;
const ok=(n,c,d)=>{checks++;if(!c)fails++;console.log((c?'  ✓ ':'  ✗ ')+n+(d!==undefined?'  ['+d+']':''))};
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];

async function open(w,seedStamp){
  const ctx=await b.newContext({viewport:{width:w,height:1000},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(([picks,stamp])=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    if(stamp)localStorage.setItem('ss_hearttip','1');
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      if(String(u).indexOf('user-data')>=0)return Promise.resolve(new Response('{}',{status:200}));
      return of.apply(this,arguments);};},[PICKS,seedStamp]);
  await pg.goto('http://localhost:8951/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  return {ctx,pg,errs};
}
const state=pg=>pg.evaluate(()=>{
  const q=s=>document.querySelector('#s-shopstyle '+s);
  const tip=q('[data-hearttip]'), door=q('[data-wldoor]');
  const go=door?door.querySelector('.wl-door-go'):null;
  const sv=door?door.querySelector('svg'):null;
  const rd=n=>Math.round(n*10)/10;
  return {tip:!!(tip&&tip.offsetHeight>0), door:!!(door&&door.offsetHeight>0),
    text:door&&door.offsetHeight>0?door.textContent.replace(/\s+/g,' ').trim():null,
    italic:go?getComputedStyle(go).fontStyle:null,
    family:door?getComputedStyle(door).fontFamily:null,
    size:door?getComputedStyle(door).fontSize:null,
    fill:sv?sv.getAttribute('fill'):null,
    d:sv?sv.querySelector('path').getAttribute('d'):null,
    tipD:(function(){const q=tip&&tip.querySelector('.ht-h svg path');return q?q.getAttribute('d'):null})(),
    tap:go?rd(go.getBoundingClientRect().height):null,
    lines:door&&door.offsetHeight>0?Math.round(door.getBoundingClientRect().height/(parseFloat(getComputedStyle(door).lineHeight))):null,
    canonical:window._WL_HEART_PATH};
});

console.log('1. The switch: tip while learning, door once she has saved');
{
  const {ctx,pg,errs}=await open(375,false);
  let s=await state(pg);
  ok('0 saves: the TIP is showing',s.tip&&!s.door);
  ok("...and its heart is the app's own shape, not the old U+2661 glyph",s.tipD===s.canonical);
  await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save')[0].click());
  await pg.waitForTimeout(300);
  s=await state(pg);
  ok('1 save: the DOOR replaces it',s.door&&!s.tip,s.text);
  ok('it counts honestly',/^1 saved/.test(s.text),s.text);
  await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save')[1].click());
  await pg.waitForTimeout(300);
  s=await state(pg);
  ok('2 saves: still the door, count moved',/^2 saved/.test(s.text),s.text);
  ok('the tip does NOT come back',!s.tip);
  ok('her wording',/2 saved · See Your Wishlist →/.test(s.text),s.text);
  // unsave both -> back to nothing, never re-taught
  await pg.evaluate(()=>{document.querySelectorAll('#shopStyleContent .wl-save.on').forEach(b=>b.click())});
  await pg.waitForTimeout(300);
  s=await state(pg);
  ok('emptied again: nothing at all, she is never re-taught',!s.tip&&!s.door);
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n2. Her design calls');
{
  const {ctx,pg,errs}=await open(375,false);
  await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save')[0].click());
  await pg.waitForTimeout(300);
  const s=await state(pg);
  ok('NO ITALICS, her call',s.italic==='normal',s.italic);
  ok('her paper voice: Lora 15.5px',/Lora/.test(s.family)&&s.size==='15.5px',s.family+' '+s.size);
  ok('the heart is FILLED gold, her call',s.fill==='#F2D889',s.fill);
  ok('...and it is the app\'s EXACT heart shape (_WL_HEART_PATH)',s.d===s.canonical);
  ok('one line at her width',s.lines===1,'lines '+s.lines);
  ok('the link is a real tap target for an 18-to-80 audience (>=40px)',s.tap>=40,s.tap+'px');
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n3. It is a door, and Back comes home');
{
  const {ctx,pg,errs}=await open(375,false);
  await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save')[0].click());
  await pg.waitForTimeout(300);
  await pg.evaluate(()=>document.querySelector('#s-shopstyle [data-wldoor] .wl-door-go').click());
  await pg.waitForTimeout(600);
  const where=await pg.evaluate(()=>document.querySelector('.scr.act').id);
  ok('tapping it lands on Your Wishlist',where==='s-wishlist',where);
  // ⚠️ NOT [data-wl] -- that attribute lives on the SAVE control on a card, never
  // on a wishlist row. Asserting it here read as "the save did not persist" when
  // the save was perfect: the broken-harness shape, again.
  const saved=await pg.evaluate(()=>document.querySelectorAll('#s-wishlist .wl-nm').length);
  ok('and the piece she saved is really on it',saved>=1,String(saved));
  await pg.evaluate(()=>{wishlistPrevScreen&&show(wishlistPrevScreen)});
  await pg.waitForTimeout(400);
  ok('the way back is Shop your style, not a dead end',
    await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-shopstyle');
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n4. Contrast + no overflow, at every width');
for(const w of [430,393,375,360,320]){
  const {ctx,pg,errs}=await open(w,false);
  await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save')[0].click());
  await pg.waitForTimeout(300);
  const m=await pg.evaluate(()=>{
    const d=document.querySelector('#s-shopstyle [data-wldoor]');
    const go=d.querySelector('.wl-door-go');
    const lum=c=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*r+.7152*g+.0722*b};
    let bg='rgb(255,255,255)',e=d;
    while(e){const c=getComputedStyle(e).backgroundColor;
      if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c)){bg=c;break}e=e.parentElement}
    const cr=(a,b2)=>{const l1=lum(a),l2=lum(b2);return Math.round(((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05))*100)/100};
    const r=d.getBoundingClientRect(), scr=document.getElementById('s-shopstyle').getBoundingClientRect();
    return {ink:cr(getComputedStyle(d).color,bg), link:cr(getComputedStyle(go).color,bg),
      overflowL:Math.round(scr.left-r.left), overflowR:Math.round(r.right-scr.right),
      pageScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth};
  });
  console.log(`  --- ${w}px ---`);
  ok('body ink clears AA (4.5:1)',m.ink>=4.5,m.ink+':1');
  ok('the link clears AA against the real painted paper',m.link>=4.5,m.link+':1');
  ok('nothing overflows its screen',m.overflowL<=0&&m.overflowR<=0,`L${m.overflowL} R${m.overflowR}`);
  ok('no sideways page scroll',!m.pageScroll);
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log(`\nall ${checks} checks run, ${fails} failures`);
await b.close();srv.close();process.exit(fails?1:0);
