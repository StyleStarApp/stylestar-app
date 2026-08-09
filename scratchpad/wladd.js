// "Add your own piece" (2026-08-09, Cath's ask): the wishlist's two-door add.
// Door 1: words only -> store + name saved, search link REBUILT every render
//         ("Find it"), exactly like an AI suggestion.
// Door 2: a pasted product link -> the exact piece stored ("Shop it", "Your
//         pick" badge) — the registry case: her husband lands on THE bag.
// Drives the real index.html in Chromium. No AI calls, no network.
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
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fails = 0, checks = 0;
const ok = (n, c, x) => { checks++; console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : '')); if (!c) fails++; };

const CONTRAST = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
  const parse = s => s.match(/[\\d.]+/g).slice(0,3).map(Number);
  const bgOf = el => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) return parse(c); n = n.parentElement; } return [255,255,255]; };
  window.__ratio = sel => { const e = document.querySelector(sel); if (!e) return null; const a = lum(parse(getComputedStyle(e).color)), b = lum(bgOf(e)); const [hi,lo] = a>b?[a,b]:[b,a]; return +((hi+.05)/(lo+.05)).toFixed(2); };
})()`;

async function boot(w, seedWishlist) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route('**/user-data*', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await page.addInitScript(list => {
    // Seed ONCE per context: this init script runs again on reload, and
    // re-seeding there would wipe what the test just added.
    if (localStorage.getItem('__wladd_seeded')) return;
    localStorage.setItem('__wladd_seeded', '1');
    // ss_wardrobe seeds MUST include pretap0:true or the migration wipes items.
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: {}, custom: [], pretap0: true, wishlist: list || [] }));
  }, seedWishlist || []);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(200);
  return { page, errs };
}
const vis = `el => { if(!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }`;

// ── PART 1: the whole lifecycle at 390 ──────────────────────────────────────
{
  const { page, errs } = await boot(390);

  // 1. Empty state: the "add your own" link is there, the collapsed button is not
  let r = await page.evaluate(`(() => { const v = ${vis};
    return { empty: v(document.querySelector('#wlBody .wl-empty')),
             link: v(document.querySelector('#wlBody .we-addlnk')),
             btn: !!document.querySelector('#wlAdd .wl-addbtn'),
             form: !!document.querySelector('#wlAdd .wl-add') }; })()`);
  ok('empty state renders', r.empty);
  ok('empty state carries the add-your-own link', r.link);
  ok('no collapsed add button on the empty page (the link is the door)', !r.btn);
  ok('form starts closed', !r.form);

  // 2. The link opens the form, focus lands on the name field
  await page.evaluate(() => wlAddOpen());
  await page.waitForTimeout(120);
  r = await page.evaluate(`(() => { const v = ${vis};
    return { form: v(document.querySelector('#wlAdd .wl-add')),
             name: !!document.getElementById('waName'),
             store: !!document.getElementById('waStore'),
             url: !!document.getElementById('waUrl'),
             focused: document.activeElement && document.activeElement.id === 'waName',
             title: (document.querySelector('#wlAdd .wa-t')||{}).textContent || '' }; })()`);
  ok('form opens with all three fields', r.form && r.name && r.store && r.url);
  ok('focus lands on the piece field', r.focused);
  ok('form title reads "Wishing for something?" (her wording)', r.title.trim() === 'Wishing for something?');

  // 3. Empty name refused
  await page.evaluate(() => wlAddSubmit());
  r = await page.evaluate(() => ({ msg: document.getElementById('waMsg').textContent, n: wardrobeData.wishlist.length }));
  ok('empty name refused with a kind message', /piece first/i.test(r.msg) && r.n === 0);

  // 4. DOOR 1: words + a known store -> canonical store name, rebuilt search link
  await page.evaluate(() => {
    document.getElementById('waName').value = 'Tan kitten-heel mules';
    document.getElementById('waStore').value = 'sam edelman';
    wlAddSubmit();
  });
  await page.waitForTimeout(150);
  r = await page.evaluate(() => {
    const it = wardrobeData.wishlist[0];
    const row = document.querySelector('#wlBody .wl-row');
    const go = row.querySelector('.wl-go');
    return { store: it.store, own: it.own, url: it.url || '', search: it.search,
             btn: go.textContent.trim(), href: go.getAttribute('href'),
             expect: getStoreUrl('Sam Edelman', 'Tan kitten-heel mules', ''),
             badge: !!row.querySelector('.wl-own'),
             count: document.getElementById('wlCount').textContent,
             toast: document.getElementById('wlToast').classList.contains('on'),
             viewHidden: document.querySelector('#wlToast .wt-go').style.display === 'none' };
  });
  ok('door 1: store resolves to its canonical name', r.store === 'Sam Edelman', r.store);
  ok('door 1: marked as her own, no URL stored', r.own === true && r.url === '');
  ok('door 1: says "Find it" and rebuilds the real store search', /Find it/.test(r.btn) && r.href === r.expect, r.href);
  ok('door 1: no "Your pick" badge on a search row', !r.badge);
  ok('count updates', /1 piece/.test(r.count));
  ok('toast confirms, View hidden while on the list', r.toast && r.viewHidden);

  // 5. Form collapsed after adding; the quiet button appears under the list
  r = await page.evaluate(`(() => { const v = ${vis};
    return { form: !!document.querySelector('#wlAdd .wl-add'),
             btn: v(document.querySelector('#wlAdd .wl-addbtn')),
             label: (document.querySelector('#wlAdd .wl-addbtn')||{}).textContent||'' }; })()`);
  ok('form stands down after adding', !r.form);
  ok('collapsed "wishing for" button appears with items', r.btn && /Add a piece you’re wishing for/.test(r.label));

  // 6. DOOR 2: the Valentino case — pasted link, trackers stripped, store derived
  await page.evaluate(() => {
    wlAddOpen();
    document.getElementById('waName').value = 'Valentino black studded shoulder bag';
    document.getElementById('waUrl').value = 'https://www.saksfifthavenue.com/product/valentino-garavani-rockstud-bag-0400012345.html?color=black&utm_source=ig&utm_campaign=spring&gclid=abc123';
    wlAddSubmit();
  });
  await page.waitForTimeout(150);
  r = await page.evaluate(() => {
    const it = wardrobeData.wishlist[0];
    const row = document.querySelector('#wlBody .wl-row');
    const go = row.querySelector('.wl-go');
    return { store: it.store, url: it.url, btn: go.textContent.trim(), href: go.getAttribute('href'),
             badge: (row.querySelector('.wl-own') || {}).textContent || '', pick: !!row.querySelector('.wl-pick') };
  });
  ok('door 2: exact URL stored', r.url.indexOf('https://www.saksfifthavenue.com/product/valentino-garavani-rockstud-bag-0400012345.html') === 0);
  ok('door 2: trackers stripped, load-bearing params kept', /color=black/.test(r.url) && !/utm_|gclid/.test(r.url), r.url);
  ok('door 2: store named from the link', /saks/i.test(r.store), r.store);
  ok('door 2: says "Shop it" straight to the stored URL', /Shop it/.test(r.btn) && r.href === r.url);
  ok('door 2: carries "Your pick", never "Catherine’s pick"', /Your pick/i.test(r.badge) && !r.pick);

  // 7. A scheme-less paste is forgiven; an off-list boutique keeps its honest hostname
  await page.evaluate(() => {
    wlAddOpen();
    document.getElementById('waName').value = 'Rockstud tote';
    document.getElementById('waUrl').value = 'valentino.com/us-en/bags/rockstud-tote?fbclid=zzz';
    wlAddSubmit();
  });
  r = await page.evaluate(() => { const it = wardrobeData.wishlist[0]; return { url: it.url, store: it.store }; });
  ok('scheme-less paste forgiven (https prepended)', r.url === 'https://valentino.com/us-en/bags/rockstud-tote', r.url);
  ok('unknown boutique labelled by its hostname', r.store === 'valentino.com', r.store);

  // 8. A javascript: paste is refused outright
  await page.evaluate(() => {
    wlAddOpen();
    document.getElementById('waName').value = 'Evil bag';
    document.getElementById('waUrl').value = 'javascript:alert(1)';
    wlAddSubmit();
  });
  r = await page.evaluate(() => ({ msg: document.getElementById('waMsg').textContent, n: wardrobeData.wishlist.length }));
  ok('javascript: link refused', /look right/i.test(r.msg) && r.n === 3);

  // 9. The same piece twice stays one row
  await page.evaluate(() => {
    document.getElementById('waName').value = 'Tan kitten-heel mules';
    document.getElementById('waUrl').value = '';
    document.getElementById('waStore').value = 'Sam Edelman';
    wlAddSubmit();
  });
  r = await page.evaluate(() => ({ msg: document.getElementById('waMsg').textContent, n: wardrobeData.wishlist.length }));
  ok('duplicate add refused gently', /already on your list/i.test(r.msg) && r.n === 3);

  // 10. Words with no store at all -> Google Shopping, and no empty store line
  await page.evaluate(() => {
    document.getElementById('waName').value = 'Pearl drop earrings';
    document.getElementById('waStore').value = '';
    wlAddSubmit();
  });
  await page.waitForTimeout(120);
  r = await page.evaluate(() => {
    const row = document.querySelector('#wlBody .wl-row');
    return { href: row.querySelector('.wl-go').getAttribute('href'), stLine: !!row.querySelector('.wl-st') };
  });
  ok('no store -> Google Shopping search', /google\.com\/search\?tbm=shop/.test(r.href) && /Pearl%20drop%20earrings/i.test(r.href), r.href);
  ok('no empty store line rendered', !r.stLine);

  // 11. Words at a store we don't carry -> her brand word rides into the search
  await page.evaluate(() => {
    wlAddOpen();
    document.getElementById('waName').value = 'Silk carre scarf';
    document.getElementById('waStore').value = 'Hermes';
    wlAddSubmit();
  });
  await page.waitForTimeout(120);
  r = await page.evaluate(() => {
    const it = wardrobeData.wishlist[0];
    const href = document.querySelector('#wlBody .wl-row .wl-go').getAttribute('href');
    return { search: it.search, href };
  });
  ok('unknown store folded into the search term', r.search === 'Hermes Silk carre scarf' && /Hermes%20Silk/.test(r.href), r.href);

  // 12. "Never mind" closes the form without adding
  await page.evaluate(() => { wlAddOpen(); });
  await page.evaluate(() => { document.getElementById('waName').value = 'Never added'; wlAddCancel(); });
  r = await page.evaluate(`(() => ({ form: !!document.querySelector('#wlAdd .wl-add'), n: wardrobeData.wishlist.length }))()`);
  ok('"Never mind" closes without adding', !r.form && r.n === 5);

  // 13. Heart-tip stamp: 2+ saves means the lesson is learned
  r = await page.evaluate(() => localStorage.getItem('ss_hearttip'));
  ok('own adds count toward the heart-tip retirement', r === '1');

  // 14. Email ask appears now that she has saved work worth protecting
  r = await page.evaluate(`(() => { const v = ${vis}; return v(document.querySelector('#wlStay .wl-stay')); })()`);
  ok('email ask appears under a non-empty list', r);

  // 15. Disclosure rides with the links
  r = await page.evaluate(`(() => { const v = ${vis}; return v(document.querySelector('#wlBody .wl-disclosure')); })()`);
  ok('disclosure visible with items', r);

  // 16. Persistence: reload, everything survives normalization intact
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(200);
  r = await page.evaluate(() => {
    const l = wardrobeData.wishlist;
    const valentino = l.find(x => /studded/.test(x.name));
    const mules = l.find(x => /mules/i.test(x.name));
    const rows = document.querySelectorAll('#wlBody .wl-row').length;
    const badge = !!document.querySelector('#wlBody .wl-own');
    return { n: l.length, rows, exact: valentino && valentino.url, own: mules && mules.own, badge };
  });
  ok('all five survive a reload', r.n === 5 && r.rows === 5);
  ok('exact URL survives normalization', /saksfifthavenue\.com/.test(r.exact || ''));
  ok('own flag survives normalization', r.own === true);
  ok('"Your pick" badge back after reload', r.badge);

  // 17. A hand-edited javascript: URL is stripped on load; the row falls back
  //     to an honest rebuilt search instead of rendering a poisoned link
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('ss_wardrobe'));
    const v = d.wishlist.find(x => /studded/.test(x.name));
    v.url = 'javascript:alert(1)';
    localStorage.setItem('ss_wardrobe', JSON.stringify(d));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(200);
  r = await page.evaluate(() => {
    const it = wardrobeData.wishlist.find(x => /studded/.test(x.name));
    const hrefs = Array.from(document.querySelectorAll('#wlBody .wl-go')).map(a => a.getAttribute('href'));
    return { url: it.url || '', poisoned: hrefs.some(h => /javascript:/i.test(h)), stillLinked: hrefs.length === 5 };
  });
  ok('hand-edited javascript: URL stripped on load', r.url === '');
  ok('poisoned row falls back to a search link, nothing unlinked', !r.poisoned && r.stillLinked);

  // 18. Removing rows works; removing them all restores the empty state + link
  await page.evaluate(() => { wardrobeData.wishlist.slice().forEach(it => wishRemove(it.id)); });
  await page.waitForTimeout(150);
  r = await page.evaluate(`(() => { const v = ${vis};
    return { empty: v(document.querySelector('#wlBody .wl-empty')),
             link: v(document.querySelector('#wlBody .we-addlnk')),
             btn: !!document.querySelector('#wlAdd .wl-addbtn') }; })()`);
  ok('emptied list returns to the empty state with its add link', r.empty && r.link && !r.btn);

  ok('zero JS errors through the whole lifecycle', errs.length === 0, errs.join(' | ').slice(0, 200));
  await page.close();
}

// ── PART 2: layout + contrast at 390 and 360 ────────────────────────────────
for (const w of [390, 360]) {
  const { page, errs } = await boot(w, [
    { id: 'valentino-black-studded-shoulder-bag~saks-fifth-avenue', name: 'Valentino black studded shoulder bag', store: 'Saks Fifth Avenue', search: '', ts: 1, own: true, url: 'https://www.saksfifthavenue.com/product/rockstud.html' },
    { id: 'tan-kitten-heel-mules~sam-edelman', name: 'Tan kitten-heel mules', store: 'Sam Edelman', search: '', ts: 2, own: true }
  ]);
  await page.evaluate(() => wlAddOpen());
  await page.waitForTimeout(150);
  await page.evaluate(CONTRAST);
  const m = await page.evaluate(`(() => { const v = ${vis};
    const doc = document.documentElement;
    const form = document.querySelector('#wlAdd .wl-add');
    const inputs = Array.from(document.querySelectorAll('#wlAdd input'));
    const scr = document.getElementById('s-wishlist');
    const over = Array.from(scr.querySelectorAll('*')).filter(el => v(el) && el.getBoundingClientRect().right > ${w} + 1).length;
    return {
      formVisible: v(form),
      inputsFit: inputs.every(i => i.getBoundingClientRect().right <= ${w} && i.getBoundingClientRect().width > 200),
      pageScroll: doc.scrollWidth <= ${w} + 1,
      overflows: over,
      hintRatio: window.__ratio('#wlAdd .wa-hint'),
      subRatio: window.__ratio('#wlAdd .wa-s'),
      msgRatioSetup: (document.getElementById('waMsg').textContent = 'x', window.__ratio('#waMsg')),
      badgeRatio: window.__ratio('#wlBody .wl-own'),
      btnText: (document.querySelector('#wlBody .wl-row.own .wl-go')||{}).textContent || ''
    }; })()`);
  ok(w + ': form renders and inputs fit', m.formVisible && m.inputsFit);
  ok(w + ': no sideways scroll, nothing overflows', m.pageScroll && m.overflows === 0, m.overflows + ' overflowing');
  ok(w + ': hint clears AA', m.hintRatio >= 4.5, m.hintRatio + ':1');
  ok(w + ': sub-line clears AA', m.subRatio >= 4.5, m.subRatio + ':1');
  ok(w + ': status message clears AA', m.msgRatioSetup >= 4.5, m.msgRatioSetup + ':1');
  ok(w + ': "Your pick" badge clears AA', m.badgeRatio >= 4.5, m.badgeRatio + ':1');
  ok(w + ': seeded exact row says Shop it', /Shop it/.test(m.btnText));
  // Her longer wording must hold ONE line on the collapsed button (close the
  // form first — the button only renders in the collapsed state).
  const btn = await page.evaluate(() => {
    wlAddCancel();
    const b = document.querySelector('#wlAdd .wl-addbtn');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { h: r.height, fits: r.right <= window.innerWidth && r.left >= 0, sub: (document.querySelector('#wlAdd .wa-s') || { textContent: '' }).textContent };
  });
  ok(w + ': collapsed button holds one line and fits', btn && btn.h < 40 && btn.fits, btn && btn.h + 'px');
  ok(w + ': zero JS errors', errs.length === 0, errs.join(' | ').slice(0, 200));
  await page.close();
}

// ── PART 3: no placeholder may overflow its box (her live catch, 2026-08-09:
// "the words are cut off") — measured with the input's real computed font
// against its real inner width, at every width including 320 ─────────────────
for (const w of [390, 360, 320]) {
  const { page, errs } = await boot(w);
  await page.evaluate(() => { wlAddOpen(); });
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#wlAdd input').forEach(i => {
      const cs = getComputedStyle(i);
      const inner = i.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const c = document.createElement('canvas').getContext('2d');
      c.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      const need = c.measureText(i.getAttribute('placeholder') || '').width;
      if (need > inner) out.push(i.id + ' needs ' + Math.round(need) + 'px, has ' + Math.round(inner));
    });
    return out;
  });
  ok(w + ': every placeholder fits its box whole', bad.length === 0, bad.join(' | '));
  ok(w + ': zero JS errors (placeholder pass)', errs.length === 0);
  await page.close();
}

// ── PART 4: the stacked SAVE label on Complete-the-Look rows (her pick,
// 2026-08-09: the bare heart read as decoration; inline stole name width) ────
for (const w of [390, 360]) {
  const { page, errs } = await boot(w);
  await page.evaluate(() => {
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('act'));
    const scr = document.getElementById('s-photo-res');
    scr.classList.add('act'); scr.classList.add('rv-open');
    _renderShop([
      { name: 'Gold Oversized Hoop Earrings', store: 'Kendra Scott', search: 'gold hoop earrings', category: 'jewelry', why: 'Echoes gold buttons' },
      { name: 'Cream Leather Slim Belt', store: 'Nordstrom', search: 'cream leather belt', category: 'belt', why: 'Defines waist' }
    ]);
  });
  await page.waitForTimeout(2300);
  await page.evaluate(CONTRAST);
  const m = await page.evaluate(`(() => { const v = ${vis};
    const s = document.querySelector('#pShopList .shoprow .wl-save');
    const t = s.querySelector('.wl-save-t');
    const heart = s.querySelector('svg').getBoundingClientRect();
    const cap = t.getBoundingClientRect();
    const over = Array.from(document.querySelectorAll('#pShopList .shoprow *'))
      .filter(el => v(el) && el.getBoundingClientRect().right > ${w} + 1).length;
    return { labelVisible: v(t), text: t.textContent.trim(),
             stacked: cap.top >= heart.bottom - 2,
             column: getComputedStyle(s).flexDirection === 'column',
             ratio: window.__ratio('#pShopList .shoprow .wl-save-t'),
             over }; })()`);
  ok(w + ': SAVE caption visible on Complete-the-Look rows', m.labelVisible && m.text === 'Save');
  ok(w + ': caption stacked UNDER the heart, not beside it', m.stacked && m.column);
  ok(w + ': caption clears AA', m.ratio >= 4.5, m.ratio + ':1');
  ok(w + ': rows still fit, nothing overflows', m.over === 0);
  // toggling flips the caption to "Saved"
  const t2 = await page.evaluate(() => {
    document.querySelector('#pShopList .shoprow .wl-save').click();
    return document.querySelector('#pShopList .shoprow .wl-save .wl-save-t').textContent.trim();
  });
  ok(w + ': tapping flips caption to "Saved"', t2 === 'Saved');
  ok(w + ': zero JS errors (stacked-label pass)', errs.length === 0);
  await page.close();
}

await browser.close();
server.close();
console.log('\n' + checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
