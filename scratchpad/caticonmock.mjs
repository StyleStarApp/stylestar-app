// Renders the FOUR options on the REAL cards — the app's own _shopCard and
// _renderShop do the drawing; only the icon slot is swapped afterwards, so
// nothing here is a mockup of the card itself.
//   current : today's emoji
//   A       : a line icon per category
//   B       : no icon on the grid card, no tile on Complete the Look
//   C       : one neutral line star everywhere
// Real webfonts are served locally (Chromium here cannot reach Google Fonts).
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8973;
const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{ let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(PORT,r));
const gf = fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const PATHS = {
  top:'M9 3.7 4.4 5.8 3 9.6l3.2 1.1V20.3h11.6V10.7L21 9.6l-1.4-3.8L15 3.7M9 3.7c.7 2.2 5.3 2.2 6 0',
  bottom:'M5.6 3.7h12.8l1.1 16.6h-4.9L12 10.4l-2.6 9.9H4.5zM5.6 7h12.8',
  dress:'M9 3.7 6.4 5.5l1.2 4.2-2.4 10.6h13.6L16.4 9.7l1.2-4.2L15 3.7M9 3.7c.7 2 5.3 2 6 0',
  jacket:'M8.8 3.6 4.2 5.9 3 9.9l2.8 1.1v9.4h12.4v-9.4L21 9.9l-1.2-4-4.6-2.3M8.8 3.6l3.2 4.6 3.2-4.6M12 8.2v12.2',
  shoes:'M8.2 3.4h5.2l.5 8.2c.1 1.6 1 3 2.4 3.8l2.6 1.5c1 .6 1.6 1.6 1.6 2.7v.6H8.2zM7.9 14.2h5.9',
  bag:'M5.8 8.5h12.4l-.8 10.6a1.2 1.2 0 0 1-1.2 1.1H7.8a1.2 1.2 0 0 1-1.2-1.1zM8.3 8.5C8.3 4.2 15.7 4.2 15.7 8.5',
  jewelry:'M5.4 4.6c0 5.8 2.9 9.4 6.6 9.4s6.6-3.6 6.6-9.4M12 14v2.2M12 16.2a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2z',
  activewear:'M9 3.5 5.4 5.4l1.3 4.1v8.4h10.6V9.5l1.3-4.1-3.6-1.9M9 3.5c.4 2.8 1.6 4.2 3 4.2s2.6-1.4 3-4.2',
  belt:'M2.6 9.1h18.8v6H2.6zM8.7 7.4h6.6v9.4H8.7zM12 7.4v9.4',
  accessory:'M12 3.4 14 9.3l6.2.2-4.9 3.8 1.8 6-5.1-3.5-5.1 3.5 1.8-6L1.8 9.5 8 9.3z',
};
const AI = { items: [
  {category:'top',    name:'Satin Button-Front Blouse', search:'satin button front blouse', store:'Nordstrom'},
  {category:'bottom', name:'Wide Leg Trouser',          search:'wide leg trousers',         store:'Quince'},
  {category:'shoes',  name:'Pointed Toe Flats',         search:'pointed toe flats',         store:'Zappos'},
  {category:'bag',    name:'Structured Top Handle Bag', search:'top handle bag',            store:'Cuyana'},
]};
const LOOK = [
  {category:'jacket',    name:'Cropped Denim Jacket',   search:'cropped denim jacket', store:'Madewell', why:'adds structure'},
  {category:'jewelry',   name:'Layered Gold Necklace',  search:'layered gold necklace', store:'Kendra Scott', why:'lifts the neckline'},
  {category:'accessory', name:'Silk Neck Scarf',        search:'silk neck scarf',       store:'Nordstrom', why:'a finishing touch'},
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function shot(variant, which) {
  const ctx = await b.newContext({ viewport:{width:390,height:900}, deviceScaleFactor:2 });
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

  let sel;
  if (which === 'grid') {
    await pg.evaluate(() => _openShopStyleNow('quiz'));
    await pg.waitForSelector('#shopStyleContent .shop-card', { timeout: 15000 });
    sel = '#shopStyleContent .shop-grid';
  } else {
    await pg.evaluate(items => {
      show('s-photo-res'); document.getElementById('s-photo-res').classList.add('rv-open');
      _renderShop(items);
    }, LOOK);
    await pg.waitForSelector('#pShopList .shoprow', { timeout: 15000 });
    sel = '#pShopList';
  }

  await pg.evaluate(({v, P, w}) => {
    const svg = (p, px) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:${px}px;height:${px}px;display:block;margin:0 auto"><path d="${p}"/></svg>`;
    if (w === 'grid') {
      const cats = ['top','bottom','shoes','bag'];
      document.querySelectorAll('#shopStyleContent .shop-emoji').forEach((el, i) => {
        if (v === 'current') return;
        if (v === 'B') { el.remove(); return; }
        el.style.cssText = 'margin-bottom:6px;color:#26221c';
        el.innerHTML = svg(v === 'C' ? P.accessory : P[cats[i]], 26);
      });
    } else {
      const cats = ['jacket','jewelry','accessory'];
      document.querySelectorAll('#pShopList .shoprow .si').forEach((el, i) => {
        if (v === 'current') return;
        if (v === 'B') { el.remove(); return; }
        el.style.fontSize = '0'; el.style.color = '#3b3227';
        el.innerHTML = svg(v === 'C' ? P.accessory : P[cats[i]], 21);
      });
    }
  }, { v: variant, P: PATHS, w: which });

  await pg.waitForTimeout(500);
  await pg.locator(sel).screenshot({ path: `scratchpad/_ci-${which}-${variant}.png` });
  await ctx.close();
}

for (const w of ['grid','look']) for (const v of ['current','A','B','C']) { await shot(v, w); console.log(w, v); }

const LB = { current:'TODAY — emoji', A:'A — a line icon per category', B:'B — no icon', C:'C — one neutral mark' };
for (const w of ['grid','look']) {
  const cells = ['current','A','B','C'].map(v =>
    `<div class=c><div class=h>${LB[v]}</div><img src="_ci-${w}-${v}.png"></div>`).join('');
  fs.writeFileSync(path.join(ROOT, `scratchpad/_sheet-${w}.html`), `<!doctype html><meta charset=utf-8><style>
  body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
  h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
  .g{display:grid;grid-template-columns:repeat(${w==='grid'?4:2},1fr);gap:14px}
  .c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
  .h{font:600 11.5px system-ui;letter-spacing:.03em;margin-bottom:7px;color:#26221c}
  img{width:100%;display:block}</style>
  <h1>${w==='grid'?'Shop your style — the card grid':'Complete the Look — the rows'}</h1>
  <p>Real cards, rendered by the app's own code at 390px. ${w==='grid'?'This is the screen Carson named.':'Today the icon sits in a gold tile.'}</p>
  <div class=g>${cells}</div>`);
  const pg = await b.newPage({ viewport:{width: w==='grid'?1180:820, height:600}, deviceScaleFactor:2 });
  await pg.goto('file://' + path.join(ROOT, `scratchpad/_sheet-${w}.html`));
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `scratchpad/caticon-${w}.png`, fullPage:true });
  await pg.close();
}
await b.close(); srv.close(); console.log('done');
