// sizeveto.js — the three fixes from Cath's 2026-08-15 plus-size testing.
//   1. Her size range guides the SEARCH and never the words she reads.
//   2. "Show me different picks" cannot return the set it just showed.
//   3. Wrap is vetoed on browsing surfaces, waived when she asks for it.
// Part A unit-drives the real page functions; Part B drives the REAL shelves
// and captures the REAL prompts leaving the page.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/sizeveto.js
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
  await new Promise(r => srv.listen(8951, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const errs = [];

  // Every AI reply below is written the way the LIVE model actually answered
  // her: size word leading the name, size word leading the search.
  let AI = {items: [
    {category: 'bottom', name: 'Plus Wide Leg Trouser', search: 'plus wide leg trousers', store: 'Quince'},
    {category: 'top', name: 'Plus Linen Button-Front Blouse', search: 'plus linen button front blouse', store: 'Madewell'},
    {category: 'dress', name: 'Plus Wrap Midi Dress', search: 'plus wrap midi dress', store: 'Anthropologie'},
    {category: 'shoes', name: 'Wide Width Loafers', search: 'wide width loafers', store: 'Zappos'},
    {category: 'bag', name: 'Large Leather Tote', search: 'large leather tote', store: 'Cuyana'},
    {category: 'jewelry', name: 'Statement Hoop Earrings', search: 'hoop earrings', store: 'Kendra Scott'}]};
  const prompts = [];
  async function fresh(opts) {
    opts = opts || {};
    const ctx = await b.newContext({viewport: {width: 390, height: 844}});
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await pg.route('**/.netlify/**', r => {
      try { prompts.push(JSON.parse(r.request().postData() || '{}').messages[0].content); } catch (e) { prompts.push(''); }
      if (opts.aiOk === false) return r.fulfill({status: 500, body: '{}'});
      r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({content: [{text: JSON.stringify(AI)}]})});
    });
    await pg.goto('http://localhost:8951/');
    await pg.waitForTimeout(2600);
    return {ctx, pg};
  }
  // A woman who saved ONLY plus sizes and a wide shoe width — Cath's exact test.
  async function seedPlus(pg) {
    await pg.evaluate(() => {
      localStorage.setItem('ss_data', JSON.stringify({userName: 'Test', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic', 'The Modern Classic', 'The Serene Grace'], portrait: 'p', motto: 'm'}));
      topArchNames = ['The Timeless Classic', 'The Modern Classic', 'The Serene Grace'];
      quizTaken = true;
      prefs.sizes = Object.assign(prefs.sizes || {}, {fit: ['Plus'], width: ['Wide']});
    });
  }

  // ────────────────── Part A — the guarantees, unit level ──────────────────
  console.log('Part A — _sizeWordsOut, the veto split, the refresh memory');
  let {ctx, pg} = await fresh({});
  await seedPlus(pg);

  const nameCases = await pg.evaluate(() => {
    const t = (name, search) => _sizeWordsOut({name, search, store: 'Nordstrom'}).name;
    return {
      plusLead:      t('Plus Wide Leg Trouser', 'plus wide leg trousers'),
      plusHyphen:    t('Plus Wide-Leg Trouser', 'plus wide-leg trousers'),
      plusSize:      t('Plus Size Linen Blouse', 'plus size linen blouse'),
      petite:        t('Petite Linen Button-Front Blouse', 'petite linen button front blouse'),
      tall:          t('Tall Straight Jeans', 'tall straight jeans'),
      width:         t('Wide Width Loafers', 'wide width loafers'),
      narrowWidth:   t('Narrow Width Ankle Boots', 'narrow width ankle boots'),
      // The silhouette words must survive: "wide" and "tall" are real garment
      // vocabulary and only the SIZE reading is being removed.
      silhouette:    t('Wide-Leg Trouser', 'wide leg trouser'),
      wideCrop:      t('Wide Leg Crop Jean', 'wide leg crop jean'),
      // No search means the name is carrying the filter (getStoreUrl falls
      // back to it), so nothing may be stripped.
      noSearch:      _sizeWordsOut({name: 'Plus Wide Leg Trouser', store: 'Quince'}).name,
      // A name that is nothing BUT a size word must never render empty.
      onlySize:      t('Plus', 'plus'),
      // The search is the thing that must be left completely alone.
      searchKept:    _sizeWordsOut({name: 'Plus Wide Leg Trouser', search: 'plus wide leg trousers'}).search
    };
  });
  ok('leading "Plus" leaves the name', nameCases.plusLead === 'Wide Leg Trouser', nameCases.plusLead);
  ok('"Plus" goes, hyphenated silhouette survives', nameCases.plusHyphen === 'Wide-Leg Trouser', nameCases.plusHyphen);
  ok('"Plus Size" goes as one', nameCases.plusSize === 'Linen Blouse', nameCases.plusSize);
  ok('"Petite" goes', nameCases.petite === 'Linen Button-Front Blouse', nameCases.petite);
  ok('"Tall" goes', nameCases.tall === 'Straight Jeans', nameCases.tall);
  ok('"Wide Width" goes', nameCases.width === 'Loafers', nameCases.width);
  ok('"Narrow Width" goes', nameCases.narrowWidth === 'Ankle Boots', nameCases.narrowWidth);
  ok('⚠ "Wide-Leg" is a SILHOUETTE and survives untouched', nameCases.silhouette === 'Wide-Leg Trouser', nameCases.silhouette);
  ok('⚠ "Wide Leg Crop Jean" survives untouched', nameCases.wideCrop === 'Wide Leg Crop Jean', nameCases.wideCrop);
  ok('no search → nothing stripped (the name IS the filter)', nameCases.noSearch === 'Plus Wide Leg Trouser', nameCases.noSearch);
  ok('a size-only name never renders empty', nameCases.onlySize === 'Plus', nameCases.onlySize);
  ok('THE SEARCH IS NEVER TOUCHED', nameCases.searchKept === 'plus wide leg trousers', nameCases.searchKept);

  const veto = await pg.evaluate(() => {
    const names = a => a.map(x => x.name).join('|');
    const it = (name, search) => ({name, search, store: 'Nordstrom'});
    const set = [it('Wrap Midi Dress', 'wrap midi dress'), it('Floral Midi Dress', 'floral midi dress'),
                 it('Ribbed Knit Tank', 'ribbed tank'), it('Skinny Jeans', 'skinny jeans')];
    prefs.neverWear = ['Leopard'];
    return {
      noCtx:      names(filterNeverWear(set)),
      askedWrap:  names(filterNeverWear(set, 'Wrap dresses')),
      askedRib:   names(filterNeverWear(set, 'Ribbed tops')),
      askedSkin:  names(filterNeverWear(set, 'Skinny jeans')),
      personal:   names(filterNeverWear([it('Leopard Coat', 'leopard coat'), it('Wool Coat', 'wool coat')], 'Wrap dresses')),
      // The catalog picker is a separate code path and must NOT inherit the
      // search veto: her own products carry exact URLs, so no search is run.
      catalogSrc: (typeof curatedPicks === 'function') && !/(_SEARCH_VETO)/.test(String(curatedPicks))
    };
  });
  ok('wrap dropped when nothing asked for it', veto.noCtx === 'Floral Midi Dress', veto.noCtx);
  ok('wrap KEPT when she asked for "Wrap dresses"', /Wrap Midi Dress/.test(veto.askedWrap) && /Floral Midi Dress/.test(veto.askedWrap), veto.askedWrap);
  ok('⚠ a TASTE veto is never waived: ribbed stays out even when asked for', !/Ribbed/.test(veto.askedRib), veto.askedRib);
  ok('⚠ skinny jeans stay out even when asked for', !/Skinny/.test(veto.askedSkin), veto.askedSkin);
  ok('her own never-wear still applies under the exemption', veto.personal === 'Wool Coat', veto.personal);
  ok('the curated catalog picker does NOT run the search veto', veto.catalogSrc === true);

  const mem = await pg.evaluate(() => {
    const mk = n => ({name: n, search: n.toLowerCase(), store: 'Nordstrom'});
    const empty = _seenPicksLine('t1');
    _rememberPicks('t1', [mk('Alpha'), mk('Beta')]);
    const one = _seenPicksLine('t1');
    _rememberPicks('t1', [mk('Beta'), mk('Gamma')]);           // Beta is a dupe
    const two = _seenPicksLine('t1');
    for (let i = 0; i < 40; i++) _rememberPicks('t2', [mk('Item' + i)]);
    const capped = (_seenPicks['t2'] || []).length;
    const stillLast = /Item39/.test(_seenPicksLine('t2')) && !/Item0\b/.test(_seenPicksLine('t2'));
    _rememberPicks('t3', [mk('Zed')]);
    return {empty, one, two, capped, stillLast, isolated: !/Zed/.test(_seenPicksLine('t1')),
            dupes: (two.match(/Beta/g) || []).length};
  });
  ok('nothing shown yet → no line at all', mem.empty === '');
  ok('remembers what it showed', /Alpha; Beta/.test(mem.one), mem.one);
  ok('a repeat is not listed twice', mem.dupes === 1, String(mem.dupes));
  ok('accumulates across taps', /Alpha; Beta; Gamma/.test(mem.two), mem.two);
  ok('capped so the prompt cannot grow forever', mem.capped === 24, String(mem.capped));
  ok('the cap drops the OLDEST, keeps the newest', mem.stillLast === true);
  ok('surfaces keep separate memories', mem.isolated === true);
  await ctx.close();

  // ────────────────── Part B — the real shelves and prompts ──────────────────
  console.log('Part B — the real app');
  ({ctx, pg} = await fresh({}));
  await seedPlus(pg);
  prompts.length = 0;
  // ⚠️ _openShopStyleNow maps anything that is not look/wantlist to 'quiz', so
  // the default surface key is 'ss-quiz'. A first build hardcoded 'ss-style'
  // into the prompt and it silently never matched what _rememberPicks wrote —
  // caught here. Both sides derive from _shopStyleMode now; this drives the
  // real entry point rather than setting the mode by hand, so a future rename
  // fails loudly instead of quietly repeating her picks again.
  await pg.evaluate(() => _openShopStyleNow());
  await pg.waitForTimeout(1200);
  const shelf = await pg.evaluate(() => {
    const cards = [...document.querySelectorAll('#s-shopstyle .shop-card')];
    return {
      n: cards.length,
      names: cards.map(c => (c.querySelector('.shop-item-name') || {}).textContent || ''),
      hrefs: cards.map(c => (c.querySelector('.shop-link') || {}).getAttribute ? c.querySelector('.shop-link').getAttribute('href') : ''),
      text: document.getElementById('s-shopstyle').innerText
    };
  });
  ok('the shelf rendered', shelf.n >= 4, String(shelf.n));
  // THE HEADLINE ASSERTION: her own rule, on the real screen.
  ok('★ NO card name says her size range back to her',
    shelf.names.every(n => !/^\s*(plus|petite|tall)\b/i.test(n)), JSON.stringify(shelf.names));
  ok('★ NO card name mentions shoe width',
    shelf.names.every(n => !/\bwidth\b/i.test(n)), JSON.stringify(shelf.names));
  ok('★ the word "Plus" appears nowhere on the shelf',
    !/\bPlus\b/.test(shelf.text), (shelf.text.match(/.{0,25}Plus.{0,25}/) || [''])[0]);
  // ...while the SEARCH still carries it, which is what makes the store filter.
  ok('★ the store links still carry the size word (the filter survives)',
    shelf.hrefs.some(h => /plus/i.test(h || '')), JSON.stringify(shelf.hrefs.slice(0, 2)));
  ok('wide width still reaches the shoe link',
    shelf.hrefs.some(h => /width/i.test(h || '')), '');
  ok('the wrap dress was dropped from a shelf nobody asked a wrap for',
    !/Wrap/i.test(shelf.text), (shelf.text.match(/.{0,25}Wrap.{0,25}/) || [''])[0]);
  ok('the non-vetoed pieces all survived', /Leather Tote/.test(shelf.text) && /Trouser/.test(shelf.text));

  // The refresh must not come back with the same set.
  const before = prompts.length;
  await pg.evaluate(() => _shopStyleGen());
  await pg.waitForTimeout(1000);
  const refreshPrompt = prompts[prompts.length - 1] || '';
  ok('the refresh actually fired a new call', prompts.length > before);
  ok('★ the refresh tells the model what it already showed',
    /already been shown these/.test(refreshPrompt), refreshPrompt.slice(0, 0) || 'no shown-line');
  ok('★ it names the actual pieces from the first set',
    /Leather Tote/.test(refreshPrompt) && /Trouser/.test(refreshPrompt));
  ok('the FIRST call had no shown-line (nothing to avoid yet)',
    !/already been shown these/.test(prompts[0] || ''));
  ok('the wrap veto reached the prompt too', /NEVER build a search around "wrap"/.test(refreshPrompt));
  await ctx.close();

  // Her own "Wrap dresses" checklist row: the one place a wrap is right.
  ({ctx, pg} = await fresh({}));
  await seedPlus(pg);
  AI = {items: [
    {name: 'Wrap Midi Dress', search: 'wrap midi dress', store: 'Nordstrom'},
    {name: 'Floral Wrap Dress', search: 'floral wrap dress', store: 'Boden'},
    {name: 'Silk Wrap Dress', search: 'silk wrap dress', store: 'Talbots'},
    {name: 'Jersey Wrap Dress', search: 'jersey wrap dress', store: 'J.Jill'}]};
  await pg.evaluate(() => { openWardrobe(); });
  await pg.waitForTimeout(300);
  await pg.evaluate(() => wardrobeSeeIdeas('dr7'));
  await pg.waitForTimeout(1200);
  const wrapShelf = await pg.evaluate(() => {
    const box = document.getElementById('wx_dr7');
    return {n: box ? box.querySelectorAll('.shop-card').length : -1, text: box ? box.innerText : ''};
  });
  ok('★ "Wrap dresses" — her own row — is NOT blanked by the veto', wrapShelf.n >= 1, String(wrapShelf.n));
  ok('★ and it really shows wrap dresses', /Wrap/i.test(wrapShelf.text), wrapShelf.text.slice(0, 60));

  // ...but the identical items are still vetoed on a row that is not a wrap.
  await pg.evaluate(() => wardrobeSeeIdeas('dr6'));   // Maxi dresses
  await pg.waitForTimeout(1200);
  const maxi = await pg.evaluate(() => {
    const box = document.getElementById('wx_dr6');
    return {n: box ? box.querySelectorAll('.shop-card:not(.wdr-curated)').length : -1, text: box ? box.innerText : ''};
  });
  ok('★ the same wrap items ARE vetoed on "Maxi dresses"', maxi.n === 0, String(maxi.n) + ' ' + maxi.text.slice(0, 60));
  await ctx.close();

  ok('zero JS errors across every path', errs.length === 0, errs.join(' | '));
  await b.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + failn + ' failed');
  process.exit(failn ? 1 : 0);
})();
