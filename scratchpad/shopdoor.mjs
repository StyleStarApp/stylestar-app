// Layout options for "how does she tell the app what she's looking for?"
// on Shop your style. Rendered on the REAL screen with the REAL cards; the
// steering control is the only thing injected. Real webfonts served locally.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8977;
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

// Reuses the app's own language: the squared gold .wdr-see chip and the
// .wl-add input she already approved on Your Wishlist.
const CSS = `
#ssDoor{margin:12px auto 4px;max-width:340px;padding:0 14px}
#ssDoor .sd-lbl{font:400 12.5px/1.5 'Jost',sans-serif;color:#5a554c;margin-bottom:7px}
#ssDoor .sd-in{border:1.5px solid #e0d6bc;border-radius:2px;padding:10px 14px;font-size:14.5px;width:100%;
  text-align:center;background:#fff;color:#1a1a1a;font-family:'DM Sans',sans-serif}
#ssDoor .sd-chips{display:flex;gap:7px;overflow-x:auto;padding:2px 0;flex-wrap:nowrap;-webkit-overflow-scrolling:touch}
#ssDoor .sd-chip{font:600 12px/1 'Jost',sans-serif;letter-spacing:.03em;color:#8a6a1e;padding:7px 11px;
  border:1px solid #D8A52E;border-radius:2px;background:#fff;white-space:nowrap}
#ssDoor .sd-ask{font-size:13.5px;color:#6e6e6e;margin-top:9px}
#ssDoor .sd-ask span{color:#EC4899;font-weight:600;text-decoration:underline}`;

const CHIPS = ['Dresses','Tops','Bottoms','Shoes','Bags','Jackets']
  .map(c=>`<span class="sd-chip">${c}</span>`).join('');

const DOOR = {
  today: '',
  chips: `<div class="sd-lbl">Looking for something?</div><div class="sd-chips">${CHIPS}</div>`,
  field: `<div class="sd-lbl">Looking for something specific?</div>
          <input class="sd-in" placeholder="Try: floor length gown" readonly>`,
  both:  `<div class="sd-lbl">Looking for something specific?</div>
          <input class="sd-in" placeholder="Try: floor length gown" readonly>
          <div class="sd-chips" style="margin-top:8px">${CHIPS}</div>`,
  ask:   `<div class="sd-ask">Want something specific? <span>Tell your stylist &rarr;</span></div>`,
};

const MEASURED = {};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

for (const key of Object.keys(DOOR)) {
  const ctx = await b.newContext({ viewport:{width:390,height:800}, deviceScaleFactor:2 });
  const pg = await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({status:200, contentType:'text/css', body:gf}));
  await pg.route('**/.netlify/**', r => r.fulfill({status:200, contentType:'application/json',
    body: JSON.stringify({content:[{text: JSON.stringify(AI)}]})}));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2400);
  await pg.evaluate(() => { localStorage.setItem('ss_data', JSON.stringify({userName:'Cath',
    answers:new Array(12).fill(6), topArchNames:['The Timeless Classic'], portrait:'p', motto:'m'})); });
  await pg.reload(); await pg.waitForTimeout(2400);
  await pg.evaluate(() => { const c=document.querySelector('.hm-entrance'); if(c) c.remove(); });
  await pg.evaluate(() => _openShopStyleNow('quiz'));
  await pg.waitForSelector('#shopStyleContent .shop-card', { timeout: 20000 });
  await pg.evaluate(() => {
    const sub=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(sub) sub.textContent='Chosen with you in mind.';
    const tip=document.querySelector('#s-shopstyle .ht-tip');
    if(tip) tip.style.display='none';
  });
  await pg.evaluate(({css, html}) => {
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    if (!html) return;
    const d=document.createElement('div'); d.id='ssDoor'; d.innerHTML=html;
    const hdr=document.querySelector('#s-shopstyle .ss-shop-hdr');
    hdr.parentNode.insertBefore(d, hdr.nextSibling);
  }, { css: CSS, html: DOOR[key] });
  await pg.waitForTimeout(500);
  const top = await pg.evaluate(() => Math.round(
    document.querySelector('#shopStyleContent .shop-card').getBoundingClientRect().top));
  MEASURED[key] = top;
  await pg.screenshot({ path: `scratchpad/_sd-${key}.png` });
  await ctx.close();
  console.log(key, 'first card top:', MEASURED[key] + 'px');
}

const LB = { today:'TODAY — no way to steer', chips:'A — category chips',
  field:'B — a "looking for" field', both:'C — both', ask:'D — just move the stylist line up' };
const cells = Object.keys(DOOR).map(k =>
  `<div class=c><div class=h>${LB[k]}</div><div class=m>first card starts at ${MEASURED[k]}px${k==='today'?'':` &middot; +${MEASURED[k]-MEASURED.today}px`}</div><img src="_sd-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_sdsheet.html'), `<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:2px}.m{font-size:10.5px;color:#8a8272;margin-bottom:7px}img{width:100%;display:block;border:1px solid #f0ece3}
</style><h1>Shop your style — how she tells it what she wants</h1>
<p>The real screen at 390px with the real cards. In every option the six pieces still appear instantly, so nothing is gated behind a question.</p>
<div class=g>${cells}</div>`);
const pg = await b.newPage({ viewport:{width:1500,height:700}, deviceScaleFactor:2 });
await pg.goto('file://' + path.join(ROOT,'scratchpad/_sdsheet.html'));
await pg.waitForTimeout(400);
await pg.screenshot({ path:'scratchpad/shopdoor.png', fullPage:true });
await b.close(); srv.close(); console.log('done');
