// One labelled image of the three flow changes (Cath approved 2026-07-31):
// journey-ordered Style group + Start-here pill (new visitor), and the
// portrait's first-reveal "what's next → refine" strip.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();

// 1. Fresh visitor: drawer with journey order + Start here pill
const fresh = await browser.newPage({ viewport: { width: 390, height: 1250 } });
await fresh.goto(base + '/', { waitUntil: 'load' });
await fresh.evaluate(() => { document.getElementById('ssEntrance')?.remove(); menuOpen(); });
await fresh.waitForTimeout(400);
const drawerShot = await fresh.locator('#menuPanel').screenshot();

// 2. Returning un-refined woman: the portrait strip
const SEED = { userName: 'Test', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };
const res = await browser.newPage({ viewport: { width: 390, height: 844 } });
await res.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
await res.goto(base + '/', { waitUntil: 'load' });
await res.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-res');
  document.getElementById('s-res').classList.add('rv-open'); });
await res.waitForTimeout(3000);
// The reveal screen re-flows under clipped screenshots, so shoot the two
// elements directly (Playwright scrolls each into view) and re-stack them
// on the screen's real lacquer backdrop in the compose step.
const saveShot = await res.locator('#resSaveBtn').screenshot();
const stripShot = await res.locator('#refineNext').screenshot();

const compose = await browser.newPage({ viewport: { width: 880, height: 100 } });
const d1 = 'data:image/png;base64,' + drawerShot.toString('base64');
const dSave = 'data:image/png;base64,' + saveShot.toString('base64');
const d2 = 'data:image/png;base64,' + stripShot.toString('base64');
await compose.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
  <div style="display:flex;gap:30px;padding:24px;align-items:flex-start;justify-content:center">
    <div style="text-align:center">
      <div style="font-size:18px;font-weight:bold;margin-bottom:4px">Menu, brand-new visitor</div>
      <div style="font-size:13px;color:#555;margin-bottom:10px;max-width:330px">Journey order (Quiz &rarr; Portrait &rarr; Refine) + the gold Start here pill. Returning women see no pill.</div>
      <img src="${d1}" style="width:330px;border:1px solid #bbb;border-radius:8px">
    </div>
    <div style="text-align:center">
      <div style="font-size:18px;font-weight:bold;margin-bottom:4px">Style Portrait, first reveal</div>
      <div style="font-size:13px;color:#555;margin-bottom:10px;max-width:390px">The "what's next" strip under Save. Tap &rarr; preferences; &#10005; waves it off; gone forever once she refines.</div>
      <div style="width:390px;background:linear-gradient(180deg,#1c1710,#141009);border:1px solid #bbb;border-radius:8px;padding:22px 18px;box-sizing:border-box">
        <img src="${dSave}" style="width:100%;display:block;margin-bottom:12px">
        <img src="${d2}" style="width:100%;display:block">
      </div>
    </div>
  </div></body>`);
await compose.waitForTimeout(300);
const h = await compose.evaluate(() => document.body.scrollHeight);
await compose.setViewportSize({ width: 880, height: h });
await compose.screenshot({ path: path.join(ROOT, 'scratchpad', 'flow-preview.png'), fullPage: true });
console.log('wrote scratchpad/flow-preview.png');
await browser.close(); server.close();
