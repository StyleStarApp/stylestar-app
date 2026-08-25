/* starshape.mjs — separate SHAPE from SHADING.
 *
 * ⚠️ HER SCREENSHOT IS DELIBERATELY NOT COMMITTED. It lives in the session
 *    scratchpad only: it is her own phone screenshot AND it carries a retailer's
 *    product photograph, and this repo is PUBLIC -- an affiliate approval
 *    licenses the APP to hotlink that image, never this repository to
 *    redistribute a copy of it. Re-point the path at a fresh screenshot to rerun.
 *
 * ⭐ THE VERDICT THIS PRODUCED (2026-08-25): the two stars are a PERFECT mirror
 *    pair -- 1875 ink pixels each, ZERO differing, highlight matched to within
 *    0.4 percentage points. So nothing is wrong with the stars themselves, and
 *    two earlier harnesses that said otherwise were both measuring their own
 *    thresholds (see below). What is really uneven is measured by starlean.mjs.
 *
 * starmirror.mjs (now deleted) scored 84.4%, but its gold mask rejected the pale highlight
 * (#FDF0B8 has blue 184, above the b<150 cut), so it was partly measuring the
 * highlight, not the outline. This runs the same mirror comparison twice:
 *   SHAPE   = every pixel that is not the white card paper
 *   SHADING = only the brightest quartile of the star's own ink
 * ⚠️ tell that the earlier run was wrong: it counted more "bright" pixels than
 *    "warm" ones, which is impossible unless the mask was catching the paper. */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod; import fs from 'fs';
const b64=fs.readFileSync('/tmp/claude-0/-home-user-stylestar-app/74e602ca-61c9-546d-b56d-c748562a678b/scratchpad/hershot.png').toString('base64');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage(); await pg.setContent('<canvas id=c></canvas>');
const o=await pg.evaluate(async(b64)=>{
  const img=new Image(); await new Promise(r=>{img.onload=r;img.src='data:image/png;base64,'+b64});
  const cv=document.getElementById('c'); cv.width=img.width;cv.height=img.height;
  const x=cv.getContext('2d'); x.drawImage(img,0,0);
  const d=x.getImageData(0,0,cv.width,cv.height).data;
  const at=(px,py)=>{const i=(py*cv.width+px)*4;return[d[i],d[i+1],d[i+2]]};
  // the card paper is pure white; anything with a blue channel meaningfully
  // below its red channel, or simply darker than paper, is star ink or stroke.
  const ink=([r,g,bl])=>!(r>246&&g>246&&bl>246);
  const L={x0:196,x1:238,y0:1080,y1:1123}, R={x0:940,x1:982,y0:1080,y1:1123};
  const w=L.x1-L.x0+1,h=L.y1-L.y0+1;
  let both=0,onlyL=0,onlyR=0, rows=[];
  const lum=[],rum=[];
  for(let j=0;j<h;j++){ let a='',c='';
    for(let i=0;i<w;i++){
      const pl=at(L.x0+i,L.y0+j), pr=at(R.x1-i,R.y0+j);
      const A=ink(pl), C=ink(pr);
      if(A&&C)both++; else if(A)onlyL++; else if(C)onlyR++;
      a+=A?'#':'.'; c+=C?'#':'.';
      if(A) lum.push([i,j,(pl[0]*.3+pl[1]*.6+pl[2]*.1)]);
      if(C) rum.push([i,j,(pr[0]*.3+pr[1]*.6+pr[2]*.1)]);
    }
    rows.push([a,c]); }
  const top=(arr)=>{const s=[...arr].sort((p,q)=>q[2]-p[2]).slice(0,Math.round(arr.length*0.25));
    return {x:+(s.reduce((t,p)=>t+p[0],0)/s.length/(w-1)*100).toFixed(1),
            y:+(s.reduce((t,p)=>t+p[1],0)/s.length/(h-1)*100).toFixed(1),n:s.length};};
  return {both,onlyL,onlyR,rows,shapeL:lum.length,shapeR:rum.length,hiL:top(lum),hiR:top(rum)};
},b64);
await b.close();
const iou=o.both/(o.both+o.onlyL+o.onlyR);
console.log('SHAPE  — left star vs mirrored right star');
console.log('  ink left '+o.shapeL+'   ink right '+o.shapeR+'   overlap '+o.both+'   left-only '+o.onlyL+'   right-only '+o.onlyR);
console.log('  agreement: '+(iou*100).toFixed(1)+'%   (a true mirror is ~100%)');
console.log('\nSHADING — centre of the brightest quarter of each star\'s ink,');
console.log('          measured in the MIRRORED frame, so a matched pair reads the SAME x.');
console.log('  left  : x '+o.hiL.x+'%   y '+o.hiL.y+'%');
console.log('  right : x '+o.hiR.x+'%   y '+o.hiR.y+'%   (mirrored)');
console.log('  horizontal difference: '+(o.hiR.x-o.hiL.x).toFixed(1)+' percentage points of the star\'s width');
if(iou<0.93){console.log('\nfirst rows of the shape comparison:');o.rows.slice(0,20).forEach(([a,c])=>console.log(a+'   '+c));}
