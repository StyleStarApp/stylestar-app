"""
Rakuten Product Catalog feed parser + womenswear filter.

Every fact encoded here was MEASURED against the real feeds on 2026-09-05 by
scripts/rakuten-format.py, not taken from documentation. Rakuten's publisher-side
format is not documented anywhere this project can read: their guidelines PDF is behind
a Cloudflare wall, and the public spec on rakutenadvertising.com is the ADVERTISER-side
upload format, which is a different thing.

THE FORMAT: pipe-delimited, gzip, no quoting, 38 positional columns, NO COLUMN-NAME ROW.
⚠️ Each file is wrapped in a HEADER and a TRAILER record and BOTH must be skipped.
   Line 1 is `HDR|MID|Merchant Name|MM/DD/YYYY HH:MM:SS`; the last line is a short
   trailer. Measured column counts across every row come back as {2, 38} -- so a parser
   that assumes 38 fields breaks on the first and last line of every single feed.
"""

import re

# --- confirmed column positions (see the field map in docs/product-feeds-plan.md) ---
C_ID, C_NAME, C_GTIN = 0, 1, 2
C_CAT1, C_CAT2 = 3, 4
C_URL, C_IMAGE = 5, 6            # C_URL already carries her affiliate id -- see below
C_DESC_SHORT, C_DESC_LONG = 8, 9
C_PRICE, C_DISCOUNT_AMT, C_SALE_PRICE = 10, 12, 13
C_BRAND, C_SKU = 16, 19
C_AVAILABILITY, C_CURRENCY = 22, 25
C_PARENT_SKU, C_MERCHANT_CAT = 28, 29
C_SIZE, C_MATERIAL, C_COLOR = 30, 31, 32
C_GENDER, C_PATTERN, C_AGE = 33, 34, 35
N_COLS = 38

# MID -> the EXACT key in the app's own STORES table (index.html), so catalog rows can be
# joined to Cath's own store tags. Verified against index.html on 2026-09-05.
# ⚠️ Vilebrequin has NO StORES key on purpose: it was removed 2026-08-21 because the
#    store's own search returns FALSE NEGATIVES (it told her they had no cover-up dresses
#    when they do). It stayed in _AFF_MID so its Edit item still earns. A FEED does not
#    use their search at all, so that objection may no longer apply -- but re-adding a
#    store to that table is HER curation call, never ours. Rows are ingested meanwhile.
MID_TO_STORE = {
    "44912": "FARM Rio",
    "53590": "Diane von Furstenberg",
    "43322": "Vilebrequin",           # not currently a STORES key -- see note above
    "50334": "Olivela",
    "36537": "Marissa Collections",
    "43172": "Mytheresa",
    "50739": "Fleur du Mal",
    "54027": "Etsy",                  # deliberately NOT ingested yet: 5GB, see plan doc
}

# The seven the first build ingests. Etsy is excluded because its feed is 5GB -- 200x the
# next largest store, with a 1GB delta -- and it is a marketplace of millions of
# independent-seller listings rather than a curated store. Its own problem, later.
BUILD_MIDS = ["44912", "53590", "43322", "50334", "36537", "43172", "50739"]


def _clean(v):
    return (v or "").strip()


def _money(v):
    """Feed prices are plain decimals ('39', '39.00'). Anything else is not a price."""
    v = _clean(v).replace("$", "").replace(",", "")
    if not v:
        return None
    try:
        f = float(v)
    except ValueError:
        return None
    return f if f > 0 else None


# Menswear markers in a product NAME, word-boundary anchored. `(?:'?s)?` catches
# "Men", "Men's" and "Mens" in one; "Homme" is Vilebrequin's French naming.
_MENS_NAME = re.compile(r"\b(?:men|homme|male|gentlemen)(?:'?s)?\b", re.I)
# Her side of the same coin: a name that says women outranks one that says men.
_WOMENS_NAME = re.compile(r"\b(?:women|femme|female|ladies|lady)(?:'?s)?\b", re.I)


def keep_row(gender, age_group, availability, name=""):
    """
    Should this product reach a woman using Style Star?

    🚨 THE TRAP THIS ENCODES, measured 2026-09-05 and it would have been silent:
    the obvious rule is "keep gender == Female". Applied to the real feeds that DELETES
    DIANE VON FURSTENBERG ENTIRELY -- all 2,873 rows, a womenswear house -- because DVF
    leaves the gender column BLANK on every single row. Nothing would have looked broken.
    Vilebrequin meanwhile is 301 Male / 156 Female / 70 Unisex, so the column is real and
    does carry signal where merchants fill it in.
    ▶ So the rule is DROP WHAT IS MARKED MALE, not KEEP WHAT IS MARKED FEMALE.
      Blank means "the merchant did not say", never "not for women".

    Same shape for age: Vilebrequin's feed carries `Kids` rows (a girls' swimsuit was in
    the first three sampled). Style Star is for adult women, so Kids is dropped and blank
    is kept.

    🚨 THE LEAK THAT RULE LEFT, and Cath found it on her own Tops shelf 2026-09-06:
    "Vilebrequin - Men Wool Shirt ... - Size M", a MENSWEAR shirt, on a shelf for women.
    ▶ The gender rule above is right and stays. But it only drops what the merchant
      LABELLED, and this row's gender column was blank or Unisex while its own NAME said
      Men. 341 of Vilebrequin's 529 rows were dropped correctly; this was in the 188 that
      were not, and nothing ever read the name.
    ⚠️ THE SAME INVERSION APPLIES HERE, for the same reason: a name that says MEN is
      dropped; a name that says nothing is kept. Never "keep only names that say women" --
      most womenswear names do not say "women" at all, and that whitelist would empty the
      catalog exactly the way the Female-only gender rule would have emptied DVF.
    ⚠️ WORD BOUNDARIES ARE LOAD-BEARING, not tidiness: "Women's" contains "men" and
      "Female" contains "male" as plain substrings. An unanchored match deletes the entire
      womenswear catalog. The tests pin both by name.
    ⚠️ AND A NAME SAYING WOMEN WINS. "Women's Tuxedo - Menswear Cut" is womenswear that
      mentions men; her side of the name is the answer.
    ▶ DELIBERATELY NOT MATCHED: "menswear" and "boyfriend" as words -- both are ordinary
      WOMENSWEAR style descriptors ("menswear-inspired blazer", "boyfriend jean"), and
      "boy shorts" is women's underwear. Dropping those would cost her real pieces.
    """
    g = _clean(gender).lower()
    if g in ("male", "men", "mens", "man"):
        return False, "menswear"
    a = _clean(age_group).lower()
    if a in ("kids", "kid", "child", "children", "toddler", "infant", "baby", "newborn"):
        return False, "kids"
    # The name guard. Only consulted when the gender column did not already answer.
    n = _clean(name)
    if n and _MENS_NAME.search(n) and not _WOMENS_NAME.search(n):
        return False, "menswear-name"
    av = _clean(availability).lower()
    if av and av not in ("in-stock", "in stock", "instock", "available"):
        return False, "out-of-stock"
    return True, None


def parse_line(line, mid):
    """One feed line -> a normalized dict, or (None, reason) if it is not a product."""
    if not line or not line.strip():
        return None, "blank"
    f = line.rstrip("\n").split("|")

    # The HDR/TRL wrapper. Measured: these are the only non-38-column rows.
    if len(f) != N_COLS:
        if f and f[0] == "HDR":
            return None, "header"
        if len(f) <= 3:
            return None, "trailer"
        return None, "malformed"

    keep, why = keep_row(f[C_GENDER], f[C_AGE], f[C_AVAILABILITY], f[C_NAME])
    if not keep:
        return None, why

    # 🚨 THE PRICE COLUMNS ARE USED INCONSISTENTLY ACROSS MERCHANTS, measured 2026-09-05.
    # Vilebrequin and FARM Rio fill column 10 (list). Olivela, Marissa Collections,
    # Mytheresa and Fleur du Mal leave column 10 EMPTY and put the number in column 13.
    # So reading column 10 alone yields NO PRICE for four of the seven stores -- and it
    # does so quietly, which is exactly the silent-failure shape this project keeps
    # getting bitten by. Always resolve through `price`, never a raw column.
    list_price = _money(f[C_PRICE])          # regular/list price, often blank
    current = _money(f[C_SALE_PRICE])        # what it costs today; the reliable one
    discount = _money(f[C_DISCOUNT_AMT]) or 0.0
    on_sale = bool(discount > 0 and list_price and current and current < list_price)
    # ⚠️ HER DECISION, 2026-09-05, AND IT SUPERSEDES THE EDIT'S REGULAR-PRICE RULE *HERE
    # ONLY*: feed products show the CURRENT price, markdown or not.
    # The regular-price rule (2026-07-26) exists because the STYLE STAR EDIT IS
    # HAND-MAINTAINED AND EVERGREEN -- a sale price typed into it once sits there for
    # months and goes stale. A feed refreshes nightly, so "current" really is current and
    # the reason for the rule evaporates. ▶ Two mechanisms, two rules, each tracking its
    # own reason. THE EDIT KEEPS THE REGULAR-PRICE RULE; do not "unify" them.
    # `list_price` is kept so a marked-down card can show the crossed-out original beside
    # the new price -- her call: "shoppers love that."
    price = current or list_price
    url = _clean(f[C_URL])
    if not url.startswith("http"):
        return None, "no-url"

    return {
        "mid": mid,
        "store": MID_TO_STORE.get(mid, mid),
        "product_id": _clean(f[C_ID]),
        "name": _clean(f[C_NAME]),
        "brand": _clean(f[C_BRAND]),
        "category_primary": _clean(f[C_CAT1]),
        # The feed separates the taxonomy levels with '~~'. Store it readably.
        "category_secondary": " > ".join(x.strip() for x in _clean(f[C_CAT2]).split("~~") if x.strip()),
        "merchant_category": _clean(f[C_MERCHANT_CAT]),
        # ⭐ Column 5 ALREADY carries her real publisher id (jZNkkinrr1k), byte-identical
        # to the one in the app's _AFF_MID. So a feed product EARNS the moment it is
        # shown. Use it verbatim: do NOT pass it through _affUrl and do NOT rebuild it.
        "url": url,
        "image_url": _clean(f[C_IMAGE]),
        "description": _clean(f[C_DESC_LONG]) or _clean(f[C_DESC_SHORT]),
        "price": price,               # the one to display -- see the rule above
        "list_price": list_price,
        "current_price": current,
        "on_sale": on_sale,
        "currency": _clean(f[C_CURRENCY]) or "USD",
        "size": _clean(f[C_SIZE]),
        "color": _clean(f[C_COLOR]),
        "material": _clean(f[C_MATERIAL]),
        "pattern": _clean(f[C_PATTERN]),
        "gender": _clean(f[C_GENDER]),
        "age_group": _clean(f[C_AGE]),
        "sku": _clean(f[C_SKU]),
        # The feed carries ONE ROW PER SIZE, so the same garment appears many times.
        # Column 28 is the parent SKU shared by every size of a piece: it is the grouping
        # key that stops a shelf showing the same t-shirt six times, and it is what makes
        # an honest "in your size" possible. See the distinct-product counts in the plan.
        "parent_sku": _clean(f[C_PARENT_SKU]),
        "gtin": _clean(f[C_GTIN]),
        "in_stock": True,
    }, None
