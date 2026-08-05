// Shoots the SHIPPED whisper restyle (2026-08-05) on both real screens:
//   1. Style Portrait — #refineNext in whisper voice on the ivory panel, ✕ left
//   2. Welcome Back — #wbNext with the ✕ moved left + balanced line wrap
// One labelled 2x image per screen (Cath's phone-readable format).
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);

// Portrait: save button + whisper strip on the real ivory panel
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-res');
  document.getElementById('s-res').classList.add('rv-open'); });
await page.waitForTimeout(2500);
const resProof = await page.evaluate(() => {
  const el = document.getElementById('refineNext'), b = el.getBoundingClientRect();
  const x = el.querySelector('.rn-x').getBoundingClientRect();
  const t = el.querySelector('.rn-body').getBoundingClientRect();
  return { on: el.classList.contains('on'), visible: b.width > 0 && b.height > 0, xLeftOfText: x.left < t.left };
});
const saveShot = await page.locator('#resSaveBtn').screenshot();
const stripShot = await page.locator('#refineNext').screenshot();

// Welcome Back: greeting mirror through the whisper on the dark backdrop
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); });
await page.addStyleTag({ content: '#s-wb *{animation:none!important;opacity:1}' });
await page.waitForSelector('#s-wb.act', { timeout: 5000 });
await page.waitForTimeout(400);
const wbProof = await page.evaluate(() => {
  const el = document.getElementById('wbNext'), b = el.getBoundingClientRect();
  const x = el.querySelector('.wbn-x').getBoundingClientRect();
  const t = document.getElementById('wbNextTxt').getBoundingClientRect();
  return { on: el.classList.contains('on'), visible: b.width > 0 && b.height > 0, xLeftOfText: x.left < t.left };
});
const wbRect = await page.evaluate(() => {
  const top = document.querySelector('.wb-greet').getBoundingClientRect().top + scrollY;
  const bot = document.getElementById('wbNext').getBoundingClientRect().bottom + scrollY;
  return { top, bot };
});
const wbShot = await page.screenshot({ clip: { x: 0, y: Math.max(0, wbRect.top - 10), width: 390, height: wbRect.bot - wbRect.top + 24 } });

console.log('proof:', JSON.stringify({ portrait: resProof, welcomeBack: wbProof }));
if (!resProof.on || !resProof.visible || !resProof.xLeftOfText || !wbProof.on || !wbProof.visible || !wbProof.xLeftOfText) {
  console.log('PROOF FAILED — aborting'); process.exit(1);
}

const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
const frames = [
  ['portrait', 'STYLE PORTRAIT — AS BUILT', 'The whisper voice on the first reveal: your Welcome Back refine line word for word, ink italic + deeper gold for the ivory panel, pink heart, &#10005; on the left.',
    `<div style="width:390px;margin:0 auto;background:#FCFCFB;border:1px solid #bbb;border-radius:8px;padding:22px 18px;box-sizing:border-box">
      <img src="data:image/png;base64,${saveShot.toString('base64')}" style="width:100%;display:block;margin-bottom:12px">
      <img src="data:image/png;base64,${stripShot.toString('base64')}" style="width:100%;display:block"></div>`],
  ['welcomeback', 'WELCOME BACK — AS BUILT', 'Catherine&rsquo;s whisper with the &#10005; moved to the left and the line wrap balanced, so &ldquo;style &hearts;&rdquo; is never stranded alone.',
    `<img src="data:image/png;base64,${wbShot.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">`],
];
for (const [k, title, desc, body] of frames) {
  await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
    <div style="padding:18px 20px 14px;text-align:center">
      <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${title}</div>
      <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${desc}</div>
      ${body}
    </div></body>`);
  await single.waitForTimeout(200);
  const out = path.join(import.meta.dirname, 'whisperfinal-' + k + '.png');
  await single.screenshot({ path: out, fullPage: true });
  console.log('wrote', out);
}
await browser.close(); server.close();
