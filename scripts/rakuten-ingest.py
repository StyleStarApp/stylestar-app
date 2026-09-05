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

            with gzip.open(tmp.name, "rt", encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    rec, why = parse_line(line, mid)
                    if rec is None:
                        reasons[why] += 1
                        continue
                    kept += 1
                    if not rec["image_url"]:
                        no_image += 1
                    if rec["price"] is None and rec["sale_price"] is None:
                        no_price += 1
                    if rec["product_id"] in seen_ids:
                        dupes += 1
                    else:
                        seen_ids.add(rec["product_id"])
                    if len(samples) < 2:
                        samples.append(rec)

            total = kept + sum(reasons.values())
            log(f"  {total:,} lines -> {kept:,} kept")
            for why, n in reasons.most_common():
                log(f"      dropped {n:>7,}  {why}")
            # The plan doc asks for a data-quality report per store on every sync, because
            # feed quality genuinely varies by merchant. This is it.
            log(f"  quality: {no_image:,} without an image · {no_price:,} without a price"
                f" · {dupes:,} duplicate ids")
            for s in samples:
                nm = s["name"][:58]
                pr = f"${s['price']:.0f}" if s["price"] else "?"
                log(f"    e.g. {nm}  {pr}  {s['color'] or '-'} / {s['size'] or '-'}")

            per_store.append((store, total, kept, no_image, no_price))
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
    log(f"  {'store':<24}{'lines':>10}{'kept':>10}{'no img':>9}{'no price':>10}")
    for store, total, kept, ni, np_ in per_store:
        log(f"  {store:<24}{total:>10,}{kept:>10,}{ni:>9,}{np_:>10,}")
    log(f"  {'':<24}{grand['lines']:>10,}{grand['kept']:>10,}")
    log()
    for why in ("menswear", "kids", "out-of-stock", "no-url", "malformed"):
        if grand[why]:
            log(f"  dropped {grand[why]:>8,}  {why}")
    log()
    log("Nothing was written to the repository.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
