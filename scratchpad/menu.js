// The Menu (2026-07-30, Cath's ask): a LABELLED hamburger chip top-left, in
// addition to the standard footer, opening a left drawer that lists every
// destination. Drives the REAL index.html in Chromium.  node scratchpad/menu.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const PORT = 8902, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(HTML); return;
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

const SEED = {
  userName: 'Test', answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  topArchNames: ['Timeless Classic', 'Modern Muse', 'Coastal Chic'],
  portrait: 'A test portrait.', motto: 'Shine on.'
};

const browser = await chromium.launch();
async function newPage(width, seeded) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('**/.netlify/functions/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  if (seeded) await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  return page;
}

const page = await newPage(390, true);

// ---------------------------------------------------------------------------
console.log('\n1. The chip: visible, labelled in WORDS, hidden only where it should be');
const SHOW_ON = ['s-wel', 's-wb', 's-quiz', 's-res', 's-photo-res', 's-story', 's-shop', 's-dream', 's-shopstyle', 's-wardrobe', 's-wishlist', 's-faq', 's-privacy', 's-terms', 's-photo'];
for (const scr of SHOW_ON) {
  const r = await page.evaluate(scr => {
    show(scr);
    const c = document.getElementById('menuChip');
    const b = c.getBoundingClientRect();
    return { vis: b.width > 0 && getComputedStyle(c).display !== 'none', label: c.textContent.trim(), cursor: getComputedStyle(c).cursor };
  }, scr);
  ok(scr + ' shows the Menu chip', r.vis && r.label === 'Menu' && r.cursor === 'pointer', JSON.stringify(r));
}
for (const scr of ['s-chat', 's-load', 's-photo-load']) {
  const hidden = await page.evaluate(scr => {
    show(scr);
    return getComputedStyle(document.getElementById('menuChip')).display === 'none';
  }, scr);
  ok(scr + ' hides the chip (own header / loading moment)', hidden);
}

// ---------------------------------------------------------------------------
console.log('\n2. The chip never covers the letterhead logo (both widths)');
for (const width of [390, 360]) {
  const p = await newPage(width, true);
  for (const scr of ['s-faq', 's-privacy', 's-terms']) {
    const r = await p.evaluate(scr => {
      show(scr);
      const chip = document.getElementById('menuChip').getBoundingClientRect();
      const logo = document.querySelector('#' + scr + ' .go-home[class*="lh-logo"]').getBoundingClientRect();
      const overlap = !(chip.bottom <= logo.top || logo.bottom <= chip.top || chip.right <= logo.left || logo.right <= chip.left);
      return { overlap, chipBottom: Math.round(chip.bottom), logoTop: Math.round(logo.top) };
    }, scr);
    ok(scr + ' @' + width + ': chip and letterhead logo do not overlap', !r.overlap, JSON.stringify(r));
  }
  await p.context().close();
}

// ---------------------------------------------------------------------------
console.log('\n3. Open / close: chip opens, X closes, veil closes, navigating closes');
await page.evaluate(() => show('s-wel'));
await page.click('#menuChip');
ok('chip opens the drawer', await page.evaluate(() =>
  document.body.classList.contains('menu-open') && document.getElementById('menuPanel').getBoundingClientRect().width > 0));
ok('drawer sits BELOW the entrance overlay layer', await page.evaluate(() =>
  +getComputedStyle(document.getElementById('menuPanel')).zIndex < 9998));
await page.click('.menu-x');
ok('X closes it', await page.evaluate(() => !document.body.classList.contains('menu-open')));
await page.click('#menuChip');
await page.mouse.click(370, 700); // on the veil, right of the 300px drawer
ok('tapping the dim veil closes it', await page.evaluate(() => !document.body.classList.contains('menu-open')));

// ---------------------------------------------------------------------------
console.log('\n4. Every row goes where it says (returning woman)');
const ROWS = [
  ['Home', 's-wb'], ['Style Portrait', 's-res'], ['Style Quiz', 's-quiz'], ['Refine your Preferences', 's-pref'], ['Analyze an Outfit', 's-photo'],
  ['Stylist Chat', 's-chat'], ['Shop your Style', 's-shopstyle'], ['Style Star Mall', 's-shop'], ['Style Star Edit', 's-dream'],
  ['My Wishlist', 's-wishlist'], ['Your Wardrobe', 's-wardrobe'], ["What's Trending", 's-wardrobe'],
  ['My Story', 's-story'], ['FAQ', 's-faq'], ['Privacy', 's-privacy'], ['Terms', 's-terms']
];
for (const [label, dest] of ROWS) {
  await page.evaluate(() => { show('s-wel'); menuOpen(); });
  await page.click('.menu-row:text-is("' + label + '")');
  if (label === 'Shop your Style') {
    // Same flow as the hub button: an un-refined woman gets the refine nudge
    // first; skipping it lands her in the shop.
    const nudged = await page.evaluate(() => !!document.querySelector('#styleNudge.on'));
    ok('"Shop your Style" shows the refine nudge first (hub behavior)', nudged);
    await page.evaluate(() => styleNudgeSkip());
  }
  const r = await page.evaluate(() => ({
    act: document.querySelector('.scr.act').id,
    closed: !document.body.classList.contains('menu-open'),
    trendOn: !!document.querySelector('#s-wardrobe .wdr-tab[data-tab="trend"].on')
  }));
  const good = r.act === dest && r.closed && (label !== "What's Trending" || r.trendOn);
  ok('"' + label + '" → ' + dest + (label === "What's Trending" ? ' (trend tab active)' : ''), good, JSON.stringify(r));
}
// ---------------------------------------------------------------------------
console.log("\n4b. Share Style Star: the SITE goes out, never her results (Cath's ask 2026-07-31)");
await page.evaluate(() => {
  window._shared = null;
  navigator.share = (payload) => { window._shared = payload; return Promise.resolve(); };
  show('s-dream'); menuOpen();
});
await page.click('.menu-row:text-is("Share Style Star")');
{
  const r = await page.evaluate(() => ({
    shared: window._shared,
    closed: !document.body.classList.contains('menu-open'),
    act: document.querySelector('.scr.act').id
  }));
  ok('tapping Share opens the native share sheet', !!r.shared);
  ok('shares the plain site link, nothing personal attached', r.shared && r.shared.url === 'https://stylestar.app'
    && !JSON.stringify(r.shared).match(/[?&](r|token)=/), JSON.stringify(r.shared));
  ok('drawer closes and she stays on her screen', r.closed && r.act === 's-dream', JSON.stringify(r));
}
await page.evaluate(() => {
  delete navigator.share; // desktop: no share sheet, falls back to copy
  window._copied = null; window._alerted = null;
  navigator.clipboard.writeText = (t) => { window._copied = t; return Promise.resolve(); };
  window.alert = (m) => { window._alerted = m; };
  menuOpen();
});
await page.click('.menu-row:text-is("Share Style Star")');
await page.waitForFunction(() => window._alerted !== null);
ok('without a share sheet the link is copied instead, and she is told',
  await page.evaluate(() => window._copied && window._copied.indexOf('https://stylestar.app') !== -1 && /copied/i.test(window._alerted)),
  await page.evaluate(() => JSON.stringify({ copied: window._copied, alerted: window._alerted })));

// ---------------------------------------------------------------------------
console.log("\n4c. Journey order + the Start-here pill (Cath, 2026-07-31)");
{
  const order = await page.evaluate(() => [...document.querySelectorAll('.menu-row')].map(r => r.textContent.trim().replace(/Start here$/, '').trim()));
  const iQuiz = order.indexOf('Style Quiz'), iPort = order.indexOf('Style Portrait'), iRef = order.indexOf('Refine your Preferences');
  ok('Style group reads in journey order: Quiz, then Portrait, then Refine',
    iQuiz > -1 && iQuiz < iPort && iPort < iRef, JSON.stringify({ iQuiz, iPort, iRef }));
  await page.evaluate(() => { show('s-wel'); menuOpen(); });
  ok('returning woman sees NO Start-here pill', await page.evaluate(() =>
    !document.getElementById('menuStartPill').classList.contains('on')));
}

// ---------------------------------------------------------------------------
console.log("\n4d. First-reveal nudge on the portrait: refine, or wave it off, never nags twice");
{
  await page.evaluate(() => { localStorage.removeItem('ss_refinehint'); show('s-res'); });
  ok('un-refined woman sees the "make it truly yours" strip', await page.evaluate(() => {
    const n = document.getElementById('refineNext');
    return n.classList.contains('on') && n.getBoundingClientRect().height > 30 && /sizes, colors and faves/.test(n.textContent);
  }));
  await page.click('.rn-body');
  ok('tapping it opens the preferences flow', await page.evaluate(() =>
    document.querySelector('.scr.act').id === 's-pref'));
  ok('...and it never shows again after that', await page.evaluate(() => {
    show('s-res'); return !document.getElementById('refineNext').classList.contains('on');
  }));
  await page.evaluate(() => { localStorage.removeItem('ss_refinehint'); show('s-res'); });
  await page.click('.rn-x');
  ok('the ✕ dismisses it for good (stays gone on a later visit)', await page.evaluate(() => {
    const gone = !document.getElementById('refineNext').classList.contains('on');
    show('s-wel'); show('s-res');
    return gone && !document.getElementById('refineNext').classList.contains('on');
  }));
  await page.evaluate(() => { localStorage.removeItem('ss_refinehint'); prefs.colorsLove.push('Blush'); show('s-res'); });
  ok('a woman who already refined never sees it at all', await page.evaluate(() =>
    !document.getElementById('refineNext').classList.contains('on')));
  await page.evaluate(() => { prefs.colorsLove.pop(); });
}

ok('menu quiz for a returning woman restarts at question 1, slider centered (the retake flow)',
  await page.evaluate(() => {
    show('s-wel'); menuQuiz();
    return document.querySelector('.scr.act').id === 's-quiz'
      && document.getElementById('pl').textContent === '1 of 12'
      && document.getElementById('sl').value === '6';
  }));

// ---------------------------------------------------------------------------
console.log('\n5. New visitor: Home goes to Welcome, quiz starts fresh');
const fresh = await newPage(390, false);
await fresh.evaluate(() => { show('s-faq'); menuOpen(); });
await fresh.click('.menu-row:text-is("Home")');
ok('Home → s-wel with no saved data', await fresh.evaluate(() => document.querySelector('.scr.act').id) === 's-wel');
await fresh.evaluate(() => menuOpen());
ok('new visitor sees the gold "Start here" pill on Style Quiz', await fresh.evaluate(() => {
  const p = document.getElementById('menuStartPill');
  return p.classList.contains('on') && p.closest('.menu-row').textContent.includes('Style Quiz')
    && p.getBoundingClientRect().width > 0;
}));
await fresh.click('.menu-row:has-text("Style Quiz")');
ok('Style Quiz → s-quiz, question 1', await fresh.evaluate(() =>
  document.querySelector('.scr.act').id === 's-quiz' && document.getElementById('pl').textContent === '1 of 12'));
for (const label of ['Style Portrait', 'Shop your Style', 'Refine your Preferences']) {
  await fresh.evaluate(() => { show('s-wel'); menuOpen(); });
  await fresh.click('.menu-row:text-is("' + label + '")');
  ok('"' + label + '" with no saved data honestly routes to the quiz', await fresh.evaluate(() =>
    document.querySelector('.scr.act').id === 's-quiz'));
}
ok('no JS errors (fresh visitor)', fresh.errors.length === 0, fresh.errors.join(' | '));
await fresh.context().close();

// ---------------------------------------------------------------------------
console.log("\n5b. Cath's catch: leaving a mid-way quiz must take the progress bar with it");
const pq = await newPage(390, true);
await pq.evaluate(() => { show('s-wel'); menuOpen(); });
await pq.click('.menu-row:text-is("Style Quiz")');
ok('quiz shows its progress bar', await pq.evaluate(() =>
  getComputedStyle(document.getElementById('pw')).display !== 'none'
  && document.getElementById('pl').textContent === '1 of 12'));
await pq.evaluate(() => menuOpen());
await pq.click('.menu-row:text-is("Analyze an Outfit")');
ok('leaving via the Menu hides the "1 of 12" bar (her screenshot)', await pq.evaluate(() =>
  document.querySelector('.scr.act').id === 's-photo'
  && getComputedStyle(document.getElementById('pw')).display === 'none'));
for (const [how, go] of [['footer link', () => showFAQ()], ['logo home', () => goHome()]]) {
  await pq.evaluate(() => { show('s-wel'); menuQuiz(); });
  await pq.evaluate(go);
  ok('leaving via ' + how + ' hides it too', await pq.evaluate(() =>
    getComputedStyle(document.getElementById('pw')).display === 'none'));
}
await pq.evaluate(() => { show('s-wel'); menuQuiz(); });
await pq.evaluate(() => show('s-photo'));
await pq.goBack();
await pq.waitForTimeout(150);
ok('browser Back INTO the mid-way quiz brings the bar back', await pq.evaluate(() =>
  document.querySelector('.scr.act').id === 's-quiz'
  && getComputedStyle(document.getElementById('pw')).display !== 'none'));
ok('no JS errors (progress-bar drive)', pq.errors.length === 0, pq.errors.join(' | '));
await pq.context().close();

// ---------------------------------------------------------------------------
console.log('\n6. Readability + fit at 360px');
const p360 = await newPage(360, true);
await p360.evaluate(() => { show('s-wel'); menuOpen(); });
const fit = await p360.evaluate(() => {
  const panel = document.getElementById('menuPanel').getBoundingClientRect();
  const rows = [...document.querySelectorAll('.menu-row')];
  const fg = getComputedStyle(rows[0]).color.match(/\d+/g).map(Number);
  const oneLine = rows.every(r => { const b = r.getBoundingClientRect(); return b.height < 46; });
  return { panelW: Math.round(panel.width), viewportOk: document.documentElement.scrollWidth <= 360, fg, oneLine, rowCount: rows.length };
});
function lum(rgb) { const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
const ratio = (Math.max(lum(fit.fg), lum([251, 250, 247])) + 0.05) / (Math.min(lum(fit.fg), lum([251, 250, 247])) + 0.05);
ok('drawer fits inside 360px, no sideways scroll', fit.panelW <= 303 && fit.viewportOk, JSON.stringify(fit));
ok('all ' + fit.rowCount + ' rows are single-line at the drawer width', fit.oneLine && fit.rowCount === 17);
ok('row text contrast ≥ 4.5:1 (got ' + ratio.toFixed(1) + ':1)', ratio >= 4.5);
ok('no JS errors @360', p360.errors.length === 0, p360.errors.join(' | '));
await p360.context().close();

// ---------------------------------------------------------------------------
console.log('\n7. Zero JS errors across the whole drive');
ok('no page errors', page.errors.length === 0, page.errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
