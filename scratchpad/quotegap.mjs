// Measure the PAINTED gap on each side of her Star note's quote marks.
// ⚠️ Box rects cannot see this: the specified margins are symmetric (1px each),
// so a rect comparison would report "equal" on a line her eye says is wrong.
// The 2026-08-10 curated-by-hearts lesson -- rasterise, count ink.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ROOT='/home/user/stylestar-app', PORT=8987;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
 r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html':'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:4});
const pg=await ctx.newPage();
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2200);
await pg.evaluate(()=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',
  answers:new Array(12).fill(6),topArchNames:['The Timeless Classic'],portrait:'p',motto:'m'})));
await pg.reload(); await pg.waitForTimeout(2400);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
const NOTE=process.env.NOTE;
await pg.evaluate(n=>{ if(!n)return;
  const el=document.querySelector('.wks-q'); if(!el)return;
  el.textContent=n;
  // drive the REAL rule, not a hand-set class
  el.classList.toggle('wks-q-lo', /[.,]\s*$/.test(n));
}, NOTE);
await pg.evaluate(()=>document.querySelectorAll('.wks-card img').forEach(i=>i.remove()));
await pg.waitForTimeout(400);
const el=await pg.$('.wks-note'); if(!el){console.log('no .wks-note');process.exit(1)}
const b64=(await el.screenshot()).toString('base64');
// ⚠️ Decode INSIDE the page: no PNG decoder exists in this sandbox's node, but
// the browser has one. Same pixels either way.
const out=await pg.evaluate(async d=>{
  const img=new Image(); img.src='data:image/png;base64,'+d;
  await img.decode();
  const W=img.naturalWidth,H=img.naturalHeight;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const g=c.getContext('2d'); g.drawImage(img,0,0);
  const D=g.getImageData(0,0,W,H).data;
  const px=(x,y)=>{const i=(y*W+x)*4;return [D[i],D[i+1],D[i+2],D[i+3]]};
  const isGold=(r,gr,bl,a)=>a>60&&r>170&&gr>140&&bl<190&&(r-bl)>45;
  const isInk =(r,gr,bl,a)=>a>60&&r<150&&gr<150&&bl<150;
  const isPink=(r,gr,bl,a)=>a>60&&r>200&&gr<190&&bl>150&&(r-gr)>40&&(bl-gr)>20;
  const rowHas=y=>{for(let x=0;x<W;x++){const p=px(x,y);if(isGold(...p)||isInk(...p))return true}return false};
  let lines=[],cur=null;
  for(let y=0;y<H;y++){ if(rowHas(y)){ if(!cur)cur={t:y}; cur.b=y } else if(cur){lines.push(cur);cur=null} }
  if(cur)lines.push(cur);
  const colsIn=(l,t)=>{const o=[];for(let x=0;x<W;x++){for(let y=l.t;y<=l.b;y++){if(t(...px(x,y))){o.push(x);break}}}return o};
  const res=[];
  for(const l of lines){
    const gold=colsIn(l,isGold), ink=colsIn(l,isInk), pink=colsIn(l,isPink);
    if(!gold.length) continue;
    const runs=[];let s=gold[0],p0=gold[0];
    for(const x of gold.slice(1)){ if(x-p0>8){runs.push([s,p0]);s=x} p0=x } runs.push([s,p0]);
    for(const [a,z] of runs){
      const iA=ink.filter(x=>x>z), iB=ink.filter(x=>x<a), pA=pink.filter(x=>x>z);
      // ⚠️ THE GAP HER EYE SEES IS NOT THE COLUMN GAP. A period sits alone on the
      // baseline, so the ink nearest the closing quote is a dot in an otherwise
      // empty column-band. Measure to the last TALL ink as well.
      const mid=Math.round(l.t+(l.b-l.t)*0.55);
      const tall=[];for(let x=0;x<W;x++){for(let y=l.t;y<=mid;y++){if(isInk(...px(x,y))){tall.push(x);break}}}
      const tB=tall.filter(x=>x<a), tA=tall.filter(x=>x>z);
      res.push({band:l.t, gold:[a,z], w:(z-a+1)/4,
        left: iB.length?(a-iB[iB.length-1])/4:null,
        right:iA.length?(iA[0]-z)/4:null,
        tallL:tB.length?(a-tB[tB.length-1])/4:null,
        tallR:tA.length?(tA[0]-z)/4:null,
        heart:pA.length?(pA[0]-z)/4:null});
    }
  }
  return {W,H,lines:lines.map(l=>l.t+'-'+l.b),res};
},b64);
console.log('element',out.W+'x'+out.H,'@4x | bands:',out.lines.join(' '));
for(const r of out.res)
  console.log(`  band ${String(r.band).padStart(4)}  gold ${r.gold[0]}-${r.gold[1]} (w ${r.w.toFixed(2)}px)  ink-gap LEFT ${r.left===null?'—':r.left.toFixed(2)+'px'}  RIGHT ${r.right===null?'—':r.right.toFixed(2)+'px'}`+`  | to TALL ink L ${r.tallL===null?'—':r.tallL.toFixed(2)} R ${r.tallR===null?'—':r.tallR.toFixed(2)}`+(r.heart!==null?`  heart +${r.heart.toFixed(2)}px`:''));
await b.close(); srv.close();

