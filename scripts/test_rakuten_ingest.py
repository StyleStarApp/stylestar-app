"""Offline end-to-end test of scripts/rakuten-ingest.py, with BOTH ends faked.

WHY THIS EXISTS: aftp.linksynergy.com is unreachable from the dev sandbox (hard
HTTPS-only proxy), so every real run costs a GitHub Actions round trip. This stands in
for the server -- it builds real gzip files in the real 38-column pipe format, header and
trailer records included, and drives the actual main(). So the whole
download -> parse -> filter -> write path is exercised here exactly as it runs on a
runner, and a mistake is caught in a second instead of a round trip.

⚠️ IT MATTERS MORE NOW THAN IT DID: this script is a WRITER. A dry run that misreports is
embarrassing; a writer that misbehaves puts wrong data in front of a woman shopping, or
deletes a catalog at 3am. Run it after ANY change to rakuten-ingest.py or supabase_io.py:

    python3 scripts/test_rakuten_ingest.py

Two fixtures carry most of the weight:
  * Store B's three size rows deliberately DISAGREE on price and URL, which is the exact
    condition that decides whether the products table may collapse a garment's sizes.
    A test with only well-behaved data would pass either way and prove nothing.
  * The fake PostgREST ENFORCES THE FOREIGN KEY, so if the ingest ever writes sizes
    before garments the test fails the way the real database would.
"""
import gzip, importlib.util, io, json, os, sys, threading, urllib.parse, contextlib
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(0, "scripts")

# ---------------------------------------------------------------------------
# A fake PostgREST, just complete enough to be honest about the parts we use.
# ---------------------------------------------------------------------------
KEY = "sb_secret_TESTKEY_do_not_log_me"

class DB:
    def __init__(self):
        self.reset()
    def reset(self):
        self.products, self.sizes, self.syncs = {}, {}, []
        self.fail_next = 0          # inject transient 500s
        self.fk_errors = 0
        self.saw_key = False
        self.batch_sizes = []

DB_ = DB()

def _match(row, query):
    for part in query.split("&"):
        if not part or "=" not in part:
            continue
        col, op = part.split("=", 1)
        if col in ("select", "limit", "order"):
            continue
        kind, _, raw = op.partition(".")
        val = urllib.parse.unquote(raw)
        cur = row.get(col)
        if kind == "eq":
            if str(cur) != val: return False
        elif kind == "lt":
            if not (str(cur) < val): return False
        elif kind == "like":
            if not str(cur).startswith(val.rstrip("*")): return False
        else:
            raise AssertionError("fake PostgREST does not know operator " + kind)
    return True

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _table(self):
        path = urllib.parse.urlparse(self.path).path
        assert path.startswith("/rest/v1/"), path
        return path[len("/rest/v1/"):], urllib.parse.urlparse(self.path).query

    def _auth(self):
        if self.headers.get("apikey") == KEY and \
           self.headers.get("Authorization") == "Bearer " + KEY:
            DB_.saw_key = True
            return True
        self.send_response(401); self.end_headers(); return False

    def _send(self, code, body=b"", extra=None):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if body: self.wfile.write(body)

    def do_POST(self):
        if not self._auth(): return
        if DB_.fail_next > 0:
            DB_.fail_next -= 1
            self._send(500, b'{"message":"transient"}'); return
        table, _q = self._table()
        n = int(self.headers.get("Content-Length", 0))
        rows = json.loads(self.rfile.read(n) or b"[]")
        DB_.batch_sizes.append((table, len(rows)))
        if table == "products":
            for r in rows: DB_.products[r["piece_key"]] = r
        elif table == "product_sizes":
            for r in rows:
                # 🚨 the real foreign key, enforced. This is what proves ordering.
                if r["piece_key"] not in DB_.products:
                    DB_.fk_errors += 1
                    self._send(400, b'{"message":"violates foreign key constraint"}')
                    return
                DB_.sizes[r["product_id"]] = r
        elif table == "product_syncs":
            DB_.syncs.extend(rows)
        else:
            self._send(404); return
        self._send(201)

    def do_GET(self):
        if not self._auth(): return
        table, q = self._table()
        src = {"products": DB_.products, "product_sizes": DB_.sizes}[table]
        n = sum(1 for r in src.values() if _match(r, q))
        self._send(200, json.dumps([{"count": n}]).encode())

    def do_DELETE(self):
        if not self._auth(): return
        table, q = self._table()
        src = {"products": DB_.products, "product_sizes": DB_.sizes}[table]
        gone = [k for k, r in src.items() if _match(r, q)]
        for k in gone:
            src.pop(k)
        if table == "products":                       # on delete cascade
            live = set(DB_.products)
            for sk in [k for k, r in DB_.sizes.items() if r["piece_key"] not in live]:
                DB_.sizes.pop(sk)
        self._send(204, b"", {"Content-Range": f"*/{len(gone)}"})

srv = HTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_port}"

# ---------------------------------------------------------------------------
# The feeds
# ---------------------------------------------------------------------------
def row(kw=None):
    kw = kw or {}
    f = [""] * 38
    d = {0:"id",1:"name",3:"Dresses",5:"https://click.linksynergy.com/x",6:"https://img/x.jpg",
         9:"desc",13:"100",16:"Brand",22:"in-stock",25:"USD",28:"parent",30:"M",32:"Black",
         33:"Female",35:"Adult"}
    for k,v in d.items(): f[k]=v
    for k,v in kw.items(): f[k]=v
    return "|".join(f)

# store A: 1 garment, 3 sizes, everything agrees  -> collapsible
A = ["HDR|111|Store A|01/01/2026 00:00:00"]
for sz in ("S","M","L"):
    A.append(row({0:"a-"+sz, 30:sz}))
A.append("TRL|3")

# store B: 1 garment, 3 sizes, PRICE and URL differ per size -> NOT collapsible
B = ["HDR|222|Store B|01/01/2026 00:00:00"]
for sz,pr in (("S","100"),("M","110"),("L","120")):
    B.append(row({0:"b-"+sz, 30:sz, 13:pr, 5:"https://click.linksynergy.com/"+sz}))
# plus one single-size garment, one menswear row, one kids row
B.append(row({0:"b-solo", 28:"parent2", 30:"", 9:"a much longer description "*8}))
B.append(row({0:"b-men", 28:"parent3", 33:"Male"}))
B.append(row({0:"b-kid", 28:"parent4", 35:"Kids"}))
B.append("TRL|6")

# store C: ONE parent_sku in TWO colourways -> must become TWO garments, not one
C = ["HDR|333|Store C|01/01/2026 00:00:00"]
for col in ("Red","Blue"):
    for sz in ("S","M"):
        C.append(row({0:f"c-{col}-{sz}", 28:"cp", 30:sz, 32:col}))
C.append("TRL|4")

# store D: 600 garments. Big enough that losing most of them trips the REAL brake
# constants rather than a version of them lowered for the test.
def storeD(n):
    out = ["HDR|444|Store D|01/01/2026 00:00:00"]
    for i in range(n):
        out.append(row({0: f"d-{i}", 28: f"dp{i}", 30: "M"}))
    out.append(f"TRL|{n}")
    return out

# store E: the Fleur du Mal shape -- the SIZE is baked into the product NAME, each
# size has its own URL, and the sizes are priced differently.
E = ["HDR|555|Store E|01/01/2026 00:00:00"]
for sz, pr in (("Small","80"), ("Medium","60"), ("Large","90")):
    E.append(row({0:"e-"+sz, 28:"ep", 30:sz, 13:pr,
                  1:"Collared Bodysuit with Dotted Tulle Black Size " + sz,
                  5:"https://click.linksynergy.com/e-" + sz}))
# and a bra, whose sizes share a prefix INSIDE the size word (30A / 30B)
for sz in ("30A","30B"):
    E.append(row({0:"e2-"+sz, 28:"ep2", 30:sz,
                  1:"Lace Balconette Bra Size " + sz}))
E.append("TRL|5")

FEEDS = {"111": A, "222": B, "333": C, "444": storeD(600), "555": E}

class FakeFTP:
    def __init__(self): pass
    def connect(self, *a, **k): pass
    def login(self, *a, **k): pass
    def set_pasv(self, *a): pass
    def getwelcome(self): return "220 fake ready"
    def voidcmd(self, c): assert c == "TYPE I", "must request BINARY mode"
    def retrbinary(self, cmd, cb, blocksize=None):
        mid = cmd.split()[1].split("_")[0]
        buf = io.BytesIO()
        with gzip.GzipFile(fileobj=buf, mode="wb") as g:
            g.write(("\n".join(FEEDS[mid]) + "\n").encode())
        cb(buf.getvalue())
    def quit(self): pass

# ---------------------------------------------------------------------------
def load(dry, kind="full", mids=("111", "222", "333")):
    os.environ["DRY_RUN"] = "1" if dry else "0"
    os.environ["FEED_KIND"] = kind
    os.environ["SUPABASE_URL"] = BASE
    os.environ["SUPABASE_SERVICE_KEY"] = KEY
    os.environ["RAKUTEN_FTP_PASSWORD"] = "ftp-secret"
    spec = importlib.util.spec_from_file_location("ingest", "scripts/rakuten-ingest.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    m.ftplib.FTP = FakeFTP
    m.BUILD_MIDS = list(mids)
    # ⚠️ MUTATE, never rebind. parse_line() reads rakuten_feed's OWN MID_TO_STORE,
    # and `m.MID_TO_STORE = {...}` would only rebind the ingest's name -- leaving the
    # rows written with a store of "222" while the sweep looked for "Store B".
    m.MID_TO_STORE.update({"111": "Store A", "222": "Store B",
                           "333": "Store C", "444": "Store D", "555": "Store E"})
    import supabase_io
    supabase_io.time.sleep = lambda *_: None      # keep the retry test instant
    return m

def run(dry=False, kind="full", mids=("111", "222", "333")):
    m = load(dry, kind, mids)
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        rc = m.main()
    return rc, out.getvalue()

fails = []
def ck(name, cond):
    if not cond: fails.append(name)
    print(("  ok   " if cond else "  FAIL ") + name)

# ===========================================================================
print("=== 1. DRY RUN: reports, writes nothing ===")
DB_.reset()
rc, text = run(dry=True)
print(text)
ck("dry run exits 0", rc == 0)
ck("dry: nothing written to products", not DB_.products)
ck("dry: nothing written to sizes", not DB_.sizes)
ck("dry: no sync rows", not DB_.syncs)
ck("A: 1 piece", "1 distinct pieces" in text.split("Store B")[0])
ck("A: 3 sizes each", "(3.0 sizes each)" in text.split("Store B")[0])
ck("A: multi-size counted", "1 of 1 pieces carry more than one size" in text)
ck("A: no disagreement reported", "agrees on url, image, price" in text)
ck("B: price+url disagreement flagged", "price 1 (100%)" in text and "url 1 (100%)" in text)
ck("B: menswear dropped", "dropped       1  menswear" in text)
ck("B: kids dropped", "dropped       1  kids" in text)
ck("B: sized-row count honest", "3/4 rows name a size" in text)
ck("most sizes listed", "most sizes on one piece: 3" in text)
ck("description bytes reported", "mean description" in text)
ck("no crash on trailer/header", "malformed" not in text)

# ===========================================================================
print("\n=== 2. WRITE: the real path ===")
DB_.reset()
rc, text = run()
print(text)
ck("write run exits 0", rc == 0)
ck("used the service key", DB_.saw_key)
ck("garments written: 5", len(DB_.products) == 5)      # A 1, B 2, C 2
ck("sizes written: 11", len(DB_.sizes) == 11)          # A 3, B 4, C 4
ck("no foreign key violation (garments went first)", DB_.fk_errors == 0)
ck("a sync row per store", len(DB_.syncs) == 3)
ck("sync rows all ok", all(s["ok"] for s in DB_.syncs))
ck("sync records pieces", sorted(s["pieces"] for s in DB_.syncs) == [1, 2, 2])

# the shape decisions, checked in the data rather than the log
bpiece = [p for p in DB_.products.values() if p["store"] == "Store B" and p["parent_sku"] == "parent"]
ck("B collapsed to one garment", len(bpiece) == 1)
ck("garment price is the LOWEST size price", bpiece and float(bpiece[0]["price"]) == 100.0)
bsizes = [s for s in DB_.sizes.values() if s["piece_key"] == bpiece[0]["piece_key"]]
ck("per-size prices kept in full", sorted(float(s["price"]) for s in bsizes) == [100.0, 110.0, 120.0])
ck("the link follows the cheapest size, not the first row",
   bpiece and bpiece[0]["url"] == "https://click.linksynergy.com/S")
cpieces = [p for p in DB_.products.values() if p["store"] == "Store C"]
ck("one parent, two colourways -> TWO garments", len(cpieces) == 2)
ck("colourways kept distinct", sorted(p["color"] for p in cpieces) == ["Blue", "Red"])
ck("affiliate url stored verbatim",
   all(p["url"].startswith("https://click.linksynergy.com/") for p in DB_.products.values()))
ck("every size points at a real garment",
   all(s["piece_key"] in DB_.products for s in DB_.sizes.values()))
ck("batches are chunked, not one giant post", all(n <= 1000 for _, n in DB_.batch_sizes))
ck("neither secret is ever printed", KEY not in text and "ftp-secret" not in text)

# ===========================================================================
print("\n=== 3. RE-RUN: idempotent, nothing duplicated, nothing swept ===")
before = (len(DB_.products), len(DB_.sizes))
rc, text = run()
ck("re-run exits 0", rc == 0)
ck("no duplicate garments or sizes", (len(DB_.products), len(DB_.sizes)) == before)
ck("nothing swept on an unchanged feed", "swept" not in text)

# ===========================================================================
print("\n=== 4. A GARMENT DISAPPEARS: swept, and only that one ===")
FEEDS["333"] = ["HDR|333|Store C|01/01/2026 00:00:00"] + [
    row({0:f"c-Red-{sz}", 28:"cp", 30:sz, 32:"Red"}) for sz in ("S","M")] + ["TRL|2"]
rc, text = run()
ck("shrunk-feed run exits 0", rc == 0)
ck("the blue colourway is gone", not [p for p in DB_.products.values() if p["color"] == "Blue"])
ck("the red colourway survives", len([p for p in DB_.products.values() if p["color"] == "Red"]) == 1)
ck("its sizes went with it (cascade)", len(DB_.sizes) == 9)
ck("the other stores are untouched", len(DB_.products) == 4)
ck("sweep reported", "swept 1 garments" in text)

# ===========================================================================
print("\n=== 5. ONE SIZE DISAPPEARS: swept, garment stays ===")
FEEDS["111"] = ["HDR|111|Store A|01/01/2026 00:00:00"] + [
    row({0:"a-"+sz, 30:sz}) for sz in ("S","M")] + ["TRL|2"]
rc, text = run()
ck("size-drop run exits 0", rc == 0)
ck("garment A still there", any(p["store"] == "Store A" for p in DB_.products.values()))
ck("the L size is gone", "a-L" not in DB_.sizes)
ck("S and M remain", "a-S" in DB_.sizes and "a-M" in DB_.sizes)

# ===========================================================================
print("\n=== 6. A BIG FEED COLLAPSES: sweep REFUSED, catalog left alone ===")
DB_.reset()
run(mids=("444",))                                  # seed 600 garments
seeded = len(DB_.products)
FEEDS["444"] = storeD(100)                          # 500 vanish overnight
rc, text = run(mids=("444",))
ck("collapse run exits 0", rc == 0)
ck("seeded 600", seeded == 600)
ck("sweep refused", "SWEEP REFUSED" in text)
ck("nothing was deleted", len(DB_.products) == 600)
ck("the refusal is recorded in product_syncs",
   any("SWEEP REFUSED" in (s.get("note") or "") for s in DB_.syncs[-1:]))

print("\n=== 6b. A SMALL STORE IS NOT HELD HOSTAGE BY THE SAME BRAKE ===")
DB_.reset()
FEEDS["333"] = C
run(mids=("333",))                                  # 2 garments
FEEDS["333"] = ["HDR|333|Store C|01/01/2026 00:00:00"] + [
    row({0:f"c-Red-{sz}", 28:"cp", 30:sz, 32:"Red"}) for sz in ("S","M")] + ["TRL|2"]
rc, text = run(mids=("333",))                       # halves: 50%, but only 1 row
ck("small store sweeps normally", len(DB_.products) == 1)
ck("small store was not refused", "SWEEP REFUSED" not in text)

print("\n=== 7. A DELTA FEED NEVER SWEEPS ===")
DB_.reset()
FEEDS["111"], FEEDS["222"], FEEDS["333"] = A, B, C   # restore the full fixture
run()                                               # seed
FEEDS["222"] = ["HDR|222|Store B|01/01/2026 00:00:00"] + [
    row({0:"b-solo", 28:"parent2", 30:""})] + ["TRL|1"]
before = len(DB_.products)
rc, text = run(kind="delta")
ck("delta run exits 0", rc == 0)
ck("delta: nothing swept", "swept" not in text)
ck("delta: nothing deleted", len(DB_.products) == before)

# ===========================================================================
print("\n=== 8. A WOBBLY NETWORK IS RETRIED, NOT LOST ===")
DB_.reset()
FEEDS["111"], FEEDS["222"], FEEDS["333"] = A, B, C
DB_.fail_next = 2                                   # two 500s, then fine
rc, text = run()
ck("retried through the failures", rc == 0)
ck("retry was announced", "retrying" in text)
ck("all garments still landed", len(DB_.products) == 5)
ck("no secret leaked in the retry message", KEY not in text)

# ===========================================================================
print("\n=== 9. A BROKEN STORE FAILS THE JOB ===")
DB_.reset()
_good = FakeFTP.retrbinary
def _explode(self, cmd, cb, blocksize=None):
    if cmd.split()[1].startswith("222"):
        raise OSError("connection reset by peer")
    _good(self, cmd, cb, blocksize)
FakeFTP.retrbinary = _explode
rc, text = run()
FakeFTP.retrbinary = _good
ck("a failed store fails the run", rc == 1)
ck("failure is visible in the table", "FAILED" in text)
ck("the healthy stores still wrote", len(DB_.products) == 3)   # A 1, C 2
ck("the failure is recorded in product_syncs",
   any(not s["ok"] for s in DB_.syncs))

# ===========================================================================
print("\n=== 10. A SIZE BAKED INTO THE PRODUCT NAME IS TAKEN BACK OUT ===")
ing = load(dry=False)
t = ing.tidy_name
ck("trailing 'Size Small' stripped",
   t("Collared Bodysuit Black Size ", "Collared Bodysuit Black Size Small")
   == "Collared Bodysuit Black")
ck("a half-finished size word goes too (30A vs 30B)",
   t("Lace Balconette Bra Size 30", "Lace Balconette Bra Size 30A")
   == "Lace Balconette Bra")
ck("a trailing dash is tidied", t("Silk Slip Dress - ", "Silk Slip Dress - S")
   == "Silk Slip Dress")
ck("names that differ for another reason fall back, never truncate",
   t("", "Red Wrap Dress") == "Red Wrap Dress")
ck("an implausibly short prefix falls back",
   t("Red ", "Red Wrap Dress in Silk") == "Red Wrap Dress in Silk")
ck("a name with no size suffix is left alone",
   t("Cashmere Crew Neck Sweater", "Cashmere Crew Neck Sweater")
   == "Cashmere Crew Neck Sweater")

DB_.reset()
rc, text = run(mids=("555",))
names = sorted(p["name"] for p in DB_.products.values())
ck("end to end: two garments", len(names) == 2)
ck("end to end: no size left in either name",
   names == ["Collared Bodysuit with Dotted Tulle Black", "Lace Balconette Bra"])
ck("the tidy-up is reported", "had their size stripped" in text)
ck("the sizes themselves are still kept",
   sorted(s["size"] for s in DB_.sizes.values()) == ["30A","30B","Large","Medium","Small"])
bodysuit = [p for p in DB_.products.values() if p["name"].startswith("Collared")][0]
ck("cheapest size sets the price", float(bodysuit["price"]) == 60.0)
ck("and the link points at that same size",
   bodysuit["url"] == "https://click.linksynergy.com/e-Medium")

print()
print("ALL PASS" if not fails else "FAILURES: " + ", ".join(fails))
sys.exit(1 if fails else 0)
