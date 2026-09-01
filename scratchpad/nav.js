// Navigation standardisation — updated 2026-08-08 for Cath's from-zero footer
// rethink: ONE template, two balanced rows in one voice (14px, gold stars) —
// Home ★ Shop ★ [Instagram gradient tile] over Privacy ★ Terms ★ FAQ ★ Contact — with
// My Story CUT and each page OMITTING its own link. Every brand logo still
// tappable → goHome(). Drives the REAL index.html.  node scratchpad/nav.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const PORT = 8899, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
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

// Screens whose OWN footer container should show the standard footer, plus the
// two that rely on the shared global .quiz-footer (s-dream, s-shopstyle).
const OWN_FOOT = {
  's-wel': '.hm-foot:not(.wb-foot)', 's-wb': '.wb-foot', 's-res': '.foot',
  's-photo-res': '.foot', 's-story': '.pg-foot', 's-shop': '.mall-foot',
  's-wardrobe': '.wdr-foot', 's-wishlist': '.wl-foot', 's-faq': '.faq-foot',
  's-privacy': '.pg-foot', 's-terms': '.pg-foot', 's-contact': '.pg-foot'
};
const GLOBAL_FOOT = ['s-dream', 's-shopstyle'];

const page = await newPage(390, true);

// ---------------------------------------------------------------------------
console.log('\n1. One template, twelve containers, each page omits its OWN link');
const foots = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[data-std-foot]')];
  return { n: els.length };
});
// 14 since the "Add as an App" page joined the family (Cath, 2026-08-19) and
// carries the same standard footer as its siblings. Deliberate update.
// ⚠️ STILL 14, and the round trip is worth recording: the shared wishlist at
// /list/<token> briefly carried a standard footer, and her call was that a page
// of app chrome under somebody's personal gift list reads as an advertisement
// stapled to it. It has its own quiet tail instead -- one Mall entry and an
// 11px Privacy · Terms line -- so this count is unchanged after all.
// ⚠️ 14 -> 16, updated DELIBERATELY 2026-09-01 and not silenced. This was
// already failing on a clean tree before that day's CSS extraction, so screens
// had gained footers and the restated count never moved with them. Verified in
// the real DOM before touching the number: 17 containers, one each for s-wb,
// s-wel, s-res, s-photo-res, s-story, s-shop, s-wardrobe, s-wishlist, s-faq,
// s-contact, s-journal-hub, s-journal, s-journal-fall-florida, s-a2hs,
// s-privacy, s-terms, plus the global one — NO screen carries two, and all 17
// gradient ids are unique. (16 -> 17 on 2026-09-01, article #2.) The
// hardcoded count is kept on purpose: noticing a screen quietly gaining or
// losing a footer is this assertion's whole job.
// ⚠️ 17 -> 18, updated DELIBERATELY 2026-09-01: What's Trending became its own
// screen (s-trending) and carries its own footer, exactly like every other page
// with a real URL. This assertion caught it on the first run, which is the
// system working. Verified before the number moved: the two sibling checks
// below (unique gradient id per footer, every tile referencing its own) both
// pass at 18, so no screen gained a second footer and no id is shared.
ok('exactly 18 standard-footer containers', foots.n === 18, 'got ' + foots.n);
const links = await page.evaluate(() => ({
  main: [...document.querySelectorAll('.quiz-footer .sf-row .lnk')].map(e => e.textContent),
  info: [...document.querySelectorAll('.quiz-footer .sf-row2 .lnk')].map(e => e.textContent)
}));
ok('global footer main row = Home ★ Shop (+ Instagram tile)', links.main.join('|') === 'Home|Shop', links.main.join('|'));
ok('global footer info row = Privacy ★ Terms ★ FAQ ★ Contact', links.info.join('|') === 'Privacy|Terms|FAQ|Contact', links.info.join('|'));
ok('My Story is CUT from every footer (it lives in the Menu)', await page.evaluate(() =>
  ![...document.querySelectorAll('[data-std-foot] span')].some(s => /^My Story$/.test(s.textContent))));
ok('no footer anywhere still links Edit or Quiz', await page.evaluate(() =>
  ![...document.querySelectorAll('[data-std-foot] span')].some(s => /^(Edit|Quiz)$/.test(s.textContent))));
// The self-link omission table — Cath's catch ("on the My Story page we have a
// My Story footer"): each screen's own link must be absent, everything else present.
const EXPECT = {
  's-wel': ['Shop', 'Privacy|Terms|FAQ|Contact'], 's-wb': ['Shop', 'Privacy|Terms|FAQ|Contact'],
  's-shop': ['Home', 'Privacy|Terms|FAQ|Contact'],
  's-faq': ['Home|Shop', 'Privacy|Terms|Contact'],
  's-privacy': ['Home|Shop', 'Terms|FAQ|Contact'], 's-terms': ['Home|Shop', 'Privacy|FAQ|Contact'],
  's-contact': ['Home|Shop', 'Privacy|Terms|FAQ'],
  's-res': ['Home|Shop', 'Privacy|Terms|FAQ|Contact'], 's-photo-res': ['Home|Shop', 'Privacy|Terms|FAQ|Contact'],
  's-story': ['Home|Shop', 'Privacy|Terms|FAQ|Contact'], 's-wardrobe': ['Home|Shop', 'Privacy|Terms|FAQ|Contact'],
  's-wishlist': ['Home|Shop', 'Privacy|Terms|FAQ|Contact']
};
for (const [scr, [wantMain, wantInfo]] of Object.entries(EXPECT)) {
  const r = await page.evaluate(([scr, sel]) => {
    const el = document.querySelector('#' + scr + ' ' + sel + '[data-std-foot]');
    if (!el) return null;
    return {
      main: [...el.querySelectorAll('.sf-row .lnk')].map(l => l.textContent).join('|'),
      info: [...el.querySelectorAll('.sf-row2 .lnk')].map(l => l.textContent).join('|'),
      ig: !!el.querySelector('.sf-row .ig-a')
    };
  }, [scr, OWN_FOOT[scr]]);
  ok(scr + ' omits its own link and keeps the rest', !!r && r.main === wantMain && r.info === wantInfo && r.ig,
    JSON.stringify(r));
}

// ---------------------------------------------------------------------------
console.log('\n2. The standard footer is VISIBLE on every target screen');
for (const [scr, sel] of Object.entries(OWN_FOOT)) {
  const r = await page.evaluate(([scr, sel]) => {
    show(scr);
    const el = document.querySelector('#' + scr + ' ' + sel + '[data-std-foot]');
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    const vis = rect.width > 0 && rect.height > 0 && getComputedStyle(el).display !== 'none';
    const rows = el.querySelectorAll('.sf-row .lnk').length + el.querySelectorAll('.sf-row2 .lnk').length;
    return { found: true, vis, rows };
  }, [scr, sel]);
  ok(scr + ' shows its standard footer', r.found && r.vis && r.rows >= 4, JSON.stringify(r));
}
for (const scr of GLOBAL_FOOT) {
  const r = await page.evaluate(scr => {
    show(scr);
    const gf = document.querySelector('.quiz-footer[data-std-foot]');
    const rect = gf.getBoundingClientRect();
    return { vis: gf.style.display !== 'none' && rect.height > 0, rows: [...gf.querySelectorAll('.sf-row .lnk')].map(l => l.textContent).join('|') };
  }, scr);
  ok(scr + ' shows the shared global standard footer', r.vis && r.rows === 'Home|Shop', JSON.stringify(r));
}

// ---------------------------------------------------------------------------
console.log('\n3. Every footer link actually navigates');
for (const [label, dest] of [['Shop', 's-shop']]) {
  await page.evaluate(() => show('s-wardrobe'));
  await page.click('#s-wardrobe .wdr-foot .sf-row .lnk:text-is("' + label + '")');
  const act = await page.evaluate(() => document.querySelector('.scr.act').id);
  ok('footer "' + label + '" opens ' + dest, act === dest, 'landed on ' + act);
}
for (const [label, dest] of [['Privacy', 's-privacy'], ['Terms', 's-terms'], ['FAQ', 's-faq']]) {
  await page.evaluate(() => show('s-wardrobe'));
  await page.click('#s-wardrobe .wdr-foot .sf-row2 .lnk:text-is("' + label + '")');
  const act = await page.evaluate(() => document.querySelector('.scr.act').id);
  ok('info-row "' + label + '" opens ' + dest, act === dest, 'landed on ' + act);
}

// ---------------------------------------------------------------------------
console.log('\n4. Home: returning woman → Welcome Back hub; new visitor → Welcome');
await page.evaluate(() => show('s-faq'));
await page.click('#s-faq .faq-foot .sf-row .lnk:text-is("Home")');
ok('with saved results, footer Home lands on her hub (s-wb)',
  await page.evaluate(() => document.querySelector('.scr.act').id) === 's-wb');

const fresh = await newPage(390, false);
await fresh.evaluate(() => show('s-faq'));
await fresh.click('#s-faq .faq-foot .sf-row .lnk:text-is("Home")');
ok('with no saved data, footer Home lands on Welcome (s-wel)',
  await fresh.evaluate(() => document.querySelector('.scr.act').id) === 's-wel');

// ---------------------------------------------------------------------------
console.log('\n5. Browser Back still works after going home');
await fresh.evaluate(() => show('s-faq'));
await fresh.evaluate(() => goHome());
await fresh.goBack();
await fresh.waitForTimeout(150);
ok('Back returns from home to the page she came from',
  await fresh.evaluate(() => document.querySelector('.scr.act').id) === 's-faq');
await fresh.context().close();

// ---------------------------------------------------------------------------
console.log('\n6. Every brand logo is tappable and goes home');
const LOGOS = [
  ['s-res', '#s-res .logo.go-home'],
  ['s-photo-res', '#s-photo-res .logo.go-home'],
  ['s-faq', '#s-faq .faq-lh-logo.go-home'],
  ['s-privacy', '#s-privacy .pp-lh-logo.go-home'],
  ['s-terms', '#s-terms .pp-lh-logo.go-home'],
  ['s-wishlist', '#s-wishlist .wl-mast.go-home'],
  ['s-quiz', '.hdr .logo-img.go-home'],
];
for (const [scr, sel] of LOGOS) {
  const r = await page.evaluate(([scr, sel]) => {
    show(scr);
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    return { found: true, vis: rect.width > 0, cursor: getComputedStyle(el).cursor };
  }, [scr, sel]);
  ok(scr + ' logo present + pointer cursor', r.found && r.vis && r.cursor === 'pointer', JSON.stringify(r));
  if (r.found && r.vis) {
    await page.click(sel);
    const act = await page.evaluate(() => document.querySelector('.scr.act').id);
    ok(scr + ' logo tap goes home', act === 's-wb', 'landed on ' + act);
  }
}
const welLogo = await page.evaluate(() => {
  show('s-wel');
  const el = document.querySelector('#s-wel .hm-star-inner.go-home');
  return el ? getComputedStyle(el).cursor : 'missing';
});
ok('Welcome pendant star is tappable too', welLogo === 'pointer', welLogo);
ok('Welcome Back wordmark is tappable', await page.evaluate(() => {
  show('s-wb');
  const el = document.querySelector('#s-wb .wb-word-img.go-home');
  return !!el && getComputedStyle(el).cursor === 'pointer';
}));

// ---------------------------------------------------------------------------
console.log('\n7. Layout: one-line main row + no overflow, 390px and 360px');
for (const width of [390, 360]) {
  const p = await newPage(width, true);
  for (const scr of ['s-wel', 's-faq', 's-wardrobe', 's-res']) {
    const r = await p.evaluate(scr => {
      show(scr);
      const el = document.querySelector('#' + scr + ' [data-std-foot]');
      const centers = [...el.querySelectorAll('.sf-row .lnk')]
        .map(e => { const b = e.getBoundingClientRect(); return b.top + b.height / 2; }).sort((a, b) => a - b);
      let lines = 0, last = -99;
      for (const c of centers) if (c - last > 5) { lines++; last = c; }
      return { lines, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    }, scr);
    ok(scr + ' @' + width + ': main row on one line, no sideways scroll',
      r.lines === 1 && r.overflow <= 0, JSON.stringify(r));
  }
  if (p.errors.length) ok('no JS errors @' + width, false, p.errors.join(' | '));
  await p.context().close();
}

// ---------------------------------------------------------------------------
console.log('\n8. The quiet legal row is readable on the real painted backgrounds');
function lum(rgb) {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
for (const scr of ['s-wel', 's-res', 's-wardrobe', 's-faq']) {
  const r = await page.evaluate(scr => {
    show(scr);
    const el = document.querySelector('#' + scr + ' [data-std-foot] .sf-row2 .lnk');
    const fg = getComputedStyle(el).color.match(/\d+/g).map(Number);
    // walk up for the first non-transparent painted background
    let n = el, bg = null;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
      if (m && (m[4] === undefined || parseFloat(m[4]) > 0.9)) { bg = [+m[1], +m[2], +m[3]]; break; }
      n = n.parentElement;
    }
    return { fg, bg: bg || [255, 255, 255] };
  }, scr);
  const [L1, L2] = [lum(r.fg), lum(r.bg)].sort((a, b) => b - a);
  const ratio = (L1 + 0.05) / (L2 + 0.05);
  ok(scr + ' quiet-row contrast ≥ 4.5:1 (got ' + ratio.toFixed(1) + ':1)', ratio >= 4.5);
}

// ---------------------------------------------------------------------------
console.log('\n8b. The Instagram tile (real brand gradient, ends the main row — 2026-08-08)');
{
  const ig = await page.evaluate(() => {
    const links = [...document.querySelectorAll('[data-std-foot] .sf-row .ig-a')];
    const foots = document.querySelectorAll('[data-std-foot]');
    // measure on a VISIBLE screen — a footer on a hidden .scr reports 0x0
    show('s-faq');
    const one = document.querySelector('#s-faq [data-std-foot] .sf-row .ig-a');
    const r = one.getBoundingClientRect();
    const g = one.querySelector('svg').getBoundingClientRect();
    const row = one.parentElement.getBoundingClientRect();
    // every footer's gradient id must be unique — a shared id would resolve to
    // a def inside a hidden screen, which Safari may refuse to paint
    const gids = [...document.querySelectorAll('[data-std-foot] radialGradient')].map(x => x.id);
    const rectsRef = [...document.querySelectorAll('[data-std-foot] .ig-g rect')].every(x => {
      const f = x.getAttribute('fill') || '';
      const svg = x.closest('svg');
      return f.startsWith('url(#') && svg.querySelector('radialGradient') && f === 'url(#' + svg.querySelector('radialGradient').id + ')';
    });
    return {
      count: links.length, foots: foots.length,
      href: one.getAttribute('href'), rel: one.getAttribute('rel'),
      target: one.getAttribute('target'), aria: one.getAttribute('aria-label'),
      tapW: Math.round(r.width), tapH: Math.round(r.height),
      glyph: Math.round(g.width),
      lastInRow: [...one.parentElement.children].pop() === one,
      insideRow: r.left >= row.left - 1 && r.right <= row.right + 1,
      gidsUnique: new Set(gids).size === gids.length, gidCount: gids.length,
      rectsRef,
      cameraWhite: getComputedStyle(one.querySelector('circle')).stroke === 'rgb(255, 255, 255)'
    };
  });
  ok('appears in every footer (' + ig.foots + ')', ig.count === ig.foots, ig.count + ' of ' + ig.foots);
  ok('points at her confirmed handle', ig.href === 'https://instagram.com/style_star.app', ig.href);
  ok('opens in a new tab so the email/page is not lost', ig.target === '_blank');
  ok('rel is noopener and NOT sponsored (it is not a paid link)', ig.rel === 'noopener', ig.rel);
  ok('icon-only link carries an aria-label', !!ig.aria, ig.aria);
  ok('tile is 16px', ig.glyph === 16, ig.glyph + 'px');
  ok('tap target is comfortably bigger than the tile', ig.tapW >= 25 && ig.tapH >= 25, ig.tapW + 'x' + ig.tapH);
  ok('ENDS the main row on every page (the rhythm holds)', ig.lastInRow);
  ok('sits inside the main row', ig.insideRow);
  // ⚠️ DERIVED from the footer count, 2026-09-01, rather than restating "14" a
  // second time — that is exactly why this failed alongside the count above
  // when screens gained footers. The claim is "one unique gradient id PER
  // footer", so it should be computed from how many footers there are, and
  // then it never needs editing again.
  ok('each footer owns a UNIQUE gradient id (Safari hidden-def trap)',
     ig.gidsUnique && ig.gidCount === foots.n, ig.gidCount + ' ids for ' + foots.n + ' footers');
  ok('every tile references its OWN footer\'s gradient', ig.rectsRef);
  ok('the camera is white on the gradient', ig.cameraWhite);

  for (const w of [390, 360, 320]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.waitForTimeout(120);
    const over = await page.evaluate(() => {
      const f = document.querySelector('#s-faq [data-std-foot]') || document.querySelector('[data-std-foot]');
      const r = f.getBoundingClientRect();
      return Math.round(Math.max(0, ...[...f.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - r.right);
    });
    ok(w + 'px: the footer still does not overflow', over <= 0, over + 'px');
  }
  await page.setViewportSize({ width: 390, height: 844 });
}

// ---------------------------------------------------------------------------
console.log('\n9. Zero JS errors across the whole drive');
ok('no page errors', page.errors.length === 0, page.errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
