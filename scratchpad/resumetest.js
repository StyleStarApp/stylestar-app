// THE WAY BACK, end to end. Drives the real screens: shop, tap out, come back.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  if(u==='/store'){res.writeHead(200,{'Content-Type':'text/html'});return res.end('<h1>A store</h1>');}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8957,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let checks=0,fails=0,calls=0;
const ok=(n,c,d)=>{checks++;if(!c)fails++;console.log((c?'  ✓ ':'  ✗ ')+n+(d!==undefined?'  ['+d+']':''))};
const PICKS=[{name:'Sequin Mini Dress',store:'Revolve',search:'sequin mini dress'},
 {name:'Strappy Heeled Sandals',store:'Bloomingdales',search:'strappy heeled sandals'},
 {name:'Satin Going-Out Blouse',store:'Shopbop',search:'satin going out blouse'},
 {name:'Top Handle Evening Bag',store:'Saks',search:'top handle evening bag'},
 {name:'Ear Cuff',store:'Kendra Scott',search:'ear cuff'},
 {name:'Metallic Blazer',store:'Zara',search:'metallic blazer'}];

async function open(seed){
  const ctx=await b.newContext({viewport:{width:375,height:900},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  const hits={n:0};
  await pg.exposeFunction('__aiCall',()=>{hits.n++});
  await pg.addInitScript(([picks,seed])=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Kathy',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    localStorage.setItem('ss_hearttip','1');
    if(seed&&seed.chat){localStorage.setItem('ss_chat',JSON.stringify([{role:'user',content:'formal wedding?'},
      {role:'assistant',content:'A long column dress from Reformation.'}]));
      localStorage.setItem('ss_chat_t',String(Date.now()));}
    if(seed&&seed.seenAll)['ss_seen_wardrobe','ss_seen_shopstyle','ss_seen_wishlist','ss_trending_seen'].forEach(k=>localStorage.setItem(k,'1'));
    const of=window.fetch;window.fetch=function(u){
      if(String(u).indexOf('style-ai')>=0){ window.__aiCall&&window.__aiCall();
        return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      if(String(u).indexOf('user-data')>=0)return Promise.resolve(new Response('{}',{status:200}));
      return of.apply(this,arguments);};},[PICKS,seed||{}]);
  await pg.goto('http://localhost:8957/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2300);
  return {ctx,pg,errs,hits};
}
const whisper=pg=>pg.evaluate(()=>{const n=document.getElementById('wbNext');
  return {on:n.classList.contains('on'),key:_wbNextCur,
    text:n.querySelector('.wbn-t').textContent.replace(/\s+/g,' ').trim()};});

console.log('1. She shops, taps out to a store, and comes back the reloading way');
{
  const {ctx,pg,errs,hits}=await open({});
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  const before=await pg.evaluate(()=>document.querySelectorAll('#shopStyleContent .wl-save').length);
  ok('she has six pieces on screen',before===6,String(before));
  ok('and they are stored, which they never were before',
     await pg.evaluate(()=>!!_shopPicksWaiting()));
  await pg.evaluate(()=>{location.href='/store'});      // the product link
  await pg.waitForTimeout(500);
  await pg.goBack(); await pg.waitForTimeout(2700);     // her Back button
  ok('Back still reloads her onto Welcome Back (unchanged, and not fixable here)',
     await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-wb');
  const w=await whisper(pg);
  ok('...but now the app SAYS her pieces are waiting',w.on&&w.key==='resume',w.key);
  ok('and it names the pieces, not the journey',/same pieces waiting/.test(w.text),w.text);
  const n0=hits.n;
  await pg.evaluate(()=>wbNextGo());
  await pg.waitForTimeout(1200);
  ok('tapping it lands her back on Shop your style',
     await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-shopstyle');
  // ⚠️ .shop-item-name, NOT '.sb strong' -- that is Complete the Look's row
  // markup, a different renderer. Asserting it here read as "the cards did not
  // come back" when all six were on screen. Broken-harness shape, again.
  const after=await pg.evaluate(()=>[...document.querySelectorAll('#shopStyleContent .shop-item-name')].map(e=>e.textContent));
  ok('with THE SAME SIX she was looking at',after.length===6&&after[0]==='Sequin Mini Dress',after.slice(0,2).join(', '));
  ok('and it cost NO new AI call -- instant, and free',hits.n===n0,'calls '+(hits.n-n0));
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n2. Kathy: a conversation and no live shopping session');
{
  const {ctx,pg,errs}=await open({chat:true,seenAll:true});
  const w=await whisper(pg);
  ok('the resume outranks the journey whisper',w.key==='resume',w.key);
  ok('it names her conversation',/conversation with your stylist/.test(w.text),w.text);
  ok('NOT "Next, add your sizes..." -- the thing she got before',!/add your sizes/.test(w.text));
  await pg.evaluate(()=>wbNextGo());
  await pg.waitForTimeout(700);
  ok('tapping it opens the chat, where Reformation was waiting all along',
     await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-chat');
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n3. Both: two things named, two separate taps');
{
  const {ctx,pg,errs}=await open({chat:true,seenAll:true});
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  await pg.evaluate(()=>show('s-wb'));
  await pg.waitForTimeout(400);
  const w=await whisper(pg);
  ok('one line names both',/pieces and your conversation are both still here/.test(w.text),w.text);
  await pg.evaluate(()=>{document.querySelectorAll('#wbNext .wbn-t b')[1].click()});
  await pg.waitForTimeout(700);
  ok('tapping "conversation" goes to the chat, not the shop',
     await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-chat',
     await pg.evaluate(()=>document.querySelector('.scr.act').id));
  await pg.evaluate(()=>show('s-wb'));await pg.waitForTimeout(300);
  await pg.evaluate(()=>{document.querySelectorAll('#wbNext .wbn-t b')[0].click()});
  await pg.waitForTimeout(1200);
  ok('tapping "pieces" goes to the shop',
     await pg.evaluate(()=>document.querySelector('.scr.act').id)==='s-shopstyle');
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log('\n4. It never lies, and it never nags');
{
  const {ctx,pg,errs}=await open({});
  ok('nothing to resume: the journey whispers carry on as before',
     (await whisper(pg)).key!=='resume',(await whisper(pg)).key);
  // a stale session must not be offered as "right where you left it"
  await pg.evaluate(()=>{localStorage.setItem('ss_shoppicks',JSON.stringify(
    {m:'quiz',i:[{name:'Old Thing',store:'Zara',search:'old'}],t:Date.now()-7*60*60*1000}));});
  ok('a 7-hour-old session is NOT offered (the 6h promise holds)',
     await pg.evaluate(()=>!_shopPicksWaiting()));
  await pg.evaluate(()=>{localStorage.setItem('ss_shoppicks',JSON.stringify(
    {m:'quiz',i:[{name:'Old Thing',store:'Zara',search:'old'}],t:Date.now()-5*60*60*1000}));});
  ok('a 5-hour-old one still is',
     await pg.evaluate(()=>!!_shopPicksWaiting()));
  // The chat half needs the SAME shelf life, or the whisper greets her forever:
  // ss_chat never expires. hubs.js caught this; keep it pinned here too.
  await pg.evaluate(()=>{localStorage.setItem('ss_chat',JSON.stringify([{role:'user',content:'hi'}]));
    localStorage.setItem('ss_chat_t',String(Date.now()-7*60*60*1000));});
  ok('a 7-hour-old CONVERSATION is not offered either',
     await pg.evaluate(()=>!_chatWaiting()));
  await pg.evaluate(()=>{localStorage.setItem('ss_chat_t',String(Date.now()));});
  ok('a fresh one is',await pg.evaluate(()=>!!_chatWaiting()));
  await pg.evaluate(()=>{localStorage.removeItem('ss_chat_t');});
  ok('a conversation from BEFORE this shipped (no stamp) is treated as stale, not fresh',
     await pg.evaluate(()=>!_chatWaiting()));
  // A room the app said hello in is not a conversation she can resume.
  await pg.evaluate(()=>{localStorage.setItem('ss_chat',JSON.stringify([{role:'assistant',content:'Hi! I am your stylist.'}]));
    localStorage.setItem('ss_chat_t',String(Date.now()));});
  ok('a greeting-only chat is NOT offered -- she never said anything',
     await pg.evaluate(()=>!_chatWaiting()));
  await pg.evaluate(()=>{localStorage.setItem('ss_chat',JSON.stringify([{role:'assistant',content:'Hi!'},{role:'user',content:'a dress?'}]));});
  ok('...and the moment she speaks, it is hers to come back to',
     await pg.evaluate(()=>!!_chatWaiting()));
  await pg.evaluate(()=>{updateWbScreen&&updateWbScreen();});
  await pg.waitForTimeout(300);
  ok('so the whisper is back',(await whisper(pg)).key==='resume');
  await pg.evaluate(()=>wbNextDismiss());
  await pg.waitForTimeout(200);
  ok('her ✕ hides it for the visit',!(await whisper(pg)).on);
  ok('...but does NOT silence it forever, unlike a journey step',
     await pg.evaluate(()=>{try{return !JSON.parse(localStorage.getItem('ss_nextskip')||'{}').resume}catch(e){return true}}));
  await pg.evaluate(()=>{updateWbScreen&&updateWbScreen();});
  await pg.waitForTimeout(300);
  ok('so her next visit offers it again',(await whisper(pg)).key==='resume');
  ok('no JS errors',errs.length===0,errs.join('|'));
  await ctx.close();
}
console.log(`\nall ${checks} checks run, ${fails} failures`);
await b.close();srv.close();process.exit(fails?1:0);
