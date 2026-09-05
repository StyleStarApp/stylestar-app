#!/usr/bin/env python3
"""
Offline tests for the checklist matcher. No network, no database, ~1 second.

Runs in the ingest workflow BEFORE anything touches the real catalog, so a typo
in data/slot-rules.json or a broken boundary rule fails on a runner rather than
turning up as a strange shelf on Cath's phone.

⭐ THE CASES BELOW ARE REAL PRODUCT NAMES AND REAL CATEGORY PATHS lifted from the
seven feeds, not invented ones. An invented fixture tests the fixture.
"""
import os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slot_match import load_rules, match, norm

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

for slot, r in rules.items():
    ok(f"{slot} can be matched at all", bool(r.get("cat") or r.get("name")),
       "a rule with neither cat nor name can never match anything")
    for key in ("cat", "name", "not", "color", "pattern"):
        if key in r:
            ok(f"{slot}.{key} is a non-empty list",
               isinstance(r[key], list) and all(isinstance(t, str) and t.strip() for t in r[key]))

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
patterned = [s for s, r in rules.items() if r.get("pattern")]
ok("pattern gates only a handful of rows", len(patterned) <= 6, f"gates {patterned}")

# Nothing should match everything.
everything = match(g("Silk Dress", "women>clothing>dresses", "Blue"), rules)
ok("a dress lands on a sane number of rows", len(everything) <= 6, f"{everything}")

print(f"{n - len(fails)} passed, {len(fails)} failed")
for f in fails:
    print("  FAIL " + f)
sys.exit(1 if fails else 0)
