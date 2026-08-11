// Her question 2026-08-11: "is the turquoise coming across too bright on the
// back bleed?" Four directions rendered on the real Edit page, phone width.
// The LETTERING stays #0FA6B6 in every option -- only the full-bleed backdrop
// changes, so page and backdrop still speak one colour, just quieter.
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

const OPTS = [
  { id: 'current', c: '#0FA6B6', label: 'CURRENT  #0FA6B6' },
  { id: 'a', c: '#0E7F8C', label: 'A  deeper teal  #0E7F8C' },
  { id: 'b', c: '#0A5D67', label: 'B  jewel teal  #0A5D67' },
  { id: 'c', c: '#A8D9DE', label: 'C  sea glass  #A8D9DE' },
];

for (const o of OPTS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(o => {
    showDream();
    const s = document.createElement('style');
    // the bleed only; the CURATED BY CATHERINE lettering is untouched
    s.textContent = `html.edit-velvet,html.edit-velvet body{background:${o.c} !important}
      #s-dream .dc-logo{margin-top:24px}#s-dream .dc-subtitle{margin-top:8px}
      #__lbl{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;
        font:600 13px/1.5 -apple-system,sans-serif;text-align:center;padding:7px 0;letter-spacing:.04em}`;
    document.head.appendChild(s);
    const d = document.createElement('div'); d.id = '__lbl'; d.textContent = o.label; document.body.appendChild(d);
  }, o);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `editteal-${o.id}.png`), clip: { x: 0, y: 0, width: 390, height: 800 } });
  await page.close();
  console.log('rendered ' + o.id + '  ' + o.c);
}
await browser.close(); server.close();
