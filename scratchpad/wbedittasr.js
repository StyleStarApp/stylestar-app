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

import { routePhotos } from './photocache.mjs';
const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); }
  rs.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
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
// ⚠️ 2026-09-01: was a hand-maintained host→file map covering four brands, gated
// on a photo directory that is gitignored and so usually absent. It missed
// mytheresa, etsy and fleurdumal entirely — and once the CSS extraction meant
// this harness finally served a STYLED page, the uncovered photos loaded, failed,
// and `onerror="this.remove()"` stripped them, leaving "More from the Edit" (which
// only shows PHOTOGRAPHED pieces) completely empty. photocache reads every photo
// URL out of index.html at run time, so it covers all of them and cannot go stale
// when she adds an Edit piece.
await routePhotos(pg, { allow: () => false });
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

console.log('\n1b. Her live catch: label color matches "Read your full Style Portrait", and a swipe hint');
const colorHint = await pg.evaluate(() => {
  // DERIVED against the real button, never a hardcoded hex — so if that
  // button's own color is ever retuned, this stays honest instead of silently
  // drifting apart from what she actually asked to match.
  const ctaColor = getComputedStyle(document.querySelector('#s-wb .wb-port-cta span')).color;
  const lblColor = getComputedStyle(document.querySelector('#wbEditTeaser .wet-lbl')).color;
  const hint = document.getElementById('wbEditTeaserSwipe');
  return {
    ctaColor, lblColor, matches: ctaColor === lblColor,
    hintExists: !!hint, hintText: hint ? hint.textContent.trim() : '',
    hintVisibleAt390: hint ? getComputedStyle(hint).display !== 'none' : false
  };
});
ok('the label now matches the Read-your-Style-Portrait button\'s own color',
   colorHint.matches, `${colorHint.lblColor} vs ${colorHint.ctaColor}`);
ok('a swipe hint exists and reads "Swipe for more"', colorHint.hintExists && /swipe for more/i.test(colorHint.hintText), colorHint.hintText);
ok('at 390px the strip overflows, so the hint is showing', colorHint.hintVisibleAt390);
// NOT a static label -- it is driven by real overflow, the same _swipeHint()
// mechanism already proven on What's Trending. Prove the gate really gates,
// against the SAME shared function _renderEditTeaser() calls (never a
// duplicated copy): a scroll box narrower than its own content shows the
// hint, and shrinking the content until it fits turns the hint off again.
// ⚠️ #wbEditTeaser's own .hm-room ancestor caps content width at 400px
// regardless of viewport, so widening the PAGE cannot force a no-overflow
// state here -- this drives the shared function directly against a
// purpose-built pair of boxes instead, which is what actually isolates the
// claim under test (the function's own overflow arithmetic) from this
// screen's particular width budget.
const gate = await pg.evaluate(async () => {
  const wrap = document.createElement('div'); wrap.style.cssText = 'width:120px;overflow-x:auto;position:absolute;left:-9999px';
  const hint = document.createElement('span'); hint.style.display = 'none';
  document.body.appendChild(wrap); document.body.appendChild(hint);
  const settle = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  wrap.innerHTML = '<div style="width:400px;height:10px"></div>'; // wider than the box
  _swipeHint(wrap, hint); await settle();
  const overflowsShows = getComputedStyle(hint).display !== 'none';
  wrap.innerHTML = '<div style="width:60px;height:10px"></div>'; // fits inside the box
  _swipeHint(wrap, hint); await settle();
  const fitsHides = getComputedStyle(hint).display === 'none';
  wrap.remove(); hint.remove();
  return { overflowsShows, fitsHides };
});
ok('GATE: a box narrower than its content shows the hint', gate.overflowsShows, JSON.stringify(gate));
ok('GATE: shrinking the content until it fits turns the hint back off', gate.fitsHides, JSON.stringify(gate));
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

// 7. HER CATCH, 2026-09-10: "That necklace does have a photo it should be on
//    there?" It did. The CARD showed it; the STRIP could not see it, because
//    the lookup asked for `.dc-item-px` and that item's photo is a hand-cropped
//    frame with inline styles and no class. A px2 STACK was the same hole one
//    step further on: `.dc-item-px` is a <div> there, so it has no src at all,
//    and a stacked piece would have rendered a card with src="" the moment it
//    stopped being the Star.
//    ▶ THESE CHECKS NAME THE RULE, NOT THE MECHANISM — "every photographed piece
//    can reach the strip" — so they keep biting if the markup changes shape
//    again. Deliberately NOT "the count is 16": that is the derive-don't-count
//    lesson this repo already paid for four times in one day.
console.log('\n7. Every photographed Edit piece can reach the strip, whatever shape its photo is');
await pg.setViewportSize({ width: 390, height: 900 });
await pg.evaluate(() => { show('s-wb'); });
await pg.waitForTimeout(250);
const reach = await pg.evaluate(() => {
  const items = [...document.querySelectorAll('#s-dream .dc-item')];
  const rows = items.map(e => {
    const name = e.querySelector('.dc-item-name').textContent.trim();
    const px = e.querySelector('.dc-item-px');
    return {
      name,
      hasImg: !!e.querySelector('img'),
      shape: !px ? 'inline-frame' : (px.tagName === 'IMG' ? 'plain' : 'stack'),
      src: (function () { const i = _editPhoto(e); return i ? (i.getAttribute('src') || '') : ''; })()
    };
  });
  const photographed = rows.filter(r => r.hasImg);
  const star = _weekStar();
  const strip = [...document.querySelectorAll('#wbEditTeaser .wet-card:not(.wet-all)')]
    .map(c => (c.querySelector('.wet-n') || {}).textContent);
  return {
    photographed: photographed.length,
    resolved: photographed.filter(r => r.src).length,
    unresolved: photographed.filter(r => !r.src).map(r => r.name + ' [' + r.shape + ']'),
    shapes: [...new Set(photographed.map(r => r.shape))].sort(),
    inlineFrame: photographed.filter(r => r.shape === 'inline-frame').map(r => r.name),
    stacks: photographed.filter(r => r.shape === 'stack').map(r => r.name),
    missing: photographed.filter(r => !strip.includes(r.name) && (!star || r.name !== star.n)).map(r => r.name),
    stripEmptySrc: [...document.querySelectorAll('#wbEditTeaser .wet-card:not(.wet-all) img')]
      .filter(i => !i.getAttribute('src')).length,
    starName: star ? star.n : null
  };
});
ok('every photographed piece resolves to a real image src',
   reach.photographed > 0 && reach.resolved === reach.photographed, JSON.stringify(reach.unresolved));
ok('no card in the strip is built with an empty src', reach.stripEmptySrc === 0, String(reach.stripEmptySrc));
ok('every photographed piece reaches the strip, except this week\'s Star',
   reach.missing.length === 0, JSON.stringify(reach.missing) + ' star=' + reach.starName);
// The two shapes that broke it, asserted BY SHAPE so the checks stay meaningful
// if she swaps which particular piece is built that way.
ok('a hand-cropped inline frame (no .dc-item-px class) is found, not skipped',
   reach.inlineFrame.length > 0 && reach.inlineFrame.every(n => reach.missing.indexOf(n) < 0),
   JSON.stringify(reach.inlineFrame));
ok('a px2 STACK yields its front photo, never a div with no src',
   reach.stacks.length > 0 && reach.stacks.every(n => {
     const r = reach; return r.unresolved.every(u => u.indexOf(n) < 0);
   }), JSON.stringify(reach.stacks));

// 8. HER THREE CATCHES OFF ONE SCREENSHOT, 2026-09-10: "The jeans are cut off -
//    can't see the whole Jean and the sunglasses photo is missing the other half
//    it looks fine in the main page but on teaser these photos need fixing."
//    ▶ HER BENCHMARK IS THE EDIT PAGE, so these derive from .dc-item-px rather
//    than hardcoding 3/4 — if that card's geometry is ever retuned, the strip is
//    required to follow instead of silently drifting apart from it again.
console.log('\n8. The strip renders a photo exactly as the Edit card does');
await pg.setViewportSize({ width: 390, height: 900 });
await pg.evaluate(() => { show('s-wb'); });
await pg.waitForTimeout(250);
// ⚠️ EACH IS MEASURED ON ITS OWN VISIBLE SCREEN. A hidden screen's elements
// report a 0x0 box, so measuring both at once yields NaN and a check that
// cannot see what it claims to compare — this file's own "could this pass if
// the thing it measures were absent?" test, caught while writing it.
const geom = await pg.evaluate(() => {
  const r = e => { const b = e.getBoundingClientRect(); return b.width / b.height; };
  const cs = e => getComputedStyle(e);
  showDream();
  const edit = document.querySelector('#s-dream .dc-item img.dc-item-px');
  const out = { editRatio: +r(edit).toFixed(3), editFit: cs(edit).objectFit, editPos: cs(edit).objectPosition };
  show('s-wb');
  const strip = document.querySelector('#wbEditTeaser .wet-card > img');
  out.stripRatio = +r(strip).toFixed(3); out.stripFit = cs(strip).objectFit; out.stripPos = cs(strip).objectPosition;
  out.bothMeasured = out.editRatio > 0 && out.stripRatio > 0;
  return out;
});
ok('GATE: both frames were really measured (a hidden screen reports 0x0)', geom.bothMeasured, JSON.stringify(geom));
ok('the strip frame has the SAME aspect ratio as the Edit card',
   Math.abs(geom.editRatio - geom.stripRatio) < 0.005, JSON.stringify(geom));
ok('...and the SAME object-fit', geom.editFit === geom.stripFit, JSON.stringify(geom));
ok('...and the SAME anchor, so a tall photo loses its hem and never its waistband',
   geom.editPos === geom.stripPos, JSON.stringify(geom));

console.log('\n8b. A px2 stacked pair shows BOTH views in the strip, not just the first');
const stack = await pg.evaluate(() => {
  // the only stacked piece is normally the Star, which the strip rightly hides —
  // so stand a different piece in as the Star to reach the stack path at all
  const real = window._weekStar;
  window._weekStar = () => ({ n: 'Gold Stretchy Stacking Bangles', url: 'https://www.amazon.com/dp/B0CWD1RYK3' });
  _renderEditTeaser();
  const stacksInEdit = document.querySelectorAll('#s-dream .dc-item-px.is-stack').length;
  const el = document.querySelector('#wbEditTeaser .wet-px.is-stack');
  const imgs = el ? [...el.querySelectorAll('img')] : [];
  const srcs = imgs.map(i => i.getAttribute('src'));
  const editSrcs = [...document.querySelectorAll('#s-dream .dc-item-px.is-stack img')].map(i => i.getAttribute('src'));
  window._weekStar = real; _renderEditTeaser();
  return { stacksInEdit, found: !!el, n: imgs.length, srcs, editSrcs,
           sameOrder: JSON.stringify(srcs) === JSON.stringify(editSrcs.slice(0, srcs.length)) };
});
ok('a stacked piece renders as a stack in the strip too', stack.stacksInEdit === 0 || stack.found, JSON.stringify(stack));
ok('...showing BOTH views, not one', stack.stacksInEdit === 0 || stack.n === 2, JSON.stringify(stack));
// ⚠️ n===2 IS PART OF THE ASSERTION, NOT DECORATION: with no stack rendered
// both sides are empty arrays and "same order" passes vacuously — which is the
// exact false-green shape this repo keeps paying for. Proven: with the fix
// reverted this check passed until n===2 was added.
ok('...the same two photos, in the same order as the Edit card',
   stack.stacksInEdit === 0 || (stack.n === 2 && stack.sameOrder), JSON.stringify(stack));

// 8c. 🚨 THE ONE THAT SURVIVED BECAUSE A FRESH LOAD NEVER SHOWED IT. _wlEditItems
//     reads .url RAW, but _wlDecorateEdit rewrites the Edit's hrefs to their
//     affiliate-wrapped form the moment she OPENS the Edit -- after which a raw
//     star.url could never equal a wrapped it.url, and the Star of the Week
//     appeared TWICE on Welcome Back. She photographed it on 2026-09-10.
//     ▶ ASSERTED IN BOTH ORDERS, because a check that only tested a fresh load
//     would have passed happily through the entire bug.
console.log('\n8c. The Star is never duplicated in the strip — including after she has opened the Edit');
const starDedupe = await pg.evaluate(() => {
  const star = _weekStar();
  const inStrip = () => [...document.querySelectorAll('#wbEditTeaser .wet-n')]
    .map(x => x.textContent.trim())
    .some(n => star.n.startsWith(n.replace(/\.\.\.$/, '')));
  show('s-wb'); const before = inStrip();
  showDream();                       // exactly what she did
  const href = [...document.querySelectorAll('#s-dream .dc-item')]
    .filter(e => e.textContent.indexOf(star.n) >= 0)
    .map(e => e.querySelector('.dc-item-btn').getAttribute('href'))[0];
  show('s-wb'); const after = inStrip();
  return { before, after, hrefWasRewritten: href !== star.url, star: star.n };
});
ok('the Star is out of the strip on a fresh load', !starDedupe.before, JSON.stringify(starDedupe));
ok('GATE: opening the Edit really does rewrite its hrefs (else the check below proves nothing)',
   starDedupe.hrefWasRewritten, JSON.stringify(starDedupe));
ok('the Star is STILL out of the strip after she has opened the Edit',
   !starDedupe.after, JSON.stringify(starDedupe));

ok('zero JS errors', errs.length === 0, errs.join(' | '));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
