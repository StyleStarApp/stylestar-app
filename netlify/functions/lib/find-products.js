// THE FINDER — turn one woman's request into REAL, VERIFIED products.
//
// ▶▶ CATH'S FRAMING, 2026-09-06, AND IT GOVERNS EVERY LINE BELOW:
//    "The service finds. Style Star chooses."
//    This file is the FINDING half only. It never ranks for style, never applies
//    her never-wear list, and never decides what she sees. It hands back a pool
//    with an honest verdict attached to every requirement, and curatedPicks()
//    does the choosing exactly as it does for her 107 hand-picks and the feed.
// ⚠️⚠️ SO DO NOT ADD HER RULES HERE. A second copy of never-wear or the colour
//    no's IS the bug this project has paid for four times in one day. One picker.
//
// ▶ HER RULE THIS FILE EXISTS TO KEEP (ledger row, 2026-09-06):
//   "never imply that a specific size, width, colour, material or other
//    requirement is confirmed unless we can actually verify it."
//   Hence three verdicts and never two: CONFIRMED, REJECTED, UNKNOWN.
//   UNKNOWN IS NEVER TREATED AS A PASS. An exact match requires every stated
//   requirement to be CONFIRMED.

// ---------------------------------------------------------------------------
// Sellers that are never hers, whatever the store list says. Resale and
// marketplaces fail her store-pool rule ("browse and BUY AND KEEP a specific
// item") and they were 12 of 40 results on her own red-boot search.
// ⚠️ Etsy is here deliberately: it is a marketplace of independent sellers, and
//    the 2026-09-05 ingest plan already excluded its feed for the same reason.
/* ⚠️⚠️ ETSY IS DELIBERATELY *NOT* ON THIS LIST — HER RULING, 2026-09-09:
   "Let's keep Etsy in. They are great for jewelry especially."
   ▶ WHY IT WAS HERE, AND WHY THAT WAS WRONG: the list exists to drop RESALE and
     SECOND-HAND, because her store-pool rule is that a woman must be able to
     browse and BUY AND KEEP a specific new item. Etsy was swept in with eBay and
     Poshmark on the strength of the word "marketplace" — but most Etsy sellers
     MAKE new things, which is a different business entirely.
   🚨 AND IT WAS COSTING HER MONEY IN A WAY NOBODY HAD NOTICED: etsy.com is in
     _AFF_MID (mid 54027), so she is an APPROVED Etsy affiliate — the app was
     refusing to show a shop she actively earns from. Found 2026-09-09 while
     auditing which of her 122 shops could be searched at all.
   ⚠️ THE OTHERS STAY. eBay, Poshmark, Mercari, ThredUp, Vestiaire, Depop, The
     RealReal and Grailed are genuinely second-hand; lyst/modesens/mymall are
     aggregators that bounce a woman to another search rather than to a product. */
const RESALE = /\b(ebay|poshmark|mercari|thredup|thred up|vestiaire|depop|the ?realreal|grailed|mymall|lyst|modesens)\b/i;

// ---------------------------------------------------------------------------
// ⚠️⚠️ A PRINT IS NOT A COLOUR, AND THIS RULE WAS LEARNED THE HARD WAY.
// The DVF "Jeanne Silk Jersey Wrap Dress" was shown to Cath as the right answer
// to "blush silk wrap dress". Its real colourway is "PALACE TIGER PINK" — a
// tiger print. It contains the word "pink" and is not remotely blush.
// ▶ So a colourway naming a print or an animal is NEVER a solid-colour match,
//   however many colour words it also contains.
const PRINT_WORDS = /\b(print|printed|floral|paisley|stripe|striped|check|checked|plaid|gingham|polka|tiger|leopard|cheetah|zebra|snake|python|animal|camo|tie ?dye|patchwork|graphic|geo|abstract|toile|ditsy)\b/i;

// Colour families. Deliberately generous on synonyms and deliberately strict
// about prints (above) — a woman asking for blush will accept petal or pale
// pink, and will not accept a tiger.
const COLOUR_FAMILY = {
  blush: /\b(blush|petal|pale pink|light pink|soft pink|rose|rosewater|ballet|powder pink|dusty pink|nude pink)\b/i,
  pink:  /\b(pink|blush|petal|rose|fuchsia|magenta|coral pink)\b/i,
  red:   /\b(red|crimson|scarlet|cherry|ruby|burgundy|wine|merlot)\b/i,
  black: /\b(black|noir|jet)\b/i,
  white: /\b(white|ivory|cream|ecru|off.?white|optic white)\b/i,
  blue:  /\b(blue|navy|cobalt|indigo|denim|sapphire|azure)\b/i,
  green: /\b(green|emerald|sage|olive|forest|mint)\b/i,
  brown: /\b(brown|tan|camel|chocolate|taupe|mocha|cognac)\b/i,
  grey:  /\b(grey|gray|charcoal|slate|heather)\b/i,
  beige: /\b(beige|sand|oat|oatmeal|stone|khaki|bone)\b/i,
  purple:/\b(purple|violet|lilac|lavender|plum|aubergine|eggplant)\b/i,
  yellow:/\b(yellow|gold|mustard|butter|lemon)\b/i,
  orange:/\b(orange|rust|terracotta|apricot|peach)\b/i,
};

// ---------------------------------------------------------------------------
// ⚠️⚠️ SATIN IS A WEAVE. SILK IS A FIBRE. Cath's correction, 2026-09-06, and it
// is stylist knowledge a text filter cannot invent: a satin dress is usually
// polyester. So "satin" NEVER confirms "silk", and naming the fabric she asked
// for is not enough on its own — the negatives below have to be checked too.
const FABRIC = {
  silk:    {yes: /\bsilk\b/i,                 no: /\b(silk.?blend|faux silk|silk.?like|satin polyester|100% polyester|polyester satin)\b/i},
  leather: {yes: /\b(leather|calfskin|nappa|bovine)\b/i, no: /\b(faux|vegan|pu |synthetic|leather.?look|imitation)\b/i},
  suede:   {yes: /\bsuede\b/i,                no: /\b(faux|microsuede|suede.?look)\b/i},
  cotton:  {yes: /\bcotton\b/i,               no: /\bcotton.?blend\b/i},
  linen:   {yes: /\blinen\b/i,                no: /\blinen.?blend|linen.?look\b/i},
  wool:    {yes: /\b(wool|merino|cashmere)\b/i, no: /\bwool.?blend|faux wool\b/i},
  cashmere:{yes: /\bcashmere\b/i,             no: /\bcashmere.?blend|faux\b/i},
  denim:   {yes: /\bdenim\b/i,                no: null},
  velvet:  {yes: /\bvelvet\b/i,               no: null},
  chiffon: {yes: /\bchiffon\b/i,              no: null},
  satin:   {yes: /\bsatin\b/i,                no: null},
};
// A fabric that is present and obviously NOT the one asked for. Used to reject
// rather than merely fail to confirm, so "polyester" is a definite no on silk.
const FABRIC_CONFLICT = {
  silk: /\b(polyester|nylon|acrylic|rayon|viscose|spandex only)\b/i,
  leather: /\b(canvas|nylon|straw|raffia)\b/i,
  cotton: /\b(polyester|nylon)\b/i,
};

// ---------------------------------------------------------------------------
// ⚠️⚠️ "FAUX-WRAP IS NOT A WRAP" — Cath, 2026-09-06. A faux wrap is sewn shut;
// it does not tie, so it fits differently and drapes differently. Google's title
// said "Wrap Dress" for a Kensie that Dillard's own title calls a "Faux Wrap".
// ▶ The retailer's own words outrank the aggregator's.
const CUT = {
  wrap:      {yes: /\bwrap\b/i,        no: /\b(faux|mock|imitation)[- ]?wrap\b/i},
  'a-line':  {yes: /\ba.?line\b/i,     no: null},
  shift:     {yes: /\bshift\b/i,       no: null},
  midi:      {yes: /\bmidi\b/i,        no: null},
  maxi:      {yes: /\bmaxi\b/i,        no: null},
  mini:      {yes: /\bmini\b/i,        no: null},
  ankle:     {yes: /\bankle\b/i,       no: null},
  'knee-high': {yes: /\b(knee.?high|tall)\b/i, no: null},
};

// ---------------------------------------------------------------------------
// ⚠️⚠️⚠️ THE WIDTH TRAP, MEASURED 2026-09-06 AND IT HAS TWO HALVES.
// (a) WIDE CALF IS NOT WIDE WIDTH. Wide calf is the boot's shaft; wide width is
//     the foot. DSW's own title said "Wide Width" while its own link said
//     "Medium Width, Wide Calf" — the shop's data disagreed with itself.
// (b) "W 7" MEANS WOMEN'S 7, NOT WIDE 7. Three results read exactly that.
// ▶ So width is confirmed ONLY by an explicit width phrase, and any wide-calf
//   mention with no width phrase is a REJECT, never a pass.
const WIDE_WIDTH = /\b(wide width|wide.?fit|\bWW\b|\bEE+\b|\b[DE]\/?W\b|width:\s*wide)\b/i;
const WIDE_CALF  = /\bwide[- ]?calf\b/i;
const NOT_WIDE_WIDTH = /\b(medium width|standard width|regular width|narrow width|width:\s*(medium|standard|regular|narrow))\b/i;
const NARROW_WIDTH = /\b(narrow width|\bAA\b|\bAAA\b|slim width)\b/i;

export const VERDICT = {CONFIRMED: 'confirmed', REJECTED: 'rejected', UNKNOWN: 'unknown'};

const has = (re, s) => !!(re && s && re.test(s));

// ---------------------------------------------------------------------------
// QUERY BUILDING.
// ⚠️⚠️ "SEARCH BROAD, NARROW AFTER" NEEDED A CORRECTION, MEASURED 2026-09-06:
// broadening CHANGES the pool, it does not merely enlarge it. The broad query
// "women's silk wrap dress" did NOT return the DVF that the narrow query found.
// ▶ So the answer is SEVERAL queries pooled — never one broad replacing one
//   narrow. Cheap in tokens, and the cost is per-search, so keep it to a few.
export function buildQueries(req) {
  const item = (req.item || '').trim();
  if (!item) return [];
  const w = (...xs) => xs.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const gendered = /\b(women|womens|women's|ladies)\b/i.test(item) ? item : `women's ${item}`;
  const qs = [
    // narrow: everything she said, because sometimes only this finds the piece
    w(req.colour, req.fabric, req.cut, gendered),
    // fabric + cut, no colour — colour is verified on the offer, not searched
    w(req.fabric, req.cut, gendered),
    // colour + cut, no fabric — the "keep the colour" half of her widening
    w(req.colour, req.cut, gendered),
    // the plain item, so nothing is missed because a word was unusual
    w(req.cut, gendered),
  ];
  // ▶ Size and width are DELIBERATELY NOT in the query. Her own red-boot test:
  //   piling size and width into the words pushed Google to eBay and Poshmark,
  //   and that search scored 8/40 against 30/40 for a plain one. They are
  //   VERIFIED on the offer instead, which is where they are true anyway.
  // ⚠️⚠️ DEDUPE ONLY — NEVER EXCLUDE THE PLAIN ITEM. An earlier version dropped
  //    any query equal to the bare "women's <item>", and on a request carrying
  //    ONLY an item (which is exactly what the her-words guard leaves behind
  //    when the stylist's own invented colour and fabric are stripped) all four
  //    candidates collapse to that one string and it built ZERO QUERIES. It then
  //    searched for nothing and reported "I could not find that in your shops",
  //    which is the most convincing way possible to be wrong.
  // ▶ THE INVARIANT: a request with an item ALWAYS produces at least one query.
  const out = [...new Set(qs.filter(Boolean))].slice(0, 4);
  return out.length ? out : [gendered];
}

/* ═══ THE SHOP THAT IS FAMOUS FOR THIS ══════════════════════════════════════
   ⭐⭐ HER ASK, 2026-09-09: "how can we get the affiliated stores in the mix (not
     at the top, but in there)".
   ▶▶ AND THE ANSWER IS NOT AN AFFILIATE RULE, WHICH IS WHY THIS IS SAFE TO
     BUILD. Measured that day: naming a RETAILER in a search does nothing
     ("white eyelet skirt Mytheresa" returned no Mytheresa — Google indexes
     products, not shops), but naming a BRAND works perfectly ("printed wrap
     dress Diane von Furstenberg" returned 12 DVF pieces). So the only shops
     reachable this way are the ones that MAKE things.
   ⭐ AND SHE ALREADY WROTE DOWN WHICH SHOP IS GOOD AT WHAT, IN JULY. DVF: "wrap
     dresses, printed dresses, occasion, wedding guest". Vilebrequin: "swimwear,
     resortwear, beach cover-ups". Fleur du Mal: "sexy lingerie, nightgowns".
     ▶ THE SEARCH HAD NEVER LOOKED AT ANY OF IT. 100 of her 123 shops carry a
       description and it was dead weight until now.
   🚨🚨 SO THE RULE IS "SEARCH THE SHOP THAT IS FAMOUS FOR THIS", NOT "SEARCH THE
     SHOPS THAT PAY HER", AND THE DIFFERENCE IS EVERYTHING. A woman asking for a
     wrap dress should see DVF because DVF invented the wrap dress — that is a
     stylist's answer, and it is HER OWN NOTE. It reaches four shops that happen
     to pay her, and it reaches shops that pay her nothing on exactly the same
     terms. ▶ HER OPTION A RULE OF 2026-09-06 IS UNTOUCHED: the app still has no
     idea which shops pay.
   ⚠️ RARITY IS WHAT MAKES IT HONEST. "dress" appears in dozens of her
     descriptions and means nothing; "nightgown" appears in one and means
     everything. So each matched word is worth 1/(how many shops use it), and
     the threshold below is really "this shop is one of a handful known for
     this" — never "this shop mentioned a common noun". Without that, every
     request for a dress would fire a search at whichever shop happened to sort
     first, which is noise dressed as expertise.
   ⚠️ FOUR-LETTER STEMS so "swimsuit" reaches "swimwear" and "nightgown" reaches
     "nightgowns". Crude, and right for the job: these are her plain nouns, not
     prose. */
const _famStem = (w) => w.slice(0, 4);
const _famTok = (t) => [...new Set(String(t || '').toLowerCase()
  .split(/[^a-z]+/).filter(w => w.length >= 4).map(_famStem))];

export function buildFamousIndex(stores) {
  const docs = [];
  const df = new Map();
  for (const [name, v] of Object.entries(stores || {})) {
    if (!v || !v.strengths) continue;
    const words = new Set(_famTok(v.strengths));
    if (!words.size) continue;
    docs.push({name, words});
    for (const w of words) df.set(w, (df.get(w) || 0) + 1);
  }
  return {docs, df};
}

/* Returns the ONE shop distinctively known for what she asked for, or null.
   ⚠️ null is the common answer and that is correct — a white eyelet skirt is
   nothing any of her shops is famous for, so no search is spent on it. */
export function famousFor(request, index, floor = 0.2) {
  if (!index || !index.docs.length) return null;
  const want = _famTok([request.item, request.colour, request.fabric, request.cut]
    .filter(Boolean).join(' '));
  if (!want.length) return null;
  let best = null, bestScore = 0;
  for (const d of index.docs) {
    let score = 0;
    for (const w of want) if (d.words.has(w)) score += 1 / (index.df.get(w) || 1);
    if (score > bestScore) { bestScore = score; best = d.name; }
  }
  return bestScore >= floor ? best : null;
}

// ---------------------------------------------------------------------------
// Match a shopping result's seller back to one of HER stores.
// Names arrive dirty: "Zappos.com", "Kohl's", "Dr. Martens US".
export function matchStore(source, stores) {
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/\.(com|us|co\.uk)\b/g, '').replace(/[^a-z0-9]/g, '');
  const key = norm(source);
  if (!key) return null;
  const index = new Map();
  for (const [name, v] of Object.entries(stores)) {
    index.set(norm(name), name);
    index.set(norm(String(v.host || '').split('.')[0]), name);
  }
  if (index.has(key)) return index.get(key);
  /* 🚨🚨 THE LEADING-TOKEN PASS, ADDED 2026-09-09, AND IT WAS FOUND BY MEASURING
     RATHER THAN BY READING. Cath asked why her affiliate shops never appear, so
     three real searches were probed and the sellers counted. "Zara USA" came
     back twice and was thrown away — and ZARA IS HERS, fully scored by her. So
     were "Saks Fifth Avenue" (7 results in one search) and both "Etsy - <shop>"
     sellers, and ETSY IS ONE OF THE NINE MERCHANTS THAT ACTUALLY PAY HER.
     ▶▶ THE CAUSE: the loose pass below requires `k.length > 4`, so every store
       whose name normalises to four characters or fewer could only ever match
       EXACTLY. That is THIRTEEN of her shops — Belk, Saks, Zara, Etsy, IZOD,
       NYDJ, Soma, LOFT, Quay, ASOS, H&M, Gap, DSW — and Google almost never
       writes a seller's bare name ("Zara USA", "Etsy - EvolveUA", "LOFT
       Outlet"). They were invisible.
     ▶ WHY THIS AND NOT A SHORTER GUARD: dropping the guard to >3 would let
       "saks" and "etsy" match anywhere INSIDE a name, which is how "us" and
       "gap" once matched half the table. Anchoring on LEADING TOKENS is both
       safer and more accurate — "Saks Fifth Avenue" starts with Saks; a shop
       that merely contains those letters does not.
     ⚠️ LONGEST PREFIX FIRST, DELIBERATELY: "Nordstrom Rack" must resolve to her
       Nordstrom Rack entry and never to Nordstrom. Testing the whole string
       before its prefixes is what guarantees that. */
  const toks = String(source || '').toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
  for (let n = toks.length; n >= 1; n--) {
    const pre = norm(toks.slice(0, n).join(''));
    if (pre && index.has(pre)) return index.get(pre);
  }
  for (const [k, name] of index) {
    // ⚠️ length guard: without it "us" or "gap" match half the table.
    if (k.length > 4 && (k.includes(key) || key.includes(k))) return name;
  }
  return null;
}

export const isResale = (source) => RESALE.test(String(source || ''));

// ---------------------------------------------------------------------------
// VERIFY one product against one requirement, using every scrap of text the
// retailer gave us. `text` should be the OFFER text (its title + description +
// colourway), never the aggregator's tidy title — that is what fooled us on the
// DVF and what Dillard's corrected on the Kensie.
export function verifyColour(want, text) {
  const key = String(want || '').toLowerCase();
  const fam = COLOUR_FAMILY[key];
  if (!fam || !text) return VERDICT.UNKNOWN;
  // A print is not a solid colour, however many colour words it carries.
  if (PRINT_WORDS.test(text) || /multi(?:colou?r|colou?red)?\b/i.test(text)) return VERDICT.REJECTED;
  if (fam.test(text)) return VERDICT.CONFIRMED;
  // ▶ If the retailer NAMED a colour and it is a different family, that is a
  //   REJECT, not a shrug. "Yellowmulti" is not blush, and saying UNKNOWN there
  //   would quietly leave it in the running.
  for (const [other, re] of Object.entries(COLOUR_FAMILY)) {
    if (other !== key && re.test(text)) return VERDICT.REJECTED;
  }
  return VERDICT.UNKNOWN;
}

export function verifyFabric(want, text) {
  const key = String(want || '').toLowerCase();
  const rule = FABRIC[key];
  if (!rule || !text) return VERDICT.UNKNOWN;
  if (has(rule.no, text)) return VERDICT.REJECTED;          // "silk-blend", "faux leather"
  if (has(FABRIC_CONFLICT[key], text)) return VERDICT.REJECTED; // "95% polyester"
  return has(rule.yes, text) ? VERDICT.CONFIRMED : VERDICT.UNKNOWN;
}

export function verifyCut(want, text) {
  const rule = CUT[String(want || '').toLowerCase()];
  if (!rule || !text) return VERDICT.UNKNOWN;
  if (has(rule.no, text)) return VERDICT.REJECTED;           // "faux wrap"
  return has(rule.yes, text) ? VERDICT.CONFIRMED : VERDICT.UNKNOWN;
}

// Sizes arrive as a list of variant names ("6", "M", "XS / 2", "8 Wide").
export function verifySize(want, sizes, text) {
  if (want == null || want === '') return VERDICT.UNKNOWN;
  const target = String(want).trim().toLowerCase();
  const list = (sizes || []).map(s => String(s).trim().toLowerCase()).filter(s => s && s !== 'any size');
  if (!list.length) {
    // Fall back to the offer text, which often reads "... - Size 6".
    if (text && new RegExp(`\\bsize\\s*${target}\\b`, 'i').test(text)) return VERDICT.CONFIRMED;
    return VERDICT.UNKNOWN;
  }
  // "XS / 2" and "S / 4-6" are real shapes; match any token or range.
  const hit = list.some(s => s.split(/[\s/,-]+/).includes(target) || s === target);
  return hit ? VERDICT.CONFIRMED : VERDICT.REJECTED;
}

export function verifyWidth(want, text) {
  if (!want) return VERDICT.UNKNOWN;
  const t = String(text || '');
  if (/wide/i.test(String(want))) {
    // ⚠️⚠️ ORDER IS LOAD-BEARING AND A TEST CAUGHT IT. The real DSW boot says
    //    "Wide Width" in its own TITLE and "Medium Width, Wide Calf" in its own
    //    VARIANT — the shop contradicts itself on one product. Checking for
    //    "wide width" first returned CONFIRMED and would have told a woman with
    //    wide feet that a medium-width boot fits her.
    // ▶ So an EXPLICIT non-wide width wins over any marketing phrase, always.
    if (NOT_WIDE_WIDTH.test(t)) return VERDICT.REJECTED;
    // A boot that says only "wide calf" is a MEDIUM width foot. Wide calf is the
    // shaft; wide width is the foot. Saying yes here is the promise her app
    // exists to never make.
    if (WIDE_CALF.test(t) && !WIDE_WIDTH.test(t)) return VERDICT.REJECTED;
    if (WIDE_WIDTH.test(t)) return VERDICT.CONFIRMED;
    return VERDICT.UNKNOWN;
  }
  if (/narrow/i.test(String(want))) return NARROW_WIDTH.test(t) ? VERDICT.CONFIRMED : VERDICT.UNKNOWN;
  return VERDICT.UNKNOWN;
}

export function verifyStock(details) {
  const t = Array.isArray(details) ? details.join(' ') : String(details || '');
  if (/\bin stock\b/i.test(t)) return VERDICT.CONFIRMED;
  if (/\bout of stock|sold out|unavailable\b/i.test(t)) return VERDICT.REJECTED;
  return VERDICT.UNKNOWN;
}

// ---------------------------------------------------------------------------
// Judge one candidate against the whole request.
// `offer` is the best retailer offer for the product (its own title + details).
export function judge(req, product) {
  const text = [product.offerTitle, product.description, product.colourway, product.title]
    .filter(Boolean).join(' · ');
  const checks = {};
  if (req.colour) checks.colour = verifyColour(req.colour, text);
  if (req.fabric) checks.fabric = verifyFabric(req.fabric, text);
  if (req.cut)    checks.cut    = verifyCut(req.cut, text);
  if (req.size)   checks.size   = verifySize(req.size, product.sizes, text);
  if (req.width)  checks.width  = verifyWidth(req.width, text);
  checks.stock = verifyStock(product.details);

  const stated = Object.entries(checks).filter(([k]) => k !== 'stock');
  const rejected = stated.filter(([, v]) => v === VERDICT.REJECTED).map(([k]) => k);
  const unknown  = stated.filter(([, v]) => v === VERDICT.UNKNOWN).map(([k]) => k);
  // ▶ HER RULE, LITERALLY: only every-requirement-CONFIRMED is an exact match.
  //   UNKNOWN never counts as a pass.
  const exact = rejected.length === 0 && unknown.length === 0 && checks.stock !== VERDICT.REJECTED;
  return {checks, rejected, unknown, exact};
}

// ---------------------------------------------------------------------------
// HER WIDENING DESIGN, 2026-09-06 — and the shape matters as much as the result.
// "maybe she wants to keep silk but is open to another shade of pink, or maybe
//  blush matters most and she is open to satin."
// ▶ So this returns ONE OPTION PER REQUIREMENT SHE GAVE, each saying what would
//   be found if THAT one were released — and the app never picks for her.
// ⚠️ It offers a door only where releasing it actually finds something. An offer
//   that leads to nothing is worse than no offer.
export const COLOUR_PARENT = {
  blush: 'pink', rose: 'pink', crimson: 'red', burgundy: 'red', navy: 'blue',
  ivory: 'white', cream: 'white', sage: 'green', emerald: 'green', camel: 'brown',
};

export function widenOptions(req, products, judgeFn = judge) {
  const stated = ['colour', 'fabric', 'cut', 'size', 'width'].filter(k => req[k]);
  const relax = (keys) => {
    const r = {...req};
    for (const k of keys) {
      if (k === 'colour' && COLOUR_PARENT[String(req.colour).toLowerCase()]) {
        // ⭐ HER OWN WORDS: "keep the silk and look at other shades of pink."
        //    Releasing a colour SOFTENS it to its family; it never deletes it.
        //    A woman who asked for blush does not want navy.
        r.colour = COLOUR_PARENT[String(req.colour).toLowerCase()];
      } else {
        delete r[k];
      }
    }
    return r;
  };
  const doorsFor = (combo) => {
    const relaxed = relax(combo);
    const found = products.map(p => ({product: p, verdict: judgeFn(relaxed, p)}))
      // ⚠️⚠️ THE KEPT REQUIREMENTS MUST BE *CONFIRMED*, NOT MERELY NOT-REJECTED —
      //    and a LIVE run caught this being wrong. The first version let any
      //    unknown through, so a dress whose colour was never verified appeared
      //    under "keep the blush, open on the fabric". That door PROMISES blush.
      //    An unverified colour there is exactly the claim her rule forbids,
      //    wearing a helpful face.
      // ▶ Everything she KEEPS must be confirmed. Only what she RELEASED may be
      //   unknown, and it is labelled.
      .filter(j => j.verdict.rejected.length === 0 &&
                   j.verdict.unknown.every(k => combo.includes(k)));
    if (!found.length) return null;
    // ▶ A RELEASED REQUIREMENT IS STILL REPORTED, NEVER SILENTLY DROPPED.
    //   She let go of "silk"; she did not ask to stop being told the thing is
    //   chiffon. `differs` carries the ORIGINAL verdict for everything she
    //   released, so the card can say "tulip pink, and chiffon rather than
    //   silk" instead of quietly presenting a near-miss as a match.
    for (const j of found) {
      const before = judgeFn(req, j.product);
      j.differs = Object.fromEntries(combo
        .filter(k => before.checks[k] !== undefined)
        .map(k => [k, before.checks[k]]));
    }
    return {
      release: combo.length === 1 ? combo[0] : combo.slice(),
      releases: combo.slice(),
      softenedTo: relaxed.colour !== req.colour ? relaxed.colour : null,
      keeps: stated.filter(s => !combo.includes(s)),
      count: found.length,
      products: found,
    };
  };

  // ▶ ONE AT A TIME FIRST — that is her design, and a door that loosens one
  //   thing is always better than a door that loosens two.
  const single = stated.map(k => doorsFor([k])).filter(Boolean);
  if (single.length) return single;

  // ⚠️ ONLY IF NOTHING SINGLE WORKS. A live run found the real case: a TULIP PINK
  //    CHIFFON wrap is reachable from "blush silk wrap" only by loosening the
  //    shade AND the fabric. A stylist would still mention it — and would say
  //    plainly that it is two steps away, which `releases` lets the app do.
  const pairs = [];
  for (let a = 0; a < stated.length; a++)
    for (let b = a + 1; b < stated.length; b++) {
      const d = doorsFor([stated[a], stated[b]]);
      if (d) pairs.push(d);
    }
  return pairs;
}
