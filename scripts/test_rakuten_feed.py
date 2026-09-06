"""
Tests for the Rakuten feed parser. Rows are built to match the REAL shape measured on
2026-09-05, including the exact values that produced each rule.

The load-bearing test is `blank gender is KEPT`: applied to the real feeds, a
keep-only-Female rule deletes all 2,873 Diane von Furstenberg rows silently.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rakuten_feed import parse_line, keep_row, N_COLS, MID_TO_STORE, BUILD_MIDS

P, F = [0], []
def ok(name, cond, detail=""):
    P[0] += 1
    if not cond:
        F.append(f"{name} {detail}")
        print(f"  FAIL  {name} {detail}")
    else:
        print(f"  pass  {name}")

def row(**over):
    """A realistic 38-column row; defaults mirror the real Vilebrequin sock row.

    ⚠️ THE NAME DELIBERATELY CARRIES NO GENDER WORD (it read "Men Sneaker Socks" until
    2026-09-06). Every test below it varies the gender COLUMN and asserts on the result,
    so a fixture whose NAME says Men makes those tests assert the name guard in PART 7
    instead of the column rule they are written for -- and PART 2, the DVF trap, is the
    single most load-bearing test in this file. A neutral name keeps the two rules
    independently testable. Menswear names live in PART 7, spelled out.
    """
    f = [""] * N_COLS
    f[0]="433224067112303258"; f[1]="Vilebrequin - Sneaker Socks"; f[2]="4067112303258"
    f[3]="Apparel & Accessories"; f[4]="Clothing~~Underwear & Socks~~Underwear"
    f[5]="https://click.linksynergy.com/link?id=jZNkkinrr1k&offerid=578449.43322"
    f[6]="https://www.vilebrequin.com/dw/image/x.jpg"
    f[8]="Short desc"; f[9]="Long desc"
    f[10]="39"; f[11]="amount"; f[12]="0.00"; f[13]="39.00"
    f[16]="Vilebrequin"; f[19]="SK3B8138"; f[20]="Vilebrequin"
    f[22]="in-stock"; f[23]="4067112303258"; f[24]="60"; f[25]="USD"
    f[28]="SK3B8138"; f[29]="Accessories > Socks"; f[30]="43-44"
    f[31]="70% organic cotton"; f[32]="Blue"; f[33]="Male"; f[34]="printed"; f[35]="Adult"
    for k, v in over.items():
        f[int(k[1:])] = v
    return "|".join(f)

print("PART 1 — the header and trailer wrapper (breaks every feed if missed)")
d, why = parse_line("HDR|43322|Vilebrequin US|04/09/2026 19:04:22", "43322")
ok("HDR line is skipped as a header", d is None and why == "header", f"got {why}")
d, why = parse_line("TRL|528", "43322")
ok("2-column trailer is skipped", d is None and why == "trailer", f"got {why}")
d, why = parse_line("", "43322")
ok("blank line is skipped", d is None and why == "blank", f"got {why}")
d, why = parse_line("a|b|c|d|e|f|g|h|i|j", "43322")
ok("a wrong-width row is malformed, not silently parsed", d is None and why == "malformed", f"got {why}")

print()
print("PART 2 — THE DVF TRAP. Blank gender must be KEPT.")
d, why = parse_line(row(c33=""), "53590")
ok("blank gender is KEPT (DVF's whole catalog depends on it)", d is not None, f"dropped as {why}")
d, why = parse_line(row(c33="Male"), "43322")
ok("Male is dropped", d is None and why == "menswear", f"got {why}")
d, why = parse_line(row(c33="Female"), "50739")
ok("Female is kept", d is not None, f"dropped as {why}")
d, why = parse_line(row(c33="Unisex"), "43322")
ok("Unisex is kept", d is not None, f"dropped as {why}")
d, why = parse_line(row(c33="MALE"), "43322")
ok("gender match is case-insensitive", d is None and why == "menswear", f"got {why}")

print()
print("PART 3 — children's items (real: a girls' swimsuit in Vilebrequin's feed)")
d, why = parse_line(row(c33="Female", c35="Kids"), "43322")
ok("Kids is dropped even when Female", d is None and why == "kids", f"got {why}")
d, why = parse_line(row(c33="Female", c35=""), "43322")
ok("blank age group is kept", d is not None, f"dropped as {why}")
d, why = parse_line(row(c33="Female", c35="Adult"), "43322")
ok("Adult is kept", d is not None, f"dropped as {why}")

print()
print("PART 4 — stock and link sanity")
d, why = parse_line(row(c33="Female", c22="out-of-stock"), "43322")
ok("out-of-stock is dropped", d is None and why == "out-of-stock", f"got {why}")
d, why = parse_line(row(c33="Female", c22=""), "43322")
ok("blank availability is kept", d is not None, f"dropped as {why}")
d, why = parse_line(row(c33="Female", c5="not-a-url"), "43322")
ok("a row with no usable link is dropped", d is None and why == "no-url", f"got {why}")

print()
print("PART 5 — the fields the app will actually read")
d, _ = parse_line(row(c33="Female"), "43322")
ok("store name resolves from the MID", d["store"] == "Vilebrequin", d["store"])
ok("affiliate id survives verbatim in the url", "jZNkkinrr1k" in d["url"])
ok("price parses as a number", d["price"] == 39.0, d["price"])
ok("list price is kept", d["list_price"] == 39.0, d["list_price"])
ok("not flagged on sale when the discount is 0.00", d["on_sale"] is False)
# THE FOUR-STORE BUG: Olivela, Marissa, Mytheresa and Fleur du Mal leave column 10 blank
# and put the number in column 13. Reading column 10 alone loses their prices silently.
d3, _ = parse_line(row(c33="Female", c10="", c13="295.00"), "43172")
ok("price resolves when ONLY column 13 is filled (4 of 7 stores)", d3["price"] == 295.0, d3["price"])
# And her standing rule: show the REGULAR price, never the sale price.
d4, _ = parse_line(row(c33="Female", c10="200.00", c12="50.00", c13="150.00"), "43172")
# HER DECISION 2026-09-05: feed products show the CURRENT price, markdown or not,
# because a nightly feed cannot go stale the way the hand-maintained Edit can.
ok("a discounted item shows the CURRENT price", d4["price"] == 150.0, d4["price"])
ok("the original is kept for the crossed-out price", d4["list_price"] == 200.0, d4["list_price"])
ok("and the markdown is flagged", d4["on_sale"] is True)
ok("parent sku is captured (the per-size grouping key)", d4["parent_sku"] == "SK3B8138", d4["parent_sku"])
ok("size is read", d["size"] == "43-44", d["size"])
ok("color is read", d["color"] == "Blue", d["color"])
ok("image url is read", d["image_url"].startswith("https://"), d["image_url"])
ok("the ~~ taxonomy is made readable",
   d["category_secondary"] == "Clothing > Underwear & Socks > Underwear", d["category_secondary"])
d2, _ = parse_line(row(c33="Female", c10="", c13=""), "43322")
ok("a priceless row still parses, price just absent", d2 is not None and d2["price"] is None)

print()
print("PART 7 — THE NAME LEAK. Cath found this on her own Tops shelf 2026-09-06.")
# "Vilebrequin - Men Wool Shirt ... - Size M" reached a shelf for women because its
# gender COLUMN was blank/Unisex while its NAME said Men. The column rule was right
# and stays; nothing had ever read the name.
# ⚠️ The four "must be KEPT" cases below are the whole reason for word boundaries:
#    "Women's" contains "men" and "Female" contains "male". An unanchored match here
#    empties the womenswear catalog exactly as a Female-only gender rule would have
#    emptied DVF. Do not loosen these without re-reading PART 2.
_MENS_LEAK = [
    ("Vilebrequin - Men Wool Shirt Micro Rayures Tailoring - Shirt - Cool - Blue - Size M",
     "her actual card, gender column blank"),
    ("Men's Linen Shirt", "apostrophe form"),
    ("Mens Swim Trunk", "no apostrophe"),
    ("Vilebrequin Homme Maillot", "French, this merchant names in it"),
]
for _n, _note in _MENS_LEAK:
    _k, _w = keep_row("", "Adult", "in-stock", _n)
    ok(f"menswear name dropped ({_note})", _k is False and _w == "menswear-name", f"got {_k}/{_w}")
    _k2, _w2 = keep_row("Unisex", "Adult", "in-stock", _n)
    ok(f"...and when the column says Unisex ({_note})", _k2 is False, f"got {_k2}/{_w2}")

_KEEP = [
    ("Theory Women's Slub Cotton Tiny Crewneck T-Shirt in Red", "'Women's' CONTAINS 'men'"),
    ("Womens Ribbed Tank", "'Womens' contains 'mens'"),
    ("Women Silk Blouse", "bare 'Women'"),
    ("Female Fit Legging", "'Female' CONTAINS 'male'"),
    ("Diane von Furstenberg Wrap Dress", "the DVF blank-gender store"),
    ("Menswear-Inspired Wool Blazer", "a WOMENSWEAR descriptor"),
    ("The Boyfriend Jean", "a WOMENSWEAR descriptor"),
    ("Cotton Boy Shorts", "women's underwear"),
    ("Women's Tuxedo - Menswear Cut", "her side of the name wins"),
    ("Plain Silk Camisole", "says nothing either way"),
]
for _n, _note in _KEEP:
    _k, _w = keep_row("", "Adult", "in-stock", _n)
    ok(f"KEPT: {_note}", _k is True, f"dropped as {_w}: {_n}")

# The column still decides on its own, and the name never rescues a labelled row.
_k, _w = keep_row("Male", "Adult", "in-stock", "Women's Silk Blouse")
ok("a row LABELLED Male is dropped whatever its name says", _k is False and _w == "menswear")
# And a row with no name at all is unchanged by any of this.
_k, _w = keep_row("", "Adult", "in-stock", "")
ok("an empty name changes nothing", _k is True)

print()
print("PART 6 — the build set")
ok("Etsy is NOT in the first build (5GB outlier)", "54027" not in BUILD_MIDS)
ok("the other seven are", len(BUILD_MIDS) == 7 and all(m in MID_TO_STORE for m in BUILD_MIDS))

print()
print(f"{P[0]-len(F)} passed, {len(F)} failed")
sys.exit(1 if F else 0)
