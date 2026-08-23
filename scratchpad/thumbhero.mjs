import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8979;
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
  const page=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3})).newPage();
  await page.route('https://fonts.googleapis.com/**',async r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('scratchpad/fonts/gf.css','utf8')}));
  await page.route('https://fonts.googleapis.com/*.woff2',async r=>{
    const f=path.basename(new URL(r.request().url()).pathname);
    await r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('scratchpad/fonts/'+f)})});
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1400);
  await page.evaluate(async()=>{
    userName='Catherine';
    topArchNames=['The Modern Trendsetter','Golden Hour Enchantress','The Bold Expressionist'];
    userMotto="Catherine, you don't follow the moment, you are the moment.";
    const rp=document.getElementById('rp');
    if(rp)rp.textContent='You are the woman other people watch to see what is next.';
    show('s-res'); document.getElementById('s-res').classList.add('rv-open');
    const blob=await new Promise(res=>buildCardBlob('quiz',bl=>res(bl)));
    document.getElementById('scThumb').src=URL.createObjectURL(blob);
  });
  await page.waitForTimeout(900);
  // E: card centred and large, the words beneath it
  const h=await page.evaluate(()=>{
    const row=document.querySelector('.sc-row');
    row.style.flexDirection='column'; row.style.alignItems='center';
    row.style.textAlign='center'; row.style.gap='12px';
    const th=row.querySelector('.sc-thumb'); th.style.width='196px';
    const tt=row.querySelector('.sc-tt'); tt.innerHTML='See &amp; share your Style Star Card';
    row.querySelector('.sc-ar').style.display='none';
    return document.querySelector('.pcard').getBoundingClientRect().height.toFixed(0);
  });
  await page.waitForTimeout(300);
  console.log('E hero panel height:',h+'px');
  await page.locator('.pcard').screenshot({path:'scratchpad/thumb-hero.png'});
  await b.close();srv.close();
})();
