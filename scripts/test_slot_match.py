#!/usr/bin/env python3
"""
Offline tests for the checklist matcher. No network, no database, ~1 second.

Runs in the ingest workflow BEFORE anything touches the real catalog, so a typo
in data/slot-rules.json or a broken boundary rule fails on a runner rather than
turning up as a strange shelf on Cath's phone.

⭐ THE CASES BELOW ARE REAL PRODUCT NAMES AND REAL CATEGORY PATHS lifted from the
seven feeds, not invented ones. An invented fixture tests the fixture.
"""
import json, os, re, sys

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
           key in ("n", "cat", "name", "not", "color", "pattern"),
           "a misspelled key is silently ignored by the matcher")

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
