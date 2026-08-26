// _renderEditTeaser() — "More from the Edit" on Welcome Back (2026-08-26).
// Her idea, her pick "A" from a 3-way render: the Star card stays untouched,
// a separate labelled scroll strip of the Edit's OWN photographed pieces
// sits below it. This suite proves the SELF-MAINTAINING claim (reads
// #s-dream's real markup, never a second hand-kept list), the dedupe against
// whatever the Star card is currently showing, the affiliate wrap, and that
// nothing about the Star card's own fold-tuned layout moved.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = '/home/user/stylestar-app';
let pass = 0, fail = 0;
const ok = (l, c, x) => { console.log((c ? '  ok  ' : 'FAIL  ') + l + (!c && x ? '   << ' + x : '')); c ? pass++ : fail++; };

const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); }
  rs.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  rs.end(fs.readFileSync(f));
}).listen(0);
const PORT = srv.address().port;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
const pg = await ctx.newPage(); const errs = [];
pg.on('pageerror', e => errs.push(e.message));
// ⚠️ THE PHOTOS ARE INTERCEPTED AND SERVED LOCALLY, not left to the real
// network. This sandbox's Chromium cannot reach the retail CDNs at all
// (documented wall), and every dc-item-px carries onerror="this.remove()" --
// so left alone, whether an assertion sees the photo or not depends on
// whether the connection-reset has finished failing yet, a race against real
// elapsed time. Real bytes for real hosts is what fixes it deterministically,
// the same "for RENDERS, intercept and serve local copies" rule this file's
// own history already documents. scratchpad/wbcarousel-mock.js downloaded
// these six once; reused here.
const IMG_DIR = '/tmp/wbcarousel-img';
const HOST_FILE = { 'dvf.com': 'dvf-scarf.jpg', 'farmrio.com': 'farmrio.jpg', 'vilebrequin.com': 'vilebrequin.jpg', 'olivela.com': 'olivela.jpg' };
if (fs.existsSync(IMG_DIR)) {
  await pg.route(/https?:\/\/([a-z0-9-]+\.)?(dvf|farmrio|vilebrequin|olivela)\.com\/.*|https?:\/\/cdn\.shopify\.com\/.*/, r => {
    const url = r.request().url();
    let file = null;
    for (const host in HOST_FILE) if (url.includes(host)) file = HOST_FILE[host];
    if (!file) file = url.includes('MEMORY_LANE') ? 'jean.png' : url.includes('ABIGAIL') ? 'serpui.jpg' : null;
    const full = file && path.join(IMG_DIR, file);
    if (full && fs.existsSync(full)) {
      return r.fulfill({ status: 200, contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg', body: fs.readFileSync(full) });
    }
    r.continue();
  });
}
// ⚠️ SEEDED VIA addInitScript, NOT goto-then-reload. This sandbox's Chromium
// cannot reach the real Edit photos' retail CDNs at all (the documented wall)
// -- every dc-item-px carries onerror="this.remove()", so once the browser's
// connection-reset actually completes the element is GONE. A single goto()
// leaves too little elapsed time for that failure to land before the check
// (editpx.js's own pattern: one goto, no reload); a goto-THEN-reload cycle
// gives the network stack a full second pass and the images vanish before any
// assertion runs -- which is exactly what happened on the first version of
// this suite (editPhotoCount:0). Seeding pre-navigation removes the reload.
await pg.addInitScript(() => {
  localStorage.setItem('ss_data', JSON.stringify({
    userName: 'Jen', answers: new Array(12).fill(6),
    topArchNames: ['Timeless Classic'], motto: 'Effortless, always.',
    portrait: 'A woman who values quality and quiet confidence.'
  }));
});
await pg.goto(`http://127.0.0.1:${PORT}/`);
await pg.waitForTimeout(1200);
await pg.evaluate(() => { document.querySelectorAll('.hm-entrance').forEach(e => e.remove()); show('s-wb'); });
await pg.waitForTimeout(300);

console.log('1. It renders from the real Edit, and self-maintains');
const base = await pg.evaluate(() => {
  const editPhotoCount = document.querySelectorAll('#s-dream .dc-item .dc-item-px').length;
  const cards = [...document.querySelectorAll('#wbEditTeaser .wet-card:not(.wet-all)')];
  const on = document.getElementById('wbEditTeaser').classList.contains('on');
  const star = _weekStar();
  return {
    editPhotoCount, cardCount: cards.length, on,
    starName: star ? star.n : null,
    starInStrip: cards.some(c => (c.querySelector('.wet-n') || {}).textContent === (star || {}).n),
    labelText: (document.querySelector('#wbEditTeaser .wet-lbl') || {}).textContent || '',
    tailPresent: !!document.querySelector('#wbEditTeaser .wet-all')
  };
});
ok('the strip is on', base.on, JSON.stringify(base));
ok('label reads "More from the Edit"', /more from the edit/i.test(base.labelText), base.labelText);
ok('the Star card\'s own item is never duplicated in the strip', !base.starInStrip, base.starName);
// ⚠️ THE ABOVE PROVES NOTHING ON ITS OWN if today's rotation happens not to
// overlap with a photographed Edit piece (true right now: Athleta's Retreat
// Linen pant has no photo). So force a REAL overlap by pinning to a known
// photographed Edit item, and confirm the dedupe actually fires on it.
const dedupe = await pg.evaluate(() => {
  const keep = window.WEEK_STAR_PIN;
  window.WEEK_STAR_PIN = 'FARM Rio Pink Garden Terrace 3D One-Shoulder Maxi Dress';
  _renderWeekStar(); _renderEditTeaser();
  const names = [...document.querySelectorAll('#wbEditTeaser .wet-n')].map(n => n.textContent);
  const included = names.includes('FARM Rio Pink Garden Terrace 3D One-Shoulder Maxi Dress');
  window.WEEK_STAR_PIN = keep;
  _renderWeekStar(); _renderEditTeaser();
  return { included };
});
ok('FORCED OVERLAP: pinning to a photographed Edit item excludes it from the strip', !dedupe.included, JSON.stringify(dedupe));
// DERIVED, not restated: the strip's card count is whatever the Edit's photo
// count minus the (possibly) excluded current Star item happens to be — so
// adding an 8th photographed Edit item can never make this assertion stale.
ok('every OTHER photographed Edit item shows up (self-maintaining)',
   base.cardCount === base.editPhotoCount || base.cardCount === base.editPhotoCount - 1,
   `${base.cardCount} cards vs ${base.editPhotoCount} photographed Edit items`);
ok('the tail "See the full Edit" card is present', base.tailPresent);

console.log('\n2. Adding a photographed Edit item picks it up with ZERO code changes');
const grown = await pg.evaluate(() => {
  const dream = document.getElementById('s-dream');
  const div = document.createElement('div'); div.className = 'dc-item';
  div.innerHTML = '<img class="dc-item-px" src="https://example.com/test.jpg" alt="Test Mock Item">'
    + '<div class="dc-item-name">Test Mock Item</div>'
    + '<div class="dc-item-meta"><span class="dc-store">Mock Store</span><span class="dc-price">$1</span></div>'
    + '<a class="dc-item-btn" href="https://example.com/p/test" target="_blank" rel="sponsored noopener">Shop this item</a>';
  dream.querySelector('.dc-sign').insertAdjacentElement('beforebegin', div);
  _renderEditTeaser();
  const names = [...document.querySelectorAll('#wbEditTeaser .wet-n')].map(n => n.textContent);
  div.remove(); _renderEditTeaser(); // clean up
  return { grewToInclude: names.includes('Test Mock Item') };
});
ok('a freshly-added photo item appears with no code touched', grown.grewToInclude);

console.log('\n3. The Edit\'s own affiliate wrap reaches these links too');
const aff = await pg.evaluate(() => {
  const mids = Object.keys(window._AFF_MID || {});
  const host = u => { try { return new URL(u, location.href).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { return ''; } };
  const licensed = h => mids.some(d => h === d || h.endsWith('.' + d));
  let wrapped = 0, approvedHost = 0, total = 0;
  document.querySelectorAll('#wbEditTeaser .wet-card:not(.wet-all)').forEach(a => {
    total++;
    const raw = a.getAttribute('href') || '';
    if (raw.includes('click.linksynergy')) wrapped++;
    let dest = raw; const m = /[?&]murl=([^&]+)/.exec(raw); if (m) dest = decodeURIComponent(m[1]);
    if (licensed(host(dest))) approvedHost++;
  });
  return { wrapped, approvedHost, total };
});
ok('every card whose store is approved is affiliate-wrapped, no more no fewer',
   aff.wrapped === aff.approvedHost && aff.total > 0, JSON.stringify(aff));

console.log('\n4. The tail card opens the real Edit page');
const tailNav = await pg.evaluate(() => {
  show('s-wb');
  document.querySelector('#wbEditTeaser .wet-all').click();
  return document.getElementById('s-dream').classList.contains('act');
});
ok('tapping "See the full Edit" opens s-dream', tailNav);

console.log('\n5. The Star card itself is UNTOUCHED — nothing about its own layout moved');
await pg.evaluate(() => { show('s-wb'); });
await pg.waitForTimeout(200);
const untouched = await pg.evaluate(() => {
  const card = document.querySelector('#wbStar .wks-card');
  const shop = document.querySelector('#wbStar .wks-shop');
  const save = document.querySelector('#wbStar .wl-save');
  return {
    cardExists: !!card,
    shopText: shop ? shop.textContent.trim() : '',
    saveExists: !!save,
    starBelowTeaserInDom: document.getElementById('wbStar').compareDocumentPosition(document.getElementById('wbEditTeaser')) === Node.DOCUMENT_POSITION_FOLLOWING
  };
});
ok('the Star card still renders with Shop it + Save intact', untouched.cardExists && /^Shop it/.test(untouched.shopText) && untouched.saveExists, JSON.stringify(untouched));
ok('the teaser strip sits AFTER the Star card in the DOM, never inside or before it', untouched.starBelowTeaserInDom);

console.log('\n6. Readability, layout, no overflow');
const contrast = await pg.evaluate(() => {
  function lum(rgb) { const m = rgb.match(/\d+/g).map(Number); const [r, g, bl] = m.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * bl; }
  function ratio(a, b) { const L1 = lum(a), L2 = lum(b); return (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); }
  const bg = getComputedStyle(document.querySelector('.ss.welcomeback-mirror,.hm-mirror,#s-wb') || document.body).backgroundColor;
  const lbl = document.querySelector('#wbEditTeaser .wet-lbl');
  const lblBg = (() => { let el = lbl; while (el) { const c = getComputedStyle(el).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') return c; el = el.parentElement; } return 'rgb(255,255,255)'; })();
  const nameEl = document.querySelector('#wbEditTeaser .wet-n');
  const priceEl = document.querySelector('#wbEditTeaser .wet-p');
  return {
    labelRatio: ratio(getComputedStyle(lbl).color, lblBg),
    nameRatio: ratio(getComputedStyle(nameEl).color, getComputedStyle(nameEl.closest('.wet-card')).backgroundColor),
    priceRatio: ratio(getComputedStyle(priceEl).color, getComputedStyle(priceEl.closest('.wet-card')).backgroundColor)
  };
});
ok('label clears AA on the dark background', contrast.labelRatio >= 4.5, contrast.labelRatio.toFixed(2));
ok('item name clears AA on the white card', contrast.nameRatio >= 4.5, contrast.nameRatio.toFixed(2));
ok('price text clears AA on the white card', contrast.priceRatio >= 4.5, contrast.priceRatio.toFixed(2));

for (const w of [390, 360, 320]) {
  await pg.setViewportSize({ width: w, height: 900 });
  await pg.evaluate(() => { show('s-wb'); });
  await pg.waitForTimeout(250);
  const r = await pg.evaluate(() => ({
    scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth
  }));
  ok(`${w}px: no sideways PAGE scroll (the strip's own horizontal scroll is intentional)`, r.scroll <= r.client + 1, JSON.stringify(r));
}

ok('zero JS errors', errs.length === 0, errs.join(' | '));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
