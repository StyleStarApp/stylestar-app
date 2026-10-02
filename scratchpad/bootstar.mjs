// The first Amazon Star of the Week (her boots, Oct 4): schedule + both surfaces.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const SP='/tmp/claude-0/-home-user-stylestar-app/ccd2d3bd-13d7-5b8a-a78c-9f83c0ce0e88/scratchpad/';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==','base64');
let pass=0,fail=0;const ok=(c,m,x)=>{c?pass++:fail++;console.log((c?'  ✓ ':'  ✗ ')+m+(c||!x?'':' — '+x))};
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();
let amzCalls=0;
await p.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.pathname.startsWith('/__font/'))return r.fulfill({path:SP+'fonts/'+u.pathname.slice(8),contentType:'font/woff2'});
  if(u.hostname==='fonts.googleapis.com')return r.fulfill({path:SP+'fonts/fonts.css',contentType:'text/css'});
  if(u.pathname.includes('amazon-images')){amzCalls++;return r.fulfill({contentType:'application/json',body:JSON.stringify({images:{B0HCX9JRV8:{url:'https://m.media-amazon.com/images/I/31fNRrBjyQL._SL500_.jpg'}}})});}
  if(u.hostname==='m.media-amazon.com')return fs.existsSync(SP+'boots.jpg')?r.fulfill({path:SP+'boots.jpg'}):r.fulfill({body:PNG,contentType:'image/png'});
  if(u.hostname==='stylestar.app'){let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});}
  if(r.request().resourceType()==='image')return r.fulfill({body:PNG,contentType:'image/png'});
  return r.abort();});
await p.goto('https://stylestar.app/');await p.waitForTimeout(1200);
const sched=await p.evaluate(()=>{const out={};for(let w=0;w<20;w++){const d=new Date(2026,8,27+7*w,12);out[d.toDateString()]=(_weekStar(d)||{}).n;}return out;});
const ks=Object.keys(sched);
ok(sched[ks[0]]==='Valentino Garavani Rockstud Medium Suede Pouch','this week (Sep 27) is unchanged: the Rockstud pouch',sched[ks[0]]);
ok(sched[ks[1]]==='Pointed Toe Mid Calf Boots','HER PICK: Sunday Oct 4 is the boots',sched[ks[1]]);
ok(sched[ks[2]]==='Isabella Celini Stackable Love Bracelet','...and the bracelet moves to Oct 11',sched[ks[2]]);
ok(sched[ks[10]]==='Cashmere & Silk Pashmina'&&sched[ks[11]]==='Zoe Lev Diamond & 14k Gold Bezel Pendant Necklace','...everything after moves exactly one week (pashmina Nov 29 → Dec 6, Zoe Lev → Dec 13)',sched[ks[10]]+' / '+sched[ks[11]]);
console.log('   schedule:',ks.slice(0,17).map(k=>k.slice(4,10)+' '+sched[k]).join(' | '));
// render both surfaces as of Oct 4
await p.evaluate(()=>{const R=Date;window.Date=class extends R{constructor(...a){super(...(a.length?a:[2026,9,4,10]))}static now(){return new R(2026,9,4,10).getTime()}};});
await p.evaluate(()=>{try{_renderWeekStar()}catch(e){};try{_renderDiscoStar()}catch(e){}});
await p.waitForTimeout(1500);
const st=await p.evaluate(()=>{const w=document.getElementById('wbStar'),d=document.getElementById('dsStar');
  const t=e=>e?e.innerText:'';return {wName:t(w.querySelector('.wks-name')),wImg:(w.querySelector('.wks-px')||{}).src||'',
  wDisc:t(w.querySelector('.wks-disc')),dImg:(d.querySelector('.wks-px')||{}).src||'',dDisc:t(d.querySelector('.wks-disc')),
  shop:(w.querySelector('.wks-shop')||{}).href||''};});
ok(st.wName==='Pointed Toe Mid Calf Boots','the Welcome Back card shows the boots',st.wName);
ok(/m\.media-amazon\.com/.test(st.wImg)&&/m\.media-amazon\.com/.test(st.dImg),"both cards show Amazon's own photo",st.wImg+' | '+st.dImg);
ok(/As an Amazon Associate, I earn from qualifying purchases\./.test(st.wDisc)&&/As an Amazon Associate/.test(st.dDisc),"Amazon's required sentence is on both cards",st.wDisc);
ok(/tag=stylestar01-20/.test(st.shop),'Shop it carries her tag',st.shop);
ok(amzCalls<=2,'the photo is asked for once per card at most, then remembered ('+amzCalls+')');
const notAmz=await p.evaluate(()=>{const S=WEEK_STARS.find(s=>s.n==='Isabella Celini Stackable Love Bracelet');return _wksAmzDisc(S)});
ok(notAmz==='','a non-Amazon Star carries no Amazon sentence');
await p.evaluate(()=>{show('s-wb')}).catch(()=>{});await p.waitForTimeout(500);
const el=await p.$('#wbStar .wks-card');if(el){await el.screenshot({path:SP+'boots-star.png'});}
console.log(`\n${fail?'✗':'✓'} ${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0);
