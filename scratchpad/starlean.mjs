/* starlean.mjs — 2026-08-25, HER SECOND catch on the live Star label: the two
 * stars "still do not look perfectly even."
 *
 * ⚠️ starsym.mjs ALREADY PASSED and it was not lying: measured on her own live
 *    screenshot the two stars' bounding boxes are IDENTICAL (43x44 both, same
 *    top and bottom row, ink counts 601 vs 603, gaps 11.33 vs 12.00 CSS px).
 *    So a bbox test can never find this. What her eye is reading is WHERE each
 *    star comes CLOSEST to the word:
 *        left  star's tightest approach = 12.33 CSS px at the TOP of the caps
 *        right star's tightest approach = 13.33 CSS px at the BOTTOM
 *    The stars are rotate(-12deg) / rotate(+12deg), a perfect mirror pair -- but
 *    the WORD is not a mirror ("S...K"), so a mirrored tilt meets a different
 *    letterform on each side and the crowding lands at different heights.
 *
 * This measures the closest approach per side, and the y at which it happens,
 * for the shipped tilt and for each candidate fix.
 * ⚠️ PNG decoded INSIDE the page (no decoder in this sandbox's node).
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8967, W=Number(process.env.W||393), S=3;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:W,height:900},deviceScaleFactor:S});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
const stub=fs.existsSync('/tmp/stub.png')?fs.readFileSync('/tmp/stub.png'):null;
if(stub) await pg.route(/cdn\.shop|shopify|farmrio|images\./i,r=>r.fulfill({status:200,contentType:'image/png',body:stub}));
await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
  topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
await pg.evaluate(async()=>{await document.fonts.ready});
// ⚠️ assert the face UNDER TEST really loaded (a proxy face passing is a false green)
const fontOk=await pg.evaluate(()=>document.fonts.check('700 19px Jost'));
if(!fontOk){console.error('ABORT: Jost 700 19px did not load — every number below would be fallback-font fiction');process.exit(1)}
await pg.waitForTimeout(300);

async function measure(label){
  const clip=await pg.evaluate(()=>{const r=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
    return {x:r.x-8,y:r.y-8,width:r.width+16,height:r.height+16}});
  const png=(await pg.screenshot({clip})).toString('base64');
  const m=await pg.evaluate(async({png,S})=>{
    const img=new Image(); await new Promise(r=>{img.onload=r;img.src='data:image/png;base64,'+png});
    const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
    const c=cv.getContext('2d'); c.drawImage(img,0,0);
    const d=c.getImageData(0,0,cv.width,cv.height).data;
    const at=(x,y)=>{const i=(y*cv.width+x)*4;return[d[i],d[i+1],d[i+2]]};
    const isGold=([r,g,bl])=>r>120&&r-bl>55&&(Math.max(r,g,bl)-Math.min(r,g,bl))>60;
    const isInk =([r,g,bl])=>r<130&&g<130&&bl<130&&(Math.max(r,g,bl)-Math.min(r,g,bl))<45;
    const mid=cv.width/2;
    let bestL=1e9,byL=0,bestR=1e9,byR=0, lg=[],rg=[],ink=[];
    for(let y=0;y<cv.height;y++){
      let lastGL=-1,firstGR=-1,firstI=-1,lastI=-1;
      for(let x=0;x<cv.width;x++){const p=at(x,y);
        if(isGold(p)){ if(x<mid) lastGL=x; else if(firstGR<0) firstGR=x;
                       (x<mid?lg:rg).push([x,y]); }
        else if(isInk(p)){ if(firstI<0)firstI=x; lastI=x; ink.push([x,y]); }}
      if(lastGL>=0&&firstI>lastGL&&firstI<mid){const g=firstI-lastGL; if(g<bestL){bestL=g;byL=y}}
      if(firstGR>=0&&lastI>0&&lastI<firstGR&&lastI>mid){const g=firstGR-lastI; if(g<bestR){bestR=g;byR=y}}
    }
    const bb=p=>({x0:Math.min(...p.map(q=>q[0])),x1:Math.max(...p.map(q=>q[0])),
                  y0:Math.min(...p.map(q=>q[1])),y1:Math.max(...p.map(q=>q[1])),n:p.length});
    const L=bb(lg),R=bb(rg),I=bb(ink);
    // where in the caps height does each crowding point sit? 0 = cap top, 1 = baseline
    const rel=y=>+((y-I.y0)/(I.y1-I.y0)).toFixed(3);
    return {bestL,bestR,byL,byR,relL:rel(byL),relR:rel(byR),
            boxL:[L.x1-L.x0+1,L.y1-L.y0+1,L.n],boxR:[R.x1-R.x0+1,R.y1-R.y0+1,R.n],
            gapBoxL:I.x0-L.x1, gapBoxR:R.x0-I.x1, h:cv.height};
  },{png,S});
  const p=v=>(v/S).toFixed(2);
  console.log(label.padEnd(26)
    +' closest L '+p(m.bestL)+'  R '+p(m.bestR)
    +'   DIFF '+((m.bestR-m.bestL)/S).toFixed(2)+' CSS px'
    +'   | at cap-height L '+(m.relL*100).toFixed(0)+'%  R '+(m.relR*100).toFixed(0)+'%'
    +'   | box gaps '+p(m.gapBoxL)+' / '+p(m.gapBoxR)
    +'   | boxes '+m.boxL.join('x')+' vs '+m.boxR.join('x'));
  return m;
}

const setCss=(rule)=>pg.evaluate(r=>{let s=document.getElementById('__lean');
  if(!s){s=document.createElement('style');s.id='__lean';document.head.appendChild(s)} s.textContent=r;},rule);

console.log('viewport '+W+' CSS px, deviceScaleFactor '+S+'  (her iPhone 15 is 393 @3x)\n');
const OPTS=[
  ['AS IT IS NOW',''],
  ['A same tilt, evened',   '.wks-lbl svg.r{margin-left:-.5px!important}'],
  ['B upright, evened',     '.wks-lbl svg.l,.wks-lbl svg.r{transform:none!important}.wks-lbl svg.r{margin-left:-1px!important}'],
  ['C gentler tilt, evened','.wks-lbl svg.l{transform:rotate(-6deg)!important}.wks-lbl svg.r{transform:rotate(6deg)!important;margin-left:-.5px!important}'],
];
for(const [t,r] of OPTS){ await setCss(r); await measure(t); }
await setCss(''); await measure('control (back to now)');
await b.close(); srv.close();
