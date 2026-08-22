// How much width is actually AVAILABLE to the ask line, and where is it being
// spent?  Walks the parent chain from .sa-vox out to the framed screen.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8944,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const PICKS=[{name:'Belted Midi Dress',store:'Bloomingdales',search:'belted midi dress'}];
for(const w of [390,339,320]){
  const ctx=await b.newContext({viewport:{width:w,height:1200},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(picks=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    localStorage.setItem('ss_hearttip','1');
    const of=window.fetch;window.fetch=function(u){if(String(u).indexOf('style-ai')>=0){
      return Promise.resolve(new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({items:picks})}]}),{status:200,headers:{'Content-Type':'application/json'}}));}
      return of.apply(this,arguments);};},PICKS);
  await pg.goto('http://localhost:8944/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2400);
  await pg.evaluate(()=>{_shopStyleMode='quiz';_openShopStyleNow('quiz');});
  await pg.waitForTimeout(1500);
  const out=await pg.evaluate(()=>{
    const rows=[];let e=document.querySelector('#s-shopstyle .sa-vox');
    while(e&&e.id!=='s-shopstyle'){const cs=getComputedStyle(e);const r=e.getBoundingClientRect();
      rows.push(`${(e.id?'#'+e.id:'.'+(e.className||'').split(' ')[0]).padEnd(20)} w=${String(Math.round(r.width)).padStart(4)} pad=${cs.paddingLeft}/${cs.paddingRight} maxw=${cs.maxWidth} mar=${cs.marginLeft}/${cs.marginRight}`);
      e=e.parentElement;}
    const s=document.getElementById('s-shopstyle');const sr=s.getBoundingClientRect();const scs=getComputedStyle(s);
    rows.push(`#s-shopstyle          w=${Math.round(sr.width)} pad=${scs.paddingLeft}/${scs.paddingRight}`);
    return rows;});
  console.log('=== viewport '+w+'px ===');out.forEach(r=>console.log('  '+r));
  await ctx.close();
}
await b.close();srv.close();
