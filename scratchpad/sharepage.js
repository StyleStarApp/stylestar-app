// Verification for the shared wishlist PAGE at /list/<token> (2026-08-22).
// Drives the real index.html in Chromium against a stubbed user-data function,
// with the server applying the REAL netlify.toml rules -- so the route only
// works here if the toml really rewrites it.
//
//   node scratchpad/sharepage.js
//
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8961;
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const TOML = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x ? '  → ' + x : '')); } };

const TOK = 'AbCd1234_-EfGh5678ijKlMnOpQrSt';
// One of everything: an approved-retailer exact row, a rebuilt search row, a
// row with no note, and a row whose text is an XSS attempt.
const LIST = [
  { name: 'FARM Rio Pink Garden Terrace Maxi Dress', store: 'FARM Rio', search: 'maxi dress',
    exact: true, url: 'https://www.farmrio.com/products/maxi-dress', price: '$360',
    note: 'Size 8. This is the one for the wedding in June.' },
  { name: 'White Linen Button-Front Blouse', store: 'J.Crew', search: 'white linen blouse',
    exact: false, note: 'Size medium, I like them a little oversized.' },
  { name: 'Tan Pointed Ballet Flats', store: 'Nordstrom', search: 'tan ballet flats', exact: false, note: '' },
  { name: '<img src=x onerror=alert(1)>Bad', store: '<b>Store</b>', search: 'x', exact: false,
    note: '<script>alert(2)<\/script>' }
];
let MODE = 'ok';
const payload = () => MODE === 'ok'   ? { success: true, name: 'Catherine', list: LIST }
                    : MODE === 'noname' ? { success: true, name: '', list: LIST.slice(0, 1) }
                    : MODE === 'empty'  ? { success: true, name: 'Catherine', list: [] } : null;

const rw = [...TOML.matchAll(/from = "([^"]+)"\s*\n\s*to = "\/index\.html"\s*\n\s*status = 200/g)].map(m => m[1]);
const rewritten = p => rw.some(r => r.endsWith('/*') ? p.startsWith(r.slice(0, -1)) : r === p);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  if (url.pathname.startsWith('/.netlify/functions/user-data')) {
    if (url.searchParams.get('share')) {
      if (MODE === 'gone') { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"error":"not_found"}'); }
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(payload()));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{}');
  }
  if (url.pathname.startsWith('/.netlify/functions/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{}'); }
  if (url.pathname === '/' || url.pathname === '/index.html' || rewritten(url.pathname)) {
    res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(HTML);
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); return res.end(fs.readFileSync(f)); }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

console.log('\n1. The route really exists');
ok('netlify.toml rewrites /list/* (200)', rw.includes('/list/*'), JSON.stringify(rw));
ok('the six older routes are untouched',
   ['/privacy','/terms','/story','/faq','/contact','/results'].every(p => rw.includes(p)));
ok('the chain pattern id is NOT shared with Your Wishlist',
   HTML.includes('id="shChainPat"') && HTML.includes('id="wlChainPat"'));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
async function open(width = 390) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('dialog', async d => { errs.push('DIALOG: ' + d.message()); await d.dismiss(); });
  await pg.goto(`http://localhost:${PORT}/list/${TOK}`);
  await pg.waitForTimeout(1100);
  return { ctx, pg };
}

console.log('\n2. A shared link opens her list');
MODE = 'ok';
let { ctx, pg } = await open();
let v = await pg.evaluate(() => {
  const on = document.querySelector('#s-sharelist.act');
  const q = s => document.querySelector('#s-sharelist ' + s);
  const t = s => { const e = q(s); return e ? e.textContent.trim() : null; };
  return {
    active: !!on, path: location.pathname,
    heartName: t('#shName'), lead: t('.sh-lead'),
    groups: [...document.querySelectorAll('#s-sharelist .sh-gh span')].map(e => e.textContent.trim()),
    rows: [...document.querySelectorAll('#s-sharelist .sh-row')].map(r => ({
      name: r.querySelector('.sh-name').textContent,
      note: r.querySelector('.sh-note') ? r.querySelector('.sh-note').textContent : null,
      btn: r.querySelector('.sh-go') ? r.querySelector('.sh-go').textContent.trim() : null,
      href: r.querySelector('.sh-go') ? r.querySelector('.sh-go').getAttribute('href') : null,
      rel: r.querySelector('.sh-go') ? r.querySelector('.sh-go').getAttribute('rel') : null
    })),
    crownPainted: !!q('.sh-crownheart') && q('.sh-crownheart').getBoundingClientRect().width > 100,
    disc: t('.sh-disc'),
    // ⚠️ .hm-entrance is display:none unless body carries ss-anim/ss-play, so
    // asserting the element is ABSENT tests nothing. Measure whether it PAINTS.
    curtain: (function(){var e=document.querySelector('.hm-entrance');
      return !!e && getComputedStyle(e).display !== 'none';})(),
    injected: !!document.querySelector('#s-sharelist img[src="x"]') || !!document.querySelector('#s-sharelist script')
  };
});
ok('the shared screen is the one showing', v.active);
ok('the address bar keeps the token', v.path === '/list/' + TOK, v.path);
ok('her name sits inside the heart', v.heartName === 'Catherine');
ok('her line reads as she wrote it', v.lead === 'This is my shopping wishlist!', v.lead);
ok('the crown really painted', v.crownPainted);
ok('both group headers are there, in her words',
   JSON.stringify(v.groups) === JSON.stringify(['Buy exactly this', 'Anything like this']), JSON.stringify(v.groups));
ok('every row rendered', v.rows.length === 4);
ok('the exact row says Shop it', v.rows[0].btn === 'Shop it →' || v.rows[0].btn.startsWith('Shop it'));
ok('the search rows say Find it', v.rows[1].btn.startsWith('Find it') && v.rows[2].btn.startsWith('Find it'));
ok('an approved retailer is affiliate-wrapped', /linksynergy\.com/.test(v.rows[0].href || ''), v.rows[0].href);
ok('the exact product url survives inside the wrap', /farmrio\.com%2Fproducts%2Fmaxi-dress|farmrio\.com\/products\/maxi-dress/.test(decodeURIComponent(v.rows[0].href || '')));
ok('a search row rebuilds a real store search', /jcrew\.com/.test(v.rows[1].href || ''), v.rows[1].href);
ok('every outbound link is rel="sponsored noopener"', v.rows.every(r => !r.href || r.rel === 'sponsored noopener'));
ok('her notes render', v.rows[0].note === 'Size 8. This is the one for the wedding in June.');
ok('a row without a note renders none', v.rows[2].note === null);
ok('the disclosure is present', /may earn a commission/.test(v.disc || ''));
ok('no entrance curtain over somebody else\'s page', !v.curtain);
ok('injected markup is inert text, not nodes', !v.injected && v.rows[3].name.includes('<img'));

console.log('\n2b. Nothing from HER app session leaks onto somebody else\'s page');
const chrome = await pg.evaluate(() => {
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
  const rod = document.querySelector('#s-sharelist .sh-rod').getBoundingClientRect();
  const ring = document.querySelector('#s-sharelist .sh-ring').getBoundingClientRect();
  return {
    hdr: vis(document.querySelector('.hdr')),
    chip: getComputedStyle(document.body).getPropertyValue('--x') !== null &&
          document.body.classList.contains('menu-hidechip'),
    // The ring is a curtain ring: it must really cross the rod, and really hang
    // below it. Two numbers, because "near it" is what looks wrong.
    overlap: Math.round((Math.min(ring.bottom, rod.bottom) - Math.max(ring.top, rod.top)) * 10) / 10,
    below: Math.round((ring.bottom - rod.bottom) * 10) / 10
  };
});
ok('the shared Style Star header is hidden', !chrome.hdr);
ok('the MENU chip stands down', chrome.chip);
ok('the ring really crosses the rod', chrome.overlap >= 4, 'overlap ' + chrome.overlap + 'px');
ok('...and really hangs below it', chrome.below >= 2, 'below ' + chrome.below + 'px');

console.log('\n3. It is read-only, by construction');
const ro = await pg.evaluate(() => ({
  del: document.querySelectorAll('#s-sharelist .wl-del,#s-sharelist .sh-del').length,
  inputs: document.querySelectorAll('#s-sharelist input,#s-sharelist textarea').length,
  stay: document.querySelectorAll('#s-sharelist .wl-stay').length,
  save: document.querySelectorAll('#s-sharelist .wl-save').length
}));
ok('no remove control', ro.del === 0);
ok('no form fields', ro.inputs === 0);
ok('no email ask', ro.stay === 0);
ok('no save hearts', ro.save === 0);

console.log('\n4. The disclosure sits ABOVE the first link (not a taste call)');
const above = await pg.evaluate(() => {
  const d = document.querySelector('#s-sharelist .sh-disc').getBoundingClientRect();
  const a = document.querySelector('#s-sharelist .sh-go').getBoundingClientRect();
  return d.bottom <= a.top;
});
ok('disclosure above every product link', above);

console.log('\n5. Contrast against the real painted background');
const cr = await pg.evaluate(() => {
  const lum = c => { const [r, g, b] = c.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const bgOf = el => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; n = n.parentElement; } return 'rgb(255,255,255)'; };
  const ratio = el => { const s = getComputedStyle(el); const a = lum(s.color), b = lum(bgOf(el)); return Math.round(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)) * 100) / 100; };
  const out = {};
  for (const [k, sel] of [['note', '.sh-note'], ['disclosure', '.sh-disc'], ['lead', '.sh-lead'], ['store', '.sh-store'], ['header', '.sh-gh span']]) {
    const e = document.querySelector('#s-sharelist ' + sel); if (e) out[k] = ratio(e);
  }
  return out;
});
for (const [k, r] of Object.entries(cr)) ok(`${k} clears AA (${r}:1)`, r >= 4.5, String(r));
await ctx.close();

console.log('\n6. The tail: one way in, and the legal pair');
({ ctx, pg } = await open());
const tail = await pg.evaluate(() => ({
  quizBtn: /style quiz/i.test(document.querySelector('#s-sharelist .sh-foot').textContent),
  stdFoot: document.querySelectorAll('#s-sharelist [data-std-foot]').length,
  mall: (document.querySelector('#s-sharelist .sh-f2') || {}).textContent || '',
  legal: (document.querySelector('#s-sharelist .sh-legal') || {}).textContent || ''
}));
ok('the quiz button is gone (her call)', !tail.quizBtn);
ok('the standard two-row footer is gone (her call)', tail.stdFoot === 0);
// ⚠️ Taking the screen's OWN footer off un-hid the GLOBAL one, because show()
// hides that via a hardcoded id list plus "does this screen own a footer".
// Pin the visible outcome, not the mechanism.
ok('...and the GLOBAL footer did not reappear in its place',
   await pg.evaluate(() => { const g = document.querySelector('.quiz-footer');
     return !g || getComputedStyle(g).display === 'none'; }));
ok('one Mall entry, for a reader who wants to browse', /Style Star Mall/.test(tail.mall));
ok('Privacy and Terms stay reachable on a public page',
   /Privacy/.test(tail.legal) && /Terms/.test(tail.legal));
await pg.evaluate(() => document.querySelector('#s-sharelist .sh-f2').click());
await pg.waitForTimeout(600);
ok('the Mall entry really opens the Mall', await pg.evaluate(() => !!document.querySelector('#s-shop.act')));
await ctx.close();

console.log('\n6b. Her two layout calls, measured');
({ ctx, pg } = await open());
const geo = await pg.evaluate(() => {
  const ss = document.querySelector('.ss').getBoundingClientRect();
  const rod = document.querySelector('#s-sharelist .sh-rod').getBoundingClientRect();
  return {
    squared: getComputedStyle(document.querySelector('.ss')).borderRadius === '0px',
    leftGap: Math.round((rod.left - ss.left) * 10) / 10,
    rightGap: Math.round((ss.right - rod.right) * 10) / 10
  };
});
ok('the card is squared, not rounded', geo.squared);
ok('the rod reaches the card\'s left edge', Math.abs(geo.leftGap) <= 0.6, geo.leftGap + 'px short');
ok('...and its right edge', Math.abs(geo.rightGap) <= 0.6, geo.rightGap + 'px short');
await ctx.close();

console.log('\n7. The three other states are all kind, never blank');
MODE = 'gone';
({ ctx, pg } = await open());
let g = await pg.evaluate(() => {
  const e = document.querySelector('#s-sharelist .sh-gone');
  return { shown: !!e, text: e ? e.textContent : '', raw: /error|404|undefined|\[object/i.test(document.querySelector('#shBody').textContent) };
});
ok('a revoked or mistyped link says so plainly', g.shown && /isn’t here|isn't here/.test(g.text));
ok('...and never shows a raw error', !g.raw);
ok('...and the empty heart carries no name', await pg.evaluate(() => document.querySelector('#shName').textContent === ''));
await ctx.close();

MODE = 'empty';
({ ctx, pg } = await open());
ok('an empty list explains itself', await pg.evaluate(() => /nothing on this wishlist yet/.test(document.querySelector('#shBody').textContent)));
ok('...and shows no disclosure, having nothing to disclose',
   await pg.evaluate(() => !document.querySelector('#s-sharelist .sh-disc')));
await ctx.close();

MODE = 'noname';
({ ctx, pg } = await open());
let nn = await pg.evaluate(() => ({
  heart: document.querySelector('#shName').textContent,
  lead: document.querySelector('#s-sharelist .sh-lead').textContent.trim()
}));
ok('with no name the heart is empty', nn.heart === '');
ok('...and the lead falls back to her wording',
   nn.lead === 'This is my Style Star shopping wishlist!', nn.lead);
await ctx.close();

console.log('\n8. It holds together on every phone');
MODE = 'ok';
for (const w of [390, 375, 360, 320]) {
  ({ ctx, pg } = await open(w));
  const m = await pg.evaluate(() => {
    const scr = document.querySelector('#s-sharelist').getBoundingClientRect();
    const over = [...document.querySelectorAll('#s-sharelist *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width && (r.left < -0.5 || r.right > window.innerWidth + 0.5);
    }).length;
    return { over, hscroll: document.documentElement.scrollWidth > window.innerWidth + 1, w: scr.width };
  });
  ok(`${w}px: nothing overflows`, m.over === 0, String(m.over));
  ok(`${w}px: no sideways scroll`, !m.hscroll);
  await ctx.close();
}

ok('zero JS errors anywhere', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} checks passed`));
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
