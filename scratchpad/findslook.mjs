/* A LOOK, NOT A SUITE. Renders the Edit and Amazon Finds off the real files and
   prints measurements + screenshots, so a design call is made by LOOKING.
   ⚠️ The sandbox cannot reach stylestar.app with Chromium (ERR_CONNECTION_RESET
   through the egress proxy), so this serves the repo instead. */
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8951, ORIGIN = 'http://localhost:' + PORT;
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, ORIGIN).pathname);
  let f = path.join(ROOT, p === '/' ? '/index.html' : p);
  if (!path.extname(p)) f = path.join(ROOT, 'index.html');          // the netlify 200-rewrites
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));
const b = await chromium.launch();

const MEASURE = () => {
  const g = e => e ? getComputedStyle(e) : null;
  const scr = document.querySelector('.scr.act').id;
  const q = s => document.querySelector('#' + scr + ' ' + s);
  const sub = q('.dc-subtitle'), xl = q('.dc-xlink'), tl = q('.dc-trend-link');
  const boxes = el => { const r = document.createRange(); r.selectNodeContents(el);
    return [...r.getClientRects()].filter(x => x.width > 1); };
  const last = boxes(sub)[boxes(sub).length - 1];
  const shell = g(document.querySelector('.ss')).backgroundImage;
  return {
    screen: scr,
    shellShowsLinen: /rgba\(150, 140, 120/.test(shell),
    subtitleLines: boxes(sub).length,
    subtitleLastLineWidth: last ? Math.round(last.width) : 0,
    subtitleWidth: Math.round(sub.getBoundingClientRect().width),
    xlinkHeight: xl ? Math.round(xl.getBoundingClientRect().height) : 'MISSING',
    trendHeight: tl ? Math.round(tl.getBoundingClientRect().height) : 'MISSING',
    gapBetween: (xl && tl) ? Math.round(tl.getBoundingClientRect().top - xl.getBoundingClientRect().bottom) : 'n/a',
    trendFont: tl ? g(tl).fontSize : 'MISSING',
  };
};

for (const [w, tag] of [[390, '390'], [320, '320-narrowest'], [430, '430-plus']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  for (const route of ['/finds', '/edit']) {
    await p.goto(ORIGIN + route); await p.waitForTimeout(900);
    console.log(`w=${tag} ${route}`, JSON.stringify(await p.evaluate(MEASURE)));
    if (w === 390) {
      await p.screenshot({ path: `${ROOT}/scratchpad/out${route.replace('/', '-')}-top.png` });
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${ROOT}/scratchpad/out${route.replace('/', '-')}-foot.png` });
    }
  }
  await p.close();
}
await b.close(); srv.close();
