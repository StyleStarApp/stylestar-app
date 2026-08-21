// Item one of the shareable wishlist: her note on a piece (2026-08-22).
// Drives the REAL Your Wishlist screen in Chromium with a seeded record.
//
//   node scratchpad/wlnote.js
//
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8977;
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x ? '  → ' + x : '')); } };

const srv = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/.netlify/functions/')) { r.writeHead(200, {'Content-Type':'application/json'}); return r.end('{}'); }
  if (u.pathname === '/') { r.writeHead(200, {'Content-Type':'text/html'}); return r.end(HTML); }
  const f = path.join(ROOT, u.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200); return r.end(fs.readFileSync(f)); }
  r.writeHead(404); r.end('');
});
await new Promise(r => srv.listen(PORT, r));

// ⚠️ pretap0:true is load-bearing in any seeded record — without it
// _normalizeWardrobe's migration wipes items and everything renders empty.
const SEED = {
  pretap0: true, items: {}, custom: [], hidden: [],
  wishlist: [
    { id: 'farm-rio-maxi~farm-rio', name: 'FARM Rio Maxi Dress', store: 'FARM Rio',
      search: 'maxi dress', exact: true, url: 'https://www.farmrio.com/p/1', price: '$360' },
    { id: 'white-blouse~j-crew', name: 'White Linen Blouse', store: 'J.Crew', search: 'white linen blouse' }
  ]
};
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
async function open(w = 390) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(String(e)));
  // ⚠️ SEED ONLY IF ABSENT. addInitScript runs on EVERY navigation in the
  // context, including a reload -- seeding unconditionally wiped the note the
  // reload was supposed to prove had persisted, and the "survives a reload"
  // check failed on perfectly good code. A test that destroys the state it is
  // about to assert proves nothing.
  await pg.addInitScript(seed => {
    if (!localStorage.getItem('ss_wardrobe')) localStorage.setItem('ss_wardrobe', JSON.stringify(seed));
  }, SEED);
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); openWishlist(); });
  await pg.waitForTimeout(400);
  return { ctx, pg };
}
// Clicking something that isn't there should fail one check, not kill the run
// and hide everything below it.
const tap = (pg, sel) => pg.evaluate(s => {
  const el = document.querySelector(s);
  if (!el) return false;
  el.click(); return true;
}, '#s-wishlist ' + sel);
const rowState = pg => pg.evaluate(() => [...document.querySelectorAll('#s-wishlist .wl-row')].map(r => ({
  name: r.querySelector('.wl-nm').textContent,
  add: !!r.querySelector('.wl-addnote'),
  note: r.querySelector('.wl-note') ? r.querySelector('.wl-note').textContent : null,
  edit: !!r.querySelector('.wl-ne'),
  editing: !!r.querySelector('.wl-nedit'),
  hasnote: r.classList.contains('hasnote')
})));

console.log('\n1. A piece with no note offers one, in words');
let { ctx, pg } = await open();
let rows = await rowState(pg);
ok('both rows show "+ Add a note"', rows.length === 2 && rows.every(r => r.add), JSON.stringify(rows));
ok('no row is top-aligned yet', rows.every(r => !r.hasnote));
ok('the affordance is a word, not an icon',
   await pg.evaluate(() => document.querySelector('#s-wishlist .wl-addnote').textContent.trim() === '+ Add a note'));
ok('the lead line teaches it', await pg.evaluate(() =>
   /Add a note/.test(document.querySelector('#s-wishlist .wl-lead').textContent)));
ok('...and still teaches the ×', await pg.evaluate(() =>
   /take an item off your list/.test(document.querySelector('#s-wishlist .wl-lead').textContent)));

console.log('\n2. Writing one');
ok('tapped .wl-addnote', await tap(pg, '.wl-addnote'));
await pg.waitForTimeout(250);
let ed = await pg.evaluate(() => {
  const t = document.getElementById('wlNoteIn');
  return { open: !!t, focused: document.activeElement === t, max: t && t.getAttribute('maxlength'),
           save: !!document.querySelector('#s-wishlist .wl-nsave'),
           cancel: !!document.querySelector('#s-wishlist .wl-ncancel'),
           ph: t && t.getAttribute('placeholder') };
});
ok('a box opens', ed.open);
ok('...focused, so she can just type', ed.focused);
ok('...capped at 140', ed.max === '140');
ok('...with Save and Cancel', ed.save && ed.cancel);
ok('...and a placeholder that says what to write', /size|color|for/i.test(ed.ph || ''));
await pg.fill('#wlNoteIn', 'Size 8. This is the one for the wedding in June.');
ok('tapped .wl-nsave', await tap(pg, '.wl-nsave'));
await pg.waitForTimeout(250);
rows = await rowState(pg);
ok('the note shows on the row', /Size 8\. This is the one for the wedding in June\./.test(rows[0].note || ''), JSON.stringify(rows[0]));
ok('...with an Edit beside it', rows[0].edit);
ok('...and that row is now top-aligned', rows[0].hasnote);
ok('the other row is untouched', rows[1].add && !rows[1].hasnote);

console.log('\n3. It survives a reload (localStorage, like everything else)');
await pg.reload(); await pg.waitForTimeout(900);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); openWishlist(); });
await pg.waitForTimeout(400);
rows = await rowState(pg);
ok('her words are still there', /wedding in June/.test(rows[0].note || ''));

console.log('\n4. Editing, clearing and cancelling');
ok('tapped .wl-ne', await tap(pg, '.wl-ne'));
await pg.waitForTimeout(250);
ok('Edit reopens with what she wrote',
   await pg.evaluate(() => /wedding in June/.test(document.getElementById('wlNoteIn').value)));
await pg.fill('#wlNoteIn', 'Actually the green one.');
ok('tapped .wl-ncancel', await tap(pg, '.wl-ncancel'));
await pg.waitForTimeout(250);
rows = await rowState(pg);
ok('Cancel throws the change away', /wedding in June/.test(rows[0].note || ''));
ok('tapped .wl-ne', await tap(pg, '.wl-ne'));
await pg.waitForTimeout(200);
await pg.fill('#wlNoteIn', '   ');
ok('tapped .wl-nsave', await tap(pg, '.wl-nsave'));
await pg.waitForTimeout(250);
rows = await rowState(pg);
ok('emptying the box removes the note', rows[0].add && !rows[0].note && !rows[0].hasnote);

console.log('\n5. Hard cases');
ok('tapped .wl-addnote', await tap(pg, '.wl-addnote'));
await pg.waitForTimeout(200);
await pg.evaluate(() => {
  const t = document.getElementById('wlNoteIn');
  t.value = 'x'.repeat(400) + ' tail';
  document.querySelector('#s-wishlist .wl-nsave').click();
});
await pg.waitForTimeout(250);
ok('a 400-character note is cut to 140',
   await pg.evaluate(() => (JSON.parse(localStorage.getItem('ss_wardrobe')).wishlist[0].note || '').length === 140));
ok('tapped .wl-ne', await tap(pg, '.wl-ne'));
await pg.waitForTimeout(200);
await pg.evaluate(() => {
  const t = document.getElementById('wlNoteIn');
  t.value = 'line one\n\n\nline two    with   gaps';
  document.querySelector('#s-wishlist .wl-nsave').click();
});
await pg.waitForTimeout(250);
ok('newlines and runs of spaces collapse',
   await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_wardrobe')).wishlist[0].note === 'line one line two with gaps'));
ok('tapped .wl-ne', await tap(pg, '.wl-ne'));
await pg.waitForTimeout(200);
await pg.evaluate(() => {
  const t = document.getElementById('wlNoteIn');
  t.value = '<img src=x onerror=alert(1)>bad';
  document.querySelector('#s-wishlist .wl-nsave').click();
});
await pg.waitForTimeout(250);
const xss = await pg.evaluate(() => ({
  nodes: document.querySelectorAll('#s-wishlist img[src="x"]').length,
  text: document.querySelector('#s-wishlist .wl-note').textContent
}));
ok('markup in a note is inert text', xss.nodes === 0 && xss.text.includes('<img'));
ok('a hand-edited over-long note is cut on LOAD too', await pg.evaluate(async () => {
  const d = JSON.parse(localStorage.getItem('ss_wardrobe'));
  d.wishlist[0].note = 'y'.repeat(900);
  localStorage.setItem('ss_wardrobe', JSON.stringify(d));
  wardrobeData = loadWardrobeData();
  return wardrobeData.wishlist[0].note.length === 140;
}));

console.log('\n6. Contrast against the real painted background');
await pg.evaluate(() => { renderWishlist(); });
await pg.waitForTimeout(200);
const cr = await pg.evaluate(() => {
  const lum = c => { const [r,g,b] = c.match(/\d+/g).map(Number).map(v => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*r + .7152*g + .0722*b; };
  const bgOf = el => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) return c; n = n.parentElement; } return 'rgb(255,255,255)'; };
  const ratio = el => { const s = getComputedStyle(el); const a = lum(s.color), b = lum(bgOf(el)); return Math.round(((Math.max(a,b)+.05)/(Math.min(a,b)+.05))*100)/100; };
  const out = {};
  for (const [k, sel] of [['note','.wl-note'], ['edit','.wl-ne'], ['add','.wl-addnote']]) {
    const e = document.querySelector('#s-wishlist ' + sel); if (e) out[k] = ratio(e);
  }
  return out;
});
for (const [k, r] of Object.entries(cr)) ok(`${k} clears AA (${r}:1)`, r >= 4.5, String(r));
await ctx.close();

console.log('\n7. It holds together on every phone');
for (const w of [390, 375, 360, 320]) {
  ({ ctx, pg } = await open(w));
  ok('tapped .wl-addnote', await tap(pg, '.wl-addnote'));
  await pg.waitForTimeout(200);
  await pg.fill('#wlNoteIn', 'Size 8. This is the one for the wedding in June, so it matters most.');
  ok('tapped .wl-nsave', await tap(pg, '.wl-nsave'));
  await pg.waitForTimeout(300);
  const m = await pg.evaluate(() => {
    const card = document.querySelector('#s-wishlist .wl-card').getBoundingClientRect();
    const over = [...document.querySelectorAll('#s-wishlist .wl-row *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width && (r.left < card.left - 0.5 || r.right > card.right + 0.5);
    }).length;
    return { over, hscroll: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  ok(`${w}px: nothing escapes the card`, m.over === 0, String(m.over));
  ok(`${w}px: no sideways scroll`, !m.hscroll);
  await ctx.close();
}
ok('zero JS errors anywhere', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} checks passed`));
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
