// Quick real-font screenshot of the Style Journal hub + article, for a visual
// sanity check. Reuses the cached-fonts trick from renderfonts.mjs but skips
// document.fonts.ready (which hangs in this sandbox on some pages) in favor
// of a fixed settle timeout.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8947;
const T = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png', '.json':'application/json',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf' };

const toml = fs.readFileSync('netlify.toml', 'utf8');
const redirects = [];
for (const m of toml.matchAll(/\[\[redirects\]\]\s*\n\s*from = "([^"]+)"\s*\n\s*to = "([^"]+)"\s*\n\s*status = 200/g)) {
  redirects.push({ from: m[1], to: m[2] });
}
function matchRedirect(p) {
  for (const r of redirects) {
    if (r.from === p) return r.to;
    if (r.from.endsWith('/*') && p.startsWith(r.from.slice(0, -1))) return r.to;
  }
  return null;
}
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  const rewrite = matchRedirect(p);
  if (rewrite) p = rewrite;
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const css = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function shot(route, name, width) {
  const pg = await b.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  pg.setDefaultTimeout(6000);
  pg.setDefaultNavigationTimeout(6000);
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await pg.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(1800);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `scratchpad/${name}.png` });
  await pg.close();
}

await shot('/journal', 'journal-hub-390', 390);
await shot('/journal/how-to-find-your-personal-style', 'journal-article-390', 390);
await b.close();
srv.close();
console.log('done');
