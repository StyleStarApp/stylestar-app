const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(f);
  res.writeHead(200, { 'Content-Type': { '.css': 'text/css', '.html': 'text/html' }[ext] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ FAIL: ' + name); } };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(200);

const link = await page.evaluate(() => {
  const a = document.getElementById('findsStorefrontLink');
  return a ? { href: a.href, text: a.textContent.trim(), target: a.target, rel: a.rel, visible: getComputedStyle(a).display !== 'none' } : null;
});
console.log(link);
ok(!!link, 'the Storefront link exists on the page');
ok(link && link.href === 'https://www.amazon.com/shop/stylestar01?tag=stylestar01-20', 'href carries her real _AMZ_TAG, exactly once, no stray tracking params (' + (link&&link.href) + ')');
ok(link && link.target === '_blank', 'opens in a new tab');
ok(link && link.rel.includes('sponsored') && link.rel.includes('noopener'), 'carries rel="sponsored noopener" like every other outbound Amazon link');
ok(link && link.visible, 'visible on the page');
ok(link && /Storefront/.test(link.text), 'wording names the Storefront (' + JSON.stringify(link&&link.text) + ')');

// reopen -- must not double-tag
await page.evaluate(() => { closeFinds(); });
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(150);
const link2 = await page.evaluate(() => document.getElementById('findsStorefrontLink').href);
ok(link2 === link.href, 'reopening the page does not double-tag the link (' + link2 + ')');

// confirm it did NOT disturb the existing Edit/Trending crosslinks
const others = await page.evaluate(() => ({
  edit: document.querySelector('#s-finds .dc-xlink') ? document.querySelector('#s-finds .dc-xlink').textContent.includes('The Edit') : false,
  trend: document.querySelector('#s-finds .dc-trend-link[onclick]') ? true : false,
}));
ok(others.edit, 'the existing Edit crosslink is untouched');
ok(others.trend, 'the existing Trending crosslink is untouched');

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
