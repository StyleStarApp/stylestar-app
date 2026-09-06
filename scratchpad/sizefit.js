// sizefit.js — HER SIZE RULE, ASSERTED ON BOTH HALVES OF THE APP (2026-09-06).
//
// The rule (Cath, 2026-07-27): size range applies PER CATEGORY, never globally.
// "Short clients still wear regular-length dresses, athletic wear, bags and
// accessories, so let's make sure our special sizing ladies don't get fewer
// pickings because of that."
//
// 🚨 WHY THIS SUITE EXISTS. The rule was written out in the AI prompt and in a
// comment, and curatedPicks filtered every row alike with no category test. A
// woman shopping Petite-and-not-Regular lost 100% of the hand-picked bags,
// shoes and accessories. Both halves are asserted here, plus a DRIFT GUARD
// proving the prompt sentence is generated from the same table the shelf reads
// -- because "two copies of one rule" is the fault this whole day was about.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/sizefit.js
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
  await new Promise(r => srv.listen(8947, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  // The feed is stubbed EMPTY on purpose: this suite is about the rule, and her
  // 107 hand-picks are the inventory whose loss was measured.
  await pg.route('**/.netlify/functions/product-search', r =>
    r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({products: []})}));
  await pg.route('**/.netlify/functions/style-ai', r => r.fulfill({status: 500, body: '{}'}));
  await pg.goto('http://localhost:8947/');
  // ⚠️ The catalog is a top-level `let`, not a window property, and it is
  // LAZY -- nothing fetches it until a shelf asks. So trigger the real loader
  // and wait on the real variable, exactly as the app does.
  await pg.evaluate(() => _loadProducts());
  await pg.waitForFunction(() => _productsCatalog && _productsCatalog.products && _productsCatalog.products.length > 0, null, {timeout: 15000});

  // ── Part A — the shared table ──────────────────────────────────────────
  console.log('Part A — the table both halves read');

  const fitApplies = async (slot) => pg.evaluate(s => _fitApplies(s), slot);

  for (const s of ['to1', 'to5', 'bo1', 'dr1', 'ja2', 'ac1', 'ac9'])
    ok(`fit-dependent: ${s}`, await fitApplies(s) === true);

  for (const s of ['bg1', 'bg8', 'sh7', 'sh9', 'sh1', 'ex2', 'ex4', 'ex8', 'sl1', 'sl3', 'fo1', 'fo6'])
    ok(`EXEMPT, her rule: ${s}`, await fitApplies(s) === false);

  // Her 2026-09-06 call, and the reason it is keyed by FULL SLOT ID: socks sit
  // inside a fit-dependent family, so a family-only table would have caught them.
  ok('ac13 athletic socks exempt while ac1 leggings is not',
    await fitApplies('ac13') === false && await fitApplies('ac1') === true);

  // Nothing may fall through unclassified: every real slot gets a decision.
  ok('every slot in the real wardrobe is classified', await pg.evaluate(() => {
    const ids = [];
    wardrobeItems.forEach(c => (c.items || []).forEach(i => ids.push(i.id)));
    if (ids.length < 90) return 'slot-list-not-found';
    return ids.every(id => typeof _fitApplies(id) === 'boolean') ? true : 'unclassified';
  }) === true);

  // ── Part B — the AI prompt is BUILT from that table, not a copy ─────────
  console.log('Part B — the prompt half, and the drift guard');

  const promptWith = async (fit) => pg.evaluate(f => {
    prefs.sizes = prefs.sizes || {}; prefs.sizes.fit = f;
    return _sizeGuidance();
  }, fit);

  const sg = await promptWith(['Petite']);
  ok('prompt names every fit-dependent family from the table', await pg.evaluate(() => {
    prefs.sizes.fit = ['Petite'];
    const s = _sizeGuidance();
    return Object.keys(_FIT_FAMILIES).every(k => s.indexOf(_FIT_FAMILIES[k]) >= 0);
  }) === true);
  ok('prompt names the exempt categories', sg.indexOf('bags, jewelry') >= 0);
  ok('prompt still says shoes are width-only', /Petite, tall and plus never apply to shoes/.test(sg));
  ok('no size range means no size sentence at all', await promptWith([]) === '');

  // ⭐ THE DRIFT GUARD. Change the table, and the prompt sentence MUST change.
  // If someone re-hardcodes that list, this is the test that goes red.
  ok('the prompt sentence is GENERATED from the table, not duplicated',
    await pg.evaluate(() => {
      const keep = _FIT_FAMILIES.dr;
      _FIT_FAMILIES.dr = 'ZZMARKERZZ';
      prefs.sizes.fit = ['Petite'];
      const changed = _sizeGuidance().indexOf('ZZMARKERZZ') >= 0;
      _FIT_FAMILIES.dr = keep;
      return changed;
    }) === true);

  // ── Part C — the shelf, which is where she actually lost the items ─────
  console.log('Part C — the shelf (the fault, measured)');

  const picks = async (slot, fit) => pg.evaluate(([s, f]) => {
    prefs.sizes = prefs.sizes || {}; prefs.sizes.fit = f;
    const r = curatedPicks(s, prefs, 'Balanced', 6);
    return r.picks.length;
  }, [slot, fit]);

  // The four rows measured at 0 before the fix.
  for (const s of ['bg1', 'ex2', 'sh7', 'sh9'])
    ok(`${s}: a Petite-only woman still sees her picks`, await picks(s, ['Petite']) > 0);
  for (const s of ['bg1', 'ex2', 'sh7', 'sh9'])
    ok(`${s}: a Plus-only woman still sees her picks`, await picks(s, ['Plus']) > 0);

  // ⚠️ THE OTHER DIRECTION, which is what stops this becoming "filter nothing":
  // a fit-dependent row must STILL honour her range.
  ok('a fit-dependent row still filters (to5 Petite < to5 Regular)',
    await picks('to5', ['Petite']) < await picks('to5', ['Regular']));
  ok('bo1 still filters for Petite', await picks('bo1', ['Petite']) <= await picks('bo1', ['Regular']));
  // An exempt row must be identical whatever she shops — that IS the rule.
  ok('an exempt row is identical for Petite, Plus and Regular',
    (await picks('bg1', ['Petite'])) === (await picks('bg1', ['Regular'])) &&
    (await picks('bg1', ['Plus'])) === (await picks('bg1', ['Regular'])));

  ok('zero JS errors throughout', errs.length === 0, errs.slice(0, 3).join(' | '));

  console.log(`\n${pass} passed, ${failn} failed`);
  await b.close(); srv.close();
  process.exit(failn ? 1 : 0);
})();
