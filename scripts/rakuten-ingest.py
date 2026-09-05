#!/usr/bin/env python3
"""
Rakuten Product Catalog — ingest the seven approved stores.

DRY RUN BY DEFAULT. With DRY_RUN unset it will (later) write to Supabase; today it
downloads, parses, filters and REPORTS, so the real shape of all seven catalogs is known
before a database table is designed around a guess. That ordering is deliberate: this
project's expensive mistakes have come from building against an assumed shape.

Rakuten's stated operating limits, baked in and not to be "optimised" away:
  * BINARY transfer mode -- they warn ASCII silently CORRUPTS the gzip rather than
    failing loudly, which is the worst kind of bug.
  * NEVER more than five concurrent connections. This opens exactly ONE, serially.
Nothing is written into this public repo: an affiliate approval lets the APP use a
retailer's catalog, it does not let us republish it.
"""
import os, sys, gzip, ftplib, tempfile, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rakuten_feed import parse_line, MID_TO_STORE, BUILD_MIDS

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")
DRY_RUN = os.environ.get("DRY_RUN", "1") != "0"

def log(m=""):
    print(m, flush=True)

def redact(t):
    return t.replace(PASSWORD, "***") if PASSWORD and PASSWORD in t else t

def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f}{u}"
        n /= 1024.0
    return f"{n:.1f}TB"

def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD not set."); return 1

    ftp = ftplib.FTP()
    try:
        ftp.connect(HOST, 21, timeout=120)
        ftp.login(USER, PASSWORD)
        ftp.set_pasv(True)
    except ftplib.all_errors as e:
        log(f"FAIL: could not connect: {redact(str(e))}"); return 1
    log(f"connected: {ftp.getwelcome()}")
    log(f"mode: {'DRY RUN (reporting only, nothing written)' if DRY_RUN else 'WRITE'}")

    grand = collections.Counter()
    per_store = []

    for mid in BUILD_MIDS:
        store = MID_TO_STORE[mid]
        fname = f"{mid}_{SID}_mp.txt.gz"
        log()
        log("=" * 70)
        log(f"{store}  (MID {mid})")
        log("=" * 70)

        # Download to a temp file, then stream-parse it. Mytheresa's 23MB compresses
        # about 8x, so holding the whole thing decoded in memory is wasteful and scales
        # badly as more stores are approved.
        tmp = tempfile.NamedTemporaryFile(suffix=".gz", delete=False)
        try:
            ftp.voidcmd("TYPE I")          # BINARY. Non-negotiable, see module docstring.
            ftp.retrbinary(f"RETR {fname}", tmp.write, blocksize=1 << 16)
            tmp.close()
            log(f"  downloaded {human(os.path.getsize(tmp.name))}")

            reasons = collections.Counter()
            kept = 0
            no_image = no_price = 0
            seen_ids = set()
            dupes = 0
            samples = []
            # parent_sku -> what the FIRST row of that garment said, plus every size seen
            # and a set of the fields that DISAGREED across its rows. This is the whole
            # shape measurement: see the report block below for why it decides the table.
            parents = {}
            desc_chars = other_chars = 0
            sized_rows = 0

            with gzip.open(tmp.name, "rt", encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    rec, why = parse_line(line, mid)
                    if rec is None:
                        reasons[why] += 1
                        continue
                    kept += 1
                    if not rec["image_url"]:
                        no_image += 1
                    if rec["price"] is None:
                        no_price += 1
                    if rec["product_id"] in seen_ids:
                        dupes += 1
                    else:
                        seen_ids.add(rec["product_id"])
                    if rec["size"]:
                        sized_rows += 1
                    desc_chars += len(rec["description"])
                    other_chars += sum(len(str(v)) for v in rec.values() if v is not None)
                    pk = rec["parent_sku"] or rec["product_id"]
                    par = parents.get(pk)
                    if par is None:
                        parents[pk] = {
                            "url": rec["url"], "img": rec["image_url"],
                            "price": rec["price"], "color": rec["color"],
                            "name": rec["name"], "sizes": {rec["size"]}, "diff": set(),
                        }
                    else:
                        if rec["url"] != par["url"]:
                            par["diff"].add("url")
                        if rec["image_url"] != par["img"]:
                            par["diff"].add("image")
                        if rec["price"] != par["price"]:
                            par["diff"].add("price")
                        if rec["color"] != par["color"]:
                            par["diff"].add("color")
                        if rec["name"] != par["name"]:
                            par["diff"].add("name")
                        par["sizes"].add(rec["size"])
                    if len(samples) < 2:
                        samples.append(rec)

            total = kept + sum(reasons.values())
            log(f"  {total:,} lines -> {kept:,} kept")
            for why, n in reasons.most_common():
                log(f"      dropped {n:>7,}  {why}")
            # The plan doc asks for a data-quality report per store on every sync, because
            # feed quality genuinely varies by merchant. This is it.
            # ⚠️ `kept` counts ROWS, and the feed carries one row PER SIZE. The number
            # that matters for what a woman actually sees on a shelf is the DISTINCT
            # PIECE count. Reporting only rows overstated the catalog badly (twice).
            pieces = len(parents)
            log(f"  => {pieces:,} distinct pieces ({kept/max(pieces,1):.1f} sizes each)")
            log(f"  quality: {no_image:,} without an image · {no_price:,} without a price"
                f" · {dupes:,} duplicate ids")
            for smp in samples:
                nm = smp["name"][:58]
                pr = f"${smp['price']:.0f}" if smp["price"] else "?"
                log(f"    e.g. {nm}  {pr}  {smp['color'] or '-'} / {smp['size'] or '-'}")

            # ---- SHAPE: the measurement the products table is designed against -------
            # The feed carries one row per SIZE. So the table can either keep every size
            # row (266k rows) or collapse each garment to ONE row with its sizes in an
            # array (78k rows). Collapsing is only honest if every size row of a garment
            # agrees on url, image, price, colour and name -- if sizes are priced
            # differently, or each size links to its own page, collapsing silently throws
            # that away. Nobody has measured it, so this counts it rather than assuming.
            multi = [x for x in parents.values() if len(x["sizes"] - {""}) > 1]
            log(f"  shape: {len(multi):,} of {pieces:,} pieces carry more than one size"
                f" · {sized_rows:,}/{kept:,} rows name a size")
            if multi:
                dis = collections.Counter()
                for x in multi:
                    for fld in x["diff"]:
                        dis[fld] += 1
                if dis:
                    log("         multi-size pieces whose rows DISAGREE on: " + " · ".join(
                        f"{fld} {n:,} ({n/len(multi)*100:.0f}%)" for fld, n in dis.most_common()))
                else:
                    log("         every multi-size piece agrees on url, image, price,"
                        " colour and name")
                big = max(multi, key=lambda x: len(x["sizes"]))
                log(f"         most sizes on one piece: {len(big['sizes'])}"
                    f"  ({', '.join(sorted(x for x in big['sizes'] if x)[:12])})")
            # Storage: descriptions are by far the largest field, and Supabase's free
            # tier is 500MB. Measure the split before deciding whether to store them.
            if kept:
                log(f"  bytes: description {desc_chars/1e6:.1f}MB of"
                    f" {other_chars/1e6:.1f}MB total"
                    f" · mean description {desc_chars/kept:.0f} chars")

            per_store.append((store, total, kept, pieces, no_price))
            grand["lines"] += total
            grand["kept"] += kept
            for why, n in reasons.items():
                grand[why] += n
        except Exception as e:
            log(f"  FAILED: {redact(str(e))}")
            per_store.append((store, 0, 0, 0, 0))
        finally:
            try:
                os.unlink(tmp.name)     # never leave feed data on disk
            except OSError:
                pass

    ftp.quit()

    log()
    log("=" * 70)
    log("TOTAL ACROSS THE SEVEN")
    log("=" * 70)
    log(f"  {'store':<24}{'lines':>10}{'kept rows':>11}{'PIECES':>10}{'share':>8}")
    tot_pieces = sum(p for _, _, _, p, _ in per_store) or 1
    for store, total, kept, pieces, np_ in per_store:
        log(f"  {store:<24}{total:>10,}{kept:>11,}{pieces:>10,}{pieces/tot_pieces*100:>7.1f}%")
    log(f"  {'':<24}{grand['lines']:>10,}{grand['kept']:>11,}{tot_pieces:>10,}")
    log()
    for why in ("menswear", "kids", "out-of-stock", "no-url", "malformed"):
        if grand[why]:
            log(f"  dropped {grand[why]:>8,}  {why}")
    log()
    log("Nothing was written to the repository.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
