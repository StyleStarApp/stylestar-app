// Screenshot the REAL shared wishlist page at /list/<token>, with the real
// typefaces and a stubbed user-data response. Not a mockup: this renders
// index.html itself, so what she sees is what ships.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8963;
const HTML = fs.readFileSync(ROOT + '/index.html', 'utf8');
const css = fs.readFileSync(ROOT + '/scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const TOK = 'AbCd1234_-EfGh5678ijKlMnOpQrSt';
const LIST = [
  { name: 'Diane von Furstenberg Flag Scarf — Myrtle Berry', store: 'Diane von Furstenberg',
    search: 'silk scarf', exact: true, url: 'https://dvf.com/products/flag-scarf', price: '$198',
    note: 'Any colour but the red one!' },
  { name: 'FARM Rio Pink Garden Terrace Maxi Dress', store: 'FARM Rio', search: 'maxi dress',
    exact: true, url: 'https://www.farmrio.com/products/maxi-dress', price: '$360',
    note: 'Size 8. This is the one for the wedding in June.' },
  { name: 'White Linen Button-Front Blouse', store: 'J.Crew', search: 'white linen blouse',
    exact: false, note: 'Size medium, I like them a little oversized.' },
  { name: 'Tan Pointed Ballet Flats', store: 'Nordstrom', search: 'tan ballet flats', exact: false }
];
const MODES = {
  full:  { success: true, name: 'Catherine', list: LIST },
  gone:  null,
  empty: { success: true, name: 'Catherine', list: [] }
};
let mode = 'full';
const srv = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://localhost:' + PORT);
  if (u.pathname.startsWith('/.netlify/functions/user-data') && u.searchParams.get('share')) {
    if (mode === 'gone') { r.writeHead(404, {'Content-Type':'application/json'}); return r.end('{"error":"not_found"}'); }
    r.writeHead(200, {'Content-Type':'application/json'}); return r.end(JSON.stringify(MODES[mode]));
  }
  if (u.pathname.startsWith('/.netlify/functions/')) { r.writeHead(200,{'Content-Type':'application/json'}); return r.end('{}'); }
  if (u.pathname === '/' || u.pathname.startsWith('/list/')) { r.writeHead(200,{'Content-Type':'text/html'}); return r.end(HTML); }
  const f = path.join(ROOT, u.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    r.writeHead(200, { 'content-type': f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.png') ? 'image/png' : 'text/plain' });
    return fs.createReadStream(f).pipe(r);
  }
  r.writeHead(404); r.end('');
});
await new Promise(r => srv.listen(PORT, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const m of ['full', 'gone', 'empty']) {
  mode = m;
  const pg = await b.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 2 });
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status:200, contentType:'text/css', body: css }));
  await pg.goto(`http://localhost:${PORT}/list/${TOK}`);
  await pg.waitForTimeout(1600);
  try { await pg.evaluate(() => document.fonts.ready); } catch {}
  await pg.waitForTimeout(500);
  if (m === 'full') console.log(await pg.evaluate(() => {
    const mk = ff => { const s=document.createElement('span'); s.textContent='Catherine';
      s.style.cssText=`position:absolute;visibility:hidden;font:600 26px ${ff}`; document.body.appendChild(s);
      const x=s.getBoundingClientRect().width; s.remove(); return Math.round(x*10)/10; };
    return { realFontsLoaded: mk("'Dancing Script',cursive") !== mk('serif') };
  }));
  const h = await pg.evaluate(() => document.body.scrollHeight);
  await pg.setViewportSize({ width: 390, height: Math.ceil(h) + 8 });
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: `${ROOT}/scratchpad/sharepage-${m}.png` });
  await pg.close(); console.log(`  ${m}: ${h}px`);
}
await b.close(); srv.close();
