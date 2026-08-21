// Frame options for the shop card, with the emoji removed and the corners
// squared. Reuses the languages already in the app rather than inventing one:
// .wks-card (white, squared, 1px #D8A52E) and its gold-leaf ::before frame.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8985;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{ let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(PORT,r));
const gf = fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const AI = { items: [
  {category:'top',    name:'Satin Button-Front Blouse', search:'satin button front blouse', store:'Nordstrom'},
  {category:'bottom', name:'Wide Leg Trouser',          search:'wide leg trousers',         store:'Quince'},
  {category:'shoes',  name:'Pointed Toe Flats',         search:'pointed toe flats',         store:'Zappos'},
  {category:'bag',    name:'Structured Top Handle Bag', search:'top handle bag',            store:'Cuyana'},
]};

const NOEMO = '.shop-emoji{display:none!important}';
const SQ = '.shop-card{border-radius:0!important}';
const V = {
  today: { emoji:true,  css:'' },
  sq:    { emoji:false, css: SQ },
  gold:  { emoji:false, css: SQ + '.shop-card{background:#fff!important;border:1px solid #D8A52E!important}' },
  cream: { emoji:false, css: SQ + '.shop-card{background:#F7F1E1!important;border:1px solid #D8C285!important}' },
  dbl:   { emoji:false, css: SQ + `.shop-card{background:#fff!important;border:1px solid #D8A52E!important;
             box-shadow:inset 0 0 0 3px #fff, inset 0 0 0 4px #EFDFB4!important}` },
  leaf:  { emoji:false, wrap:true, css: SQ + `.shop-grid{gap:20px!important}
           .sc-wrap{position:relative;z-index:0;display:flex}
           .sc-wrap>.shop-card{background:#fff!important;border:1px solid #D8A52E!important;flex:1;
             box-shadow:0 3px 10px rgba(0,0,0,.16)!important}
           .sc-wrap::before{content:'';position:absolute;inset:-5px;z-index:-1;
             background:linear-gradient(150deg,#FEEF98 0%,#F6CE3E 46%,#E4B02E 78%,#F3DC8B 100%)}` },
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const key of Object.keys(V)) {
  const ctx = await b.newContext({ viewport:{width:390,height:800}, deviceScaleFactor:2 });
  const pg = await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:gf}));
  await pg.route('**/.netlify/**', r => r.fulfill({status:200, contentType:'application/json',
    body: JSON.stringify({content:[{text: JSON.stringify(AI)}]})}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  await pg.evaluate(() => { localStorage.setItem('ss_data', JSON.stringify({userName:'Cath',
    answers:new Array(12).fill(6), topArchNames:['The Timeless Classic'], portrait:'p', motto:'m'})); });
  await pg.reload(); await pg.waitForTimeout(2400);
  await pg.evaluate(() => { const c=document.querySelector('.hm-entrance'); if(c) c.remove(); });
  await pg.evaluate(() => _openShopStyleNow('quiz'));
  await pg.waitForSelector('#shopStyleContent .shop-card', { timeout: 20000 });
  await pg.evaluate(({css, emoji, noemo, wrap}) => {
    const sub=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(sub) sub.textContent='Chosen with you in mind.';
    const tip=document.querySelector('#s-shopstyle .ht-tip'); if(tip) tip.style.display='none';
    const s=document.createElement('style');
    s.textContent = (emoji ? '' : noemo) + css;
    document.head.appendChild(s);
    if (wrap) document.querySelectorAll('#shopStyleContent .shop-card').forEach(c => {
      const w=document.createElement('div'); w.className='sc-wrap';
      c.parentNode.insertBefore(w, c); w.appendChild(c);
    });
  }, { css: V[key].css, emoji: V[key].emoji, noemo: NOEMO, wrap: !!V[key].wrap });
  await pg.waitForTimeout(400);
  await pg.locator('#shopStyleContent .shop-grid').screenshot({ path: `scratchpad/_sc-${key}.png` });
  await ctx.close(); console.log(key);
}

const LB = { today:'TODAY &mdash; grey, rounded, emoji', sq:'1. Squared, emoji gone, nothing else',
  gold:'2. White + 1px gold (the Star card&rsquo;s own border)', cream:'3. Cream + gold',
  dbl:'4. Gold with an inner hairline', leaf:'5. The full gold-leaf frame' };
const cells = Object.keys(V).map(k =>
  `<div class=c><div class=h>${LB[k]}</div><img src="_sc-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_scsheet.html'), `<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11px system-ui;margin-bottom:7px;min-height:30px}
img{width:100%;display:block}
</style><h1>The shop card &mdash; squared, and how much frame</h1>
<p>The real cards at 390px with the emoji removed. Every option is squared. Option 5 needed the grid gap widened from 10px to 20px, because the leaf frame spreads outside the card and two neighbours would otherwise collide.</p>
<div class=g>${cells}</div>`);
const pg = await b.newPage({ viewport:{width:1560,height:700}, deviceScaleFactor:2 });
await pg.goto('file://' + path.join(ROOT,'scratchpad/_scsheet.html'));
await pg.waitForTimeout(400);
await pg.screenshot({ path:'scratchpad/shopcard.png', fullPage:true });
await b.close(); srv.close(); console.log('done');
