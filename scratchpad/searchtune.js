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
// 2026-08-13, her calls: "skinny jeans are out of style now" and "I would
// never recommend ribbed anything to any of my clients." Prompt + hard filter.
ok('her standing vetoes are in the rules', rules.includes("CATHERINE'S OWN VETOES") && rules.includes('skinny jeans') && rules.includes('"ribbed"'));
ok('the veto filter drops ribbed + skinny jeans even with empty prefs', await page.evaluate(() => {
  const out = filterNeverWear([
    {name:'White Ribbed Tank', search:'ribbed tank top'},
    {name:'High-Rise Skinny Jeans', search:'high rise skinny jeans'},
    {name:'Wide-Leg Jeans', search:'wide leg jeans'}
  ]);
  return out.length === 1 && out[0].name === 'Wide-Leg Jeans';
}));
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
    // ⚠️ DELIBERATE UPDATE 2026-08-13, her voice-consistency audit: her voice
    // is Lora UPRIGHT 15.5px #4a463e everywhere on light paper now — no
    // italics anywhere (her call: 'In general I don't think I like italics').
    voiceOk: cs.fontStyle === 'normal' && /Lora/.test(cs.fontFamily) && cs.fontSize === '15.5px',
    boldGold: getComputedStyle(els[0].querySelector('b')).color === 'rgb(160, 118, 27)',
    heartPink: getComputedStyle(els[0].querySelector('.ht-h')).color === 'rgb(200, 151, 30)',  // GOLD now (2026-08-09): the wishlist's mark
    noDash: !els[0].textContent.includes('—') && !els[0].textContent.includes(' - ')
  };
});
ok('the tip lives on both shopping surfaces', tip.count === 2, String(tip.count));
ok('shown while the habit is new (0 saves)', tip.shownFresh);
// UPDATED DELIBERATELY 2026-08-22, not silenced: the CLAIM is unchanged ("her
// exact wording"), only the wording moved. "heart it" -> "save it" is her call,
// and it was a real defect -- every card's control is labelled "♡ SAVE", so the
// tip named the action with a word that appeared nowhere else on the screen.
// UPDATED AGAIN 2026-08-22, deliberately: the ♡ is no longer in textContent
// because the tip's heart stopped being a U+2661 GLYPH and became the app's own
// _WL_HEART_PATH inline SVG -- her call ("let's make sure we are using our exact
// heart shape for consistency"), and the standing never-draw-a-brand-mark-as-a-
// glyph rule finally reaching the one place left as an exception. The claim is
// unchanged; the heart is now asserted by SHAPE below, which is stricter.
ok('her exact wording', tip.text.replace(/\s+/g,' ').trim() === 'Tip: save it first , then explore. Your saves will be waiting in Your Wishlist.'
   || tip.text.replace(/\s+/g,' ').trim() === 'Tip: save it first, then explore. Your saves will be waiting in Your Wishlist.', tip.text);
// The word must track the BUTTON. If this ever fails, check what _wlSaveBtn
// renders before touching the sentence.
ok('the tip names the action the BUTTON actually offers', /save it first/i.test(tip.text));
ok('her voice: Lora upright 15.5 + gold bolds + the outline heart in GOLD', tip.voiceOk && tip.boldGold && tip.heartPink);
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
  gp: Object.values(STORES).filter(s => s.gp).length,
  // the NAMES, so the check below can be about stores rather than about a number
  wKeys:  Object.keys(STORES).filter(k => STORES[k].w),
  gpKeys: Object.keys(STORES).filter(k => STORES[k].gp)
}));
// This restated a number that has moved four times (Kate Spade out, DVF in,
// Vilebrequin in...). ▶ The claim actually worth guarding is the STANDING RULE:
// a store added to STORES must ALSO reach SEARCH_DOMAINS in style-ai.js, or the
// stylist's search simply cannot see inside it and nothing anywhere complains.
// Derived from both files, so it never goes stale and it catches the real bug.
// (storedepth.js keeps a hardcoded total as the deliberate appear/vanish tripwire.)
const SRV_LIST = (fs.readFileSync(path.join(ROOT, 'netlify/functions/style-ai.js'), 'utf8')
  .match(/const SEARCH_DOMAINS\s*=\s*\[([\s\S]*?)\];/)[1].match(/'[^']+'/g) || []).length;
ok('every store in the table also reaches SEARCH_DOMAINS', counts.stores === SRV_LIST,
   'STORES ' + counts.stores + ' vs SEARCH_DOMAINS ' + SRV_LIST);
// 2026-08-12: Abercrombie moved from keyword-scoped-never (it was unscoped)
// into param-scoped, via her verified gender facet — gp count 5 → 6.
// 2026-09-05: bumped 6 → 7, DELIBERATELY and after measuring, not silenced. The
// 7th is ETSY, whose verified instant_download=false filter rides the same `gp`
// field (added 2026-08-28); this restated number was simply never bumped with
// it, so the suite had been red ever since for a reason unrelated to searching.
// ⚠️ A permanently-red suite is how a false green happens — the standing rule.
// Measured before touching it: 39 w, 7 gp (Amazon, Etsy, Abercrombie, Banana
// Republic, Banana Republic Factory, Old Navy, Gap). Only the number was wrong.
// 2026-09-05: 39 -> 40. ✅ Vilebrequin is back in STORES (her call, the nightly
// feed replaces the search that lied) and it carries w:1 REQUIRED, not optional:
// they are historically a men's swim house and their search defaults to MEN'S on
// an ambiguous term. Dropping w:1 there sends women to menswear.
// 2026-09-08: 40 -> 41 with COUTR, and at that point the number was bumped for
// the FOURTH time in a month. ▶ SO IT IS NOT A NUMBER ANY MORE. The comment
// above already diagnoses why this shape keeps failing: a restated total moves
// every time she is approved for anything, and the one time nobody bumped it the
// suite sat red for weeks — "a permanently-red suite is how a false green
// happens". The claim actually worth guarding was never "there are forty". It is
// that THESE PARTICULAR STORES, every one of which genuinely sells menswear, are
// scoped to the women's department. That cannot drift with an unrelated addition,
// and unlike the count it names the store that broke.
const MUST_BE_SCOPED = [
  // department stores — the original 2026-08-08 fault was men's suit pants in her
  // Banana Republic results, and every one of these has a full menswear floor
  'Nordstrom', "Macy's", "Dillard's", 'Belk', 'Bloomingdales', 'Saks',
  'Neiman Marcus', 'Bergdorf Goodman', 'Nordstrom Rack', 'TJ Maxx',
  // multi-gender brands
  'J.Crew', 'Zara', 'Banana Republic', 'Gap', 'Old Navy', 'Abercrombie',
  // Vilebrequin: historically a men's swim house whose search DEFAULTS to men's
  // on an ambiguous term (2026-09-05). w:1 there is required, not optional.
  'Vilebrequin',
  // COUTR, approved 2026-09-08. Measured the same day: a plain search for
  // "sweater" returned 36 products of which 10 were men's; "womens sweater"
  // returned 36 with zero. It carries kidswear and fragrance as well.
  'COUTR'
];
const unscoped = MUST_BE_SCOPED.filter(k => {
  const inTable = counts.wKeys.concat(counts.gpKeys);
  return !inTable.includes(k);
});
ok('every store known to sell menswear is scoped to women', unscoped.length === 0,
   unscoped.join(', ') || '');
// The totals are REPORTED, never asserted — they are the thing that kept going stale.
console.log('  ·  scoped stores: ' + counts.w + ' by keyword, ' + counts.gp + ' by param, of ' + counts.stores);

// ── THE WORD MUST NOT LAND TWICE (2026-09-08) ────────────────────────────────
// 🚨 FOUND WHILE WIRING COUTR, PRE-EXISTING ON main, AND LATENT ACROSS ALL 41
// KEYWORD-SCOPED STORES. `_alreadyWomens` guards the "womens " prepend, but it
// only ever tested for a leading SIZE word — so a term that already said
// women's got the word twice:
//     getStoreUrl('Nordstrom', "women's silk blouse")
//       -> keyword=womens%20women's%20silk%20blouse
// Nothing in the app seeds such a term, which is exactly why nobody saw it; but
// nothing forbids the model writing one, and the wishlist STORES TERMS and
// rebuilds urls on every render, so it would have doubled forever for that woman.
// ▶ The size half must keep working too — "womens petite trousers" searches
//   worse than "petite trousers", which is why the guard exists at all.
const dbl = await page.evaluate(() => ({
  plain:   getStoreUrl('Nordstrom', 'silk blouse'),
  womens:  getStoreUrl('Nordstrom', 'womens silk blouse'),
  apos:    getStoreUrl('Nordstrom', "women's silk blouse"),
  ladies:  getStoreUrl('Nordstrom', 'ladies silk blouse'),
  petite:  getStoreUrl('Nordstrom', 'petite trousers'),
  plus:    getStoreUrl('Nordstrom', 'plus size dress'),
  coutr:   getStoreUrl('COUTR', 'silk blouse'),
  coutrW:  getStoreUrl('COUTR', "women's silk blouse")
}));
const once = u => (decodeURIComponent(u).match(/wom[ae]n/gi) || []).length;
ok('an unscoped term still GETS the womens keyword', once(dbl.plain) === 1, dbl.plain);
ok('a term that already says womens does not get it twice', once(dbl.womens) === 1, dbl.womens);
ok("…nor with an apostrophe", once(dbl.apos) === 1, dbl.apos);
// "ladies" already scopes the search to women, so the guard leaves it ALONE
// rather than prepending — the term stays hers, and there is no "womens" at all.
ok("…and 'ladies' is left as she wrote it, not prefixed",
   once(dbl.ladies) === 0 && decodeURIComponent(dbl.ladies).includes('ladies silk blouse'), dbl.ladies);
ok('a petite term is still left alone (the original half of the guard)',
   once(dbl.petite) === 0 && decodeURIComponent(dbl.petite).includes('petite trousers'), dbl.petite);
ok('a plus-size term is still left alone', once(dbl.plus) === 0, dbl.plus);
ok('COUTR gets the keyword once', once(dbl.coutr) === 1, dbl.coutr);
ok('COUTR does not double it either', once(dbl.coutrW) === 1, dbl.coutrW);

ok('zero JS errors', errs.length === 0, errs.join(' | '));

await browser.close(); server.close();
console.log('\n' + (pass + fail) + ' checks, ' + fail + ' failures');
process.exit(fail ? 1 : 0);
