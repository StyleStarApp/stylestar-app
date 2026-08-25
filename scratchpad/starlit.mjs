/* starlit.mjs — 2026-08-25, HER THIRD look: "the star on the right is lower
 * than the one on the left. Just slightly."
 *
 * ⚠️ SHE IS RIGHT AND IT IS NOT THE GEOMETRY. Measured on her own screenshot
 *    the two stars are identical to the pixel: both run y 1073-1130, both 58
 *    tall, ink 1591 vs 1593, shape agreement 99.7%, vertical ink centres 0.01
 *    CSS px apart. Nothing about the position or the outline is uneven.
 *
 * ⭐ WHAT IS UNEVEN IS THE LIGHTING, AND THE CAUSE IS THAT ROTATION IS NOT
 *    REFLECTION. The star's radial gradient is deliberately off-centre
 *    (cx 42%, cy 34%). Rotating one star -12deg and the other +12deg does NOT
 *    mirror that highlight -- it carries the SAME off-centre highlight round
 *    two different arcs, so the pair ends up neither mirrored nor identical.
 *    Predicted from the rotation matrix, then measured on her screenshot:
 *        predicted  left x 38.9% y 36.0%   right x 45.5% y 32.7%
 *        measured   left x 43.0% y 34.2%   right x 45.2% y 31.4%
 *    The two highlight x values sum to 88%, where a mirrored pair sums to 100.
 *    The right star's bright spot sits 0.62 CSS px HIGHER, which puts its
 *    visual weight lower -- which is exactly what she is reading as "lower".
 *
 * ⚠️ THREE EARLIER MASKS GOT THIS WRONG before the numbers could be trusted:
 *    gold-only (rejects the pale highlight, blue 184) scored the pair at 84%;
 *    not-pure-white called 99% of the box ink and passed vacuously; a "bright"
 *    test counted the white card as highlight. Paper is NEUTRAL and pale, star
 *    gold is SATURATED, the outline is neutral but DARK -- so the only mask
 *    that separates them is: saturated OR dark.
 *
 * This measures each candidate fix on the real page.
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8973, W=393, S=3;
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
if(!await pg.evaluate(()=>document.fonts.check('700 19px Jost'))){console.error('ABORT: Jost did not load');process.exit(1)}
await pg.waitForTimeout(300);

const setCss=(r)=>pg.evaluate(x=>{let s=document.getElementById('__lit');
  if(!s){s=document.createElement('style');s.id='__lit';document.head.appendChild(s)} s.textContent=x},r);
const setGrad=(cx)=>pg.evaluate(v=>{document.querySelectorAll('#wbStar .wks-lbl radialGradient')
  .forEach(g=>g.setAttribute('cx',v))},cx);

async function measure(label){
  const clip=await pg.evaluate(()=>{const r=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
    return {x:r.x-8,y:r.y-8,width:r.width+16,height:r.height+16}});
  const png=(await pg.screenshot({clip})).toString('base64');
  const m=await pg.evaluate(async({png})=>{
    const img=new Image(); await new Promise(r=>{img.onload=r;img.src='data:image/png;base64,'+png});
    const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
    const c=cv.getContext('2d'); c.drawImage(img,0,0);
    const d=c.getImageData(0,0,cv.width,cv.height).data;
    const at=(x,y)=>{const i=(y*cv.width+x)*4;return[d[i],d[i+1],d[i+2]]};
    const sat=p=>Math.max(...p)-Math.min(...p), lum=p=>p[0]*.3+p[1]*.6+p[2]*.1;
    const body=p=>sat(p)>60;
    const mid=cv.width/2, L=[],R=[];
    for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){const p=at(x,y);
      if(body(p))(x<mid?L:R).push([x,y,lum(p)]);}
    const stat=(pts)=>{const x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0]));
      const y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
      const hi=[...pts].sort((a,c)=>c[2]-a[2]).slice(0,Math.max(20,Math.round(pts.length*0.12)));
      const mn=(a,i)=>a.reduce((t,p)=>t+p[i],0)/a.length;
      return {y0,y1,hiX:+((mn(hi,0)-x0)/(x1-x0)*100).toFixed(1),hiY:+((mn(hi,1)-y0)/(y1-y0)*100).toFixed(1)};};
    return {L:stat(L),R:stat(R)};
  },{png});
  const sum=(m.L.hiX+m.R.hiX).toFixed(1), dy=(m.R.hiY-m.L.hiY).toFixed(1);
  console.log(label.padEnd(34)
    +' highlight x  L '+String(m.L.hiX).padStart(5)+'  R '+String(m.R.hiX).padStart(5)
    +'  sum '+String(sum).padStart(6)+'%'
    +'   |  highlight y  L '+String(m.L.hiY).padStart(5)+'  R '+String(m.R.hiY).padStart(5)
    +'  diff '+String(dy).padStart(5)+' pts = '+((m.R.hiY-m.L.hiY)/100*22).toFixed(2)+' CSS px'
    +'   |  tops '+m.L.y0+'/'+m.R.y0);
}
console.log('a MIRRORED pair sums to 100% across and has 0 difference down.\n');
await measure('AS IT IS NOW');
await setCss('.wks-lbl svg.r{transform:scaleX(-1) rotate(-12deg)!important;margin-left:-.5px!important}');
await measure('D true mirror (right flipped)');
await setCss('.wks-lbl svg.r{margin-left:-.5px!important}'); await setGrad('50%');
await measure('E gradient centred, tilt kept');
await setCss('.wks-lbl svg.l,.wks-lbl svg.r{transform:none!important}.wks-lbl svg.r{margin-left:-1px!important}');
await measure('B upright (both stars identical)');
await setGrad('42%'); await setCss('');
await measure('control (back to now)');
await b.close(); srv.close();
