// Standalone re-run of render C only (the main script's browser instance got
// killed mid-run). Same logic as wbcarousel-mock.js's renderC.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = '/home/user/stylestar-app';
const IMG = '/tmp/wbcarousel-img';

const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  // ⚠️ the teaser markup's img src values are relative /__img/... paths, not
  // real CDN URLs — this is what actually serves them, not any pg.route.
  if (p.startsWith('/__img/')) {
    const f = path.join(IMG, p.replace('/__img/', ''));
    if (fs.existsSync(f)) { rs.writeHead(200, {'Content-Type': p.endsWith('.png') ? 'image/png' : 'image/jpeg'}); return rs.end(fs.readFileSync(f)); }
    rs.writeHead(404); return rs.end();
  }
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); }
  rs.writeHead(200, {'Content-Type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream'});
  rs.end(fs.readFileSync(f));
}).listen(0);
const PORT = srv.address().port;

const EDIT_TEASER = [
  { n: 'DVF Jeanne Silk Jersey Wrap Dress', store: 'Diane von Furstenberg', price: '$678', img: '/__img/dvf-scarf.jpg' },
  { n: 'Vilebrequin Long Mesh Cover-Up', store: 'Vilebrequin', price: '$405', img: '/__img/vilebrequin.jpg' },
  { n: 'Love Hearts Find Me Necklace', store: 'Jane Win · Olivela', price: '$278', img: '/__img/olivela.jpg' },
  { n: 'Veronica Beard Crosbie Jean', store: 'Marissa Collections', price: '$248', img: '/__img/jean.png' },
  { n: 'Serpui Abigail Handbag — Red', store: 'Marissa Collections', price: '$414', img: '/__img/serpui.jpg' }
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 1400 } });
const pg = await ctx.newPage();
await pg.goto(`http://127.0.0.1:${PORT}/`);
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
await pg.waitForTimeout(400); // let the images actually load before the shot

const box = await pg.evaluate(() => {
  const s = document.getElementById('wbStar').getBoundingClientRect();
  const c = document.getElementById('mockC').getBoundingClientRect();
  return { x: 0, y: s.top, width: 390, height: c.bottom - s.top };
});
await pg.screenshot({ path: '/tmp/wbcar-C.png', clip: box });
await b.close();
srv.close();
console.log('rendered C to /tmp/wbcar-C.png');
