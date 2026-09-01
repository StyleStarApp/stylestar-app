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
// ⚠️ DELIBERATE CHANGE 2026-08-10, her call: 's-chat' moved from the hidden
// list to this one. The old reason ("the chat has its own tight header") was
// measured and found untrue -- the chip clears the chat's star by 8px and never
// touches its title or Back. See scratchpad/chipchat.js.
const SHOW_ON = ['s-wel', 's-wb', 's-quiz', 's-res', 's-photo-res', 's-story', 's-shop', 's-dream', 's-shopstyle', 's-wardrobe', 's-wishlist', 's-faq', 's-privacy', 's-terms', 's-photo', 's-chat'];
for (const scr of SHOW_ON) {
  const r = await page.evaluate(scr => {
    show(scr);
    const c = document.getElementById('menuChip');
    const b = c.getBoundingClientRect();
    return { vis: b.width > 0 && getComputedStyle(c).display !== 'none', label: c.textContent.trim(), cursor: getComputedStyle(c).cursor };
  }, scr);
  ok(scr + ' shows the Menu chip', r.vis && r.label === 'Menu' && r.cursor === 'pointer', JSON.stringify(r));
}
for (const scr of ['s-load', 's-photo-load']) {
  const hidden = await page.evaluate(scr => {
    show(scr);
    return getComputedStyle(document.getElementById('menuChip')).display === 'none';
  }, scr);
  ok(scr + ' hides the chip (loading moment)', hidden);
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
  ['Home', 's-wb'], ['Style Portrait', 's-res'], ['Style Quiz', 's-quiz'], ['Refine your Preferences', 's-pref'], ['Analyze your Outfit', 's-photo'],
  ['Ask your Stylist', 's-chat'], ['Shop your Style', 's-shopstyle'], ['Style Star Mall', 's-shop'], ['Style Star Edit', 's-dream'],
  ['Your Wishlist', 's-wishlist'], ['Your Wardrobe List', 's-wardrobe'], ["What's Trending", 's-wardrobe'],
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
console.log("\n4b-ii. Follow on Instagram opens her profile in a new tab, drawer closes");
{
  await page.evaluate(() => { show('s-wel'); menuOpen(); });
  const opened = await page.evaluate(() => {
    window.__ig = null;
    const real = window.open;
    window.open = (u, t, f) => { window.__ig = { u, t, f }; return null; };
    document.querySelectorAll('.menu-row').forEach(r => {
      if (r.textContent.trim() === 'Follow on Instagram') r.click();
    });
    const got = window.__ig; window.open = real;
    return { got, drawerClosed: !document.body.classList.contains('menu-open'), screen: (document.querySelector('.scr.act') || {}).id };
  });
  ok('opens her confirmed handle', opened.got && opened.got.u === 'https://instagram.com/style_star.app', JSON.stringify(opened.got));
  ok('in a new tab, with noopener', opened.got && opened.got.t === '_blank' && /noopener/.test(opened.got.f || ''));
  ok('the drawer closes', opened.drawerClosed);
  ok('but she stays on the screen she was reading', opened.screen === 's-wel', opened.screen);
}

console.log("\n4c. Journey order + the Start-here pill (Cath, 2026-07-31)");
{
  const order = await page.evaluate(() => [...document.querySelectorAll('.menu-row')].map(r => r.textContent.trim().replace(/Start here$/, '').trim()));
  const iQuiz = order.indexOf('Style Quiz'), iPort = order.indexOf('Style Portrait'), iRef = order.indexOf('Refine your Preferences');
  ok('Style group reads in journey order: Quiz, then Portrait, then Refine',
    iQuiz > -1 && iQuiz < iPort && iPort < iRef, JSON.stringify({ iQuiz, iPort, iRef }));
  /* The card sits DIRECTLY below the portrait it is generated from, and that
     placement is the decision, not an accident: it was deliberately not put in
     About beside "Share Style Star", because that row shares the SITE and this
     one shares HER. Next to the portrait the two can never read as duplicates. */
  const iCard = order.indexOf('Style Star Card');
  ok('Style Star Card sits directly below Style Portrait, not beside Share Style Star',
    iCard === iPort + 1, JSON.stringify({ iPort, iCard, iShareRow: order.indexOf('Share Style Star') }));
  const iShop = order.indexOf('Shop your Style'), iWl = order.indexOf('Your Wishlist'),
    iEdit = order.indexOf('Style Star Edit'), iMall = order.indexOf('Style Star Mall');
  ok('Shop group order: Shop your Style, Your Wishlist, Edit, Mall last (Cath, 2026-07-31)',
    iShop > -1 && iShop < iWl && iWl < iEdit && iEdit < iMall, JSON.stringify({ iShop, iWl, iEdit, iMall }));
  const iShare = order.indexOf('Share Style Star'), iStory = order.indexOf('My Story');
  ok('Share Style Star sits above My Story in About (Cath, 2026-07-31)',
    iShare > -1 && iShare < iStory, JSON.stringify({ iShare, iStory }));
  // the share/follow pair belongs together, above the reading rows
  const iInsta = order.indexOf('Follow on Instagram');
  ok('Follow on Instagram sits between Share and My Story (Cath, 2026-08-08)',
    iInsta > -1 && iShare < iInsta && iInsta < iStory, JSON.stringify({ iShare, iInsta, iStory }));
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
for (const label of ['Style Portrait', 'Shop your Style', 'Refine your Preferences', 'Style Star Card']) {
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
await pq.click('.menu-row:text-is("Analyze your Outfit")');
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
console.log("\n5c. Style Star Card — the one row that opens an overlay, not a screen");
/* Her ask 2026-08-23: "wondering if share style card should be on our drop down
   menu?" It was reachable from exactly two screens before this, so a woman deep
   in shopping had no route back to it — her own mother's lesson pointed at the
   newest feature. */
const pc = await newPage(390, true);
await pc.evaluate(() => { show('s-wb'); });
const histBefore = await pc.evaluate(() => history.length);
await pc.evaluate(() => menuOpen());
await pc.click('.menu-row:text-is("Style Star Card")');
/* ⚠️ WAIT FOR THE THING, NEVER A FIXED DELAY. The card is drawn on a canvas
   behind a font-loading promise, so how long it takes is a property of the
   machine, not of the app — a 1600ms sleep passed on one run and failed on the
   next while the overlay was arriving in ~700ms either way. Waiting on the
   element is both faster and honest, and a miss FAILS A CHECK rather than
   throwing, so the twenty assertions below it still get to run. */
let cardShown = true;
try { await pc.waitForSelector('#cardPreview', { timeout: 15000 }); }
catch (e) { cardShown = false; }
ok('the row opens her card', cardShown);
ok('the drawer closed behind it', await pc.evaluate(() =>
  !document.body.classList.contains('menu-open')));
/* ⚠️⚠️ THE ASSERTION THIS SECTION EXISTS FOR, and it caught a real bug before
   it shipped. menuGo() deliberately does NOT pop the drawer's own history entry
   — it relies on the destination NAVIGATING and replacing it. This row does not
   navigate: it opens an overlay on top of whatever she was reading. Wired
   through menuGo, the drawer's entry would be left dangling and her first
   hardware Back press would be spent silently on a drawer that is already shut,
   with the card still sitting there. menuClose() pops it, so the count returns
   to where it started. */
/* ⚠️ MEASURED ON _menuPushed, NOT ON history.length — the first version of this
   assertion used the length and was simply WRONG about how history works:
   history.back() moves the pointer, it does not remove the entry, so the length
   never comes back down and the check failed on a correct fix. _menuPushed is
   the app's own record of whether the drawer still owes a pop, which is exactly
   the claim. ▶ Assert the state that means the thing, not a number that
   correlates with it. */
ok('the drawer left no dangling history entry to eat her Back press',
   await pc.evaluate(() => _menuPushed) === false,
   'history was ' + histBefore + ' before opening the drawer');
/* And she is returned to where she was, not moved somewhere new: the overlay is
   a layer, so the screen underneath must be untouched. */
ok('she is still on the screen she was reading underneath', await pc.evaluate(() =>
  document.querySelector('.scr.act').id === 's-wb'));
ok('no JS errors (card from the menu)', pc.errors.length === 0, pc.errors.join(' | '));
await pc.context().close();

// ---------------------------------------------------------------------------
console.log("\n5d. A conversation is waiting — the pink star + pale yellow row");
/* Kathy, twice: "it was gone or I couldn't find it." Nothing was ever lost; the
   resume whisper just lives only on Welcome Back. */
{
  const pw = await newPage(390, true);
  const mark = () => pw.evaluate(() => {
    menuOpen();
    const row = [...document.querySelectorAll('.menu-row')].find(r => r.querySelector('.menu-cw'));
    if (!row) return null;
    const st = row.querySelector('.menu-cw');
    const cs = getComputedStyle(row), ss = getComputedStyle(st);
    return { on: row.classList.contains('cw-on'), starShown: ss.display !== 'none',
      bg: cs.backgroundColor, fill: st.querySelector('polygon').getAttribute('fill'),
      label: row.textContent.trim(), h: row.getBoundingClientRect().height };
  });

  /* ⚠️ THE ASSERTION THAT MATTERS MOST IS THE NEGATIVE ONE. A mark that is
     always on is not a signal, it is decoration — and worse, it would promise a
     conversation to a woman who has never had one. The resume whisper learned
     this by failing hubs.js's "graduated: no whisper ever again". */
  await pw.evaluate(() => { try{localStorage.removeItem('ss_chat');localStorage.removeItem('ss_chat_t')}catch(e){} });
  let m = await mark();
  ok('the row carries the mark markup', m !== null);
  ok('nothing waiting -> no star, no fill', m && !m.on && !m.starShown, JSON.stringify(m));

  /* A conversation is hers only if SHE said something: opening the chat writes
     the stylist's own greeting, which is an empty room with a hello in it. */
  await pw.evaluate(() => {
    localStorage.setItem('ss_chat', JSON.stringify([{ role: 'assistant', content: 'Hi!' }]));
    localStorage.setItem('ss_chat_t', String(Date.now()));
  });
  m = await mark();
  ok('the stylist greeting ALONE is not a conversation', m && !m.on, JSON.stringify(m));

  await pw.evaluate(() => {
    localStorage.setItem('ss_chat', JSON.stringify([
      { role: 'assistant', content: 'Hi!' }, { role: 'user', content: 'I need a long dress' }]));
    localStorage.setItem('ss_chat_t', String(Date.now()));
  });
  m = await mark();
  ok('a real conversation -> the star shows', m && m.on && m.starShown, JSON.stringify(m));
  ok('the row fills pale yellow #F7E9C0', m && m.bg === 'rgb(247, 233, 192)', m && m.bg);
  /* The SAME pink the chat header's star uses. Her mark system: a pink star is
     the stylist working, a pink heart is Catherine speaking. */
  ok('the star is the stylist pink #EC4899', m && m.fill === '#EC4899', m && m.fill);
  ok('the row still reads "Ask your Stylist"', m && m.label === 'Ask your Stylist', m && m.label);
  ok('the mark costs the row no height', m && m.h < 46, m && String(m.h));

  /* ⚠️ 6 HOURS, the same shelf life her saved pieces get. ss_chat never expires
     on its own, so without this the mark would greet her about a conversation
     she had weeks ago — a nag, not a signal. */
  await pw.evaluate(() => localStorage.setItem('ss_chat_t', String(Date.now() - 7 * 3600 * 1000)));
  m = await mark();
  ok('a conversation older than 6 hours goes quiet again', m && !m.on, JSON.stringify(m));
  ok('no JS errors (chat-waiting mark)', pw.errors.length === 0, pw.errors.join(' | '));
  await pw.context().close();
}

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
// 21 since "Style Star Card" joined the Style group directly below Style
// Portrait (her ask, 2026-08-23 — it is the app's only piece of distribution and
// it was reachable from two screens only). 20 was "Add as an App" (Cath,
// 2026-08-19 — her ask, so the install invitation has a findable PLACE and not
// only the Welcome Back whisper, which a first-time visitor never sees). 19 was
// Contact (2026-08-17); 18 was "Follow on Instagram" (2026-08-08). Deliberate
// update, not a silence: an explicit count is what makes a row going MISSING
// fail loudly. ⚠️ Verified separately that nothing WRAPS — every row measured
// 43-44px against this 46px threshold, so only the count moved.
// ⚠️ 21 -> 22 on 2026-09-01, updated DELIBERATELY, not silenced: this suite was
// already failing on a clean tree before that day's CSS extraction (proved in a
// git worktree at HEAD, same machine, one variable), so a 22nd row had been
// added at some point and this restated count was never moved with it. Measured
// again at the drawer width before touching it: 22 rows, tallest 44.4px against
// the 46px threshold, so nothing wraps and only the number was wrong.
ok('all ' + fit.rowCount + ' rows are single-line at the drawer width', fit.oneLine && fit.rowCount === 22);
ok('row text contrast ≥ 4.5:1 (got ' + ratio.toFixed(1) + ':1)', ratio >= 4.5);
ok('no JS errors @360', p360.errors.length === 0, p360.errors.join(' | '));
await p360.context().close();

// ---------------------------------------------------------------------------
console.log('\n7. The drawer owns a history entry (hardware Back closes it, 2026-07-31)');
const ph = await newPage(390, true);
// Back with the drawer open just closes the drawer and stays on the screen.
await ph.evaluate(() => { show('s-wardrobe'); menuOpen(); });
await ph.goBack();
await ph.waitForTimeout(150);
let hb = await ph.evaluate(() => ({ open: document.body.classList.contains('menu-open'), scr: document.querySelector('.scr.act').id }));
ok('hardware Back closes the drawer, stays on the screen', !hb.open && hb.scr === 's-wardrobe');
// Navigating FROM the drawer replaces its entry: one Back returns to the origin
// screen, never to a phantom drawer state.
await ph.evaluate(() => { menuOpen(); menuGo(showFAQ); });
hb = await ph.evaluate(() => ({ open: document.body.classList.contains('menu-open'), scr: document.querySelector('.scr.act').id }));
ok('menu navigation lands with the drawer closed', !hb.open && hb.scr === 's-faq');
await ph.goBack();
await ph.waitForTimeout(150);
hb = await ph.evaluate(() => ({ open: document.body.classList.contains('menu-open'), scr: document.querySelector('.scr.act').id }));
ok('one Back from the destination returns to the origin screen', !hb.open && hb.scr === 's-wardrobe');
// Closing via the ✕ pops the drawer's entry so Back stays honest afterwards.
await ph.evaluate(() => { show('s-story'); menuOpen(); menuClose(); });
await ph.waitForTimeout(150);
await ph.goBack();
await ph.waitForTimeout(150);
hb = await ph.evaluate(() => ({ open: document.body.classList.contains('menu-open'), scr: document.querySelector('.scr.act').id }));
ok('after open + ✕ close, Back leaves the page normally', !hb.open && hb.scr === 's-wardrobe', JSON.stringify(hb));
ok('no JS errors (menu history drive)', ph.errors.length === 0, ph.errors.join(' | '));
await ph.context().close();

// ---------------------------------------------------------------------------
console.log('\n8. Zero JS errors across the whole drive');
ok('no page errors', page.errors.length === 0, page.errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
