/* starfont.mjs — 2026-08-25, her ask: "A and let's try a different font".
 * Renders the Star of the Week label in every face THE APP ALREADY LOADS, so
 * none of these costs a new webfont download on the front door.
 * The stars are fixed at her pick for the whole set (same tilt, gaps evened,
 * right star flipped rather than turned) so she is comparing FONTS only.
 * ⚠️ Each option is measured as well as drawn: the word has about 259 CSS px
 *    between the two stars at 393, and a label that wraps is not an option. */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8977, W=393, S=3;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:W,height:900},deviceScaleFactor:S});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
  topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
await pg.evaluate(async()=>{await document.fonts.ready});
// ⚠️ document.fonts.check() is false for a face the page has never PAINTED --
//    webfonts download lazily, so a face nothing on this screen uses is simply
//    absent. Load each one explicitly for this exact string first, then check.
for(const f of ['700 19px Jost','400 20px "DM Serif Display"','700 19px "DM Sans"','600 19px Lora']){
  await pg.evaluate(async x=>{try{await document.fonts.load(x,'STAR OF THE WEEK')}catch(e){}},f);
  if(!await pg.evaluate(x=>document.fonts.check(x,'STAR OF THE WEEK'),f)){
    console.error('ABORT: '+f+' did not load — every render below would be fallback fiction');process.exit(1)}
}
await pg.waitForTimeout(300);

const STARS='.wks-lbl svg.r{transform:scaleX(-1) rotate(-12deg)!important;margin-left:-.5px!important}';
const OPTS=[
  ['Jost bold  —  the one you have today', ''],
  ['1  —  DM Serif Display  (the app\u2019s own display serif)', ".wks-lbl{font-family:'DM Serif Display',serif!important;font-weight:400!important;font-size:20px!important;letter-spacing:.08em!important}.wks-lbl-t{margin-right:-.053em!important}"],
  ['2  —  DM Sans bold  (the body face)', ".wks-lbl{font-family:'DM Sans',sans-serif!important;font-weight:700!important;font-size:19px!important;letter-spacing:.10em!important}"],
  ['3  —  Lora semibold  (her voice serif)', ".wks-lbl{font-family:'Lora',serif!important;font-weight:600!important;font-size:19px!important;letter-spacing:.07em!important}.wks-lbl-t{margin-right:-.047em!important}"],
  ['4  —  Jost medium, airier  (same family, lighter)', ".wks-lbl{font-weight:500!important;letter-spacing:.16em!important}.wks-lbl-t{margin-right:-.105em!important}"],
];
const setCss=(r)=>pg.evaluate(x=>{let s=document.getElementById('__font');
  if(!s){s=document.createElement('style');s.id='__font';document.head.appendChild(s)} s.textContent=x},r);
const imgs=[];
for(const [label,rule] of OPTS){
  await setCss(STARS+rule); await pg.waitForTimeout(160);
  const m=await pg.evaluate(()=>{
    const el=document.querySelector('#wbStar .wks-lbl'), t=el.querySelector('.wks-lbl-t');
    const card=document.querySelector('#wbStar .wks-card'), cs=getComputedStyle(card);
    const inner=card.getBoundingClientRect().width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const svgs=[...el.querySelectorAll('svg')].map(s=>s.getBoundingClientRect().width);
    const g=parseFloat(getComputedStyle(el).gap);
    const rg=document.createRange(); rg.selectNodeContents(t);
    const tops=[...rg.getClientRects()].map(r=>Math.round(r.top)).sort((a,b)=>a-b);
    const lines=tops.reduce((a,v)=>{if(!a.length||v-a[a.length-1]>6)a.push(v);return a},[]).length;
    return {word:+t.getBoundingClientRect().width.toFixed(1), lines,
            room:+(inner-svgs[0]-svgs[1]-g*2).toFixed(1), h:+el.getBoundingClientRect().height.toFixed(1)};
  });
  const fits=m.lines===1 && m.word<=m.room;
  console.log(label.replace(/\s+—\s+/,' - ').padEnd(52)
    +' word '+String(m.word).padStart(6)+' of '+String(m.room).padStart(6)+' px'
    +'   lines '+m.lines+'   row height '+String(m.h).padStart(5)
    +'   '+(fits?'fits, '+(m.room-m.word).toFixed(1)+'px spare':'DOES NOT FIT'));
  const clip=await pg.evaluate(()=>{const r=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
    const c=document.querySelector('#wbStar .wks-card').getBoundingClientRect();
    return {x:c.x,y:r.y-9,width:c.width,height:r.height+18}});
  imgs.push([label,(await pg.screenshot({clip})).toString('base64')]);
}
await setCss('');
const out=await pg.evaluate(async(imgs)=>{
  const L=[]; for(const [t,p] of imgs){const i=new Image();
    await new Promise(r=>{i.onload=r;i.src='data:image/png;base64,'+p}); L.push([t,i]);}
  const w=Math.max(...L.map(x=>x[1].width)), pad=26, head=54, gap=18;
  const cv=document.createElement('canvas'); cv.width=w+pad*2;
  cv.height=pad*2+L.reduce((t,x)=>t+head+x[1].height+gap,0);
  const c=cv.getContext('2d'); c.fillStyle='#f3f1ec'; c.fillRect(0,0,cv.width,cv.height);
  let y=pad;
  for(const [t,i] of L){
    c.fillStyle='#1a1a1a'; c.font='600 28px system-ui,sans-serif'; c.textBaseline='top'; c.fillText(t,pad,y+10); y+=head;
    c.fillStyle='#fff'; c.fillRect(pad,y,i.width,i.height); c.drawImage(i,pad,y);
    c.strokeStyle='#d8d3c8'; c.lineWidth=2; c.strokeRect(pad,y,i.width,i.height); y+=i.height+gap;
  }
  return cv.toDataURL('image/png').split(',')[1];
},imgs);
fs.writeFileSync('scratchpad/starfont.png',Buffer.from(out,'base64'));
console.log('\nwrote scratchpad/starfont.png');
await b.close(); srv.close();
