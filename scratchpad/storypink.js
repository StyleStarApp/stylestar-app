// Her ask 2026-08-11: darken My Story's pink bleed "the same way we did w the
// Edit page ... a pink tone in the same family as our pink hearts but done in a
// darker way." Same move as the teal: the BLEED goes deeper, the signature pink
// #F49AC1 stays exactly as it is on the hearts and the turquoise frame is
// untouched, so the page still speaks her colour, just quieter behind it.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// all four sit on the same hue line as #F49AC1, walking down in value
const OPTS = [
  { id: 'current', c: '#F49AC1', label: 'CURRENT  #F49AC1' },
  { id: 'a', c: '#E2779F', label: 'A  #E2779F  one step down' },
  { id: 'b', c: '#CE5C86', label: 'B  #CE5C86  deeper rose' },
  { id: 'c', c: '#B04569', label: 'C  #B04569  deepest' },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(o => {
    showStory();
    const s = document.createElement('style');
    s.textContent = `html.story-velvet,html.story-velvet body{background:${o.c} !important}
      #__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;
        font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0;letter-spacing:.04em}`;
    document.head.appendChild(s);
    const d = document.createElement('div'); d.id = '__lbl'; d.textContent = o.label; document.body.appendChild(d);
  }, o);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `storypink-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 800 } });
  console.log('rendered ' + o.id + '  ' + o.c);
  await page.close();
}
await browser.close(); server.close();
