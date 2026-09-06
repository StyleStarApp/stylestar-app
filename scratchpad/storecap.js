// storecap.js — HER STORE-VARIETY RULE, ASSERTED ON BOTH HALVES (2026-09-06).
//
// The rule (Cath, 2026-07-27) differs by surface on purpose:
//   compare (the Wardrobe Ideas carousel) — EVERY option a different store.
//     "Four white blouses at one store tells her nothing she could not have
//     found herself."
//   default (Shop your style, wishlist, Complete the Look) — max TWO per store.
//
// 🚨 WHY THIS SUITE EXISTS. The compare rule reached only the AI prompt.
// curatedPicks, which fills the very same carousel, used a hardcoded 2 — the
// DEFAULT surface's number on a compare surface — and the AI was never told
// which stores the curated half had already used. Both halves held a
// store-variety rule and neither knew what the other picked.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/storecap.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8953, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let lastPrompt = '';
  await pg.route('**/.netlify/functions/product-search', r =>
    r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({products: []})}));
  await pg.route('**/.netlify/functions/style-ai', r => {
    try { lastPrompt = JSON.stringify(r.request().postDataJSON()); } catch (e) { lastPrompt = String(r.request().postData() || ''); }
    r.fulfill({status: 200, contentType: 'application/json',
      body: JSON.stringify({content: [{text: JSON.stringify({items: [
        {name: 'A', search: 'a', store: 'Talbots'}, {name: 'B', search: 'b', store: 'Boden'}]})}]})});
  });
  await pg.goto('http://localhost:8953/');
  await pg.evaluate(() => _loadProducts());
  await pg.waitForFunction(() => _productsCatalog && _productsCatalog.products.length > 0, null, {timeout: 15000});

  // ── Part A — the shared cap ────────────────────────────────────────────
  console.log('Part A — one table, both halves');
  ok('compare is ONE per store (her rule for this surface)', await pg.evaluate(() => _storeCap('compare')) === 1);
  ok('default is TWO per store', await pg.evaluate(() => _storeCap('default')) === 2);
  ok('an unknown mode falls back to the safe default, never to 0',
    await pg.evaluate(() => _storeCap('nonsense')) === 2);

  // ── Part B — the prompt half is built from that table ──────────────────
  console.log('Part B — the prompt half, and the drift guard');
  ok('compare mode tells the model every option must differ',
    /EVERY option must come from a DIFFERENT store/.test(await pg.evaluate(() => _shopRules('compare'))));
  ok('default mode names the number from the table',
    /Never put more than 2 picks at the same store/.test(await pg.evaluate(() => _shopRules('shop'))));
  // ⭐ DRIFT GUARD: move the number, and the sentence must move with it.
  ok('the default sentence is GENERATED from the table, not duplicated',
    await pg.evaluate(() => {
      const keep = _STORE_CAP.default; _STORE_CAP.default = 7;
      const moved = /more than 7 picks/.test(_shopRules('shop'));
      _STORE_CAP.default = keep; return moved;
    }) === true);

  // ── Part C — the shelf half, across every real row ─────────────────────
  console.log('Part C — the shelf half');
  const worst = await pg.evaluate(() => {
    const slots = []; wardrobeItems.forEach(c => c.items.forEach(i => slots.push(i.id)));
    let worstCount = 0, rowsWithPicks = 0, offender = '';
    slots.forEach(s => {
      const r = curatedPicks(s, prefs, _herFamily(), 4, 'compare');
      if (!r.picks.length) return;
      rowsWithPicks++;
      const c = {}; r.picks.forEach(p => c[p.retailer] = (c[p.retailer] || 0) + 1);
      Object.keys(c).forEach(k => { if (c[k] > worstCount) { worstCount = c[k]; offender = s + ':' + k; } });
    });
    return {worstCount, rowsWithPicks, offender};
  });
  ok('no row shows two cards from one store', worst.worstCount <= 1, worst.offender);
  ok('and the shelf did not empty doing it', worst.rowsWithPicks >= 8, 'rows=' + worst.rowsWithPicks);

  // ⚠️ THE OTHER DIRECTION: the cap must really be read, not hardcoded to 1.
  ok('mode "default" still permits two from one store', await pg.evaluate(() => {
    const slots = []; wardrobeItems.forEach(c => c.items.forEach(i => slots.push(i.id)));
    return slots.some(s => {
      const r = curatedPicks(s, prefs, _herFamily(), 4, 'default');
      const c = {}; r.picks.forEach(p => c[p.retailer] = (c[p.retailer] || 0) + 1);
      return Object.keys(c).some(k => c[k] === 2);
    });
  }) === true);
  ok('a caller that forgets the mode gets the STRICT rule, not the loose one',
    await pg.evaluate(() => {
      const slots = []; wardrobeItems.forEach(c => c.items.forEach(i => slots.push(i.id)));
      return slots.every(s => {
        const r = curatedPicks(s, prefs, _herFamily(), 4);
        const c = {}; r.picks.forEach(p => c[p.retailer] = (c[p.retailer] || 0) + 1);
        return Object.keys(c).every(k => c[k] <= 1);
      });
    }) === true);

  // ── Part D — the two halves are introduced to each other ───────────────
  // The REAL outgoing prompt, captured off the wire, not a reconstruction.
  console.log('Part D — the real prompt on the wire');
  const shelf = await pg.evaluate(async () => {
    const slots = []; wardrobeItems.forEach(c => c.items.forEach(i => slots.push(i.id)));
    for (const s of slots) {
      const r = curatedPicks(s, prefs, _herFamily(), 4, 'compare');
      if (r.picks.length) return {slot: s, stores: r.picks.map(p => resolveStore(p.retailer) || p.retailer)};
    }
    return null;
  });
  ok('found a row with curated picks to test against', !!shelf, JSON.stringify(shelf));
  if (shelf) {
    // ⚠️ _wardrobeIdeaGen returns immediately without its DOM box (`wx_<slot>`),
    // so the box has to exist or the whole of Part D silently tests nothing.
    // That is exactly how a green suite ends up asserting nothing at all.
    await pg.evaluate(async (s) => {
      const d = document.createElement('div');
      d.id = 'wx_' + s; document.body.appendChild(d);
      await _wardrobeIdeaGen(s, null);
    }, shelf.slot);
    ok('the prompt names the stores already on the shelf',
      /Those are already on this shelf from:/.test(lastPrompt), lastPrompt.slice(0, 120));
    ok('and it names each one of them',
      shelf.stores.every(st => lastPrompt.indexOf(st) >= 0), shelf.stores.join(','));
    ok('and it forbids reusing them',
      /must come from a store not in that list/.test(lastPrompt));
  }

  ok('zero JS errors throughout', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(`\n${pass} passed, ${failn} failed`);
  await b.close(); srv.close();
  process.exit(failn ? 1 : 0);
})();
