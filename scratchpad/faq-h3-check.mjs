// Confirm converting .faq-q from <div> to <h3> changed nothing visually --
// class selectors don't care about the tag, but prove it rather than assume.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8948;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/' || p === '/faq') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport: { width: 390, height: 900 } });
pg.setDefaultTimeout(6000);
pg.setDefaultNavigationTimeout(6000);
await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
const errors = [];
pg.on('pageerror', e => errors.push(String(e)));
await pg.goto(`http://localhost:${PORT}/faq`, { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(700);
await pg.evaluate(() => showFAQ());
await pg.waitForTimeout(300);

let pass = 0, fail = 0;
function ok(n, c) { if (c) pass++; else { fail++; console.log('FAIL:', n); } }

ok('faq screen active', await pg.evaluate(() => document.getElementById('s-faq').classList.contains('act')));
ok('18 <h3 class="faq-q"> present', await pg.evaluate(() => document.querySelectorAll('#s-faq h3.faq-q').length === 18));
ok('zero <div class="faq-q"> left', await pg.evaluate(() => document.querySelectorAll('#s-faq div.faq-q').length === 0));
const style = await pg.evaluate(() => {
  const el = document.querySelector('#s-faq h3.faq-q');
  const cs = getComputedStyle(el);
  return { fontSize: cs.fontSize, color: cs.color, marginBottom: cs.marginBottom, display: cs.display };
});
console.log('computed style of first h3.faq-q:', style);
ok('font-size unchanged (17px)', style.fontSize === '17px');
ok('color unchanged (#1a1a1a)', style.color === 'rgb(26, 26, 26)');
ok('h1 present on FAQ too', await pg.evaluate(() => document.querySelector('#s-faq h1').textContent.trim() === 'Frequently Asked Questions'));
ok('no overflow at 390', await pg.evaluate(() => document.documentElement.scrollWidth <= 391));

console.log(`\n${pass} passed, ${fail} failed`);
console.log('JS errors:', errors.length ? errors : 'none');
await b.close();
srv.close();
process.exitCode = (fail || errors.length) ? 1 : 0;
