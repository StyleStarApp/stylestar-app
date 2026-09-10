// wdrshot.mjs — render the Wardrobe "Ideas" shelf at true phone size, BOTH
// orders, so she can decide by LOOKING. Her own rule, 2026-09-09:
// "MEASURE TO FIND CANDIDATES, RENDER THEM ALL, AND LET HER LOOK."
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8987;
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream'});
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));

// ▶ Real-looking pieces so the picture is honest about what she would see.
const IDEAS = { items: [
  {category:'top', name:'Silk Charmeuse Blouse',      search:'silk charmeuse blouse', store:'Nordstrom'},
  {category:'top', name:'Cotton Poplin Shirt',        search:'cotton poplin shirt',   store:'Everlane'},
  {category:'top', name:'Pleated Bib Blouse',         search:'pleated bib blouse',    store:'Boden'},
  {category:'top', name:'Relaxed Linen Shirt',        search:'relaxed linen shirt',   store:'Cuyana'},
  {category:'top', name:'Tie-Neck Blouse',            search:'tie neck blouse',       store:'Ann Taylor'},
  {category:'top', name:'Ruffle-Trim Blouse',         search:'ruffle trim blouse',    store:'Talbots'}]};
const px = i => `https://placehold.co/300x400/f3efe7/26221c?text=Blouse+${i}`;
const prod = (i, store, title, price, feed) => ({
  id: 'p'+i, title, store, brand: store, price, image: px(i),
  name: title, search: title, ...(feed ? {feed:true, url:'https://example.com/p'+i} : {}) });
const FIND = { exact: [], doors: [], browse: [
  prod(1,'Mytheresa',"Toteme Silk Crepe Blouse",'$690', true),
  prod(2,'FARM Rio', 'Off-White Cotton Blouse', '$180', true),
  prod(3,'Nordstrom','Open Edit Poplin Shirt',  '$59'),
  prod(4,'Everlane', 'The Silky Cotton Shirt',  '$78'),
  prod(5,'Boden',    'Sienna Pleated Blouse',   '$110'),
  prod(6,'Talbots',  'Tie-Neck Georgette Top',  '$89')]};

const b = await chromium.launch();
async function shot(label, flip) {
  const ctx = await b.newContext({viewport:{width:390,height:1500}, deviceScaleFactor:2});
  const pg = await ctx.newPage();
  await pg.route(u => u.pathname.includes('style-ai'), r => r.fulfill({status:200,
    contentType:'application/json', body: JSON.stringify({content:[{text:JSON.stringify(IDEAS)}]})}));
  await pg.route(u => u.pathname.includes('product-find'), r => r.fulfill({status:200,
    contentType:'application/json', body: JSON.stringify(FIND)}));
  await pg.route(u => u.pathname.includes('product-search'), r => r.fulfill({status:200,
    contentType:'application/json', body: JSON.stringify({products:[]})}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2200);
  await pg.evaluate(() => { localStorage.setItem('ss_data', JSON.stringify({userName:'Cath',
    answers:[8,7,6,9,7,6,7,7,8,10,7,9], topArchNames:['The Timeless Classic'], portrait:'p', motto:'m',
    prefs:{sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:'',jewelry:'',dailyShoes:'',bagStyle:'',otherNotes:''}})); });
  await pg.reload(); await pg.waitForTimeout(2200);
  await pg.evaluate(() => { const c=document.querySelector('.hm-entrance'); if(c) c.remove(); });
  await pg.evaluate(() => { try { openWardrobe() } catch(e) {} });
  await pg.waitForTimeout(1200);
  /* ▶ The REAL opener, found by reading the markup rather than guessing at a
     class name: every row's control calls wardrobeSeeIdeas('<slot>'). */
  const slot = await pg.evaluate(() => {
    const a = [...document.querySelectorAll('[onclick*="wardrobeSeeIdeas"]')]
      .map(e => (e.getAttribute('onclick').match(/wardrobeSeeIdeas\('([^']+)'/) || [])[1])
      .filter(Boolean);
    if (!a.length) return null;
    const id = a[0];
    try { wardrobeSeeIdeas(id) } catch (e) { return 'threw:' + e.message }
    return id;
  });
  await pg.waitForTimeout(5000);
  await pg.evaluate(() => {
    const w = document.querySelector('[id^="wdrFind_"]');
    if (w && w.scrollIntoView) w.scrollIntoView({block:'center'});
  });
  await pg.waitForTimeout(500);
  if (flip) await pg.evaluate(() => {
    const w = document.querySelector('[id^="wdrFind_"]');
    if (w && w.parentElement) w.parentElement.insertBefore(w, w.parentElement.firstChild);
  });
  await pg.waitForTimeout(600);
  const box = await pg.evaluate(() => {
    const w = document.querySelector('[id^="wdrFind_"]');
    const strip = document.querySelector('[id^="wx_"] .shop-grid.hscroll');
    return { newRow: !!w, newCards: w ? w.querySelectorAll('.find-card').length : 0,
             existingStrip: !!strip, existingCards: strip ? strip.children.length : 0 };
  });
  const out = path.join(ROOT, 'scratchpad', label + '.png');
  await pg.screenshot({path: out, fullPage: false});
  console.log(label, '→', JSON.stringify(box), 'row-open:', slot);
  await ctx.close();
}
await shot('wdr-A-below', false);
await shot('wdr-B-above', true);
await b.close(); srv.close();
