/* ── scratchpad/cardbuilt.mjs ────────────────────────────────────────────────
   The AS-BUILT card and the AS-BUILT Style Portrait panel.
   ⚠️ WHY THIS EXISTS AND IS NOT OPTIONAL: she picked the frame and the size from
   TWO SEPARATE renders, and neither one showed the combination. The frame now
   reaches the sheet's edge, and the thumbnail box used to carry a gold hairline
   ring on its inside — which would have landed directly ON the new silver. "A
   render is a PROMISE: diff the built page against the picked render before
   calling an option done." */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8981;
const srv=http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]); if(u==='/')u='/index.html';
  const f=path.join(ROOT,u.replace(/^\//,''));
  fs.readFile(f,(e,b)=>{ if(e){res.writeHead(404);res.end();return}
    const m={'.html':'text/html','.png':'image/png','.json':'application/json','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'}[path.extname(f)];
    res.writeHead(200,{'Content-Type':m||'application/octet-stream'});res.end(b)});
});
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.route('https://fonts.googleapis.com/**',async r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')}));
  await page.route('https://fonts.googleapis.com/*.woff2',async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)})});
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1500);

  // the real faces, proven, or the card's own text fitting means nothing
  const fp=await page.evaluate(async()=>{
    await Promise.all(['104px "DM Serif Display"','italic 400 46px "Lora"','600 38px "Jost"','400 33px "DM Sans"']
      .map(f=>document.fonts.load(f).catch(()=>{})));
    const c=document.createElement('canvas').getContext('2d');
    const w=s=>{c.font=s;return c.measureText('The Modern Trendsetter').width};
    return [w('72px "DM Serif Display", serif'),w('72px serif')];
  });
  if(Math.abs(fp[0]-fp[1])<=1) throw new Error('generic serif fallback — this render would be a lie');

  const b64=await page.evaluate(async()=>{
    userName='Catherine';
    topArchNames=['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'];
    userMotto="Catherine, you don't follow the moment, you are the moment.";
    const rp=document.getElementById('rp');
    if(rp)rp.textContent='You are the woman other people watch to see what is next.';
    show('s-res'); document.getElementById('s-res').classList.add('rv-open');
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    document.getElementById('scThumb').src=URL.createObjectURL(blob);
    const buf=await blob.arrayBuffer(); let s='';const u=new Uint8Array(buf);
    for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);
    return btoa(s);
  });
  fs.writeFileSync('scratchpad/built-card.png',Buffer.from(b64,'base64'));
  await page.waitForTimeout(700);
  await page.locator('.pcard').screenshot({path:'scratchpad/built-panel.png'});

  // the card as it lands in a WHITE message thread, where the old edge dissolved
  await page.setContent(`<body style="margin:0;background:#fff;display:flex;justify-content:center;padding:26px">
    <img src="data:image/png;base64,${b64}" style="width:270px;display:block">
    </body>`);
  await page.waitForTimeout(300);
  await page.screenshot({path:'scratchpad/built-onwhite.png'});

  // the Menu, with the new row
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1400);
  await page.evaluate(()=>{
    userName='Catherine';
    topArchNames=['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'];
    show('s-res'); document.getElementById('s-res').classList.add('rv-open');
    menuOpen();
  });
  await page.waitForTimeout(500);
  await page.locator('.menu-panel').screenshot({path:'scratchpad/built-menu.png'});

  console.log('JS errors:',errs.length?errs:'none');
  await b.close();srv.close();
})();
