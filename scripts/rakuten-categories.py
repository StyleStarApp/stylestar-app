#!/usr/bin/env python3
"""
Rakuten Product Catalog -- what vocabulary do the seven catalogs actually use?

READ-ONLY. Downloads the feeds, parses them, and prints the taxonomy. Touches no
database and writes nothing anywhere. Run it by hand from Actions.

⭐ WHY THIS EXISTS BEFORE THE MATCHING IS WRITTEN. Style Star's shelves are her
own 100-row checklist ("Blue jeans", "Professional blouses", "Belted trench").
The feed knows nothing about those rows -- it knows each merchant's OWN
taxonomy. So every garment has to be matched to a row, and the only honest way
to design that matching is to read the words the merchants really use first.
This project's expensive mistakes have all come from building against an
assumed shape: the gender filter that would have deleted DVF, the price column
that was empty at four stores, the size baked into a product name. Measure, then
build.

What it prints, per store and pooled:
  * category_primary   -- the feed's own top level (column 3)
  * category_secondary -- the feed's '~~' taxonomy (column 4)
  * merchant_category  -- the merchant's own breadcrumb (column 29)
  * colour, material and pattern vocabularies, with how often each is EMPTY
An empty column is as important a finding as a busy one: a filter written
against a column that four merchants leave blank fails silently, which is the
exact shape of every bad bug this pipeline has had.
"""
import os, sys, gzip, ftplib, tempfile, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rakuten_feed import parse_line, MID_TO_STORE, BUILD_MIDS

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")
TOP = int(os.environ.get("TOP", "30"))

def log(m=""):
    print(m, flush=True)

def redact(t):
    return t.replace(PASSWORD, "***") if PASSWORD and PASSWORD in t else t

def show(title, counter, blank, total, top=None):
    top = top or TOP
    distinct = len(counter)
    filled = total - blank
    pct = (100.0 * blank / total) if total else 0
    log(f"  {title}: {distinct:,} distinct · {blank:,} blank ({pct:.0f}%)")
    if not filled:
        # 🚨 A column every merchant leaves empty is a filter that cannot work.
        log("      ⚠️ EMPTY AT THIS STORE — nothing can be matched on it here")
        return
    for v, n in counter.most_common(top):
        log(f"      {n:>7,}  {v[:88]}")
    if distinct > top:
        log(f"      … and {distinct - top:,} more")

def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD is not set"); return 1
    try:
        ftp = ftplib.FTP(HOST, timeout=180)
        ftp.login(USER, PASSWORD)
        ftp.set_pasv(True)
    except ftplib.all_errors as e:
        log(f"FAIL: could not connect: {redact(str(e))}"); return 1
    log(f"connected: {ftp.getwelcome()}")

    pooled = {k: collections.Counter() for k in
              ("category_primary", "category_secondary", "merchant_category",
               "color", "material", "pattern")}
    pooled_blank = collections.Counter()
    pooled_total = 0
    failures = 0

    for mid in BUILD_MIDS:
        store = MID_TO_STORE[mid]
        log(); log("=" * 78); log(f"{store}  (MID {mid})"); log("=" * 78)
        tmp = tempfile.NamedTemporaryFile(suffix=".gz", delete=False)
        try:
            ftp.voidcmd("TYPE I")
            ftp.retrbinary(f"RETR {mid}_{SID}_mp.txt.gz", tmp.write, blocksize=1 << 16)
            tmp.close()
            cols = {k: collections.Counter() for k in pooled}
            blank = collections.Counter()
            # One row per SIZE, so count DISTINCT GARMENTS -- counting rows would
            # weight a piece that comes in ten sizes ten times and quietly skew
            # every vocabulary below toward whatever the deep-sized pieces are.
            seen = set()
            n = 0
            with gzip.open(tmp.name, "rt", encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    rec, _ = parse_line(line, mid)
                    if rec is None:
                        continue
                    pid = rec["parent_sku"] or rec["product_id"]
                    key = f"{pid}:{(rec['color'] or '').strip().lower()}"
                    if key in seen:
                        continue
                    seen.add(key)
                    n += 1
                    for k in cols:
                        v = (rec.get(k) or "").strip()
                        if v:
                            cols[k][v] += 1
                            pooled[k][v] += 1
                        else:
                            blank[k] += 1
                            pooled_blank[k] += 1
            pooled_total += n
            log(f"  {n:,} distinct garments")
            for k in ("category_primary", "category_secondary", "merchant_category",
                      "color", "material", "pattern"):
                log()
                show(k, cols[k], blank[k], n)
        except Exception as e:
            failures += 1
            log(f"  FAIL: {redact(str(e))}")
        finally:
            try: os.unlink(tmp.name)
            except OSError: pass

    log(); log("=" * 78); log(f"POOLED ACROSS ALL SEVEN ({pooled_total:,} garments)"); log("=" * 78)
    for k in ("category_primary", "category_secondary", "merchant_category",
              "color", "material", "pattern"):
        log()
        show(k, pooled[k], pooled_blank[k], pooled_total, top=60)

    try: ftp.quit()
    except ftplib.all_errors: pass
    log(); log("Read only. Nothing was written to the database or the repository.")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main())
