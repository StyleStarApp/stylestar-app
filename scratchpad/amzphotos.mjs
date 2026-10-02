// Amazon Finds photos (2026-10-02). Real Chromium, real index.html + styles.css
// served off disk; the amazon-images function and Amazon's image host are
// stubbed so this spends none of her API allowance.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==','base64');
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'  ✓ ':'  ✗ ')+m)};
async function run(mode){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage();let calls=0;const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',async r=>{const u=new URL(r.request().url());
    if(u.hostname==='m.media-amazon.com')return r.fulfill({body:PNG,contentType:'image/png'});
    if(u.pathname.startsWith('/.netlify/functions/amazon-images')){calls++;
      if(mode==='unconfigured')return r.fulfill({contentType:'application/json',body:'{"images":{},"why":"unconfigured"}'});
      const as=(u.searchParams.get('asins')||'').split(',');const o={};
      as.forEach((a,i)=>{if(i%5!==4)o[a]={url:'https://m.media-amazon.com/images/I/'+a+'.jpg',w:500,h:500}});   // every 5th: Amazon sends nothing
      return r.fulfill({contentType:'application/json',body:JSON.stringify({images:o})});}
    if(u.hostname==='stylestar.app'){let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});}
    if(r.request().resourceType()==='image')return r.fulfill({body:PNG,contentType:'image/png'});
    return r.abort();});
  if(mode==='results'){await p.goto('https://stylestar.app/');await p.waitForTimeout(1200);
    await p.evaluate(()=>{answers=[8,7,6,9,7,6,7,7,8,10,7,9];try{showResult()}catch(e){show('s-res')}});
    await p.waitForTimeout(2500);return {p,b,ctx,errs,calls:()=>calls};}
  await p.goto('https://stylestar.app/finds');await p.waitForTimeout(1500);
  const firstCalls=calls;
  const anchorsBefore=await p.evaluate(()=>document.querySelectorAll('#s-finds a').length);
  await p.evaluate(()=>openFinds());await p.waitForTimeout(1500);
  const s=await p.evaluate(()=>{const it=[...document.querySelectorAll('#s-finds .dc-item')];
    const amz=it.filter(i=>/amazon\.com\/(.*\/)?dp\//.test(i.querySelector('.dc-item-btn')?.getAttribute('href')||''));
    const px=[...document.querySelectorAll('#s-finds .dc-item-px.is-amz')];
    const cs=px[0]&&getComputedStyle(px[0]);
    return {items:it.length,amz:amz.length,px:px.length,
      allFirst:px.every(i=>i.parentNode.firstElementChild===i),
      onePer:it.every(i=>i.querySelectorAll('.dc-item-px').length<=1),
      fit:cs&&cs.objectFit,bg:cs&&cs.backgroundColor,
      hostOk:px.every(i=>/^https:\/\/m\.media-amazon\.com\//.test(i.src)),
      anchors:document.querySelectorAll('#s-finds a').length,
      editPx:document.querySelectorAll('#s-dream .dc-item-px.is-amz').length}});
  return {p,b,ctx,s,anchorsBefore,firstCalls,calls:()=>calls,resetCalls:()=>{calls=0},errs};
}
console.log('— configured');
let r=await run('ok');let s=r.s;
ok(s.amz===s.items&&s.items>0,`every Finds piece is an Amazon link (${s.amz}/${s.items})`);
ok(s.px>0&&s.px<s.amz&&s.px===s.amz-Math.floor(s.amz/10)*2-Math.max(0,s.amz%10-4),`photos placed where Amazon answered, none where it did not (${s.px} of ${s.amz})`);
ok(s.allFirst,'the photo sits at the top of its card');
ok(s.onePer,'never two photos on one card');
ok(s.fit==='contain','a sight-unseen photo is never cropped (object-fit: contain)');
ok(s.bg==='rgb(255, 255, 255)','framed on white, Amazon\'s own ground');
ok(s.hostOk,'every photo is hotlinked from Amazon\'s own image host');
ok(s.anchors===r.anchorsBefore,`no new way out of the app (anchors ${r.anchorsBefore} → ${s.anchors})`);
ok(s.editPx===0,'the Edit is untouched');
ok(r.firstCalls===Math.ceil(s.amz/10),`batched ten at a time (${r.firstCalls} calls for ${s.amz})`);
ok(r.calls()===r.firstCalls,'a second open asks Amazon nothing new, not even for the pieces it had no photo for');
const tap=await r.p.evaluate(()=>{const i=document.querySelector('#s-finds .dc-item-px.is-amz');const btn=i.parentNode.querySelector('.dc-item-btn');let hit=false;btn.addEventListener('click',e=>{hit=true;e.preventDefault()},{once:true});i.click();return {hit,tag:/[?&]tag=stylestar01-20/.test(btn.href)}});
ok(tap.hit,'tapping the photo does what "Shop this item" does');
ok(tap.tag,'…and that link carries her tag');
r.resetCalls();
await r.p.evaluate(()=>{document.querySelectorAll('#s-finds .dc-item-px.is-amz').forEach(i=>i.remove());openFinds()});await r.p.waitForTimeout(800);
const again=await r.p.evaluate(()=>document.querySelectorAll('#s-finds .dc-item-px.is-amz').length);
ok(again===s.px,'reopening restores the same photos');
ok(r.calls()<Math.ceil(s.amz/10),`…from her browser's 12h memory, not a fresh round of calls (${r.calls()})`);
const stale=await r.p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('ss_amzpx_'));const v=JSON.parse(localStorage.getItem(k));v.t-=13*3600*1000;localStorage.setItem(k,JSON.stringify(v));return _amzPxCacheGet(k.slice(9))});
ok(stale===null,'a photo older than 12h is never reused (Amazon allows 24h at most)');
ok(r.errs.length===0,'no page errors'+(r.errs.length?': '+r.errs[0]:''));
await r.b.close();
console.log('— keys not set in Netlify');
r=await run('unconfigured');s=r.s;
ok(s.px===0,'no photos, cards stay the text cards they have always been');
ok(r.calls()===1,'stops after one call instead of asking eight times');
ok(r.errs.length===0,'no page errors');
await r.b.close();
console.log('— the quiz results: "From My Amazon Finds" beside "From My Edit"');
r=await run('results');
const q=await r.p.evaluate(()=>{const e=document.getElementById('resEditGallery'),g=document.getElementById('resFindsGallery');
  const txt=x=>x?x.textContent:'';
  const cats=[...g.querySelectorAll('.fme-go')].map(a=>{const href=a.getAttribute('href');const it=[...document.querySelectorAll('#s-finds .dc-item')].find(i=>href.includes(i.querySelector('.dc-item-btn').getAttribute('href').split('/dp/')[1]));let c=it;while(c&&(c=c.previousElementSibling))if(c.classList.contains('dc-cat'))return c.textContent;return '';});
  return {editOn:e.classList.contains('on'),editCards:e.querySelectorAll('.fme-card').length,editHead:txt(e.querySelector('.eng-lbl')),
    on:g.classList.contains('on'),cards:g.querySelectorAll('.fme-card').length,head:txt(g.querySelector('.eng-lbl')),sub:txt(g.querySelector('.fme-sub')),
    disc:txt(g.querySelector('.fme-disc')),tagged:[...g.querySelectorAll('.fme-go')].every(a=>/tag=stylestar01-20/.test(a.href)&&a.rel.includes('sponsored')),
    after:!!(e.compareDocumentPosition(g)&4),saves:g.querySelectorAll('.wl-save').length,cats,
    allText:txt(e)+' '+txt(g)}});
ok(q.editOn&&q.editCards>0&&q.editHead==='From My Edit','the Edit panel still renders, its heading unchanged');
const eo=await r.p.evaluate(()=>{const raw=[...document.querySelectorAll('#resEditGallery .fme-card')].map(c=>c.querySelector('.fme-n').textContent);
  const want=RES_EDIT_PICKS.map(u=>{const it=_wlEditItems().find(i=>i.url===u&&i.image&&i.el.closest('#s-dream'));return it?it.name:null}).filter(Boolean).slice(0,RES_EDIT_MAX);return {raw,want};});
ok(eo.raw.length>0&&JSON.stringify(eo.raw)===JSON.stringify(eo.want),`the Edit panel shows her Edit picks, in her order (${eo.raw.length})`);
ok(q.on&&q.cards>0&&q.cards<=10,`the Amazon panel shows at most ten pieces (${q.cards}; the stub withholds some photos on purpose)`);
ok(q.after,'…and sits after the Edit panel, never merged into it');
const order=await r.p.evaluate(()=>[...document.querySelectorAll('#resFindsGallery .fme-go')].map(a=>(a.href.match(/dp\/([A-Z0-9]{10})/)||[])[1]));
const picks=await r.p.evaluate(()=>RES_FINDS_PICKS.slice());
const sub=picks.filter(a=>order.includes(a));
ok(picks.length===0||(order.every(a=>picks.includes(a))&&JSON.stringify(order)===JSON.stringify(sub)),`only her picks, in her order (${order.length} shown)`);
ok(picks.length===0||order.length<picks.length,'a pick Amazon gave no photo for is skipped, never shown blank');
ok(!/styled for you|for your style|based on your|picked for you|chosen for you|matched to you|your quiz/i.test(q.allText),'neither panel claims the quiz chose its pieces');
ok(/As an Amazon Associate, I earn from qualifying purchases\./.test(q.disc),"Amazon's required sentence is on the Amazon panel");
ok(q.tagged,'every Amazon card is tagged and sponsored');
ok(q.saves===q.cards,'every Amazon card has a Save');
ok(r.errs.length===0,'no page errors'+(r.errs.length?': '+r.errs[0]:''));
await r.b.close();
console.log(`\n${fail?'✗':'✓'} ${pass} passed, ${fail} failed`);process.exit(fail?1:0);
