// Render the new /trending page with the REAL typefaces (renderfonts pattern).
// ⚠️ Chromium here cannot reach fonts.googleapis.com, so an uncorrected render
// silently falls back to generic faces and the typography judgement is wrong.
import fs from 'fs'; import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;
const ROOT='/home/user/stylestar-app';
const RAW=fs.readFileSync(ROOT+'/index.html','utf8');
const TYPES={'.css':'text/css','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
const FONTDIR=ROOT+'/scratchpad/fonts';
async function edge(p){const ctx={next:async()=>new Response(RAW,{headers:{'content-type':'text/html'}})};
  return await (await handler(new Request('https://stylestar.app'+p),ctx)).text();}
const srv=http.createServer(async(req,res)=>{
  const p=req.url.split('?')[0];
  if(p==='/index.html'){res.writeHead(200,{'content-type':'text/html'});return res.end(RAW);}
  if(p.startsWith('/fonts/')&&fs.existsSync(FONTDIR+p.slice(6))){
    const e=p.slice(p.lastIndexOf('.'));
    res.writeHead(200,{'content-type':TYPES[e]||'application/octet-stream'});
    return res.end(fs.readFileSync(FONTDIR+p.slice(6)));}
  const e=p.slice(p.lastIndexOf('.'));
  if(TYPES[e]&&fs.existsSync(ROOT+p)){res.writeHead(200,{'content-type':TYPES[e]});return res.end(fs.readFileSync(ROOT+p));}
  try{res.writeHead(200,{'content-type':'text/html'});res.end(await edge(p==='/'?'/':p.replace(/\/+$/,'')));}
  catch(x){res.writeHead(404);res.end('no');}});
await new Promise(r=>srv.listen(8992,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:900},deviceScaleFactor:2});
const hasFonts=fs.existsSync(FONTDIR+'/gf.css');
await ctx.route('**/*',async r=>{
  const u=new URL(r.request().url());
  if(u.host==='localhost:8992')return r.continue();
  if(hasFonts&&u.host==='fonts.googleapis.com')
    return r.fulfill({status:200,contentType:'text/css',
      // ⚠️ gf.css already points at LOCAL names (f1.woff2 ...), not gstatic
      //    URLs -- rewriting the gstatic host does nothing and the relative
      //    names then resolve against the aborted fonts.googleapis.com origin.
      body:fs.readFileSync(FONTDIR+'/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8992/fonts/$1)')});
  return r.abort();});
const pg=await ctx.newPage();
await pg.goto('http://localhost:8992/trending',{waitUntil:'networkidle'});
await pg.waitForTimeout(1200);
const faces=await pg.evaluate(async()=>{
  await document.fonts.load("400 26px 'DM Serif Display'","What's Trending");
  const el=document.querySelector('#s-trending .wdr-title');
  const c=document.createElement('canvas').getContext('2d');
  c.font="400 26px 'DM Serif Display'"; const a=c.measureText("What's Trending").width;
  c.font="400 26px serif"; const s=c.measureText("What's Trending").width;
  return {realFonts:Math.abs(a-s)>2, titleW:a, lines:el?el.getClientRects().length:0};});
console.log('realFontsLoaded:',faces.realFonts,'| title width',faces.titleW.toFixed(1),'px');
await pg.screenshot({path:ROOT+'/scratchpad/trending-top.png',clip:{x:0,y:0,width:390,height:900}});
await pg.evaluate(()=>window.scrollTo(0,880));
await pg.waitForTimeout(400);
await pg.screenshot({path:ROOT+'/scratchpad/trending-mid.png',clip:{x:0,y:0,width:390,height:900}});
await b.close(); srv.close();
console.log('rendered');
