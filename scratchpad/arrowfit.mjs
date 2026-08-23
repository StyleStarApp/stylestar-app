/* Does the restored arrow fit, and does it sit ON the line?
   ⚠️ The second question is not paranoia: a resized inline glyph dropping off
   its text line is a failure this project has already shipped once (the A2HS
   share chip), and EVERY positional check passed while it was wrong. Measure
   the glyph's centre against the centre of the words it follows. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8983;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.html':'text/html','.png':'image/png','.json':'application/json','.woff2':'font/woff2'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const W of [430,390,375,360,320]){
  const ctx=await b.newContext({viewport:{width:W,height:844},deviceScaleFactor:W===390?3:1});
  const page=await ctx.newPage();
  await page.route('https://fonts.googleapis.com/**',async r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')}));
  await page.route('https://fonts.googleapis.com/*.woff2',async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)})});
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(`http://localhost:${PORT}/`);await page.waitForTimeout(1400);
  const m=await page.evaluate(async(W)=>{
    userName='Catherine';
    topArchNames=['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'];
    userMotto="Catherine, you don't follow the moment, you are the moment.";
    const rp=document.getElementById('rp');
    if(rp)rp.textContent='You are the woman other people watch to see what is next.';
    show('s-res');document.getElementById('s-res').classList.add('rv-open');
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    document.getElementById('scThumb').src=URL.createObjectURL(blob);
    await new Promise(r=>setTimeout(r,500));
    const tt=document.querySelector('.sc-tt'),ar=tt.querySelector('.sc-ar');
    // lines: count UNIQUE rect tops, never rects (a rect is returned per element too)
    /* ⚠️ CLUSTER THE TOPS, do not count unique ones. getClientRects() returns a
       rect per ELEMENT as well as per text box, and an inline SVG legitimately
       sits a pixel or two off the text box's top - so exact unique tops report
       TWO LINES for a title that is provably one, which is precisely what this
       harness did on its first run. A real wrap moves a whole line-height
       (~19px); an inline mark's skew moves ~2. Cluster within 6. */
    const rng=document.createRange();rng.selectNodeContents(tt);
    const raw=Array.from(rng.getClientRects()).map(r=>r.top).sort((a,b)=>a-b);
    const tops=[];for(const t of raw) if(!tops.some(u=>Math.abs(u-t)<6)) tops.push(t);
    // the WORDS' own box, arrow excluded, so the comparison is honest
    /* Compare the arrow against the WORD IT FOLLOWS, not against the whole
       title: once the title wraps, a range over all of it spans two lines and
       its centre is meaningless. The arrow's own nowrap span holds that word. */
    const nb=tt.querySelector('.sc-nb');
    const wr=document.createRange();wr.setStart(nb.firstChild,0);wr.setEnd(nb.firstChild,nb.firstChild.length);
    const wb=wr.getBoundingClientRect(),ab=ar.getBoundingClientRect();
    const card=document.querySelector('.pcard').getBoundingClientRect();
    const row=document.querySelector('.sc-row').getBoundingClientRect();
    return {lines:tops.length,off:((ab.top+ab.bottom)/2-(wb.top+wb.bottom)/2).toFixed(2),
      arW:Math.round(ab.width),gap:(ab.left-wb.right).toFixed(1),
      overR:(card.right-row.right).toFixed(1),
      scrollW:document.documentElement.scrollWidth<=W};
  },W);
  console.log(`${String(W).padStart(3)}px  title ${m.lines} line(s) · arrow ${m.arW}px, `+
    `${m.off}px off the text centre, ${m.gap}px gap · no sideways scroll: ${m.scrollW}`);
  if(W===390) await page.locator('.pcard').screenshot({path:'scratchpad/built-panel-arrow.png'});
  if(W===320) await page.locator('.pcard').screenshot({path:'scratchpad/built-panel-320.png'});
  await ctx.close();
}
await b.close();srv.close();
