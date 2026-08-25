/* starpick.mjs — renders the Star of the Week label three ways at HER width
 * (393 CSS px @3x, iPhone 15) and stacks them into ONE labelled image, which is
 * the format that has actually worked for her (five small crops did not).
 *
 * ⚠️ Crops the LABEL ROW ONLY. No retailer photograph is captured, so nothing
 *    licensed is redistributed by committing this file (the .gitignore rule). */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8969, W=393, S=3;
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
const setCss=(r)=>pg.evaluate(x=>{let s=document.getElementById('__pick');
  if(!s){s=document.createElement('style');s.id='__pick';document.head.appendChild(s)} s.textContent=x},r);
const shot=async()=>{
  const clip=await pg.evaluate(()=>{const r=document.querySelector('#wbStar .wks-lbl').getBoundingClientRect();
    const c=document.querySelector('#wbStar .wks-card').getBoundingClientRect();
    return {x:c.x,y:r.y-10,width:c.width,height:r.height+20}});
  return (await pg.screenshot({clip})).toString('base64');
};
const OPTS=[
  ['AS IT IS NOW',''],
  ['D \u2014 right star truly mirrored  (recommended)','.wks-lbl svg.r{transform:scaleX(-1) rotate(-12deg)!important;margin-left:-.5px!important}'],
  ['E \u2014 light centred on both stars','.wks-lbl svg.r{margin-left:-.5px!important}',"50%"],
  ['B \u2014 stars upright, both identical','.wks-lbl svg.l,.wks-lbl svg.r{transform:none!important}.wks-lbl svg.r{margin-left:-1px!important}'],
];
const setGrad=(cx)=>pg.evaluate(v=>{document.querySelectorAll('#wbStar .wks-lbl radialGradient').forEach(g=>g.setAttribute('cx',v))},cx);
const imgs=[];
for(const [label,rule,grad] of OPTS){ await setCss(rule); await setGrad(grad||'42%'); await pg.waitForTimeout(140); imgs.push([label,await shot()]); }
await setCss(''); await setGrad('42%');
const out=await pg.evaluate(async(imgs)=>{
  const loaded=[]; for(const [t,p] of imgs){const i=new Image();
    await new Promise(r=>{i.onload=r;i.src='data:image/png;base64,'+p}); loaded.push([t,i]);}
  const w=loaded[0][1].width, pad=26, head=54, gap=18;
  const cv=document.createElement('canvas');
  cv.width=w+pad*2; cv.height=pad*2+loaded.length*(head+loaded[0][1].height+gap);
  const c=cv.getContext('2d');
  c.fillStyle='#f3f1ec'; c.fillRect(0,0,cv.width,cv.height);
  let y=pad;
  for(const [t,i] of loaded){
    c.fillStyle='#1a1a1a'; c.font='600 30px system-ui,sans-serif'; c.textBaseline='top';
    c.fillText(t,pad,y+8); y+=head;
    c.fillStyle='#fff'; c.fillRect(pad,y,w,i.height);
    c.drawImage(i,pad,y); c.strokeStyle='#d8d3c8'; c.lineWidth=2; c.strokeRect(pad,y,w,i.height);
    y+=i.height+gap;
  }
  return cv.toDataURL('image/png').split(',')[1];
},imgs);
fs.writeFileSync('scratchpad/starpick2.png',Buffer.from(out,'base64'));
console.log('wrote scratchpad/starpick2.png');
await b.close(); srv.close();
