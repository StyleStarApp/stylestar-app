// Renders the two new My Wishlist hub rows (Portrait + photo results) with a
// saved piece so the count pill is lit.  node scratchpad/hubshot.js
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const PORT = 8896, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') { res.writeHead(200, {'Content-Type':'text/html'}); res.end(HTML); return; }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.show === 'function');
await page.evaluate(() => { document.body.classList.add('ss-done'); document.body.classList.remove('ss-anim','ss-play'); });
await page.addStyleTag({ content: '.hm-entrance{display:none!important}.wl-toast{display:none!important}' });
await page.evaluate(() => {
  const id = _wlRegister({ name: 'Tan Suede Baguette Bag', store: 'Nordstrom', search: 'tan suede baguette bag' });
  wishToggle(id);
});

const shots = [];
for (const [scr, sel, label] of [
  ['s-res', '#s-res .hub-shop', 'Style Portrait — Shop hub'],
  ['s-photo-res', '#s-photo-res .chub', 'Analyze Outfit results — Shop hub']]) {
  // rv-done = the reveal's terminal state: doors gone, boards resting visible.
  await page.evaluate(s => { show(s); const el = document.getElementById(s); el.classList.remove('rv-compose','rv-open','rv-quick'); el.classList.add('rv-done'); }, scr);
  await page.waitForTimeout(600);
  const rect = await page.evaluate(s => {
    const el = document.querySelector(s);
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(390, r.width + 8), height: r.height + 8 };
  }, sel);
  await page.waitForTimeout(400);
  const f = path.join(ROOT, 'scratchpad', scr + '-hub.png');
  await page.screenshot({ path: f, clip: rect });
  shots.push([f, label]);
}

// One labelled composite (the lesson: one tall labelled image beats N crops).
const sharp = null; // no sharp here — compose in-browser instead
const imgs = shots.map(([f]) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
const compose = await browser.newPage({ viewport: { width: 420, height: 100 } });
await compose.setContent(`<body style="margin:0;background:#faf7f0;font-family:sans-serif">
  <div style="padding:14px 15px 4px;font:700 15px sans-serif">${shots[0][1]}</div>
  <img src="${imgs[0]}" style="width:390px;display:block;margin:0 15px;border:1px solid #ddd">
  <div style="padding:16px 15px 4px;font:700 15px sans-serif">${shots[1][1]}</div>
  <img src="${imgs[1]}" style="width:390px;display:block;margin:0 15px 15px;border:1px solid #ddd">
</body>`);
await compose.waitForTimeout(300);
const h = await compose.evaluate(() => document.body.scrollHeight);
await compose.setViewportSize({ width: 420, height: h });
await compose.screenshot({ path: path.join(ROOT, 'scratchpad', 'wishlist-hubs.png'), fullPage: true });
console.log('wrote scratchpad/wishlist-hubs.png');
await browser.close();
server.close();
