#!/usr/bin/env python3
"""
Rakuten Product Catalog — ingest the seven approved stores into Supabase.

WRITES BY DEFAULT. Set DRY_RUN=1 to download, parse, filter and REPORT without
touching the database — which is how the real shape of all seven catalogs was
measured before db/products.sql was designed around it. That ordering was
deliberate: this project's expensive mistakes have come from building against an
assumed shape.

Rakuten's stated operating limits, baked in and not to be "optimised" away:
  * BINARY transfer mode -- they warn ASCII silently CORRUPTS the gzip rather than
    failing loudly, which is the worst kind of bug.
  * NEVER more than five concurrent connections. This opens exactly ONE, serially.
Nothing is written into this public repo: an affiliate approval lets the APP use a
retailer's catalog, it does not let us republish it.
"""
import os, sys, gzip, ftplib, tempfile, collections, time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rakuten_feed import parse_line, MID_TO_STORE, BUILD_MIDS
from supabase_io import Supabase, SupabaseError, eq, lt, like_prefix

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")
DRY_RUN = os.environ.get("DRY_RUN", "0") == "1"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# 🚨 'full' | 'delta', AND THIS DECIDES WHETHER THE SWEEP RUNS.
# A FULL feed carries the merchant's whole catalog, so anything in our table that
# the feed no longer mentions really is gone and should be swept.
# A DELTA feed carries ONLY WHAT CHANGED. Sweeping after a delta would read the
# other 99% of the catalog as "not in the feed" and DELETE THE WHOLE STORE.
# Today only full files are downloaded, so this is 'full' -- but the delta
# filenames are already in docs/product-feeds-plan.md and this is the one line
# that must move with them.
KIND = os.environ.get("FEED_KIND", "full")

# The sweep's dead-man's handle. If a full feed suddenly accounts for less than
# this share of what we already hold for a store, something is wrong with the
# FEED (a truncated download, a merchant glitch) far more often than the store
# has genuinely emptied -- so refuse to sweep and say so, rather than quietly
# deleting most of a catalog at 3am. Under-deleting is recoverable; over-deleting
# means a night of empty shelves.
SWEEP_KEEP_FLOOR = 0.60
# ...but proportion alone is the wrong test for a SMALL store. Vilebrequin carries
# 188 pieces against Mytheresa's 63,024, so a perfectly ordinary week of sold-out
# stock can be 40% of it -- and a brake that jams on a small store stays jammed
# every night after, needing hand surgery on the database to clear. So the brake
# needs BOTH: a big proportional loss AND a big absolute one. A few hundred rows
# is cheap to re-seed; tens of thousands is a night of empty shelves.
SWEEP_MIN_STALE = 500

def log(m=""):
    print(m, flush=True)

def redact(t):
    t = t.replace(PASSWORD, "***") if PASSWORD and PASSWORD in t else t
    return t.replace(SUPABASE_KEY, "***") if SUPABASE_KEY and SUPABASE_KEY in t else t

def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f}{u}"
        n /= 1024.0
    return f"{n:.1f}TB"


def piece_key(rec):
    """mid : parent_sku : lowercased colour.

    🚨 COLOUR IS PART OF THE KEY ON PURPOSE. Whether a merchant's parent_sku means
    "this style" or "this style in this colour" is not known and varies by
    merchant. Keying on parent_sku alone would, at a merchant who groups
    colourways, silently show ONE colour and hide the rest -- and colourways are
    exactly what a woman shopping wants to see. See db/products.sql.
    """
    pid = rec["parent_sku"] or rec["product_id"]
    return f"{rec['mid']}:{pid}:{(rec['color'] or '').strip().lower()}"


_NAME_TAIL = ("size", "sz")
_NAME_SEPS = " \t-\u2013\u2014,:;/|(["

def tidy_name(prefix, fallback):
    """Recover the garment's own name from the common prefix of its size rows.

    🚨 MEASURED 2026-09-05: Fleur du Mal bakes the size INTO the product name on
    646 of its 791 pieces -- "Collared Bodysuit with Dotted Tulle Black Size Small"
    vs "... Size Medium". The garment row keeps whichever size happened to come
    first in the file, so without this a shelf card would read "Size Small" as if
    that were part of the piece. It is not; it is the row's own size, which lives
    in product_sizes where it belongs.

    The common prefix of the size rows is the garment. ⚠️ It has to be cut back to
    a WORD BOUNDARY first: bra sizes 30A and 30B share the prefix "... Size 30",
    and stopping there would leave "Size 30" on the card, which is worse than the
    problem it fixes. Then trailing separators and a dangling "Size" come off.

    ▶ Falls back to the untouched first name whenever the prefix is implausibly
    short, because names can differ for reasons that are not a size suffix, and a
    truncated name is a worse failure than a slightly long one.
    """
    p = prefix
    # Cut back to a word boundary ONLY when the prefix really does stop in the
    # middle of a word ("... Size 30" out of "... Size 30A"). Cutting whenever it
    # merely fails to end in a space would truncate an honest shorter name --
    # "Silk Dress" beside "Silk Dress Long" would come back as "Silk".
    if (p and not p[-1].isspace() and " " in p
            and len(p) < len(fallback) and not fallback[len(p)].isspace()):
        p = p[:p.rfind(" ") + 1]
    for _ in range(3):
        p = p.rstrip(_NAME_SEPS)
        low = p.lower()
        for tail in _NAME_TAIL:
            if low.endswith(" " + tail):
                p = p[: -(len(tail) + 1)]
                break
        else:
            break
    p = p.strip()
    if len(p) >= 12 and len(p) >= 0.5 * len(fallback):
        return p
    return fallback


def product_row(rec, now):
    return {
        "piece_key": piece_key(rec),
        "mid": rec["mid"],
        "store": rec["store"],
        "parent_sku": rec["parent_sku"] or None,
        "name": rec["name"],
        "brand": rec["brand"] or None,
        "category_primary": rec["category_primary"] or None,
        "category_secondary": rec["category_secondary"] or None,
        "merchant_category": rec["merchant_category"] or None,
        # ⭐ Verbatim. Column 5 already carries her real publisher id, so this
        # string IS the commission attribution. Never rebuilt, never tidied.
        "url": rec["url"],
        "image_url": rec["image_url"] or None,
        "price": rec["price"],
        "list_price": rec["list_price"],
        "on_sale": bool(rec["on_sale"]),
        "currency": rec["currency"],
        "color": rec["color"] or None,
        "material": rec["material"] or None,
        "pattern": rec["pattern"] or None,
        "gender": rec["gender"] or None,
        "in_stock": True,        # the parser drops anything not in stock
        "updated_at": now,
    }


def size_row(rec, now):
    return {
        "product_id": rec["product_id"],
        "piece_key": piece_key(rec),
        "size": rec["size"] or None,
        "price": rec["price"],
        "in_stock": True,
        "updated_at": now,
    }


def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD not set."); return 1

    supa = None
    if not DRY_RUN:
        # Fail here rather than after downloading 40MB of feeds.
        try:
            supa = Supabase(SUPABASE_URL, SUPABASE_KEY, log=log)
        except SupabaseError as e:
            log(f"FAIL: {e}"); return 1
        if KIND not in ("full", "delta"):
            log(f"FAIL: FEED_KIND must be 'full' or 'delta', got {KIND!r}"); return 1

    now = datetime.now(timezone.utc).isoformat()

    ftp = ftplib.FTP()
    try:
        ftp.connect(HOST, 21, timeout=120)
        ftp.login(USER, PASSWORD)
        ftp.set_pasv(True)
    except ftplib.all_errors as e:
        log(f"FAIL: could not connect: {redact(str(e))}"); return 1
    log(f"connected: {ftp.getwelcome()}")
    log(f"mode: {'DRY RUN (reporting only, nothing written)' if DRY_RUN else f'WRITE ({KIND} feed)'}")
    log(f"run stamp: {now}")

    grand = collections.Counter()
    per_store = []
    failures = 0

    for mid in BUILD_MIDS:
        store = MID_TO_STORE[mid]
        fname = f"{mid}_{SID}_mp.txt.gz"
        started = time.time()
        log()
        log("=" * 70)
        log(f"{store}  (MID {mid})")
        log("=" * 70)

        # Download to a temp file, then stream-parse it TWICE. Mytheresa's 23MB
        # compresses about 8x, so holding the whole thing decoded in memory is
        # wasteful and scales badly as more stores are approved. Two cheap passes
        # over a local file beat one pass plus a 100MB list of size rows -- and
        # they have to be two passes anyway, because every garment must be
        # written before any of its sizes can reference it.
        tmp = tempfile.NamedTemporaryFile(suffix=".gz", delete=False)
        ok = True
        note = ""
        wrote_pieces = wrote_sizes = removed = removed_sizes = 0
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
            # piece_key -> the garment row we will write, plus every size seen and
            # the set of fields that DISAGREED across its rows. One dict serves the
            # write and the shape measurement; see the report block below.
            pieces = {}
            # One concrete before/after pair per disagreeing field. The counts alone
            # say a merchant's size rows differ; only an EXAMPLE says whether that
            # matters -- "same page, different size anchor" is harmless, "the size is
            # baked into the product NAME" would put "Size Small" on a shelf card.
            examples = {}
            desc_chars = other_chars = 0
            sized_rows = 0

            # ---------------- PASS 1: parse, measure, build the garments --------
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

                    pk = piece_key(rec)
                    par = pieces.get(pk)
                    if par is None:
                        row = product_row(rec, now)
                        row["_sizes"] = {rec["size"]}
                        row["_diff"] = set()
                        row["_np"] = rec["name"]     # shrinking common prefix
                        pieces[pk] = row
                    else:
                        def differs(fld, a, b):
                            if a == b:
                                return
                            par["_diff"].add(fld)
                            examples.setdefault(fld, (a, b))
                        differs("url", par["url"], rec["url"])
                        differs("image", par["image_url"], rec["image_url"] or None)
                        differs("price", par["price"], rec["price"])
                        differs("color", par["color"], rec["color"] or None)
                        differs("name", par["name"], rec["name"])
                        par["_sizes"].add(rec["size"])
                        # 🚨 THE GARMENT'S PRICE IS THE LOWEST OF ITS SIZES, because
                        # sizes really can be priced differently and a card that
                        # promises more than the cheapest size is a card that lies
                        # downward. The per-size prices are kept in full next door.
                        if rec["price"] is not None and (
                                par["price"] is None or rec["price"] < par["price"]):
                            par["price"] = rec["price"]
                            par["list_price"] = rec["list_price"]
                            par["on_sale"] = bool(rec["on_sale"])
                            # ⚠️ AND THE LINK AND PHOTO MOVE WITH IT. Merchants give
                            # each size its own product URL (Mytheresa: 100% of
                            # multi-size pieces, Fleur du Mal too), so a card showing
                            # the cheapest price while linking to a dearer size's page
                            # sends her somewhere that contradicts the card she tapped.
                            par["url"] = rec["url"]
                            if rec["image_url"]:
                                par["image_url"] = rec["image_url"]
                        if par["_np"] and rec["name"] != par["_np"]:
                            i = 0
                            a, b = par["_np"], rec["name"]
                            while i < len(a) and i < len(b) and a[i] == b[i]:
                                i += 1
                            par["_np"] = a[:i]
                    if len(samples) < 2:
                        samples.append(rec)

            tidied = 0
            for row in pieces.values():
                if "name" in row["_diff"]:
                    fixed = tidy_name(row.pop("_np"), row["name"])
                    if fixed != row["name"]:
                        row["name"] = fixed
                        tidied += 1
                else:
                    row.pop("_np", None)

            total = kept + sum(reasons.values())
            log(f"  {total:,} lines -> {kept:,} kept")
            for why, n in reasons.most_common():
                log(f"      dropped {n:>7,}  {why}")
            # The plan doc asks for a data-quality report per store on every sync,
            # because feed quality genuinely varies by merchant. This is it.
            # ⚠️ `kept` counts ROWS, and the feed carries one row PER SIZE. The number
            # that matters for what a woman actually sees on a shelf is the DISTINCT
            # PIECE count. Reporting only rows overstated the catalog badly (twice).
            n_pieces = len(pieces)
            log(f"  => {n_pieces:,} distinct pieces ({kept/max(n_pieces,1):.1f} sizes each)")
            log(f"  quality: {no_image:,} without an image · {no_price:,} without a price"
                f" · {dupes:,} duplicate ids")
            for smp in samples:
                nm = smp["name"][:58]
                pr = f"${smp['price']:.0f}" if smp["price"] else "?"
                log(f"    e.g. {nm}  {pr}  {smp['color'] or '-'} / {smp['size'] or '-'}")

            # ---- SHAPE: the measurement the products table was designed against --
            # The feed carries one row per SIZE. The table splits that into a
            # garment row plus a sizes row, which is only honest if the size rows
            # of a garment agree on url, image, colour and name. They are counted
            # every run rather than assumed, so a merchant changing shape shows up.
            multi = [x for x in pieces.values() if len(x["_sizes"] - {""}) > 1]
            log(f"  shape: {len(multi):,} of {n_pieces:,} pieces carry more than one size"
                f" · {sized_rows:,}/{kept:,} rows name a size")
            if multi:
                dis = collections.Counter()
                for x in multi:
                    for fld in x["_diff"]:
                        dis[fld] += 1
                if dis:
                    log("         multi-size pieces whose rows DISAGREE on: " + " · ".join(
                        f"{fld} {n:,} ({n/len(multi)*100:.0f}%)" for fld, n in dis.most_common()))
                else:
                    log("         every multi-size piece agrees on url, image, price,"
                        " colour and name")
                big = max(multi, key=lambda x: len(x["_sizes"]))
                log(f"         most sizes on one piece: {len(big['_sizes'])}"
                    f"  ({', '.join(sorted(x for x in big['_sizes'] if x)[:12])})")
                for fld in ("name", "url", "price", "image", "color"):
                    if fld in examples:
                        a, b = examples[fld]
                        log(f"         {fld} e.g. {str(a)[:96]}")
                        log(f"         {fld}  vs {str(b)[:96]}")
            if tidied:
                log(f"  names: {tidied:,} garments had their size stripped out of the"
                    f" product name")
            if kept:
                log(f"  bytes: description {desc_chars/1e6:.1f}MB of"
                    f" {other_chars/1e6:.1f}MB total"
                    f" · mean description {desc_chars/kept:.0f} chars")

            # ---------------- WRITE -------------------------------------------
            if supa is not None:
                rows = []
                for row in pieces.values():
                    row.pop("_sizes", None)
                    row.pop("_diff", None)
                    rows.append(row)
                wrote_pieces = supa.upsert("products", rows, chunk=500)
                log(f"  wrote {wrote_pieces:,} garments")
                pieces.clear(); rows = None      # the sizes pass needs the memory

                # PASS 2: sizes, streamed from the same local file so nothing large
                # is held. Garments are already in, so every reference resolves.
                buf = []
                with gzip.open(tmp.name, "rt", encoding="utf-8", errors="replace") as fh:
                    for line in fh:
                        rec, _why = parse_line(line, mid)
                        if rec is None:
                            continue
                        buf.append(size_row(rec, now))
                        if len(buf) >= 1000:
                            wrote_sizes += supa.upsert("product_sizes", buf, chunk=1000)
                            buf = []
                if buf:
                    wrote_sizes += supa.upsert("product_sizes", buf, chunk=1000)
                log(f"  wrote {wrote_sizes:,} sizes")

                removed, removed_sizes, note = sweep(supa, store, mid, now)

        except Exception as e:
            ok = False
            note = redact(str(e))[:400]
            failures += 1
            log(f"  FAILED: {note}")
            total = kept = n_pieces = no_price = no_image = 0
            reasons = collections.Counter()
        finally:
            try:
                os.unlink(tmp.name)     # never leave feed data on disk
            except OSError:
                pass

        seconds = round(time.time() - started, 1)
        per_store.append((store, total, kept, n_pieces, ok))
        if ok:
            grand["lines"] += total
            grand["kept"] += kept
            for why, n in reasons.items():
                grand[why] += n

        # A durable record of every run, so "refreshed nightly" is checkable
        # rather than a claim. Never let bookkeeping fail the ingest itself.
        if supa is not None:
            try:
                supa.upsert("product_syncs", [{
                    "run_at": now, "store": store, "mid": mid, "kind": KIND, "ok": ok,
                    "feed_lines": total, "rows_kept": kept, "pieces": n_pieces,
                    "rows_written": wrote_pieces + wrote_sizes,
                    "rows_removed": removed + removed_sizes,
                    "dropped_male": reasons.get("menswear", 0),
                    "dropped_kids": reasons.get("kids", 0),
                    "no_price": no_price, "no_image": no_image,
                    "seconds": seconds, "note": note or None,
                }])
            except Exception as e:
                log(f"  (could not record the sync row: {redact(str(e))[:200]})")

    ftp.quit()

    log()
    log("=" * 70)
    log("TOTAL ACROSS THE SEVEN")
    log("=" * 70)
    log(f"  {'store':<24}{'lines':>10}{'kept rows':>11}{'PIECES':>10}{'share':>8}")
    tot_pieces = sum(p for _, _, _, p, _ in per_store) or 1
    for store, total, kept, n_pieces, ok in per_store:
        mark = "" if ok else "   FAILED"
        log(f"  {store:<24}{total:>10,}{kept:>11,}{n_pieces:>10,}"
            f"{n_pieces/tot_pieces*100:>7.1f}%{mark}")
    log(f"  {'':<24}{grand['lines']:>10,}{grand['kept']:>11,}{tot_pieces:>10,}")
    log()
    for why in ("menswear", "kids", "out-of-stock", "no-url", "malformed"):
        if grand[why]:
            log(f"  dropped {grand[why]:>8,}  {why}")
    log()
    log("No feed data was written into the repository — only into Supabase.")
    # A store that failed must fail the job, or a silently half-empty catalog
    # looks exactly like a healthy one in the Actions list.
    return 1 if failures else 0


def sweep(supa, store, mid, now):
    """Remove what this store's feed no longer carries. Returns (pieces, sizes, note)."""
    if KIND != "full":
        return 0, 0, "delta feed: sweep skipped by design"

    stale_f = [eq("store", store), lt("updated_at", now)]
    stale = supa.count("products", stale_f)
    total = supa.count("products", [eq("store", store)])
    fresh = total - stale
    if stale >= SWEEP_MIN_STALE and total and fresh / total < SWEEP_KEEP_FLOOR:
        msg = (f"SWEEP REFUSED: this feed accounts for only {fresh:,} of {total:,} rows"
               f" ({fresh/total*100:.0f}%). Left in place — check the feed.")
        log(f"  ⚠️ {msg}")
        return 0, 0, msg

    # ⚠️ NOT an early return when `stale` is 0. A garment can keep selling while ONE
    # of its sizes stops -- so the size sweep below has to run even on a night when
    # no whole garment disappeared. Returning early here silently left sold-out
    # sizes on the shelf, which is the exact promise this table exists to keep.
    removed = supa.delete("products", stale_f) if stale else 0
    # Sizes of a deleted garment go with it (on delete cascade). This second sweep
    # is for the other case: the garment is still sold, but one size is not.
    removed_sizes = supa.delete("product_sizes",
                                [like_prefix("piece_key", f"{mid}:"), lt("updated_at", now)])
    if removed or removed_sizes:
        log(f"  swept {removed:,} garments and {removed_sizes:,} sizes"
            f" the feed no longer carries")
    return removed, removed_sizes, ""


if __name__ == "__main__":
    sys.exit(main())
