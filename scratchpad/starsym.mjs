/* starsym.mjs — 2026-08-25, HER catch on the as-built Star label: "check the
 * spacing, placement and symmetry of the 2 stars... to my eye they don't look
 * even."
 *
 * ⚠️ BOX RECTS CANNOT SETTLE THIS. getBoundingClientRect is computed from
 *    ADVANCE widths, and letter-spacing puts its space after the LAST letter
 *    too -- invisible to a rect, plainly visible to an eye. That is exactly how
 *    the "CURATED BY CATHERINE" hearts read uneven on 2026-08-10 while every
 *    box measurement reported 10.13 / 10.13. So this measures PAINTED PIXELS.
 * ⚠️ The PNG is decoded INSIDE THE PAGE: this sandbox's node has no decoder and
 *    the browser has one (the quotegap.mjs lesson).
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8963, W=Number(process.env.W||375), S=4;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8').replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:W,height:860},deviceScaleFactor:S});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
const stub=fs.readFileSync('/tmp/stub.png');
await pg.route(/cdn\.shop|shopify|farmrio|images\./i,r=>r.fulfill({status:200,contentType:'image/png',body:stub}));
await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
  topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
await pg.evaluate(async()=>{await document.fonts.ready});
await pg.waitForTimeout(500);

const clip=await pg.evaluate(()=>{const r=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
  return {x:r.x-6,y:r.y-6,width:r.width+12,height:r.height+12}});
const shot=(await pg.screenshot({clip})).toString('base64');

const m=await pg.evaluate(async ({png,S})=>{
  const img=new Image();
  await new Promise(r=>{img.onload=r;img.src='data:image/png;base64,'+png});
  const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
  const cx=cv.getContext('2d'); cx.drawImage(img,0,0);
  const d=cx.getImageData(0,0,cv.width,cv.height).data;
  const at=(x,y)=>{const i=(y*cv.width+x)*4;return [d[i],d[i+1],d[i+2]]};
  // GOLD = saturated warm. INK = dark and unsaturated. The drop-shadow glow is
  // pale gold, so gold needs a real saturation floor or the glow inflates the box.
  const isGold=([r,g,bl])=>r>120&&r-bl>55&&Math.abs(r-g)<70&&(Math.max(r,g,bl)-Math.min(r,g,bl))>60;
  const isInk =([r,g,bl])=>r<130&&g<130&&bl<130&&(Math.max(r,g,bl)-Math.min(r,g,bl))<45;
  const gold=[], ink=[];
  for(let y=0;y<cv.height;y++) for(let x=0;x<cv.width;x++){
    const p=at(x,y);
    if(isGold(p)) gold.push([x,y]);
    else if(isInk(p)) ink.push([x,y]);
  }
  const bbox=pts=>pts.length?{x0:Math.min(...pts.map(p=>p[0])),x1:Math.max(...pts.map(p=>p[0])),
                              y0:Math.min(...pts.map(p=>p[1])),y1:Math.max(...pts.map(p=>p[1]))}:null;
  const mid=cv.width/2;
  const L=bbox(gold.filter(p=>p[0]<mid)), R=bbox(gold.filter(p=>p[0]>mid)), I=bbox(ink);
  const px=v=>+(v/S).toFixed(2);
  const dim=x=>x?{w:px(x.x1-x.x0+1),h:px(x.y1-x.y0+1),cx:px((x.x0+x.x1)/2),cy:px((x.y0+x.y1)/2)}:null;
  return {
    canvas:{w:cv.width,h:cv.height},
    leftStar:dim(L), rightStar:dim(R), text:dim(I),
    gapLeft:  L&&I?px(I.x0-L.x1):null,   // right edge of left star  -> first ink
    gapRight: R&&I?px(R.x0-I.x1):null,   // last ink -> left edge of right star
    // vertical placement against the text's own ink band
    leftVsText:  L&&I?px(((L.y0+L.y1)/2)-((I.y0+I.y1)/2)):null,
    rightVsText: R&&I?px(((R.y0+R.y1)/2)-((I.y0+I.y1)/2)):null,
    // is the pair centred in the label box?
    padLeft: L?px(L.x0):null, padRight: R?px(cv.width-1-R.x1):null
  };
},{png:shot,S});
console.log(JSON.stringify(m,null,2));
await pg.screenshot({path:'scratchpad/starsym.png',clip});
await b.close(); srv.close();
