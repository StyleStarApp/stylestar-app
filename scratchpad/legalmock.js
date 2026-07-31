// Renders the REAL menu drawer two ways for Cath's 2026-07-31 question:
// A) as shipped — Privacy · Terms as the quiet legal row at the end
// B) Privacy and Terms as two full-size .menu-row entries like every other row
// One tall labelled image, computed-style proof the variants differ.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.png': 'image/png', '.json': 'application/json' }[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 1250 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); menuOpen(); });
  await page.waitForTimeout(300);

  const shot = async () => await page.locator('#menuPanel').screenshot();
  const a = await shot();

  // Variant B: legal row becomes two ordinary rows
  const proof = await page.evaluate(() => {
    const legal = document.querySelector('.menu-legal');
    const before = getComputedStyle(legal.querySelector('span')).fontSize;
    const mk = (label, fn) => { const d = document.createElement('div'); d.className = 'menu-row'; d.textContent = label; d.setAttribute('onclick', fn); return d; };
    legal.replaceWith(mk('Privacy', 'menuGo(showPrivacy)'), mk('Terms', 'menuGo(showTerms)'));
    const rows = document.querySelectorAll('#menuPanel .menu-row');
    const after = getComputedStyle(rows[rows.length - 1]).fontSize;
    return { before, after, rowCount: rows.length };
  });
  await page.waitForTimeout(150);
  const b = await shot();
  console.log('computed-style proof:', JSON.stringify(proof));
  if (proof.before === proof.after) { console.log('VARIANTS DO NOT DIFFER — aborting'); process.exit(1); }

  // Compose one tall labelled image
  const compose = await browser.newPage({ viewport: { width: 860, height: 100 } });
  const dataA = 'data:image/png;base64,' + a.toString('base64');
  const dataB = 'data:image/png;base64,' + b.toString('base64');
  await compose.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
    <div style="display:flex;gap:28px;padding:24px;align-items:flex-start;justify-content:center">
      <div style="text-align:center">
        <div style="font-size:19px;font-weight:bold;margin-bottom:4px">A &mdash; as it is today</div>
        <div style="font-size:13px;color:#555;margin-bottom:10px;max-width:330px">Privacy &middot; Terms stay a quiet small line at the end</div>
        <img src="${dataA}" style="width:330px;border:1px solid #bbb;border-radius:8px">
      </div>
      <div style="text-align:center">
        <div style="font-size:19px;font-weight:bold;margin-bottom:4px">B &mdash; full-size rows</div>
        <div style="font-size:13px;color:#555;margin-bottom:10px;max-width:330px">Privacy and Terms match every other row</div>
        <img src="${dataB}" style="width:330px;border:1px solid #bbb;border-radius:8px">
      </div>
    </div></body>`);
  await compose.waitForTimeout(400);
  const full = await compose.evaluate(() => document.body.scrollHeight);
  await compose.setViewportSize({ width: 860, height: full });
  await compose.screenshot({ path: import.meta.dirname + '/legal-compare.png', fullPage: true });
  console.log('wrote scratchpad/legal-compare.png');
  await browser.close();
  server.close();
})();
