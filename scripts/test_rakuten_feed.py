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
    """A realistic 38-column row; defaults mirror the real Vilebrequin sock row."""
    f = [""] * N_COLS
    f[0]="433224067112303258"; f[1]="Vilebrequin - Men Sneaker Socks"; f[2]="4067112303258"
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
print("PART 6 — the build set")
ok("Etsy is NOT in the first build (5GB outlier)", "54027" not in BUILD_MIDS)
ok("the other seven are", len(BUILD_MIDS) == 7 and all(m in MID_TO_STORE for m in BUILD_MIDS))

print()
print(f"{P[0]-len(F)} passed, {len(F)} failed")
sys.exit(1 if F else 0)
