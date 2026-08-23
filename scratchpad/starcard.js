/* ── scratchpad/starcard.js ───────────────────────────────────────────────────
   The Style Star card, driven in the REAL app in a real browser.
   The gate this suite exists for: ALL 28 ARCHETYPE NAMES must render a card
   nobody would be embarrassed to send. A name is one unit that shrinks rather
   than wraps, so the long ones are where it breaks, and only one of the 28 was
   ever looked at by eye during design. */
// package.json declares "type":"module", so this is ESM (the other suites in
// this folder predate that and use .cjs or import).
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import zlib from 'zlib';

/* ⚠️ THE FONT TRAP (2026-08-17, and it nearly took this suite with it):
   Chromium in this sandbox CANNOT reach fonts.googleapis.com, so the app falls
   back to generic serif/sans SILENTLY. The card MEASURES text at runtime to fit
   the archetype name and wrap the motto, so measuring in the wrong face means
   the suite proves nothing about the real card. The cached woff2 files in
   scratchpad/fonts are served in Google's place. */
async function useRealFonts(page,PORT){
  await page.route('https://fonts.googleapis.com/**', async r=>{
    const css=fs.readFileSync('scratchpad/fonts/gf.css','utf8');
    await r.fulfill({status:200,contentType:'text/css',body:css});
  });
  await page.route('https://fonts.googleapis.com/*.woff2', async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)});
  });
  await page.route('https://fonts.gstatic.com/**', r=>r.abort());
}
// A computed font-family returns the DECLARED stack and document.fonts.check()
// returns true for a fallback, so width-against-generic is the only honest probe.
async function proveFonts(page){
  return page.evaluate(async()=>{
    /* A face is only fetched once something ASKS for it, so probe after loading
       the exact specs — which is precisely what buildCardBlob's own ready() does
       before it draws. Lora italic failed this probe until the load was added,
       which is the proof those explicit loads in the app are doing real work
       rather than being belt-and-braces. */
    await Promise.all(['104px "DM Serif Display"','italic 400 46px "Lora"','600 27px "Jost"']
      .map(f=>document.fonts.load(f).catch(()=>{})));
    const c=document.createElement('canvas').getContext('2d');
    const w=s=>{c.font=s;return c.measureText('The Statement Maker').width};
    return {
      serif:[w('72px "DM Serif Display", serif'),w('72px serif')],
      lora:[w('italic 400 72px "Lora", serif'),w('italic 400 72px serif')],
      jost:[w('600 72px "Jost", sans-serif'),w('600 72px sans-serif')]
    };
  });
}

const ROOT=process.cwd(),PORT=8974;
let pass=0,fail=0;
const ok=(c,m)=>{ if(c){pass++} else {fail++;console.log('  FAIL  '+m)} };

const MIME={'.html':'text/html','.png':'image/png','.json':'application/json','.css':'text/css','.js':'text/javascript'};
const srv=http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]);
  if(u==='/')u='/index.html';
  const f=path.join(ROOT,u.replace(/^\//,''));
  fs.readFile(f,(e,b)=>{
    if(e){res.writeHead(404);res.end();return}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(b);
  });
});

// minimal PNG reader: the card is a canvas, so pixels are the only way to see it
function png(buf){
  let pos=8,idat=Buffer.alloc(0),w=0,h=0,ct=0;
  while(pos<buf.length){
    const ln=buf.readUInt32BE(pos),typ=buf.toString('ascii',pos+4,pos+8);
    if(typ==='IHDR'){w=buf.readUInt32BE(pos+8);h=buf.readUInt32BE(pos+12);ct=buf[pos+17]}
    if(typ==='IDAT')idat=Buffer.concat([idat,buf.slice(pos+8,pos+8+ln)]);
    pos+=12+ln;
  }
  const bpp={0:1,2:3,4:2,6:4}[ct],raw=zlib.inflateSync(idat),stride=w*bpp;
  const out=Buffer.alloc(h*stride);let prev=Buffer.alloc(stride),i=0;
  for(let y=0;y<h;y++){
    const ft=raw[i++];const line=Buffer.from(raw.slice(i,i+stride));i+=stride;
    for(let x=0;x<stride;x++){
      const a=x>=bpp?line[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;
      if(ft===1)line[x]=(line[x]+a)&255;
      else if(ft===2)line[x]=(line[x]+b)&255;
      else if(ft===3)line[x]=(line[x]+((a+b)>>1))&255;
      else if(ft===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
        line[x]=(line[x]+(pa<=pb&&pa<=pc?a:pb<=pc?b:c))&255}
    }
    line.copy(out,y*stride);prev=line;
  }
  return {w,h,bpp,px:out};
}
const lum=(p,x,y)=>p.px[(y*p.w+x)*p.bpp];

(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await useRealFonts(page,PORT);

  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(1400);

  // ── Part 0: prove the REAL faces painted, or nothing below means anything ─
  const fp=await proveFonts(page);
  for(const [k,[a,b]] of Object.entries(fp))
    ok(Math.abs(a-b)>1, 'the real '+k+' face is loaded, not a fallback ('+a.toFixed(1)+' vs generic '+b.toFixed(1)+')');

  // ── Part 1: the constellation is really gone from the woman's view ────────
  const copy=await page.evaluate(()=>document.body.innerText+' '+document.body.innerHTML);
  ok(!/Style Constellation/.test(await page.evaluate(()=>document.body.innerText)),
     'no visible text still says Style Constellation');
  ok(/Style Star Card/.test(copy),'the entry point is named Style Star Card');
  ok(!/star-map keepsake/.test(copy),'the star-map subtitle is gone');
  ok(await page.evaluate(()=>typeof shareResults==='undefined'),
     'the dead shareResults() is deleted, not just unwired');
  ok(await page.evaluate(()=>typeof sharePhotoResults==='undefined'),
     'the dead sharePhotoResults() is deleted');
  ok(await page.evaluate(()=>typeof buildCardBlob==='function'),'buildCardBlob still exists');

  // ── Part 2: render the card for ALL 28 ARCHETYPES ─────────────────────────
  const names=await page.evaluate(()=>Object.keys(archLines));
  ok(names.length===28,'all 28 archetypes found ('+names.length+')');

  const LONG_MOTTO='Alexandria, you dress like the decision has already been made in your favor, and it always has been.';
  let widest=0,narrowest=1e9,shrunk=[];

  for(const name of names){
    const b64=await page.evaluate(async ([n,motto])=>{
      topArchNames=[n,'The Bold Expressionist','The Modern Trendsetter'];
      userMotto=motto;
      const rp=document.getElementById('rp'); if(rp)rp.textContent='A portrait sentence.';
      const blob=await new Promise(res=>buildCardBlob('quiz',(bl)=>res(bl)));
      const buf=await blob.arrayBuffer();
      let s='';const u=new Uint8Array(buf);
      for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
      return btoa(s);
    },[name,LONG_MOTTO]);

    const p=png(Buffer.from(b64,'base64'));
    if(p.w!==1080||p.h!==1920){ok(false,name+': card is '+p.w+'x'+p.h+', not 1080x1920');continue}

    // every ink row inside the paper, so bands can be found
    const PAPER_EDGE=64;
    const rows=[];
    for(let y=PAPER_EDGE+16;y<p.h-PAPER_EDGE-16;y++){
      let ink=0;
      for(let x=PAPER_EDGE+16;x<p.w-PAPER_EDGE-16;x+=2) if(lum(p,x,y)<150) ink++;
      rows.push(ink);
    }
    // a MERGED band is what an overlap looks like from here: two lines of type
    // with no blank row between them read as one very tall band.
    let run=0,tallest=0;
    for(const v of rows){ run = v>0 ? run+1 : 0; if(run>tallest)tallest=run; }
    ok(tallest<=170, name+': tallest unbroken ink band is '+tallest+'px (an overlap reads as a merged band)');

    /* Nothing may touch the silver frame.
       ⚠️ THIS PROBE MUST TRACK THE FRAME'S INNER EDGE. It sampled x=55 when the
       band ran 24..46; the band was then thickened to 20..64 (her call) and all
       28 archetypes "failed" at once — because 55 now lands ON THE SILVER, whose
       dark stop #8C9298 is dark enough to read as ink. The card was fine; the
       ruler had moved. A whole-suite failure that arrives the moment a constant
       changes is almost always the harness.
       PAPER_EDGE mirrors FR_IN in buildCardBlob. If that changes, change this. */
    const probe=PAPER_EDGE+12;
    let bleed=false;
    for(let y=PAPER_EDGE+20;y<p.h-PAPER_EDGE-20;y+=3){
      if(lum(p,probe,y)<150||lum(p,p.w-probe,y)<150)bleed=true;
    }
    ok(!bleed, name+': no text bleeds into the frame');

    /* The address must survive — it is the entire point of the card.
       ⚠️ DERIVED, NOT A FIXED WINDOW. This used to sample a hardcoded band near
       the bottom, and it went stale the moment the layout gained air: the probe
       kept pointing at the same pixels while the content moved, so six of the
       longest names "lost their address" when nothing of the sort had happened.
       Every fixed pixel probe in this suite has now broken at least once for
       exactly this reason. Find the LAST ink band and assert about THAT. */
    let lastInk=-1;
    for(let i=rows.length-1;i>=0;i--) if(rows[i]>0){lastInk=i;break}
    ok(lastInk>-1, name+': the card has ink at all');
    const bottomGap=rows.length-1-lastInk;
    ok(bottomGap>=20&&bottomGap<=140,
       name+': the address sits near the foot, '+bottomGap+'px off the paper edge');
    let bandTop=lastInk;
    while(bandTop>0&&rows[bandTop-1]>0)bandTop--;
    const addressInk=rows.slice(bandTop,lastInk+1).reduce((a,v)=>a+v,0);
    ok(addressInk>400, name+': the address is fully drawn ('+addressInk+' ink)');
  }

  // ── Part 3: the size decision, pinned ─────────────────────────────────────
  const dims=await page.evaluate(async()=>{
    topArchNames=['The Statement Maker','The Bold Expressionist','The Modern Trendsetter'];
    userMotto='Ashley, you walk in and the room adjusts; your confidence is the accessory.';
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    const bmp=await createImageBitmap(blob);
    return {w:bmp.width,h:bmp.height};
  });
  ok(dims.w===1080&&dims.h===1920,
     'the card is Instagram Story size 1080x1920, not the feed 4:5 that cuts off the address (got '+dims.w+'x'+dims.h+')');

  /* ── Part 3b: HER MOTTO IS DRAWN WORD FOR WORD ────────────────────────────
     Her instruction, and it is the one thing about this card she asked for
     twice: "I don't want to shorten the words on the motto." So this asserts
     it directly rather than trusting the reading of a code path - hook
     fillText, draw a card, and put the words that actually hit the canvas back
     together. If a future change ever truncates, ellipsises or drops a word to
     make something fit, this fails and names the missing text.
     ⚠️ The card DOES shrink the type when a very long motto will not fit, and
     that is fine - shrinking the FACE is not shortening the WORDS. This test is
     deliberately blind to font size for exactly that reason. */
  const mottoCases=[
    ['a one-liner',  'Ashley, bold is your baseline.'],
    ['a typical motto','Ashley, you walk in and the room adjusts; your confidence is the accessory.'],
    ['at the 95-char prompt cap','Ashley, you wear the loudest thing in the room like it was quietly your own idea from the start.'],
    ['past the cap, four lines','Ashley, you wear the loudest thing in the room like it was quietly your own idea from the very start, and everyone follows.'],
  ];
  for(const [label,motto] of mottoCases){
    const drawn=await page.evaluate(async(m)=>{
      topArchNames=['The Statement Maker','The Bold Expressionist','The Modern Trendsetter'];
      userMotto=m;
      const proto=CanvasRenderingContext2D.prototype, real=proto.fillText;
      const seen=[];
      proto.fillText=function(t,x,y){seen.push({t:String(t),f:this.font});return real.apply(this,arguments)};
      try{ await new Promise(res=>buildCardBlob('quiz',bl=>res(bl))); }
      finally{ proto.fillText=real; }
      return seen.filter(s=>/Lora/.test(s.f)).map(s=>s.t);
    },motto);
    // the card wraps the motto across lines and wraps it in curly quotes
    const rebuilt=drawn.join(' ').replace(/[“”]/g,'').replace(/\s+/g,' ').trim();
    ok(rebuilt===motto, label+': the motto is drawn word for word, nothing trimmed'
       + (rebuilt===motto?'':' (got "'+rebuilt+'")'));
    ok(!/…/.test(rebuilt), label+': no ellipsis was added to her words');
  }

  /* ── Part 3c: THE LOGO WEARS THE SAME STAR AS THE MIDDLE ──────────────────
     Her call: the flat outline star drawn into logo-tight.png is lifted out and
     the shiny gold one with the silver edge takes its place, at the same size,
     so the sheet carries one mark used twice instead of two different stars.
     Two things can go wrong and neither is visible in code review: the surgery
     can miss and leave a ghost outline behind, or the replacement can land off
     centre or at the wrong size. Both are measured here. */
  const logoStar=await page.evaluate(async()=>{
    topArchNames=['The Statement Maker','The Bold Expressionist','The Modern Trendsetter'];
    userMotto='Ashley, you walk in and the room adjusts; your confidence is the accessory.';
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    const buf=await blob.arrayBuffer();
    let s='';const u=new Uint8Array(buf);
    for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
    return {b64:btoa(s)};
  });
  /* ⚠️ NO ASSERTION ON THE logoStarCut FLAG. It lives inside buildCardBlob's own
     closure, so page.evaluate cannot see it - the first version of this test
     asserted on it and failed while the swap was working perfectly. The pixel
     evidence below is the stronger proof anyway: a flag says the code ran, the
     filled-not-hollow check says the RESULT is right. */
  {
    const p=png(Buffer.from(logoStar.b64,'base64'));
    const rgb=(x,y)=>{const i=(y*p.w+x)*p.bpp;return [p.px[i],p.px[i+1],p.px[i+2]]};
    const sat=c=>Math.max(...c)-Math.min(...c);
    /* Rows 88..140 only: below that the top of the "s" in "style" enters the
       window and would widen every measurement. ⚠️ Derived from the artwork's
       own inkTop, not picked by eye - the same stale-probe trap this suite has
       already been bitten by three times. */
    let x0=1e9,x1=-1,y0=1e9,y1=-1;
    for(let y=88;y<=140;y++)for(let x=460;x<=640;x++){
      const c=rgb(x,y),lum=0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
      if(sat(c)>45||lum<215){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    }
    const wid=x1-x0+1, mid=(x0+x1)/2;
    /* The star it replaced measured 55px wide, centred on 540. The shiny one
       comes out 57 because its silver rim strokes OUTSIDE the gold the old
       outline was made of - so a couple of pixels wider is correct, and a big
       change is not. */
    ok(Math.abs(wid-55)<=4,'the logo star kept its size ('+wid+'px against the drawn star’s 55)');
    ok(Math.abs(mid-540)<=1,'the logo star is centred on the card (centre '+mid+')');
    /* THE GHOST TEST, and it is the one that matters: the drawn star was an
       OUTLINE, so its middle was bare paper. The shiny star is FILLED. Sampling
       the body proves the swap really happened rather than a new star being
       drawn on top of the old one. */
    const body=rgb(540,130);
    ok(sat(body)>45,'the logo star is filled, not the old hollow outline (centre sat '+sat(body)+')');
    // and it is the SAME gold as the star in the middle of the card
    let best=[0,0,0],bs=-1;
    for(let y=960;y<=1010;y++)for(let x=500;x<=580;x++){
      const c=rgb(x,y);if(sat(c)>bs){bs=sat(c);best=c}
    }
    let lbest=[0,0,0],lbs=-1;
    for(let y=100;y<=140;y++)for(let x=505;x<=575;x++){
      const c=rgb(x,y);if(sat(c)>lbs){lbs=sat(c);lbest=c}
    }
    /* ⚠️ COMPARE HUE, NOT RGB. The two stars are the same radial gradient at two
       SIZES, so the most-saturated pixel in each lands at a different point on
       the ramp - the first version of this test demanded the raw values match
       within 6 and failed on a perfectly correct card (logo 230,184,69 against
       middle 234,190,77, which is the same gold a little further along). Hue is
       what "the same gold" actually means, and it survives the scale. */
    const hue=c=>{const mx=Math.max(...c),mn=Math.min(...c),d=mx-mn;
      if(!d)return 0;
      const h=mx===c[0]?((c[1]-c[2])/d)%6:mx===c[1]?(c[2]-c[0])/d+2:(c[0]-c[1])/d+4;
      return (h*60+360)%360;};
    const dh=Math.abs(hue(best)-hue(lbest));
    ok(dh<=2,'both stars are the same gold (hue '+hue(lbest).toFixed(1)+'° vs '+hue(best).toFixed(1)+'°)');
  }

  /* ── Part 3d: ONE GOLD ON THE WHOLE SHEET ────────────────────────────────
     ⚠️ THIS TEST WAS WRONG ONCE AND THE CORRECTION IS THE POINT OF IT. It first
     compared each mark's MOST SATURATED pixel, which drove the flat slider to
     the star's deepest stop (#E6B845, hue 42.9°) - and a flat line at the
     deepest gold in a gradient reads ORANGE, which is exactly what she saw.
     A star's deepest stop is a terminal nobody's eye picks out.
     ▶ So every mark is measured by the AVERAGE of its gold, which is what the
     eye integrates: both stars read #F4DC90 at ~45.6°, and the flat marks sit
     at 47.5°. Two degrees is comfortably inside the range where two golds still
     read as one; five degrees is where they visibly part, which is what the
     broken version produced. */
  {
    const p=png(Buffer.from(logoStar.b64,'base64'));
    const rgb=(x,y)=>{const i=(y*p.w+x)*p.bpp;return [p.px[i],p.px[i+1],p.px[i+2]]};
    const hue=c=>{const mx=Math.max(...c),mn=Math.min(...c),d=mx-mn;
      if(!d)return 0;
      const h=mx===c[0]?((c[1]-c[2])/d)%6:mx===c[1]?(c[2]-c[0])/d+2:(c[0]-c[1])/d+4;
      return (h*60+360)%360;};
    const marks=[['the logo star',100,142,505,578],['the logo slider',277,296,430,660],
                 ['the star in the middle',950,1022,495,590],
                 ['the hairline above the CTA',1330,1345,420,660]];
    const hues=[];
    for(const [label,y0,y1,x0,x1] of marks){
      let t=[0,0,0],n=0;
      for(let y=y0;y<=y1;y++)for(let x=x0;x<x1;x++){
        const c=rgb(x,y);
        if(Math.max(...c)-Math.min(...c)>40){t=[t[0]+c[0],t[1]+c[1],t[2]+c[2]];n++}
      }
      ok(n>200,label+' is drawn at all ('+n+' gold px)');
      const mean=t.map(v=>Math.round(v/n));
      ok(Math.max(...mean)-Math.min(...mean)>80,
         label+' is a real gold, not something that went grey (sat '+(Math.max(...mean)-Math.min(...mean))+')');
      hues.push([label,hue(mean)]);
    }
    const spread=Math.max(...hues.map(h=>h[1]))-Math.min(...hues.map(h=>h[1]));
    ok(spread<=3,'every gold on the card reads as the same gold, spread '+spread.toFixed(1)+'° ('+
       hues.map(h=>h[0]+' '+h[1].toFixed(1)+'°').join(', ')+')');
    /* And the direction is pinned, not just the distance: the flat marks must
       never fall BELOW the stars' hue, because that is the orange side. */
    const stars=hues.filter(h=>/star/.test(h[0])).map(h=>h[1]);
    const flats=hues.filter(h=>!/star/.test(h[0])).map(h=>h[1]);
    ok(Math.min(...flats)>=Math.min(...stars)-0.5,
       'the flat gold marks sit on the yellow side of the stars, never the orange side');
  }

  /* ── Part 3e: THE CARD IS NEVER SHOWN DISTORTED ──────────────────────────
     Her catch: "the size looks weird when I click on it... after it is texted
     it looks normal." That split is the whole diagnosis - the FILE was right
     and our own preview was wrong. Both places that show the card carried an
     aspect-ratio of 1080/1350, left over from when the card was 4:5:
       - the thumbnail had object-fit:cover, so it CROPPED, and what it cut was
         the bottom, i.e. stylestar.app
       - the overlay had NO object-fit, and an img with a forced aspect-ratio
         and no object-fit STRETCHES, so her card was painted squashed wide
     ⚠️ THIS IS ASSERTED AGAINST THE IMAGE'S OWN naturalWidth/naturalHeight, not
     against 1080/1920 typed a third time. Change the card's proportions and
     these boxes have to follow or this fails, which is the point. */
  const boxes=await page.evaluate(async()=>{
    userName='Ashley'; answers=[6,6,6,6,6,6,6,6,6,6,6,6];
    topArchNames=['The Statement Maker','The Bold Expressionist','The Modern Trendsetter'];
    userMotto='Ashley, you walk in and the room adjusts; your confidence is the accessory.';
    const rp=document.getElementById('rp'); if(rp)rp.textContent='A portrait sentence.';
    show('s-res'); document.getElementById('s-res').classList.add('rv-open');
    await new Promise(r=>setTimeout(r,150));
    const blob=await new Promise(r=>buildCardBlob('quiz',b=>r(b)));
    const th=document.getElementById('scThumb');
    th.src=URL.createObjectURL(blob);
    await new Promise(r=>{th.complete?r():th.onload=r});
    const t=document.querySelector('.sc-thumb').getBoundingClientRect();
    saveStyleCard('quiz');
    await new Promise(r=>setTimeout(r,2200));
    const img=document.querySelector('#cardPreview .scCard');
    const o=img.getBoundingClientRect();
    const nat=img.naturalHeight/img.naturalWidth;
    const bottom=o.bottom, vh=innerHeight;
    /* ⚠️ READ EVERY COMPUTED VALUE BEFORE CLOSING. The first version of this
       closed the overlay and then built the return object, so getComputedStyle
       ran on a DETACHED element and reported no object-fit at all - a failure
       on a perfectly correct rule. Several sightings of this shape now. */
    const out={thumb:t.height/t.width, overlay:o.height/o.width, nat:nat,
               fit:getComputedStyle(img).objectFit,
               thumbFit:getComputedStyle(th).objectFit, bottom:bottom, vh:vh};
    if(typeof closeCardPreview==='function')closeCardPreview();
    return out;
  });
  ok(Math.abs(boxes.overlay-boxes.nat)<0.02,
     'the overlay shows the card at its own proportions, never stretched (box '+
     boxes.overlay.toFixed(3)+' against the file’s '+boxes.nat.toFixed(3)+')');
  ok(Math.abs(boxes.thumb-boxes.nat)<0.02,
     'the thumbnail box is the card’s shape, so nothing is cropped off it (box '+
     boxes.thumb.toFixed(3)+' against '+boxes.nat.toFixed(3)+')');
  /* object-fit:contain on both is the SAFETY NET, not the fix: if the card's
     proportions ever change and these boxes are not updated, the card
     letterboxes visibly instead of being silently squashed or trimmed. */
  ok(boxes.fit==='contain','the overlay letterboxes rather than distorting if the ratio ever drifts');
  ok(boxes.thumbFit==='contain','the thumbnail letterboxes rather than cropping if the ratio ever drifts');
  ok(boxes.bottom<=boxes.vh,'the whole card fits on screen above the controls ('+
     Math.round(boxes.bottom)+'px of '+boxes.vh+')');

  // ── Part 4: the caption carries her archetype and a tappable link ─────────
  const cap=await page.evaluate(()=>{
    const src=buildCardBlob.toString();
    return doShareCard.toString();
  });
  ok(/_arch/.test(cap),'the caption carries her archetype');
  ok(/free style quiz/.test(cap),'the caption says what it is, not just what she got');
  ok(/real personal stylist/.test(cap),'the caption carries the real-stylist difference');
  ok(/https:\/\/stylestar\.app/.test(cap),
     'the caption carries the https:// form — a bare .app is not auto-linked');
  /* ⚠️ HARNESS BUG, caught on the first run and worth the note: this asserted
     against everything AFTER "const linkText", which swept in the desktop
     fallback alert() and its ✨. That emoji is in a message only the woman
     herself sees, not in what her friend receives. Scope the assertion to the
     caption expression itself. "A test that fails on a correct value is usually
     a broken harness" — several sightings in this project now. */
  const capLine=(cap.match(/const linkText=[^;]*/)||[''])[0];
  ok(capLine.length>0,'the caption expression was found');
  /* ⚠️ THE URL MUST BE THE LAST THING IN THE CAPTION, and this is the assertion
     that matters most about sharing. Messages lifts a TRAILING url out of the
     message text and renders it as a rich preview card - the logo, the tagline,
     a big tappable target - which is what actually reaches her friend. Move the
     url into the middle of a sentence and that card is very likely replaced by
     a line of blue text, a weaker door. Confirmed on her own phone 2026-08-23,
     where the first caption produced exactly that card.
     ▶ It is checked by BUILDING the real caption rather than reading the source,
     so a change to how the string is assembled cannot slip past it. */
  const builtCap=await page.evaluate(()=>{
    topArchNames=['The Modern Trendsetter','The Bold Expressionist'];
    const _arch=topArchNames[0];
    const src=doShareCard.toString();
    const m=src.match(/const linkText=([\s\S]*?);\n/);
    return m?eval(m[1]):'';
  });
  ok(/^https:\/\/stylestar\.app$/.test(builtCap.trim().split(/\s+/).pop()),
     'the url is the LAST thing in the caption, so Messages renders it as a preview card ("'+builtCap+'")');
  ok(builtCap.indexOf('The Modern Trendsetter')>-1,'the built caption really names her archetype');
  ok(!/[\u2600-\u27BF\uD83C-\uDBFF]/.test(capLine),'no emoji in the caption a friend receives');

  ok(errors.length===0,'zero JS errors ('+errors.join(' | ')+')');

  console.log('\nstarcard: '+pass+' checks, '+fail+' failures');
  await browser.close();srv.close();
  process.exit(fail?1:0);
})();
