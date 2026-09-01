// Render mockup: her idea, 2026-08-26 — "would it be possible to have The Edit
// items slide sideways like [What's Trending] from the Discovery page /
// Welcome Back page, and have the Star of the Week on the front page and the
// rest slide over as Edit pages... if she is in the mood to instantly shop
// that surface she could just swipe right from there."
//
// Three treatments of the SAME idea, all reusing the .wdr-tt-scroll pattern
// already proven on What's Trending (scratchpad's own house convention: a new
// screen idea gets rendered against the real page before it's built for
// real). Each variant boots the REAL s-wb screen with real quiz data so the
// real #wbStar card renders, then id-scopes new CSS/markup alongside it —
// never editing the shared classes the live page uses.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = '/home/user/stylestar-app';
const IMG = '/tmp/wbcarousel-img';

const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  if (p.startsWith('/__img/')) {
    const f = path.join(IMG, p.replace('/__img/', ''));
    if (fs.existsSync(f)) { rs.writeHead(200, {'Content-Type':'image/jpeg'}); return rs.end(fs.readFileSync(f)); }
  }
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); }
  rs.writeHead(200, {'Content-Type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream'});
  rs.end(fs.readFileSync(f));
}).listen(0);
const PORT = srv.address().port;

const PHOTOS = {
  'dvf-scarf.jpg': 'dvf.com', 'farmrio.jpg': 'farmrio.com', 'vilebrequin.jpg': 'vilebrequin.com',
  'olivela.jpg': 'olivela.com', 'jean.png': 'shopify.com', 'serpui.jpg': 'shopify.com'
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function freshPage() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 1400 } });
  const pg = await ctx.newPage();
  // reroute the six real CDN hosts to our locally-downloaded copies
  for (const [file, host] of Object.entries(PHOTOS)) {
    await pg.route(`**://*.${host}/**`, r => r.fulfill({
      status: 200, contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
      body: fs.readFileSync(path.join(IMG, file))
    }));
    await pg.route(`**://${host}/**`, r => r.fulfill({
      status: 200, contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
      body: fs.readFileSync(path.join(IMG, file))
    }));
  }
  await pg.goto(`http://127.0.0.1:${PORT}/`);
  // seed a returning woman with results, so s-wb (not s-wel) is what boots
  await pg.evaluate(() => {
    localStorage.setItem('ss_data', JSON.stringify({
      userName: 'Jen', answers: new Array(12).fill(6),
      topArchNames: ['Timeless Classic'], motto: 'Effortless, always.',
      portrait: 'A woman who values quality and quiet confidence.'
    }));
  });
  await pg.reload();
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => { document.querySelectorAll('.hm-entrance').forEach(e => e.remove()); show('s-wb'); _renderWeekStar(); });
  await pg.waitForTimeout(300);
  return { ctx, pg };
}

// the 7 photographed Edit items, in the app's OWN current order (Star first,
// then the ones that would follow it into a "swipe right" strip)
const EDIT_TEASER = [
  { n: 'DVF Jeanne Silk Jersey Wrap Dress', store: 'Diane von Furstenberg', price: '$678', img: '/__img/dvf-scarf.jpg' },
  { n: 'Vilebrequin Long Mesh Cover-Up', store: 'Vilebrequin', price: '$405', img: '/__img/vilebrequin.jpg' },
  { n: 'Love Hearts Find Me Necklace', store: 'Jane Win · Olivela', price: '$278', img: '/__img/olivela.jpg' },
  { n: 'Veronica Beard Crosbie Jean', store: 'Marissa Collections', price: '$248', img: '/__img/jean.png' },
  { n: 'Serpui Abigail Handbag — Red', store: 'Marissa Collections', price: '$414', img: '/__img/serpui.jpg' }
];

// ---------- A: STAR STAYS AS-IS, TEASER STRIP ADDED BELOW IT ----------
// Lowest-risk: the tuned #wbStar card is completely untouched (nothing about
// its careful 700px-fold math changes); a new, SEPARATE horizontal strip of
// small Edit teaser cards sits directly under it — same shape as the
// What's Trending strip at the bottom of My List, just relocated here.
async function renderA() {
  const { ctx, pg } = await freshPage();
  await pg.evaluate((items) => {
    const css = document.createElement('style');
    css.textContent = `
      #mockA{margin:10px 7px 0}
      #mockA .mA-lbl{font:600 10.5px/1 'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a6a1e;margin:0 2px 7px}
      #mockA .mA-scroll{display:flex;overflow-x:auto;gap:10px;padding:2px 2px 6px;scrollbar-width:none}
      #mockA .mA-scroll::-webkit-scrollbar{display:none}
      #mockA .mA-card{flex:0 0 108px;background:#fff;border:1px solid #EFE7D2;padding:0;text-align:left}
      #mockA .mA-card img{width:108px;height:135px;object-fit:cover;display:block}
      #mockA .mA-t{padding:6px 7px 8px}
      #mockA .mA-n{font:600 11px/1.25 'Jost',sans-serif;color:#1a1a1a;margin-bottom:2px;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #mockA .mA-p{font:400 10.5px/1 'Jost',sans-serif;color:#8a6a1e}
      #mockA .mA-all{flex:0 0 90px;align-items:center;justify-content:center;text-align:center;
        display:flex;background:#1a1a1a;color:#EACD68;font:600 11px/1.3 'Jost',sans-serif;padding:12px 10px}
    `;
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'mockA';
    el.innerHTML = '<div class="mA-lbl">MORE FROM THE EDIT</div><div class="mA-scroll">'
      + items.map(it => `<div class="mA-card"><img src="${it.img}"><div class="mA-t"><div class="mA-n">${it.n}</div><div class="mA-p">${it.price}</div></div></div>`).join('')
      + '<div class="mA-card mA-all">See the full Edit &rarr;</div></div>';
    document.getElementById('wbStar').insertAdjacentElement('afterend', el);
  }, EDIT_TEASER);
  const card = pg.locator('.wks-card');
  const shot = await pg.locator('#wbStar, #mockA').first().evaluateHandle(() => document.querySelector('#wbStar').parentElement);
  await pg.screenshot({ path: '/tmp/wbcar-A.png', clip: await (async()=>{
    const box = await pg.evaluate(() => {
      const s = document.getElementById('wbStar').getBoundingClientRect();
      const m = document.getElementById('mockA').getBoundingClientRect();
      return { x: 0, y: s.top, width: 390, height: (m.bottom - s.top) };
    });
    return box;
  })() });
  await ctx.close();
}

// ---------- B: STAR IS THE FIRST CARD IN ONE CONTINUOUS SWIPE ROW ----------
// The most literal reading of her idea: Star of the Week and the Edit teasers
// live in ONE horizontal-scroll row, Star first at full size, everything else
// smaller beside it — so swiping right IS moving from "today's pick" into
// "the rest of the Edit" in a single physical gesture.
async function renderB() {
  const { ctx, pg } = await freshPage();
  await pg.evaluate((items) => {
    const starCard = document.querySelector('#wbStar .wks-card');
    const disc = document.querySelector('#wbStar .wks-disc');
    if (!starCard) return;
    const wrapper = document.getElementById('wbStar');
    const css = document.createElement('style');
    css.textContent = `
      #wbStar.mockB{overflow:visible}
      #wbStar.mockB .mB-row{display:flex;overflow-x:auto;gap:10px;padding:2px 2px 8px;scrollbar-width:none;
        scroll-snap-type:x proximity}
      #wbStar.mockB .mB-row::-webkit-scrollbar{display:none}
      #wbStar.mockB .mB-star{flex:0 0 258px;scroll-snap-align:start}
      #wbStar.mockB .mB-card{flex:0 0 108px;background:#fff;border:1px solid #EFE7D2;text-align:left;scroll-snap-align:start}
      #wbStar.mockB .mB-card img{width:108px;height:135px;object-fit:cover;display:block}
      #wbStar.mockB .mB-t{padding:6px 7px 8px}
      #wbStar.mockB .mB-n{font:600 11px/1.25 'Jost',sans-serif;color:#1a1a1a;margin-bottom:2px;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #wbStar.mockB .mB-p{font:400 10.5px/1 'Jost',sans-serif;color:#8a6a1e}
      #wbStar.mockB .mB-all{flex:0 0 90px;align-items:center;justify-content:center;text-align:center;
        display:flex;background:#1a1a1a;color:#EACD68;font:600 11px/1.3 'Jost',sans-serif;padding:12px 10px;scroll-snap-align:start}
      #wbStar.mockB .wks-disc{margin-top:8px}
    `;
    document.head.appendChild(css);
    wrapper.classList.add('mockB');
    const row = document.createElement('div'); row.className = 'mB-row';
    const starWrap = document.createElement('div'); starWrap.className = 'mB-star';
    starWrap.appendChild(starCard);
    row.appendChild(starWrap);
    items.forEach(it => {
      const c = document.createElement('div'); c.className = 'mB-card';
      c.innerHTML = `<img src="${it.img}"><div class="mB-t"><div class="mB-n">${it.n}</div><div class="mB-p">${it.price}</div></div>`;
      row.appendChild(c);
    });
    const all = document.createElement('div'); all.className = 'mB-card mB-all'; all.textContent = 'See the full Edit →';
    row.appendChild(all);
    wrapper.insertBefore(row, disc);
  }, EDIT_TEASER);
  const box = await pg.evaluate(() => {
    const s = document.getElementById('wbStar').getBoundingClientRect();
    return { x: 0, y: s.top, width: 390, height: s.height };
  });
  await pg.screenshot({ path: '/tmp/wbcar-B.png', clip: box });
  await ctx.close();
}

// ---------- C: A LABELLED "SWIPE FOR MORE" HINT ON THE STAR CARD ITSELF ----------
// Between A and B: the Star card stays its own full, untouched block (same as
// A), but instead of a plain "MORE FROM THE EDIT" label, the card's own
// bottom edge grows a peeking sliver of the next card + a small arrow, so the
// swipe is discoverable from the Star card without a second labelled section.
async function renderC() {
  const { ctx, pg } = await freshPage();
  await pg.evaluate((items) => {
    const css = document.createElement('style');
    css.textContent = `
      #mockC{margin:6px 7px 0;position:relative}
      #mockC .mC-scroll{display:flex;overflow-x:auto;gap:10px;padding:2px 20px 6px 2px;scrollbar-width:none;
        scroll-snap-type:x proximity}
      #mockC .mC-scroll::-webkit-scrollbar{display:none}
      #mockC .mC-card{flex:0 0 96px;background:#fff;border:1px solid #EFE7D2;text-align:left;scroll-snap-align:start}
      #mockC .mC-card img{width:96px;height:120px;object-fit:cover;display:block}
      #mockC .mC-t{padding:5px 6px 7px}
      #mockC .mC-n{font:600 10.5px/1.25 'Jost',sans-serif;color:#1a1a1a;margin-bottom:2px;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #mockC .mC-p{font:400 10px/1 'Jost',sans-serif;color:#8a6a1e}
      #mockC .mC-all{flex:0 0 78px;align-items:center;justify-content:center;text-align:center;
        display:flex;background:#1a1a1a;color:#EACD68;font:600 10px/1.25 'Jost',sans-serif;padding:10px 8px;scroll-snap-align:start}
      #mockC .mC-hint{position:absolute;top:0;right:0;bottom:8px;width:34px;
        background:linear-gradient(90deg,rgba(251,250,247,0),rgba(251,250,247,.94) 60%);
        display:flex;align-items:center;justify-content:flex-end;padding-right:4px;pointer-events:none}
      #mockC .mC-hint svg{width:15px;height:15px;color:#8a6a1e}
    `;
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'mockC'; el.style.position = 'relative';
    el.innerHTML = '<div class="mC-scroll">'
      + items.map(it => `<div class="mC-card"><img src="${it.img}"><div class="mC-t"><div class="mC-n">${it.n}</div><div class="mC-p">${it.price}</div></div></div>`).join('')
      + '<div class="mC-card mC-all">See the full Edit &rarr;</div></div>'
      + '<div class="mC-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></div>';
    document.getElementById('wbStar').insertAdjacentElement('afterend', el);
  }, EDIT_TEASER);
  const box = await pg.evaluate(() => {
    const s = document.getElementById('wbStar').getBoundingClientRect();
    const c = document.getElementById('mockC').getBoundingClientRect();
    return { x: 0, y: s.top, width: 390, height: c.bottom - s.top };
  });
  await pg.screenshot({ path: '/tmp/wbcar-C.png', clip: box });
  await ctx.close();
}

await renderA();
await renderB();
await renderC();
await b.close();
srv.close();
console.log('rendered A, B, C to /tmp/wbcar-{A,B,C}.png');
