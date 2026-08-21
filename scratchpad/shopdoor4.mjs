// Her final pick, both states: Lora ask + pink STAR (the stylist's mark, not
// her heart -- this screen is the stylist working), field, and on tap TWO chip
// rows, occasion above category, with the stylist escalation underneath.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8983;
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

// The stylist's pink star, the same polygon as .chat-hdr-star and the loader.
const STAR = '<svg viewBox="0 0 76 76" style="width:13px;height:13px;vertical-align:-1px;margin-left:4px" aria-hidden="true"><polygon points="38,4 46,25 68,25 50.5,38.5 57.5,60 38,47 18.5,60 25.5,38.5 8,25 30,25" fill="#EC4899" stroke="#EC4899" stroke-width="2" stroke-linejoin="round"/></svg>';

const CSS = `
#ssDoor{margin:12px auto 4px;max-width:340px;padding:0 14px}
#ssDoor .sd-vox{font:400 15.5px/1.45 'Lora',Georgia,serif;color:#4a463e;margin-bottom:8px}
#ssDoor .sd-in{border:1.5px solid #e0d6bc;border-radius:2px;padding:10px 14px;font-size:14.5px;width:100%;
  text-align:center;background:#fff;color:#1a1a1a;font-family:'DM Sans',sans-serif}
#ssDoor .sd-in.on{border-color:#C8A060}
#ssDoor .sd-chips{display:flex;gap:7px;overflow-x:auto;padding:2px 0;flex-wrap:nowrap;margin-top:8px}
#ssDoor .sd-chip{font:600 12px/1 'Jost',sans-serif;letter-spacing:.03em;color:#8a6a1e;padding:7px 11px;
  border:1px solid #D8A52E;border-radius:2px;background:#fff;white-space:nowrap}
#ssDoor .sd-esc{font-size:12.5px;color:#6e6e6e;margin-top:9px;line-height:1.55}
#ssDoor .sd-esc span{color:#EC4899;font-weight:600;text-decoration:underline}`;

const chips = a => `<div class="sd-chips">` + a.map(c=>`<span class="sd-chip">${c}</span>`).join('') + `</div>`;
const OCC = chips(['For an event','Work','Weekend','Vacation','Everyday']);
const CAT = chips(['Dresses','Tops','Bottoms','Shoes','Bags','Jackets']);
const VOX = `<div class="sd-vox">Tell me what you&rsquo;re looking for${STAR}</div>`;
const ESC = `<div class="sd-esc">Can&rsquo;t find it? <span>Let your stylist search &rarr;</span></div>`;

const V = {
  rest: VOX + `<input class="sd-in" placeholder="Try: floor length gown" readonly>` + ESC,
  open: VOX + `<input class="sd-in on" placeholder="Try: floor length gown" readonly>` + OCC + CAT + ESC,
};

const M = {};
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
  await pg.evaluate(({css, html}) => {
    const sub=document.querySelector('#s-shopstyle .ss-shop-sub');
    if(sub) sub.textContent='Chosen with you in mind.';
    const tip=document.querySelector('#s-shopstyle .ht-tip'); if(tip) tip.style.display='none';
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    const d=document.createElement('div'); d.id='ssDoor'; d.innerHTML=html;
    const hdr=document.querySelector('#s-shopstyle .ss-shop-hdr');
    hdr.parentNode.insertBefore(d, hdr.nextSibling);
    const talk=document.querySelector('#s-shopstyle .ss-shop-talk'); if(talk) talk.style.display='none';
  }, { css: CSS, html: V[key] });
  await pg.waitForTimeout(500);
  M[key] = await pg.evaluate(() => Math.round(
    document.querySelector('#shopStyleContent .shop-card').getBoundingClientRect().top));
  await pg.screenshot({ path: `scratchpad/_f-${key}.png` });
  await ctx.close(); console.log(key, M[key]+'px');
}

const LB = { rest:'At rest &mdash; what she sees on arrival', open:'After she taps the box &mdash; both chip rows' };
const cells = Object.keys(V).map(k =>
  `<div class=c><div class=h>${LB[k]}</div><div class=m>first card at ${M[k]}px &middot; +${M[k]-167}px vs today</div><img src="_f-${k}.png"></div>`).join('');
fs.writeFileSync(path.join(ROOT,'scratchpad/_fsheet.html'), `<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:20px;background:#fff;font:400 12px system-ui;color:#26221c}
h1{font:600 17px system-ui;margin:0 0 3px}p{margin:0 0 16px;color:#6b6355;font-size:12px}
.g{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:820px}
.c{border:1px solid #e8e2d6;padding:8px;border-radius:6px}
.h{font:600 11.5px system-ui;margin-bottom:2px}.m{font-size:10.5px;color:#8a8272;margin-bottom:7px}
img{width:100%;display:block;border:1px solid #f0ece3}
</style><h1>As you chose it</h1>
<p>Your wording in Lora with the stylist's pink star, and both chip rows appearing only once she taps the box. Today's first card sits at 167px.</p>
<div class=g>${cells}</div>`);
const pg = await b.newPage({ viewport:{width:880,height:700}, deviceScaleFactor:2 });
await pg.goto('file://' + path.join(ROOT,'scratchpad/_fsheet.html'));
await pg.waitForTimeout(400);
await pg.screenshot({ path:'scratchpad/shopdoor-final.png', fullPage:true });
await b.close(); srv.close(); console.log('done');
