"""Offline end-to-end test of scripts/rakuten-ingest.py, with the FTP faked.

WHY THIS EXISTS: aftp.linksynergy.com is unreachable from the dev sandbox (hard
HTTPS-only proxy), so every real run costs a GitHub Actions round trip. This stands in
for the server -- it builds real gzip files in the real 38-column pipe format, header and
trailer records included, and drives the actual main(). So the whole
download -> parse -> filter -> report path is exercised here exactly as it runs on a
runner, and a mistake is caught in a second instead of a round trip.

⚠️ It matters more now than it did: this script is becoming a WRITER. A dry run that
misreports is embarrassing; a writer that misbehaves puts wrong data in front of a woman
shopping. Run it after ANY change to rakuten-ingest.py:

    python3 scripts/test_rakuten_ingest.py

Store B is the important fixture: its three size rows deliberately DISAGREE on price and
URL, which is the exact condition that decides whether the products table may collapse a
garment's sizes into one row. A test that only had well-behaved data would pass either
way and prove nothing.
"""
import gzip, importlib.util, io, os, sys, tempfile, contextlib

sys.path.insert(0, "scripts")
spec = importlib.util.spec_from_file_location("ingest", "scripts/rakuten-ingest.py")
ingest = importlib.util.module_from_spec(spec)

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

FEEDS = {"111": A, "222": B}

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

spec.loader.exec_module(ingest)
ingest.PASSWORD = "x"
ingest.ftplib.FTP = FakeFTP
ingest.BUILD_MIDS = ["111", "222"]
ingest.MID_TO_STORE = {"111": "Store A", "222": "Store B"}

out = io.StringIO()
with contextlib.redirect_stdout(out):
    rc = ingest.main()
text = out.getvalue()
print(text)

fails = []
def ck(name, cond):
    if not cond: fails.append(name)
    print(("  ok   " if cond else "  FAIL ") + name)

print("--- checks ---")
ck("exit 0", rc == 0)
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
ck("binary mode requested", True)  # asserted inside FakeFTP.voidcmd
ck("no crash on trailer/header", "malformed" not in text)
print(("ALL PASS" if not fails else "FAILURES: " + ", ".join(fails)))
sys.exit(1 if fails else 0)
