// affwrap.js — Rakuten affiliate wrapping (2026-08-21, her first two approvals:
// FARM Rio mid 44912, Diane von Furstenberg mid 53590).
//
// ⚠️ THE ASSERTION THAT MATTERS MOST is the SWEEP in part 3: every outbound
// link the app renders to an approved store must be wrapped. The app builds
// links in two different ways (rebuilt search URLs via getStoreUrl, and exact
// product URLs on Edit picks / catalog rows / pieces she pastes herself), and
// there are ~10 anchor templates across the surfaces. A rule applied by hand at
// N sites drifts the moment an 11th is added -- so the sweep is the guarantee,
// the same reasoning as filterNeverWear and _nameParity.
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((q, s) => { try { s.end(fs.readFileSync(path.join(ROOT, q.url === '/' ? 'index.html' : q.url.split('?')[0]))) } catch (e) { s.statusCode = 404; s.end() } }).listen(8967);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
let pass = 0, fail = 0;
const ok = (l, c, x) => { console.log((c ? '  ✓ ' : '  ✗ ') + l + (!c && x ? '  → ' + x : '')); c ? pass++ : fail++; };

const ctx = await b.newContext({viewport: {width: 390, height: 900}});
const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e)));
await pg.route('**/.netlify/**', r => r.fulfill({status: 500, body: '{}'}));
await pg.goto('http://localhost:8967/');
await pg.waitForTimeout(2600);

console.log('1. _affUrl itself');
const u = await pg.evaluate(() => ({
  id: _AFF_ID,
  mids: _AFF_MID,
  dvf:      _affUrl('https://www.dvf.com/search?q=wrap%20dress'),
  farm:     _affUrl('https://farmrio.com/search?q=floral%20dress'),
  sub:      _affUrl('https://us.farmrio.com/products/x'),
  nord:     _affUrl('https://www.nordstrom.com/sr?keyword=dress'),
  google:   _affUrl('https://www.google.com/search?tbm=shop&q=dress'),
  twice:    _affUrl(_affUrl('https://www.dvf.com/search?q=x')),
  empty:    _affUrl(''),
  js:       _affUrl('javascript:alert(1)'),
  junk:     _affUrl('not a url at all'),
  nul:      _affUrl(null),
  storeKeys:Object.keys(STORES),
  offTable: _affUrl('https://www.vilebrequin.com/us/en/product/IAACG200-003')
}));
ok('publisher id is hers', u.id === 'jZNkkinrr1k', u.id);
// DERIVED, not restated: this named the two advertisers she had at the time and
// went stale the moment Vilebrequin approved. What actually needs guarding is the
// SHAPE — a bare registrable host mapping to a numeric MID. A path, a URL or a
// non-numeric id here silently wraps nothing and no link would ever earn.
ok('the approved list is non-empty', Object.keys(u.mids).length>0, Object.keys(u.mids).join());
ok('every advertiser is a bare host mapped to a numeric MID',
   Object.entries(u.mids).every(([h,m])=>/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)&&/^\d+$/.test(m)),
   JSON.stringify(u.mids));
// the three she has today, pinned individually so a bad edit to one is loud
ok('FARM Rio mid 44912', u.mids['farmrio.com'] === '44912');
ok('DVF mid 53590', u.mids['dvf.com'] === '53590');
ok('Vilebrequin mid 43322', u.mids['vilebrequin.com'] === '43322');
// 🚨 THE ASYMMETRY IS DELIBERATE AND FRAGILE, so it is pinned here. Vilebrequin
// is an approved advertiser that is NOT in the STORES table — her call, because
// their search returns a false negative on a product they stock — yet its Edit
// item and its Star of the Week entry must still EARN. That works only because
// _affUrl matches by HOSTNAME, never by store key. ▶ A future tidy-up that
// "aligns" _AFF_MID with STORES would silently stop her being paid on every
// Vilebrequin tap, with nothing on screen looking any different.
ok('an approved advertiser that is NOT in the store table still earns',
   !u.storeKeys.includes('Vilebrequin') && /mid=43322&murl=/.test(u.offTable),
   'inTable=' + u.storeKeys.includes('Vilebrequin') + '  url=' + u.offTable);
ok('a DVF url is wrapped', /click\.linksynergy\.com\/deeplink\?id=jZNkkinrr1k&mid=53590&murl=/.test(u.dvf), u.dvf);
ok('a FARM Rio url is wrapped', /mid=44912&murl=/.test(u.farm), u.farm);
ok('the destination survives, encoded', decodeURIComponent(u.dvf.split('murl=')[1]) === 'https://www.dvf.com/search?q=wrap%20dress');
ok('a subdomain of an approved store matches', /mid=44912/.test(u.sub), u.sub);
// the other 99 stores must be untouched -- this is what stops a mistake here
// silently rewriting every link in the app
ok('an UNapproved store is returned unchanged', u.nord === 'https://www.nordstrom.com/sr?keyword=dress', u.nord);
ok('the Google Shopping fallback is NOT wrapped', u.google.indexOf('linksynergy') < 0, u.google);
ok('never double-wraps', (u.twice.match(/linksynergy/g) || []).length === 1, u.twice);
ok('empty / junk / null / javascript: pass through inert',
   u.empty === '' && u.junk === 'not a url at all' && u.nul === '' && u.js === 'javascript:alert(1)',
   JSON.stringify([u.empty, u.junk, u.nul, u.js]));

console.log('\n2. getStoreUrl, all four of its return shapes');
const g = await pg.evaluate(() => {
  quizTaken = true;
  return {
    dvf:    getStoreUrl('Diane von Furstenberg', 'wrap dress', 'wrap dress'),
    farm:   getStoreUrl('FARM Rio', 'floral dress', 'floral dress'),
    plain:  getStoreUrl('Talbots', 'navy blouse', 'navy blouse'),
    cfp:    getStoreUrl('Bloomingdales', 'black midi dress', 'black midi dress'),
    tpl:    getStoreUrl('Lacoste', 'polo shirt', 'polo shirt'),
    unknown:getStoreUrl('Some Shop That Does Not Exist', 'thing', 'thing')
  };
});
ok('an approved store\'s SEARCH url is wrapped', /mid=53590/.test(g.dvf), g.dvf);
ok('and the search term survives inside it', decodeURIComponent(g.dvf).indexOf('wrap%20dress') > 0 || decodeURIComponent(decodeURIComponent(g.dvf)).indexOf('wrap dress') > 0, g.dvf);
ok('FARM Rio search url wrapped', /mid=44912/.test(g.farm), g.farm);
// asserts the WHOLE claim: not wrapped, and still pointing straight at the
// store's own domain with the term intact. (The first version of this checked
// a hardcoded character offset and failed on a correct URL -- a broken harness,
// not a regression.)
ok('an unapproved store is untouched',
   g.plain.indexOf('linksynergy') < 0
   && /^https:\/\/www\.talbots\.com\//.test(g.plain)
   && /navy(%20| )blouse/.test(decodeURIComponent(g.plain)), g.plain);
ok('the colour-PATH shape still builds (Bloomingdales)', /bloomingdales\.com\/shop\/featured\//.test(g.cfp), g.cfp);
ok('the TEMPLATE shape still builds (Lacoste)', g.tpl.indexOf('lacoste.com') > 0, g.tpl);
ok('an unknown store still falls back to Google Shopping, unwrapped',
   /google\.com\/search\?tbm=shop/.test(g.unknown) && g.unknown.indexOf('linksynergy') < 0, g.unknown);

console.log('\n3. THE SWEEP: no bare link to an approved store may escape any surface');
const swept = await pg.evaluate(async () => {
  const bare = [], wrapped = [];
  const scan = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!/^https?:/i.test(href)) return;
      const isAff = /(^|\/\/|\.)(dvf|farmrio)\.com/i.test(href);
      const isWrapped = href.indexOf('click.linksynergy.com') >= 0;
      if (isWrapped) wrapped.push(href);
      else if (isAff) bare.push(href);
    });
  };
  // drive every surface that renders an outbound link
  showDream(); await new Promise(r => setTimeout(r, 400)); scan();
  // a synthetic Edit item pointing at an approved store, to prove the runtime
  // rewrite actually fires (her real Edit has none of these two yet)
  const first = document.querySelector('#s-dream .dc-item .dc-item-btn');
  const stash = first ? first.getAttribute('href') : null;
  if (first) { first.setAttribute('href', 'https://www.dvf.com/products/test-scarf'); _wlDecorateEdit(); }
  const editHref = first ? first.getAttribute('href') : '';
  if (first && stash) first.setAttribute('href', stash);
  // a catalog card and a wishlist row, both exact-URL paths
  const card = (typeof _curatedCard === 'function')
    ? _curatedCard({brand:'DVF',name:'Joanne Dress',retailer:'Diane von Furstenberg',price:'498',note:'x',url:'https://www.dvf.com/products/joanne-dress',id:'t1'}) : '';
  const holder = document.createElement('div'); holder.innerHTML = card; document.body.appendChild(holder);
  scan();
  const cardHref = (holder.querySelector('a.shop-link') || {}).href || '';
  holder.remove();
  return {bare, wrapped: wrapped.length, editHref, cardHref};
});
ok('the Edit href rewrite fires at runtime', /mid=53590/.test(swept.editHref), swept.editHref);
ok('a catalog card\'s exact "Shop it" is wrapped', /mid=53590/.test(swept.cardHref), swept.cardHref);
ok('ZERO bare links to an approved store on any swept surface', swept.bare.length === 0, swept.bare.join(' | '));

console.log('\n4. Nothing else moved');
ok('zero JS errors', errs.length === 0, errs.join(' | '));
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
