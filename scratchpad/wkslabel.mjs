/* wkslabel.mjs — 2026-08-25, HER ask: "on STAR OF THE WEEK I would like the
 * font to be much larger - maybe same exact as the word SHOP down below it...
 * And change the stars to the prettier ones that I prefer?"
 *
 * ⚠️ MEASURED FIRST: SHOP is Jost 700 21px/.2em, but SHOP is FOUR letters.
 * "STAR OF THE WEEK" is sixteen, and .2em tracking alone costs 67px at 21px.
 * At 21px with stars it needs 334px against 295 available on her phone. So an
 * exact match cannot hold one line, and this renders the honest options.
 * ⚠️ Real typefaces via the renderfonts pattern -- a wrap comparison in
 *    fallback fonts is worthless (the 2026-08-17 font trap).
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pwmod;
import http from 'http'; import fs from 'fs'; import path from 'path';

const ROOT=path.resolve('.'), PORT=8947;
const W=Number(process.env.W||375);
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{
  let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:W,height:1400},deviceScaleFactor:2});
await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({
  userName:'Catherine',answers:a,topArchNames:['Modern Glam'],portrait:'x',motto:'Softness is not quiet'})),
  [8,8,9,9,9,6,6,4,6,6,6,6]);
await pg.goto(`http://localhost:${PORT}/`);
await pg.waitForTimeout(2600);
await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove()});
// ⚠️ `pg.evaluate(()=>document.fonts.ready)` SILENTLY DOES NOT WAIT: FontFaceSet
// is not serializable, so the call throws and a try/catch swallows it. Await it
// INSIDE an async evaluate that returns a plain value. renderfonts.mjs has the
// same bug and gets away with it on a long fixed timeout.
const proof=await pg.evaluate(async()=>{
  await document.fonts.ready;
  const mk=ff=>{const s=document.createElement('span');s.textContent='Catherine';
    s.style.cssText=`position:absolute;visibility:hidden;font:600 26px ${ff}`;document.body.appendChild(s);
    const x=s.getBoundingClientRect().width;s.remove();return x};
  // ⚠️ ASSERT THE FACE UNDER TEST, not a proxy. The first version checked
  // Dancing Script against serif and reported a false negative while Jost --
  // the only face this label uses -- was loaded and painting perfectly.
  const j=document.createElement('span'); j.textContent='STAR OF THE WEEK';
  j.style.cssText='position:absolute;visibility:hidden;font:700 21px Jost,sans-serif;letter-spacing:.2em';
  document.body.appendChild(j); const jw=j.getBoundingClientRect().width;
  j.style.font='700 21px sans-serif'; const sw=j.getBoundingClientRect().width; j.remove();
  return {jostRegistered: [...document.fonts].some(f=>f.family==='Jost'&&f.status==='loaded'),
          jostPainting: Math.abs(jw-sw)>1, jostW:+jw.toFixed(1), sansW:+sw.toFixed(1)};
});
console.log('fonts:',JSON.stringify(proof));
if(!proof.jostRegistered||!proof.jostPainting) throw new Error('JOST NOT PAINTING — a width comparison would be worthless');

const res=await pg.evaluate((W)=>{
  // ⚠️ CLONE THE REAL LABEL, do not replicate it with inline styles. The first
  // version hand-built a probe row and read ~12px WIDER than the real thing, so
  // it reported a wrap at 360 that does not happen. A clone keeps every real
  // .wks-lbl rule and only the variant override changes.
  const P='M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z';
  let n=0;
  const STAR={
    flat:  ()=>`<svg viewBox="0 0 24 24"><path d="${P}" fill="#E0B84C" stroke="#C89A2C" stroke-width="0.6"/></svg>`,
    edit:  ()=>{const id='g'+(++n);return `<svg viewBox="0 0 24 24"><defs><radialGradient id="${id}" cx="42%" cy="34%" r="72%"><stop offset="0" stop-color="#FDF0B8"/><stop offset=".38" stop-color="#F4D877"/><stop offset=".72" stop-color="#E8B944"/><stop offset="1" stop-color="#CE9A26"/></radialGradient></defs><path d="${P}" fill="url(#${id})" stroke="#9AA0A6" stroke-width="1.1" stroke-linejoin="round"/></svg>`},
    refine:()=>{const id='g'+(++n);return `<svg viewBox="0 0 24 24"><defs><radialGradient id="${id}" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFFCEF"/><stop offset=".4" stop-color="#F9E5A0"/><stop offset=".75" stop-color="#F0CB5E"/><stop offset="1" stop-color="#E6B845"/></radialGradient></defs><path d="${P}" fill="url(#${id})" stroke="#B7BCC2" stroke-width="1.1" stroke-linejoin="round"/></svg>`}
  };
  const VARIANTS=[
    {k:'NOW', cap:'NOW \u2014 12px / .16em, the flat star',                  fs:12, ls:.16, wt:600, sp:17, star:'flat'},
    {k:'A',   cap:'A \u2014 21px / .2em  =  EXACTLY the word SHOP',          fs:21, ls:.20, wt:700, sp:24, star:'edit'},
    {k:'B',   cap:'B \u2014 19px / .10em   \u2190 the biggest that fits',    fs:19, ls:.10, wt:700, sp:22, star:'edit'},
    {k:'C',   cap:'C \u2014 18px / .14em, roomier letter spacing',           fs:18, ls:.14, wt:700, sp:21, star:'edit'},
    {k:'D',   cap:'D \u2014 17px / .16em, today\'s spacing, just bigger',    fs:17, ls:.16, wt:700, sp:20, star:'edit'}
  ];
  const card=document.querySelector('#wbStar .wks-card');
  const cs=getComputedStyle(card);
  const cw=card.getBoundingClientRect().width, pad=parseFloat(cs.paddingLeft);
  const realLbl=document.querySelector('#wbStar .wks-lbl');
  const st=document.createElement('style'); document.head.appendChild(st);
  let rules='';
  const host=document.createElement('div');
  host.style.cssText='position:fixed;inset:0;z-index:99999;background:#1a1a1a;overflow:auto;padding:14px 0 34px';
  host.innerHTML='<div style="font:600 12px Jost,sans-serif;letter-spacing:.1em;color:#F2D889;text-align:center;padding:6px 12px 4px">STAR OF THE WEEK &middot; HOW BIG CAN THE LABEL GO?</div>'
    +'<div style="font:400 11px Jost,sans-serif;color:#9d968a;text-align:center;padding:0 16px 8px">rendered at '+W+'px on the real card, real fonts</div>';
  VARIANTS.forEach(v=>{
    const cap=document.createElement('div');
    cap.style.cssText='font:500 12px Jost,sans-serif;color:#CFC9BB;padding:14px 16px 5px';
    cap.textContent=v.cap; host.appendChild(cap);
    const box=document.createElement('div');
    box.className='probe'; box.dataset.k=v.k;
    box.style.cssText='background:#fff;width:'+cw+'px;margin:0 auto;padding:13px '+pad+'px;box-sizing:border-box;border:2px solid #E4B02E';
    const cl=realLbl.cloneNode(true);
    cl.classList.add('v-'+v.k);
    cl.innerHTML=STAR[v.star]().replace('<svg','<svg class="l"')+'STAR OF THE WEEK'+STAR[v.star]().replace('<svg','<svg class="r"');
    rules+='.v-'+v.k+'{font-size:'+v.fs+'px!important;letter-spacing:'+v.ls+'em!important;font-weight:'+v.wt+'!important}'
         + '.v-'+v.k+' svg{width:'+v.sp+'px!important;height:'+v.sp+'px!important}';
    box.appendChild(cl); host.appendChild(box);
  });
  const sc=document.createElement('div');
  sc.innerHTML='<div style="font:600 12px Jost,sans-serif;letter-spacing:.1em;color:#F2D889;text-align:center;padding:28px 12px 10px">AND WHICH STAR? &middot; all at 26px</div>'
   +'<div style="background:#fff;width:'+cw+'px;margin:0 auto;padding:18px 10px;box-sizing:border-box;display:flex;justify-content:space-around;align-items:flex-start">'
   +['flat','edit','refine'].map(k=>'<div style="text-align:center;width:33%"><span style="width:26px;height:26px;display:inline-block">'+STAR[k]()+'</span>'
     +'<div style="font:500 10px Jost,sans-serif;color:#5f5647;margin-top:8px;line-height:1.35">'
     +(k==='flat'?'1 &mdash; today<br>flat gold'
      :k==='edit'?'2 &mdash; your Edit,<br>Wardrobe &amp;<br>Signature card'
      :'3 &mdash; Refine title<br>&amp; shop loader')+'</div></div>').join('')
   +'</div>';
  host.appendChild(sc);
  st.textContent=rules;
  document.body.appendChild(host);
  const lines=[];
  host.querySelectorAll('.probe').forEach(p=>{
    const l=p.querySelector('.wks-lbl');
    const tn=[...l.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());
    const rng=document.createRange(); rng.selectNodeContents(tn);
    const tops=[...rng.getClientRects()].map(r=>Math.round(r.top));
    lines.push({k:p.dataset.k, lines:new Set(tops.map(t=>Math.round(t/6))).size||1,
                h:+l.getBoundingClientRect().height.toFixed(1)});
  });
  return {cw:+cw.toFixed(1), pad, lines, hostH: Math.ceil(host.lastElementChild.getBoundingClientRect().bottom)+18};
},W);
console.log(JSON.stringify(res,null,2));
await pg.setViewportSize({width:W,height:Math.min(res.hostH+20,2400)});
await pg.waitForTimeout(400);
await pg.screenshot({path:`scratchpad/wkslabel-${W}.png`});
await b.close(); srv.close();
console.log('rendered scratchpad/wkslabel-'+W+'.png');
