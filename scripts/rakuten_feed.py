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

# --- confirmed column positions (see the field map in docs/product-feeds-plan.md) ---
C_ID, C_NAME, C_GTIN = 0, 1, 2
C_CAT1, C_CAT2 = 3, 4
C_URL, C_IMAGE = 5, 6            # C_URL already carries her affiliate id -- see below
C_DESC_SHORT, C_DESC_LONG = 8, 9
C_PRICE, C_DISCOUNT_AMT, C_SALE_PRICE = 10, 12, 13
C_BRAND, C_SKU = 16, 19
C_AVAILABILITY, C_CURRENCY = 22, 25
C_MERCHANT_CAT = 29
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


def keep_row(gender, age_group, availability):
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
    """
    g = _clean(gender).lower()
    if g in ("male", "men", "mens", "man"):
        return False, "menswear"
    a = _clean(age_group).lower()
    if a in ("kids", "kid", "child", "children", "toddler", "infant", "baby", "newborn"):
        return False, "kids"
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

    keep, why = keep_row(f[C_GENDER], f[C_AGE], f[C_AVAILABILITY])
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
    # ⚠️ CATH'S STANDING EDIT RULE (2026-07-26): SHOW THE REGULAR PRICE, NEVER THE SALE
    # PRICE. Sales expire, and arriving to find something cheaper than listed feels lucky
    # while the reverse feels misled -- only one of those is recoverable. So when a piece
    # really is discounted we surface the LIST price; otherwise the two agree anyway.
    price = (list_price if on_sale else (current or list_price))
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
        "gtin": _clean(f[C_GTIN]),
        "in_stock": True,
    }, None
