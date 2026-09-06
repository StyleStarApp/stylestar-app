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
}

H('PART 9 — the store allowlist, and resale');
{
  const stores = buildDomains();
  ok('108 stores come out of index.html', Object.keys(stores).length === 108, String(Object.keys(stores).length));
  ok('"Zappos.com" matches Zappos', matchStore('Zappos.com', stores) === 'Zappos');
  ok('"Nordstrom Rack" is its own store, not Nordstrom',
     matchStore('Nordstrom Rack', stores) === 'Nordstrom Rack');
  ok('an unknown seller matches nothing', matchStore('GlamoryZone', stores) === null);
  ok('eBay is resale', isResale('eBay - bookishbunnyfashion'));
  ok('Poshmark is resale', isResale('Poshmark'));
  ok('Etsy is treated as a marketplace, not one of her shops', isResale('Etsy'));
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
