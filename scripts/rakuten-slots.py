#!/usr/bin/env python3
"""
Rakuten Product Catalog -- how well do the checklist rules actually match?

READ-ONLY. Downloads the seven feeds, applies data/slot-rules.json, and prints
what each of Catherine's 100 rows would hold. Touches no database and writes
nothing anywhere. Run it by hand from Actions.

⭐ WHY THIS RUNS BEFORE THE SHELF IS WIRED UP. A matching rule fails in two ways
and only one of them is visible: a row that matches NOTHING shows an empty
carousel, which somebody notices -- but a row that matches the WRONG THINGS
shows a full, confident, wrong carousel, which nobody notices until Cath opens
it on her phone. Measuring first is how a bad row gets caught by a number
instead of by her.

What it prints:
  * every row, its garment count, how many of the seven stores feed it, and
    three real sample names -- so a wrong rule is visible in the samples
  * the rows that match NOTHING, listed alone at the end where they cannot be
    scrolled past
  * the leftover pile: garments that matched no row at all, with samples, which
    is how a MISSING rule is found (an empty row shows what is broken; the
    leftovers show what is absent)
"""
import os, sys, gzip, ftplib, tempfile, collections, random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rakuten_feed import parse_line, MID_TO_STORE, BUILD_MIDS
from slot_match import load_rules, match

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")
SAMPLES = int(os.environ.get("SAMPLES", "3"))
LEFTOVERS = int(os.environ.get("LEFTOVERS", "40"))

def log(m=""):
    print(m, flush=True)

def redact(t):
    return t.replace(PASSWORD, "***") if PASSWORD and PASSWORD in t else t


def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD is not set"); return 1
    rules = load_rules()
    log(f"{len(rules)} checklist rows loaded from data/slot-rules.json")

    try:
        ftp = ftplib.FTP(HOST, timeout=180)
        ftp.login(USER, PASSWORD)
        ftp.set_pasv(True)
    except ftplib.all_errors as e:
        log(f"FAIL: could not connect: {redact(str(e))}"); return 1
    log(f"connected: {ftp.getwelcome()}")

    counts = collections.Counter()                       # slot -> garments
    stores = collections.defaultdict(set)                # slot -> {store}
    samples = collections.defaultdict(list)              # slot -> [names]
    per_store = collections.defaultdict(collections.Counter)
    matched = unmatched = total = 0
    leftovers = []
    rnd = random.Random(7)                               # stable across runs
    failures = 0

    for mid in BUILD_MIDS:
        store = MID_TO_STORE[mid]
        tmp = tempfile.NamedTemporaryFile(suffix=".gz", delete=False)
        try:
            ftp.voidcmd("TYPE I")
            ftp.retrbinary(f"RETR {mid}_{SID}_mp.txt.gz", tmp.write, blocksize=1 << 16)
            tmp.close()
            # One row per SIZE, so count DISTINCT GARMENTS. Counting rows would
            # weight a piece stocked in ten sizes ten times and make every
            # number below a measure of size depth rather than of coverage.
            seen = set()
            n = hit = 0
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
                    slots = match(rec, rules)
                    if slots:
                        hit += 1
                        for s in slots:
                            counts[s] += 1
                            stores[s].add(store)
                            per_store[s][store] += 1
                            # Reservoir sample: an honest spread across the whole
                            # file rather than whatever happened to be first,
                            # which at every merchant is one collection in a row.
                            bucket = samples[s]
                            if len(bucket) < SAMPLES:
                                bucket.append(rec["name"])
                            elif rnd.random() < SAMPLES / counts[s]:
                                bucket[rnd.randrange(SAMPLES)] = rec["name"]
                    else:
                        if len(leftovers) < LEFTOVERS * 4:
                            leftovers.append(f"{store}: {rec['name'][:70]}")
            total += n
            matched += hit
            unmatched += n - hit
            pct = (100.0 * hit / n) if n else 0
            log(f"  {store:<24} {n:>7,} garments · {hit:>7,} matched ({pct:.0f}%)")
        except Exception as e:
            failures += 1
            log(f"  {store:<24} FAIL: {redact(str(e))}")
        finally:
            try: os.unlink(tmp.name)
            except OSError: pass

    try: ftp.quit()
    except ftplib.all_errors: pass

    pct = (100.0 * matched / total) if total else 0
    log(); log("=" * 78)
    log(f"{total:,} distinct garments · {matched:,} landed on at least one row ({pct:.0f}%)")
    log("=" * 78)

    empty, thin = [], []
    for slot, r in sorted(rules.items(), key=lambda kv: -counts[kv[0]]):
        c = counts[slot]
        if c == 0:
            empty.append(slot); continue
        if c < 12:
            thin.append(slot)
        top = ", ".join(f"{s} {n:,}" for s, n in per_store[slot].most_common(3))
        log()
        log(f"  {slot:<5} {r['n']:<34} {c:>6,}  ({len(stores[slot])}/7 stores: {top})")
        for name in samples[slot]:
            log(f"          · {name[:80]}")

    # ⚠️ The two failures that matter, kept OUT of the long list above where they
    # would be scrolled past. An empty row is a broken rule; a thin one is a row
    # that will show one or two cards and look like a mistake to a woman using it.
    log(); log("=" * 78)
    if empty:
        log(f"🚨 {len(empty)} ROWS MATCHED NOTHING — these rules are wrong or the catalog has no such thing")
        for slot in empty:
            log(f"     {slot:<5} {rules[slot]['n']}")
    else:
        log("✅ every row matched at least one garment")
    if thin:
        log()
        log(f"⚠️ {len(thin)} rows under 12 garments — too thin to fill a 4-card carousel with variety")
        for slot in thin:
            log(f"     {slot:<5} {rules[slot]['n']:<34} {counts[slot]}")

    log(); log("=" * 78)
    log(f"LEFTOVERS — {unmatched:,} garments matched no row at all ({100 - pct:.0f}%)")
    log("A big pile here is not automatically wrong: the catalog carries menswear-")
    log("adjacent pieces, homeware and accessories her checklist deliberately has no")
    log("row for. What to look for is a KIND of thing repeating that she does have a")
    log("row for -- that is a missing rule.")
    log("=" * 78)
    rnd.shuffle(leftovers)
    for s in leftovers[:LEFTOVERS]:
        log(f"     {s}")

    log(); log("Read only. Nothing was written to the database or the repository.")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main())
