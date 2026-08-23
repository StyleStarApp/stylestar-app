/* ── scratchpad/framemock.mjs ────────────────────────────────────────────────
   Renders the Style Star card with candidate SILVER FRAME treatments, for her
   pick (2026-08-23). Her two asks, in her words:
     "On the silver frame I want it to bleed out to the edges, no white around
      the outer edge of frame."
     "On the silver I don't like the gradient shadowy look. I don't mind it
      looks shiny like a mirror but I want all one symmetrical color."

   ⚠️ HOW THIS RENDERS, and why it is honest: it does NOT re-implement the card.
   It copies the REAL index.html, swaps ONLY the six lines that draw the frame,
   serves that copy, and calls the app's own buildCardBlob. Everything else on
   the sheet — the logo, the name fitting, the motto wrap, the tail — is the
   shipping code. So what she is looking at is the real card wearing a
   different frame, not a mockup of one.

   ⚠️ THE FONT TRAP, FIFTH SIGHTING. This sandbox's Chromium cannot reach
   fonts.googleapis.com and falls back SILENTLY, and the card MEASURES text to
   fit the name and wrap the motto. The cached woff2 files are served in
   Google's place and the faces are PROVEN loaded by a width test before any
   card is drawn. A render in the wrong face is a picture of a different card. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';

const ROOT=process.cwd(), PORT=8977;

/* The block being replaced, copied byte for byte out of index.html. If it ever
   stops matching, this harness THROWS rather than rendering the current frame
   under a variant's name — a silently unpatched render is the worst possible
   output here, because every option would look identical and correct. */
const ANCHOR=`    const FR_OUT=20,FR_IN=64;
    ctx.fillStyle=diag(0,0,W,H,MIRROR);ctx.fillRect(FR_OUT,FR_OUT,W-2*FR_OUT,H-2*FR_OUT);`;

/* Each variant returns the JS that replaces ANCHOR. FR_IN stays 64 in all of
   them: the frame's INNER edge is where the paper starts, so moving it would
   move every word on the card. Only the outer margin goes. */
const BAND=`const FR_OUT=0,FR_IN=64;`;

/* A mitred four-sided bevel: each side is a trapezoid filled with the SAME ramp
   running outer edge -> inner edge, perpendicular to that side. That is what
   makes it symmetrical — top, bottom, left and right are the identical metal,
   and the corners meet on a 45 degree mitre like a real frame. */
const BEVEL=(ramp)=>`${BAND}
    (function(){
      const t=FR_IN-FR_OUT, R=${JSON.stringify(ramp)};
      function side(pts,gx0,gy0,gx1,gy1){
        ctx.save();ctx.beginPath();ctx.moveTo(pts[0],pts[1]);
        for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);
        ctx.closePath();ctx.clip();
        const g=ctx.createLinearGradient(gx0,gy0,gx1,gy1);
        R.forEach(function(c,i){g.addColorStop(i/(R.length-1),c)});
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
      }
      side([0,0, W,0, W-t,t, t,t], 0,0, 0,t);
      side([W,0, W,H, W-t,H-t, W-t,t], W,0, W-t,0);
      side([0,H, W,H, W-t,H-t, t,H-t], 0,H, 0,H-t);
      side([0,0, 0,H, t,H-t, t,t], 0,0, t,0);
    })();`;

const VARIANTS={
  // What is live today, with only the white margin removed, so she can see
  // whether the bleed alone is most of what was bothering her.
  A_bleedOnly:`${BAND}
    ctx.fillStyle=diag(0,0,W,H,MIRROR);ctx.fillRect(FR_OUT,FR_OUT,W-2*FR_OUT,H-2*FR_OUT);`,
  // One flat silver. Symmetrical beyond argument, and no shine at all.
  B_flat:`${BAND}
    ctx.fillStyle='#BFC4C9';ctx.fillRect(FR_OUT,FR_OUT,W-2*FR_OUT,H-2*FR_OUT);`,
  // A polished mirror bevel: bright near the outer edge, shadowed at the paper.
  C_mirror:BEVEL(['#B4B9BF','#F2F4F6','#DFE2E5','#A8AEB4','#8C9298','#C6CACE']),
  // The same profile with the range compressed — brushed metal, not chrome.
  D_softer:BEVEL(['#C2C7CC','#E8EAED','#D5D9DD','#B4BAC0','#A6ACB2','#C9CDD2'])
};

/* With the frame at the sheet's edge there is no outer edge left to define, so
   that hairline is dropped in every variant; the INNER one stays, and it is
   load-bearing (a light silver stop is within 1.04:1 of this paper). */
const OUTER_HAIRLINE=`    ctx.strokeStyle='rgba(90,95,100,.22)';ctx.strokeRect(FR_OUT+.5,FR_OUT+.5,W-2*FR_OUT-1,H-2*FR_OUT-1);`;

const base=fs.readFileSync('index.html','utf8');
if(!base.includes(ANCHOR)) throw new Error('frame block not found — index.html moved under this harness; re-copy ANCHOR before trusting any render');
if(!base.includes(OUTER_HAIRLINE)) throw new Error('outer hairline line not found');

let current=base;
const srv=http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]);
  if(u==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end(current);return}
  const f=path.join(ROOT,u.replace(/^\//,''));
  fs.readFile(f,(e,b)=>{
    if(e){res.writeHead(404);res.end();return}
    const m={'.png':'image/png','.json':'application/json','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'}[path.extname(f)];
    res.writeHead(200,{'Content-Type':m||'application/octet-stream'});res.end(b);
  });
});

async function useRealFonts(page){
  await page.route('https://fonts.googleapis.com/**', async r=>{
    await r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')});
  });
  await page.route('https://fonts.googleapis.com/*.woff2', async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)});
  });
  await page.route('https://fonts.gstatic.com/**', r=>r.abort());
}

const MOTTO="Catherine, you don't follow the moment, you are the moment.";
const NAME='The Modern Trendsetter';

(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  await useRealFonts(page);

  for(const [name,patch] of Object.entries(VARIANTS)){
    current=base.replace(ANCHOR,'    '+patch.trim()).replace(OUTER_HAIRLINE,'');
    if(current===base) throw new Error(name+': patch did not apply');
    await page.goto(`http://localhost:${PORT}/?v=`+name,{waitUntil:'load'});
    await page.waitForTimeout(1200);

    // PROVE the real faces are painted before drawing anything.
    const fp=await page.evaluate(async()=>{
      await Promise.all(['104px "DM Serif Display"','italic 400 46px "Lora"','600 38px "Jost"','400 33px "DM Sans"']
        .map(f=>document.fonts.load(f).catch(()=>{})));
      const c=document.createElement('canvas').getContext('2d');
      const w=s=>{c.font=s;return c.measureText('The Modern Trendsetter').width};
      return [w('72px "DM Serif Display", serif'),w('72px serif')];
    });
    if(Math.abs(fp[0]-fp[1])<=1) throw new Error(name+': fell back to a generic serif — the render would be a lie');

    const b64=await page.evaluate(async([n,m])=>{
      topArchNames=[n,'Golden Hour Enchantress','The Bold Expressionist'];
      userMotto=m;
      const rp=document.getElementById('rp'); if(rp)rp.textContent='A portrait sentence.';
      const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
      const buf=await blob.arrayBuffer();
      let s='';const u=new Uint8Array(buf);
      for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
      return btoa(s);
    },[NAME,MOTTO]);
    fs.writeFileSync('scratchpad/frame-'+name+'.png',Buffer.from(b64,'base64'));
    console.log('rendered '+name);
  }

  // The live card, untouched, as the control.
  current=base;
  await page.goto(`http://localhost:${PORT}/?v=live`,{waitUntil:'load'});
  await page.waitForTimeout(1200);
  const b64=await page.evaluate(async([n,m])=>{
    topArchNames=[n,'Golden Hour Enchantress','The Bold Expressionist'];userMotto=m;
    const rp=document.getElementById('rp'); if(rp)rp.textContent='A portrait sentence.';
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    const buf=await blob.arrayBuffer();let s='';const u=new Uint8Array(buf);
    for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
    return btoa(s);
  },[NAME,MOTTO]);
  fs.writeFileSync('scratchpad/frame-0_live.png',Buffer.from(b64,'base64'));
  console.log('rendered 0_live (control)');

  await browser.close();srv.close();
})();
