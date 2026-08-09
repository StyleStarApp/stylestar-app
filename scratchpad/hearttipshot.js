// "Heart it first" tip renders (2026-08-09, from her lululemon/Nordstrom-Rack
// app-handoff finds): one-time tip near the shopping cards that saving comes
// before exploring. Three versions on the REAL Shop your Style page:
//   hearttip-a.png — Catherine's whisper: one italic line between the sub and the cards
//   hearttip-b.png — a small bordered tip chip above the first card
//   hearttip-c.png — the whisper, but sitting right above the first Save control row
// ⚠️ Copy is a PLACEHOLDER — her wording replaces it before build.
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

const ITEMS = { items: [
  { category: 'dress', name: 'Navy Wrap Midi Dress', search: 'navy wrap midi dress', store: 'Nordstrom' },
  { category: 'shoes', name: 'Tan Kitten-Heel Mules', search: 'kitten heel mules', store: 'Sam Edelman' },
  { category: 'bag', name: 'Black Top-Handle Bag', search: 'black top handle bag', store: 'Kate Spade' },
  { category: 'jewelry', name: 'Gold Hoop Earrings', search: 'gold hoop earrings', store: 'Kendra Scott' }
]};

const TIP_TEXT = 'Tip: heart it first ♥ then explore. Anything you save waits for you in Your Wishlist.';
const WHISPER = '<div id="htTip" style="font:italic 400 14px/1.5 \'Jost\',sans-serif;color:#6b655a;text-align:center;max-width:300px;margin:2px auto 12px;text-wrap:balance">Tip: <b style="font-style:italic;color:#A0761B;font-weight:600">heart it first</b> <span style="color:#E8788A">♥</span> then explore. Anything you save waits for you in <b style="font-style:italic;color:#A0761B;font-weight:600">Your Wishlist</b>.</div>';
const CHIP = '<div id="htTip" style="display:flex;align-items:center;gap:9px;max-width:320px;margin:2px auto 12px;padding:9px 13px;background:#FDF9EE;border:1px solid #D8A52E;border-radius:8px;text-align:left">'
  + '<span style="color:#E8788A;font-size:16px;line-height:1">♥</span>'
  + '<span style="font:400 12.5px/1.5 \'Jost\',sans-serif;color:#4a463e"><b style="font-weight:600;color:#1a1814">Heart it first,</b> then explore. Anything you save waits in Your Wishlist.</span></div>';

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.addInitScript(() => {
  localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: [6,6,6,6,6,6,6,6,6,6,6,6], topArchNames: ['The Beautifully Balanced','Soft Glam','Pop of Color'], portrait: 'p', motto: 'm' }));
  localStorage.setItem('ss_stylenudge', '1');
  localStorage.setItem('ss_prefs', JSON.stringify({ sizes: {}, colorsLove: ['gold','navy'], neverWear: [], neverPatterns: [] }));
});
await page.route('**/.netlify/functions/style-ai', r => r.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(ITEMS) }] })
}));
await page.route('**/.netlify/functions/user-data*', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openShopStyle === 'function');
await page.evaluate(() => {
  // the entrance star covers early screenshots — tear it down
  document.querySelectorAll('.hm-entrance').forEach(e => e.remove());
  document.body.classList.remove('curtain');
  openShopStyle();
});
await page.waitForFunction(() => document.querySelectorAll('#shopStyleContent .shop-card').length >= 4, { timeout: 15000 });
await page.evaluate(() => document.querySelectorAll('.hm-entrance').forEach(e => e.remove()));
await page.waitForTimeout(500);

async function shot(name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', name), clip: { x: 0, y: 0, width: 390, height: 700 } });
  console.log('saved ' + name);
}

// as built — the real markup shows the tip on its own now
await page.evaluate(() => { try { _syncHeartTip(); } catch (e) {} });
await page.waitForTimeout(200);
await shot('hearttip-built.png');
if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
await browser.close(); server.close();
