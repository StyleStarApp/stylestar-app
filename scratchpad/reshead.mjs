// Render the quiz-results Edit/Finds panels: Saint Laurent stack + header options.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const SP='/tmp/claude-0/-home-user-stylestar-app/ccd2d3bd-13d7-5b8a-a78c-9f83c0ce0e88/scratchpad/';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==','base64');
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await p.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.shopify.com'&&/1229377/.test(u.pathname))return r.fulfill({path:SP+'sl1.jpg'});
  if(u.hostname==='cdn.shopify.com'&&/1229376/.test(u.pathname))return r.fulfill({path:SP+'sl2.jpg'});
  if(u.pathname.startsWith('/.netlify/functions/amazon-images')){const as=(u.searchParams.get('asins')||'').split(',');const o={};as.forEach(a=>o[a]={url:'https://m.media-amazon.com/x/'+a+'.jpg'});return r.fulfill({contentType:'application/json',body:JSON.stringify({images:o})});}
  if(u.hostname==='stylestar.app'){let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});}
  if(u.pathname.startsWith('/__font/'))return r.fulfill({path:SP+'fonts/'+u.pathname.slice(8),contentType:'font/woff2'});
  if(u.hostname==='fonts.googleapis.com')return r.fulfill({path:SP+'fonts/fonts.css',contentType:'text/css'});
  if(r.request().resourceType()==='image')return r.fulfill({body:PNG,contentType:'image/png'});
  return r.abort();});
await p.goto('https://stylestar.app/');await p.waitForTimeout(1200);
await p.evaluate(()=>{answers=[8,7,6,9,7,6,7,7,8,10,7,9];try{showResult()}catch(e){show('s-res')}});
await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);console.log(await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).filter((v,i,a)=>a.indexOf(v)===i).join(',')));
const m=await p.evaluate(()=>{const c=document.querySelector('#resEditGallery .fme-card');const px=c.querySelector('.fme-px');
  return {name:c.querySelector('.fme-n').textContent,stack:px.classList.contains('is-stack'),imgs:px.querySelectorAll('img').length,
    h:[...px.querySelectorAll('img')].map(i=>Math.round(i.getBoundingClientRect().height)),box:Math.round(px.getBoundingClientRect().height),
    fit:[...px.querySelectorAll('img')].map(i=>getComputedStyle(i).objectFit)}});
console.log(JSON.stringify(m));
const OPTS={
  current:'',
  A:`:is(#resEditGallery,#resFindsGallery) .eng-lbl{font:700 18px/1.1 'Jost',sans-serif;letter-spacing:.12em;color:#151515}`,
  B:`:is(#resEditGallery,#resFindsGallery) .eng-lbl{font:400 28px/1.15 'DM Serif Display',serif;letter-spacing:0;text-transform:none;color:#1a1a1a}`,
  C:`:is(#resEditGallery,#resFindsGallery) .eng-lbl{font:700 18px/1.1 'Jost',sans-serif;letter-spacing:.12em;color:#151515}
     :is(#resEditGallery,#resFindsGallery) .eng-rule{width:40px;height:2px}
     :is(#resEditGallery,#resFindsGallery) .eng-rule.l,:is(#resEditGallery,#resFindsGallery) .eng-rule.r{background:#FFD500}`,
};
const only=process.argv[2];
for(const [k,css] of Object.entries(OPTS)){
  if(only&&only!==k)continue;
  await p.evaluate(c=>{let s=document.getElementById('optcss');if(!s){s=document.createElement('style');s.id='optcss';document.head.appendChild(s)}s.textContent=c},css);
  await p.waitForTimeout(300);
  for(const id of ['resEditGallery','resFindsGallery']){
    const el=await p.$('#'+id+' .page');const bb=await el.boundingBox();
    await p.screenshot({path:SP+`hd-${k}-${id}.png`,clip:{x:bb.x,y:bb.y,width:bb.width,height:Math.min(520,bb.height)},fullPage:true});
  }
}
await b.close();
