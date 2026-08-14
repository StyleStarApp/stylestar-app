// curated.js — the curated-catalog pipeline, end to end (2026-08-14).
// Part A runs the REAL converter (scripts/products-from-csv.js) against the
// real 21-row export plus deliberately broken rows; Part B drives the REAL
// app in Chromium against the real products.json.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/curated.js
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import os from 'os';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ───────────────────────── Part A: the converter ─────────────────────────
console.log('Part A — converter');
const CSV = path.join(ROOT, 'data', 'style-star-products.csv');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'curated-'));
function runConv(csvPath) {
  try {
    const out = execFileSync('node', [path.join(ROOT, 'scripts', 'products-from-csv.js'), csvPath], {encoding: 'utf8', stderr: 'pipe'});
    return {code: 0, out};
  } catch (e) {
    return {code: e.status, out: String(e.stdout || '') + String(e.stderr || '')};
  }
}
const before = fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8');
let r = runConv(CSV);
ok('good CSV converts clean', r.code === 0 && /OK — 21 products/.test(r.out), r.out.slice(0, 200));
const pj = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));
ok('21 products in products.json', pj.products.length === 21);
ok('slots bo1:8 to5:13', pj.products.filter(p => p.slot === 'bo1').length === 8 && pj.products.filter(p => p.slot === 'to5').length === 13);
ok('every product has non-empty note', pj.products.every(p => p.note && p.note.trim().length > 0));
ok('every product has ≥1 family', pj.products.every(p => p.families.length >= 1));
ok('brand and retailer both kept (Levi\'s@Amazon)', (() => { const p = pj.products.find(x => x.id === 'p005'); return p && p.brand === "Levi's" && p.retailer === 'Amazon'; })());
ok('checked dates survive', pj.products.every(p => /^\d{4}-\d{2}-\d{2}$/.test(p.checked)));

const header = fs.readFileSync(CSV, 'utf8').split('\n')[0];
function badCase(name, row, wantMsg) {
  const f = path.join(tmp, name.replace(/\W+/g, '_') + '.csv');
  fs.writeFileSync(f, header + '\n' + row + '\n');
  const res = runConv(f);
  ok('rejects ' + name, res.code !== 0 && new RegExp(wantMsg).test(res.out), res.out.slice(0, 160));
}
badCase('apostrophe retailer', `p900,bo1,X,B,Bloomingdale's,https://x.com/a,10,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, `row 2: retailer "Bloomingdale's"`);
badCase('unknown slot', `p900,zz9,X,B,Nordstrom,https://x.com/a,10,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'row 2: slot "zz9"');
badCase('tracking param', `p900,bo1,X,B,Nordstrom,https://x.com/a?utm_source=z,10,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'tracking/affiliate param "utm_source"');
badCase('amazon affiliate tag', `p900,bo1,X,B,Amazon,https://www.amazon.com/dp/B0?tag=me-20,10,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'tracking/affiliate param "tag"');
badCase('bad price', `p900,bo1,X,B,Nordstrom,https://x.com/a,abc,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'price "abc"');
badCase('bad family', `p900,bo1,X,B,Nordstrom,https://x.com/a,10,$,Boho,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'family "Boho"');
badCase('empty note', `p900,bo1,X,B,Nordstrom,https://x.com/a,10,$,Classic,,,,s,,,,c,,,,,2026-08-14,yes`, 'empty note');
badCase('no families at all', `p900,bo1,X,B,Nordstrom,https://x.com/a,10,$,,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'no family tags');
badCase('http url', `p900,bo1,X,B,Nordstrom,http://x.com/a,10,$,Classic,,,,s,,,,c,,,,N.,2026-08-14,yes`, 'not https');
badCase('bad checked date', `p900,bo1,X,B,Nordstrom,https://x.com/a,10,$,Classic,,,,s,,,,c,,,,N.,yesterday,yes`, 'not a YYYY-MM-DD');
// load-bearing params must SURVIVE (Bloomingdale's ?ID=, Gap pid=, Madewell ccode=)
ok('load-bearing params kept', pj.products.some(p => /ID=5576534/.test(p.url)) && pj.products.some(p => /ccode=/.test(p.url)));
const after = fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8');
ok('failed converts never touch products.json', after.length > 1000 && JSON.parse(after).products.length === 21);
// leave the repo state as the good convert
if (before !== after) fs.writeFileSync(path.join(ROOT, 'products.json'), before);

// ───────────────────────── Part B: the app ─────────────────────────
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
  await new Promise(r2 => srv.listen(8944, r2));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const errs = [];
  const AI_ITEMS = {items: [
    {name: 'Silk Blouse A', search: 'silk professional blouse', store: 'Nordstrom'},
    {name: 'Cotton Blouse B', search: 'cotton professional blouse', store: 'Talbots'},
    {name: 'Crepe Blouse C', search: 'crepe professional blouse', store: 'Ann Taylor'},
    {name: 'Poplin Blouse D', search: 'poplin professional blouse', store: 'Boden'}]};
  async function fresh(opts) {
    opts = opts || {};
    const ctx = await b.newContext({viewport: {width: opts.w || 390, height: 844}});
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
    let aiCalled = 0;
    await pg.route('**/.netlify/**', r2 => {
      aiCalled++;
      if (opts.aiOk) r2.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({content: [{text: JSON.stringify(AI_ITEMS)}]})});
      else r2.fulfill({status: 500, body: '{}'});
    });
    pg.aiCalls = () => aiCalled;
    await pg.goto('http://localhost:8944/');
    await pg.waitForTimeout(2600);
    return {ctx, pg};
  }
  async function seedAndOpen(pg, arch, prefPatch) {
    await pg.evaluate(([arch2, patch]) => {
      localStorage.setItem('ss_data', JSON.stringify({userName: 'Test', answers: new Array(12).fill(6), topArchNames: [arch2, 'The Modern Classic', 'The Serene Grace'], portrait: 'p', motto: 'm'}));
      topArchNames = [arch2, 'The Modern Classic', 'The Serene Grace'];
      quizTaken = true;
      Object.assign(prefs, patch || {});
      openWardrobe();
    }, [arch, prefPatch || {}]);
    await pg.waitForTimeout(300);
  }
  async function ideasFor(pg, id) {
    await pg.evaluate(id2 => wardrobeSeeIdeas(id2), id);
    await pg.waitForTimeout(900);
    return pg.evaluate(id2 => {
      const box = document.getElementById('wx_' + id2);
      return {
        html: box ? box.innerHTML : '',
        cards: box ? [...box.querySelectorAll('.shop-card')].map(c => ({
          curated: c.classList.contains('wdr-curated'),
          badge: (c.querySelector('.wdr-pick') || {}).textContent || '',
          ailbl: (c.querySelector('.wdr-ailbl') || {}).textContent || '',
          brand: (c.querySelector('.shop-item-brand') || {}).textContent || '',
          name: (c.querySelector('.shop-item-name') || {}).textContent || '',
          store: (c.querySelector('.shop-item-store') || {}).textContent || '',
          note: (c.querySelector('.wdr-cur-note') || {}).textContent || '',
          link: c.querySelector('.shop-link') ? {href: c.querySelector('.shop-link').getAttribute('href'), rel: c.querySelector('.shop-link').getAttribute('rel'), label: c.querySelector('.shop-link').textContent} : null,
          save: !!c.querySelector('.wl-save'),
          flag: [...c.querySelectorAll('.wdr-linkflag')].some(n => /Link broken/.test(n.textContent)),
          notforme: [...c.querySelectorAll('.wdr-linkflag')].some(n => /Not for me/.test(n.textContent))
        })) : [],
        constraint: (box && box.querySelector('.wdr-cur-empty')) ? box.querySelector('.wdr-cur-empty').textContent : '',
        checkedLine: (box && box.querySelector('.wdr-cur-checked')) ? box.querySelector('.wdr-cur-checked').textContent : ''
      };
    }, id);
  }

  console.log('Part B — the app (blended, unattributed design)');
  // 1. A Classic woman's Professional blouses: blended shelf, catalog leads
  let {ctx, pg} = await fresh({aiOk: true});
  await seedAndOpen(pg, 'The Timeless Classic');
  let classic = await ideasFor(pg, 'to5');
  const curCards = classic.cards.filter(c => c.curated);
  const aiCards = classic.cards.filter(c => !c.curated);
  ok('catalog pieces lead the shelf (≤4)', curCards.length >= 1 && curCards.length <= 4 && classic.cards[0].curated, String(curCards.length));
  ok('AI fills the set to 6', classic.cards.length === 6, String(classic.cards.length));
  ok('AI called exactly once', pg.aiCalls() === 1, String(pg.aiCalls()));
  ok('NO attribution anywhere: no badges, no labels, no checked line', classic.cards.every(c => !c.badge && !c.ailbl) && !/Picked by Catherine|Hand-picked|An idea to explore/i.test(classic.html));
  ok('catalog cards lead with a brand, "at Retailer · $price"', curCards.every(c => c.brand.trim() && /^at /.test(c.store) && /\$\d+/.test(c.store)));
  ok('notes present and trimmed (≤160 chars)', curCards.every(c => c.note.trim().length > 5 && c.note.length <= 165));
  ok('catalog links exact "Shop it" sponsored noopener', curCards.every(c => c.link && /^https:\/\//.test(c.link.href) && /Shop it/.test(c.link.label) && /sponsored/.test(c.link.rel)));
  ok('AI cards say "Find it" (the one surviving distinction)', aiCards.every(c => c.link && /Find it/.test(c.link.label)));
  ok('every card has a save heart', classic.cards.every(c => c.save));
  ok('catalog cards carry Not for me + Link broken?', curCards.every(c => c.flag && c.notforme));
  ok('See more ideas button present', /See more ideas/.test(classic.html));
  const classicNames = curCards.map(c => c.name).sort().join('|');
  // save → wishlist PLAIN: exact URL kept, no Catherine's-pick badge
  await pg.evaluate(() => { document.querySelector('#wx_to5 .wdr-curated .wl-save').click(); });
  const saved = await pg.evaluate(() => (wardrobeData.wishlist || []).map(w => ({pick: !!w.pick, exact: !!w.exact, url: w.url || ''})));
  ok('heart saves plain with exact URL (no pick badge)', saved.length === 1 && !saved[0].pick && saved[0].exact && /^https:\/\//.test(saved[0].url), JSON.stringify(saved));
  const wlRow = await pg.evaluate(() => { openWishlist(); const c = document.querySelector('.wl-row'); return {html: c ? c.innerHTML : '', label: c && c.querySelector('.wl-go') ? c.querySelector('.wl-go').textContent : ''}; });
  ok('wishlist row: Shop it, NO badge', /Shop it/.test(wlRow.label) && !/Catherine|Your pick/.test(wlRow.html), wlRow.label);
  await ctx.close();

  // 2. A Glam woman still gets a demonstrably different catalog lead
  ({ctx, pg} = await fresh({aiOk: true}));
  await seedAndOpen(pg, 'The Soft Glam');
  const glam = await ideasFor(pg, 'to5');
  const glamNames = glam.cards.filter(c => c.curated).map(c => c.name).sort().join('|');
  ok('Classic and Glam catalog leads differ', classicNames !== glamNames, classicNames + '  VS  ' + glamNames);
  await ctx.close();

  // 3. Rotation machinery: stable within a week, different across weeks,
  //    dismissal is a hard exclusion, saved is exempt from staleness
  ({ctx, pg} = await fresh({aiOk: true}));
  await seedAndOpen(pg, 'The Timeless Classic');
  const rotr = await pg.evaluate(async () => {
    await _loadProducts();
    const base = {sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''};
    const ids = () => curatedPicks('to5', base, 'Balanced', 4).picks.map(p => p.id);
    const a = ids(), b = ids();                       // same week, twice
    const w0 = _wdrWeek;
    let weekSets = [];
    for (let k = 1; k <= 6; k++) { window._wdrWeek = () => w0() + k; weekSets.push(curatedPicks('to5', base, 'Balanced', 4).picks.map(p => p.id).join(',')); }
    window._wdrWeek = w0;
    // dismissal
    localStorage.setItem('ss_dismissed', JSON.stringify({[a[0]]: '2026-08-14'}));
    const afterDismiss = ids();
    localStorage.removeItem('ss_dismissed');
    // staleness: mark a[0] shown in a PRIOR week many times → sinks
    localStorage.setItem('ss_seen', JSON.stringify({[a[0]]: {n: 9, w: _wdrWeek() - 1}}));
    const afterStale = ids();
    // saved exemption: same staleness but the piece is on her wishlist
    const prod = _productsCatalog.products.find(p => p.id === a[0]);
    const wid = _wlMakeId(prod.name, resolveStore(prod.retailer) || prod.retailer);
    wardrobeData.wishlist.unshift({id: wid, name: prod.name, store: prod.retailer, search: '', ts: Date.now(), exact: true, url: prod.url});
    const afterSaved = ids();
    wardrobeData.wishlist.shift();
    localStorage.removeItem('ss_seen');
    return {a, b, weekSets, afterDismiss, afterStale, afterSaved};
  });
  ok('same week → identical set (stability)', rotr.a.join() === rotr.b.join());
  ok('set changes across weeks (rotation)', new Set(rotr.weekSets.concat([rotr.a.join(',')])).size > 1, JSON.stringify(rotr.weekSets));
  ok('dismissed item never returns', !rotr.afterDismiss.includes(rotr.a[0]));
  ok('prior-week staleness sinks an unsaved item', !rotr.afterStale.includes(rotr.a[0]) || rotr.afterStale.indexOf(rotr.a[0]) > rotr.a.indexOf(rotr.a[0]), JSON.stringify({a: rotr.a, afterStale: rotr.afterStale}));
  ok('a saved item is exempt from staleness', rotr.afterSaved.includes(rotr.a[0]), JSON.stringify(rotr.afterSaved));
  // seen map written on render
  await ideasFor(pg, 'to5');
  const seenMap = await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_seen') || '{}'));
  ok('render marks pieces seen (once per week)', Object.keys(seenMap).length >= 1 && Object.values(seenMap).every(e => e.n === 1), JSON.stringify(seenMap).slice(0, 120));

  // 4. Price/retailer/note invariants on the catalog portion, all archetypes
  const inv = await pg.evaluate(async () => {
    await _loadProducts();
    const fams = ['Classic', 'Minimal', 'Natural', 'Sporty', 'Professional', 'Romantic', 'Glam', 'Bold', 'Edgy', 'Balanced'];
    const B = ['$', '$$', '$$$', '$$$$'];
    const out = {famJeans: {}, priceViolations: [], noteMisses: 0, capViolations: []};
    fams.forEach(f => {
      const jeans = curatedPicks('bo1', {sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''}, f, 6);
      out.famJeans[f] = jeans.picks.length;
      ['bo1', 'to5'].forEach(slot => {
        const st = curatedPicks(slot, {sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''}, f, 6);
        const idx = st.picks.map(p => B.indexOf(p.band)).sort((a, b2) => a - b2);
        if (idx.length) {
          const med = idx[Math.floor(idx.length / 2)];
          const over = st.picks.filter(p => B.indexOf(p.band) >= med + 2);
          if (over.length > 1) out.priceViolations.push(f + '/' + slot + ':' + over.length);
        }
        st.picks.forEach(p => { if (!p.note) out.noteMisses++; });
        const per = {}; st.picks.forEach(p => per[p.retailer] = (per[p.retailer] || 0) + 1);
        Object.entries(per).forEach(([k, n]) => { if (n > 2) out.capViolations.push(f + '/' + slot + '/' + k); });
      });
    });
    return out;
  });
  ok('every family sees ≥3 jeans (basics tagged wide)', Object.entries(inv.famJeans).every(([f, n]) => n >= 3), JSON.stringify(inv.famJeans));
  ok('no set has >1 item 2+ bands above its median', inv.priceViolations.length === 0, JSON.stringify(inv.priceViolations));
  ok('every pick carries a note', inv.noteMisses === 0);
  ok('≤2 picks per retailer in any set', inv.capViolations.length === 0, JSON.stringify(inv.capViolations));

  // 5. Hard filters are removals: never-wear attrs, patterns, colour no's
  const filt = await pg.evaluate(async () => {
    await _loadProducts();
    _productsCatalog = {products: _productsCatalog.products.concat([
      {id: 'x1', slot: 'to5', name: 'Ruffle Front Blouse', brand: 'T', retailer: 'Nordstrom', url: 'https://www.nordstrom.com/s/x1', price: 90, band: '$$', families: ['Classic', 'Glam', 'Romantic', 'Minimal'], sizes: 'XS-XL', petite: false, tall: false, plus: false, colors: ['white'], attrs: ['ruffles'], pattern: '', note: 'n', checked: '2026-08-14', active: true},
      {id: 'x2', slot: 'to5', name: 'Satin Shirt', brand: 'T', retailer: 'Belk', url: 'https://www.belk.com/p/x2', price: 90, band: '$$', families: ['Classic', 'Glam', 'Romantic', 'Minimal'], sizes: 'XS-XL', petite: false, tall: false, plus: false, colors: ['orange'], attrs: [], pattern: '', note: 'n', checked: '2026-08-14', active: true},
      {id: 'x3', slot: 'to5', name: 'Leopard Blouse', brand: 'T', retailer: 'Zappos', url: 'https://www.zappos.com/p/x3', price: 90, band: '$$', families: ['Classic', 'Glam', 'Romantic', 'Minimal'], sizes: 'XS-XL', petite: false, tall: false, plus: false, colors: ['brown'], attrs: [], pattern: 'leopard', note: 'n', checked: '2026-08-14', active: true},
      {id: 'x4', slot: 'to5', name: 'Inactive Blouse', brand: 'T', retailer: 'Target', url: 'https://www.target.com/p/x4', price: 90, band: '$$', families: ['Classic', 'Glam', 'Romantic', 'Minimal'], sizes: 'XS-XL', petite: false, tall: false, plus: false, colors: ['white'], attrs: [], pattern: '', note: 'n', checked: '2026-08-14', active: false}
    ])};
    const base = {sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''};
    const ids = o => o.picks.map(p => p.id);
    return {
      plain: ids(curatedPicks('to5', base, 'Balanced', 30)),
      ruff: ids(curatedPicks('to5', Object.assign({}, base, {neverWear: ['ruffles']}), 'Balanced', 30)),
      orange: ids(curatedPicks('to5', Object.assign({}, base, {neverOther: 'no orange please'}), 'Balanced', 30)),
      leo: ids(curatedPicks('to5', Object.assign({}, base, {neverPatterns: ['leopard']}), 'Balanced', 30))
    };
  });
  ok('inactive products never appear', !filt.plain.includes('x4'));
  ok('"never ruffles" removes the ruffled item', filt.plain.includes('x1') && !filt.ruff.includes('x1'));
  ok('"no orange" in free text removes the orange item', filt.plain.includes('x2') && !filt.orange.includes('x2'));
  ok('"leopard" pattern chip removes the leopard item', filt.plain.includes('x3') && !filt.leo.includes('x3'));
  await ctx.close();

  // 6. Sizes: Tall-only shopper (no talls in to5) → shelf is seamlessly all
  //    AI, no constraint drama, never empty; Petite keeps petite-true only
  ({ctx, pg} = await fresh({aiOk: true}));
  await seedAndOpen(pg, 'The Timeless Classic', {sizes: {fit: ['Tall']}});
  const tall = await ideasFor(pg, 'to5');
  ok('Tall-only: all-AI shelf, never empty', tall.cards.length >= 4 && tall.cards.every(c => !c.curated), String(tall.cards.length));
  ok('Tall-only: still unattributed, still has See more', !/Picked by|shelf/i.test(tall.html) && /See more ideas/.test(tall.html));
  const pet = await pg.evaluate(async () => { await _loadProducts(); return curatedPicks('to5', {sizes: {fit: ['Petite']}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''}, 'Balanced', 6).picks.map(p => p.id); });
  ok('Petite-only keeps only petite-true blouses', pet.length >= 1 && pet.every(id => ['p010', 'p012'].includes(id)), JSON.stringify(pet));
  const petReg = await pg.evaluate(() => curatedPicks('to5', {sizes: {fit: ['Petite', 'Regular']}, colorsLove: [], neverWear: [], neverPatterns: [], neverOther: ''}, 'Balanced', 30).picks.length);
  ok('Petite+Regular does not narrow', petReg >= 10, String(petReg));
  await ctx.close();

  // 6b. Uncatalogued slot (98 of 100): exactly today's behavior + See more
  ({ctx, pg} = await fresh({aiOk: true}));
  await seedAndOpen(pg, 'The Timeless Classic');
  const other = await ideasFor(pg, 'to1');
  ok('uncatalogued slot: all AI, 4 cards', pg.aiCalls() === 1 && other.cards.length === 4 && other.cards.every(c => !c.curated));
  ok('uncatalogued slot has the See more door too', /See more ideas/.test(other.html));
  // See more: first tap on a catalog slot uses the buffer (no new AI call)
  await pg.evaluate(() => wardrobeSeeIdeas('to1'));   // close
  const before5 = pg.aiCalls();
  const more = await pg.evaluate(async () => {
    await _wdrMoreIdeas('to1');
    return document.querySelectorAll('#wx_to1 .shop-card').length;
  });
  await pg.waitForTimeout(600);
  const after5 = await pg.evaluate(() => document.querySelectorAll('#wx_to1 .shop-card').length);
  ok('See more appends more cards into the same carousel', after5 > 4, String(after5));
  await ctx.close();

  // 7. Loved colours rank first
  ({ctx, pg} = await fresh());
  await seedAndOpen(pg, 'The Timeless Classic');
  const loveRank = await pg.evaluate(async () => {
    await _loadProducts();
    const withLove = curatedPicks('bo1', {sizes: {}, colorsLove: ['Royal Blue'], neverWear: [], neverPatterns: [], neverOther: ''}, 'Balanced', 6).picks;
    return {first: withLove[0], anyBlue: withLove[0].colors.join(' ')};
  });
  ok('loved colour leads the ranking', /blue/.test(loveRank.anyBlue), loveRank.anyBlue);

  // 8. Broken-link tap stamps and thanks
  await ideasFor(pg, 'to5');
  const flag = await pg.evaluate(() => {
    [...document.querySelectorAll('#wx_to5 .wdr-linkflag')].find(n => /Link broken/.test(n.textContent)).click();
    return {store: localStorage.getItem('ss_linkflags') || '', txt: document.querySelector('#wx_to5 .wdr-linkflag.flagged') ? document.querySelector('#wx_to5 .wdr-linkflag.flagged').textContent : ''};
  });
  ok('Link broken? stamps locally and thanks her', /p0\d\d/.test(flag.store) && /Thank you/.test(flag.txt), flag.store + ' | ' + flag.txt);
  await ctx.close();

  // 9. No sideways overflow at 390/360/320 with a curated set open
  for (const w of [390, 360, 320]) {
    ({ctx, pg} = await fresh({w}));
    await seedAndOpen(pg, 'The Timeless Classic');
    await ideasFor(pg, 'to5');
    const ovf = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok('no page sideways scroll at ' + w, ovf <= 1, String(ovf));
    await ctx.close();
  }

  ok('zero JS errors across every scenario', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(`\n${pass} passed, ${failn} failed`);
  await b.close(); srv.close();
  process.exit(failn ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
