// Find the TRUE minimum drawer width: walk the panel narrower 1px at a time and
// watch for the first row that wraps. Runs both visitor states (the "Start here"
// pill makes the Style Quiz row wider) and both phone widths.
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

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base + '/', { waitUntil: 'load' });
await page.waitForTimeout(2600);
await page.evaluate(() => menuOpen());
await page.waitForTimeout(300);

// natural (unwrapped) width of every row's content
const natural = await page.evaluate(() => {
  const panel = document.getElementById('menuPanel');
  panel.style.width = '600px';
  const out = [...panel.querySelectorAll('.menu-row')].map(r => {
    const rg = document.createRange(); rg.selectNodeContents(r);
    return { text: r.textContent.trim(), w: Math.ceil(rg.getBoundingClientRect().width) };
  });
  panel.style.width = '';
  return out;
});
natural.sort((a, b) => b.w - a.w);
console.log('Widest row content (px), pill shown:');
natural.slice(0, 6).forEach(r => console.log('  ' + String(r.w).padStart(4) + '  ' + r.text));

const pad = await page.evaluate(() => {
  const p = getComputedStyle(document.getElementById('menuPanel'));
  const r = getComputedStyle(document.querySelector('.menu-row'));
  return { panel: parseFloat(p.paddingLeft) + parseFloat(p.paddingRight), row: parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) };
});
console.log('panel side padding ' + pad.panel + 'px, row side padding ' + pad.row + 'px');
console.log('=> content box needs ' + (natural[0].w + pad.panel + pad.row) + 'px total\n');

// walk it narrower until something wraps
const firstWrapAt = await page.evaluate(() => {
  const panel = document.getElementById('menuPanel');
  const rows = [...panel.querySelectorAll('.menu-row')];
  const wrapped = () => rows.filter(r => {
    const cs = getComputedStyle(r);
    const lh = parseFloat(cs.lineHeight);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    return (r.getBoundingClientRect().height - pad) / lh > 1.5;
  }).map(r => r.textContent.trim());
  for (let w = 260; w >= 150; w--) {
    panel.style.width = w + 'px';
    const bad = wrapped();
    if (bad.length) { panel.style.width = ''; return { w, rows: bad }; }
  }
  panel.style.width = '';
  return null;
});
console.log('First wrap at ' + firstWrapAt.w + 'px  ->  ' + firstWrapAt.rows.join(', '));
console.log('Safe minimum: ' + (firstWrapAt.w + 1) + 'px');
await page.close();
await browser.close(); server.close();
