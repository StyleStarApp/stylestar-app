// Render the top of the portrait screen to check the new headings.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const SP='/tmp/claude-0/-home-user-stylestar-app/ccd2d3bd-13d7-5b8a-a78c-9f83c0ce0e88/scratchpad/';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==','base64');
const W=+(process.argv[2]||390);
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:W,height:844},deviceScaleFactor:2})).newPage();
await p.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.pathname.startsWith('/__font/'))return r.fulfill({path:SP+'fonts/'+u.pathname.slice(8),contentType:'font/woff2'});
  if(u.hostname==='fonts.googleapis.com')return r.fulfill({path:SP+'fonts/fonts.css',contentType:'text/css'});
  if(u.hostname==='stylestar.app'){let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});}
  if(u.pathname.startsWith('/.netlify/functions/amazon-images'))return r.fulfill({contentType:'application/json',body:'{"images":{}}'});
  if(r.request().resourceType()==='image')return r.fulfill({body:PNG,contentType:'image/png'});
  return r.abort();});
await p.goto('https://stylestar.app/');await p.waitForTimeout(1200);
await p.evaluate(()=>{answers=[8,7,6,9,7,6,7,7,8,10,7,9];try{userName='Catherine'}catch(e){};try{showResult()}catch(e){show('s-res')}});
await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
const extra=process.argv[3]||'';if(extra)await p.addStyleTag({content:extra});await p.waitForTimeout(200);
const info=await p.evaluate(()=>[...document.querySelectorAll('#s-res .eng-lbl')].map(e=>{const r=e.getBoundingClientRect(),pr=e.closest('.page')||e.parentElement;const q=pr.getBoundingClientRect();return {t:e.textContent,fs:getComputedStyle(e).fontSize,ff:getComputedStyle(e).fontFamily.slice(0,16),over:r.left<q.left||r.right>q.right,top:Math.round(r.top+scrollY)}}));
console.log(JSON.stringify(info));
for(const [i,e] of info.entries()){if(i>1)break;await p.screenshot({path:SP+`sec${i}-${W}${extra?'-x':''}.png`,clip:{x:0,y:Math.max(0,e.top-90),width:W,height:330},fullPage:true});}
await b.close();
