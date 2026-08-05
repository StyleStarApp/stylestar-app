// Drives the Add to Home Screen whisper (Cath's Option B, 2026-08-05) in real
// Chromium: iOS instructions, Android "Add it now" via a faked
// beforeinstallprompt, desktop silence, standalone silence, ✕ persistence.
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
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ FAIL: ' + name); } };

const browser = await chromium.launch();

const boot = async (ctxOpts, initFns = []) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  for (const fn of initFns) await page.addInitScript(fn);
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); });
  await page.waitForSelector('#s-wb.act', { timeout: 5000 });
  await page.waitForTimeout(300);
  return { ctx, page, errors };
};

const state = (page) => page.evaluate(() => {
  const el = document.getElementById('a2hs');
  const b = el.getBoundingClientRect();
  return { on: el.classList.contains('on'), visible: b.width > 0 && b.height > 0,
    txt: document.getElementById('a2hsTxt').textContent.trim() };
});

console.log('1. Desktop browser (no install API, not iOS): whisper stays silent');
{
  const { ctx, page, errors } = await boot({});
  const s = await state(page);
  ok(!s.on && !s.visible, 'hidden on desktop UA with no beforeinstallprompt');
  ok(errors.length === 0, 'no JS errors');
  await ctx.close();
}

console.log('2. iPhone: the two-tap whisper shows, in her wording');
{
  const { ctx, page, errors } = await boot({ userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const s = await state(page);
  ok(s.on && s.visible, 'whisper visible on iOS');
  ok(s.txt.startsWith('Add Style Star as a free app to your phone'), 'her line, word for word');
  ok(s.txt.includes('Add to Home Screen'), 'names the Add to Home Screen tap');
  const detail = await page.evaluate(() => {
    const t = document.getElementById('a2hsTxt');
    const el = document.getElementById('a2hs');
    const x = el.querySelector('.a2-x').getBoundingClientRect();
    const tb = t.getBoundingClientRect(), eb = el.getBoundingClientRect();
    const bold = t.querySelector('b');
    return { share: !!t.querySelector('.a2-sh'), heart: !!t.querySelector('.a2-h'),
      xLeft: x.left < tb.left, noTap: !bold.classList.contains('tap'),
      centered: Math.abs((tb.left + tb.right) / 2 - (eb.left + eb.right) / 2) <= 2,
      block: getComputedStyle(t).display === 'block' };
  });
  ok(detail.share, 'share glyph in the line');
  ok(detail.heart, 'pink heart in the line');
  ok(detail.xLeft, '✕ sits on the LEFT (wishlist convention)');
  ok(detail.noTap, 'iOS bold is emphasis only, no dead-link underline');
  ok(detail.centered, 'text centers true in the strip');
  ok(detail.block, 'text is block-level so text-wrap:balance applies');
  console.log('3. ✕ dismisses forever');
  await page.click('#a2hs .a2-x');
  const s2 = await state(page);
  ok(!s2.on, 'hidden after ✕');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); });
  await page.waitForSelector('#s-wb.act');
  await page.waitForTimeout(300);
  const s3 = await state(page);
  ok(!s3.on, 'still hidden after a reload (ss_a2hs persists)');
  ok(errors.length === 0, 'no JS errors on the iOS path');
  await ctx.close();
}

console.log('4. Android/Chrome: beforeinstallprompt turns the whisper into a real button');
{
  const { ctx, page, errors } = await boot({});
  await page.evaluate(() => {
    window._testPrompted = 0;
    const e = new Event('beforeinstallprompt');
    e.prompt = () => { window._testPrompted++; };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await page.waitForTimeout(200);
  const s = await state(page);
  ok(s.on && s.visible, 'whisper appears once the prompt event fires');
  ok(s.txt.includes('Add it now'), 'says "Add it now" instead of the iOS taps');
  const tappable = await page.evaluate(() => {
    const b = document.querySelector('#a2hsTxt b');
    return b.classList.contains('tap') && getComputedStyle(b).cursor === 'pointer';
  });
  ok(tappable, 'the "Add it now" is a real tap target');
  await page.click('#a2hsTxt b.tap');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    prompted: window._testPrompted,
    stamped: !!localStorage.getItem('ss_a2hs'),
    on: document.getElementById('a2hs').classList.contains('on') }));
  ok(after.prompted === 1, 'tap calls prompt() exactly once');
  ok(after.stamped, 'accepted install stamps ss_a2hs');
  ok(!after.on, 'whisper stands down after accepting');
  ok(errors.length === 0, 'no JS errors on the Android path');
  await ctx.close();
}

console.log('5. Already installed (standalone display mode): silent even on iOS');
{
  const { ctx, page, errors } = await boot({ userAgent: IOS_UA, isMobile: true, hasTouch: true },
    [() => { window.matchMedia = (q) => ({ matches: q.includes('standalone'), media: q, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }); }]);
  const s = await state(page);
  ok(!s.on, 'hidden when running as an installed app');
  ok(errors.length === 0, 'no JS errors in standalone');
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
