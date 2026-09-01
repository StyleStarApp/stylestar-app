// Render the three wordings for the cold-visitor invitation, IN THE REAL BOX
// (a render is a promise -- these are the real page with only the string
// swapped, never a mockup). Real typefaces via the renderfonts pattern.
import fs from 'fs'; import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;
const ROOT='/home/user/stylestar-app';
const RAW=fs.readFileSync(ROOT+'/index.html','utf8');
const TYPES={'.css':'text/css','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.json':'application/json'};
const FONTDIR=ROOT+'/scratchpad/fonts';
async function edge(p){const c={next:async()=>new Response(RAW,{headers:{'content-type':'text/html'}})};
  return await (await handler(new Request('https://stylestar.app'+p),c)).text();}
const srv=http.createServer(async(req,res)=>{const p=req.url.split('?')[0];
  if(p==='/index.html'){res.writeHead(200,{'content-type':'text/html'});return res.end(RAW);}
  if(p.startsWith('/fonts/')&&fs.existsSync(FONTDIR+p.slice(6))){
    res.writeHead(200,{'content-type':'font/woff2'});return res.end(fs.readFileSync(FONTDIR+p.slice(6)));}
  const e=p.slice(p.lastIndexOf('.'));
  if(TYPES[e]&&fs.existsSync(ROOT+p)){res.writeHead(200,{'content-type':TYPES[e]});return res.end(fs.readFileSync(ROOT+p));}
  try{res.writeHead(200,{'content-type':'text/html'});res.end(await edge(p==='/'?'/':p.replace(/\/+$/,'')));}
  catch(x){res.writeHead(404);res.end('no');}});
await new Promise(r=>srv.listen(8988,r));

const WORDINGS = {
  A: `I don't know your style yet, so these are a general mix. <span onclick="startQ()">Take the free style quiz</span> for picks made just for you.`,
  B: `These are picked for the trend, not for you yet. <span onclick="startQ()">Take the free style quiz</span> and I'll make them yours.`,
  C: `Want these chosen for your style? <span onclick="startQ()">Take the free style quiz</span>.`,
};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for (const [k,txt] of Object.entries(WORDINGS)) {
  const ctx=await b.newContext({viewport:{width:390,height:1000},deviceScaleFactor:2});
  await ctx.route('**/*',async r=>{
    const u=r.request().url();
    if(u.includes('/.netlify/functions/style-ai'))
      return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{type:'text',text:JSON.stringify({items:[
        {name:'Butter Yellow Linen Shirt',store:'Madewell',search:'butter yellow linen shirt',why:'x'},
        {name:'Butter Yellow Knit Tank',store:'J.Crew',search:'butter yellow knit tank',why:'x'},
        {name:'Butter Yellow Midi Dress',store:'Boden',search:'butter yellow midi dress',why:'x'},
        {name:'Butter Yellow Cardigan',store:'Talbots',search:'butter yellow cardigan',why:'x'}]})}]})});
    if(new URL(u).host==='fonts.googleapis.com')
      return r.fulfill({status:200,contentType:'text/css',
        body:fs.readFileSync(FONTDIR+'/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,'url(http://localhost:8988/fonts/$1)')});
    return (new URL(u).host==='localhost:8988')?r.continue():r.abort();});
  const pg=await ctx.newPage();
  await pg.goto('http://localhost:8988/trending',{waitUntil:'networkidle'});
  await pg.waitForTimeout(900);
  await pg.evaluate(t=>{ window._wdrQuizInvite=()=>'<div class="wdr-colorhint">'+t+'</div>'; }, txt);
  await pg.evaluate(()=>document.querySelector('#s-trending .wdr-tcard .tlf').click());
  await pg.waitForTimeout(1600);
  const box=await pg.$('#wx_trend0');
  await pg.evaluate(()=>document.getElementById('wx_trend0').scrollIntoView({block:'center'}));
  await pg.waitForTimeout(300);
  await box.screenshot({path:ROOT+'/scratchpad/invite-'+k+'.png'});
  console.log(k,'rendered |', await pg.evaluate(()=>{
    const h=document.querySelector('#wx_trend0 .wdr-colorhint');
    if(!h)return 'MISSING';
    const c=getComputedStyle(h), sp=h.querySelector('span');
    return 'lines='+(()=>{const rg=document.createRange();rg.selectNodeContents(h);
      const t=[...rg.getClientRects()].map(x=>Math.round(x.top));const u=[];
      t.forEach(v=>{if(!u.some(y=>Math.abs(y-v)<6))u.push(v)});return u.length})()
      +' font='+c.fontFamily.split(',')[0]+' link='+(sp?getComputedStyle(sp).color:'-');
  }));
  await ctx.close();
}
await b.close(); srv.close();
