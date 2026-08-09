// Renders for Cath (2026-08-09): defining the Menu's group labels with gold.
//   menugrp-a.png  A: short gold underline bar under the label (the Your Wishlist title's mark)
//   menugrp-b.png  B: trailing gold hairline — "STYLE ────────" (fills the line)
//   menugrp-c.png  C: full-width gold hairline under the whole label line
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = import.meta.dirname;
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'm' };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const VARIANTS = {
  a: `
    .menu-grp{position:relative;display:inline-block;padding-bottom:5px !important}
    .menu-grp::after{content:"";position:absolute;left:2px;right:-2px;bottom:0;height:2px;background:#D8A52E}
  `,
  b: `
    .menu-grp{display:flex;align-items:center;gap:8px}
    .menu-grp::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#D8A52E,rgba(216,165,46,.25))}
  `,
  c: `
    .menu-grp{border-bottom:1px solid #D8A52E;padding-bottom:6px !important}
  `
};

for (const v of ['a', 'b', 'c']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 1080 }, deviceScaleFactor: 2 });
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-wb'); updateWbScreen(); menuOpen(); });
  await page.waitForTimeout(350);
  await page.addStyleTag({ content: VARIANTS[v] });
  await page.waitForTimeout(150);
  const panel = await page.$('.menu-panel');
  await panel.screenshot({ path: path.join(OUT, 'menugrp-' + v + '.png') });
  console.log('wrote menugrp-' + v + '.png');
  await page.close();
}
await browser.close();
server.close();
