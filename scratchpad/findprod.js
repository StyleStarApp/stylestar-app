// Tests for the finder (netlify/functions/lib/find-products.js).
//
// ⭐ EVERY FIXTURE BELOW IS REAL DATA captured from the live shopping service on
//    2026-09-06, not invented. The DVF, the Kensie, the Hobbs and the Miss Circle
//    are the four products Cath's own "blush silk wrap dress" question surfaced,
//    and the DSW boot is from her red-boot question. They are here because each
//    one carries a trap that a title-only filter walks straight into.
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {
  VERDICT, buildQueries, matchStore, isResale, judge, widenOptions,
  verifyColour, verifyFabric, verifyCut, verifySize, verifyWidth, verifyStock,
  verifyPrice,
} from '../netlify/functions/lib/find-products.js';
import {buildDomains} from '../scripts/build-store-domains.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  -> ' + extra : '')); }
};
const H = (s) => console.log('\n' + s);

// --- REAL PRODUCTS, as the second call returned them -------------------------
const DVF = {                       // the one Cath approved from its title
  title: 'Diane Von Furstenberg Jeanne Silk Jersey Wrap Dress',
  offerTitle: 'Diane von Furstenberg Jeanne Long Sleeve Silk Wrap Dress in Palace Tiger Pink at Nordstrom Rack',
  colourway: 'Palace Tiger Pink',
  sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '0'],
  details: ['In stock online', 'Free delivery'],
};
const KENSIE = {                    // Google says "Wrap", Dillard's says "Faux Wrap"
  title: 'Kensie Womens Blouson Wrap Dress',
  offerTitle: 'Kensie Textured Knit Boat Neck Self-Tie Waist Faux Wrap Blouson Dress, Womens, 8, Navy',
  description: 'Bateau neck Short sleeves 95% polyester, 5% spandex Hand wash, dry flat Import',
  sizes: ['0','2','4','6','8','10','12','14','16'],
  details: ['In stock online'],
};
const HOBBS = {                     // genuinely silk, genuinely not blush
  title: "Hobbs London Women's Ariel Silk Dress",
  offerTitle: "Hobbs London Women's Ariel Silk Dress - Yellowmulti",
  description: 'Showcasing our hand-painted print of the season. Pure silk. Lined through the bodice.',
  sizes: ['2','4','6','8','10','12','14','16'],
  details: ['In stock online'],
};
const MISS_CIRCLE = {               // her widening candidate: right colour, wrong fabric
  title: "Miss Circle Women's Odelle Tulip Pink Crinkle Chiffon Wrap Dress",
  offerTitle: 'Miss Circle Odelle Crinkle Chiffon Wrap Dress in Tulip Pink at Nordstrom, Size X-Large',
  description: 'The Odelle Dress blossoms in tulip pink crinkle chiffon. Its flattering V-neckline and swooping asymmetrical wrap.',
  sizes: ['XXS / 0','XS / 2','S / 4-6','M / 6-8','L / 8-10','XL / 10-12'],
  details: ['In stock online'],
};
const DSW_BOOT = {                  // title says Wide Width, the link says Wide Calf
  title: 'Naturalizer Deesha Knee High Boot',
  offerTitle: 'Naturalizer Wide Width Deesha Boot | Women\'s | Mahogany Suede | Size 6 | Boots · width=Medium Width, Wide Calf',
  sizes: ['5','6','7','8','9'],
  details: ['In stock online', '60-day returns'],
};

H('PART 1 — the DVF, and why a title is not evidence');
{
  const req = {item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'};
  const v = judge(req, DVF);
  ok('silk is CONFIRMED (it really is silk)', v.checks.fabric === VERDICT.CONFIRMED, v.checks.fabric);
  ok('wrap is CONFIRMED (it really is a wrap)', v.checks.cut === VERDICT.CONFIRMED, v.checks.cut);
  // 🚨 THE ONE THAT MATTERS. "Palace Tiger Pink" contains "pink" and is a tiger print.
  ok('blush is REJECTED — a print is not a colour', v.checks.colour === VERDICT.REJECTED, v.checks.colour);
  ok('so it is NOT an exact match, however good the title looked', v.exact === false);
  ok('and the reason given back is the colour', v.rejected.includes('colour'), JSON.stringify(v.rejected));
}

H('PART 2 — the Kensie: both of her stylist objections, in one product');
{
  const req = {item: 'dress', fabric: 'silk', cut: 'wrap'};
  const v = judge(req, KENSIE);
  // "satin is not silk" generalised: 95% polyester is a definite no, not a shrug.
  ok('polyester REJECTS silk', v.checks.fabric === VERDICT.REJECTED, v.checks.fabric);
  // "faux-wrap is not a wrap", and only the RETAILER's title says so.
  ok('faux wrap REJECTS wrap', v.checks.cut === VERDICT.REJECTED, v.checks.cut);
  ok('not an exact match', v.exact === false);
  ok("Google's tidy title alone would have passed the cut",
     verifyCut('wrap', KENSIE.title) === VERDICT.CONFIRMED);
}

H('PART 3 — Hobbs: confirming one thing never confirms the rest');
{
  const req = {item: 'dress', colour: 'blush', fabric: 'silk'};
  const v = judge(req, HOBBS);
  ok('"Pure silk" in the description CONFIRMS silk', v.checks.fabric === VERDICT.CONFIRMED, v.checks.fabric);
  ok('"Yellowmulti" REJECTS blush', v.checks.colour === VERDICT.REJECTED, v.checks.colour);
  ok('not an exact match', v.exact === false);
}

H('PART 4 — the width trap, both halves');
{
  // 🚨 THE REAL DSW BOOT CONTRADICTS ITSELF: its title says "Wide Width", its
  //    own variant says "Medium Width, Wide Calf". The explicit width wins.
  ok('a self-contradicting boot is REJECTED, not confirmed',
     verifyWidth('wide', DSW_BOOT.offerTitle) === VERDICT.REJECTED);
  ok('wide calf alone is REJECTED (calf is the shaft, not the foot)',
     verifyWidth('wide', 'Knee High Boot, Wide Calf, Size 6') === VERDICT.REJECTED);
  ok('"Size W 7" does NOT confirm wide (W means women’s)',
     verifyWidth('wide', 'Dr. Martens 1460 Boots, Size W 7') === VERDICT.UNKNOWN);
  ok('an explicit "Wide Width" with no calf claim IS confirmed',
     verifyWidth('wide', 'Naturalizer Marcie Boot Wide Width, Size 6') === VERDICT.CONFIRMED);
  ok('unmentioned width is UNKNOWN, not a pass',
     verifyWidth('wide', 'Some Boot, Size 6') === VERDICT.UNKNOWN);
}

H('PART 5 — UNKNOWN is never a pass (her rule, literally)');
{
  const req = {item: 'boot', colour: 'red', fabric: 'leather', size: '6', width: 'wide'};
  const v = judge(req, {title: 'Red Leather Boot', offerTitle: 'Red Leather Ankle Boot - Size 6',
                        sizes: ['5','6','7'], details: ['In stock online']});
  ok('colour confirmed', v.checks.colour === VERDICT.CONFIRMED);
  ok('leather confirmed', v.checks.fabric === VERDICT.CONFIRMED);
  ok('size 6 confirmed', v.checks.size === VERDICT.CONFIRMED);
  ok('width UNKNOWN', v.checks.width === VERDICT.UNKNOWN);
  ok('=> NOT exact, because one requirement is unverified', v.exact === false);
  ok('and width is named as the unverified one', v.unknown.includes('width'));
}

H('PART 6 — a genuine exact match still passes (the guard is not just "no")');
{
  const req = {item: 'boot', colour: 'red', fabric: 'leather', size: '6', width: 'wide'};
  const v = judge(req, {title: 'Naturalizer Marcie', sizes: ['6','7'],
    offerTitle: 'Naturalizer Marcie Red Leather Boot Wide Width - Size 6', details: ['In stock online']});
  ok('every requirement confirmed', Object.values(v.checks).every(x => x === VERDICT.CONFIRMED));
  ok('=> exact match', v.exact === true);
}

H('PART 7 — her widening design, on the real products');
{
  const req = {item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'};
  const products = [DVF, KENSIE, HOBBS, MISS_CIRCLE];
  ok('ZERO exact matches, which is the honest answer today',
     products.filter(p => judge(req, p).exact).length === 0);
  const opts = widenOptions(req, products);
  // ⭐ CATH'S OTHER SENTENCE, and a test proved it is the door that actually
  //    works here: "keep the silk and look at other shades of pink."
  //    Miss Circle is TULIP PINK — a real pink, but not blush. So softening the
  //    shade is what reaches it; dropping the fabric does not, because the
  //    colour is still wrong.
  // 🚨 A LIVE RUN FORCED THIS TO GET STRICTER, AND THE STRICTER ANSWER IS RIGHT.
  //    Nothing here is reachable by loosening ONE thing: Miss Circle is TULIP
  //    PINK (not blush) AND CHIFFON (not confirmed silk). So the honest doors
  //    are two-step ones, and the app must say so rather than pretend otherwise.
  const two = opts.find(o => Array.isArray(o.release) &&
    o.releases.includes('colour') && o.releases.includes('fabric'));
  ok('a two-step door is offered when no single one works', !!two,
     JSON.stringify(opts.map(o => o.releases)));
  ok('blush is softened to pink, never deleted', !!two && two.softenedTo === 'pink',
     two && String(two.softenedTo));
  ok('and it reaches the Miss Circle (tulip pink chiffon wrap)',
     !!two && two.products.some(j => j.product === MISS_CIRCLE));
  ok('it still names what she KEEPS (the wrap)', !!two && two.keeps.includes('cut'));
  // ▶ Letting go of "silk" does not mean stopping being TOLD it is chiffon.
  ok('a widened result still reports what she released, so the card can say it',
     !!two && two.products.every(j => j.differs && 'fabric' in j.differs && 'colour' in j.differs));
  ok('and the released fabric is reported as unverified, not as a match',
     !!two && two.products.some(j => j.differs.fabric !== VERDICT.CONFIRMED));
  ok('no door is offered that leads nowhere', opts.every(o => o.count > 0));
  // ▶ And a kept requirement is never merely "not rejected" — it is CONFIRMED.
  ok('every KEPT requirement on every door is confirmed, never unknown',
     opts.every(o => o.products.every(j => j.verdict.unknown.every(k => o.releases.includes(k)))));
  // 🚨 The tiger-print DVF must not sneak back in through ANY door: releasing
  //    the fabric or the cut never un-rejects a print.
  ok('the tiger print is behind no door at all — a print never un-rejects',
     opts.every(o => !o.products.some(j => j.product === DVF)));
}

H('PART 8 — queries: several pooled, and size/width kept OUT of the words');
{
  const qs = buildQueries({item: 'boot', colour: 'red', fabric: 'leather', size: '6', width: 'wide'});
  ok('more than one query is built', qs.length > 1, JSON.stringify(qs));
  // 🚨 Measured 2026-09-06: putting size+width in the words scored 8/40 against
  //    30/40 for a plain query, because it pushes Google toward resale listings.
  ok('no query mentions the size', qs.every(q => !/\b6\b/.test(q)), JSON.stringify(qs));
  ok('no query mentions the width', qs.every(q => !/wide/i.test(q)), JSON.stringify(qs));
  ok('every query is scoped to women', qs.every(q => /women/i.test(q)), JSON.stringify(qs));
  ok('the narrow query she typed is still one of them',
     qs.some(q => /red/.test(q) && /leather/.test(q)));
  // 🚨 CATH'S NAPA REQUEST, AFTER THE HER-WORDS GUARD STRIPS THE STYLIST'S OWN
  //    INVENTED COLOUR AND FABRIC, IS EXACTLY THIS: an item and nothing else.
  //    An earlier version built ZERO queries here, searched for nothing, and
  //    told her it could not find anything -- convincingly and wrongly.
  const bare = buildQueries({item: 'dress'});
  ok('a request with ONLY an item still builds a query', bare.length >= 1, JSON.stringify(bare));
  ok('and that query is scoped to women', bare.every(q => /women/i.test(q)), JSON.stringify(bare));
  ok('an empty request builds nothing at all', buildQueries({}).length === 0);
}

H('PART 9 — the store allowlist, and resale');
{
  const stores = buildDomains();
  // ⚠️ THIS WAS `=== 108` AND IT WENT RED THE MOMENT SHE WAS APPROVED FOR A NEW
  // STORE (COUTR, 2026-09-08). That is the THIRD hardcoded store total to break
  // on one approval — searchtune's "40 keyword-scoped" and rakuten_feed's
  // "the other seven" were the other two. ▶ A COUNT OF HER STORES IS NOT AN
  // INVARIANT; being approved for shops is the whole point of the project, so a
  // test that fails on success teaches the next session to bump a number without
  // reading it. THE REAL RULE is that the finder's GENERATED allowlist is in
  // sync with her table — a stale store-domains.js means the finder silently
  // cannot see inside a shop she was just approved for, with nothing on screen
  // looking any different. That is the bug this check should have been catching,
  // and it nearly shipped today.
  const generated = (await import('../netlify/functions/lib/store-domains.js')).default;
  ok('the generated allowlist is in sync with her table',
     Object.keys(generated).length === Object.keys(stores).length,
     'generated ' + Object.keys(generated).length + ' vs STORES ' + Object.keys(stores).length);
  ok('every store in her table reaches the finder',
     Object.keys(stores).every(k => k in generated),
     Object.keys(stores).filter(k => !(k in generated)).join(', '));
  console.log('  ·  stores in the finder allowlist: ' + Object.keys(stores).length);
  ok('"Zappos.com" matches Zappos', matchStore('Zappos.com', stores) === 'Zappos');
  ok('"Nordstrom Rack" is its own store, not Nordstrom',
     matchStore('Nordstrom Rack', stores) === 'Nordstrom Rack');
  ok('an unknown seller matches nothing', matchStore('GlamoryZone', stores) === null);
  /* 🚨🚨 THE SHORT-NAME BLIND SPOT, FOUND BY MEASURING ON 2026-09-09 AND NOT BY
     READING. Cath asked why her affiliate shops never appear, so three real
     searches were probed and their sellers counted against her table. "Zara USA"
     came back and was DISCARDED — and Zara is hers, fully scored by her. So were
     "Saks Fifth Avenue" (7 results in a single search) and both "Etsy - <shop>"
     sellers, and ETSY IS ONE OF THE NINE MERCHANTS THAT ACTUALLY PAY HER.
     ▶ THE CAUSE: the loose pass needs `k.length > 4`, so THIRTEEN of her shops
       could only ever match a seller string EXACTLY — Belk, Saks, Zara, Etsy,
       IZOD, NYDJ, Soma, LOFT, Quay, ASOS, H&M, Gap, DSW — and Google almost
       never writes a bare name. Measured recovery on those same three searches:
       26→29, 20→27 and 13→18 products from her shops, for NO extra search.
     ⚠️ THESE ASSERT THE RULE, NOT THE MECHANISM: a short-named shop of hers is
       found when the seller string is decorated, AND a longer name still wins
       over its own prefix. If someone reimplements the matcher, these still
       hold. */
  ok('a four-letter shop of hers survives a decorated seller name',
     matchStore('Zara USA', stores) === 'Zara' &&
     matchStore('Saks Fifth Avenue', stores) === 'Saks' &&
     matchStore('LOFT Outlet', stores) === 'LOFT');
  /* ⭐ HER RULING, 2026-09-09: "Let's keep Etsy in. They are great for jewelry
     especially." Etsy had been swept onto the resale list on the strength of the
     word "marketplace" — but most Etsy sellers MAKE new things, and etsy.com is
     in _AFF_MID, so the app was refusing to show a shop she actively earns from.
     ⚠️ THE OTHERS MUST STAY OUT: eBay, Poshmark and the rest really are
     second-hand, and lyst/modesens bounce a woman to another search. */
  ok('Etsy, which actually earns her money, is found AND kept',
     matchStore('Etsy - EvolveUA', stores) === 'Etsy' && !isResale('Etsy - EvolveUA'));
  ok('but genuine resale is still dropped',
     ['eBay','Poshmark','ThredUp','The RealReal','Depop','Vestiaire Collective']
       .every(x => isResale(x)));
  ok('and so are the aggregators that bounce her to another search',
     ['Lyst','ModeSens'].every(x => isResale(x)));
  /* ⚠️ THE ONE THAT MUST NOT REGRESS: a longer store name beats its own prefix,
     or every Rack result silently becomes a Nordstrom result. */
  ok('the longest name still wins over its prefix',
     matchStore('Nordstrom Rack', stores) === 'Nordstrom Rack' &&
     matchStore('Banana Republic Factory', stores) === 'Banana Republic Factory');
  /* ▶ AN OUTLET IS ITS OWN SHOP, NOT ITS PARENT. Found 2026-09-09: the matcher
     was resolving "Gap Factory" to Gap, so an outlet piece linked to gap.com's
     search, which does not carry it. Its sibling Banana Republic Factory was
     already in the table, so the gap read as an oversight. ⚠️ This asserts the
     RULE — if a future session removes the Gap Factory row, this fails and says
     why, instead of quietly sending women to the wrong shop again. */
  ok('an outlet resolves to itself, never to its parent',
     matchStore('Gap Factory', stores) === 'Gap Factory' &&
     matchStore('Gap Factory Store', stores) === 'Gap Factory' &&
     matchStore('Gap', stores) === 'Gap');
  /* ⚠️ And her exclusions stay excluded — a looser matcher must not quietly let
     fast fashion in through a prefix. */
  ok('fast fashion still matches nothing',
     matchStore('Fashion Nova', stores) === null && matchStore('SHEIN US', stores) === null);
  ok('eBay is resale', isResale('eBay - bookishbunnyfashion'));
  ok('Poshmark is resale', isResale('Poshmark'));
  /* 🚨🚨 THIS CHECK USED TO ASSERT THE OPPOSITE — "Etsy is treated as a
     marketplace, not one of her shops" — AND IT WAS REVERSED BY HER ON
     2026-09-09: "Let's keep Etsy in. They are great for jewelry especially."
     ▶ NOT A BUG THAT WAS FIXED, A DECISION THAT WAS CHANGED, and the difference
       matters: the old behaviour was defensible (Etsy IS a marketplace) and it
       was the reasoning that was wrong, not the code. Etsy sellers mostly MAKE
       new things, which passes her real rule — a woman can browse and BUY AND
       KEEP a specific item — and etsy.com sits in _AFF_MID, so the app was
       refusing to show a shop she is an approved affiliate of.
     ⚠️ SO DO NOT "RESTORE" THIS. If a future session finds Etsy in the results
       and reaches for the resale list, read this first. */
  ok('Etsy is one of her shops now, by her ruling', !isResale('Etsy'));
  // 🚨 COUTR CALLS ITSELF "A LUXURY MARKETPLACE" AND IS DELIBERATELY NOT ON THE
  // RESALE/MARKETPLACE LIST. Checked on the day it was added (2026-09-08) rather
  // than assumed, because the word alone would have disqualified it: their own
  // page says "Every item on COUTR is brand new and 100% authentic, sourced
  // directly from trusted vendors" — new stock from designer boutiques, one
  // checkout, one returns policy. Her actual rule is that a woman can browse and
  // BUY AND KEEP a specific item, which it passes; the names on RESALE are
  // second-hand sellers and price aggregators, which it is not.
  // ▶ RECORDED SO NOBODY "TIDIES" IT ONTO THE LIST ON THE STRENGTH OF THE WORD.
  ok('COUTR is a shop, not a marketplace to exclude', !isResale('COUTR') && !isResale('coutr.com'));
  ok('DSW is not resale', !isResale('DSW'));
}

H('PART 10 — the generated domain file cannot drift from index.html');
{
  const file = path.join(ROOT, 'netlify', 'functions', 'lib', 'store-domains.js');
  ok('the generated store module exists', fs.existsSync(file));
  const onDisk = (await import('../netlify/functions/lib/store-domains.js')).default;
  const fresh = buildDomains();
  ok('and it is byte-identical to a fresh build',
     JSON.stringify(onDisk) === JSON.stringify(fresh),
     'run: node scripts/build-store-domains.js');
  ok("her wide-width shops survived the trip",
     Object.entries(fresh).filter(([, v]) => v.sizes.includes('wide')).length === 8);
}

H('PART 11 — the price filter (2026-09-13, item 1 of "the full look" list)');
{
  // ▶ FACTUAL, NOT A JUDGEMENT — belongs beside size/width/stock, verified
  //   against the retailer's own extracted price, never read by a stylist.
  ok('under budget confirms', verifyPrice(100, 84) === VERDICT.CONFIRMED);
  ok('at the exact ceiling still confirms', verifyPrice(100, 100) === VERDICT.CONFIRMED);
  ok('over budget rejects', verifyPrice(100, 150) === VERDICT.REJECTED);
  ok('a missing price is unknown, never a pass', verifyPrice(100, null) === VERDICT.UNKNOWN);
  ok('a non-numeric want is unknown, not a crash', verifyPrice('under $100', 50) === VERDICT.UNKNOWN);
  ok('a zero or negative want is unknown, never treated as "free"',
     verifyPrice(0, 5) === VERDICT.UNKNOWN && verifyPrice(-10, 5) === VERDICT.UNKNOWN);

  // ▶ STRICT LIKE COLOUR, NOT SOFT LIKE SIZE/WIDTH — it is HER OWN STATED
  //   NUMBER, so an unknown price must still block an exact match. judge()
  //   only adds the check when req.price is set, exactly like colour/fabric/cut.
  const cheap = { title: 'Reformation Linen Top', priceValue: 68, details: ['In stock'] };
  const dear = { title: 'Reformation Linen Top', priceValue: 340, details: ['In stock'] };
  const noPrice = { title: 'Reformation Linen Top', priceValue: null, details: ['In stock'] };
  ok('an in-budget product is an exact match on price alone',
     judge({ item: 'top', price: 100 }, cheap).exact === true);
  ok('an over-budget product is rejected, not merely unconfirmed',
     judge({ item: 'top', price: 100 }, dear).exact === false &&
     judge({ item: 'top', price: 100 }, dear).rejected.includes('price'));
  ok('a product with NO price data does not pass "under $100" on a technicality',
     judge({ item: 'top', price: 100 }, noPrice).exact === false);
  ok('a request with no price at all is untouched — old requests behave exactly as before',
     !('price' in judge({ item: 'top' }, dear).checks));

  // ▶ THE WIDENING DESIGN TREATS PRICE LIKE ANY OTHER REQUIREMENT: she chooses
  //   which one to release. Releasing price means seeing the same piece over
  //   budget — plainly labelled, never silently swapped in as if it were exact.
  const products = [dear];
  const doors = widenOptions({ item: 'top', price: 100 }, products);
  ok('releasing the price ceiling offers the over-budget piece as a door',
     doors.length === 1 && doors[0].release === 'price' && doors[0].count === 1,
     JSON.stringify(doors));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
