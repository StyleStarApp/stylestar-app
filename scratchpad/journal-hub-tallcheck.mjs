// Reproduce her screenshot: an iPhone-height viewport, and measure exactly
// where the blank space below the footer (inside the card) is coming from.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8951;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/journal' || p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const css = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// iPhone 13/14-ish viewport, matching her screenshot's proportions.
const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
pg.setDefaultTimeout(6000);
pg.setDefaultNavigationTimeout(6000);
await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
await pg.goto(`http://localhost:${PORT}/journal`, { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(1800);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
await pg.waitForTimeout(400);

const data = await pg.evaluate(() => {
  const body = document.body;
  const ss = document.querySelector('.ss');
  const scope = document.getElementById('s-journal-hub');
  const wrap = scope.querySelector('.story-wrap');
  const foot = scope.querySelector('.pg-foot');
  const bodyR = body.getBoundingClientRect();
  const ssR = ss.getBoundingClientRect();
  const wrapR = wrap.getBoundingClientRect();
  const footR = foot.getBoundingClientRect();
  return {
    viewportHeight: window.innerHeight,
    bodyHeight: Math.round(bodyR.height),
    ssHeight: Math.round(ssR.height),
    ssBottom: Math.round(ssR.bottom),
    wrapHeight: Math.round(wrapR.height),
    wrapBottom: Math.round(wrapR.bottom),
    footBottom: Math.round(footR.bottom),
    footToWrapBottomGap: Math.round(wrapR.bottom - footR.bottom),
    footToSsBottomGap: Math.round(ssR.bottom - footR.bottom),
    ssComputedMinHeight: getComputedStyle(ss).minHeight,
    wrapComputedMinHeight: getComputedStyle(wrap).minHeight,
    bodyComputedAlign: getComputedStyle(body).alignItems,
    scrComputedMinHeight: getComputedStyle(scope).minHeight,
  };
});
console.log(data);
await pg.screenshot({ path: 'scratchpad/journal-hub-tallcheck.png', fullPage: false });
await b.close();
srv.close();
