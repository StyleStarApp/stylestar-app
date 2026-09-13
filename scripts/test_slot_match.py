#!/usr/bin/env python3
"""
Offline tests for the checklist matcher. No network, no database, ~1 second.

Runs in the ingest workflow BEFORE anything touches the real catalog, so a typo
in data/slot-rules.json or a broken boundary rule fails on a runner rather than
turning up as a strange shelf on Cath's phone.

⭐ THE CASES BELOW ARE REAL PRODUCT NAMES AND REAL CATEGORY PATHS lifted from the
seven feeds, not invented ones. An invented fixture tests the fixture.
"""
import itertools, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slot_match import load_rules, match, norm, RULES_PATH

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "..", "index.html")

fails = []
n = 0

def ok(name, cond, detail=""):
    global n
    n += 1
    if not cond:
        fails.append(f"{name}{(' — ' + detail) if detail else ''}")

def g(name, cat="", color="", pattern=""):
    return {"name": name, "merchant_category": cat, "category_secondary": "",
            "category_primary": "", "color": color, "pattern": pattern}


rules = load_rules()

# ---------------------------------------------------------------- structure --
ok("100 rules", len(rules) == 100, f"got {len(rules)}")

# The rows are HERS and they live in index.html. If a row is renamed or added
# there and not here, this is what says so.
html = open(INDEX, encoding="utf-8").read()
block = re.search(r"const wardrobeItems\s*=\s*\[(.*?)\n\s*\];", html, re.S)
ok("found wardrobeItems in index.html", bool(block))
if block:
    items = dict(re.findall(r"\{id:'([a-z]{2}\d+)',\s*n:'((?:[^'\\]|\\.)*)'", block.group(1)))
    items = {k: v.replace("\\'", "'") for k, v in items.items()}
    ok("100 checklist rows", len(items) == 100, f"got {len(items)}")
    missing = sorted(set(items) - set(rules))
    extra = sorted(set(rules) - set(items))
    ok("every row has a rule", not missing, f"no rule for {missing}")
    ok("no rule without a row", not extra, f"unknown slots {extra}")
    bad = [k for k in rules if k in items and rules[k].get("n") != items[k]]
    ok("rule names match the checklist", not bad, f"mismatched {bad}")

# The RAW file, because that is where a typo would be. load_rules() normalizes
# every term into a padded tuple for speed, so checking its output would be
# checking the normalizer rather than the rules.
raw = {k: v for k, v in json.load(open(RULES_PATH, encoding="utf-8")).items()
       if not k.startswith("_")}
ok("raw file and loaded rules agree", set(raw) == set(rules))
for slot, r in raw.items():
    ok(f"{slot} can be matched at all", bool(r.get("cat") or r.get("name")),
       "a rule with neither cat nor name can never match anything")
    ok(f"{slot} names its row", bool(r.get("n")))
    for key in ("cat", "name", "not", "color", "pattern"):
        if key in r:
            ok(f"{slot}.{key} is a non-empty list of non-empty strings",
               isinstance(r[key], list) and bool(r[key])
               and all(isinstance(t, str) and t.strip() for t in r[key]))
    for key in r:
        ok(f"{slot} has no unknown key '{key}'",
           key in ("n", "cat", "name", "not", "color", "pattern", "requireName", "requireAny"),
           "a misspelled key is silently ignored by the matcher")
    if r.get("requireName"):
        ok(f"{slot} has requireName but no name list to require",
           bool(r.get("name")), "requireName with nothing to check is a no-op that looks like a rule")
    if "requireAny" in r:
        ok(f"{slot}.requireAny is a non-empty list of non-empty strings",
           isinstance(r["requireAny"], list) and bool(r["requireAny"])
           and all(isinstance(t, str) and t.strip() for t in r["requireAny"]))

# ------------------------------------------------------- the catch-all trap ----
# 🚨 THE BUG THIS EXISTS TO STOP, found by the coverage report on 2026-09-05 and
# invisible any other way: the ladder is `cat OR name`, so a DEPARTMENT-WIDE
# category term on a row that is only a SUBSET of that department matches the
# whole department. 'sleepwear' on Robes made every pyjama set a robe;
# 'activewear' on ten rows made one pair of leggings also a sports bra, a workout
# tee and an athletic sock; 'earrings' on three rows made one pair of hoops also
# a stud and a statement earring; 'underwear' on Shapewear pulled in ski socks.
# ▶ A department name belongs in `cat` ONLY on the row that IS that department.
DEPARTMENT_DEFAULT = {
    # department word : the one row allowed to claim all of it, or None for none
    "sleepwear": None, "underwear": None, "lingerie": None, "activewear": None,
    "earrings": None, "sandals": None, "boots": "sh7", "jackets": None,
    "coats": None, "outerwear": None, "bags": None, "luggage": None,
    "hats": None, "skirts": None, "shorts": "bo6", "socks": "ac13",
    "dresses": "dr1", "jeans": None, "pants": "bo7", "trousers": "bo7",
    # ⭐ These four rows ARE their department, on purpose:
    #   to3 is "tops in your favourite colours" -- the colours are HERS and
    #   change per woman, so the row cannot carry a static colour list and is
    #   correctly every top; dr1 is the default dress row; bo6/bo7 likewise.
    "tops": "to3", "shirts & tops": "to3", "clothing tops": "to3",
}
for slot, r in raw.items():
    for term in r.get("cat", []):
        owner = DEPARTMENT_DEFAULT.get(term.strip().lower(), "n/a")
        if owner == "n/a":
            continue
        # A colour or pattern gate IS a discriminator, so a row that has one may
        # honestly take the whole department: "White tops" really is every top,
        # narrowed by colour. Without a gate it is just a catch-all.
        gated = bool(r.get("color") or r.get("pattern"))
        ok(f"{slot} does not claim the whole '{term}' department",
           owner == slot or gated,
           "a subset row with a department-wide cat term matches the department")

# The three rows whose colour or pattern gate IS their discriminator are allowed
# a broad `tops` category -- but only because that gate really is present.
for slot in ("to1", "to2"):
    ok(f"{slot} is gated by colour", bool(raw[slot].get("color")))
ok("to4 is gated by pattern", bool(raw["to4"].get("pattern")))
# ...and a colour gate is only a gate if its words are not already guaranteed by
# the row's own name terms. 'denim' in both made "Blue jeans" mean "any jeans".
for slot, r in raw.items():
    overlap = set(t.lower() for t in r.get("color", [])) & set(t.lower() for t in r.get("name", []))
    ok(f"{slot} colour gate is not cancelled by its own name terms", not overlap,
       f"{sorted(overlap)} appears in both, so the colour gate always passes")

# ------------------------------------------------------------- de-pluralizing --
# Both sides get the same treatment, so these have to meet in the middle.
ok("plural category meets singular term", norm("Dresses") == norm("dress"))
ok("plural term meets singular name", norm("Bags") == norm("bag"))
ok("word boundaries hold", " top " not in norm("laptop"))
ok("hyphens are word breaks", " shirt " in norm("T-Shirt"))
ok("double-s survives", norm("dress").strip() == "dress")

# ------------------------------------------------------------------ her rules --
# Her 2026-08-15 finding, in her own words: "A black top should just be a black
# top. Not a tank top, not a collared blouse, just a top."
ok("a tank is not a White top", "to1" not in match(g("White Ribbed Tank Top", color="White"), rules))
ok("a blouse is not a White top", "to1" not in match(g("White Poplin Blouse", color="White"), rules))
ok("a plain white tee IS a White top",
   "to1" in match(g("White Cotton Crewneck Tee", "women>clothing>tops", "White"), rules))
ok("a black tee is a Black top",
   "to2" in match(g("Black Jersey T-Shirt", "women>clothing>tops", "Black"), rules))
ok("a white DRESS is not a White top",
   "to1" not in match(g("White Cotton Midi Dress", "women>clothing>dresses", "White"), rules))

# Her work-dress definition (2026-08-12): knee or below, tailored, modest, never
# strapless, never satin, never a gown.
ok("a sheath is a work dress",
   "dr3" in match(g("Wool-Blend Sheath Dress", "women>clothing>dresses>work"), rules))
ok("a gown is not a work dress",
   "dr3" not in match(g("Silk Evening Gown", "women>clothing>dresses>evening"), rules))
ok("a strapless dress is not a work dress",
   "dr3" not in match(g("Strapless Crepe Midi Dress", "women>clothing>dresses"), rules))
ok("a sundress is not a work dress",
   "dr3" not in match(g("Floral Cotton Sundress", "women>clothing>dresses"), rules))

# Swim must not leak into clothing rows, and cover-ups are not swimsuits.
ok("a bikini is not a top", "to1" not in match(g("White Bikini Top", color="White"), rules))
ok("a cover-up is not a swimsuit", "ac9" not in match(g("Long Mesh Cover-Up Dress"), rules))

# The name rung, which is the whole of Marissa Collections: no category at all.
ok("blazer found by name alone", "ja2" in match(g("Double-Breasted Wool Blazer"), rules))
ok("jeans found by name alone", "bo1" in match(g("High-Rise Straight-Leg Jeans", color="Blue"), rules))
ok("trench found by name alone", "ja6" in match(g("Cotton-Gabardine Trench Coat"), rules))

# The category rung, which is Mytheresa: 80% of the catalog, near-perfect breadcrumbs.
ok("loafers by breadcrumb", "sh13" in match(g("Leather Loafers", "women>shoes>loafers"), rules))
ok("ankle boots by breadcrumb",
   "sh7" in match(g("Leather Ankle Boots", "women>shoes>boots>mid-heel boots"), rules))
ok("top-handle bag by breadcrumb",
   bool(match(g("Small Leather Bag", "women>bags>top-handle bags"), rules)))

# Pattern only ever gates a row that is about pattern, because it is blank at
# five of the seven stores.
ok("a printed top with the pattern column filled lands on Print tops",
   "to4" in match(g("Silk Shirt", "women>clothing>tops", pattern="printed"), rules))
ok("a plain top with no pattern column does NOT land on Print tops",
   "to4" not in match(g("Silk Shirt", "women>clothing>tops"), rules))
patterned = [s for s, r in raw.items() if r.get("pattern")]
ok("pattern gates only a handful of rows", len(patterned) <= 6, f"gates {patterned}")

# Nothing should match everything.
everything = match(g("Silk Dress", "women>clothing>dresses", "Blue"), rules)
ok("a dress lands on a sane number of rows", len(everything) <= 6, f"{everything}")


# --------------------------------------- 2026-09-13 SIBLING CONTAMINATION SWEEP --
# 🚨 THE SAME SHAPE AS THE HOODIE BUG, MADE PERMANENT. Any two rows that share an
# exact `cat` term become candidates TOGETHER for any garment carrying it -- the
# category rung picks candidates before `not`/name ever runs. So a garment that IS
# one row by its own NAME (a "training tank", a "bandeau bra", a "garter") can sail
# onto a sibling row too, unless that sibling's `not` list has been told the word
# exists. Found and fixed this session: ac5/ac6/ac7 (Workout tanks/tees/long-sleeve
# tops -- no separation at all), fo5->to6 (a garter/teddy/babydoll landing on
# "Dressy or going-out tops"), fo4->fo1 (a bandeau/adhesive bra landing on
# "Perfectly fitting bras"). This audit is what found them, and it now runs every
# time so a THIRD one cannot go unnoticed the way the first two did.
#
# For every pair of rows sharing a `cat` term, build a real example of row A (its
# own name term, its own colour/pattern gate if it has one) and check it does not
# also land on sibling B -- unless the pair is named below, with a reason:
#   DESIGN  -- a genuine, permanent overlap she'd want (a sundress really is also
#              a daytime casual dress; "Tops in your favorite colors" really is
#              every top, by design).
#   GAP     -- a real, measured leak that is NOT silently patched, because fixing
#              it would need match() itself to require row B's own name terms even
#              though the category already matched -- a code change, not a JSON
#              edit, and not made without her sign-off. Recorded in CLAUDE.md too.
_SIBLING_OK = {
    ("to1", "to3"): "DESIGN — to3 is the deliberate every-top catch-all",
    ("to2", "to3"): "DESIGN — to3 is the deliberate every-top catch-all",
    ("to4", "to3"): "DESIGN — to3 is the deliberate every-top catch-all",
    ("dr1", "dr5"): "DESIGN — a sundress is also a daytime casual dress",
    ("dr5", "dr1"): "DESIGN — a sundress is also a daytime casual dress",
    ("fo3", "fo2"): "DESIGN — lace/silk underwear is still comfortable",
    ("fo5", "to6"): "DESIGN — an evening bodysuit/corset/bustier is a dressy top too",
    # ✅ THE REVERSE DIRECTION, PROVEN 2026-09-13 AFTER THE requireName FIX: a
    # bodysuit/corset/bustier genuinely IS both rows' own identity, on purpose
    # (it is in BOTH fo5's and to6's `name` lists) -- so to6's own word
    # landing on fo5 too is the SAME design overlap as the row above, seen
    # from the other side, not a leftover leak. The fabric words that WERE a
    # real leak (satin/silk/lace/sequin/embellished/halter) are now excluded;
    # see the direct proof below this sweep.
    ("to6", "fo5"): "DESIGN — same overlap as (fo5,to6): bodysuit/corset/bustier "
                    "are legitimately named on both rows",
    # ✅ FIXED 2026-09-13, not a GAP any more: fo3, fo4, fo5 and sh14 now carry
    # requireName:true in slot-rules.json, so match() re-checks each row's own
    # `name` words (against hay_all, cat+name together) even after category
    # has already picked it as a candidate. The direct proof lives in the
    # PART below this sweep, using real garments captured against the real
    # rule set — see "requireName CLOSES THE SIBLING-CONTAMINATION GAP".
}
_by_cat = {}
for _slot, _r in raw.items():
    for _c in _r.get("cat", []):
        _by_cat.setdefault(_c.strip().lower(), []).append(_slot)
_checked_pairs = 0
for _c, _slots in _by_cat.items():
    _uniq = sorted(set(_slots))
    if len(_uniq) < 2:
        continue
    for _a, _b in itertools.permutations(_uniq, 2):
        _ra, _rb = raw[_a], raw[_b]
        if not _ra.get("name"):
            continue
        _cat = next((c for c in _ra.get("cat", []) if c.strip().lower() ==
                     next(t for t in _rb.get("cat", []) if t.strip().lower() == _c)), _ra["cat"][0])
        _color = _ra["color"][0] if _ra.get("color") else ""
        _pattern = _ra["pattern"][0] if _ra.get("pattern") else ""
        for _nt in _ra["name"]:
            _checked_pairs += 1
            _result = match(g(_nt, _cat, _color, _pattern), rules)
            if _b in _result and (_a, _b) not in _SIBLING_OK:
                ok(f"{_a}'s own '{_nt}' does not also land on sibling {_b}", False,
                   f"got {_result} — either fix it or add ('{_a}','{_b}') to _SIBLING_OK with a reason")
ok("the sibling-contamination sweep actually ran", _checked_pairs > 50,
   f"only checked {_checked_pairs} — the cat-grouping logic broke silently")


# ------------------------------- requireName CLOSES THE SIBLING-CONTAMINATION GAP --
# The four real leaks this file recorded and did NOT silently patch: a PLAIN
# item, carrying only the sibling pair's SHARED cat term and none of the
# narrower row's own name words, must no longer land on the narrower row.
ok("a plain bra (no 'strapless'/'bandeau'/'adhesive') does not land on Strapless bras",
   "fo4" not in match(g("Wolford Sheer Touch Bra", "women>lingerie>bras", "black"), rules))
ok("...but a real strapless bra still does",
   "fo4" in match(g("Wolford Fatal Strapless Bra", "women>lingerie>bras", "nude"), rules))
ok("a plain brief does not land on Beautiful underwear",
   "fo3" not in match(g("Skims Cotton Brief", "women>underpants>briefs", "sand"), rules))
ok("...but a real lace brief still does",
   "fo3" in match(g("Fleur du Mal Lace Brief", "women>underpants>briefs", "black"), rules))
ok("a plain pump does not land on Kitten heels",
   "sh14" not in match(g("Sam Edelman Hazel Pump", "women>shoes>pumps", "black"), rules))
ok("...but a real kitten heel still does",
   "sh14" in match(g("Manolo Blahnik Kitten Heel Pump", "women>shoes>pumps", "black"), rules))
ok("a plain dressy satin top does not land on Special lingerie",
   "fo5" not in match(g("Zimmermann Satin Halter Top", "women>lingerie>corsets", "ivory"), rules))
ok("...but a real corset still does",
   "fo5" in match(g("Agent Provocateur Corset", "women>lingerie>corsets", "black"), rules))
# 🚨 THE REAL REASON requireName CHECKS THE NAME ONLY, NOT CATEGORY+NAME,
# FOUND BY TESTING THIS EXACT PAIR: fo5 and to6 share the cat term "corset",
# and "corset" is ALSO one of fo5's own name words — a corset is genuinely
# both a category and its own name. So a plain to6 satin top merely filed
# under that shared category already contains the word "corset" in its
# CATEGORY text, which would trivially satisfy a category+name check with no
# real corset anywhere on the garment. Checking name only closes that hole.
ok("category text containing the row's own word does NOT satisfy requireName by itself",
   "fo5" not in match(g("Zimmermann Satin Top", "women>lingerie>corsets", "ivory"), rules),
   "a plain top filed under a 'corsets' category must not pass on the category word alone")

# 🚨🚨 THE HEAD-NOUN TRAP, FOUND 2026-09-13 VERIFYING requireName AGAINST THE
# REAL CATALOG: "garter" and "teddy" are both real fo5 name words AND real
# English words that modify a totally different garment -- a "garter belt
# skirt" is a SKIRT styled to look garter-belt-ish, a "teddy down jacket" is a
# JACKET made of teddy (fleece) fabric. requireName correctly found "garter"/
# "teddy" in the name and let both through, because requireName only asks
# "is one of my words present", never "is my word the HEAD NOUN". Fixed the
# same precedented way this codebase always fixes this shape (the "top"/
# "denim" modifier trap above): add the specific discovered false-positive
# head nouns to fo5's own `not` list. ⚠️ Two real garments off the live feed,
# not invented cases.
ok("a garter-BELT SKIRT (garter is a modifier, not the garment) does not land on Special lingerie",
   "fo5" not in match(g("Coperni Garter Belt Denim Skirt", "women>bottoms>skirts", "blue"), rules),
   "a skirt styled with a garter-belt look is a skirt, not lingerie")
ok("a TEDDY DOWN JACKET (teddy is the fabric, not the garment) does not land on Special lingerie",
   "fo5" not in match(g("Moncler Mallero Reversible Teddy Down Jacket", "women>outerwear>jackets", "black"), rules),
   "a jacket made of teddy (fleece) fabric is a jacket, not lingerie")
ok("a real garter SKORT still legitimately lands on BOTH Tennis skirts and Special lingerie",
   set(match(g("Garter Lace Trim Tennis Skort", "", "black"), rules)) >= {"ac12", "fo5"},
   "a genuine lingerie-styled skort (no recognised category, so it falls to the name rung) is a "
   "real design overlap, not a false positive -- the fix must not overreach")


# --------------------------- 2026-09-13, SAME SESSION: "TACKLE THE ENTIRE THING CAREFULLY" --
# 🚨🚨 Cath's own ruling after the fo5 fix: not a one-off patch, a full pass. Fetched the
# COMPLETE coverage log (744 lines, all 100 rows, not the earlier truncated tail) and read
# every row's three samples looking for the SAME shape of bug: a real garment landing on a
# row because a bare word in its name or category happens to collide with the row's own
# name term, with nothing checking whether that word is the garment's actual head noun.
# ⚠️ EVERY FIX BELOW IS THE SAME PRECEDENTED TECHNIQUE AS fo5's: add the SPECIFIC discovered
# false-positive word to that row's own `not` list (or, for bg4, requireName -- its own name
# list already holds nothing but precise multi-word phrases, the same shape as fo3/fo4/sh14).
# ▶ DELIBERATELY NOT TOUCHED, flagged instead of guessed at: dr1 (one linen "maxi skirt"
# landed on Daytime casual dresses via category, but "skirt" is too common a word inside a
# genuine dress's own name -- e.g. a real "tiered skirt maxi dress" -- to exclude safely off
# one sample); ac2/ja6/bo3/sh3/sh4/sh6/sh12/ac10 (mules-vs-pumps, parka-vs-raincoat, ski
# pants-vs-trousers -- stylist judgment calls about adjacent silhouettes, not leaks); and a
# SEPARATE, DIFFERENT-MECHANISM finding -- kids-brand-LINE items (a Balmain "Youth"
# tracksuit, a Stone Island "Junior" hoodie, a Billieblush pajama set) slipping past
# rakuten_feed.py's _KIDS_NAME guard at ingest time, never reaching slot_match.py at all --
# is recorded in CLAUDE.md as its own open item, not patched here alongside these.
ok("a linen TABLECLOTH does not land on Linen pants",
   "bo4" not in match(g("Once Milano Linen Tablecloth", "home>tableware>linens"), rules))
ok("...but real linen pants still do",
   "bo4" in match(g("Vince Linen Wide-Leg Pants", "women>pants>linen"), rules))
ok("a leather HANDBAG does not land on Wallets",
   "bg11" not in match(g("Burberry Reversible Leather Shopping Handbag", "women>bags>shopping totes"), rules))
ok("...but a real wallet still does",
   "bg11" in match(g("Loewe Leather Wallet", "women>wallets"), rules))
ok("a sports BRA does not land on Shorts",
   "bo6" not in match(g("Norba Strappy Sports Bra", "women>activewear>shorts"), rules))
ok("...but real shorts still do",
   "bo6" in match(g("Agolde Parker Long Denim Shorts", "women>shorts"), rules))
ok("a lace SKIRT does not land on Dressy or going-out tops",
   "to6" not in match(g("Lace Tucked Column Skirt", "women>skirts"), rules))
ok("...but a real dressy silk top still does",
   "to6" in match(g("Roland Mouret Draped Wool And Silk Top", "women>tops>evening"), rules))
ok("a SWEATSHIRT does not land on Tote bags",
   "bg1" not in match(g("Dsquared Unisex Mini Relax Sweatshirt", "women>bags>tote"), rules))
ok("...but a real tote bag still does",
   "bg1" in match(g("Chloe Stripy Large Logo Canvas Tote Bag", "women>bags>tote bags"), rules))
ok("a scarf-shaped bag KEYRING does not land on Scarves/Pashminas",
   "ex3" not in match(g("Burberry Women's Mini Fox Scarf Charm Keyring", "women>accessories>keyrings"), rules))
ok("...but a real scarf still does",
   "ex3" in match(g("Hermes Silk Scarf", "women>scarves"), rules))
ok("a wool THROW blanket does not land on Hair accessories",
   "ex6" not in match(g("Etro Alocasia Fringed Wool Throw", "women>home>throws"), rules))
ok("...but a real hair clip still does",
   "ex6" in match(g("Gucci Metal Hair Clips Set", "women>hair accessories"), rules))
ok("a sports BRA does not land on Athletic socks",
   "ac13" not in match(g("Nike Light-Support Longline Sports Bra", "women>socks"), rules))
ok("a BUSTIER top does not land on Athletic socks either",
   "ac13" not in match(g("Rick Owens Wool Bustier Top", "women>socks"), rules))
ok("...but real athletic socks still do",
   "ac13" in match(g("Nike Ankle Socks 3-Pack", "women>activewear>socks"), rules))
ok("a BUSTIER top does not land on Perfectly fitting bras",
   "fo1" not in match(g("Fleur du Mal Bouquet Lace Bustier Top", "women>lingerie>bras"), rules))
ok("...but a real bra still does",
   "fo1" in match(g("Wolford Fatal Bra", "women>lingerie>bras"), rules))
ok("a PERFUME whose own product line is French for 'dress' (Guerlain's La Petite Robe) "
   "does not land on Robes",
   "sl3" not in match(g("Guerlain Eau de Parfum Spray La Petite Robe Absolue", "beauty>fragrance"), rules))
ok("...but a real silk robe still does",
   "sl3" in match(g("Penninsule Silk Robe", "women>robes"), rules))
ok("a DUFFEL bag does not land on Laptop bags",
   "bg9" not in match(g("Bottega Veneta Getaway Large Intrecciato Duffel Bag", "women>bags>laptop bags"), rules))
ok("...but a real laptop briefcase still does",
   "bg9" in match(g("Tumi Leather Laptop Briefcase", "women>bags>laptop bags"), rules))
ok("a plain BELT (the accessory, not a belt bag) does not land on Belt bags",
   "bg4" not in match(g("Balenciaga Slim Women's Mini Belt", "women>accessories>belt bags"), rules),
   "requireName: bg4's own name list is precise multi-word phrases (belt bag/fanny pack/waist "
   "bag/bum bag), so a plain belt filed under a shared 'belt bags' category must not qualify")
ok("...but a real belt bag still does",
   "bg4" in match(g("Saint Laurent Classic Monogram Leather Belt Bag", "women>bags>belt bags"), rules))
ok("a MAKEUP pencil does not land on Shapewear",
   "fo6" not in match(g("Lancome Mini Brow Shaping Powdery Pencil", "beauty>makeup"), rules),
   "'shaping' is one of fo6's own name words and is also cosmetics jargon (brow shaping) -- "
   "the same head-noun trap as fo5's garter/teddy")
ok("...but real shapewear still does",
   "fo6" in match(g("Skims Sculpting Bodysuit Shaper", "women>shapewear"), rules))
ok("a DOG coat does not land on Wool coats",
   "ja4" not in match(g("Moncler Poldo Dog Couture Dog Coat", "women>coats>wool"), rules))
ok("...but a real wool coat still does",
   "ja4" in match(g("Max Mara 101801 Wool Coat", "women>coats>wool"), rules))
# 🚨 "thong" is genuinely two different garments -- underwear (fo2's own word) and a
# footwear STYLE (thong sandals, thong slippers) -- and only the FOOTWEAR family exclusion
# (applied to fo/to/bo/dr/ja/ac/sl/bg/ex, deliberately never to sh, which needs "slipper" to
# find its own Slippers row) had never carried "slipper" alongside sandal/espadrille/etc.
ok("a rubber THONG SLIPPER does not land on Comfortable underwear",
   "fo2" not in match(g("Ferragamo Women's Rubber Thong Slippers", "women>underpants"), rules))
ok("...but a real thong still does",
   "fo2" in match(g("Fleur du Mal Luxe Cheeky Thong", "women>underpants"), rules))
ok("...and thong SANDALS still correctly land on Flip flops, unaffected",
   "sh11" in match(g("Ash Thong Sandals with Studded Trim", "women>shoes>sandals"), rules))
# ac5/ac6/ac7 all share one cat term (activewear>tops) with no differentiating name match in
# practice (a real 'Varley Casper T-Shirt' matches all three on category alone, not on any of
# their own compound marketing phrases) -- requireName would empty all three nearly to
# nothing, untested and far riskier than the fo3/fo4/fo5/sh14 case it worked for. Fixed the
# smaller, safer way instead: a sweatshirt/hoodie is unambiguously never a tank, tee or
# long-sleeve top, so excluding those two words is a real leak closed with no shelf-emptying
# risk on the many genuine T-shirts/polos/vests that don't say the marketing phrase either.
for _slot in ("ac5", "ac6", "ac7"):
    ok(f"a zip-up SWEATSHIRT does not land on {_slot}",
       _slot not in match(g("Adidas by Stella McCartney Logo Zip-Up Sweatshirt", "women>activewear>tops"), rules))
    ok(f"a fleece HOODIE does not land on {_slot}",
       _slot not in match(g("The Upside Kalo Delphi Cotton Fleece Hoodie", "women>activewear>tops"), rules))
ok("...but a real workout tee still lands on Workout tees",
   "ac6" in match(g("Varley Casper T-Shirt", "women>activewear>tops"), rules))
# 🚨 RE-VERIFIED AGAINST THE REAL CATALOG AFTER THE FIRST 18-FIX BATCH SHIPPED, NOT ASSUMED
# CLEAN -- re-running the coverage report caught SIX MORE of the exact same shape, each one
# only visible once the earlier false positive stopped hiding it in the top-3 sample.
ok("a linen CUSHION does not land on Hair accessories",
   "ex6" not in match(g("Jonathan Adler Monterey Triangles Linen Cushion", "women>hair accessories"), rules))
ok("a cotton terry TOWEL does not land on Hair accessories either",
   "ex6" not in match(g("Gucci GG Cotton Terry Towel", "women>hair accessories"), rules))
ok("...but a real headband still does",
   "ex6" in match(g("Loca Headband", "women>hair accessories"), rules))
for _slot in ("ac5", "ac6", "ac7"):
    ok(f"a half-zip SWEATER does not land on {_slot}",
       _slot not in match(g("Varley Ritchie Half-Zip Sweater", "women>activewear>tops"), rules))
ok("a linen NAPKIN does not land on Linen pants",
   "bo4" not in match(g("Cabana Set of 2 Embroidered Linen Napkins", "home>tableware"), rules))
ok("a linen HAT does not land on Linen pants",
   "bo4" not in match(g("J.W. Anderson Cap Pletin Linen Logo Embroidered Hat", "women>accessories>hats"), rules))
ok("a linen ROMPER does not land on Linen pants",
   "bo4" not in match(g("Velvet Clare Linen Romper", "women>rompers"), rules))
ok("...but real linen pants still do",
   "bo4" in match(g("Vince Linen Wide-Leg Pants", "women>pants>linen"), rules))
ok("a wrap COAT that merely has kimono-style sleeves does not land on Robes",
   "sl3" not in match(g("Max Mara Oversized Wool Cashmere Beaver Wrap Coat with Roll-Up Kimono Sleeves", "women>coats"), rules),
   "'kimono' is sl3's own word, but a coat described with kimono sleeves is a coat, not a robe")
ok("...but a real silk robe still does",
   "sl3" in match(g("Versace Printed Silk-Blend Robe", "women>robes"), rules))
ok("a party PLACE CARD HOLDER does not land on Wallets",
   "bg11" not in match(g("Jonathan Adler Mr and Mrs Muse Set of 4 Place Card Holders", "home>party"), rules),
   "'card holder' is bg11's own phrase, but a place-card holder is tableware, not a wallet")
ok("...but a real wallet still does",
   "bg11" in match(g("Givenchy Leather Zip-Fastening Wallet", "women>wallets"), rules))
# 🚨 A THIRD RE-VERIFICATION PASS, SAME SESSION, FOUND THREE MORE OF THE SAME SHAPE -- the
# reservoir sampler in rakuten-slots.py picks a stable-but-different set once a row's total
# COUNT changes, so each round of fixes can surface a new set of samples underneath the old
# ones. This is the one this file's own note says "the right amount of paranoia" -- keep
# re-running after a batch, but a clean run is what actually stops the loop, not a fixed count.
ok("a linen PLACEMAT does not land on Linen pants",
   "bo4" not in match(g("Once Milano Set of 2 Linen Placemats", "home>tableware"), rules))
ok("a linen JUMPSUIT does not land on Linen pants",
   "bo4" not in match(g("Marant Etoile Nessime Cotton and Linen Jumpsuit", "women>jumpsuits"), rules))
ok("a linen PLAYSUIT does not land on Linen pants",
   "bo4" not in match(g("Zimmermann Linen Playsuit", "women>playsuits"), rules))
for _slot in ("ac5", "ac6", "ac7"):
    ok(f"a HOODED TRACK JACKET does not land on {_slot}",
       _slot not in match(g("Adidas by Stella McCartney Gathered Hooded Track Jacket", "women>activewear>tops"), rules))
ok("...but a real workout tee still lands on Workout tees, unaffected",
   "ac6" in match(g("Varley Casper T-Shirt", "women>activewear>tops"), rules))
# 🚨 A FOURTH RE-RUN FOUND `bo4` STILL LEAKING -- "linen" alone is such a broad, common fabric
# word that it keeps surfacing new non-pants garments each time the loudest leak is silenced.
# Genuinely the same shape as every fix above (a real garment off the live feed, fixed the
# same evidence-based way) -- but three rounds deep on ONE row is itself worth a note: see
# CLAUDE.md's own flag that bo4 may deserve a structural rethink if a fifth round finds more.
ok("a linen CARDIGAN does not land on Linen pants",
   "bo4" not in match(g("Linen Silk Paillette Cropped Cardigan", ""), rules))
ok("a linen BATHROBE does not land on Linen pants",
   "bo4" not in match(g("Versace Home Medusa Gala Cotton and Linen Terry Bathrobe", "home>bath"), rules))
ok("a linen GILET (vest) does not land on Linen pants",
   "bo4" not in match(g("Tagliatore Linen Gilet with Buttons", "women>vests"), rules))
ok("...but real linen pants still do, unaffected",
   "bo4" in match(g("Vince Linen Wide-Leg Pants", "women>pants>linen"), rules))

# --------------------------------------------- requireAny CLOSES THE bo4 GAP --
# 🚨🚨 A FIFTH re-run found bo4 STILL leaking after 17 `not`-list words: a Tagliatore
# linen VEST, a Maxmara linen VEST, and Saint Laurent linen SHOES -- the row was down to
# 4 real matches and every sample was still wrong. "linen" is a bare fabric word that
# legitimately belongs on nearly any garment TYPE, and `not` can only ever say "not X" for
# an X someone has already caught by hand -- it can never say "must ALSO look like a
# bottom", which is the actual promise this row makes. BUILT: requireAny, a new opt-in flag
# (same shape as requireName, but checking a SEPARATE word list, never the row's own `name`
# field) -- a garment must contain at least one of a set of real bottoms words (pant,
# trouser, wide-leg, crop, flare, palazzo, culotte...) to qualify. Checked against hay_name
# only, same scope and same reason as requireName.
ok("a linen VEST does not land on Linen pants even with no not-list word for 'vest'",
   "bo4" not in match(g("Tagliatore 0205 V-Neck Linen Vest with Contrast Buttons", "women>vests"), rules),
   "requireAny: this row's own trigger word (linen) says nothing about garment type, so a "
   "vest that says nothing bottoms-shaped must not qualify just because it says linen")
ok("linen SHOES do not land on Linen pants either",
   "bo4" not in match(g("Saint Laurent Linen Lace-Up Fashion Shoes", "women>shoes"), rules))
for _name in (
    "Vince Linen Wide-Leg Pants",
    "Brunello Cucinelli Linen and Cotton Wide-Leg Pants",
    "Vince Linen Trouser",
    "Frame Cropped Linen Pant",
):
    ok(f"...but a real bottoms word still qualifies: {_name!r}",
       "bo4" in match(g(_name, "women>pants>linen"), rules))
ok("requireAny is schema-validated the same way as requireName (non-empty list of strings)",
   isinstance(load_rules()["bo4"].get("requireAny"), tuple) and len(load_rules()["bo4"]["requireAny"]) > 0)


# ------------------------------------------------- 2026-09-06 REGRESSION SET --
# 🚨 Cath opened "Tops in your favorite colors" on her own phone and found a
# THONG, a GARTER BELT and a Balenciaga HANDBAG on it. Every case below is a
# real product name from the live feed that was really on a Tops shelf.
#
# ⚠️ WHY THESE TESTS EXIST AT ALL, and it is the point: the rule that should
# have stopped this (_WDR_IDEA_EXCLUDE) was agreed with her, written down, and
# then only ever wired into the AI path -- so the feed never saw it. A rule
# nobody can run is a rule that drifts. These run in the ingest workflow before
# anything touches the catalog.

def tops_of(name, cat="", color=""):
    return [x for x in match(g(name, cat, color), rules) if x.startswith("to")]

# --- the head-noun trap: 'top' is a MODIFIER in all of these -----------------
ok("a 'Top Stitch Thong' is not a top",
   not tops_of("Fleur du Mal Top Stitch Thong Rose Pink", "", "rose pink"))
ok("a 'Top Stitch Garter Belt' is not a top",
   not tops_of("Fleur du Mal Top Stitch Garter Belt Black", "", "black"))
ok("a 'top-handle bag' is not a top",
   not tops_of("Balenciaga Le City Small leather top-handle bag",
               "women>bags>top-handle bags", "black"))
ok("a tote bag is not a top",
   not tops_of("Brunello Cucinelli Large leather tote bag",
               "women>bags>tote bags", "white"))
ok("platform sneakers are not a top",
   not tops_of("Hogan H696 suede and leather platform sneakers",
               "women>shoes>sneakers", "white"))

# --- 'denim' is a MODIFIER on a shoe --------------------------------------- 
ok("denim-coloured pumps are not jeans",
   "bo1" not in match(g("Nodaleto Bulla Sofia denim platform pumps",
                        "women>shoes>pumps", "blue"), rules))
ok("a 'Denim Blue' sneaker is not jeans",
   "bo1" not in match(g("Super Star Sneaker - Denim Blue", "", "denim blue"), rules))
ok("a 'Micro Thong Denim Blue' is not jeans",
   "bo1" not in match(g("Fleur du Mal Le Stretch Micro Thong Denim Blue", "", "blue"), rules))

# --- Cath's taxonomy call: a SWEATER IS NOT A TOP. She keeps ja5 Sweaters ----
#     and ja1 Cardigans as their own rows, so a knit on Tops is a duplicate.
ok("a wool sweater is not a top",
   not tops_of("Dries Van Noten Wool sweater", "women>clothing>knitwear", "brown"))
ok("a lace KNIT SWEATER is not a dressy top either (the whole family, not 3 rows)",
   not tops_of("Fleur du Mal Juliet Lace Knit Sweater Black", "", "black"))
ok("a sweater still lands on Sweaters",
   "ja5" in match(g("Magda Butrym Wool sweater",
                    "women>clothing>knitwear>sweaters", "black"), rules))

# --- ⚠️ AND THE OTHER DIRECTION. Every excluded word is CORRECT somewhere, so
#     a global block list would break these. This half is why _family_not is
#     keyed by family.
ok("'thong sandals' are still flat sandals",
   "sh1" in match(g("A. Emery Clara leather thong sandals",
                    "women>shoes>sandals", "tan"), rules))
ok("a thong is still underwear",
   any(x.startswith("fo") for x in match(g("Fleur du Mal Top Stitch Thong Black", "", "black"), rules)))
ok("a top-handle bag is still a bag",
   any(x.startswith("bg") for x in match(g("Balenciaga Le City Small leather top-handle bag",
                                           "women>bags>top-handle bags", "black"), rules)))
ok("'Sweatshirt' is not caught by the 'sweater' exclusion",
   "to8" in match(g("Cashmere Sweatshirt Grey", "women>clothing>sweatshirts", "grey"), rules))

# --- the shelves must not go empty. A silent nothing is the worst failure ----
for _slot, _name, _cat, _col in (
    ("to1", "Vince Cotton-blend T-shirt", "women>clothing>tops", "white"),
    ("to2", "Silk Shirt in Black", "women>clothing>tops", "black"),
    ("to3", "Balmain Belted silk satin top", "women>clothing>tops", "green"),
):
    ok(f"{_slot} still matches an ordinary top",
       _slot in match(g(_name, _cat, _col), rules), _name)

# --- the category is authoritative when the garment carries one -------------
# The whole design in one assertion: a name stuffed with the word 'top', on a
# garment whose category says 'bags'. The category must win outright.
_ambiguous = match(g("Top Stitch Top Handle Something", "women>bags>tote bags", "black"), rules)
ok("a recognised category wins outright over the name rung",
   _ambiguous == ["bg1"], f"got {_ambiguous}")

print(f"{n - len(fails)} passed, {len(fails)} failed")
for f in fails:
    print("  FAIL " + f)
sys.exit(1 if fails else 0)
