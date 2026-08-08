// Measure + shoot the keep-card -> Retake gap on the real portrait screen. node scratchpad/retakegap.js
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
const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-res');
  document.getElementById('s-res').classList.add('rv-open'); });
await page.waitForTimeout(2500);
const m = await page.evaluate(() => {
  const k = document.getElementById('resKeep').getBoundingClientRect();
  const b = document.querySelector('#s-res .retake').getBoundingClientRect();
  return { keepH: Math.round(k.height), gap: Math.round(b.top - k.bottom) };
});
console.log('keep card height:', m.keepH, '| gap card->button:', m.gap + 'px', '| JS errors:', errs.length);
await page.evaluate(() => document.querySelector('#s-res .retake-wrap').scrollIntoView({ block: 'end' }));
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'retakegap.png') });
await browser.close(); server.close();
