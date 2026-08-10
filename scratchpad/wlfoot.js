// Her screenshot: TWO footers on Your Wishlist, and "I didn't see this every
// time" -- which points at a ROUTE, not at the markup (the screen has exactly
// one .wl-foot). The suspect is the global .quiz-footer, which lives inside the
// app shell and is shown/hidden by whoever navigated last.
// This drives every way into the wishlist and counts VISIBLE footers.
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

// Each route is a sequence of page calls ending on the wishlist.
const ROUTES = [
  { label: 'straight from Welcome Back', steps: ['openWishlist()'] },
  { label: 'via the Menu (menuGo)', steps: ["menuOpen()", "menuGo(openWishlist)"] },
  { label: 'from Your Wardrobe List', steps: ["openWardrobe('list')", 'openWishlist()'] },
  { label: 'from What’s Trending', steps: ["openWardrobe('trend')", 'openWishlist()'] },
  { label: 'from the Style Star Edit', steps: ['showDream()', 'openWishlist()'] },
  { label: 'from the Mall', steps: ['showShop()', 'openWishlist()'] },
  { label: 'from My Story', steps: ['showStory()', 'openWishlist()'] },
  { label: 'from the FAQ', steps: ['showFAQ()', 'openWishlist()'] },
  { label: 'from Privacy', steps: ['showPrivacy()', 'openWishlist()'] },
  { label: 'wardrobe -> Back -> wishlist', steps: ["openWardrobe('list')", 'closeWardrobe()', 'openWishlist()'] },
  { label: 'FAQ -> Back -> wishlist', steps: ['showFAQ()', 'closeFAQ()', 'openWishlist()'] },
  { label: 'wishlist -> Back -> wishlist again', steps: ['openWishlist()', 'closeWishlist()', 'openWishlist()'] },
  { label: 'Shop your Style -> wishlist', steps: ['_openShopStyleNow("style")', 'openWishlist()'] },
];

for (const r of ROUTES) {
  const p = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  for (const s of r.steps) { await p.evaluate(s => { try { eval(s); } catch (e) {} }, s); await p.waitForTimeout(350); }
  const m = await p.evaluate(() => {
    const act = document.querySelector('.scr.act');
    const vis = [...document.querySelectorAll('[data-std-foot]')].filter(f => {
      const rc = f.getBoundingClientRect();
      return rc.width > 0 && rc.height > 0 && getComputedStyle(f).display !== 'none' && f.offsetParent !== null;
    });
    return { screen: act ? act.id : null, n: vis.length, which: vis.map(f => f.className || '(global)') };
  });
  const good = m.screen === 's-wishlist' && m.n === 1;
  ok(good, `${r.label}: ${m.n} footer(s) on ${m.screen}${m.n !== 1 ? ' -> ' + m.which.join(' + ') : ''}`);
  if (errs.length) ok(false, `${r.label}: JS errors ${errs.join('; ')}`);
  await p.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
if (fail) process.exit(1);
