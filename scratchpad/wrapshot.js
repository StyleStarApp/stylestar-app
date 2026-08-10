// Shows the shop-loading title as it really looks on a narrow phone, where it
// wraps to two lines. ⚠️ The starred title exists ONLY WHILE LOADING, so the
// shot must be taken before the AI call fails and restores the plain title --
// route the function call to a never-resolving response to hold the state.
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

for (const [w, tag] of [[390, '390'], [360, '360'], [320, '320']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 620 }, deviceScaleFactor: 2 });
  // hold the loading state open
  await page.route('**/.netlify/functions/style-ai', () => { /* never fulfil */ });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => _openShopStyleNow('style'));
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const lg = document.querySelector('#s-shopstyle .ss-shop-logo');
    const r = lg.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(lg);
    const tops = [...new Set([...rg.getClientRects()].map(x => Math.round(x.top)))];
    return { lines: tops.length, h: Math.round(r.height), text: lg.textContent.trim() };
  });
  console.log(`${w}px -> ${m.lines} line(s), ${m.h}px tall, "${m.text}"`);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'wrap-' + tag + '.png'), clip: { x: 0, y: 0, width: w, height: 330 } });
  await page.close();
}
await browser.close(); server.close();
