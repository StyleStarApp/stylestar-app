/* ── scratchpad/mottoboot.mjs ────────────────────────────────────────────────
   HER REPRO, 2026-08-23: "the first time I clicked on it there was no motto but
   then i checked again and it was there."
   Cold boot -> lands on Welcome Back -> Menu -> Style Star Card, WITHOUT ever
   opening the Style Portrait. That path did not exist until the Menu row shipped
   the same day, and it was the first way to reach the card without passing
   through the screen that hydrates her motto.
   ⚠️ This suite must FAIL on the pre-fix code. A regression test that passes
   both before and after is testing nothing; it is run against the old file
   below to prove it. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import zlib from 'zlib';
const ROOT=process.cwd(),PORT=8991;
let pass=0,fail=0;
const ok=(c,m)=>{ if(c){pass++;console.log('  ok   '+m)} else {fail++;console.log('  FAIL '+m)} };

let serveFile=process.env.TARGET||'index.html';
const srv=http.createServer((q,r)=>{
  let u=decodeURIComponent(q.url.split('?')[0]); if(u==='/')u='/'+serveFile;
  fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{ if(e){r.writeHead(404);r.end();return}
    r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json','.woff2':'font/woff2'}[path.extname(u)]||'application/octet-stream'});r.end(b)});
});

function png(buf){let pos=8,idat=Buffer.alloc(0),w=0,h=0,ct=0;
 while(pos<buf.length){const ln=buf.readUInt32BE(pos),typ=buf.toString('ascii',pos+4,pos+8);
  if(typ==='IHDR'){w=buf.readUInt32BE(pos+8);h=buf.readUInt32BE(pos+12);ct=buf[pos+17]}
  if(typ==='IDAT')idat=Buffer.concat([idat,buf.slice(pos+8,pos+8+ln)]);pos+=12+ln}
 const bpp={0:1,2:3,4:2,6:4}[ct],raw=zlib.inflateSync(idat),stride=w*bpp;
 const out=Buffer.alloc(h*stride);let prev=Buffer.alloc(stride),i=0;
 for(let y=0;y<h;y++){const ft=raw[i++];const line=Buffer.from(raw.slice(i,i+stride));i+=stride;
  for(let x=0;x<stride;x++){const a=x>=bpp?line[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;
   if(ft===1)line[x]=(line[x]+a)&255;else if(ft===2)line[x]=(line[x]+b)&255;
   else if(ft===3)line[x]=(line[x]+((a+b)>>1))&255;
   else if(ft===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    line[x]=(line[x]+(pa<=pb&&pa<=pc?a:pb<=pc?b:c))&255}}
  line.copy(out,y*stride);prev=line}
 return {w,h,bpp,px:out}}

const SEED={userName:'Catherine',answers:new Array(12).fill(6),
  topArchNames:['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'],
  portrait:'You are the woman other people watch to see what is next.',
  motto:"Catherine, you don't follow the moment, you are the moment."};

async function run(label){
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.route('https://fonts.googleapis.com/**',async r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')}));
  await page.route('https://fonts.googleapis.com/*.woff2',async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)})});
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.route('**/.netlify/functions/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
  // a COLD boot with saved results: exactly what she opens the app to
  await page.addInitScript(d=>localStorage.setItem('ss_data',JSON.stringify(d)),SEED);
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1600);

  console.log('\n'+label);
  ok(await page.evaluate(()=>document.querySelector('.scr.act').id==='s-wb'),
     'a cold boot with saved results lands on Welcome Back, portrait never opened');
  ok(await page.evaluate(()=>!document.getElementById('rp').textContent.trim()),
     '#rp really is empty on this path (the DOM cannot be the motto source here)');

  const b64=await page.evaluate(async()=>{
    menuOpen();
    const row=[...document.querySelectorAll('.menu-row')].find(r=>r.textContent.trim()==='Style Star Card');
    if(!row)return null;
    row.click();
    await new Promise(r=>setTimeout(r,1800));
    const img=document.querySelector('#cardPreview .scCard');
    if(!img)return null;
    const c=document.createElement('canvas');
    const nat=await new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src=img.src});
    c.width=nat.naturalWidth;c.height=nat.naturalHeight;
    c.getContext('2d').drawImage(nat,0,0);
    return c.toDataURL('image/png').split(',')[1];
  });
  ok(!!b64,'the Menu row drew a card from a cold boot');

  /* The state is the cause, so it is asserted directly: on this path the OLD
     code left userMotto empty, which is the whole bug. */
  ok(!!(await page.evaluate(()=>typeof userMotto!=='undefined'&&userMotto)),
     'her motto is in memory on a cold boot, without opening the portrait');

  if(b64){
    const p=png(Buffer.from(b64,'base64'));
    const at=(x,y)=>{const o=(y*p.w+x)*p.bpp;return [p.px[o],p.px[o+1],p.px[o+2]]};
    const lum=(x,y)=>p.px[(y*p.w+x)*p.bpp];
    /* ⚠️ THE MARKS ARE FOUND, NEVER PROBED AT A FIXED PERCENTAGE — and the first
       version of this check did probe a fixed band and PASSED ON THE BROKEN
       FILE, which is exactly how a regression test comes to prove nothing.
       Removing the motto MOVES EVERYTHING on the card, because the layout shares
       its leftover air across every seam, so any fixed y is measuring a
       different part of the sheet in the two cases. ▶ Same lesson as the five
       stale pixel probes of 2026-08-23: scan, cluster, identify by shape.
       Her motto sits between two GOLD landmarks - the star above it and the tail
       rule below it - so those are found first and the ink is counted between. */
    const goldRows=[];
    for(let y=0;y<p.h;y++){
      let n=0;
      for(let x=120;x<p.w-120;x+=2){
        const c=at(x,y),mx=Math.max(...c),mn=Math.min(...c);
        if(mx-mn>=45&&c[0]>140&&c[2]<mx-30)n++;
      }
      if(n>0)goldRows.push([y,n]);
    }
    const bands=[];
    for(const [y,n] of goldRows){
      const b=bands[bands.length-1];
      if(b&&y-b.y1<=3){b.y1=y;b.max=Math.max(b.max,n)} else bands.push({y0:y,y1:y,max:n});
    }
    // the star is TALL, the rule is THIN and wide - identified by shape, not by y
    const star=bands.filter(b=>b.y1-b.y0>18).sort((a,b)=>a.y0-b.y0).pop();
    const rule=bands.filter(b=>b.y1-b.y0<=6&&b.max>20&&star&&b.y0>star.y1+10).sort((a,b)=>a.y0-b.y0)[0];
    ok(!!star&&!!rule,'found the gold star and the tail rule that bracket her motto');
    if(star&&rule){
      let inkRows=0,widest=0;
      for(let y=star.y1+8;y<rule.y0-8;y++){
        let first=-1,last=-1;
        for(let x=90;x<p.w-90;x+=2) if(lum(x,y)<150){ if(first<0)first=x; last=x }
        if(first>-1){inkRows++; widest=Math.max(widest,last-first)}
      }
      ok(inkRows>20,'real text sits between them, not empty quote marks ('+inkRows+' ink rows)');
      ok(widest>240,'and it spans the sheet like a sentence ('+widest+'px, quotes alone are ~30)');
    }
  }
  ok(errs.length===0,'zero JS errors ('+errs.join(' | ')+')');
  await b.close();
  return {pass,fail};
}

await new Promise(r=>srv.listen(PORT,r));
await run('HER REPRO — cold boot, Menu row, no portrait visit');
/* ⚠️ AND THE HALF THAT MAKES IT A REGRESSION TEST: the same drive is run against
   the file as it was WHEN SHE PHOTOGRAPHED THE BUG. If that run passes, this
   suite is not testing what it claims to and the assertions above are decoration.
   Pass PROVE_OLD=1 to run it; it needs scratchpad/_old.html, which is gitignored
   and regenerated with: git show f79407f:index.html > scratchpad/_old.html */
if(process.env.PROVE_OLD){
  const realPass=pass, realFail=fail;      // the run that counts, kept whole
  pass=0; fail=0;
  serveFile='scratchpad/_old.html';
  await run('CONTROL — the same drive against the pre-fix file (MUST fail)');
  const brokeOnOld=fail>0;
  pass=realPass; fail=realFail;            // the control's tally is not the suite's
  console.log('\ncontrol: the pre-fix file '+(brokeOnOld?'FAILED as it must':'PASSED — this suite proves nothing'));
  if(!brokeOnOld){console.log('mottoboot: CONTROL DID NOT BREAK, treating as a failure');process.exit(1)}
}
console.log('\nmottoboot: '+pass+' checks, '+fail+' failures');
srv.close();
process.exit(fail?1:0);
