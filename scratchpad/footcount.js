// Her bug: two footers on Your Wishlist. The 13-route sweep in wlfoot.js could
// not reproduce it, so this asks the broader question instead -- does ANY screen
// ever paint two footers? The global .quiz-footer lives inside the app shell, so
// whenever it is visible on a screen that has its own, she sees both.
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

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const p = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(base + '/', { waitUntil: 'load' });
await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(2600);

const ids = await p.evaluate(() => [...document.querySelectorAll('.scr')].map(s => s.id).filter(Boolean));
console.log(`  (${ids.length} screens)\n`);

for (const id of ids) {
  const m = await p.evaluate(sid => {
    show(sid);
    const scr = document.getElementById(sid);
    const vis = [...document.querySelectorAll('[data-std-foot]')].filter(f => {
      const rc = f.getBoundingClientRect();
      return rc.width > 0 && rc.height > 0 && f.offsetParent !== null;
    });
    return { n: vis.length, own: !!scr.querySelector('[data-std-foot]'),
             which: vis.map(f => (f.closest('.scr') ? f.closest('.scr').id : 'GLOBAL') + '/' + (f.className || 'quiz-footer')) };
  }, id);
  ok(m.n <= 1, `${id}: ${m.n} visible footer(s)${m.n > 1 ? ' -> ' + m.which.join(' + ') : ''}`);
}

ok(errs.length === 0, `zero JS errors (${errs.join('; ') || 'none'})`);
console.log(`\n${pass} passed, ${fail} failed`);
await p.close();
await browser.close(); server.close();
if (fail) process.exit(1);
