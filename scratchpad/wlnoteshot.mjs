// Screenshot the REAL Your Wishlist with notes on it -- index.html itself, real
// typefaces. ⚠️ Not a redrawn mock: she has caught two of those already.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app', PORT=8979;
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');
  if(u.pathname.startsWith('/.netlify/functions/')){r.writeHead(200,{'Content-Type':'application/json'});return r.end('{}')}
  if(u.pathname==='/'){r.writeHead(200,{'Content-Type':'text/html'});return r.end(HTML)}
  const f=path.join(ROOT,u.pathname.replace(/^\//,''));
  if(fs.existsSync(f)&&fs.statSync(f).isFile()){
    r.writeHead(200,{'content-type':f.endsWith('.woff2')?'font/woff2':f.endsWith('.png')?'image/png':'text/plain'});
    return fs.createReadStream(f).pipe(r)}
  r.writeHead(404);r.end('')});
await new Promise(r=>srv.listen(PORT,r));
const SEED={pretap0:true,items:{},custom:[],hidden:[],wishlist:[
  {id:'dvf-flag-scarf~diane-von-furstenberg',name:'Diane von Furstenberg Flag Scarf — Myrtle Berry',
   store:'Diane von Furstenberg',search:'silk scarf',exact:true,url:'https://dvf.com/p/1',price:'$198',
   note:'Any color but the red one!'},
  {id:'farm-rio-maxi~farm-rio',name:'FARM Rio Pink Garden Terrace Maxi Dress',store:'FARM Rio',
   search:'maxi dress',exact:true,url:'https://www.farmrio.com/p/1',price:'$360',
   note:'Size 8. This is the one for the wedding in June.'},
  {id:'white-blouse~j-crew',name:'White Linen Button-Front Blouse',store:'J.Crew',search:'white linen blouse'}
]};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [name,drive] of [['notes',null],['editing','.wl-addnote']]){
  const pg=await b.newPage({viewport:{width:390,height:1200},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.addInitScript(s=>{localStorage.setItem('ss_wardrobe',JSON.stringify(s))},SEED);
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(1400);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();openWishlist()});
  await pg.waitForTimeout(500);
  if(drive){await pg.evaluate(s=>{const e=document.querySelector('#s-wishlist '+s);if(e)e.click()},drive);
            await pg.waitForTimeout(350);}
  try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  await pg.waitForTimeout(300);
  if(name==='notes')console.log(await pg.evaluate(()=>{
    const mk=ff=>{const s=document.createElement('span');s.textContent='Catherine';
      s.style.cssText=`position:absolute;visibility:hidden;font:600 26px ${ff}`;document.body.appendChild(s);
      const x=s.getBoundingClientRect().width;s.remove();return Math.round(x*10)/10};
    return {realFontsLoaded:mk("'Dancing Script',cursive")!==mk('serif')}}));
  const h=await pg.evaluate(()=>document.body.scrollHeight);
  await pg.setViewportSize({width:390,height:Math.ceil(h)+8}); await pg.waitForTimeout(250);
  await pg.screenshot({path:`${ROOT}/scratchpad/wlnote-${name}.png`});
  await pg.close(); console.log(`  ${name}: ${h}px`);
}
await b.close(); srv.close();
