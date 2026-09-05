#!/usr/bin/env python3
"""
Rakuten Product Catalog — FORMAT DECODER. Recon, round two.

Round one proved the connection works and found all 8 advertisers' files. It also
found that the feed's first line is NOT a column-name row: it is a file header
record (`HDR|MID|Merchant Name|timestamp`). So the columns are POSITIONAL and
unnamed, and their meanings had to be inferred from a single sample row.

Inferring a 38-column layout from one row is exactly the kind of guess this project
has been burned by before. This job removes the guess: it looks for Rakuten's own
documentation in the ADDITIONAL/ and GLOBAL/ folders, reads the _template file, and
prints several real rows column-by-column side by side so the meanings are obvious
rather than assumed.

Same rules as round one: binary mode, one serial connection, password never printed,
nothing written into this public repo.
"""
import io, os, sys, gzip, ftplib

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")

def log(m=""):
    print(m, flush=True)

def redact(t):
    return t.replace(PASSWORD, "***") if PASSWORD and PASSWORD in t else t

def grab(ftp, path):
    buf = io.BytesIO()
    ftp.voidcmd("TYPE I")                      # BINARY — ASCII silently corrupts .gz
    ftp.retrbinary(f"RETR {path}", buf.write)
    raw = buf.getvalue()
    if path.endswith(".gz"):
        return gzip.decompress(raw).decode("utf-8", errors="replace")
    return raw.decode("utf-8", errors="replace")

def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD not set."); return 1
    ftp = ftplib.FTP()
    try:
        ftp.connect(HOST, 21, timeout=60); ftp.login(USER, PASSWORD); ftp.set_pasv(True)
    except ftplib.all_errors as e:
        log(f"FAIL: {redact(str(e))}"); return 1
    log(f"connected: {ftp.getwelcome()}")

    # 1. Is Rakuten's own field documentation sitting on the server?
    for folder in ("ADDITIONAL", "GLOBAL"):
        log(); log("=" * 68); log(f"{folder}/ — looking for field documentation"); log("=" * 68)
        try:
            names = ftp.nlst(folder)
            if not names:
                log("  (empty)")
            for n in sorted(names)[:40]:
                log(f"  {n}")
        except Exception as e:
            log(f"  could not list: {redact(str(e))}")

    # 2. What is in the _template file? If it names the columns, the guessing stops.
    log(); log("=" * 68); log("TEMPLATE FILE — 43322_4740535_mp_template.txt.gz"); log("=" * 68)
    try:
        t = grab(ftp, f"43322_{SID}_mp_template.txt.gz").splitlines()
        log(f"  {len(t):,} lines")
        for i, line in enumerate(t[:3]):
            log(f"  line {i}: {line[:400]}")
    except Exception as e:
        log(f"  could not read: {redact(str(e))}")

    # 3. Three real rows, column by column, side by side. Meanings become obvious.
    log(); log("=" * 68); log("COLUMN MEANINGS — 3 real rows side by side (Vilebrequin)"); log("=" * 68)
    try:
        lines = grab(ftp, f"43322_{SID}_mp.txt.gz").splitlines()
        hdr = lines[0].split("|")
        log(f"  file header record: {hdr}")
        log(f"  {len(lines)-1:,} product rows")
        rows = [l.split("|") for l in lines[1:] if l.strip()]
        widths = {len(r) for r in rows}
        log(f"  column counts seen across all rows: {sorted(widths)}")
        log()
        picks = rows[:2] + rows[len(rows)//2:len(rows)//2+1]
        for c in range(max(len(r) for r in picks)):
            vals = [(r[c] if c < len(r) else "")[:34].replace("\n", " ") for r in picks]
            log(f"  {c:>3} | {vals[0]:<34} | {vals[1]:<34} | {vals[2]:<34}")
    except Exception as e:
        log(f"  could not read: {redact(str(e))}")

    # 4. The two columns that decide what we ingest at all: gender and availability.
    #    Cath's app is womenswear only, so a men's-heavy feed must be filtered on
    #    ingest rather than at query time.
    log(); log("=" * 68); log("WHAT WOULD SURVIVE A WOMENSWEAR FILTER?"); log("=" * 68)
    for mid, brand in (("43322", "Vilebrequin"), ("53590", "Diane von Furstenberg"),
                       ("50739", "Fleur du Mal")):
        try:
            rows = [l.split("|") for l in grab(ftp, f"{mid}_{SID}_mp.txt.gz").splitlines()[1:] if l.strip()]
            def tally(idx):
                d = {}
                for r in rows:
                    v = (r[idx] if idx < len(r) else "").strip() or "(blank)"
                    d[v] = d.get(v, 0) + 1
                return sorted(d.items(), key=lambda kv: -kv[1])[:6]
            log(f"  {brand} ({len(rows):,} rows)")
            log(f"     col 33 (gender?):       {tally(33)}")
            log(f"     col 22 (availability?): {tally(22)}")
            log(f"     col 25 (currency?):     {tally(25)}")
        except Exception as e:
            log(f"  {brand}: could not read: {redact(str(e))}")

    ftp.quit()
    log(); log("Done. Nothing written to the repository.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
