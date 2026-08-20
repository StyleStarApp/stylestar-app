/* Round 2. Her two notes: the card is 28px narrower than the mirrors (measured:
   card 30-360, mirrors 16-374), and the gold reads orange/brown — the standing
   antique-gold trap, walked into again. Fixes:
   WIDTH  — every option insets #wbStar by exactly the frame's own thickness, so
            the framed OUTER edge lands on 16/374, flush with both mirrors.
   GOLD   — no #CFA02E / #8a6a14 anywhere. Bright golds only, and gradients
            rather than flat fills, because a flat mid-gold at frame scale is
            what reads brown; a highlight-to-shadow ramp is what reads as metal.
   HEIGHT — frames are drawn as an absolutely positioned ::before (inset:-Npx)
            or box-shadow, never padding, so the fold does not move. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/home/user/stylestar-app', PORT=8954;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));
const css=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const scarf=fs.readFileSync(ROOT+'/scratchpad/px/scarf.jpg');

// gold leaf: the wb-chip's own gradient, the brightest gold already on this screen
const LEAF='linear-gradient(150deg,#FEEF98 0%,#F6CE3E 46%,#E4B02E 78%,#F3DC8B 100%)';
const gradFrame=(n,bg,extra='')=>`
  #wbStar{margin:12px ${n}px 2px!important;position:relative;z-index:0}
  .wks-card{position:relative}
  .wks-card::before{content:'';position:absolute;inset:-${n}px;background:${bg};z-index:-1;${extra}}`;

const OPTS={
  /* control: the width fix on its own, no frame at all */
  aligned:`#wbStar{margin:12px 0 2px!important}`,
  /* E — gold leaf, 7px, gradient so it reads as metal not paint */
  e:gradFrame(7,LEAF,'box-shadow:0 8px 18px rgba(0,0,0,.45)'),
  /* F — the mirrors' own chrome, with a bright gold lip on the inside edge:
         same family as the page, one rank up, because this one is the Star */
  f:`#wbStar{margin:12px 9px 2px!important}
     .wks-card{border-color:#E0B84C!important;
       box-shadow:0 0 0 8px #D8DDE2,0 0 0 9px #7c828a,0 14px 20px -8px rgba(0,0,0,.6)!important}
     .wks-disc{margin-top:16px!important}`,
  /* G — the GREETING mirror's bevelled treatment, the app's own top-tier frame */
  g:`#wbStar{margin:12px 12px 2px!important}
     .wks-card{border-color:#E0B84C!important;
       box-shadow:inset 0 0 0 2px rgba(255,255,255,.7),0 0 0 11px #D8DDE2,0 0 0 12px #7c828a,
         0 24px 26px -14px rgba(0,0,0,.6)!important}
     .wks-disc{margin-top:19px!important}`,
  /* H — fine gold leaf at jewellery scale: 4px band, white lip between it and
         the paper, so the frame reads as a setting rather than a picture frame */
  h:gradFrame(5,LEAF,'box-shadow:inset 0 0 0 1px rgba(255,255,255,.55),0 7px 16px rgba(0,0,0,.42)')
};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [k,extra] of Object.entries(OPTS)){
  const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route('**/cdn/shop/**',r=>r.fulfill({status:200,contentType:'image/jpeg',body:scarf}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  // pin the rotating greeting quote — it changes height between runs and would
  // otherwise make the five renders incomparable (a real measurement trap)
  await pg.evaluate(()=>{document.querySelectorAll('.hm-entrance').forEach(e=>e.remove());
    window.WB_MSGS=[WB_MSGS[0]];show('s-wb');});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.waitForTimeout(1100);
  if(extra)await pg.addStyleTag({content:extra});
  await pg.waitForTimeout(350);
  console.log(k.padEnd(8),JSON.stringify(await pg.evaluate(()=>{
    const c=document.querySelector('.wks-card'),g=document.querySelector('.wb-greet'),
          sv=document.querySelector('#wbStar .wl-save');
    const cs=getComputedStyle(c,'::before'), cb=c.getBoundingClientRect(), gb=g.getBoundingClientRect();
    // the framed OUTER edge: the ::before's box if there is one, else the box-shadow spread
    const sh=getComputedStyle(c).boxShadow, m=[...sh.matchAll(/0px 0px 0px (\d+(?:\.\d+)?)px/g)].map(x=>+x[1]);
    const spread=cs.content!=='none'&&cs.position==='absolute'
      ? Math.abs(parseFloat(cs.left)||0) : (m.length?Math.max(...m):0);
    return {outerL:Math.round(cb.left-spread), outerR:Math.round(cb.right+spread),
      mirrorL:Math.round(gb.left), mirrorR:Math.round(gb.right),
      saveBottom:Math.round(sv.getBoundingClientRect().bottom),
      scroll:Math.round(document.documentElement.scrollWidth)};
  })));
  await pg.screenshot({path:`scratchpad/frame2-${k}.png`});
  await pg.close();
}
await b.close(); srv.close();
