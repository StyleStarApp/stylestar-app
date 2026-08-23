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

/* THE CARD'S SHAPE, IN ONE PLACE. Every assertion about size in this suite
   reads these, so changing the card means changing one line here and not
   hunting for a number typed in three spots. Her call 2026-08-23: 4:5, the
   shape a shared image normally comes in. */
const CARD_W=1080,CARD_H=1350;

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

  /* ⚠️ THE WORD "ARCHETYPE" NEVER APPEARS IN COPY. Her call 2026-08-23. It is
     the word the code thinks in - topArchNames, archLines, ARCHETYPE_FAMILY -
     and that is fine, but a woman reads "MY STYLE IS" on the card and should
     read the same language everywhere else.
     ▶ Checked against the MARKUP with scripts and comments stripped, not
     against innerText: the FAQ answer and the privacy policy live on screens
     that are hidden until she navigates to them, so innerText cannot see them
     and the check would pass vacuously. Two of the four places this was found
     were on exactly those screens. */
  {
    const raw=await (await fetch(`http://localhost:${PORT}/`)).text();
    const copyOnly=raw
      .replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<!--[\s\S]*?-->/g,' ');
    const hits=(copyOnly.match(/archetype/gi)||[]);
    ok(hits.length===0,'no copy anywhere says "archetype" ('+hits.length+' found)');
  }

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
    if(p.w!==CARD_W||p.h!==CARD_H){ok(false,name+': card is '+p.w+'x'+p.h+', not '+CARD_W+'x'+CARD_H);continue}

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
    /* ⚠️⚠️ THIS ASSERTION HAS BEEN RE-TUNED THREE TIMES, WHICH MEANS IT WAS THE
       WRONG ASSERTION. It pinned a bare number for the gap under the address, so
       every change to the foot margin broke it on a correct card - the fourth
       flavour of the stale-probe trap in this suite.
       ▶ What she actually cares about is BALANCE, and she proved it: she caught
       the logo sitting 2px off the frame while the address had 32px below it,
       from a phone screenshot. So measure BOTH gaps and compare them to each
       other. That is her eye, written down, and it needs no editing when a
       margin moves. */
    /* ⚠️ THE TOP GAP IS MEASURED WITH A WIDER PROBE THAN `rows` USES, and that
       is the point rather than an inconsistency. `rows` counts DARK ink, which
       is right for finding overlapping type - but the topmost thing on this card
       is the pale gold tip of the logo star, which is nowhere near dark. Measured
       the dark-only way the gap reads 69px; measured the way an eye sees it, 30.
       She caught this from a phone screenshot, so the probe has to see what she
       saw: anything that is not paper. */
    const notPaper=(x,y)=>{
      const i=(y*p.w+x)*p.bpp,r=p.px[i],g=p.px[i+1],b=p.px[i+2];
      return (0.2126*r+0.7152*g+0.0722*b)<215||(Math.max(r,g,b)-Math.min(r,g,b))>45;
    };
    let firstMark=-1;
    for(let y=PAPER_EDGE+2;y<p.h/2&&firstMark<0;y++)
      for(let x=PAPER_EDGE+56;x<p.w-PAPER_EDGE-56;x++) if(notPaper(x,y)){firstMark=y;break}
    const gapTop=firstMark-PAPER_EDGE;
    const gapBottom=16+(rows.length-1-lastInk);
    ok(gapTop>12&&gapBottom>12,
       name+': neither end crowds the frame (top '+gapTop+'px, bottom '+gapBottom+'px)');
    ok(Math.abs(gapTop-gapBottom)<=20,
       name+': the card sits evenly between its edges (top '+gapTop+'px against bottom '+gapBottom+'px)');
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
  /* ⚠️ HER CALL 2026-08-23: 4:5, the shape a shared image normally comes in.
     An earlier version of this assertion pinned 1080x1920 and said in its own
     message that 4:5 "cuts off the address" - that was true of the proportions
     as they then were and was stated too broadly. The furniture around the
     words was tightened instead, and the address is asserted present on all 28
     archetypes above, so this pins the shape she chose. */
  ok(dims.w===CARD_W&&dims.h===CARD_H,
     'the card is '+CARD_W+'x'+CARD_H+', the 4:5 she picked (got '+dims.w+'x'+dims.h+')');

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
  /* ⚠️ AND NO DASH SURVIVES ONTO THE CARD. Her house style has none, the quiz
     prompt says so twice, and the model wrote an em dash into a real woman's
     motto anyway - which is why _noDash exists in code rather than as a firmer
     instruction. This drives a dashed motto through the real card and reads the
     words back off the canvas. */
  {
    const dashed='Your prints, your colors, your curves — effortless was always the plan.';
    const drawn=await page.evaluate(async(m)=>{
      topArchNames=['The Easygoing Natural','The Vibrant Athlete','The Sunny Classic'];
      userMotto=m;
      const proto=CanvasRenderingContext2D.prototype, real=proto.fillText;
      const seen=[];
      proto.fillText=function(t,x,y){seen.push({t:String(t),f:this.font});return real.apply(this,arguments)};
      try{ await new Promise(res=>buildCardBlob('quiz',bl=>res(bl))); }
      finally{ proto.fillText=real; }
      return seen.filter(s=>/Lora/.test(s.f)).map(s=>s.t).join(' ');
    },dashed);
    ok(!/[—–]/.test(drawn),'no em or en dash reaches the card ("'+drawn+'")');
    ok(!/\s-\s/.test(drawn),'no spaced hyphen reaches the card either');
    ok(/your curves, effortless/.test(drawn.replace(/[“”]/g,'')),
       'the dash became a comma rather than being deleted, so the sentence still reads');
  }

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

  /* ── Part 3c/3d: THE GOLD MARKS, FOUND RATHER THAN LOOKED UP ──────────────
     There are four gold marks on the card: the star on the logo, the slider
     under the wordmark, her star in the middle, and the hairline above the CTA.
     Two claims are made about them - the logo wears the SAME star as the middle
     (her call), and every gold on the sheet reads as ONE gold (her call, after
     a flat line matched to the star's deepest stop came out orange).

     ⚠️⚠️ THESE USED TO SAMPLE FIXED y WINDOWS AND ALL ELEVEN ASSERTIONS BROKE
     THE MOMENT THE CARD WENT 4:5, on a card that was perfectly correct. That is
     the FIFTH time in this suite that a hardcoded pixel window has gone stale
     the first time the layout moved. The bands are FOUND now: scan for gold,
     cluster by row, and reason about what turns up. Nothing here needs editing
     when the card is resized again. */
  const cardShot=await page.evaluate(async()=>{
    topArchNames=['The Statement Maker','The Bold Expressionist','The Modern Trendsetter'];
    userMotto='Ashley, you walk in and the room adjusts; your confidence is the accessory.';
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    const buf=await blob.arrayBuffer();
    let s='';const u=new Uint8Array(buf);
    for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
    return btoa(s);
  });

  const marks=(function(p){
    const rgb=(x,y)=>{const i=(y*p.w+x)*p.bpp;return [p.px[i],p.px[i+1],p.px[i+2]]};
    const sat=c=>Math.max(...c)-Math.min(...c);
    // warm and saturated: gold, and nothing else on this paper is
    const isGold=c=>sat(c)>45&&c[0]>=c[1]&&c[1]>c[2]&&(c[0]-c[2])>50;
    const rowsG=[];
    for(let y=0;y<p.h;y++){
      let n=0,minX=1e9,maxX=-1;
      for(let x=70;x<p.w-70;x++){const c=rgb(x,y);if(isGold(c)){n++;if(x<minX)minX=x;if(x>maxX)maxX=x}}
      rowsG.push({y,n,minX,maxX});
    }
    const bands=[];let cur=null;
    for(const r of rowsG){
      if(r.n>0){
        if(cur&&r.y-cur.y1<=8){cur.y1=r.y;cur.n+=r.n;cur.minX=Math.min(cur.minX,r.minX);cur.maxX=Math.max(cur.maxX,r.maxX)}
        else {if(cur)bands.push(cur);cur={y0:r.y,y1:r.y,n:r.n,minX:r.minX,maxX:r.maxX}}
      }
    }
    if(cur)bands.push(cur);
    // the mean of each band's gold is what the eye reads, not its deepest pixel
    for(const b of bands){
      let t=[0,0,0],k=0;
      for(let y=b.y0;y<=b.y1;y++)for(let x=b.minX;x<=b.maxX;x++){
        const c=rgb(x,y); if(isGold(c)){t=[t[0]+c[0],t[1]+c[1],t[2]+c[2]];k++}
      }
      b.mean=t.map(v=>Math.round(v/k));
      b.h=b.y1-b.y0+1; b.w=b.maxX-b.minX+1; b.cx=(b.minX+b.maxX)/2;
    }
    return {bands,rgb,sat};
  })(png(Buffer.from(cardShot,'base64')));

  const hue=c=>{const mx=Math.max(...c),mn=Math.min(...c),d=mx-mn;
    if(!d)return 0;
    const h=mx===c[0]?((c[1]-c[2])/d)%6:mx===c[1]?(c[2]-c[0])/d+2:(c[0]-c[1])/d+4;
    return (h*60+360)%360;};

  ok(marks.bands.length===4,
     'the card carries its four gold marks: the logo star, the slider, the star in the middle and the hairline ('
     +marks.bands.length+' found: '+marks.bands.map(b=>b.y0+'-'+b.y1).join(', ')+')');

  if(marks.bands.length===4){
    /* A STAR IS TALL, A RULE IS THIN, and that is how each band is identified -
       by shape rather than by where it happens to sit, so the card can be
       reordered or resized without this needing a thought. */
    const stars=marks.bands.filter(b=>b.h>20), flats=marks.bands.filter(b=>b.h<=20);
    ok(stars.length===2&&flats.length===2,
       'two of them are stars and two are flat rules ('+marks.bands.map(b=>b.h+'px').join(', ')+')');

    const logoStarB=stars[0], midStarB=stars[1];
    ok(Math.abs(logoStarB.cx-CARD_W/2)<=2,
       'the logo star is centred on the card (centre '+logoStarB.cx+')');
    ok(Math.abs(midStarB.cx-CARD_W/2)<=2,
       'the star in the middle is centred on the card (centre '+midStarB.cx+')');

    /* THE ONE THAT PROVES THE SWAP HAPPENED: the star drawn into logo-tight.png
       is an OUTLINE with bare paper in its middle, and hers is FILLED. Sampling
       the body of the band is what tells the two apart - and it is sampled from
       the band's own centre, so it does not care where the star has moved to. */
    const body=marks.rgb(Math.round(logoStarB.cx),Math.round((logoStarB.y0+logoStarB.y1)/2));
    ok(marks.sat(body)>45,
       'the logo star is filled, not the drawn outline it replaced (centre sat '+marks.sat(body)+')');

    /* HER STAR IS THE LOGO'S STAR: same shape drawn at two sizes, so what has
       to match is the PROPORTION, not the pixel count. Both are measured
       against their own band, so this holds at any card size. */
    const ratio=r=>r.w/r.h;
    ok(Math.abs(ratio(logoStarB)-ratio(midStarB))<0.12,
       'both stars are the same star, drawn at two sizes (aspect '+ratio(logoStarB).toFixed(2)
       +' vs '+ratio(midStarB).toFixed(2)+')');

    /* ⚠️ HUE, NOT RGB, AND THE MEAN, NOT THE DEEPEST PIXEL. Both traps were
       walked into: the stars are one gradient at two sizes so their brightest
       pixels are never byte-identical, and matching a flat line to a star's
       DEEPEST stop is what put an orange slider on the card. What the eye reads
       is the average. */
    const hues=marks.bands.map(b=>hue(b.mean));
    const spread=Math.max(...hues)-Math.min(...hues);
    ok(spread<=3,'every gold on the card reads as the same gold, spread '+spread.toFixed(1)
       +'° ('+hues.map(h=>h.toFixed(1)+'°').join(', ')+')');
    for(const b of marks.bands)
      ok(marks.sat(b.mean)>80,'a gold mark at y'+b.y0+' is a real gold, not something that went grey (sat '
         +marks.sat(b.mean)+')');
    /* And the DIRECTION is pinned, not just the distance: a flat mark may never
       fall below the stars' hue, because that is the orange side. */
    const starHue=Math.min(...stars.map(b=>hue(b.mean)));
    ok(Math.min(...flats.map(b=>hue(b.mean)))>=starHue-0.5,
       'the flat gold marks sit on the yellow side of the stars, never the orange side');
  }

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
  /* ⚠️ AND THE MESSAGE MUST STILL READ WHEN THE URL IS GONE. Messages does not
     merely linkify a trailing url, it REMOVES it from the body and puts it in
     the preview card - so the first version of this caption arrived as
     "...Find your Style Star at", ending on a dangling preposition. Her catch.
     This is the assertion that would have caught it. */
  const asSent=builtCap.replace(/\s*https?:\/\/\S+\s*$/,'').trim();
  ok(/[.!?]$/.test(asSent),
     'the caption still reads as a finished message once Messages takes the url out ("'+asSent+'")');
  ok(!/\b(at|to|from|with|on|for|in|and)[.!?]?$/i.test(asSent),
     'it does not end on a dangling preposition once the url is removed');
  ok(builtCap.indexOf('The Modern Trendsetter')>-1,'the built caption really names her archetype');
  ok(!/[\u2600-\u27BF\uD83C-\uDBFF]/.test(capLine),'no emoji in the caption a friend receives');

  ok(errors.length===0,'zero JS errors ('+errors.join(' | ')+')');

  console.log('\nstarcard: '+pass+' checks, '+fail+' failures');
  await browser.close();srv.close();
  process.exit(fail?1:0);
})();
