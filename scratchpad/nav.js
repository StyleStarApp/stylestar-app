// Navigation standardisation (2026-07-30, Cath picked Option C):
// ONE standard footer everywhere (Home ★ Shop ★ My Story ★ FAQ + quiet
// Privacy · Terms row) injected at boot from a single template, and every
// brand logo tappable → goHome() (Welcome Back hub if saved data, Welcome
// if new). Drives the REAL index.html in Chromium.  node scratchpad/nav.js
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
  's-privacy': '.pg-foot', 's-terms': '.pg-foot'
};
const GLOBAL_FOOT = ['s-dream', 's-shopstyle'];

const page = await newPage(390, true);

// ---------------------------------------------------------------------------
console.log('\n1. One template, twelve containers, byte-identical everywhere');
const foots = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[data-std-foot]')];
  return { n: els.length, htmls: [...new Set(els.map(e => e.innerHTML))] };
});
ok('exactly 12 standard-footer containers', foots.n === 12, 'got ' + foots.n);
ok('all twelve render byte-identical content', foots.htmls.length === 1);
const links = await page.evaluate(() => ({
  main: [...document.querySelectorAll('.quiz-footer .sf-row .lnk')].map(e => e.textContent),
  quiet: [...document.querySelectorAll('.quiz-footer .sf-row2 .lnk2')].map(e => e.textContent)
}));
ok('main row = Home ★ Shop ★ My Story ★ FAQ', links.main.join('|') === 'Home|Shop|My Story|FAQ', links.main.join('|'));
ok('quiet row = Privacy · Terms', links.quiet.join('|') === 'Privacy|Terms', links.quiet.join('|'));
ok('no footer anywhere still links Edit or Quiz', await page.evaluate(() =>
  ![...document.querySelectorAll('[data-std-foot] span')].some(s => /^(Edit|Quiz)$/.test(s.textContent))));

// ---------------------------------------------------------------------------
console.log('\n2. The standard footer is VISIBLE on every target screen');
for (const [scr, sel] of Object.entries(OWN_FOOT)) {
  const r = await page.evaluate(([scr, sel]) => {
    show(scr);
    const el = document.querySelector('#' + scr + ' ' + sel + '[data-std-foot]');
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    const vis = rect.width > 0 && rect.height > 0 && getComputedStyle(el).display !== 'none';
    const rows = [...el.querySelectorAll('.sf-row .lnk')].map(l => l.textContent).join('|');
    return { found: true, vis, rows };
  }, [scr, sel]);
  ok(scr + ' shows its standard footer', r.found && r.vis && r.rows === 'Home|Shop|My Story|FAQ', JSON.stringify(r));
}
for (const scr of GLOBAL_FOOT) {
  const r = await page.evaluate(scr => {
    show(scr);
    const gf = document.querySelector('.quiz-footer[data-std-foot]');
    const rect = gf.getBoundingClientRect();
    return { vis: gf.style.display !== 'none' && rect.height > 0, rows: [...gf.querySelectorAll('.sf-row .lnk')].map(l => l.textContent).join('|') };
  }, scr);
  ok(scr + ' shows the shared global standard footer', r.vis && r.rows === 'Home|Shop|My Story|FAQ', JSON.stringify(r));
}

// ---------------------------------------------------------------------------
console.log('\n3. Every footer link actually navigates');
const NAV = [['Shop', 's-shop'], ['My Story', 's-story'], ['FAQ', 's-faq']];
for (const [label, dest] of NAV) {
  await page.evaluate(() => show('s-wardrobe'));
  await page.click('#s-wardrobe .wdr-foot .sf-row .lnk:text-is("' + label + '")');
  const act = await page.evaluate(() => document.querySelector('.scr.act').id);
  ok('footer "' + label + '" opens ' + dest, act === dest, 'landed on ' + act);
}
for (const [label, dest] of [['Privacy', 's-privacy'], ['Terms', 's-terms']]) {
  await page.evaluate(() => show('s-wardrobe'));
  await page.click('#s-wardrobe .wdr-foot .sf-row2 .lnk2:text-is("' + label + '")');
  const act = await page.evaluate(() => document.querySelector('.scr.act').id);
  ok('quiet-row "' + label + '" opens ' + dest, act === dest, 'landed on ' + act);
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
  ['s-wishlist', '#s-wishlist .wl-logo.go-home'],
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
    const el = document.querySelector('#' + scr + ' [data-std-foot] .lnk2');
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
console.log('\n8b. The Instagram glyph (Cath\'s "Footer A", 2026-08-08)');
{
  const ig = await page.evaluate(() => {
    const links = [...document.querySelectorAll('[data-std-foot] .sf-row2 .ig-a')];
    const foots = document.querySelectorAll('[data-std-foot]');
    // measure on a VISIBLE screen — a footer on a hidden .scr reports 0x0
    show('s-faq');
    const one = document.querySelector('#s-faq [data-std-foot] .sf-row2 .ig-a');
    const r = one.getBoundingClientRect();
    const g = one.querySelector('svg').getBoundingClientRect();
    const row = one.parentElement.getBoundingClientRect();
    return {
      count: links.length, foots: foots.length,
      href: one.getAttribute('href'), rel: one.getAttribute('rel'),
      target: one.getAttribute('target'), aria: one.getAttribute('aria-label'),
      tapW: Math.round(r.width), tapH: Math.round(r.height),
      glyph: Math.round(g.width),
      insideRow: r.left >= row.left - 1 && r.right <= row.right + 1,
      // same ink as the text beside it
      sameInk: getComputedStyle(one.querySelector('svg')).stroke === getComputedStyle(one.parentElement.querySelector('.lnk2')).color
    };
  });
  ok('appears in every footer (' + ig.foots + ')', ig.count === ig.foots, ig.count + ' of ' + ig.foots);
  ok('points at her confirmed handle', ig.href === 'https://instagram.com/style_star.app', ig.href);
  ok('opens in a new tab so the email/page is not lost', ig.target === '_blank');
  ok('rel is noopener and NOT sponsored (it is not a paid link)', ig.rel === 'noopener', ig.rel);
  ok('icon-only link carries an aria-label', !!ig.aria, ig.aria);
  ok('glyph matches the 12px text scale', ig.glyph === 15, ig.glyph + 'px');
  ok('tap target is comfortably bigger than the glyph', ig.tapW >= 25 && ig.tapH >= 25, ig.tapW + 'x' + ig.tapH);
  ok('sits inside the quiet row', ig.insideRow);
  ok('drawn in the same ink as Privacy / Terms', ig.sameInk);

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
