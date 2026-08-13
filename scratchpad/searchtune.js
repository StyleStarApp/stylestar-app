// Search tuning (2026-08-08) — built from Cath's six live screenshots.
// Five fixes: retail-plain search words · honest card names · women's-dept
// scoping · verified URL params (Amazon, Gap family) · precision-to-store
// weighting. This suite drives the REAL index.html in Chromium and checks the
// real getStoreUrl + the real prompt builders.  node scratchpad/searchtune.js
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

let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x ? '  → ' + x : '')); } };

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.getStoreUrl === 'function');

// ---------------------------------------------------------------------------
console.log('\n1. Women\'s scoping in getStoreUrl');
const urls = await page.evaluate(() => ({
  br: getStoreUrl('Banana Republic', null, 'charcoal slim trousers'),
  amazon: getStoreUrl('Amazon', null, 'black flats'),
  gap: getStoreUrl('Gap', null, 'white tee'),
  nordstrom: getStoreUrl('Nordstrom', null, 'tan top handle bag'),
  bloomies: getStoreUrl('Bloomingdales', null, 'quilted crossbody bag'),
  // path-style color facet, built 2026-08-12 from Cath's two screenshots
  // (Macy's + Bloomingdales share byte-identical color panels — same
  // platform). Falls through to the plain keyword search when the first
  // word isn't a recognized color.
  bloomColorPath: getStoreUrl('Bloomingdales', null, 'tan top handle bag'),
  macyColorPath: getStoreUrl('Macy\'s', null, 'black midi dress'),
  macyNoColorPath: getStoreUrl('Macy\'s', null, 'quilted crossbody bag'),
  zappos: getStoreUrl('Zappos', null, 'kitten heel mules'),
  lulu: getStoreUrl('Lululemon', null, 'royal blue leggings'),
  // already scoped in the URL — must NOT get the keyword too
  madewell: getStoreUrl('Madewell', null, 'white tee'),
  mango: getStoreUrl('Mango', null, 'white tee'),
  revolve: getStoreUrl('Revolve', null, 'white tee'),
  lacoste: getStoreUrl('Lacoste', null, 'white polo'),
  // women-only stores — nothing to scope
  anthro: getStoreUrl('Anthropologie', null, 'pink wrap dress'),
  talbots: getStoreUrl('Talbots', null, 'navy blazer'),
  samE: getStoreUrl('Sam Edelman', null, 'kitten heel mules'),
  // DSW verified by Cath's address bar 2026-08-09: /browse/womens%20red%20sandals
  // shows real women's red sandals, so the path form takes the keyword fine
  dsw: getStoreUrl('DSW', null, 'red sandals'),
  // unknown store falls to Google Shopping, unscoped
  unknown: getStoreUrl('Totally Unknown Store', null, 'blue dress'),
  // her live testing 2026-08-09: the womens KEYWORD flipped Abercrombie to the
  // MEN'S department ("mens" hides inside "womens" for their parser). Fixed
  // 2026-08-12 with her own confirming paste: a gp department PARAM instead
  // (facet=gender:("Women's")&filtered=true), same family as Amazon/Gap.
  abercrombie: getStoreUrl('Abercrombie', null, 'black cropped bomber jacket'),
  // the niche eyewear trio stays unscoped — a 5-word search + a keyword can
  // zero out at a Shopify-style AND search; low-stakes gender bleed there
  quay: getStoreUrl('Quay', null, 'tortoise round sunglasses'),
  sunglassHut: getStoreUrl('Sunglass Hut', null, 'black cat eye sunglasses'),
  warby: getStoreUrl('Warby Parker', null, 'tortoise round glasses'),
  // Nordstrom color facet (her two confirming pastes, 2026-08-09)
  nordPink: getStoreUrl('Nordstrom', null, 'pink midi dress'),
  nordTan: getStoreUrl('Nordstrom', null, 'tan top handle bag'),
  nordNoColor: getStoreUrl('Nordstrom', null, 'kitten heel mules'),
  otherPink: getStoreUrl('Zappos', null, 'pink flats')
}));
ok('Gap family gets the VERIFIED department param', urls.br.includes('searchText=womens%20charcoal%20slim%20trousers') === false && urls.br.endsWith('&department=136'), urls.br);
ok('…and the keyword too is fine to skip there', !urls.br.includes('womens'), urls.br);
ok('Amazon gets i=fashion-womens', urls.amazon.includes('/s?k=black%20flats&i=fashion-womens'), urls.amazon);
ok('Gap.com same treatment', urls.gap.endsWith('searchText=white%20tee&department=136'), urls.gap);
ok('Nordstrom gets the womens keyword', urls.nordstrom.includes('keyword=womens%20tan%20top%20handle%20bag'), urls.nordstrom);
ok('Bloomingdales gets it', urls.bloomies.includes('keyword=womens%20'), urls.bloomies);
ok('Bloomingdales color term → path form with her verified Tan/Beige mapping', urls.bloomColorPath === 'https://www.bloomingdales.com/shop/featured/womens-tan-top-handle-bag/Color_normal/Tan%2FBeige?ss=true', urls.bloomColorPath);
ok('Macy\'s color term → same path form, same platform', urls.macyColorPath === 'https://www.macys.com/shop/featured/womens-black-midi-dress/Color_normal/Black?ss=true', urls.macyColorPath);
ok('Macy\'s non-color term falls through to plain keyword search', urls.macyNoColorPath.includes('keyword=womens%20quilted%20crossbody%20bag') && !urls.macyNoColorPath.includes('featured'), urls.macyNoColorPath);
ok('Zappos gets it', urls.zappos.includes('term=womens%20kitten%20heel%20mules'), urls.zappos);
ok('Lululemon gets it', urls.lulu.includes('Ntt=womens%20'), urls.lulu);
ok('Madewell already scoped — no double', urls.madewell.includes('r_productGender=women') && !urls.madewell.includes('womens%20'), urls.madewell);
ok('Mango already scoped — untouched', urls.mango.includes('/search/women?q=white%20tee'), urls.mango);
ok('Revolve already scoped — untouched', urls.revolve.includes('d=Womens') && !urls.revolve.includes('womens%20'), urls.revolve);
ok('Lacoste template already women.html — untouched', urls.lacoste.includes('/women.html') && !urls.lacoste.includes('womens%20'), urls.lacoste);
ok('women-only Anthropologie untouched', urls.anthro.endsWith('search?q=pink%20wrap%20dress'), urls.anthro);
ok('women-only Talbots untouched', urls.talbots.endsWith('search?q=navy%20blazer'), urls.talbots);
ok('women-first Sam Edelman untouched', urls.samE.endsWith('#q=kitten%20heel%20mules'), urls.samE);
ok('DSW scoped too (her address bar proved the path form takes it)', urls.dsw.endsWith('/browse/womens%20red%20sandals'), urls.dsw);
ok('unknown store → Google fallback, unscoped', urls.unknown.includes('google.com') && !urls.unknown.includes('womens'), urls.unknown);
ok('Abercrombie gets her verified department facet, never the womens keyword', urls.abercrombie.includes('searchTerm=black%20cropped%20bomber%20jacket') && urls.abercrombie.endsWith('&facet=gender%3A%28%22Women%27s%22%29&filtered=true') && !urls.abercrombie.includes('womens%20'), urls.abercrombie);
ok('Quay UNscoped and on its NEW domain quay.com', urls.quay.startsWith('https://www.quay.com/search?q=tortoise') && !urls.quay.includes('womens'), urls.quay);
ok('Sunglass Hut UNscoped (eyewear zero-risk class)', !urls.sunglassHut.includes('womens'), urls.sunglassHut);
ok('Warby Parker UNscoped (same class)', !urls.warby.includes('womens'), urls.warby);
ok('Nordstrom: universal color → filterByColor rides along', urls.nordPink.endsWith('keyword=womens%20pink%20midi%20dress&filterByColor=pink'), urls.nordPink);
ok('Nordstrom: "tan" is not on the safe list → plain search, never an empty filter', !urls.nordTan.includes('filterByColor'), urls.nordTan);
ok('Nordstrom: no color word → no filter', !urls.nordNoColor.includes('filterByColor'), urls.nordNoColor);
ok('color facet is Nordstrom-only until other stores are verified', !urls.otherPink.includes('filterByColor'), urls.otherPink);

// ---------------------------------------------------------------------------
console.log('\n2. The scoping repairs SAVED wishlist items too (URLs rebuild on render)');
await page.evaluate(() => {
  wardrobeData.wishlist = [{ id: 'x~y', name: 'Charcoal Slim Trousers', store: 'Banana Republic', search: 'charcoal slim trousers' }];
  openWishlist();
});
await page.waitForTimeout(400);
const wl = await page.evaluate(() => {
  const a = document.querySelector('#s-wishlist a[href*="bananarepublic"]');
  return a ? a.getAttribute('href') : '(no link)';
});
ok('a pre-existing saved item now links to the women\'s department', wl.endsWith('&department=136'), wl);

// ---------------------------------------------------------------------------
console.log('\n3. The tuned prompt rules are really in the prompts');
const rules = await page.evaluate(() => _shopRules());
ok('retail-words rule present', rules.includes('USE RETAIL WORDS'), '');
ok('names the raspberry trap', /never "raspberry" or "hot pink"/.test(rules));
ok('2-4 word cap (was 2-5)', rules.includes('2 to 4 plain words'));
// ⚠️ DELIBERATE UPDATE 2026-08-12 (her third catch): the one-defining-word cap
// made the search structurally unable to carry everything the name promised
// ("Satin Button-Front Blouse" / "satin blouse"). Now one or two defining
// words, and the name is the search written beautifully — same words only.
ok('garment + one or two defining words', rules.includes('one or two defining words'));
ok('name IS the search, written beautifully', rules.includes('THE SEARCH WRITTEN BEAUTIFULLY'));
ok('a second word only when the piece demands it', rules.includes('a different blouse than'));
ok('honest-name rule with the mule example', rules.includes('Nude Patent Pointed-Toe Kitten Heel Mule'));
// 2026-08-12, her live catch: "I would never lead with color" -- the SHAPE
// rule no longer defaults to a color-first search.
// ⚠️ DELIBERATE UPDATE, same day, after her SECOND retest: the name<->search
// color exception (names could carry a color the search dropped) is RETIRED.
// Her cards still read color-first because every naming bullet said
// "color + style + item"; now names lead with the piece and a name may carry
// a color ONLY when the search carries the same one. The old assertion pinned
// the retired exception and correctly failed; these pin the replacement.
ok('lead with the item, not color (her ask)', rules.includes('lead with the ITEM, not a color'));
ok('names lead with the piece, never a color', rules.includes('LEAD WITH THE PIECE, never a color'));
ok('a name-color must also be in the search', rules.includes('A color belongs in the name ONLY when that same color is in the search'));
ok('the search default is NO color word', rules.includes('with NO color word at all'));
ok('the old color-first naming formula is gone from every prompt', await page.evaluate(() => {
  // check the built page source's prompt strings, not just _shopRules
  const src = document.documentElement.outerHTML;
  return !src.includes('color + style + item, like') && !src.includes('color + style + item, e.g.');
}));
ok('the stray "prioritize those colors" bullet is gone (the missed 6th copy)', await page.evaluate(() =>
  !document.documentElement.outerHTML.includes('prioritize those colors')));
ok('precision-to-store rule present', rules.includes('MATCH PRECISION TO THE STORE'));
ok('boutique-vocabulary rule with her Kendra Scott case', rules.includes('JEWELRY & SMALL BOUTIQUES') && rules.includes('oversized hoops'));
ok('jewelry metal is conditional on her saved preference, not forced', rules.includes('JEWELRY METAL') && !rules.includes('gold hoop earrings'));
ok('old too-long example gone', !rules.includes('Blush Silk Charmeuse'));
const html = await page.content();
ok('no surface still says "Be very specific in"', !html.includes('Be very specific in'));
ok('photo prompt carries the retail-color rule', html.includes('"pink" never "raspberry"'));
ok('all four per-surface name lines are honest now', (html.match(/never an imaginary exact product/g) || []).length >= 5);

// ---------------------------------------------------------------------------
console.log('\n4. "Pull more in this style" MIRRORS the look (Cath, 2026-08-08)');
const lookPrompt = await page.evaluate(async () => {
  _lookCtx = {
    celebrate: 'The floral midi with the cream jacket is a lovely proportion.',
    tips: [{ title: 'Add a belt', text: 'A slim belt would define the waist.' }],
    shop: [], occ: '',
    wearing: ['navy floral midi dress', 'cream cropped button jacket', 'blush kitten heels']
  };
  return await new Promise(resolve => {
    const orig = window.fetch;
    window.fetch = (u, o) => {
      if (String(u).includes('style-ai')) { window.fetch = orig; resolve(JSON.parse(o.body).messages[0].content); return new Promise(() => {}); }
      return orig(u, o);
    };
    openShopStyle('look');
  });
});
ok('the prompt carries WHAT SHE IS WEARING', lookPrompt.includes('SHE IS WEARING: navy floral midi dress; cream cropped button jacket'), '');
ok('it asks for MIRRORS of the look', lookPrompt.includes('MIRROR her look'), '');
ok('swaps and repeats, never add-ons', lookPrompt.includes('NO bags, jewelry, belts or other accessories'), '');
ok('weighted toward her main piece', lookPrompt.includes('at least 3 of the 6'), '');
ok('the finishing-touch tips are NOT fed in (they made it accessorize)', !lookPrompt.includes('Finishing touches suggested') && !lookPrompt.includes('A slim belt'), '');
const lookCopy = await page.evaluate(() => ({
  sub: document.querySelector('#s-shopstyle .ss-shop-sub').textContent,
  btn: document.querySelector('#s-photo-res .ns-btn.ns-gold small').textContent,
  schema: document.documentElement.outerHTML.includes('"wearing": a plain factual list')
}));
ok('the page sub promises likeness', /like the look you shared/i.test(lookCopy.sub), lookCopy.sub);
ok('the button promises likeness', /like the ones/i.test(lookCopy.btn), lookCopy.btn);
ok('the photo analysis now reports "wearing"', lookCopy.schema);
await page.evaluate(() => { _lookCtx = null; show('s-wb'); });

// ---------------------------------------------------------------------------
console.log('\n5. The heart-it-first tip (her wording + pick A, 2026-08-09)');
const tip = await page.evaluate(() => {
  localStorage.removeItem('ss_hearttip');
  wardrobeData.wishlist = [];
  _syncHeartTip();
  const els = [...document.querySelectorAll('[data-hearttip]')];
  const cs = getComputedStyle(els[0]);
  return {
    count: els.length,
    shownFresh: els.every(e => e.style.display !== 'none'),
    text: els[0].textContent.trim(),
    italic: cs.fontStyle === 'italic',
    boldGold: getComputedStyle(els[0].querySelector('b')).color === 'rgb(160, 118, 27)',
    heartPink: getComputedStyle(els[0].querySelector('.ht-h')).color === 'rgb(200, 151, 30)',  // GOLD now (2026-08-09): the wishlist's mark
    noDash: !els[0].textContent.includes('—') && !els[0].textContent.includes(' - ')
  };
});
ok('the tip lives on both shopping surfaces', tip.count === 2, String(tip.count));
ok('shown while the habit is new (0 saves)', tip.shownFresh);
ok('her exact wording', tip.text === 'Tip: heart it first ♡, then explore. Your saves will be waiting in Your Wishlist.', tip.text);
ok('whisper voice: italic ink + gold bolds + the outline heart in GOLD', tip.italic && tip.boldGold && tip.heartPink);
ok('house style: no dashes', tip.noDash);
const tipGone = await page.evaluate(() => {
  wardrobeData.wishlist = [{ id: 'a~b' }, { id: 'c~d' }];
  _syncHeartTip();
  const hidden = [...document.querySelectorAll('[data-hearttip]')].every(e => e.style.display === 'none');
  const stamped = localStorage.getItem('ss_hearttip') === '1';
  // even if she later empties the list, the lesson stays learned
  wardrobeData.wishlist = [];
  _syncHeartTip();
  const stillHidden = [...document.querySelectorAll('[data-hearttip]')].every(e => e.style.display === 'none');
  localStorage.removeItem('ss_hearttip');
  return { hidden, stamped, stillHidden };
});
ok('retires at her 2nd save', tipGone.hidden);
ok('…with a permanent stamp', tipGone.stamped);
ok('and never re-teaches, even if the list empties later', tipGone.stillHidden);

// ---------------------------------------------------------------------------
console.log('\n6. Housekeeping');
const counts = await page.evaluate(() => ({
  stores: Object.keys(STORES).length,
  w: Object.values(STORES).filter(s => s.w).length,
  gp: Object.values(STORES).filter(s => s.gp).length
}));
// 2026-08-12: Kate Spade removed at Cath's own call — a brand she wouldn't
// recommend to a client has no place in her curated list. 101 → 100.
ok('now 100 stores (Kate Spade removed, her call)', counts.stores === 100, String(counts.stores));
// 2026-08-12: Abercrombie moved from keyword-scoped-never (it was unscoped)
// into param-scoped, via her verified gender facet — gp count 5 → 6.
ok('39 keyword-scoped + 6 param-scoped', counts.w === 39 && counts.gp === 6, counts.w + ' / ' + counts.gp);
ok('zero JS errors', errs.length === 0, errs.join(' | '));

await browser.close(); server.close();
console.log('\n' + (pass + fail) + ' checks, ' + fail + ' failures');
process.exit(fail ? 1 : 0);
