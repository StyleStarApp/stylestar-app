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

const g = id => document.getElementById(id);
const info = a => a ? { href: a.href, text: a.textContent.trim(), target: a.target, rel: a.rel,
  visible: getComputedStyle(a).display !== 'none', color: getComputedStyle(a).color,
  radius: getComputedStyle(a).borderRadius, fontSize: parseFloat(getComputedStyle(a).fontSize),
  top: a.getBoundingClientRect().top } : null;

const [bottom, top] = await page.evaluate((ids) => {
  const g = id => document.getElementById(id);
  const info = a => a ? { href: a.href, text: a.textContent.trim(), target: a.target, rel: a.rel,
    visible: getComputedStyle(a).display !== 'none', color: getComputedStyle(a).color,
    radius: getComputedStyle(a).borderRadius, fontSize: parseFloat(getComputedStyle(a).fontSize),
    top: a.getBoundingClientRect().top } : null;
  return [info(g(ids[0])), info(g(ids[1]))];
}, ['findsStorefrontLink', 'findsStorefrontLinkTop']);
console.log({ bottom, top });

console.log('THE BOTTOM BUTTON (rebuilt as a pill, her catch on the teal underline)');
ok(!!bottom, 'the bottom Storefront button exists');
ok(bottom && bottom.href === 'https://www.amazon.com/shop/stylestar01?tag=stylestar01-20', 'href carries her real _AMZ_TAG, exactly once, no stray tracking params (' + (bottom&&bottom.href) + ')');
ok(bottom && bottom.target === '_blank', 'opens in a new tab');
ok(bottom && bottom.rel.includes('sponsored') && bottom.rel.includes('noopener'), 'carries rel="sponsored noopener" like every other outbound Amazon link');
ok(bottom && bottom.visible, 'visible on the page');
ok(bottom && /Storefront/.test(bottom.text), 'wording names the Storefront (' + JSON.stringify(bottom&&bottom.text) + ')');
ok(bottom && bottom.radius === '999px', 'a real pill shape, not a text link (' + (bottom&&bottom.radius) + ')');
ok(bottom && bottom.color === 'rgb(168, 104, 26)', 'her darkened page-tan (#A8681A, her 2nd ask -- also clears the 4.5:1 contrast floor) (' + (bottom&&bottom.color) + ')');

console.log('THE SMALLER TOP COPY, HER ASK — a woman who never scrolls should still see it');
ok(!!top, 'a second, top-of-page Storefront button exists');
ok(top && top.href === bottom.href, 'the top copy carries the identical tagged href');
ok(top && top.visible, 'visible on the page');
ok(top && top.fontSize < bottom.fontSize, 'genuinely smaller than the bottom button (' + (top&&top.fontSize) + 'px vs ' + (bottom&&bottom.fontSize) + 'px)');
ok(top && top.radius === '999px', 'the top copy is also a pill, same family as the bottom one');

// reopen -- must not double-tag either copy
await page.evaluate(() => { closeFinds(); });
await page.evaluate(() => { openFinds(); });
await page.waitForTimeout(150);
const [bottom2, top2] = await page.evaluate(() => [
  document.getElementById('findsStorefrontLink').href,
  document.getElementById('findsStorefrontLinkTop').href,
]);
ok(bottom2 === bottom.href, 'reopening does not double-tag the bottom button (' + bottom2 + ')');
ok(top2 === top.href, 'reopening does not double-tag the top button (' + top2 + ')');

// confirm it did NOT disturb the existing Edit/Trending crosslinks
const others = await page.evaluate(() => ({
  edit: document.querySelector('#s-finds .dc-xlink') ? document.querySelector('#s-finds .dc-xlink').textContent.includes('The Edit') : false,
  trend: document.querySelector('#s-finds .dc-trend-link[onclick]') ? true : false,
  trendColour: getComputedStyle(document.querySelector('#s-finds .dc-trend-link')).color,
}));
ok(others.edit, 'the existing Edit crosslink is untouched');
ok(others.trend, 'the existing Trending crosslink is untouched');
ok(others.trendColour === 'rgb(15, 166, 182)', 'Trending keeps its own teal, now visually distinct from the gold Storefront buttons');

// the top button sits above the product cards, below the search/category controls
const order = await page.evaluate(() => {
  const catnav = document.getElementById('findsCatNav');
  const topBtn = document.getElementById('findsStorefrontLinkTop');
  const firstItem = document.querySelector('#s-finds .dc-item');
  return { afterCatnav: topBtn.getBoundingClientRect().top >= catnav.getBoundingClientRect().bottom,
           beforeItems: topBtn.getBoundingClientRect().top < firstItem.getBoundingClientRect().top };
});
ok(order.afterCatnav, 'the top button sits below the search/category controls, not above them');
ok(order.beforeItems, 'and above the first product card, where she asked for it');

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
