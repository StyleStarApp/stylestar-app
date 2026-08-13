// My Wishlist row on the Style Portrait + photo-results Shop hubs (2026-07-30).
// Cath's ask from the end of the 07-29 session: the row (with its live count
// pill) lived only on Welcome Back; it now appears on all three hub pages.
//
// Drives the REAL index.html in Chromium.  node scratchpad/hubs.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const PORT = 8897, ORIGIN = 'http://localhost:' + PORT;
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

const browser = await chromium.launch();

async function newPage(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('**/.netlify/functions/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  return page;
}

const page = await newPage(390);

// ---------------------------------------------------------------------------
console.log('\n1. The row exists on all three hubs, wired to openWishlist');
const rows = await page.evaluate(() => {
  const find = scr => {
    const els = document.querySelectorAll('#' + scr + ' [onclick="openWishlist()"]');
    return Array.prototype.map.call(els, el => ({
      text: el.textContent, pill: !!el.querySelector('[data-wl-count]'),
      sub: (el.querySelector('[data-wl-sub]') || {}).textContent || ''
    }));
  };
  return { wb: find('s-wb'), res: find('s-res'), photo: find('s-photo-res') };
});
ok('Welcome Back still has exactly one row', rows.wb.length === 1);
ok('Style Portrait has exactly one row', rows.res.length === 1, JSON.stringify(rows.res));
ok('Photo results has exactly one row', rows.photo.length === 1, JSON.stringify(rows.photo));
for (const [k, r] of Object.entries({ wb: rows.wb[0], res: rows.res[0], photo: rows.photo[0] })) {
  ok(k + ': says Your Wishlist', r && /Your Wishlist/.test(r.text));
  ok(k + ': carries the count pill', r && r.pill);
  ok(k + ': default subtitle', r && /Pieces you saved to come back to/.test(r.sub));
}

// ---------------------------------------------------------------------------
console.log('\n2. The Portrait row renders visibly inside the Shop hub');
await page.evaluate(() => show('s-res'));
let vis = await page.evaluate(() => {
  const el = document.querySelector('#s-res .hub-shop [onclick="openWishlist()"]');
  if (!el) return { in_hub: false };
  const r = el.getBoundingClientRect();
  el.scrollIntoView({ block: 'center' });
  const r2 = el.getBoundingClientRect();
  return { in_hub: true, w: r2.width, h: r2.height, sibs: el.parentNode.querySelectorAll('.act').length };
});
ok('sits inside the Shop hub card', vis.in_hub);
ok('occupies real space', vis.w > 200 && vis.h > 30, JSON.stringify(vis));
ok('the Shop hub now holds 4 rows', vis.sibs === 4, 'got ' + vis.sibs);

console.log('\n3. And on the photo-results Shop hub');
await page.evaluate(() => show('s-photo-res'));
vis = await page.evaluate(() => {
  const el = document.querySelector('#s-photo-res .chub [onclick="openWishlist()"]');
  if (!el) return { in_hub: false };
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { in_hub: true, w: r.width, h: r.height, sibs: el.closest('.chub-in').querySelectorAll('.act').length };
});
ok('sits inside the storefront Shop hub', vis.in_hub);
ok('occupies real space', vis.w > 200 && vis.h > 30, JSON.stringify(vis));
ok('that hub now holds 3 rows', vis.sibs === 3, 'got ' + vis.sibs);

// ---------------------------------------------------------------------------
console.log('\n4. Pills are hidden at zero, and light up on all three hubs after a save');
const zero = await page.evaluate(() => {
  const pills = document.querySelectorAll('[data-wl-count]');
  return { n: pills.length, anyOn: Array.prototype.some.call(pills, p => p.classList.contains('on')) };
});
ok('three pills exist in the app', zero.n === 3, 'got ' + zero.n);
ok('all hidden while the wishlist is empty', !zero.anyOn);

const after = await page.evaluate(() => {
  const id = _wlRegister({ name: 'Test Silk Blouse', store: 'Nordstrom', search: 'white silk blouse' });
  wishToggle(id);
  const pills = document.querySelectorAll('[data-wl-count]');
  const subs = document.querySelectorAll('[data-wl-sub]');
  return {
    id: id,
    on: Array.prototype.filter.call(pills, p => p.classList.contains('on')).length,
    txt: Array.prototype.map.call(pills, p => p.textContent),
    subs: Array.prototype.map.call(subs, s => s.textContent)
  };
});
ok('all three pills switch on', after.on === 3, JSON.stringify(after));
ok('all three read "1"', after.txt.every(t => t === '1'), JSON.stringify(after.txt));
ok('three subtitles exist and all say "1 piece saved for later"',
  after.subs.length === 3 && after.subs.every(s => s === '1 piece saved for later'), JSON.stringify(after.subs));

// ---------------------------------------------------------------------------
console.log('\n5. Unsaving reverts every pill and subtitle');
const reverted = await page.evaluate((id) => {
  wishToggle(id);
  const pills = document.querySelectorAll('[data-wl-count]');
  const subs = document.querySelectorAll('[data-wl-sub]');
  return {
    anyOn: Array.prototype.some.call(pills, p => p.classList.contains('on')),
    subs: Array.prototype.map.call(subs, s => s.textContent)
  };
}, after.id);
ok('pills all hide again', !reverted.anyOn);
ok('subtitles revert to the default', reverted.subs.every(s => s === 'Pieces you saved to come back to'));

// ---------------------------------------------------------------------------
console.log('\n6. Tapping the new row opens My Wishlist');
await page.evaluate(() => show('s-res'));
await page.evaluate(() => {
  document.querySelector('#s-res .hub-shop [onclick="openWishlist()"]').click();
});
const landed = await page.evaluate(() => document.getElementById('s-wishlist').classList.contains('act'));
ok('lands on s-wishlist', landed);

// ---------------------------------------------------------------------------
console.log('\n7. Persistence: a saved piece lights the new pills on a fresh load');
await page.evaluate(() => {
  const id = _wlRegister({ name: 'Test Suede Bag', store: 'Nordstrom', search: 'tan suede baguette bag' });
  wishToggle(id);
});
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.show === 'function');
const fresh = await page.evaluate(() => {
  const pills = document.querySelectorAll('#s-res [data-wl-count], #s-photo-res [data-wl-count]');
  return Array.prototype.map.call(pills, p => ({ on: p.classList.contains('on'), t: p.textContent }));
});
ok('both new pills read "1" straight from boot', fresh.length === 2 && fresh.every(p => p.on && p.t === '1'), JSON.stringify(fresh));

// ---------------------------------------------------------------------------
console.log('\n8. No overflow at 390 and 360, no JS errors');
for (const w of [390, 360]) {
  const p2 = await newPage(w);
  for (const scr of ['s-res', 's-photo-res']) {
    const over = await p2.evaluate(s => {
      show(s);
      return document.scrollingElement.scrollWidth - document.documentElement.clientWidth;
    }, scr);
    ok(scr + ' fits at ' + w + 'px', over <= 0, 'overflow ' + over + 'px');
  }
  ok('no JS errors at ' + w + 'px', p2.errors.length === 0, p2.errors.join(' | '));
  await p2.context().close();
}
ok('no JS errors on the main page', page.errors.length === 0, page.errors.join(' | '));

// ---------------------------------------------------------------------------
// Catherine's whisper: the Welcome Back next-step concierge (2026-08-03).
// Cath's order: Refine → Wardrobe List → Shop your Style → Wishlist → Trending.
console.log('\nWHISPER: the next-step concierge');
const WSEED = {
  userName: 'Test', answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  topArchNames: ['Timeless Classic', 'Modern Muse', 'Coastal Chic'],
  portrait: 'A test portrait.', motto: 'Shine on.'
};
const wp = await (async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(String(e)));
  await p.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await p.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), WSEED);
  await p.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => typeof window.show === 'function');
  await p.waitForTimeout(250);
  return p;
})();
const wst = () => wp.evaluate(() => ({
  on: document.getElementById('wbNext').classList.contains('on'),
  txt: document.getElementById('wbNextTxt').textContent,
  vis: (() => { const b = document.getElementById('wbNext').getBoundingClientRect(); return b.width > 0 && b.height > 0; })(),
}));

let st = await wst();
ok('un-refined woman sees the refine whisper', st.on && st.vis && st.txt.includes('add your sizes'), st.txt);
await wp.click('#wbNextTxt');
ok('tapping the whisper opens Refine', await wp.evaluate(() => document.querySelector('.scr.act').id) === 's-pref');
await wp.evaluate(() => show('s-wb'));
st = await wst();
ok('peeking at Refine without saving keeps the suggestion', st.on && st.txt.includes('add your sizes'));

await wp.evaluate(() => { prefs.colorsLove.push('Blush'); show('s-wb'); });
st = await wst();
ok('refined woman moves on to the wardrobe whisper', st.on && st.txt.includes('wardrobe checklist'), st.txt);

await wp.evaluate(() => { openWardrobe(); show('s-wb'); });
st = await wst();
ok('after visiting the wardrobe, shop-your-style is next', st.on && st.txt.includes('shop your style'), st.txt);

await wp.evaluate(() => { show('s-shopstyle'); show('s-wb'); });
st = await wst();
ok('empty wishlist is skipped, trending is next', st.on && st.txt.includes('Trending'), st.txt);

await wp.evaluate(() => { wardrobeData.wishlist.push({ id: 'a~b', n: 'Test piece', s: 'Nordstrom', q: 'test' }); show('s-wb'); });
st = await wst();
ok('with a saved piece, the wishlist stop appears before trending', st.on && st.txt.includes('Your Wishlist'), st.txt);

await wp.click('#wbNext .wbn-x');
st = await wst();
ok('the ✕ hides the whisper for this visit', !st.on);
const skipRec = await wp.evaluate(() => JSON.parse(localStorage.getItem('ss_nextskip') || '{}'));
ok('the dismissal is recorded per-step', skipRec.wishlist === 1, JSON.stringify(skipRec));
await wp.evaluate(() => show('s-wb'));
st = await wst();
ok('the next visit offers the following step, not the dismissed one', st.on && st.txt.includes('Trending'), st.txt);

// ⚠️ DELIBERATE UPDATE 2026-08-13: "explored everything → no whisper" is
// superseded by the GRADUATION WHISPER (her line, the long-waited words) —
// one final whisper hands her the daily habit (Ask your Stylist) + the weekly
// return (This Week's Star), then retires forever on tap or ✕.
await wp.evaluate(() => { openWardrobe('trend'); show('s-wb'); });
st = await wst();
ok('after all five stops, the GRADUATION whisper appears', st.on && st.txt.includes('explored it all'), st.txt);
ok('…with her exact everyday trio and the weekly nudge', st.txt.includes('what to wear, what to pack, which bag') && st.txt.includes('Star of the Week'));
await wp.evaluate(() => { wbNextGo(); });
const grad = await wp.evaluate(() => ({ chat: document.querySelector('.scr.act').id, stamp: localStorage.getItem('ss_grad') }));
ok('tapping it opens Ask your Stylist and stamps the graduation', grad.chat === 's-chat' && grad.stamp === '1');
await wp.evaluate(() => show('s-wb'));
st = await wst();
ok('graduated: no whisper ever again', !st.on);
ok('zero JS errors through the whisper lifecycle', wp.errors.length === 0, wp.errors.join(' | '));
await wp.context().close();

// ---------------------------------------------------------------------------
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
