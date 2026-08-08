// Quick render check: the reworded How It Works step 2 at 390 + 360.  node scratchpad/hiwcheck.js
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const PORT = 8931, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') { res.writeHead(200, {'Content-Type':'text/html'}); res.end(HTML); return; }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end();
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fails = 0, checks = 0;
const ok = (name, cond, extra) => { checks++; console.log((cond?'PASS ':'FAIL ')+name+(extra?'  ['+extra+']':'')); if(!cond) fails++; };

for (const w of [390, 360]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(ORIGIN + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600); // entrance curtain

  const r = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.hm-hiw .hiw-row')];
    const row2 = rows[1];
    const b = row2.querySelector('b'), s = row2.querySelector('.hiw-tx span');
    const lines = el => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    return {
      head: b.textContent, sub: s.textContent,
      headLines: lines(b), subLines: lines(s),
      visible: row2.getBoundingClientRect().height > 0,
      docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      rowRight: Math.round(row2.getBoundingClientRect().right), vw: document.documentElement.clientWidth
    };
  });
  ok(w+': headline text', r.head === 'Reveal your Style Portrait');
  ok(w+': sub text', r.sub === 'Your signature style, made clear for you');
  ok(w+': headline on one line', r.headLines === 1, r.headLines+' line(s)');
  ok(w+': sub on one line', r.subLines === 1, r.subLines+' line(s)');
  ok(w+': row visible, no page overflow', r.visible && !r.docOverflow, 'right='+r.rowRight+' vw='+r.vw);
  ok(w+': zero JS errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
console.log(checks+' checks, '+fails+' failures');
process.exit(fails ? 1 : 0);
